/*
Copyright (C) 2017 Draios inc.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License version 2 as
published by the Free Software Foundation.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import { once } from '@ember/runloop';

import { isNone } from '@ember/utils';
import { computed } from '@ember/object';
import { equal } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from '../templates/components/wsd-capture-view';
import { dataStoreConstants } from '../services/fetch-view-data';

export default Component.extend({
    layout,
    classNames: ['wsd-capture-view'],
    drilldownManager: service('drilldown-manager'),
    dataStoreService: service('fetch-view-data'),
    dataSearchService: service('data-search'),
    viewDataStoreService: service('fetch-views'),
    layoutProvider: service('layout-provider'),
    shortcutsService: service('keyboard-shortcuts'),
    userTracking: service('user-tracking'),

    viewId: null,
    captureInfo: null,
    drilldownInfoParam: null,
    filter: null,
    timelines: null,

    dataStoreConstants,
    viewAs: dataStoreConstants.VIEW_AS_DOTTED_ASCII,

    dataStore: null,

    prevViewId: null,

    isOverview: equal('viewId', 'overview').readOnly(),

    drilldownInfo: computed('captureInfo.queryParams.drilldownInfoParam', function() {
        return this.get('drilldownManager').convertFromUrl({
            drilldownInfoParam: this.get('captureInfo.queryParams.drilldownInfoParam'),
        });
    }).readOnly(),

    currentDrilldownStep: computed('drilldownInfo', function() {
        const drilldownInfo = this.get('drilldownInfo');
        return drilldownInfo[drilldownInfo.length - 1];
    }).readOnly(),

    timeWindow: computed('captureInfo.queryParams.timeFrom', 'captureInfo.queryParams.timeTo', function() {
        if (isNone(this.get('captureInfo.queryParams.timeFrom')) === false && isNone(this.get('captureInfo.queryParams.timeTo')) === false) {
            return {
                from: this.get('captureInfo.queryParams.timeFrom'),
                to: this.get('captureInfo.queryParams.timeTo'),
            };
        } else {
            return null;
        }
    }).readOnly(),

    drilldownFilter: computed('drilldownInfo', 'timeWindow', function() {
        return this.get('drilldownManager').buildViewFilter(this.get('drilldownInfo'), this.get('timeWindow'));
    }).readOnly(),

    currentFilter: computed('filter', 'drilldownFilter', function() {
        return this.get('filter') || this.get('drilldownFilter');
    }).readOnly(),

    viewDataStore: computed('viewId', function() {
        return this.get('viewDataStoreService').fetchById(this.get('viewId'));
    }).readOnly(),

    drillDownComponentName: computed('viewId', function() {
        switch (this.get('viewId')) {
            case 'dig':
                return 'wsd-capture-data-dig';
            case 'echo':
                return 'wsd-capture-data-echo';
            default:
                return 'wsd-capture-data-table';
        }
    }).readOnly(),

    init() {
        this._super(...arguments);

        this.get('dataSearchService').on('didChangeSelection', this, this.didChangeSelection);

        this.fetchData();

        this.set('prevViewId', this.get('viewId'));
    },

    isViewAsPrintableAscii: equal('viewAs', dataStoreConstants.VIEW_AS_PRINTABLE_ASCII).readOnly(),
    isViewAsDottedAscii: equal('viewAs', dataStoreConstants.VIEW_AS_DOTTED_ASCII).readOnly(),
    isViewAsHexAscii: equal('viewAs', dataStoreConstants.VIEW_AS_HEX_ASCII).readOnly(),

    didInsertElement() {
        this.get('shortcutsService').bind(
            'data.viewAsPrintableAscii',
            () => {
                this.setViewAs(dataStoreConstants.VIEW_AS_PRINTABLE_ASCII);
            }
        );
        this.get('shortcutsService').bind(
            'data.viewAsDottedAscii',
            () => {
                this.setViewAs(dataStoreConstants.VIEW_AS_DOTTED_ASCII);
            }
        );
        this.get('shortcutsService').bind(
            'data.viewAsHexAscii',
            () => {
                this.setViewAs(dataStoreConstants.VIEW_AS_HEX_ASCII);
            }
        );

        this.get('layoutProvider').whenSettled(() => {
            this.focusMainComponent();
        });
    },

    willDestroyElement() {
        this.get('shortcutsService').unbind('data.viewAsPrintableAscii');
        this.get('shortcutsService').unbind('data.viewAsDottedAscii');
        this.get('shortcutsService').unbind('data.viewAsHexAscii');

        this.get('dataSearchService').off('didChangeSelection', this, this.didChangeSelection);
    },

    didUpdateAttrs() {
        once(this, this.fetchData);

        if (this.get('viewId') !== this.get('prevViewId')) {
            //
            // Focus main data panel after changing view
            //
            this.get('layoutProvider').whenSettled(() => {
                this.focusMainComponent();
            });

            this.set('prevViewId', this.get('viewId'));
        }
    },

    setViewAs(viewAs) {
        if (this.get('isViewAsSupported') && this.get('viewAs') !== viewAs) {
            this.get('userTracking').action(this.get('userTracking').ACTIONS.INTERACTION, {
                name: 'change view as',
                'view as': viewAs.toLowerCase().replace(/_/g, ' '),
            });

            this.set('viewAs', viewAs);
            once(this, this.fetchData);
        }
    },

    fetchData() {
        if (this.get('viewId') !== 'overview') {
            const dataStore = this.get('dataStoreService').fetch(
                this.get('captureInfo.filePath'),
                this.get('viewId'),
                {
                    timeWindow: this.get('timeWindow'),
                    filter: this.get('currentFilter'),
                    viewAs: this.get('isViewAsSupported') ? (this.get('viewAs') || dataStoreConstants.VIEW_AS_DOTTED_ASCII) : null,
                }
            );

            if (this.get('dataSearchService.isSearchActive')) {
                this.set('dataStore', this.get('dataSearchService').search(dataStore));
            } else {
                this.set('dataStore', dataStore);
            }
        }
    },

    didChangeSelection(row) {
        switch (this.get('viewId')) {
            case 'dig':
            case 'echo':
                return;
            default:
                this.send('select', row);
        }
    },

    focusMainComponent() {
        const el = document.querySelector(`#${this.elementId} [tabIndex="1"]`);

        if (el) {
            el.focus();
        }
    },

    isViewAsSupported: computed('viewId', function() {
        switch (this.get('viewId')) {
            case 'dig':
            case 'echo':
                return true;
            default:
                return false;
        }
    }).readOnly(),

    actions: {
        select(row) {
            const dataInfo = this.get('dataStore.info');
            const key = dataInfo.drillDownKeyField;

            const nextDrilldownInfo = this.get('drilldownManager').selectViewElement(
                this.get('drilldownInfo'),
                key,
                row.k,
                this.get('dataStore.info.filterTemplate')
            );

            this.sendAction('select', this.get('drilldownManager').convertToUrl(nextDrilldownInfo));
        },

        drillDown(targetView, row) {
            let viewId;
            switch (targetView) {
                case 'dig':
                    viewId = 'dig';
                    break;
                case 'echo':
                    viewId = 'echo';
                    break;
                default:
                    viewId = this.get('viewDataStore.view.drilldownTarget');
                    break;
            }

            const dataInfo = this.get('dataStore.info');
            const key = dataInfo.drillDownKeyField;

            const nextDrilldownInfo = this.get('drilldownManager').drillDown(
                this.get('drilldownInfo'),
                key,
                row.k,
                this.get('dataStore.info.filterTemplate'),
                viewId
            );

            this.sendAction('drillDown', this.get('drilldownManager').convertToUrl(nextDrilldownInfo));
        },

        setViewAs(viewAs) {
            this.setViewAs(viewAs);
        },
    },
});

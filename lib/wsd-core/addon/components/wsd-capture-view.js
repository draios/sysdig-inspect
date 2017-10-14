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

import Ember from 'ember';
import layout from '../templates/components/wsd-capture-view';
import { dataStoreConstants } from '../services/fetch-view-data';

export default Ember.Component.extend({
    layout,
    classNames: ['wsd-capture-view'],
    drilldownManager: Ember.inject.service('drilldown-manager'),
    dataStoreService: Ember.inject.service('fetch-view-data'),
    dataSearchService: Ember.inject.service('data-search'),
    viewDataStoreService: Ember.inject.service('fetch-views'),
    layoutProvider: Ember.inject.service('layout-provider'),
    shortcutsService: Ember.inject.service('keyboard-shortcuts'),
    userTracking: Ember.inject.service('user-tracking'),

    viewId: null,
    captureInfo: null,
    drilldownInfoParam: null,
    filter: null,
    timelines: null,

    dataStoreConstants,
    viewAs: dataStoreConstants.VIEW_AS_PRINTABLE_ASCII,

    dataStore: null,

    isOverview: Ember.computed.equal('viewId', 'overview').readOnly(),

    drilldownInfo: Ember.computed('captureInfo.queryParams.drilldownInfoParam', function() {
        return this.get('drilldownManager').convertFromUrl({
            drilldownInfoParam: this.get('captureInfo.queryParams.drilldownInfoParam'),
        });
    }).readOnly(),

    currentDrilldownStep: Ember.computed('drilldownInfo', function() {
        const drilldownInfo = this.get('drilldownInfo');
        return drilldownInfo[drilldownInfo.length - 1];
    }).readOnly(),

    timeWindow: Ember.computed('captureInfo.queryParams.timeFrom', 'captureInfo.queryParams.timeTo', function() {
        if (Ember.isNone(this.get('captureInfo.queryParams.timeFrom')) === false && Ember.isNone(this.get('captureInfo.queryParams.timeTo')) === false) {
            return {
                from: this.get('captureInfo.queryParams.timeFrom'),
                to: this.get('captureInfo.queryParams.timeTo'),
            };
        } else {
            return null;
        }
    }).readOnly(),

    drilldownFilter: Ember.computed('drilldownInfo', 'timeWindow', function() {
        return this.get('drilldownManager').buildViewFilter(this.get('drilldownInfo'), this.get('timeWindow'));
    }).readOnly(),

    currentFilter: Ember.computed('filter', 'drilldownFilter', function() {
        return this.get('filter') || this.get('drilldownFilter');
    }).readOnly(),

    viewDataStore: Ember.computed('viewId', function() {
        return this.get('viewDataStoreService').fetchById(this.get('viewId'));
    }).readOnly(),

    drillDownComponentName: Ember.computed('viewId', function() {
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
    },

    isViewAsPrintableAscii: Ember.computed.equal('viewAs', dataStoreConstants.VIEW_AS_PRINTABLE_ASCII).readOnly(),
    isViewAsDottedAscii: Ember.computed.equal('viewAs', dataStoreConstants.VIEW_AS_DOTTED_ASCII).readOnly(),
    isViewAsHexAscii: Ember.computed.equal('viewAs', dataStoreConstants.VIEW_AS_HEX_ASCII).readOnly(),

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
    },

    willDestroyElement() {
        this.get('shortcutsService').unbind('data.viewAsPrintableAscii');
        this.get('shortcutsService').unbind('data.viewAsDottedAscii');
        this.get('shortcutsService').unbind('data.viewAsHexAscii');

        this.get('dataSearchService').off('didChangeSelection', this, this.didChangeSelection);
    },

    didUpdateAttrs() {
        Ember.run.once(this, this.fetchData);
    },

    setViewAs(viewAs) {
        if (this.get('isViewAsSupported') && this.get('viewAs') !== viewAs) {
            this.get('userTracking').action(this.get('userTracking').ACTIONS.INTERACTION, {
                name: 'change view as',
                'view as': viewAs.toLowerCase().replace(/_/g, ' '),
            });

            this.set('viewAs', viewAs);
            Ember.run.once(this, this.fetchData);
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

            dataStore.get('loadPromise').then(() => this.focusMainComponent());
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
        const el = document.querySelector(`#${this.elementId} [tabIndex="0"]`);

        if (el) {
            el.focus();
        }
    },

    isViewAsSupported: Ember.computed('viewId', function() {
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

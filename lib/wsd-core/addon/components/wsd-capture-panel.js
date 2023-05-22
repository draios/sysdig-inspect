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

import { isEmpty } from '@ember/utils';

import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from '../templates/components/wsd-capture-panel';

export default Component.extend({
    layout,
    classNames: ['wsd-capture-panel'],

    layoutProvider: service('layout-provider'),
    drilldownManager: service('drilldown-manager'),
    shortcutsService: service('keyboard-shortcuts'),
    dataSearchService: service('data-search'),

    filePath: null,
    drilldownInfoParam: null,
    timelines: null,
    timeWindow: null,
    selectedViewId: null,
    previousSelectedViewId: null,

    isFilterActive: true,
    filter: null,
    isSearchActive: false,

    drilldownInfo: computed('selectedViewId', 'drilldownInfoParam', function() {
        return this.get('drilldownManager').convertFromUrl({
            viewId: this.get('selectedViewId'),
            drilldownInfoParam: this.get('drilldownInfoParam'),
        });
    }).readOnly(),

    drilldownFilter: computed('drilldownInfo', 'timeWindow', function() {
        return this.get('drilldownManager').buildViewFilter(this.get('drilldownInfo'), this.get('timeWindow'));
    }).readOnly(),

    currentFilter: computed('filter', 'drilldownFilter', function() {
        return this.get('filter') || this.get('drilldownFilter');
    }).readOnly(),

    isFilterAvailable: true,
    isSearchAvailable: computed('drilldownInfo', function() {
        const drilldownInfo = this.get('drilldownInfo');
        const current = drilldownInfo[drilldownInfo.length - 1];

        return current.viewId !== 'overview';
    }).readOnly(),

    isDataSettingsBarVisible: computed('isSearchActive', 'isFilterActive', 'isFilterAvailable', 'isSearchAvailable', function() {
        return (this.get('isFilterAvailable') || this.get('isSearchAvailable')) && (this.get('isFilterActive') || this.get('isSearchActive'));
    }).readOnly(),

    init() {
        this._super(...arguments);
        this.set('previousSelectedViewId', this.get('selectedViewId'));

        if (isEmpty(this.get('dataSearchService.searchDataStore.searchPattern')) === false) {
            this.set('isSearchActive', true);
        }
        if (this.get('selectedViewId') === 'overview') {
            this.set('isSearchActive', false);
        }
    },

    didInsertElement() {
        this.get('shortcutsService').bind(
            'general.filter',
            () => {
                this.activateFilter();

                this.get('layoutProvider').didChange();
            }
        );
        this.get('shortcutsService').bind(
            'general.search',
            () => {
                this.activateSearch();

                this.get('layoutProvider').didChange();
            }
        );
    },

    willDestroyElement() {
        this.get('shortcutsService').unbind('general.search');
        this.get('shortcutsService').unbind('general.filter');
    },

    didUpdateAttrs() {
        if (isEmpty(this.get('dataSearchService.searchDataStore.searchPattern')) === false) {
            this.set('isSearchActive', true);
        }
        if (this.get('selectedViewId') === 'overview') {
            this.set('isSearchActive', false);
        }
    },

    activateFilter() {
        this.get('layoutProvider').whenSettled(() => {
            if (this.isDestroyed || this.isDestroying) {
                return;
            }

            this.$('[name="filter"]').focus();
        });
    },

    activateSearch() {
        this.set('isSearchActive', true);

        this.get('layoutProvider').whenSettled(() => {
            if (this.isDestroyed || this.isDestroying) {
                return;
            }

            this.$('[name="search"]').focus();
        });
    },

    actions: {
        selectView(id) {
            const drilldownManager = this.get('drilldownManager');
            const drilldownInfo = drilldownManager.selectView(this.get('drilldownInfo'), id);
            this.sendAction('navigateTo', drilldownManager.convertToUrl(drilldownInfo));
        },

        navigateTo(step) {
            const drilldownManager = this.get('drilldownManager');
            const drilldownInfo = drilldownManager.selectStep(this.get('drilldownInfo'), step);
            this.sendAction('navigateTo', drilldownManager.convertToUrl(drilldownInfo));
        },

        toggleFilter() {
            if (this.get('isFilterActive')) {
                this.sendAction('applyFilter', null);
            } else {
                this.activateFilter();
            }

            this.get('layoutProvider').didChange();
        },
        closeFilter() {
            this.sendAction('applyFilter', null);

            this.get('layoutProvider').didChange();
        },

        toggleSearch() {
            if (this.get('isSearchActive')) {
                this.set('isSearchActive', false);
                this.sendAction('applySearch', null);
            } else {
                this.activateSearch();
            }

            this.get('layoutProvider').didChange();
        },
        closeSearch() {
            this.set('isSearchActive', false);
            this.sendAction('applySearch', null);

            this.get('layoutProvider').didChange();
        },
    },
});

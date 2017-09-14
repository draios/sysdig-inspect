import Ember from 'ember';
import layout from '../templates/components/wsd-capture-panel';

export default Ember.Component.extend({
    layout,
    classNames: ['wsd-capture-panel'],

    layoutProvider: Ember.inject.service('layout-provider'),
    drilldownManager: Ember.inject.service('drilldown-manager'),
    shortcutsService: Ember.inject.service('keyboard-shortcuts'),

    filePath: null,
    drilldownInfoParam: null,
    timelines: null,
    timeWindow: null,
    selectedViewId: null,
    previousSelectedViewId: null,

    isFilterActive: false,
    filter: null,
    isSearchActive: false,
    searchPattern: null,

    drilldownInfo: Ember.computed('selectedViewId', 'drilldownInfoParam', function() {
        return this.get('drilldownManager').convertFromUrl({
            viewId: this.get('selectedViewId'),
            drilldownInfoParam: this.get('drilldownInfoParam'),
        });
    }).readOnly(),

    drilldownFilter: Ember.computed('drilldownInfo', 'timeWindow', function() {
        return this.get('drilldownManager').buildViewFilter(this.get('drilldownInfo'), this.get('timeWindow'));
    }).readOnly(),

    currentFilter: Ember.computed('filter', 'drilldownFilter', function() {
        return this.get('filter') || this.get('drilldownFilter');
    }).readOnly(),

    areFilterOrSearchAvailable: Ember.computed('drilldownInfo', function() {
        const drilldownInfo = this.get('drilldownInfo');
        const current = drilldownInfo[drilldownInfo.length - 1];

        return current.viewId !== 'overview';
    }).readOnly(),

    isDataSettingsBarVisible: Ember.computed('isSearchActive', 'isFilterActive', 'areFilterOrSearchAvailable', function() {
        return this.get('areFilterOrSearchAvailable') && (this.get('isFilterActive') || this.get('isSearchActive'));
    }).readOnly(),

    init() {
        this._super(...arguments);
        this.set('previousSelectedViewId', this.get('selectedViewId'));

        if (Ember.isEmpty(this.get('filter')) === false) {
            this.set('isFilterActive', true);
        }
        if (Ember.isEmpty(this.get('searchPattern')) === false) {
            this.set('isSearchActive', true);
        }
    },

    didInsertElement() {
        this.get('shortcutsService').bind(
            'general.filter',
            () => {
                this.activateFilter();
            }
        );
        this.get('shortcutsService').bind(
            'general.search',
            () => {
                this.activateSearch();
            }
        );

        this.get('layoutProvider').whenSettled(() => {
            this.focusMainComponent();
        });
    },

    willDestroyElement() {
        this.get('shortcutsService').unbind('general.search');
        this.get('shortcutsService').unbind('general.filter');
    },

    didUpdateAttrs() {
        if (this.get('selectedViewId') !== this.get('previousSelectedViewId')) {
            this.set('previousSelectedViewId', this.get('selectedViewId'));
            this.get('layoutProvider').whenSettled(() => {
                this.focusMainComponent();
            });
        }

        if (Ember.isEmpty(this.get('filter')) === false) {
            this.set('isFilterActive', true);
        }
        if (Ember.isEmpty(this.get('searchPattern')) === false) {
            this.set('isSearchActive', true);
        }
    },

    activateFilter() {
        this.set('isFilterActive', true);

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

    focusMainComponent() {
        const el = document.querySelector('[tabIndex="0"]');

        if (el) {
            el.focus();
        }
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
                this.set('isFilterActive', false);
                this.sendAction('applyFilter', null);
            } else {
                this.activateFilter();
            }
        },
        closeFilter() {
            this.set('isFilterActive', false);
            this.sendAction('applyFilter', null);
        },

        toggleSearch() {
            if (this.get('isSearchActive')) {
                this.set('isSearchActive', false);
                this.sendAction('applySearch', null);
            } else {
                this.activateSearch();
            }
        },
        closeSearch() {
            this.set('isSearchActive', false);
            this.sendAction('applySearch', null);
        },
    },
});

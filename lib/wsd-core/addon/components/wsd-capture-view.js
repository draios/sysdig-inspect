import Ember from 'ember';
import layout from '../templates/components/wsd-capture-view';

export default Ember.Component.extend({
    layout,
    classNames: ['wsd-capture-view'],
    drilldownManager: Ember.inject.service('drilldown-manager'),
    dataStoreService: Ember.inject.service('fetch-view-data'),
    dataSearchService: Ember.inject.service('data-search'),
    viewDataStoreService: Ember.inject.service('fetch-views'),

    viewId: null,
    captureInfo: null,
    drilldownInfoParam: null,
    filter: null,
    timelines: null,

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

    willDestroyElement() {
        this.get('dataSearchService').off('didChangeSelection', this, this.didChangeSelection);
    },

    didUpdateAttrs() {
        Ember.run.once(this, this.fetchData);
    },

    fetchData() {
        if (this.get('viewId') !== 'overview') {
            const dataStore = this.get('dataStoreService').fetch(
                this.get('captureInfo.filePath'),
                this.get('viewId'),
                {
                    timeWindow: this.get('timeWindow'),
                    filter: this.get('currentFilter'),
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
    },
});

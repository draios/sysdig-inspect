import Ember from 'ember';
import layout from '../templates/components/capture-view';

export default Ember.Component.extend({
    layout,
    classNames: ['capture-view'],
    drilldownManager: Ember.inject.service('drilldown-manager'),
    dataStoreService: Ember.inject.service('fetch-view-data'),
    viewDataStoreService: Ember.inject.service('fetch-views'),

    captureInfo: null,

    drilldownInfo: Ember.computed('captureInfo.queryParams.drilldownInfoParam', function() {
        return this.get('drilldownManager').convertFromUrl({
            drilldownInfoParam: this.get('captureInfo.queryParams.drilldownInfoParam'),
        });
    }).readOnly(),

    viewId: Ember.computed('drilldownInfo', function() {
        const drilldownInfo = this.get('drilldownInfo');
        return drilldownInfo[drilldownInfo.length - 1].viewId;
    }).readOnly(),

    filter: Ember.computed('drilldownInfo', function() {
        return this.get('drilldownManager').buildViewFilter(this.get('drilldownInfo'));
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

    dataStore: Ember.computed('captureInfo.filePath', 'viewId', 'timeWindow', 'filter', function() {
        return this.get('dataStoreService').fetch(
            this.get('captureInfo.filePath'),
            this.get('viewId'),
            this.get('timeWindow'),
            this.get('filter')
        );
    }).readOnly(),

    viewDataStore: Ember.computed('viewId', function() {
        return this.get('viewDataStoreService').fetchById(this.get('viewId'));
    }).readOnly(),

    columns: Ember.computed('dataStore.info', function() {
        const info = this.get('dataStore.info');

        if (info) {
            return info.legend.map((item) => ({
                name: item.name,
            }));
        } else {
            return null;
        }
    }).readOnly(),
    rows: Ember.computed('dataStore.rows', function() {
        const rows = this.get('dataStore.rows');

        if (rows) {
            return rows.map((row) => ({
                id: row.k,
                columns: row.d.map((column) => ({
                    value: column,
                })),
            }));
        } else {
            return null;
        }
    }).readOnly(),

    actions: {
        select(row) {
        },
    },
});

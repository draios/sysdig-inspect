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

    viewConfiguration: Ember.computed('drilldownInfo', function() {
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

    filter: Ember.computed('drilldownInfo', 'timeWindow', function() {
        return this.get('drilldownManager').buildViewFilter(this.get('drilldownInfo'), this.get('timeWindow'));
    }).readOnly(),

    dataStore: Ember.computed('captureInfo.filePath', 'viewId', 'timeWindow', 'filter', function() {
        return this.get('dataStoreService').fetch(
            this.get('captureInfo.filePath'),
            this.get('viewId'),
            {
                timeWindow: this.get('timeWindow'),
                filter: this.get('filter'),
            }
        );
    }).readOnly(),

    viewDataStore: Ember.computed('viewId', function() {
        return this.get('viewDataStoreService').fetchById(this.get('viewId'));
    }).readOnly(),

    columns: Ember.computed('dataStore.info', function() {
        const info = this.get('dataStore.info');

        if (info) {
            return info.legend
                .map((item) => ({
                    id: item.name,
                    name: item.name,
                    width: 1,
                    widthUnit: 'flex',
                }))
                .concat([{
                    id: 'actions',
                    headComponentName: 'table-cell-actions',
                    cellComponentName: 'table-cell-actions',
                    clickAction: 'drillDown',
                }]);
        } else {
            return null;
        }
    }).readOnly(),
    rows: Ember.computed('columns', 'dataStore.rows', 'viewConfiguration.selection', function() {
        const rows = this.get('dataStore.rows');
        const columns = this.get('columns');
        const selectedId = this.get('viewConfiguration.selection');

        if (rows) {
            return rows.map((row) => ({
                id: row.k,
                isSelected: selectedId === row.k,
                columns: columns.map((column, i) => ({
                    value: row.d[i],
                    configuration: column,
                })),
            }));
        } else {
            return null;
        }
    }).readOnly(),

    actions: {
        select(row) {
            const nextDrilldownInfo = this.get('drilldownManager').selectViewElement(
                this.get('drilldownInfo'),
                row.id,
                this.get('dataStore.info.filterTemplate')
            );

            this.sendAction('select', this.get('drilldownManager').convertToUrl(nextDrilldownInfo));
        },

        drillDown(row) {
            const nextDrilldownInfo = this.get('drilldownManager').drillDown(
                this.get('drilldownInfo'),
                row.id,
                this.get('dataStore.info.filterTemplate'),
                this.get('viewDataStore.view.drilldownTarget')
            );

            this.sendAction('drillDown', this.get('drilldownManager').convertToUrl(nextDrilldownInfo));
        },
    },
});

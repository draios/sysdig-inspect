import Ember from 'ember';
import layout from '../templates/components/capture-view';

export default Ember.Component.extend({
    layout,
    classNames: ['capture-view'],
    dataStoreService: Ember.inject.service('fetch-view-data'),
    viewDataStoreService: Ember.inject.service('fetch-views'),

    filePath: null,
    viewId: null,
    timeWindow: null,
    filter: null,

    dataStore: Ember.computed('filePath', 'viewId', 'timeWindow', 'filter', function() {
        return this.get('dataStoreService').fetch(
            this.get('filePath'),
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
                columns: row.d.map((column) => ({
                    value: column,
                })),
            }));
        } else {
            return null;
        }
    }).readOnly(),
});

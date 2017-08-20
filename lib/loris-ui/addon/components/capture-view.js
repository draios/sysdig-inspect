import Ember from 'ember';
import layout from '../templates/components/capture-view';

export default Ember.Component.extend({
    layout,
    classNames: ['capture-view'],

    fetchViewData: Ember.inject.service('fetch-view-data'),

    filePath: null,
    viewId: null,

    store: Ember.computed('filePath', 'viewId', function() {
        return this.get('fetchViewData').fetch(this.get('filePath'), this.get('viewId'));
    }).readOnly(),

    columns: Ember.computed('store.info', function() {
        const info = this.get('store.info');

        if (info) {
            return info.legend.map((item) => ({
                name: item.name,
            }));
        } else {
            return null;
        }
    }).readOnly(),
    rows: Ember.computed('store.rows', function() {
        const rows = this.get('store.rows');

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
    // columns: [
    //     { name: 'a' },
    //     { name: 'b' },
    //     { name: 'c' },
    // ],
    // rows: [
    //     {
    //         columns: [
    //             { value: '1' },
    //             { value: '2' },
    //             { value: '3' },
    //         ],
    //     },
    //     {
    //         columns: [
    //             { value: '1' },
    //             { value: '2' },
    //             { value: '3' },
    //         ],
    //     },
    //     {
    //         columns: [
    //             { value: '1' },
    //             { value: '2' },
    //             { value: '3' },
    //         ],
    //     },
    // ],
});

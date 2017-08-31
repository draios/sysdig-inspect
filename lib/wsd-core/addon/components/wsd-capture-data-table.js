import Ember from 'ember';
import layout from '../templates/components/wsd-capture-data-table';

export default Ember.Component.extend({
    layout,
    classNames: ['wsd-capture-data-table'],

    dataStore: null,
    selection: null,

    columns: Ember.computed('dataStore.info', function() {
        const info = this.get('dataStore.info');

        if (info) {
            return info.legend
                .slice(0, info.legend.length - 1)
                .map((item) => ({
                    id: item.name,
                    name: item.name,
                }))
                .concat([{
                    id: info.legend[info.legend.length - 1].name,
                    name: info.legend[info.legend.length - 1].name,
                    headComponentName: 'wsd-table-cell-actions-head',
                    cellComponentName: 'wsd-table-cell-actions',
                    clickAction: 'drillDown',
                }])
            ;
        } else {
            return null;
        }
    }).readOnly(),
    rows: Ember.computed('columns', 'dataStore.rows', 'selection', function() {
        const rows = this.get('dataStore.rows');
        const columns = this.get('columns');
        const selectedId = this.get('selection');

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
        select() {
            console.warn('wsd-capture-data-table.select');
            this.sendAction('select', ...arguments);
        },
        drillDown() {
            console.warn('wsd-capture-data-table.drillDown');
            this.sendAction('drillDown', ...arguments);
        },
    },
});

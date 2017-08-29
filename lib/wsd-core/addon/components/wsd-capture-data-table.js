import Ember from 'ember';
import layout from '../templates/components/wsd-capture-data-table';

export default Ember.Component.extend({
    layout,
    classNames: ['wsd-capture-data-table'],

    dataStore: null,
    viewConfiguration: null,

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
                    headComponentName: 'wsd-table-cell-actions',
                    cellComponentName: 'wsd-table-cell-actions',
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
        select() {
            this.sendAction('select', ...arguments);
        },
        drillDown() {
            this.sendAction('drillDown', ...arguments);
        },
    },
});

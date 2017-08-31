import Ember from 'ember';
import layout from '../templates/components/wsd-capture-data-table';

export default Ember.Component.extend({
    layout,
    classNames: ['wsd-capture-data-table'],
    shortcutsService: Ember.inject.service('keyboard-shortcuts'),

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

    didInsertElement() {
        this.get('shortcutsService').bind(
            'dataTables.drillDown',
            () => {
                const selection = this.get('rows').filterBy('isSelected', true);
                if (Ember.isEmpty(selection) === false) {
                    this.send('drillDown', 'drillDown', selection[0]);
                }
            }
        );
        this.get('shortcutsService').bind(
            'dataTables.echo',
            () => {
                const selection = this.get('rows').filterBy('isSelected', true);
                if (Ember.isEmpty(selection) === false) {
                    this.send('drillDown', 'echo', selection[0]);
                }
            }
        );
        this.get('shortcutsService').bind(
            'dataTables.dig',
            () => {
                const selection = this.get('rows').filterBy('isSelected', true);
                if (Ember.isEmpty(selection) === false) {
                    this.send('drillDown', 'dig', selection[0]);
                }
            }
        );
        this.get('shortcutsService').bind(
            'dataTables.selectNext',
            () => {
                const rows = this.get('rows');
                if (Ember.isEmpty(rows) === false) {
                    const selection = rows.filterBy('isSelected', true);
                    if (Ember.isEmpty(selection) === false) {
                        const indexOf = rows.indexOf(selection[0]);
                        if (indexOf === rows.length - 1) {
                            this.send('select', rows[0]);
                        } else {
                            this.send('select', rows[indexOf + 1]);
                        }
                    } else {
                        this.send('select', rows[0]);
                    }
                }
            }
        );
        this.get('shortcutsService').bind(
            'dataTables.selectPrevious',
            () => {
                const rows = this.get('rows');
                if (Ember.isEmpty(rows) === false) {
                    const selection = rows.filterBy('isSelected', true);
                    if (Ember.isEmpty(selection) === false) {
                        const indexOf = rows.indexOf(selection[0]);
                        if (indexOf === 0) {
                            this.send('select', rows[rows.length - 1]);
                        } else {
                            this.send('select', rows[indexOf - 1]);
                        }
                    } else {
                        this.send('select', rows[rows.length - 1]);
                    }
                }
            }
        );
    },

    willDestroyElement() {
        this.get('shortcutsService').unbind('dataTables.drillDown');
        this.get('shortcutsService').unbind('dataTables.echo');
        this.get('shortcutsService').unbind('dataTables.dig');
        this.get('shortcutsService').unbind('dataTables.selectNext');
        this.get('shortcutsService').unbind('dataTables.selectPrevious');
    },

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

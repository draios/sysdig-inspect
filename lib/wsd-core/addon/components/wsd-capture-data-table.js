import Ember from 'ember';
import layout from '../templates/components/wsd-capture-data-table';
import tableUtils from 'ui-toolkit/utils/table';

export default Ember.Component.extend({
    layout,
    classNames: ['wsd-capture-data-table'],
    attributeBindings: ['tabIndex'],
    shortcutsService: Ember.inject.service('keyboard-shortcuts'),

    dataStore: null,
    selection: null,

    tabIndex: 0,

    columns: Ember.computed('dataStore.info', function() {
        const info = this.get('dataStore.info');

        if (info) {
            return info.legend
                .map((item, i, list) => {
                    if (i < list.length - 1) {
                        return tableUtils.createColumn(item.name, {
                            name: item.name,
                        });
                    } else {
                        return tableUtils.createColumn(item.name, {
                            name: item.name,
                            headComponentName: 'wsd-table-cell-actions-head',
                            cellComponentName: 'wsd-table-cell-actions',
                            clickAction: 'drillDown',
                        });
                    }
                })
            ;
        } else {
            return null;
        }
    }).readOnly(),
    rows: Ember.computed('columns', 'dataStore.rows', function() {
        const rows = this.get('dataStore.rows');
        const columns = this.get('columns');

        if (rows && columns) {
            return rows.map((row) => tableUtils.createRow(
                row.k,
                row,
                columns,
                row.d,
                row.meta,
            ));
        } else {
            return null;
        }
    }).readOnly(),

    didInsertElement() {
        this.get('shortcutsService').bind(
            'navigation.drillDown',
            () => {
                const selection = this.get('rows').filterBy('id', this.get('selection'));
                if (Ember.isEmpty(selection) === false) {
                    this.send('drillDown', 'default', selection[0]);
                }
            }
        );
        this.get('shortcutsService').bind(
            'dataTables.echo',
            () => {
                const selection = this.get('rows').filterBy('id', this.get('selection'));
                if (Ember.isEmpty(selection) === false) {
                    this.send('drillDown', 'echo', selection[0]);
                }
            }
        );
        this.get('shortcutsService').bind(
            'dataTables.dig',
            () => {
                const selection = this.get('rows').filterBy('id', this.get('selection'));
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
                    const selection = rows.filterBy('id', this.get('selection'));
                    if (Ember.isEmpty(selection) === false) {
                        const indexOf = rows.indexOf(selection[0]);
                        if (indexOf < rows.length - 1) {
                            this.send('select', rows[indexOf + 1]);
                            return false;
                        }
                    } else {
                        this.send('select', rows[0]);
                        return false;
                    }
                }
            }
        );
        this.get('shortcutsService').bind(
            'dataTables.selectPrevious',
            () => {
                const rows = this.get('rows');
                if (Ember.isEmpty(rows) === false) {
                    const selection = rows.filterBy('id', this.get('selection'));
                    if (Ember.isEmpty(selection) === false) {
                        const indexOf = rows.indexOf(selection[0]);
                        if (indexOf > 0) {
                            this.send('select', rows[indexOf - 1]);
                            return false;
                        }
                    } else {
                        this.send('select', rows[rows.length - 1]);
                        return false;
                    }
                }
            }
        );
    },

    willDestroyElement() {
        this.get('shortcutsService').unbind('navigation.drillDown');
        this.get('shortcutsService').unbind('dataTables.echo');
        this.get('shortcutsService').unbind('dataTables.dig');
        this.get('shortcutsService').unbind('dataTables.selectNext');
        this.get('shortcutsService').unbind('dataTables.selectPrevious');
    },

    actions: {
        select(row) {
            this.sendAction('select', row.sourceData);
        },
        activate(row) {
            this.sendAction('drillDown', 'default', row.sourceData);
        },
        drillDown(targetView, row) {
            this.sendAction('drillDown', targetView, row.sourceData);
        },
    },
});

/*
Copyright (C) 2017 Draios inc.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License version 2 as
published by the Free Software Foundation.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import Ember from 'ember';
import layout from '../templates/components/sd-table';
import scrollToSelection from '../utils/scroll-to-selection';

const { get } = Ember;

const ROW_H_PADDING = 8;

export default Ember.Component.extend({
    layout,
    classNames: ['sd-table'],
    layoutProvider: Ember.inject.service('layout-provider'),
    dataSearchService: Ember.inject.service('data-search'),

    columns: null,
    rows: null,
    selection: null,

    headerHeight: 36,
    rowHeight: 36,
    columnWidthUnit: 10,

    bodyHeight: null,
    width: null,
    isSizeKnown: false,
    scrollX: 0,

    prevSelection: null,

    rowsConfiguration: Ember.computed('rows', 'selection', function() {
        const selection = this.get('selection');

        return (this.get('rows') || [])
            .map((row) => ({
                configuration: row,
                isSelected: row.id === selection,
            }))
        ;
    }).readOnly(),

    tableWrapStyle: Ember.computed('width', 'columnsWidth', function() {
        const width = this.get('width');
        const columnsWidth = this.get('columnsWidth');

        if (Ember.isNone(width) === false && Ember.isNone(columnsWidth) === false) {
            if (width < columnsWidth) {
                return Ember.String.htmlSafe(`width: ${columnsWidth + ROW_H_PADDING * 2}px;`);
            } else {
                return Ember.String.htmlSafe(`width: ${width}px;`);
            }
        } else {
            return null;
        }
    }).readOnly(),

    idealLastColumnWidth: 300,

    columnsWidth: Ember.computed('width', 'columns', function() {
        const width = this.get('width');
        const columns = this.get('columns');

        if (Ember.isNone(width) === false && Ember.isNone(columns) === false) {
            const columnWidthUnit = this.get('columnWidthUnit');
            const idealLastColumnWidth = this.get('idealLastColumnWidth');
            return columns.reduce((w, column, i, list) => {
                if (i < list.length - 1) {
                    return w + column.properties.size * columnWidthUnit;
                } else {
                    return w + idealLastColumnWidth;
                }
            }, 0);
        } else {
            return 0;
        }
    }).readOnly(),

    tableStyle: Ember.computed('width', 'columnsWidth', 'idealLastColumnWidth', function() {
        const tableId = this.elementId;

        const width = this.get('width');
        const columnsWidth = this.get('columnsWidth');

        if (Ember.isNone(width) === false && Ember.isNone(columnsWidth) === false) {
            let lastCellStyle;
            if (width < columnsWidth) {
                lastCellStyle = `.sd-table-cell:last-child { flex: none; width: ${this.get('idealLastColumnWidth')}px; }`;
            } else {
                lastCellStyle = '.sd-table-cell:last-child { flex: 1; }';
            }

            return [
                lastCellStyle
            ].map((l) => `#${tableId} ${l}`).join('\n');
        } else {
            return null;
        }
    }).readOnly(),

    init() {
        this._super(...arguments);

        this.get('layoutProvider').onLayoutChanged(this, this.resetSize);

        this.set('prevSelection', this.get('selection'));
    },

    didInsertElement() {
        this.get('layoutProvider').whenSettled(() => this.resetSize());

        this.didScrollBound = this.didScroll.bind(this);
        this.get('element').addEventListener('scroll', this.didScrollBound);
    },

    willDestroyElement() {
        this.get('layoutProvider').offLayoutChanged(this, this.resetSize);

        this.get('element').removeEventListener('scroll', this.didScrollBound);
    },

    didUpdateAttrs() {
        if (this.get('selection') !== this.get('prevSelection')) {
            this.get('layoutProvider').whenSettled(() => this.scrollToSelection());
            this.set('prevSelection', this.get('selection'));
        }
    },

    scrollToSelection() {
        if (this.isDestroying || this.isDestroyed) {
            return;
        }

        const rows = this.get('rows');
        const selection = this.get('selection');

        if (Ember.isEmpty(rows) || Ember.isEmpty(selection)) {
            return;
        }

        let indexOfSelection;
        let i;
        let iz;
        for (i = 0, iz = get(rows, 'length'); i < iz; i++) {
            if (rows[i].id === selection) {
                indexOfSelection = i;
                break;
            }
        }

        if (indexOfSelection === undefined) {
            return;
        }

        scrollToSelection({
            container: this.$('[data-ref="body"]')[0],
            index: indexOfSelection,
            itemHeight: this.get('rowHeight'),
        });
    },

    resetSize() {
        if (this.isDestroying || this.isDestroyed) {
            return;
        }

        const domEl = this.get('element');
        this.setProperties({
            bodyHeight: domEl.parentElement.clientHeight - this.get('headerHeight'),
            width: domEl.parentElement.clientWidth,
            isSizeKnown: true,
        });

        Ember.run.next(this, this.scrollToSelection);
    },

    didScrollBound: null,
    didScroll(e) {
        Ember.run(() => {
            this.set('scrollX', e.target.scrollLeft);
        });
    },

    actions: {
        select(row) {
            this.sendAction('select', row.configuration);
        },
        activate(row) {
            this.sendAction('activate', row.configuration);
        },
    },
});

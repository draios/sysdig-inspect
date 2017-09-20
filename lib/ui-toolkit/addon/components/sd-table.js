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

    bodyHeight: null,
    isBodyHeightKnown: false,

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

    init() {
        this._super(...arguments);

        this.get('layoutProvider').onLayoutChanged(this, this.resetSize);

        this.set('prevSelection', this.get('selection'));
    },

    didInsertElement() {
        this.get('layoutProvider').whenSettled(() => this.resetSize());
    },

    willDestroyElement() {
        this.get('layoutProvider').offLayoutChanged(this, this.resetSize);
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
            isBodyHeightKnown: true,
        });

        Ember.run.next(this, this.scrollToSelection);
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

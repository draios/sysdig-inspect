import Ember from 'ember';
import layout from '../templates/components/sd-table';
import scrollToSelection from '../utils/scroll-to-selection';

const { get } = Ember;

export default Ember.Component.extend({
    layout,
    classNames: ['sd-table'],
    layoutProvider: Ember.inject.service('layout-provider'),

    columns: null,
    rows: null,
    selection: null,
    key: 'id',

    headerHeight: 36,
    rowHeight: 36,

    bodyHeight: null,
    isBodyHeightKnown: false,

    prevSelection: null,

    rowsData: Ember.computed('rows', 'selection', function() {
        const selection = this.get('selection');
        const key = this.get('key');

        return (this.get('rows') || []).map((row) => {
            return {
                data: row,
                isSelected: get(row, key) === selection,
            };
        });
    }).readOnly(),

    init() {
        this._super(...arguments);

        this.get('layoutProvider').onLayoutChanged(this, this.resetSize);
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

        const key = this.get('key');
        let indexOfSelection;
        let i;
        let iz;
        for (i = 0, iz = get(rows, 'length'); i < iz; i++) {
            if (get(rows[i], key) === selection) {
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
            this.sendAction('select', row.data);
        },
        activate(row) {
            this.sendAction('activate', row.data);
        },
    },
});

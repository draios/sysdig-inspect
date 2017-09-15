import Ember from 'ember';
import layout from '../templates/components/sd-table';

export default Ember.Component.extend({
    layout,
    classNames: ['sd-table'],
    layoutProvider: Ember.inject.service('layout-provider'),

    columns: null,
    rows: null,
    selection: null,
    key: 'id',

    headerHeight: 24,

    height: null,
    isHeightKnown: false,

    rowsData: Ember.computed('rows', 'selection', function() {
        const selection = this.get('selection');
        const key = this.get('key');

        return (this.get('rows') || []).map((row) => {
            return {
                data: row,
                isSelected: row[key] === selection,
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

    resetSize() {
        if (this.isDestroying || this.isDestroyed) {
            return;
        }

        const domEl = this.get('element');
        this.setProperties({
            height: domEl.parentElement.clientHeight - this.get('headerHeight'),
            isHeightKnown: true,
        });
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

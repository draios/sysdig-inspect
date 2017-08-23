import Ember from 'ember';
import layout from '../templates/components/sd-table';

export default Ember.Component.extend({
    layout,
    classNames: ['sd-table'],
    layoutProvider: Ember.inject.service('layout-provider'),

    columns: null,
    rows: null,

    headerHeight: 24,

    height: null,
    isHeightKnown: false,

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
        if (this.isDestroying || this.isDestroyed) return;

        const domEl = this.get('element');
        this.setProperties({
            height: domEl.parentElement.clientHeight - this.get('headerHeight'),
            isHeightKnown: true,
        });
    },
});

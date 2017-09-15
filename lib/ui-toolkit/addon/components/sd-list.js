import Ember from 'ember';
import layout from '../templates/components/sd-list';
import scrollToSelection from '../utils/scroll-to-selection';

const get = Ember.get;

export default Ember.Component.extend({
    layout,
    classNames: ['sd-list'],

    layoutProvider: Ember.inject.service('layout-provider'),

    items: null,
    selection: null,
    key: 'id',

    itemHeight: 36,

    itemsData: Ember.computed('items', 'selection', function() {
        const key = this.get('key');
        const selection = this.get('selection');

        return (this.get('items') || []).map((item) => {
            return {
                isSelected: get(item, key) === selection,
                data: item,
            }
        });
    }).readOnly(),

    didInsertElement() {
        this.get('layoutProvider').whenSettled(() => this.scrollToSelection());
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

        const items = this.get('items');
        const selection = this.get('selection');

        if (Ember.isEmpty(items) || Ember.isEmpty(selection)) {
            return;
        }

        const key = this.get('key');
        let indexOfSelection;
        let i, iz;
        for (i = 0, iz = get(items, 'length'); i < iz; i++) {
            if (get(items[i], key) === selection) {
                indexOfSelection = i;
                break;
            }
        }

        if (indexOfSelection === undefined) {
            return;
        }

        scrollToSelection({
            container: this.get('element'),
            index: indexOfSelection,
            itemHeight: this.get('itemHeight'),
            paddingTop: 16,
        });
    },
});

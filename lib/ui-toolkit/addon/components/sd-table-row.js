import Ember from 'ember';
import layout from '../templates/components/sd-table-row';

export default Ember.Component.extend({
    layout,
    classNames: ['sd-table-row'],
    classNameBindings: [
        'isSelected:sd-table-row--is-selected',
        'isNotSearchMatch:sd-table-row--is-not-search-match'
    ],

    row: null,
    isMouseOver: false,

    rowConfiguration: Ember.computed('row', 'isMouseOver', function() {
        return {
            configuration: this.get('row'),
            isMouseOver: this.get('isMouseOver'),
        };
    }).readOnly(),

    isNotSearchMatch: Ember.computed('row.meta.isMatch', function() {
        return this.get('row.meta.isMatch') === false;
    }).readOnly(),

    mouseEnter() {
        this.set('isMouseOver', true);
    },

    mouseLeave() {
        this.set('isMouseOver', false);
    },

    click() {
        console.warn('sd-table-row.click');
        this.sendAction('select');
    },

    doubleClick() {
        console.warn('sd-table-row.doubleClick');
        this.sendAction('activate');
    },
});

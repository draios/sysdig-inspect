import Ember from 'ember';
import layout from '../templates/components/sd-table-row';

export default Ember.Component.extend({
    layout,
    classNames: ['sd-table-row'],
    classNameBindings: ['row.isSelected:sd-table-row--is-selected'],
    attributeBindings: ['tabIndex'],

    tabIndex: 0,

    row: null,
    isMouseOver: false,

    rowConfiguration: Ember.computed('row', 'isMouseOver', function() {
        return {
            data: this.get('row'),
            isMouseOver: this.get('isMouseOver'),
        };
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
});

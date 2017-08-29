import Ember from 'ember';
import layout from '../templates/components/wsd-table-cell-actions';

export default Ember.Component.extend({
    layout,
    classNames: ['wsd-table-cell-actions'],
    classNameBindings: [
        'isRowMouseOver:wsd-table-cell-actions--is-visible',
        'isRowSelected:wsd-table-cell-actions--is-visible'
    ],
});

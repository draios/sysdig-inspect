import Ember from 'ember';
import layout from '../templates/components/table-cell-actions';

export default Ember.Component.extend({
    layout,
    classNames: ['table-cell-actions'],
    classNameBindings: [
        'isRowMouseOver:table-cell-actions--is-visible',
        'isRowSelected:table-cell-actions--is-visible'
    ],
});

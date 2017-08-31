import Ember from 'ember';
import layout from '../templates/components/wsd-table-cell-actions';

export default Ember.Component.extend({
    layout,
    classNames: ['wsd-table-cell-actions'],
    classNameBindings: ['areControlsVisible:wsd-table-cell-actions--are-controls-visible'],

    isRowMouseOver: false,
    isRowSelected: false,
    areControlsVisible: Ember.computed.or('isRowMouseOver', 'isRowSelected').readOnly(),
});

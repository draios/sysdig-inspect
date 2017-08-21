import Ember from 'ember';
import layout from '../templates/components/sd-table';

export default Ember.Component.extend({
    layout,
    classNames: ['sd-table'],

    height: 500,
    columns: null,
    rows: null,
});

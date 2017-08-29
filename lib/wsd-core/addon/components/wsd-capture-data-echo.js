import Ember from 'ember';
import layout from '../templates/components/wsd-capture-data-echo';

export default Ember.Component.extend({
    layout,
    classNames: ['wsd-capture-data-echo'],

    rows: Ember.computed('dataStore.rows', function() {
        return this.get('dataStore.rows').slice(0, 1000);
    }).readOnly(),
});

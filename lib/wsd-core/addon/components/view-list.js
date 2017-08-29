import Ember from 'ember';
import layout from '../templates/components/view-list';

export default Ember.Component.extend({
    layout,
    classNames: ['view-list'],
    dataStoreService: Ember.inject.service('fetch-views'),

    dataStore: Ember.computed(function() {
        return this.get('dataStoreService').fetch();
    }).readOnly(),
});

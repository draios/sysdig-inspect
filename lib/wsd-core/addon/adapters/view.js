import Ember from 'ember';
import DS from 'ember-data';

export default DS.RESTAdapter.extend({
    apiServerAdapter: Ember.inject.service('api-server-adapter'),

    buildURL() {
        return this.get('apiServerAdapter').buildURL('/capture/views');
    },
});

import Ember from 'ember';

export default Ember.Route.extend({
    setupController(...args) {
        this._super(...args);

        this.controllerFor('application').set('captureFilePath', null);
    },
});

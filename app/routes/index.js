import Ember from 'ember';

export default Ember.Route.extend({
    beforeModel(transition) {
        this.controllerFor('application').set('serverPort', transition.queryParams.port);
    },

    setupController(...args) {
        this._super(...args);

        this.controllerFor('application').set('captureFilePath', null);
    },
});

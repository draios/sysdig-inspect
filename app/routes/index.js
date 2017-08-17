import Ember from 'ember';

export default Ember.Route.extend({
    beforeModel() {
        this.replaceWith('capture', '/Users/davide/Downloads/lo.scap');
    },

    setupController(...args) {
        this._super(...args);

        this.controllerFor('application').set('captureFilePath', null);
    },
});

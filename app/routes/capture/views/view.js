import Ember from 'ember';

export default Ember.Route.extend({
    model(params) {
        return {
            id: params.id,
            filePath: this.modelFor('capture').filePath,
        };
    },

    setupController(controller, model) {
        this._super(...arguments);

        this.controllerFor('capture').set('selectedViewId', model.id);
    },
});

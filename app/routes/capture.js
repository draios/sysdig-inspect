import Ember from 'ember';

export default Ember.Route.extend({
    model(params) {
        return {
            filePath: params.filePath,
        };
    },

    setupController(controller, model) {
        this._super(controller, model);

        this.controllerFor('application').set('captureFilePath', model.filePath);
    },
});

import Ember from 'ember';

export default Ember.Route.extend({
    model(params) {
        return new ViewModel(params.id, this.modelFor('capture'));
    },

    setupController(controller, model) {
        this._super(...arguments);

        this.controllerFor('capture').set('selectedViewId', model.viewId);
    },
});

class ViewModel {
    constructor(viewId, captureModel) {
        this.viewId = viewId;
        this.capture = captureModel;
    }
}
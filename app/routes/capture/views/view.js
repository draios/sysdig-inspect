import Ember from 'ember';

export default Ember.Route.extend({
    viewsManager: Ember.inject.service('views-manager'),

    model(params) {
        return new ViewModel(params.id, this.modelFor('capture'));
    },

    setupController(controller, model) {
        this._super(...arguments);

        this.controllerFor('capture').set('selectedViewId', model.viewId);

        this.get('viewsManager')
            .findViewConfiguration(model.viewId)
            .then((view) => {
                document.title = `Sysdig Inspector - ${view.name} on ${model.capture.filePath}`;
            })
        ;
    },

    deactivate() {
        document.title = 'Sysdig Inspector';
    },
});

class ViewModel {
    constructor(viewId, captureModel) {
        this.viewId = viewId;
        this.capture = captureModel;
    }
}
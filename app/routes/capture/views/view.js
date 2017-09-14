import Ember from 'ember';

export default Ember.Route.extend({
    queryParams: {
        filter: { refreshModel: true },
        searchPattern: { refreshModel: true },
    },

    viewsManager: Ember.inject.service('views-manager'),

    model(params) {
        return new ViewModel(params.id, params.filter, params.searchPattern, this.modelFor('capture'));
    },

    setupController(controller, model) {
        this._super(...arguments);

        this.controllerFor('capture').setProperties({
            selectedViewId: model.viewId,
            filter: model.filter,
            searchPattern: model.searchPattern,
        });

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
    constructor(viewId, filter, searchPattern, captureModel) {
        this.viewId = viewId;
        this.filter = filter;
        this.searchPattern = searchPattern;
        this.capture = captureModel;
    }
}
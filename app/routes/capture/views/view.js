/*
Copyright (C) 2017 Draios inc.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License version 2 as
published by the Free Software Foundation.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

import Ember from 'ember';

export default Ember.Route.extend({
    queryParams: {
        filter: { refreshModel: true },
        searchPattern: { refreshModel: true },
    },

    viewsManager: Ember.inject.service('views-manager'),
    dataSearchService: Ember.inject.service('data-search'),

    model(params) {
        return new ViewModel(params.id, params.filter, params.searchPattern, this.modelFor('capture'));
    },

    setupController(controller, model) {
        this._super(...arguments);

        this.controllerFor('capture').setProperties({
            selectedViewId: model.viewId,
            filter: model.filter,
        });

        this.get('dataSearchService').setSearchPattern(model.searchPattern);

        this.get('viewsManager')
            .findViewConfiguration(model.viewId)
            .then((view) => {
                document.title = `Sysdig Inspect - ${view.name} on ${model.capture.filePath}`;
            })
        ;
    },

    deactivate() {
        document.title = 'Sysdig Inspect';
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
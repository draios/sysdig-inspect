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
    drilldownManager: Ember.inject.service('drilldown-manager'),
    dataSearchService: Ember.inject.service('data-search'),
    userTracking: Ember.inject.service('user-tracking'),

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

        // NOTE: Time selection can be changed with the mouse, and this would perform a visit every
        // "tick"
        Ember.run.debounce(this, this.trackVisit, 300);
    },

    trackVisit() {
        this.get('userTracking').visit({
            route: 'capture.views.view',
            view: this.get('controller.model.viewId'),
            'sysdig filter': this.get('controller.model.filter'),
            find: this.get('controller.model.searchPattern'),
            from: this.get('controller.model.capture.queryParams.timeFrom'),
            to: this.get('controller.model.capture.queryParams.timeTo'),
            timelines: serializeTimelines(this.get('controller.model.capture.queryParams.metricTimelinesParam')),
            'drill down': serializeDrillDown(this.get('drilldownManager'), this.get('controller.model.viewId'), this.get('controller.model.capture.queryParams.drilldownInfoParam')),
        });

        function serializeTimelines(param) {
            return (param || '').split(',').join(', ');
        }

        function serializeDrillDown(drilldownManager, viewId, param) {
            if (param) {
                const steps = drilldownManager.convertFromUrl({
                    viewId,
                    drilldownInfoParam: param,
                });

                return steps.map((step) => {
                    return `${step.viewId} > ${step.selection || 'no selection'}`;
                }).join(', ');
            } else {
                return '';
            }
        }
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
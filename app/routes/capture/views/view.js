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
        const drillDown = serializeDrillDown(this.get('drilldownManager'), this.get('controller.model.viewId'), this.get('controller.model.capture.queryParams.drilldownInfoParam'));
        const current = drillDown[drillDown.length - 1] || { viewId: 'overview', selection: null };
        const previous = drillDown[drillDown.length - 2];
        const filePath = this.get('controller.model.capture.filePath');

        this.get('userTracking').visit({
            route: 'capture.views.view',
            file: filePath.startsWith('capture-samples/') ? filePath : 'n/a',
            timelines: serializeTimelines(this.get('controller.model.capture.queryParams.metricTimelinesParam')),

            view: current.viewId,
            'selection': current.selection,
            'previous view': previous ? previous.viewId : null,
            'previous selection': previous ? previous.selection : null,
            'drill down': drillDown.map((step) => `${step.viewId} + ${step.selection}`).join(' > '),

            'sysdig filter': Ember.isEmpty(this.get('controller.model.filter')) ? null : 'set',
            find: Ember.isEmpty(this.get('controller.model.searchPattern')) ? null : 'set',
            from: this.get('controller.model.capture.queryParams.timeFrom'),
            to: this.get('controller.model.capture.queryParams.timeTo'),
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
                    let selection;
                    if (step.viewId === 'overview') {
                        selection = step.selection || null;
                    } else {
                        selection = Ember.isEmpty(step.selection) ? null : 'set';
                    }

                    return {
                        viewId: step.viewId,
                        selection,
                    };
                });
            } else {
                return [];
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
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
        drilldownInfoParam: { refreshModel: true },
        metricTimelinesParam: { refreshModel: true },
        timeFrom: { refreshModel: true },
        timeTo: { refreshModel: true },
    },

    captureTimelines: Ember.inject.service('capture-timelines'),
    dataSearchService: Ember.inject.service('data-search'),
    userTracking: Ember.inject.service('user-tracking'),

    model(params) {
        return new CaptureModel(
            params.filePath,
            {
                drilldownInfoParam: params.drilldownInfoParam,
                metricTimelinesParam: params.metricTimelinesParam,
                timeFrom: params.timeFrom,
                timeTo: params.timeTo,
            }
        );
    },

    setupController(controller, model) {
        this._super(controller, model);

        this.get('captureTimelines').setCurrent(
            this.get('captureTimelines').deserializeFromQueryParam(model.queryParams.metricTimelinesParam)
        );
    },

    deactivate() {
        document.title = 'Sysdig Inspect';
    },

    getCurrentQueryParams(overrides) {
        return Object.assign(
            {},
            this.get('controller.model.queryParams'),
            {
                filter: this.get('controller.filter'),
                searchPattern: this.get('dataSearchService.searchDataStore.searchPattern'),
            },
            overrides
        );
    },

    actions: {
        select(drilldownInfo) {
            console.debug('route:application.capture', 'select', ...arguments);
            this.replaceWith('capture.views.view', drilldownInfo.viewId, {
                queryParams: this.getCurrentQueryParams({
                    drilldownInfoParam: drilldownInfo.drilldownInfoParam,
                }),
            });
        },

        drillDown(drilldownInfo) {
            console.debug('route:application.capture', 'drillDown', ...arguments);
            this.transitionTo('capture.views.view', drilldownInfo.viewId, {
                queryParams: this.getCurrentQueryParams({
                    drilldownInfoParam: drilldownInfo.drilldownInfoParam,
                }),
            });
        },

        applyFilter(filter) {
            this.get('userTracking').action(this.get('userTracking').ACTIONS.INTERACTION, {
                name: 'apply sysdig filter',
                'is set': Ember.isEmpty(filter) === false,
            });

            console.debug('route:application.capture', 'applyFilter', ...arguments);
            this.transitionTo('capture.views.view', this.controller.get('selectedViewId'), {
                queryParams: this.getCurrentQueryParams({
                    filter: Ember.isEmpty(filter) ? undefined : filter,
                }),
            });
        },

        applySearch(searchPattern) {
            console.debug('route:application.capture', 'applySearch', ...arguments);
            this.transitionTo('capture.views.view', this.controller.get('selectedViewId'), {
                queryParams: this.getCurrentQueryParams({
                    searchPattern: Ember.isEmpty(searchPattern) ? undefined : searchPattern,
                }),
            });
        },

        selectTimeWindow(from, to) {
            if (Ember.isNone(from) === false && Ember.isNone(to) === false) {
                this.replaceWith('capture.views.view', this.controller.get('selectedViewId'), {
                    queryParams: this.getCurrentQueryParams({
                        timeFrom: from,
                        timeTo: to,
                    }),
                });
            } else {
                this.get('userTracking').action(this.get('userTracking').ACTIONS.INTERACTION, {
                    name: 'reset timeline selection',
                });

                this.replaceWith('capture.views.view', this.controller.get('selectedViewId'), {
                    queryParams: this.getCurrentQueryParams({
                        timeFrom: undefined,
                        timeTo: undefined,
                    }),
                });
            }
        },

        toggleMetricTimeline(metricName) {
            this.replaceWith('capture.views.view', this.controller.get('selectedViewId'), {
                queryParams: this.getCurrentQueryParams({
                    metricTimelinesParam: this.get('captureTimelines').serializeToQueryParam(
                        this.get('captureTimelines').toggle(metricName)
                    ),
                }),
            });
        },

        removeMetricTimeline(metricName) {
            this.replaceWith('capture.views.view', this.controller.get('selectedViewId'), {
                queryParams: this.getCurrentQueryParams({
                    metricTimelinesParam: this.get('captureTimelines').serializeToQueryParam(
                        this.get('captureTimelines').remove(metricName)
                    ),
                }),
            });
        },
    },
});

class CaptureModel {
    constructor(filePath, queryParams) {
        this.filePath = filePath;
        this.queryParams = queryParams;
    }
}

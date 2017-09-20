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

        this.controllerFor('application').set('captureFilePath', model.filePath);

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

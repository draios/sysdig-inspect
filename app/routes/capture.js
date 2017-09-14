import Ember from 'ember';

export default Ember.Route.extend({
    queryParams: {
        drilldownInfoParam: { refreshModel: true },
        metricTimelinesParam: { refreshModel: true },
        timeFrom: { refreshModel: true },
        timeTo: { refreshModel: true },
    },

    captureTimelines: Ember.inject.service('capture-timelines'),

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
        document.title = 'Sysdig Inspector';
    },

    actions: {
        select(drilldownInfo) {
            console.debug('route:application.capture', 'select', ...arguments);
            this.replaceWith('capture.views.view', drilldownInfo.viewId, {
                queryParams: Object.assign({}, this.get('controller.model.queryParams'), {
                    drilldownInfoParam: drilldownInfo.drilldownInfoParam,
                    filter: null,
                }),
            });
        },

        drillDown(drilldownInfo) {
            console.debug('route:application.capture', 'drillDown', ...arguments);
            this.transitionTo('capture.views.view', drilldownInfo.viewId, {
                queryParams: Object.assign({}, this.get('controller.model.queryParams'), {
                    drilldownInfoParam: drilldownInfo.drilldownInfoParam,
                    filter: null,
                }),
            });
        },

        applyFilter(filter) {
            console.debug('route:application.capture', 'applyFilter', ...arguments);
            this.transitionTo('capture.views.view', this.controller.get('selectedViewId'), {
                queryParams: Object.assign({}, this.get('controller.model.queryParams'), {
                    filter: Ember.isEmpty(filter) ? undefined : filter,
                }),
            });
        },

        applySearch(searchPattern) {
            console.debug('route:application.capture', 'applySearch', ...arguments);
            this.transitionTo('capture.views.view', this.controller.get('selectedViewId'), {
                queryParams: Object.assign({}, this.get('controller.model.queryParams'), {
                    searchPattern: Ember.isEmpty(searchPattern) ? undefined : searchPattern,
                }),
            });
        },

        selectTimeWindow(from, to) {
            if (Ember.isNone(from) === false && Ember.isNone(to) === false) {
                this.replaceWith('capture.views.view', this.controller.get('selectedViewId'), {
                    queryParams: Object.assign({}, this.get('controller.model.queryParams'), {
                        timeFrom: from,
                        timeTo: to,
                    }),
                });
            } else {
                this.replaceWith('capture.views.view', this.controller.get('selectedViewId'), {
                    queryParams: Object.assign({}, this.get('controller.model.queryParams'), {
                        timeFrom: undefined,
                        timeTo: undefined,
                    }),
                });
            }
        },

        toggleMetricTimeline(metricName) {
            this.replaceWith('capture.views.view', this.controller.get('selectedViewId'), {
                queryParams: Object.assign({}, this.get('controller.model.queryParams'), {
                    metricTimelinesParam: this.get('captureTimelines').serializeToQueryParam(
                        this.get('captureTimelines').toggle(metricName)
                    ),
                }),
            });
        },

        removeMetricTimeline(metricName) {
            this.replaceWith('capture.views.view', this.controller.get('selectedViewId'), {
                queryParams: Object.assign({}, this.get('controller.model.queryParams'), {
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

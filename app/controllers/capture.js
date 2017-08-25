import Ember from 'ember';

export default Ember.Controller.extend({
    queryParams: {
        drilldownInfoParam: 'drilldownInfo',
        metricTimelinesParam: 'timelines',
        timeFrom: 'timeFrom',
        timeTo: 'timeTo',
    },

    captureTimelines: Ember.inject.service('capture-timelines'),

    selectedViewId: null,
    timelines: null,
    drilldownInfoParam: null,
    metricTimelinesParam: null,
    timeFrom: null,
    timeTo: null,

    drilldownInfo: Ember.computed('drilldownInfoParam', function() {
        const param = this.get('drilldownInfoParam');
        if (Ember.isNone(param)) {
            return null;
        } else {
            return JSON.parse(param);
        }
    }).readOnly(),

    timeWindow: Ember.computed('timeFrom', 'timeTo', function() {
        if (Ember.isNone(this.get('timeFrom')) === false && Ember.isNone(this.get('timeTo')) === false) {
            return {
                from: this.get('timeFrom'),
                to: this.get('timeTo'),
            };
        } else {
            return null;
        }
    }).readOnly(),

    metricTimelinesParamDidChange: Ember.observer('metricTimelinesParam', function() {
        this.get('captureTimelines').setCurrent(
            this.get('captureTimelines').deserializeFromQueryParam(this.get('metricTimelinesParam'))
        );
    }),

    actions: {
        navigateTo(steps) {
            const viewId = steps[steps.length - 1].id;
            const drilldownInfoParam = JSON.stringify(steps.slice(1));

            if (viewId === 'overview') {
                this.transitionToRoute('capture.overview');
            } else {
                this.transitionToRoute(
                    'capture.views.view',
                    viewId,
                    {
                        queryParams: { drilldownInfoParam }
                    }
                );
            }

            // this.transitionToRoute(
            //     'capture.views.view',
            //     viewName,
            //     {
            //         queryParams: {
            //             timeFrom: this.get('timeFrom'),
            //             timeTo: this.get('timeTo'),
            //             filter: viewFilter,
            //         },
            //     },
            // );
        },

        selectTimeWindow(from, to) {
            if (Ember.isNone(from) === false && Ember.isNone(to) === false) {
                this.transitionToRoute(
                    'capture',
                    {
                        queryParams: {
                            timeFrom: from,
                            timeTo: to,
                        },
                    },
                );
            } else {
                this.transitionToRoute(
                    'capture',
                    {
                        queryParams: {
                            timeFrom: undefined,
                            timeTo: undefined,
                        },
                    },
                );
            }
        },

        removeMetricTimeline(metricName) {
            this.transitionToRoute(
                'capture',
                {
                    queryParams: {
                        timelines: this.get('captureTimelines').serializeToQueryParam(
                            this.get('captureTimelines').remove(metricName)
                        ),
                    },
                }
            );
        },

        drillDown() {
            debugger;
        },
    },
});

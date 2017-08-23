import Ember from 'ember';

export default Ember.Controller.extend({
    queryParams: {
        metricTimelinesParam: 'timelines',
        timeFrom: 'timeFrom',
        timeTo: 'timeTo',
    },

    metricTimelinesParam: null,
    metricTimelines: Ember.computed('metricTimelinesParam', function() {
        const names = this.get('metricTimelinesParam');

        if (Ember.isEmpty(names)) {
            return [];
        } else {
            return names.split(',');
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

    actions: {
        toggleMetricTimeline(metricName) {
            const timelines = this.get('metricTimelines');
            let newTimelines;

            if (timelines.includes(metricName)) {
                newTimelines = timelines.filter((name) => name !== metricName);
            } else {
                newTimelines = [metricName].concat(timelines);
            }

            this.transitionToRoute(
                'capture.overview',
                {
                    queryParams: {
                        timelines: newTimelines.join(','),
                    },
                }
            );
        },

        removeMetricTimeline(metricName) {
            const timelines = this.get('metricTimelines');
            let newTimelines;

            if (timelines.includes(metricName)) {
                newTimelines = timelines.filter((name) => name !== metricName);

                this.transitionToRoute(
                    'capture.overview',
                    {
                        queryParams: {
                            timelines: newTimelines.join(','),
                        },
                    }
                );
            }
        },

        selectTimeWindow(from, to) {
            if (Ember.isNone(from) === false && Ember.isNone(to) === false) {
                this.transitionToRoute(
                    'capture.overview',
                    {
                        queryParams: {
                            timeFrom: from,
                            timeTo: to,
                        },
                    },
                );
            } else {
                this.transitionToRoute(
                    'capture.overview',
                    {
                        queryParams: {
                            timeFrom: undefined,
                            timeTo: undefined,
                        },
                    },
                );
            }
        },

        drillDown(viewName, from, to, viewFilter) {
            this.transitionToRoute(
                'capture.views.view',
                viewName,
                {
                    queryParams: {
                        timeFrom: this.get('timeFrom'),
                        timeTo: this.get('timeTo'),
                        filter: viewFilter ? `evt.type != switch and ${viewFilter}` : undefined,
                    },
                },
            );
        },
    },
});

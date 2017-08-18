import Ember from 'ember';

export default Ember.Controller.extend({
    queryParams: {
        metricTimelinesParam: 'timelines',
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

    actions: {
        toggleMetricTimeline(metricName) {
            const timelines = this.get('metricTimelines');
            let newTimelines;

            if (timelines.includes(metricName)) {
                newTimelines = timelines.filter((name) => name !== metricName);
            } else {
                newTimelines = [metricName].concat(timelines);
            }

            this.transitionToRoute('capture', {
                queryParams: {
                    timelines: newTimelines.join(','),
                },
            });
        },

        removeMetricTimeline(metricName) {
            const timelines = this.get('metricTimelines');
            let newTimelines;

            if (timelines.includes(metricName)) {
                newTimelines = timelines.filter((name) => name !== metricName);

                this.transitionToRoute('capture', {
                    queryParams: {
                        timelines: newTimelines.join(','),
                    },
                });
            }
        },

        drillDown(viewName) {
            this.transitionToRoute('capture.table', viewName);
        },
    },
});

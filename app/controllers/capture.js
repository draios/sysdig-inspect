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
                newTimelines = timelines.concat([metricName]);
            }

            this.transitionToRoute('capture', {
                queryParams: {
                    timelines: newTimelines.join(','),
                },
            });
        },
    },
});

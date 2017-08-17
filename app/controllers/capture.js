import Ember from 'ember';

export default Ember.Controller.extend({
    metricTimelines: null,

    init(...args) {
        this._super(...args);

        this.set('metricTimelines', []);
    },

    actions: {
        toggleMetricTimeline(metricName) {
            const timelines = this.get('metricTimelines');

            if (timelines.includes(metricName)) {
                this.set('metricTimelines', timelines.filter((name) => name !== metricName));
            } else {
                this.set('metricTimelines', timelines.concat([metricName]));
            }
        },
    },
});

import Ember from 'ember';

export default Ember.Controller.extend({
    captureTimelines: Ember.inject.service('capture-timelines'),

    actions: {
        toggleMetricTimeline(metricName) {
            this.transitionToRoute(
                'capture',
                {
                    queryParams: {
                        timelines: this.get('captureTimelines').serializeToQueryParam(
                            this.get('captureTimelines').toggle(metricName)
                        ),
                    },
                }
            );
        },
    },
});

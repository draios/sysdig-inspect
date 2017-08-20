import Ember from 'ember';
import layout from '../templates/components/capture-overview';

export default Ember.Component.extend({
    layout,
    classNames: ['capture-overview', 'capture-overview--xlist'],
    fetchCaptureSummary: Ember.inject.service('fetch-capture-summary'),

    filePath: null,
    captureSummary: null,
    timelines: null,
    toggleMetricTimeline: null,

    captureSummary: Ember.computed('filePath', function() {
        return this.get('fetchCaptureSummary').fetch(this.get('filePath'));
    }).readOnly(),

    timelinesData: Ember.computed('timelines', 'captureSummary.metrics', function() {
        const timelines = this.get('timelines');
        const metrics = this.get('captureSummary.metrics');

        if (metrics) {
            return timelines.map((metricName) => metrics.findBy('name', metricName));
        } else {
            return null;
        }
    }).readOnly(),

    metricsData: Ember.computed('timelines', 'captureSummary.metrics', function() {
        const timelines = this.get('timelines');
        const metrics = this.get('captureSummary.metrics');

        if (metrics) {
            return metrics.map((metric) => {
                return {
                    data: metric,
                    isSelected: timelines.includes(metric.name),
                };
            });
        } else {
            return null;
        }
    }).readOnly(),
});

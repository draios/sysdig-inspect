import Ember from 'ember';
import layout from '../templates/components/wsd-capture-overview';

const IS_CATEGORY_LAYOUT = true;
const IS_VERTICAL_LAYOUT = true;

export default Ember.Component.extend({
    layout,
    classNames: ['wsd-capture-overview', 'wsd-capture-overview--xlist'],
    classNameBindings: ['isVerticalLayout:wsd-capture-overview--is-vertical-layout'],

    captureSummaryDataService: Ember.inject.service('fetch-capture-summary'),
    captureTimelines: Ember.inject.service('capture-timelines'),
    drilldownManager: Ember.inject.service('drilldown-manager'),

    filePath: null,
    timelines: null,
    drilldownInfoParam: null,
    toggleMetricTimeline: null,

    drilldownInfo: Ember.computed('drilldownInfoParam', function() {
        return this.get('drilldownManager').convertFromUrl({
            viewId: 'overview',
            drilldownInfoParam: this.get('drilldownInfoParam'),
        });
    }).readOnly(),

    dataStore: Ember.computed('filePath', function() {
        const timelinesWidth = 110;
        const sampleCount = Math.round(timelinesWidth / (5 * 1.4));
        return this.get('captureSummaryDataService').fetch(this.get('filePath'), sampleCount);
    }).readOnly(),

    timelinesData: Ember.computed('timelines', 'dataStore.metrics', function() {
        const timelines = this.get('timelines');
        const metrics = this.get('dataStore.metrics');

        if (metrics) {
            return timelines.map((metricName) => metrics.findBy('name', metricName));
        } else {
            return null;
        }
    }).readOnly(),

    metricsData: Ember.computed('captureTimelines.timelines', 'dataStore.metrics', function() {
        const timelines = this.get('captureTimelines.timelines');
        const metrics = this.get('dataStore.metrics');

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

    isCategoryLayout: IS_CATEGORY_LAYOUT,
    isVerticalLayout: IS_VERTICAL_LAYOUT,

    categories: Ember.computed('metricsData', function() {
        const categories = [
            {
                id: 'general',
                name: 'General',
                metricsData: [],
            },
            {
                id: 'file',
                name: 'File',
                metricsData: [],
            },
            {
                id: 'network',
                name: 'Network',
                metricsData: [],
            },
            {
                id: 'security',
                name: 'Security',
                metricsData: [],
            },
            {
                id: 'performance',
                name: 'Performance',
                metricsData: [],
            },
            {
                id: 'logs',
                name: 'Logs',
                metricsData: [],
            }
        ];

        this.get('metricsData').forEach((metric) => {
            categories.findBy('id', metric.data.category).metricsData.push(metric);
        });

        return categories;
    }).readOnly(),

    actions: {
        drillDown(metricName, filter, nextViewId) {
            const drilldownManager = this.get('drilldownManager');
            const drilldownInfo = drilldownManager.drillDown(this.get('drilldownInfo'), metricName, filter, nextViewId);
            this.sendAction('drillDown', drilldownManager.convertToUrl(drilldownInfo));
        },
    },
});

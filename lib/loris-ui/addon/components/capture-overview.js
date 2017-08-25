import Ember from 'ember';
import layout from '../templates/components/capture-overview';

const IS_CATEGORY_LAYOUT = false;
const IS_VERTICAL_LAYOUT = false;

export default Ember.Component.extend({
    layout,
    classNames: ['capture-overview', 'capture-overview--xlist'],
    classNameBindings: ['isVerticalLayout:capture-overview--is-vertical-layout'],
    dataStoreService: Ember.inject.service('fetch-capture-summary'),
    captureTimelines: Ember.inject.service('capture-timelines'),

    filePath: null,
    timelines: null,
    toggleMetricTimeline: null,

    dataStore: Ember.computed('filePath', function() {
        return this.get('dataStoreService').fetch(this.get('filePath'));
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
        const metricsData = this.get('metricsData');

        return metricsData
            .reduce((categories, metric) => {
                if (categories.map[metric.data.category] === undefined) {
                    categories.map[metric.data.category] = {
                        name: metric.data.category,
                        metricsData: [],
                    };
                    categories.list.push(categories.map[metric.data.category]);
                }

                categories.map[metric.data.category].metricsData.push(metric);

                return categories;
            }, { list: [], map: {} })
            .list
            .sort((a, b) => a.name.localeCompare(b.name))
        ;
    }).readOnly(),
});

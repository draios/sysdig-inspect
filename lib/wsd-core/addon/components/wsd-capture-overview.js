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
    shortcutsService: Ember.inject.service('keyboard-shortcuts'),

    filePath: null,
    timelines: null,
    timeWindow: null,
    drilldownInfoParam: null,
    toggleMetricTimeline: null,

    selectedMetric: null,

    drilldownInfo: Ember.computed('drilldownInfoParam', function() {
        return this.get('drilldownManager').convertFromUrl({
            viewId: 'overview',
            drilldownInfoParam: this.get('drilldownInfoParam'),
        });
    }).readOnly(),

    dataStore: Ember.computed('filePath', 'timeWindow', function() {
        const timelinesWidth = 110;
        const sampleCount = Math.round(timelinesWidth / (4 * 1.4));
        const possibleSampleCount = [4, 5, 8, 10, 16, 20, 25, 40, 50, 80, 100, 200, 400];
        const bestSampleCount = possibleSampleCount.filter((c) => c >= sampleCount)[0] || possibleSampleCount[0];

        return this.get('captureSummaryDataService').fetch(
            this.get('filePath'),
            bestSampleCount,
            this.get('timeWindow'),
            false
        );
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

    metricsData: Ember.computed('captureTimelines.timelines', 'dataStore.metrics', 'selectedMetric', function() {
        const timelines = this.get('captureTimelines.timelines');
        const metrics = this.get('dataStore.metrics');
        const selectedMetric = this.get('selectedMetric');

        if (metrics) {
            return metrics.map((metric) => {
                return {
                    data: metric,
                    isSelected: metric.name === selectedMetric,
                    isTimelinePinned: timelines.includes(metric.name),
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

    didInsertElement() {
        this.get('shortcutsService').bind(
            'overview.drillDown',
            () => {
                const metricsData = this.get('metricsData').filterBy('isSelected', true);
                if (Ember.isEmpty(metricsData) === false) {
                    this.send('drillDown', metricsData[0].data.name);
                }
            }
        );
        this.get('shortcutsService').bind(
            'overview.toggleTimeline',
            () => {
                if (Ember.isNone(this.get('selectedMetric')) === false) {
                    this.send('toggleMetricTimeline', this.get('selectedMetric'));
                }
            }
        );
        this.get('shortcutsService').bind(
            'overview.selectLeft',
            () => {
                const items = this.get('metricsData');
                const selection = this.get('selectedMetric');
                if (selection) {
                    const selectedItem = items.findBy('data.name', selection);
                    const itemIndex = items.indexOf(selectedItem);
                    if (itemIndex === 0) {
                        this.send('select', items[items.length - 1].data.name);
                    } else {
                        this.send('select', items[itemIndex - 1].data.name);
                    }
                } else {
                    this.send('select', items[items.length - 1].data.name);
                }

                return false;
            }
        );
        this.get('shortcutsService').bind(
            'overview.selectRight',
            () => {
                const items = this.get('metricsData');
                const selection = this.get('selectedMetric');
                if (selection) {
                    const selectedItem = items.findBy('data.name', selection);
                    const itemIndex = items.indexOf(selectedItem);
                    if (itemIndex === items.length - 1) {
                        this.send('select', items[0].data.name);
                    } else {
                        this.send('select', items[itemIndex + 1].data.name);
                    }
                } else {
                    this.send('select', items[0].data.name);
                }

                return false;
            }
        );
        this.get('shortcutsService').bind(
            'overview.selectDown',
            () => {
                const categories = this.get('categories');
                const selection = this.get('selectedMetric');
                if (selection) {
                    const selectedItem = this.get('metricsData').findBy('data.name', selection);
                    const selectedCategory = categories.findBy('id', selectedItem.data.category);
                    const categoryItemIndex = selectedCategory.metricsData.indexOf(selectedItem);
                    const items = categories
                        .map((category) => category.metricsData[categoryItemIndex])
                        .filter((metric) => metric !== undefined)
                    ;

                    const itemIndex = items.indexOf(selectedItem);
                    if (itemIndex === items.length - 1) {
                        this.send('select', items[0].data.name);
                    } else {
                        this.send('select', items[itemIndex + 1].data.name);
                    }
                } else {
                    this.send('select', this.get('metricsData')[0].data.name);
                }

                return false;
            }
        );
        this.get('shortcutsService').bind(
            'overview.selectUp',
            () => {
                const categories = this.get('categories');
                const selection = this.get('selectedMetric');
                if (selection) {
                    const selectedItem = this.get('metricsData').findBy('data.name', selection);
                    const selectedCategory = categories.findBy('id', selectedItem.data.category);
                    const categoryItemIndex = selectedCategory.metricsData.indexOf(selectedItem);
                    const items = categories
                        .map((category) => category.metricsData[categoryItemIndex])
                        .filter((metric) => metric !== undefined)
                    ;

                    const itemIndex = items.indexOf(selectedItem);
                    if (itemIndex === 0) {
                        this.send('select', items[items.length - 1].data.name);
                    } else {
                        this.send('select', items[itemIndex - 1].data.name);
                    }
                } else {
                    this.send('select', this.get('metricsData')[this.get('metricsData').length - 1].data.name);
                }

                return false;
            }
        );
    },

    willDestroyElement() {
        this.get('shortcutsService').unbind('overview.drilldown');
        this.get('shortcutsService').unbind('overview.toggleTimeline');
    },

    actions: {
        drillDown(metricName) {
            const metric = this.get('metricsData').findBy('data.name', metricName);
            const filter = metric.data.targetViewFilter;
            const nextViewId = metric.data.targetView;
            const drilldownManager = this.get('drilldownManager');
            const drilldownInfo = drilldownManager.drillDown(this.get('drilldownInfo'), metricName, filter, nextViewId);
            this.sendAction('drillDown', drilldownManager.convertToUrl(drilldownInfo));
        },

        toggleMetricTimeline(metricName) {
            this.sendAction('toggleMetricTimeline', metricName);
        },

        select(metricName) {
            this.set('selectedMetric', metricName);
        },
    },
});

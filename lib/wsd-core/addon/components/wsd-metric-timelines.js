import Ember from 'ember';
import layout from '../templates/components/wsd-metric-timelines';

const TIME_SERIES_HEIGHT = 40;
const TIMELINE_HEIGHT = 56;
const LAYOUT_PADDING_V = 8;

export default Ember.Component.extend({
    layout,
    classNames: ['wsd-metric-timelines'],

    filePath: null,
    timelines: null,

    captureSummaryDataService: Ember.inject.service('fetch-capture-summary'),
    layoutProvider: Ember.inject.service('layout-provider'),

    timelinesWidth: 0,
    timeSeriesHeight: TIME_SERIES_HEIGHT,
    canRenderTimelines: false,

    timeWindow: null,

    summaryDataStore: Ember.computed('filePath', 'timelinesWidth', function() {
        const timelinesWidth = this.get('timelinesWidth');

        if (timelinesWidth) {
            const sampleCount = Math.round(timelinesWidth / (4 * 1.4));
            const possibleSampleCount = [4, 5, 8, 10, 16, 20, 25, 40, 50, 80, 100, 200, 400];
            const bestSampleCount = possibleSampleCount.filter((c) => c >= sampleCount)[0] || possibleSampleCount[0];

            return this.get('captureSummaryDataService').fetch(this.get('filePath'), bestSampleCount);
        } else {
            return null;
        }
    }).readOnly(),

    timelinesData: Ember.computed('timelines', 'summaryDataStore.metrics', function() {
        const timelines = this.get('timelines');
        const metrics = this.get('summaryDataStore.metrics');

        if (Ember.isEmpty(timelines) === false && Ember.isEmpty(metrics) === false) {
            return timelines.map((metricName) => metrics.findBy('name', metricName));
        } else {
            return timelines.map((metricName) => ({ name: metricName }));
        }
    }).readOnly(),

    timelinesConfiguration: Ember.computed('timelinesData', function() {
        return this.get('timelinesData').map((timeline, i) => ({
            timeline,
            offsetY: TIMELINE_HEIGHT * i + LAYOUT_PADDING_V,
        }));
    }).readOnly(),

    timelinesHeight: Ember.computed('timelines.length', function() {
        return TIMELINE_HEIGHT * this.get('timelines.length');
    }).readOnly(),

    brushOverlayOffsetY: LAYOUT_PADDING_V,
    brushOverlayHeight: Ember.computed('timelines.length', function() {
        return TIMELINE_HEIGHT * this.get('timelines.length') - LAYOUT_PADDING_V * 2;
    }).readOnly(),

    brushOverlayData: Ember.computed('timelinesData', function() {
        return this.get('timelinesData.0.timeSeries');
    }).readOnly(),

    init() {
        this._super(...arguments);

        this.get('layoutProvider').onLayoutChanged(this, this.calculateTimelinesSize);
    },

    willDestroyElement() {
        this.get('layoutProvider').offLayoutChanged(this, this.calculateTimelinesSize);
    },

    didInsertElement() {
        this.get('layoutProvider').whenSettled(() => this.calculateTimelinesSize());
    },

    didUpdateAttrs() {
        this.get('layoutProvider').whenSettled(() => this.calculateTimelinesSize());
    },

    calculateTimelinesSize() {
        if (this.isDestroying || this.isDestroyed) {
            return;
        }

        const elTimeSeries = document.querySelector(`#${this.get('elementId')} .wsd-metric-timelines__contents`);
        const computedStyle = elTimeSeries.getBoundingClientRect();
        this.setProperties({
            timelinesWidth: computedStyle.width,
            canRenderTimelines: true,
        });
    },
});

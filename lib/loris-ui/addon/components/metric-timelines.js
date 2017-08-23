import Ember from 'ember';
import layout from '../templates/components/metric-timelines';

const TIME_SERIES_HEIGHT = 40;
const TIMELINE_HEIGHT = 56;
const LAYOUT_PADDING_V = 8;

export default Ember.Component.extend({
    layout,
    classNames: ['metric-timelines'],

    timelines: null,

    layoutProvider: Ember.inject.service('layout-provider'),

    timelinesWidth: 0,
    timeSeriesHeight: TIME_SERIES_HEIGHT,
    canRenderTimelines: false,

    timeWindow: null,

    timelinesConfiguration: Ember.computed('timelines', function() {
        return this.get('timelines').map((timeline, i) => ({
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

    brushOverlayData: Ember.computed('timelines', function() {
        return this.get('timelines.0.timeSeries');
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

        const elTimeSeries = document.querySelector(`#${this.get('elementId')} .metric-timelines__contents`);
        const computedStyle = elTimeSeries.getBoundingClientRect();
        this.setProperties({
            timelinesWidth: computedStyle.width,
            canRenderTimelines: true,
        });
    },
});

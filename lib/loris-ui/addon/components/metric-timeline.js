import Ember from 'ember';
import layout from '../templates/components/metric-timeline';

export default Ember.Component.extend({
    layout,
    classNames: ['metric-timeline'],
    layoutProvider: Ember.inject.service('layout-provider'),

    data: null,

    timeSeriesHeight: 40,
    timeSeriesWidth: 140,

    init() {
        this._super(...arguments);

        this.get('layoutProvider').onLayoutChanged(this, this.calculateTimeSeriesWidth);
    },

    willDestroyElement() {
        this.get('layoutProvider').offLayoutChanged(this, this.calculateTimeSeriesWidth);
    },

    didInsertElement() {
        this.get('layoutProvider').whenSettled(() => this.calculateTimeSeriesWidth());
    },

    calculateTimeSeriesWidth() {
        if (this.isDestroying || this.isDestroyed) return;

        const elTimeSeries = document.querySelector(`#${this.get('elementId')} .metric-timeline__time-series`);
        const computedStyle = elTimeSeries.getBoundingClientRect();
        this.set('timeSeriesWidth', computedStyle.width);
    },
});

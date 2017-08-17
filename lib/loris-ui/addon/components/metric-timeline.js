import Ember from 'ember';
import layout from '../templates/components/metric-timeline';

export default Ember.Component.extend({
    layout,
    classNames: ['metric-timeline'],

    data: null,

    timeSeriesHeight: 40,
    timeSeriesWidth: 140,

    didInsertElement() {
        Ember.run.schedule('afterRender', () => {
            const elTimeSeries = document.querySelector(`#${this.get('elementId')} .metric-timeline__time-series`);
            const computedStyle = elTimeSeries.getBoundingClientRect();
            this.set('timeSeriesWidth', computedStyle.width);
        });
    },
});

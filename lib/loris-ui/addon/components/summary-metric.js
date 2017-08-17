import Ember from 'ember';
import layout from '../templates/components/summary-metric';

export default Ember.Component.extend({
    layout,
    classNames: ['summary-metric', 'summary-metric--list'],

    data: null,

    timeSeriesHeight: 40,
    // timeSeriesWidth: 140,

    didInsertElement() {
        Ember.run.schedule('afterRender', () => {
            const elTimeSeries = document.querySelector(`#${this.get('elementId')} .summary-metric__time-series`);
            const computedStyle = elTimeSeries.getBoundingClientRect();
            this.set('timeSeriesWidth', computedStyle.width);
        });
    },
});

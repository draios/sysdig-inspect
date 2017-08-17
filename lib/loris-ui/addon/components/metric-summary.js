import Ember from 'ember';
import layout from '../templates/components/metric-summary';

export default Ember.Component.extend({
    layout,
    classNames: ['metric-summary'],
    classNameBindings: ['isSelected:metric-summary--is-selected'],

    data: null,
    isSelected: false,

    timeSeriesHeight: 30,
    timeSeriesWidth: 140,

    click() {
        this.sendAction('select', this.get('data.name'));
    },
});

import Ember from 'ember';
import layout from '../templates/components/summary-metric';

export default Ember.Component.extend({
    layout,
    classNames: ['summary-metric', 'wsd-card', 'wsd-card--compact', 'wsd-card--can-select'],

    data: null,
});

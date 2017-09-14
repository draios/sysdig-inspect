import Ember from 'ember';

export default Ember.Controller.extend({
    queryParams: {
        drilldownInfoParam: 'dd',
        metricTimelinesParam: 'tl',
        timeFrom: 'f',
        timeTo: 't',
    },

    captureTimelines: Ember.inject.service('capture-timelines'),

    selectedViewId: null,

    filter: null,
    searchPattern: null,

    drilldownInfoParam: null,
    metricTimelinesParam: null,
    timeWindow: Ember.computed('model.queryParams.timeFrom', 'model.queryParams.timeTo', function() {
        if (Ember.isNone(this.get('model.queryParams.timeFrom')) === false && Ember.isNone(this.get('model.queryParams.timeTo')) === false) {
            return {
                from: this.get('model.queryParams.timeFrom'),
                to: this.get('model.queryParams.timeTo'),
            };
        } else {
            return null;
        }
    }).readOnly(),
});

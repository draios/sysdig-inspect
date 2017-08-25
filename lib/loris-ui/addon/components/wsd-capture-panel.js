import Ember from 'ember';
import layout from '../templates/components/wsd-capture-panel';

export default Ember.Component.extend({
    layout,
    classNames: ['wsd-capture-panel'],

    captureSummaryService: Ember.inject.service('fetch-capture-summary'),
    drilldownNavigation: Ember.inject.service('drilldown-navigation'),

    filePath: null,
    drilldownInfo: null,
    timelines: null,
    timeWindow: null,
    selectedViewId: null,

    summaryDataStore: Ember.computed('filePath', function() {
        return this.get('captureSummaryService').fetch(this.get('filePath'));
    }).readOnly(),

    breadcrumbSteps: Ember.computed('selectedViewId', 'drilldownInfo', function() {
        return  this.get('drilldownNavigation').convertFromUrl({
            viewId: this.get('selectedViewId'),
            drilldownInfo: this.get('drilldownInfo'),
        });
    }).readOnly(),

    timelinesData: Ember.computed('timelines', 'summaryDataStore.metrics', function() {
        const timelines = this.get('timelines');
        const metrics = this.get('summaryDataStore.metrics');

        if (Ember.isEmpty(timelines) === false && Ember.isEmpty(metrics) === false) {
            return timelines.map((metricName) => metrics.findBy('name', metricName));
        } else {
            return null;
        }
    }).readOnly(),

    actions: {
        selectView(id) {
            const drilldownNavigation = this.get('drilldownNavigation');
            this.sendAction('navigateTo', drilldownNavigation.convertToUrl([drilldownNavigation.createStep(id)]));
        },
    },
});

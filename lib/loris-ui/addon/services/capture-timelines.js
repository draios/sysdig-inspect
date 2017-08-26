import Ember from 'ember';

export default Ember.Service.extend({
    timelines: null,

    init() {
        this._super(...arguments);

        this.set('timelines', []);
    },

    setCurrent(timelines) {
        this.set('timelines', timelines);
    },

    toggle(metricName) {
        const timelines = this.get('timelines');
        let newTimelines;

        if (timelines.includes(metricName)) {
            newTimelines = timelines.filter((name) => name !== metricName);
        } else {
            newTimelines = [metricName].concat(timelines);
        }

        return newTimelines;
    },

    remove(metricName) {
        const timelines = this.get('timelines');
        let newTimelines;

        if (timelines.includes(metricName)) {
            newTimelines = timelines.filter((name) => name !== metricName);
        } else {
            newTimelines = timelines;
        }

        return newTimelines;
    },

    deserializeFromQueryParam(param) {
        if (Ember.isEmpty(param)) {
            return [];
        } else {
            return param.split(',');
        }
    },

    serializeToQueryParam(timelines) {
        if (Ember.isEmpty(timelines)) {
            return null;
        } else {
            return timelines.join(',');
        }
    },
});

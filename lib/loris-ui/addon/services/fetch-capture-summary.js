/* global oboe */

import Ember from 'ember';

export default Ember.Service.extend({
    fetch(fileName) {
        let url = `/capture/${encodeURIComponent(fileName)}/summary`;

        const promiseState = CaptureSummaryPromiseState.create();

        promiseState.load(
            new Ember.RSVP.Promise((resolve, reject) => {
                oboe(url)
                    .node('slices.*', (data) => {
                        promiseState.completePartialLoad(data);
                    })
                    .done((data) => {
                        promiseState.succeedLoad(data);

                        resolve(promiseState);
                    })
                    .fail((error) => {
                        promiseState.failLoad(error);

                        reject(promiseState);
                    })
                ;
            })
        );
        oboe(url);

        return promiseState;
    },
});

const PromiseState = Ember.Object.extend({
    isLoading: false,
    loadPromise: null,
    hasPartiallyLoaded: false,
    hasLoaded: false,
    hasFailed: false,
    error: null,

    load(promise) {
        this.setProperties({
            isLoading: true,
            loadPromise: promise,
            hasPartiallyLoaded: false,
            hasLoaded: false,
            hasFailed: false,
            error: null,
        });
    },

    completePartialLoad() {
        this.setProperties({
            hasPartiallyLoaded: true,
        });
    },

    succeedLoad() {
        this.setProperties({
            isLoading: false,
            hasPartiallyLoaded: false,
            hasLoaded: true,
        });
    },

    failLoad(error) {
        this.setProperties({
            isLoading: false,
            hasPartiallyLoaded: false,
            hasFailed: true,
            error,
        });
    },
});

const CaptureSummaryPromiseState = PromiseState.extend({
    loadingProgress: 0,
    metrics: null,

    load(promise) {
        this.beginPropertyChanges();

        this.setProperties({
            loadingProgress: 0,
            metrics: null,
        });
        this._super(promise);

        this.endPropertyChanges();
    },

    completePartialLoad(data) {
        this.beginPropertyChanges();

        this.set('loadingProgress', data.progress);
        this._super(data);

        this.endPropertyChanges();
    },

    succeedLoad(data) {
        this.beginPropertyChanges();

        const summaryData = data.slices[data.slices.length - 1].data;
        this.set('metrics', summaryData.map((data) => SummaryMetric.deserialize(data)));
        this._super(data);

        this.endPropertyChanges();
    },
});

class SummaryMetric {
    constructor({
        name,
        description,
        maxValue,
        totalValue,
        timeSeries,
    }) {
        this.name = name;
        this.description = description;
        this.maxValue = maxValue;
        this.totalValue = totalValue;
        this.timeSeries = timeSeries;
    }

    static deserialize(data) {
        return new SummaryMetric({
            name: data.name,
            description: data.desc,
            maxValue: data.data.max,
            totalValue: data.data.tot,
            timeSeries: data.data.timeLine,
        });
    }
}

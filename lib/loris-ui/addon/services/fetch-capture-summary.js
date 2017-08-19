/* global oboe */

import Ember from 'ember';
import PromiseState from '../utils/promise-state';

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
        this.set('metrics', summaryData.metrics.map((data) => SummaryMetric.deserialize(data)));
        this._super(data);

        this.endPropertyChanges();
    },
});

class SummaryMetric {
    constructor({
        name,
        description,
        targetView,
        maxValue,
        totalValue,
        timeSeries,
    }) {
        this.name = name;
        this.description = description;
        this.targetView = targetView;
        this.maxValue = maxValue;
        this.totalValue = totalValue;
        this.timeSeries = timeSeries;
    }

    static deserialize(data) {
        return new SummaryMetric({
            name: data.name,
            description: data.desc,
            targetView: data.targetView,
            maxValue: data.data.max,
            totalValue: data.data.tot,
            timeSeries: data.data.timeLine,
        });
    }
}

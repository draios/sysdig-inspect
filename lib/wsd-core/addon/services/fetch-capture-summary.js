/* global oboe */

import Ember from 'ember';
import PromiseState from '../utils/promise-state';

export default Ember.Service.extend({
    cache: Ember.inject.service('cache'),
    request: Ember.inject.service('request-url'),

    fetch(filePath, sampleCount, timeWindow, debounce = true) {
        const cachedState = this.get('cache').find(getCacheId({ filePath, sampleCount, timeWindow }));
        if (cachedState) {
            return cachedState;
        } else {
            const promiseState = CaptureSummaryPromiseState.create();
            this.get('cache').store(getCacheId({ filePath, sampleCount, timeWindow }), promiseState);

            let urlParams = {
                nTimelineSamples: sampleCount,
            };
            if (timeWindow) {
                // urlParams.filter = `evt.rawtime >= ${timeWindow.from} and evt.rawtime <= ${timeWindow.to}`;
            }
            let url = this.get('request').getURL('summary', filePath, urlParams);

            promiseState.load(
                new Ember.RSVP.Promise((resolve, reject) => {
                    if (debounce) {
                        Ember.run.debounce(null, load, { resolve, reject, promiseState, url }, 600);
                    } else {
                        load({ resolve, reject, promiseState, url });
                    }
                })
            );

            return promiseState;
        }
    },
});

function getCacheId(params) {
    return JSON.stringify(params);
}

function load({ resolve, reject, promiseState, url }) {
    oboe(url)
        .node('slices.*', (data) => {
            Ember.run.schedule('actions', () => {
                promiseState.completePartialLoad(data);
            });
        })
        .done((data) => {
            Ember.run.schedule('actions', () => {
                promiseState.succeedLoad(data);

                resolve(promiseState);
            });
        })
        .fail((error) => {
            Ember.run.schedule('actions', () => {
                promiseState.failLoad(error);

                reject(promiseState);
            });
        })
    ;
}

const CaptureSummaryPromiseState = PromiseState.extend({
    loadingProgress: 0,
    metrics: null,

    resetData() {
        return {
            loadingProgress: 0,
            metrics: null,
            error: null,
        };
    },

    parsePartialData(data) {
        return {
            loadingProgress: data.progress,
        };
    },

    parseData(data) {
        const summaryData = data.slices[data.slices.length - 1].data;
        return {
            loadingProgress: 100,
            metrics: summaryData.metrics.map((data) => SummaryMetric.deserialize(data)),
        };
    },
});

class SummaryMetric {
    constructor() {
        Object.assign(this, ...arguments);
    }

    static deserialize(data) {
        return new SummaryMetric({
            name: data.name,
            description: data.desc,
            category: data.category,
            targetView: data.targetView,
            targetViewFilter: data.targetViewFilter,
            noteworthy: data.noteworthy,
            canBeExcluded: data.excludable,
            maxValue: data.data.max,
            totalValue: data.data.tot,
            timeSeries: data.data.timeLine,
        });
    }
}

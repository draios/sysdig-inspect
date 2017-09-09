/* global oboe */

import Ember from 'ember';
import PromiseState from '../utils/promise-state';

export default Ember.Service.extend({
    cache: Ember.inject.service('cache'),
    apiServerAdapter: Ember.inject.service('api-server-adapter'),
    request: Ember.inject.service('request-url'),
    slowItDown: Ember.inject.service('slow-it-down'),

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
                urlParams.filter = `evt.rawtime >= ${timeWindow.from} and evt.rawtime <= ${timeWindow.to}`;
            }
            let url = this.get('apiServerAdapter').buildURL(this.get('request').getURL('summary', filePath, urlParams));

            promiseState.load(
                new Ember.RSVP.Promise((resolve, reject) => {
                    if (debounce) {
                        Ember.run.debounce(
                            null,
                            load,
                            {
                                resolve,
                                reject,
                                promiseState,
                                url,
                                slowItDown: this.get('slowItDown').createSession(),
                            },
                            600
                        );
                    } else {
                        load({
                            resolve,
                            reject,
                            promiseState,
                            url,
                            slowItDown: this.get('slowItDown').createSession(),
                        });
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

function load({ resolve, reject, promiseState, url, slowItDown }) {
    oboe(url)
        .node('slices.*', (data) => {
            slowItDown.doIt(() => {
                promiseState.completePartialLoad(data);
            });
        })
        .done((data) => {
            slowItDown.doIt(() => {
                promiseState.succeedLoad(data);

                resolve(promiseState);
            });
        })
        .fail((error) => {
            slowItDown.doIt(() => {
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

    isEmpty() {
        return Ember.isEmpty(this.get('metrics'));
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

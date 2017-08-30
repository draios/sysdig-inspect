/* global oboe */

import Ember from 'ember';
import PromiseState from '../utils/promise-state';

export default Ember.Service.extend({
    cache: Ember.inject.service('cache'),

    fetch(filePath, sampleCount, debounce = true) {
        let url = `/capture/${encodeURIComponent(filePath)}/summary`;

        const cachedState = this.get('cache').find(getCacheId({ filePath, sampleCount }));
        if (cachedState) {
            return cachedState;
        } else {
            const promiseState = CaptureSummaryPromiseState.create({ sampleCount });
            this.get('cache').store(getCacheId({ filePath, sampleCount }), promiseState);

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
            Ember.run(() => {
                promiseState.completePartialLoad(data);
            });
        })
        .done((data) => {
            Ember.run(() => {
                promiseState.succeedLoad(data);

                resolve(promiseState);
            });
        })
        .fail((error) => {
            Ember.run(() => {
                promiseState.failLoad(error);

                reject(promiseState);
            });
        })
    ;
}

const CaptureSummaryPromiseState = PromiseState.extend({
    sampleCount: 0,
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
            metrics: summaryData.metrics.map((data) => SummaryMetric.deserialize(data, this.get('sampleCount'))),
        };
    },
});

class SummaryMetric {
    constructor() {
        Object.assign(this, ...arguments);
    }

    static deserialize(data, sampleCount) {
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
            timeSeries: data.data.timeLine.reduce(sampleTimeline.bind(null, sampleCount), []),
        });
    }
}

function sampleTimeline(sampleCount, buffer, datum, timelineIndex, timeline) {
    const sampling = Math.round(timeline.length / sampleCount);
    const bufferIndex = Math.trunc(timelineIndex / sampling);

    if (timelineIndex % sampling === 0) {
        buffer[bufferIndex] = {
            t: datum.t,
            v: datum.v,
        };

        if (bufferIndex > 0) {
            buffer[bufferIndex - 1].v = avg(buffer[bufferIndex - 1].v, sampling);
        }
    } else if (timelineIndex < timeline.length - 1) {
        buffer[bufferIndex].v = buffer[bufferIndex].v + datum.v;
    } else {
        buffer[bufferIndex].v = avg(buffer[bufferIndex].v + datum.v, timelineIndex % sampling);
    }

    return buffer;
}

function avg(sum, count) {
    return sum / count;
}

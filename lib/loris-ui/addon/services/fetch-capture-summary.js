/* global oboe */

import Ember from 'ember';
import PromiseState from '../utils/promise-state';

export default Ember.Service.extend({
    cache: Ember.inject.service('cache'),

    fetch(filePath) {
        let url = `/capture/${encodeURIComponent(filePath)}/summary`;

        const cachedState = this.get('cache').find(getCacheId(filePath));
        if (cachedState) {
            return cachedState;
        } else {
            const promiseState = CaptureSummaryPromiseState.create();
            this.get('cache').store(getCacheId(filePath), promiseState);

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

            return promiseState;
        }
    },

    peekRecord(filePath, metricName) {
        const cachedState = this.get('cache').find(getCacheId(filePath));

        if (cachedState && cachedState.hasLoaded) {
            return cachedState.metrics.findBy('name', metricName);
        } else {
            return undefined;
        }
    },
});

function getCacheId(filePath) {
    return filePath;
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
            timeSeries: data.data.timeLine.reduce(sampleTimeline, []),
        });
    }
}

function sampleTimeline(buffer, datum, timelineIndex, timeline) {
    const sampling = 10;
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

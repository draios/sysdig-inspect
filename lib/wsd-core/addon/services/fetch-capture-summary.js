/*
Copyright (C) 2017 Draios inc.

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License version 2 as
published by the Free Software Foundation.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/* global oboe */

import { isEmpty } from '@ember/utils';

import { debounce } from '@ember/runloop';
import { Promise as EmberPromise } from 'rsvp';
import Service, { inject as service } from '@ember/service';
import PromiseState from '../utils/promise-state';

export default Service.extend({
    cache: service('cache'),
    apiServerAdapter: service('api-server-adapter'),
    request: service('request-url'),
    slowItDown: service('slow-it-down'),

    fetch(throttleTarget, filePath, sampleCount, timeWindow) {
        const cacheId = getCacheId({ filePath, sampleCount, timeWindow });
        const cachedState = this.get('cache').find(cacheId);
        if (cachedState) {
            return cachedState;
        } else {
            const promiseState = CaptureSummaryPromiseState.create();

            let urlParams = {
                sampleCount,
            };
            if (timeWindow) {
                urlParams.filter = `evt.rawtime >= ${timeWindow.from} and evt.rawtime <= ${timeWindow.to}`;
            }
            let url = this.get('apiServerAdapter').buildURL(this.get('request').getURL('summary', filePath, urlParams));

            promiseState.load(
                new EmberPromise((resolve, reject) => {
                    debounce(
                        throttleTarget,
                        loadData,
                        {
                            resolve,
                            reject,
                            promiseState,
                            cacheId,
                            onStartCallback: (p, c) => this.get('cache').store(c, p),
                            url,
                            slowItDown: this.get('slowItDown').createSession(),
                        },
                        300
                    );
                })
            );

            return promiseState;
        }
    },
});

function getCacheId(params) {
    return JSON.stringify(params);
}

function loadData({ resolve, reject, promiseState, cacheId, onStartCallback, url, slowItDown }) {
    onStartCallback(promiseState, cacheId);

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
    info: null,

    resetData() {
        return {
            loadingProgress: 0,
            metrics: null,
            info: null,
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
            info: SummaryInfo.deserialize(summaryData.info, summaryData.metrics),
        };
    },

    isEmpty() {
        return isEmpty(this.get('metrics'));
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
            drillDownKeyField: data.drillDownKey,
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

class SummaryInfo {
    constructor() {
        Object.assign(this, ...arguments);
    }

    static deserialize(data, metrics) {
        //
        // BUG WORKAROUND: As of 0.19.1 sysdig might return endTs = last sample
        // In order to allow the user to interact with timelines to define time selections, endTs
        // MUST always be greater than the last sample timestamp, or in other words all samples
        // must have a duration > 0.
        //
        // When this is not the case, take the last sample and consider a dummy duration of 1ns.
        //
        let lastSampleTimestamp;
        if (isEmpty(metrics) === false) {
            lastSampleTimestamp = metrics[0].data.timeLine[metrics[0].data.timeLine.length - 1].t + 1;
        } else {
            lastSampleTimestamp = data.endTs;
        }

        return new SummaryInfo({
            categories: data.categories,
            duration: data.durationNs,
            from: data.startTs,
            to: Math.max(data.endTs, lastSampleTimestamp),
        });
    }
}

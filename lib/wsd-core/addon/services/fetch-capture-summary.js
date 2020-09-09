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

import Ember from 'ember';
import PromiseState from '../utils/promise-state';
import nanoseconds from 'ui-toolkit/utils/nanoseconds';

export default Ember.Service.extend({
    cache: Ember.inject.service('cache'),
    apiServerAdapter: Ember.inject.service('api-server-adapter'),
    request: Ember.inject.service('request-url'),
    slowItDown: Ember.inject.service('slow-it-down'),

    fetch(throttleTarget, filePath, sampleCount, timeWindow, filter) {
        const cacheId = getCacheId({ filePath, sampleCount, timeWindow, filter });
        const cachedState = this.get('cache').find(cacheId);
        if (cachedState) {
            return cachedState;
        } else {
            const promiseState = CaptureSummaryPromiseState.create();

            let urlParams = {
                sampleCount,
            };
            if (timeWindow && filter) {
                urlParams.filter = `evt.rawtime >= ${timeWindow.from} and evt.rawtime <= ${timeWindow.to} and (${filter})`;
            } else if (timeWindow) {
                urlParams.filter = `evt.rawtime >= ${timeWindow.from} and evt.rawtime <= ${timeWindow.to}`;
            } else if (filter) {
                urlParams.filter = filter;
            }
            let url = this.get('apiServerAdapter').buildURL(this.get('request').getURL('summary', filePath, urlParams));

            promiseState.load(
                new Ember.RSVP.Promise((resolve, reject) => {
                    Ember.run.debounce(
                        throttleTarget,
                        loadData,
                        {
                            resolve,
                            reject,
                            promiseState,
                            cacheId,
                            onStartCallback: (p, c) => this.get('cache').store(c, p),
                            url,
                            headers: this.get('apiServerAdapter.headers'),
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

function loadData({ resolve, reject, promiseState, cacheId, onStartCallback, url, headers, slowItDown }) {
    onStartCallback(promiseState, cacheId);

    oboe({ url, headers })
        .node('slices.*', (data) => {
            slowItDown.doIt(() => {
                promiseState.completePartialLoad(data);
            });
        })
        .done((data) => {
            if (data && data.reason === undefined) {
                slowItDown.doIt(() => {
                    promiseState.succeedLoad(data);

                    resolve(promiseState);
                });
            }
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
        let to;
        if (Ember.isEmpty(metrics) === false) {
            const lastSampleTimestamp = nanoseconds(metrics[0].data.timeLine[metrics[0].data.timeLine.length - 1].t).add('1');
            to = lastSampleTimestamp.isGreaterThan(nanoseconds(data.endTs)) ? lastSampleTimestamp.toString() : data.endTs;
        } else {
            to = data.endTs;
        }

        return new SummaryInfo({
            categories: data.categories,
            duration: data.durationNs,
            from: data.startTs,
            to,
        });
    }
}

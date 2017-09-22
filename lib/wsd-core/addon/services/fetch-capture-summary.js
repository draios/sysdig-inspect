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

export default Ember.Service.extend({
    cache: Ember.inject.service('cache'),
    apiServerAdapter: Ember.inject.service('api-server-adapter'),
    request: Ember.inject.service('request-url'),
    slowItDown: Ember.inject.service('slow-it-down'),

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

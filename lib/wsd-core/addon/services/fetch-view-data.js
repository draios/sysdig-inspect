/* global oboe */

import Ember from 'ember';
import PromiseState from '../utils/promise-state';

export default Ember.Service.extend({
    cache: Ember.inject.service('cache'),
    apiServerAdapter: Ember.inject.service('api-server-adapter'),
    request: Ember.inject.service('request-url'),
    slowItDown: Ember.inject.service('slow-it-down'),

    fetch(filePath, viewId, options) {
        const cachedState = this.get('cache').find(getCacheId(...arguments));
        if (cachedState) {
            return cachedState;
        } else {
            const urlParams = { id: viewId };

            if (Ember.isNone(options.filter) === false) {
                urlParams.filter = options.filter;
            }
            if (Ember.isNone(options.rowId) === false) {
                urlParams.rowNum = options.rowId;
            }
            if (Ember.isNone(options.sortingColumn) === false) {
                urlParams.sortingCol = options.sortingColumn;
            }

            let url = this.get('apiServerAdapter').buildURL(this.get('request').getURL('view', filePath, urlParams));

            const promiseState = BaseDataPromiseState.factory(viewId);
            this.get('cache').store(getCacheId(...arguments), promiseState);

            promiseState.load(
                new Ember.RSVP.Promise((resolve, reject) => {
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
                        300
                    );
                })
            );

            return promiseState;
        }
    },
});

function getCacheId() {
    return JSON.stringify(arguments);
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

const BaseDataPromiseState = PromiseState.extend({
    viewId: null,
    loadingProgress: 0,
    info: null,
    rows: null,

    resetData() {
        return {
            loadingProgress: 0,
            info: null,
            rows: [],
            error: null,
        };
    },

    parsePartialData(data) {
        return {
            loadingProgress: data.progress,
            rows: this.get('rows').concat(this.parseNewData(data.data)),
        };
    },

    parseData(data) {
        const slice = data.slices[data.slices.length - 1];

        return {
            loadingProgress: 100,
            // rows: this.get('rows').concat(this.parseNewData(slice.data)),
            info: this.parseInfo(slice.info),
        };
    },

    parseNewData: null,

    parseInfo() {
        return null;
    },

    isEmpty() {
        return Ember.isEmpty(this.get('rows'));
    },
});

BaseDataPromiseState.reopenClass({
    factory(viewId) {
        let type;
        switch (viewId) {
            case 'echo':
                type = EchoDataPromiseState;
                break;
            case 'dig':
                type = DigDataPromiseState;
                break;
            default:
                type = ViewDataPromiseState;
                break;
        }

        return type.create();
    },
});

const EchoDataPromiseState = BaseDataPromiseState.extend({
    parseNewData(data) {
        return (data || []).map(this.parseDatum);
    },

    parseDatum(datum) {
        return {
            d: [
                datum.c || null,
                datum.p,
                datum.f,
                datum.d,
                datum.l,
                datum.v
            ],
        };
    },
});

const DigDataPromiseState = BaseDataPromiseState.extend({
    parseNewData(data) {
        return (data || []).map(this.parseDatum);
    },

    parseDatum(datum) {
        return {
            d: [
                datum
            ],
        };
    },
});

const ViewDataPromiseState = BaseDataPromiseState.extend({
    parseNewData(data) {
        return data || [];
    },

    parseInfo(info) {
        return {
            legend: info.legend,
            sortingColumn: info.sortingCol,
            appliesTo: info.appliesTo,
            drillDownKeyField: info.drillDownKeyField,
            filterTemplate: info.filterTemplate,
        };
    },
});

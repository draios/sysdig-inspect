/* global oboe */

import Ember from 'ember';
import PromiseState from '../utils/promise-state';

export default Ember.Service.extend({
    cache: Ember.inject.service('cache'),
    apiServerAdapter: Ember.inject.service('api-server-adapter'),
    request: Ember.inject.service('request-url'),
    slowItDown: Ember.inject.service('slow-it-down'),

    fetch(filePath, viewId, options) {
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

        const cachedState = this.get('cache').find(getCacheId(...arguments));
        if (cachedState) {
            return cachedState;
        } else {
            const promiseState = ViewDataPromiseState.create({ viewId });
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

const ViewDataPromiseState = PromiseState.extend({
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
        switch (this.get('viewId')) {
            case 'dig':
            case 'echo': {
                // TODO Evaluate changeing API as data type is inconsistent with other views'
                return {
                    loadingProgress: data.progress,
                    rows: this.get('rows').concat(data.data),
                };
            }
            default: {
                return {
                    loadingProgress: data.progress,
                };
            }
        }
    },

    parseData(data) {
        const slice = data.slices[data.slices.length - 1];

        switch (this.get('viewId')) {
            case 'dig':
            case 'echo': {
                // TODO Evaluate changeing API as data type is inconsistent with other views'
                return {
                    loadingProgress: 100,
                    rows: this.get('rows').concat(slice.data),
                };
            }
            default: {
                return {
                    loadingProgress: 100,
                    info: {
                        legend: slice.info.legend,
                        sortingColumn: slice.info.sortingCol,
                        appliesTo: slice.info.appliesTo,
                        drillDownKeyField: slice.info.drillDownKeyField,
                        filterTemplate: slice.info.filterTemplate,
                    },
                    rows: slice.data,
                };
            }
        }
    },

    isEmpty() {
        return Ember.isEmpty(this.get('rows'));
    },
});

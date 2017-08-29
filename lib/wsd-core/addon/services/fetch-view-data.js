/* global oboe */

import Ember from 'ember';
import PromiseState from '../utils/promise-state';

export default Ember.Service.extend({
    cache: Ember.inject.service('cache'),

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

        const cachedState = this.get('cache').find(getCacheId(...arguments));
        if (cachedState) {
            return cachedState;
        } else {
            const promiseState = ViewDataPromiseState.create({ viewId });
            this.get('cache').store(getCacheId(...arguments), promiseState);

            promiseState.load(
                new Ember.RSVP.Promise((resolve, reject) => {
                    Ember.run.debounce(null, load, { resolve, reject, promiseState, filePath, urlParams }, 300);
                })
            );

            return promiseState;
        }
    },
});

function getCacheId() {
    return JSON.stringify(arguments);
}

function load({ resolve, reject, promiseState, filePath, urlParams }) {
    const encodedParams = encodeURIComponent(JSON.stringify(urlParams));

    oboe(`/capture/${encodeURIComponent(filePath)}/${encodedParams}`)
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

const ViewDataPromiseState = PromiseState.extend({
    viewId: null,
    loadingProgress: 0,
    info: null,
    rows: null,

    resetData() {
        this.beginPropertyChanges();

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
        const hasData = Ember.isEmpty(slice.data) === false;

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
                        legend: hasData ? slice.info.legend : [],
                        sortingColumn: hasData ? slice.info.sortingCol : null,
                        appliesTo: slice.info.appliesTo,
                        filterTemplate: slice.info.filterTemplate,
                    },
                    rows: slice.data,
                };
            }
        }
    },
});

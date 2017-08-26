/* global oboe */

import Ember from 'ember';
import PromiseState from '../utils/promise-state';

export default Ember.Service.extend({
    fetch(filePath, viewId, timeWindow, filter, rowId, sortingColumn) {
        const urlParams = { id: viewId };

        urlParams.filter = buildFilter(filter, viewId, timeWindow);
        if (Ember.isNone(rowId) === false) {
            urlParams.rowNum = rowId;
        }
        if (Ember.isNone(sortingColumn) === false) {
            urlParams.sortingCol = sortingColumn;
        }

        const promiseState = ViewDataPromiseState.create({ viewId });

        promiseState.load(
            new Ember.RSVP.Promise((resolve, reject) => {
                Ember.run.debounce(null, load, { resolve, reject, promiseState, filePath, urlParams }, 300);
            })
        );

        return promiseState;
    },
});

function load({ resolve, reject, promiseState, filePath, urlParams }) {
    const encodedParams = encodeURIComponent(JSON.stringify(urlParams));
    oboe(`/capture/${encodeURIComponent(filePath)}/${encodedParams}`)
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
}

function buildFilter(filter, viewId, timeWindow) {
    let completeFilter;
    switch (viewId) {
        case 'dig':
            if (Ember.isNone(filter)) {
                completeFilter = 'evt.type != switch';
            } else {
                completeFilter = `evt.type != switch and ${filter}`;
            }
            break;
        default:
            completeFilter = filter;
    }

    if (Ember.isNone(completeFilter) === false) {
        if (Ember.isNone(timeWindow) === false) {
            return `evt.rawtime >= ${timeWindow.from} and evt.rawtime <= ${timeWindow.to} and (${completeFilter})`;
        } else {
            return completeFilter;
        }
    } else if (Ember.isNone(timeWindow) === false) {
        return `evt.rawtime >= ${timeWindow.from} and evt.rawtime <= ${timeWindow.to}`;
    }

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
            rows: null,
            error: null,
        };
    },

    parsePartialData(data) {
        return {
            loadingProgress: data.progress,
        };
    },

    parseData(data) {
        const slice = data.slices[data.slices.length - 1];
        const hasData = Ember.isEmpty(slice.data) === false;

        switch (this.get('viewId')) {
            case 'dig': {
                // TODO Evaluate changeing API as data type is inconsistent with other views'
                return {
                    loadingProgress: 100,
                    info: {
                        legend: [{ name: 'EVENTS' }],
                        sortingColumn: 0,
                    },
                    rows: slice.data.map((row) => ({
                        d: [row],
                    })),
                };
            }
            default: {
                return {
                    loadingProgress: 100,
                    info: {
                        legend: hasData ? slice.info.legend : [],
                        sortingColumn: hasData ? slice.info.sortingCol : null,
                    },
                    rows: slice.data,
                };
            }
        }
    },
});

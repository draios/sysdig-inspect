/* global oboe */

import Ember from 'ember';
import PromiseState from '../utils/promise-state';

export default Ember.Service.extend({
    fetch(filePath, viewId, filter, rowId, sortingColumn) {
        const urlParams = { id: viewId };
        if (Ember.isNone(filter) === false) {
            urlParams.filter = filter;
        }
        if (Ember.isNone(rowId) === false) {
            urlParams.rowNum = rowId;
        }
        if (Ember.isNone(sortingColumn) === false) {
            urlParams.sortingCol = sortingColumn;
        }

        const encodedParams = encodeURIComponent(JSON.stringify(urlParams));

        const promiseState = ViewDataPromiseState.create({ viewId });

        promiseState.load(
            new Ember.RSVP.Promise((resolve, reject) => {
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
            })
        );

        return promiseState;
    },
});

const ViewDataPromiseState = PromiseState.extend({
    loadingProgress: 0,
    viewId: null,
    info: null,
    rows: null,

    load(promise) {
        this.beginPropertyChanges();

        this.setProperties({
            loadingProgress: 0,
            info: null,
            rows: null,
        });
        this._super(promise);

        this.endPropertyChanges();
    },

    completePartialLoad(data) {
        this.beginPropertyChanges();

        this.set('loadingProgress', data.progress);
        this._super(data);

        this.endPropertyChanges();
    },

    succeedLoad(data) {
        this.beginPropertyChanges();

        this.setProperties(
            Object.assign(
                {
                    loadingProgress: 100,
                },
                this.parseData(data)
            )
        );
        this._super(data);

        this.endPropertyChanges();
    },

    parseData(data) {
        const slice = data.slices[data.slices.length - 1];

        switch (this.get('viewId')) {
        case 'dig': {
            // TODO Evaluate changeing API as data type is inconsistent with other views'
            return {
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
                info: {
                    legend: slice.info.legend,
                    sortingColumn: slice.info.sortingCol,
                },
                rows: slice.data,
            };
        }
        }
    },
});


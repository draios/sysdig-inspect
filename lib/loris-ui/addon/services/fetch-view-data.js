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

        const promiseState = ViewDataPromiseState.create();

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
    info: null,
    rows: null,

    load(promise) {
        this.beginPropertyChanges();

        this.setProperties({
            info: null,
            rows: null,
        });
        this._super(promise);

        this.endPropertyChanges();
    },

    succeedLoad(data) {
        this.beginPropertyChanges();

        const slice = data.slices[data.slices.length - 1];
        this.setProperties({
            info: slice.info,
            rows: slice.data,
        });
        this._super(data);

        this.endPropertyChanges();
    },
});


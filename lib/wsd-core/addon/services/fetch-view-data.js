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

import { debounce } from '@ember/runloop';

import { Promise as EmberPromise } from 'rsvp';
import { isNone, isEmpty } from '@ember/utils';
import Service, { inject as service } from '@ember/service';
import PromiseState from '../utils/promise-state';

const MAX_ROW_COUNT = 3000;

export default Service.extend({
    cache: service('cache'),
    apiServerAdapter: service('api-server-adapter'),
    request: service('request-url'),
    slowItDown: service('slow-it-down'),

    fetch(filePath, viewId, options) {
        const cacheId = getCacheId(...arguments);
        const cachedState = this.get('cache').find(cacheId);
        if (cachedState) {
            return cachedState;
        } else {
            const urlParams = { id: viewId };

            if (isNone(options.filter) === false) {
                urlParams.filter = options.filter;
            }
            if (isNone(options.rowId) === false) {
                urlParams.rowNum = options.rowId;
            }
            if (isNone(options.sortingColumn) === false) {
                urlParams.sortingCol = options.sortingColumn;
            }
            if (isNone(options.viewAs) === false) {
                urlParams.viewAs = serializeViewAs(options.viewAs);
            }

            let url = this.get('apiServerAdapter').buildURL(this.get('request').getURL('view', filePath, urlParams));

            const promiseState = BaseDataPromiseState.factory(viewId);

            promiseState.load(
                new EmberPromise((resolve, reject) => {
                    debounce(
                        null,
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

export const dataStoreConstants = {
    VIEW_AS_PRINTABLE_ASCII: 'VIEW_AS_PRINTABLE_ASCII',
    VIEW_AS_DOTTED_ASCII: 'VIEW_AS_DOTTED_ASCII',
    VIEW_AS_HEX_ASCII: 'VIEW_AS_HEX_ASCII',
};

function getCacheId() {
    return JSON.stringify(arguments);
}

function serializeViewAs(viewAs) {
    switch (viewAs) {
        case dataStoreConstants.VIEW_AS_HEX_ASCII:
            return 'Hex';
        case dataStoreConstants.VIEW_AS_DOTTED_ASCII:
            return 'dottedAscii';
        default:
            return 'printableAscii';
    }
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
            rowCount: 0,
            error: null,
        };
    },

    parsePartialData(data) {
        const currentLength = this.get('rows.length');
        const moreLength = isEmpty(data.data) == false ? data.data.length : 0;
        const addLength = Math.min(MAX_ROW_COUNT - (currentLength + moreLength), moreLength);

        return {
            loadingProgress: data.progress,
            rows: addLength > 0 ? this.get('rows').concat(this.parseNewData(data.data.slice(0, addLength))) : this.get('rows'),
        };
    },

    parseData(data) {
        const slice = data.slices[data.slices.length - 1];

        return {
            loadingProgress: 100,
            rowCount: slice.count || this.get('rows.length') || 0,
            info: this.parseInfo(slice.info),
        };
    },

    parseNewData: null,

    parseInfo() {
        return null;
    },

    isEmpty() {
        return isEmpty(this.get('rows'));
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
            legend: info.legend.map((item) => ({
                name: item.name,
                dataType: item.type,
                formatType: item.format,
                size: item.size,
            })),
            sortingColumn: info.sortingCol,
            appliesTo: info.appliesTo,
            drillDownKeyField: info.drillDownKeyField,
            filterTemplate: info.filterTemplate,
        };
    },
});

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

import Ember from 'ember';

export default Ember.Service.extend({
    apiServerAdapter: Ember.inject.service('api-server-adapter'),

    getURL(type, filePath, params) {
        if (Ember.isEmpty(type)) {
            throw new Ember.Error('specify a request type [views, summary, view]');
        }

        if (Ember.isEmpty(filePath)) {
            throw new Ember.Error('capture path/id could not be empty');
        }

        const base = this._getPath();
        const urlPath = `${base}/${encodeURIComponent(filePath)}`;

        if (type === 'summary') {
            // `/api/sysdig/CAPTURE_ID/summary`
            if (params) {
                const encodedParams = Object.keys(params)
                    .map((k) => `${k}=${encodeURIComponent(params[k])}`)
                    .join('&')
                ;
                return `${urlPath}/summary?${encodedParams}`;
            } else {
                return `${urlPath}/summary`;
            }
        } else if (type === 'views') {
            return `${base}/views`;
        } else if (type === 'view') {
            return this._getViewUrl(urlPath, params);
        } else {
            throw new Ember.Error('request type not valid. use [views, summary, view]');
        }
    },

    _getViewUrl(urlPath, params) {
        if (Ember.isNone(params) || 'id' in params === false) {
            throw new Ember.Error('parameter must be a valid object with an id inside');
        }

        switch (this.get('apiServerAdapter.configTarget')) {
            case 'ELECTRON':
            case 'WEB': {
                const encodedParams = encodeURIComponent(JSON.stringify(params));
                return `${urlPath}/${encodedParams}`;
            }
            default: {
                const keyFilters = ['filter', 'viewAs'];
                const viewId = params.id;
                const qString = toQueryString(params, keyFilters);

                return `${urlPath}/views/${encodeURIComponent(viewId)}?${qString}`;
            }
        }
    },

    _getPath() {
        switch (this.get('apiServerAdapter.configTarget')) {
            case 'ELECTRON':
            case 'WEB':
                return '/capture';
            default:
                return '';
        }
    },
});

//
// Returns a formatted query string filtering by keys.
//
//     toQueryString({id:true, foo:1, bar:2}, ['foo', 'bar'])
//     foo=1&bar=2
//
function toQueryString(paramsObject, filters) {
    return Object
        .keys(paramsObject)
        .filter((key) => filters.includes(key))
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(paramsObject[key])}`)
        .join('&');
}

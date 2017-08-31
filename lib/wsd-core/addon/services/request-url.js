import Ember from 'ember';

export default Ember.Service.extend({
    electronPath: '/capture',
    securePath: '/api/sysdig',

    config: Ember.computed(function() {
        return Ember.getOwner(this).factoryFor('config:environment').class;
    }),

    getURL(type, filePath, params) {
        if (Ember.isEmpty(type)) {
            throw new Ember.Error('specify a request type [views, summary, view]');
        }

        if (Ember.isEmpty(filePath)) {
            throw new Ember.Error('capture path/id could not be empty');
        }

        const base = this._getPath();                               // `/api/sysdig` or `/capture`
        const urlPath = `${base}/${encodeURIComponent(filePath)}`; // `/api/sysdig/CAPTURE_ID`

        if (type === 'summary') {
            return `${urlPath}/summary`;    // `/api/sysdig/CAPTURE_ID/summary`
        }
        else if (type === 'views') {
            return `${base}/views`;         // `/api/sysdig/views`
        }
        else if (type === 'view') {
            return this._getViewUrl(urlPath, params);
        }
        else {
            throw new Ember.Error('request type not valid. use [views, summary, view]');
        }
    },

    _getViewUrl(urlPath, params) {
        if (Ember.isNone(params) || 'id' in params === false) {
            throw new Ember.Error('parameter must be a valid object with an id inside');
        }

        let env = this.get('config.targetEnv');

        if (env === 'electron') {
            let encodedParams = encodeURIComponent(JSON.stringify(params));
            return `${urlPath}/${encodedParams}`;   // `/capture/CAPTURE_PATH/VIEW_OBJ`
        }
        else if (env === 'secure') {
            const keyFilters = ['filter', 'from', 'to'];
            const viewId = params.id;
            let qString = toQueryString(params, keyFilters);

            return `${urlPath}/views/${encodeURIComponent(viewId)}?${qString}`     // `/api/sysdig/CAPTURE_ID/views/VIEW_ID`
        }
    },

    _getPath() {
        let env = this.get('config.targetEnv');

        if (Ember.isNone(env)) {
            throw new Ember.Error('request-url:service requires a targetEnv specification in config/environment.');
        }

        if (env === 'electron') {
            return this.get('electronPath');
        } else if (env === 'secure') {
            return this.get('securePath');
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
        .filter(key => filters.includes(key))
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(paramsObject[key])}`)
        .join('&');
}

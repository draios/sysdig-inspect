/* eslint-env node */
'use strict';

module.exports = {
    name: 'wsd-core',

    isDevelopingAddon() {
        return true;
    },

    included(app, parentAddon) {
        var target = (parentAddon || app);
        target.options = target.options || {};
        target.options.babel = target.options.babel || { includePolyfill: true };
        this._super.included.apply(this, arguments);

        app.import(__dirname + '/bower_components/oboe/dist/oboe-browser.js');
        app.import(__dirname + '/bower_components/axios/dist/axios.js');
    },
};

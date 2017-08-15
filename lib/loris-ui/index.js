/* eslint-env node */
'use strict';

module.exports = {
    name: 'loris-ui',

    isDevelopingAddon() {
        return true;
    },

    included(app, parentAddon) {
        var target = (parentAddon || app);
        target.options = target.options || {};
        target.options.babel = target.options.babel || { includePolyfill: true };
        this._super.included.apply(this, arguments);

        app.import(__dirname + '/bower_components/d3/d3.js');
        app.import(__dirname + '/bower_components/moment/moment.js');
        app.import(__dirname + '/bower_components/oboe/dist/oboe-browser.js');
    },
};

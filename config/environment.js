/* eslint-env node */
'use strict';

module.exports = function(environment) {
    const userTrackingKeyIndex = process.argv.indexOf('--user-tracking-key');
    const userTrackingKey = userTrackingKeyIndex >= 0 ? process.argv[userTrackingKeyIndex + 1] : null;

    let ENV = {
        targetEnv: 'electron',
        modulePrefix: 'sysdig-inspect',
        environment,
        rootURL: '/',
        locationType: 'hash',
        EmberENV: {
            FEATURES: {
                // Here you can enable experimental features on an ember canary build
                // e.g. 'with-controller': true
            },
            EXTEND_PROTOTYPES: {
                // Prevent Ember Data from overriding Date.parse.
                Date: false
            }
        },

        APP: {
            // Here you can pass flags/options to your application instance
            // when it is created
            USER_TRACKING_KEY: userTrackingKey || 'WT6G8p7jNZkbrRp6fcUFjiMyA8qZj7C9',
        }
    };

    if (environment === 'development') {
        // ENV.APP.LOG_RESOLVER = true;
        // ENV.APP.LOG_ACTIVE_GENERATION = true;
        // ENV.APP.LOG_TRANSITIONS = true;
        // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
        // ENV.APP.LOG_VIEW_LOOKUPS = true;
    }

    if (environment === 'test') {
        // Testem prefers this...
        ENV.locationType = 'none';

        // keep test console output quieter
        ENV.APP.LOG_ACTIVE_GENERATION = false;
        ENV.APP.LOG_VIEW_LOOKUPS = false;

        ENV.APP.rootElement = '#ember-testing';
    }

    if (environment === 'production') {

    }

    return ENV;
};

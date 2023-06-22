'use strict';

module.exports = function(environment) {
//<<<<<<< HEAD
    const rootURLParamIndex = process.argv.indexOf('--root-url');
    const rootURL = rootURLParamIndex >= 0 ? process.argv[rootURLParamIndex + 1] : '/';
//=======
//  let ENV = {
//    modulePrefix: 'sysdig-inspect',
//    environment,
//    rootURL: '/',
//    locationType: 'auto',
//    EmberENV: {
//      FEATURES: {
//        // Here you can enable experimental features on an ember canary build
//        // e.g. EMBER_NATIVE_DECORATOR_SUPPORT: true
//      },
//      EXTEND_PROTOTYPES: {
//        // Prevent Ember Data from overriding Date.parse.
//        Date: false
//      }
//    },
//>>>>>>> bd341dc (v3.4.4...v3.12.1)

    const targetEnvParamIndex = process.argv.indexOf('--target-env');
    const targetEnv = targetEnvParamIndex >= 0 ? process.argv[targetEnvParamIndex + 1] : 'electron';

    const userTrackingKeyIndex = process.argv.indexOf('--user-tracking-key');
    const userTrackingKey = userTrackingKeyIndex >= 0 ? process.argv[userTrackingKeyIndex + 1] : null;

    let ENV = {
        targetEnv,
        modulePrefix: 'sysdig-inspect',
        environment,
        rootURL: rootURL,
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
            USER_TRACKING_KEY: userTrackingKey,
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

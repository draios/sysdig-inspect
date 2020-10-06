/* eslint-env node */
'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
    let app = new EmberApp(defaults, {
        svgJar: {
            sourceDirs: [
                'lib/ui-toolkit/addon/icons'
            ]
        }
    });

    // Use `app.import` to add additional libraries to the generated
    // output files.
    //
    // If you need to use different assets in different
    // environments, specify an object as the first parameter. That
    // object's keys should be the environment name and the values
    // should be the asset to use in that environment.
    //
    // If the library that you are including contains AMD or ES6
    // modules that you would like to import into your application
    // please specify an object with the list of modules as keys
    // along with the exports of each module as its value.

    app.import(app.bowerDirectory + '/d3/d3.js');
    app.import(app.bowerDirectory + '/mousetrap/mousetrap.js');
    app.import(app.bowerDirectory + '/normalize-css/normalize.css');
    app.import(app.bowerDirectory + '/oboe/dist/oboe-browser.js');
    app.import(app.bowerDirectory + '/js-cookie/src/js.cookie.js', {
        using: [
            { transformation: 'amd', as: 'js-cookie' }
        ],
    });

    return app.toTree();
};

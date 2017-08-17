/* eslint-env node */
'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
var funnel = require('broccoli-funnel');
var mergeTrees = require('broccoli-merge-trees');

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

    app.import(app.bowerDirectory + '/normalize-css/normalize.css');

    var fontawesome = new funnel('bower_components/font-awesome/fonts', {
        srcDir: '/',
        destDir: 'fonts'
    });

    var merged = mergeTrees([app.toTree(), fontawesome], {
        overwrite: true
    });

    return app.toTree(merged);
};

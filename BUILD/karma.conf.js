// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html
'use strict';

module.exports = function (config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '',

        // testing framework to use (jasmine/mocha/qunit/...)
        frameworks: ['mocha', 'sinon-chai', 'chai'],

        // list of files / patterns to load in the browser
        files: [
            'node_modules/es5-shim/es5-shim.js',
            'dev/assets/vendor.js',
            'dev/assets/bundle.js',
            'node_modules/angular-mocks/angular-mocks.js',
            'node_modules/norman*client/tests/**/*.spec.js',

            { pattern: 'dev/assets/bundle.js.map', watched: false, included: false, served: true }
        ],

        preprocessors: {},

        // list of files / patterns to exclude
        exclude: [],

        // web server port
        port: 8080,

        // level of logging: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: 'INFO',

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['PhantomJS'],


        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false
    });
};

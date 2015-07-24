// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html
'use strict';

module.exports = function (config) {
    config.set({
        // base path, that will be used to resolve files and exclude
        basePath: '',

        frameworks: ['mocha', 'chai', 'sinon-chai'],

        // list of files / patterns to load in the browser
        files: [
            'node_modules/es5-shim/es5-shim.js',
            'dev/assets/vendor.js',
            'dev/assets/bundle.js',
            'node_modules/angular-mocks/angular-mocks.js',
            'client/tests/*.spec.js',
            'dev/resources/**/*.html'
        ],

        preprocessors: {
            'dev/resources/!{norman-ui-composer-client}/*.html': 'html2js'
        },

        ngHtml2JsPreprocessor: {
            // strip this from the file path
            stripPrefix: 'client/',
            prependPrefix: 'node_modules/norman-projects-client/',
            // setting this option will create only a single module that contains templates
            // from all the files, so you can load them all with module('foo')
            moduleName: 'templates'
        },

        // list of files / patterns to exclude
        exclude: [
            'node_modules/norman*client/node_modules/**/*.js'
        ],

        // test results reporter to use
        // possible values: 'dots', 'progress', 'junit'
        reporters: ['progress', 'junit', 'coverage'],

        coverageReporter: {
            reporters: [
                {type: 'html', dir: 'reports/coverage/'},
                {type: 'lcovonly', dir: 'reports/coverage/clientTmp'},
                {type: 'cobertura', dir: 'reports/coverage/'},
                {type: 'text-summary', dir: 'reports/coverage/'}
            ]
        },

        // the default configuration
        junitReporter: {
            outputFile: 'reports/junit/TESTS-Client-all.xml'
        },

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // web server port
        port: 8080,

        // level of logging: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
        logLevel: config.LOG_INFO,

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

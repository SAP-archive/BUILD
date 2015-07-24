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

            'client/tests/*.spec.js',
            'dev/resources/**/*.html'
        ],

        preprocessors: {
            'dev/resources/**/*.html': 'html2js'
        },


        reporters: ['progress', 'junit', 'coverage'],

        coverageReporter: {
            reporters: [
                { type: 'html', dir: 'reports/coverage/' },
                { type: 'lcovonly', dir: 'reports/coverage/clientTmp' }
            ]
        },

        // junit reporter
        junitReporter: { outputFile: 'reports/junit/TESTS-Client-all.xml' },

        // list of files / patterns to exclude
        exclude: [],

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // web server port
        port: 8080,

        // config { LOG_DISABLE, LOG_ERROR, LOG_WARN, LOG_INFO, LOG_DEBUG }
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

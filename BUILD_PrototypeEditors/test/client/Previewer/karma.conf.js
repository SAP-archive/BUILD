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
            'dev/assets/bundle.js',
            'node_modules/angular-mocks/angular-mocks.js',
            'node_modules/norman-prototype-editors-client/Previewer/**/*.spec.js',
            'node_modules/norman-prototype-editors-client/Previewer/**/*controller.js'
    ],

    reporters: ['progress', 'junit', 'coverage'],

    preprocessors: {
        'client/**/!(*spec).js': ['coverage'],
        'server/**/!(*spec).js': ['coverage']
    },

    coverageReporter: {
        dir : 'reports/coverage/',
        reporters: [
            { type: 'lcovonly', subdir: './clientTmp/Previewer/' },
            { type: 'cobertura', subdir: './client/Previewer/' },
            { type: 'text-summary', subdir: './client/Previewer/' }
        ]
    },

    junitReporter: {
        outputFile: 'reports/junit/TESTS-Client-Previewer.xml'
    },

    // list of files / patterns to exclude
    exclude: [
    ],

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

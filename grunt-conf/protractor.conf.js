// Protractor configuration
// https://github.com/angular/protractor/blob/master/referenceConf.js

'use strict';

var port = require('../server/config.json').http.port;

exports.config = {
    // The timeout for each script run on the browser. This should be longer
    // than the maximum time your application needs to stabilize between tasks.
    allScriptsTimeout: 10000,

    // A base URL for your application under test. Calls to protractor.get()
    // with relative paths will be prepended with this.
    baseUrl: 'http://localhost:'+port,

    // If true, only chromedriver will be started, not a standalone selenium.
    // Tests for browsers other than chrome will not run.
    directConnect: true,

    chromeDriver:'../node_modules/norman-testing-tp-client/node_modules/chromedriver/lib/chromedriver/chromedriver',

    // list of files / patterns to load in the browser
    //specs: 'node_modules/*e2e/e2e/testcases/*.feature',

    // Patterns to exclude.
    exclude: [],

    // ----- Capabilities to be passed to the webdriver instance ----
    //
    // For a full list of available capabilities, see
    // https://code.google.com/p/selenium/wiki/DesiredCapabilities
    // and
    // https://code.google.com/p/selenium/source/browse/javascript/webdriver/capabilities.js
    capabilities: {
        'browserName': 'chrome',
        'chromeOptions': {
            'args':["--disable-web-security", "--allow-running-insecure-content",  "--test-type"] }

    },

    // ----- The test framework -----
    //
    // Jasmine and Cucumber are fully supported as a test and assertion framework.
    // Mocha has limited beta support. You will need to include your own
    // assertion framework if working with mocha.
    framework: 'cucumber',

    specs: ['../test/e2e/testcases/*.feature'],
    cucumberOpts: {
        require: '../node_modules/norman-*e2e/**/testcases/steps/*.steps.js',
        format: 'pretty'
    }
};

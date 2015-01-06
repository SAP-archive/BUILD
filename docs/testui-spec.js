'use strict'

// browser variable is the browser that has been instantiated is the 'webdriver' section of the Gruntfile.js file

var chai = require('chai');
var localConfig = require('../../../server/config/local.env');

var assert = chai.assert;
var should = chai.should();

// Test suite
describe('webdriverio tests', function () {
        this.timeout(99999999);
        var localurl = (localConfig.DOMAIN + '/projects').toString();

        // called before each test
        beforeEach(function (done) {

                console.log('Connecting to :' + localurl);
                // Open the designated page and maximize the browser window
                browser
                    .url(localurl)
                    .windowHandleMaximize()
                    .pause(5000)
                    .call(done);
            }
        );

        var appCountBefore = {};
        var appCountAfter = {};

        // first test
        it('add an app', function (done) {
                browser
                    // Count projectItemImage-class elements at the beginning
                    .elements('.projectItemImage', function (err, res) {
                        appCountBefore = res.value.length;
                        console.log("App count at the beginning: " + appCountBefore);
                    }
                )
                    // wait for addNewBtn-id button to appear
                    .waitFor('//*[@id="addNewBtn"]', 5000, function (err, res) {
                        console.log("'Add New' button displayed");
                    }
                )
                    // click on addNewBtn-id button
                    .click('//*[@id="addNewBtn"]', function (err, res) {
                        assert.equal(err, undefined, "No error");
                        console.log("Clicked on 'Add New' button");
                    }
                )
                    // wait for SaveBtn-id button to appear
                    .waitFor('//*[@id="SaveBtn"]', 5000, function (err, res) {
                        console.log("'Save' button displayed");
                    }
                )
                    // click on SaveBtn-id button
                    .click('//*[@id="SaveBtn"]', function (err, res) {
                        assert.equal(err, undefined, "No error");
                        console.log("Clicked on 'Save' button");
                    }
                )
                    // wait for addNewBtn-id button to appear
                    .waitFor('//*[@id="addNewBtn"]', 5000, function (err, res) {
                        console.log("'Add New' button displayed");
                    }
                )
                    // wait for a projectItemImage-class objectto appear
                    .waitFor('.projectItemImage', 5000, function (err, res) {
                    }
                )
                    // Count projectItemImage-class elements at the end
                    .elements('.projectItemImage', function (err, res) {
                        appCountAfter = res.value.length;
                        console.log("App count at the end: " + appCountAfter);
                        assert.equal(appCountAfter, appCountBefore + 1, "One app has been added!");
                    }
                )
                    // take a picture before to close the application
                    .saveScreenshot("test/results/client/ui/screenshot.png")

                    .call(done);

            }
        );


        // second test
        it('check app count', function (done) {
                browser
                    // check projectItemImage-class elements at the end
                    .elements('.projectItemImage', function (err, res) {
                        assert.equal(res.value.length, appCountAfter, "The application count should be the same");
                    }
                )
                    .call(done);


            }
        );

        // called at the end of test suite
        after(function (done) {
                browser.end(done);
            }
        )

    }
);



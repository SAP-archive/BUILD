'use strict';


var PageFlow = require('../../pageobjects/pageflow.po.js');
var chai = require('norman-testing-tp').chai;
var assert = chai.assert;
var chaiAsPromised = require('norman-testing-tp')['chai-as-promised'];
chai.use(chaiAsPromised);
var expect = chai.expect;
var path = require('path');

var pageFlowPage = new PageFlow('');

module.exports = function () {

    /**
     * Check the page flow page is displayed *
     */
    this.Given(/^Page Flow page is displayed$/, function (callback) {
        browser.waitForAngular();
        expect(pageFlowPage.page).to.exist.and.notify(callback);
    });

    /**
     * Click on Generate Flow button*
     */
    this.Then(/^I click on Generate Flow$/, function (callback) {
        browser.waitForAngular();
        pageFlowPage.clickGenerateFlow();
        browser.waitForAngular();
        callback();
    });

    /**
     * Click on run button*
     */
    this.Then(/^I click on Run$/, function (callback) {
        browser.waitForAngular();
        pageFlowPage.clickRunApp();
        browser.waitForAngular();
        callback();
    });

    /**
     * Choose Master Detail in Read Only option and click on Generate button*
     */
    this.Then(/^I choose Master Detail in Read Only and click on Generate$/, function (callback) {
        browser.waitForAngular();
        pageFlowPage.clickMasterDetailInReadOnly();
        browser.waitForAngular();
        pageFlowPage.clickGenerate();
        browser.waitForAngular();
        callback();
    });

    /**
     * Choose Master Detail in Edition option and click on Generate button*
     */
    this.Then(/^I choose Master Detail in Edition and click on Generate$/, function (callback) {
        browser.waitForAngular();
        pageFlowPage.clickMasterDetailInEdition();
        browser.waitForAngular();
        pageFlowPage.clickGenerate();
        browser.waitForAngular();
        callback();
    });

    /**
     * Choose Object Page option and click on Generate button*
     */
    this.Then(/^I choose Object Page and click on Generate$/, function (callback) {
        browser.waitForAngular();
        pageFlowPage.clickMasterDetailInEdition();
        browser.waitForAngular();
        pageFlowPage.clickObjectPage();
        browser.waitForAngular();
        callback();
    });

    this.Then(/^I check a new Tab exists$/, function (callback) {
//        browser.ignoreSynchronization = true;
        browser.driver.getAllWindowHandles().then(function (handles) {
            var newWindowHandle = handles[1];
            browser.switchTo().window(newWindowHandle).then(function () {
//                browser.ignoreSynchronization = false;
                browser.driver.getCurrentUrl().then(function (value) {
                    expect(value).to.have.string('http://localhost:9000/api/preview/'); // http://localhost:9000/api/preview/70f046b3197ccd0209c32227#/route12/SalesOrderSet('SO0001')
                });
            });
            callback();
        });


    });
};

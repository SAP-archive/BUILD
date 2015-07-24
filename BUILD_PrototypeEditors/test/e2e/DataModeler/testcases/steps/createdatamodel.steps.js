'use strict';


var CreateDataModel = require('../../pageobjects/createdatamodel.po.js');
var chai = require('norman-testing-tp').chai;
var chaiAsPromised = require('norman-testing-tp')['chai-as-promised'];
chai.use(chaiAsPromised);
var expect = chai.expect;

var createDataModelPage = new CreateDataModel('');

module.exports = function () {

    this.Given(/^The create model page is displayed$/, function (callback) {
        browser.waitForAngular();
        browser.driver.wait(function() {
            return browser.driver.isElementPresent(by.css(".dm-main-container"));
        });
        expect(createDataModelPage.page.isEnabled()).to.eventually.equal(true).and.notify(callback);
    });

    this.Then(/^I close the toaster Message if it exists$/, function (callback) {
        if (createDataModelPage.toaster != undefined) {
            createDataModelPage.closeToaster();
        }
        callback();
    });

    this.Then(/^I click on Create New Object$/, function (callback) {
        createDataModelPage.clickCreateNew();
        browser.waitForAngular();
        //browser.sleep(1000);
        callback();
    });

    this.Then(/^I click on Search Model$/, function (callback) {
        createDataModelPage.clickSearch();
        browser.waitForAngular();
        //browser.sleep(1000);
        callback();
    });
};

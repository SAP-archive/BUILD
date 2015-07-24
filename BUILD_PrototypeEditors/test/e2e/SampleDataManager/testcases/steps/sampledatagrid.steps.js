var SampleDataGrid = require('../../pageobjects/sampledatagrid.po.js');
var chai = require('norman-testing-tp').chai;
var assert = chai.assert;
var chaiAsPromised = require('norman-testing-tp')['chai-as-promised'];
chai.use(chaiAsPromised);
var expect = chai.expect;
var path = require('path');

var sampleDataGridPage = new SampleDataGrid('');

module.exports = function () {

    /**
     * Check the page flow page is displayed *
     */
    this.Given(/^SampleDataGrid page is displayed$/, function (callback) {
        browser.waitForAngular();
        expect(sampleDataGridPage.page.isEnabled()).to.eventually.equal(true).and.notify(callback);
    });

    /**
     * Click on OK button*
     */
    this.Then(/^I click on OK$/, function (callback) {
        browser.waitForAngular();
        sampleDataGridPage.clickOK();
        callback();
    });

    /**
     * Click on cancel button*
     */
    this.Then(/^I click on Cancel$/, function (callback) {
        browser.waitForAngular();
        sampleDataGridPage.clickCancel();
        callback();
    });

    /**
     * Click on cancel button*
     */
    this.Then(/I click on Tab named "(.*)"$/, function (tabName,callback) {
        browser.waitForAngular();
        sampleDataGridPage.clickTab(tabName);
        callback();
    });


};

'use strict';

var UiCatalogManager = require('../../pageobjects/uicatalogmanager.po.js');
var chai = require('norman-testing-tp').chai;
var chaiAsPromised = require('norman-testing-tp')['chai-as-promised'];
chai.use(chaiAsPromised);
var expect = chai.expect;

var uicatalogmanager;
uicatalogmanager = new UiCatalogManager('');

module.exports = function() {

    this.Then(/^UICatalog is displayed$/, function (callback) {
        browser.waitForAngular();
        expect(browser.driver.getCurrentUrl()).to.eventually.match(/UICatalogManager/).and.notify(callback);
    });

    this.Given(/^UICatalog is displayed$/, function (callback) {
        browser.waitForAngular();
        expect(browser.driver.getCurrentUrl()).to.eventually.match(/UICatalogManager/).and.notify(callback);
    });

    this.Then(/^I check control named "(.*)" exists$/, function (controlName,callback) {
        browser.waitForAngular();
        expect(uicatalogmanager.existsControl(controlName)).to.eventually.equal(true).and.notify(callback);
        callback();
    });

};

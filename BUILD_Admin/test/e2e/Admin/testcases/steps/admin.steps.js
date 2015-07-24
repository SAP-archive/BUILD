'use strict';

var Admin = require('../../pageobjects/admin.po.js');
var chai = require('norman-testing-tp').chai;
var chaiAsPromised = require('norman-testing-tp')['chai-as-promised'];
chai.use(chaiAsPromised);
var expect = chai.expect;
var admin;

admin = new Admin('');

module.exports = function () {

    this.Given(/^I am in the Admin$/, function (callback) {
        browser.waitForAngular();
        var comparisonStr = 'Admin Console';
        expect(admin.pageTitle.getText().then(function(value){
            return protractor.promise.fulfilled(value.substr(0, comparisonStr.length))
        })).to.eventually.equal(comparisonStr).and.notify(callback);
    });

    this.Then(/^I am logged in in the Admin$/, function (callback) {
        browser.waitForAngular();
        browser.sleep(10000);
        expect(admin.page.isPresent()).to.eventually.be.true.and.notify(callback);
    });

    this.Then(/^I open UI Catalog$/, function (callback) {
        browser.waitForAngular();
        browser.sleep(2000);
        admin.clickBtnUICatalog();
        browser.waitForAngular();
        callback();
    });
};

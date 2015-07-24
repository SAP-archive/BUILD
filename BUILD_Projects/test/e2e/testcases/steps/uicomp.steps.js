/**
 * Created by I316890 on 31/03/2015.
 */

'use strict';

var UIComp = require('../../pageobjects/uicomp.po.js');
var chai = require('norman-testing-tp').chai;
var chaiAsPromised = require('norman-testing-tp')['chai-as-promised'];
chai.use(chaiAsPromised);
var expect = chai.expect;
var proto = new UIComp('');

module.exports = function() {

    this.Given(/^I see the View All Map$/, function (callback) {
        browser.waitForAngular();
        expect(proto.viewAll.isEnabled()).to.eventually.equal(true).and.notify(callback);
    });

    this.When(/^I click the View All Map Icon$/, function (callback) {
        proto.clickViewAll();
        browser.waitForAngular();
        callback();
    });

    this.Then(/^I click Project in the Menu$/, function (callback) {
        proto.clickProject();
        browser.waitForAngular();
        callback();
    });

};

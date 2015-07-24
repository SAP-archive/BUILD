/**
 * Created by I316890 on 31/03/2015.
 */

'use strict';

var Projects = require('../../pageobjects/projects.po.js');
var Archive = require('../../pageobjects/archive.po.js');

var chai = require('norman-testing-tp').chai;
var chaiAsPromised = require('norman-testing-tp')['chai-as-promised'];
chai.use(chaiAsPromised);

var expect = chai.expect;
var projPage = new Projects('');
var settingsPage = new Archive('');

module.exports = function() {

    this.When(/^I tick archive project$/, function (callback) {
        browser.waitForAngular();
        settingsPage.clickCheckbox();
        browser.sleep(1500);
        callback();
    });

    this.When(/^I click the Archive button$/, function (callback) {
        browser.waitForAngular();
        settingsPage.clickArchiveBtn();
        browser.sleep(1500);
        callback();
    });

    this.When(/^Archive Exists$/, function (callback) {
        browser.waitForAngular();
        expect(settingsPage.archiveLink.isEnabled()).to.eventually.equal(true).and.notify(callback);
    });

    this.When(/^A Project Tile Exists$/, function (callback) {
        browser.waitForAngular();
        expect(projPage.collabProjectTile.isEnabled()).to.eventually.equal(true).and.notify(callback);
    });

    this.Then(/^The project has been archived$/, function (callback) {
        browser.waitForAngular();
        callback();
    });

    this.Then(/^The project has been unarchived$/, function (callback) {
        browser.waitForAngular();
        callback();
    });


};

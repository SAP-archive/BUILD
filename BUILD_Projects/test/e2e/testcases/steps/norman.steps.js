/**
 * Created by I311186 on 17/02/2015.
 */
'use strict';

var Norman = require('../../pageobjects/norman.po.js');
var chai = require('norman-testing-tp').chai;
var chaiAsPromised = require('norman-testing-tp')['chai-as-promised'];

chai.use(chaiAsPromised);

var expect = chai.expect;
var landingPage = new Norman('');

module.exports = function() {

    this.Given(/^I am on the settings Page$/, function (callback) {
        expect(browser.getTitle()).to.eventually.equal('settings').and.notify(callback);
    });

    this.When(/^I click Home in Nav Bar$/, function (callback) {
        browser.waitForAngular();
        browser.sleep(500);
        landingPage.clickHome();
        callback();
    });

    this.When(/^I click Project in Nav Bar$/, function (callback) {
        browser.waitForAngular();
        browser.sleep(500);
        landingPage.clickProjects();
        callback();
    });

    this.When(/^I click Admin in Nav Bar$/, function (callback) {
        browser.waitForAngular();
        browser.sleep(500);
        landingPage.clickAdmin();
        callback();
    });

    this.When(/^I click Team in Nav Bar$/, function (callback) {
        browser.waitForAngular();
        browser.sleep(500);
        landingPage.clickTeam();
        callback();
    });

    this.When(/^I click Files in Nav Bar$/, function (callback) {
        browser.waitForAngular();
        browser.sleep(500);
        landingPage.clickDocs();
        callback();
    });

    this.When(/^I click Catalogs in Nav Bar$/, function (callback) {
        browser.waitForAngular();
        browser.sleep(500);
        landingPage.clickCatalogs();
        callback();
    });

    this.When(/^I click Research in Nav Bar$/, function (callback) {
        browser.waitForAngular();
        browser.sleep(500);
        landingPage.clickResearch();
        callback();
    });

    this.When(/^I click Prototype in Nav Bar$/, function (callback) {
        browser.waitForAngular();
        browser.sleep(500);
        landingPage.clickPrototype();
        callback();
    });

    this.When(/^I click Settings in Nav Bar$/, function (callback) {
        browser.waitForAngular();
        browser.sleep(500);
        landingPage.clickSettings();
        callback();
    })

    this.When(/^I press the Archive label$/, function (callback) {
        browser.waitForAngular();
        browser.sleep(500);
        landingPage.clickArchiveLabel();
        callback();
    });

    this.When(/^I then click a project$/, function (callback) {
        // Write code here that turns the phrase above into concrete actions
        browser.waitForAngular();
        landingPage.clickProjectLabel();
        browser.sleep(500);
        callback();
    });


    this.Then(/^I Logout$/, function (callback){
        browser.sleep(1000); //for PopOver to Disappear
        browser.waitForAngular();
        landingPage.clickAvLogo();
        landingPage.clickLogout();
        callback();
    });

    this.Then(/^I am in the prototype page$/, function (callback) {
        browser.waitForAngular();
        expect(browser.driver.getCurrentUrl()).to.eventually.match(/prototype/).and.notify(callback);
    });

    this.Then(/^I am in the research page$/, function (callback) {
        browser.waitForAngular();
        expect(browser.driver.getCurrentUrl()).to.eventually.match(/research/).and.notify(callback);
    });

    this.Given(/^I am in User Research$/, function(callback){
        browser.waitForAngular();
        expect(browser.driver.getCurrentUrl()).to.eventually.match(/research/).and.notify(callback);
    });

    this.Then(/^I am on the settings page$/, function(callback){
        browser.waitForAngular();
        expect(browser.driver.getCurrentUrl()).to.eventually.match(/settings/).and.notify(callback);
    });

    this.Then(/^I am on the files page$/, function(callback){
        browser.waitForAngular();
        expect(browser.driver.getCurrentUrl()).to.eventually.match(/document/).and.notify(callback);
    });

    this.Given(/^I am on the files page$/, function(callback){
        browser.waitForAngular();
        expect(browser.driver.getCurrentUrl()).to.eventually.match(/document/).and.notify(callback);
    });

    this.Then(/^I am on the Home page$/, function(callback) {
        browser.waitForAngular();
        expect(browser.driver.getCurrentUrl()).to.eventually.match(/norman/).and.notify(callback);
    });



};

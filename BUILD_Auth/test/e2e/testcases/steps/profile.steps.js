/**
 * Created by I311186 on 23/02/2015.
 */
'use strict';
var ProfilePO = require('../../pageobjects/profile.po.js');
var chai = require('norman-testing-tp').chai;
var chaiAsPromised = require('norman-testing-tp')['chai-as-promised'];
var Chance = require('norman-testing-tp').chance, chance = new Chance();

chai.use(chaiAsPromised);

var expect = chai.expect;
var profile_po = new ProfilePO('');
var profileView;
var pictureView;
var changePasswordView;
var path = require('path');
var fileUpload = '../image/andrew.png';
var absolutePath = path.resolve(__dirname, fileUpload );

var oldPwd = 'Password1';
var newPwd = 'NewPass01!';

profileView = new ProfilePO('');

var newName = chance.first()+' ' + chance.last();
var newEmail =  chance.email();

var count;

module.exports = function() {


    this.Given(/^I am on the Landing Page$/, function (callback) {

        browser.waitForAngular();

        element.all(by.css('[ng-click="closeHelpOverlay()"]')).then(function(items) {
            count = items.length;
            if(count == 1){
                browser.waitForAngular();
                profileView.changeCss();
                browser.waitForAngular();
                profileView.clickDontShow();
                browser.waitForAngular();
                profileView.clickCloseOverlay();
                browser.waitForAngular();
                profileView.clickClosePopup();
                browser.waitForAngular();
            }
            expect(browser.getTitle()).to.eventually.equal('BUILD').and.notify(callback);
        });

    });



    this.Given(/^I am on the Settings Page$/, function (callback) {
        browser.waitForAngular();
        profileView.clickContactInfo();
        browser.waitForAngular();
        browser.sleep(1000);
        expect(profileView.contactInfoView.isPresent()).to.eventually.equal(true).and.notify(callback);
    });

    this.Given(/^I am on the Picture Page$/, function (callback) {
        browser.waitForAngular();
        pictureView = new ProfilePO('');
        pictureView.clickPhoto();
        browser.waitForAngular();
        browser.sleep(1000);
        expect(profileView.photoView.isPresent()).to.eventually.equal(true).and.notify(callback);
    });

    this.Given(/^I am on the Change Password Page$/, function (callback) {
        browser.waitForAngular();
        changePasswordView = new ProfilePO('');
        changePasswordView.clickChangePwd();
        browser.waitForAngular();
        browser.sleep(1000);
        expect(profileView.changePasswordView.isPresent()).to.eventually.equal(true).and.notify(callback);
    });

    this.When(/^I click the Avatar Image$/, function (callback) {
        browser.waitForAngular();
        profile_po.clickAvatorLogo();
        browser.waitForAngular();
        browser.sleep(1500);
        callback();
    });

    this.When(/^I click Settings$/, function (callback) {
        browser.waitForAngular();
        profile_po.clickProfile();
        browser.waitForAngular();
        browser.sleep(1500);
        callback();
    });

    this.When(/^I upload a picture$/,function (callback) {
        browser.waitForAngular();
        pictureView.uploadPicture(absolutePath);
        browser.sleep(1500);
        callback();
    });

    this.When(/^I Click crop and use link$/, function (callback) {
        browser.waitForAngular();
        pictureView.clickCropAndUse();
        browser.waitForAngular();
        callback();
    });

    this.When(/^I Change Password$/, function (callback) {
        browser.waitForAngular();
        changePasswordView.changePwd(newPwd,oldPwd);
        callback();
    });

    this.Then(/^I am on the profile Page$/, function (callback) {
        profileView = new ProfilePO('');
          expect(browser.driver.isElementPresent(by.id('auth-settings-modal'))).to.eventually.equal(true).and.notify(callback);
    });
    this.Then(/^Profile is opened$/, function (callback) {
        browser.waitForAngular();
        profileView = new ProfilePO('');
        expect(profileView.menuContactInfo.isPresent()).to.eventually.equal(true).and.notify(callback);
    });

    this.When(/^I change the name$/,function (callback) {
        profileView.changeName(newName);
        browser.sleep(1000);
        callback();
    });

    this.Then(/^button Save is enabled$/,function (callback) {
        expect(profileView.btnSave.isEnabled()).to.eventually.equal(true).and.notify(callback);
        callback();
    });

    this.When(/^I change the email/,function (callback) {
        profileView.changeEmail(newEmail);
        browser.sleep(1000);
        callback();
    });

    this.When(/^I click Save$/,function (callback) {
        browser.waitForAngular();
        profileView.clickSave();
        browser.waitForAngular();
        browser.sleep(1500);
        callback();
    });

    this.Then(/^The username is changed$/, function (callback) {
        expect(element(by.cssContainingText('.ng-binding', newName)).isPresent()).to.eventually.equal(true).and.notify(callback);
    });

    this.Then(/^The email is changed$/, function (callback) {
        profileView.email.getAttribute('value').then(function (value) {
            expect(value === newEmail);
            callback();
        });
    });

    this.Then(/^Avatar image is displayed$/, function (callback) {
        expect(profileView.uiAvatarImg.isPresent()).to.eventually.equal(true).and.notify(callback);
    });

    this.Then(/^The Password is changed$/, function (callback) {
        expect(profileView.confirmMessage.isPresent()).to.eventually.equal(true).and.notify(callback);
    });

};

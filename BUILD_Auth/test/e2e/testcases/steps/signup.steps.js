/**
 * Created by I316890 on 25/03/2015.
 */


var Auth = require('../../pageobjects/auth.po.js');
var chai = require('norman-testing-tp').chai;
var chaiAsPromised = require('norman-testing-tp')['chai-as-promised'];
var Chance = require('norman-testing-tp').chance, chance = new Chance();

var localbaseURL = browser.baseUrl;

chai.use(chaiAsPromised);

var expect = chai.expect;
var authPage;
var utility = require('../../support/utility.js');

//ToDo: really should use the cucumber Word Constructor to pass a user.
var signup = { //Creates 2nd user details for the signup feature file.
    'email': chance.email(),
    'name': chance.first()+ ' ' + chance.last(),
    'password': 'Password1'
};


module.exports = function() {

    this.Given(/^I am on the sign up page$/, function (callback) {
        authPage = new Auth(localbaseURL+'/signup');
        browser.sleep(1000);
        callback();
    });

    this.When(/^I enter a valid name$/, function (callback) {
        authPage.enterName(user.name);
        callback()
    });

    this.When(/^I enter a name "([^"]*)"$/, function (name, callback) {
        authPage.enterName(name);
        callback()
    });

    this.When(/^I signup with random credentials$/, function (callback) {
        var email= chance.email();
        var name = chance.first()+ ' ' + chance.last();
        var password = 'Password1';
        authPage.signup(name, email, password);
        callback()
    });

    this.When(/^I enter valid signup details$/, function (callback) {
        authPage.signup(signup.name, signup.email,signup.password);
        callback();
    });

    this.When(/^I click on create an account$/, function (callback) {
        browser.waitForAngular();
        authPage.clickCreateAnAccount();
        browser.driver.wait(function() {
            return browser.driver.getCurrentUrl().then(function(url) {
                return /signup/.test(url);
            });
        });
        callback();
    });

    this.When(/^I click on log in$/, function (callback) {
        browser.waitForAngular();
        authPage.clickLogin();
        callback()
    });

    this.Then(/^I am logged in$/, function (callback) {
        expect(browser.getTitle()).to.eventually.equal('BUILD').and.notify(callback);
        browser.driver.wait(function() {
            return browser.driver.getCurrentUrl().then(function(url) {
                return /norman/.test(url);
            });
        });
    });

    this.Then(/^I should see a tooltip beside name$/, function (callback) {
        expect(authPage.toolTipName.getText()).to.eventually.equal('This is required').and.notify(callback);
    });

    this.Then(/^I should see a tooltip beside email address$/, function (callback) {
        expect(authPage.toolTipEmailAddress("1").getText()).to.eventually.equal('This is required').and.notify(callback);
    });

    this.Then(/^I should see a tooltip beside password$/, function (callback) {
        expect(authPage.toolTipPassword.getText()).to.eventually.equal('This is required').and.notify(callback);
    });

    this.Then(/^I should see a tooltip above the form stating that the email is already registered$/, function (callback) {
        expect(authPage.loginError.getText()).to.eventually.equal("An account using this email address already exists. Please either log in, reset your password or create an account using a different email address.").and.notify(callback);
    });

    this.Then(/^I get warning tooltips$/, function (callback) {
        expect(authPage.toolTipPassword.isEnabled()).to.eventually.equal(true).and.notify(callback);
    });


};
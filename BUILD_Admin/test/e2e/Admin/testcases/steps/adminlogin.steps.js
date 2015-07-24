'use strict';

var AdminLogin = require('../../pageobjects/adminlogin.po.js');
var chai = require('norman-testing-tp').chai;
var chaiAsPromised = require('norman-testing-tp')['chai-as-promised'];
chai.use(chaiAsPromised);
var expect = chai.expect;

var utility = require('../../support/utility.js');

var adminlogin;
adminlogin = new AdminLogin(browser.baseUrl +'/login');

var adminUser = {name : "normanadmin" , password: "Normantest1" , email: "normanadmin@test.com"};

module.exports = function () {

    this.Before("@delay", function (scenario, callback) {
        setTimeout(
            function () {
                console.log("Delay for the server to start");
                callback()
            }, 15000);
    });

    this.Given(/^I am on the admin login page$/, function (callback) {
        browser.waitForAngular();
        callback();
    });

    this.When(/^I enter admin credentials$/, function (callback) {
        adminlogin.login(adminUser);
        browser.waitForAngular();
        callback();
    });

}
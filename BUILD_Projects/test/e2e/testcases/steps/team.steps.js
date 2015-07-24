/**
 * Created by I311016 on 16/12/2014.
 */
'use strict';

var Team = require('../../pageobjects/team.po.js');
var Proj = require('../../pageobjects/projects.po.js');
var Chance = require('norman-testing-tp').chance, chance = new Chance();
var chai = require('norman-testing-tp').chai;
var chaiAsPromised = require('norman-testing-tp')['chai-as-promised'];
var utility = require('../../support/utility.js');
chai.use(chaiAsPromised);

var localbaseURL = browser.baseUrl;

var expect = chai.expect;
var teamPage = new Team('');
var projPage = new Proj('');
var team = {
    //creates 1st user to be used in the login feature file.
    'email': chance.email(),
    'name': chance.first() + ' ' + chance.last(),
    'password': 'Password1'
};

module.exports = function() {

    this.Before('@createProjectUser', function(scenario, callback) {
        var url = localbaseURL + '/auth/signup';
        utility.post(url, team).then(function(){
            callback();
        });
    });

    this.Given(/^I am logged out$/, function(callback){
        var url = localbaseURL + '/login';
        teamPage = new Team(url); //Forces Page back to the login page
        expect(browser.driver.getCurrentUrl()).to.eventually.match(/login/).and.notify(callback);
    });

    this.When(/^I am in the Team Page$/, function (callback) {
        expect(browser.driver.getCurrentUrl()).to.eventually.match(/team/).and.notify(callback);
    });

    this.When(/^I click Add People$/, function (callback) {
        browser.waitForAngular();
        teamPage.clickAddPeople();
        callback();
    });

    this.When(/^I Add A New Team Member$/, function (callback) {
        teamPage.addEmail(team.email)
        callback();
    });

    this.When(/^I Send an Invite$/, function (callback) {
        browser.waitForAngular();
        teamPage.clickSendInvite();
        callback();
    });

    this.Then(/^Team Invite is Sent$/, function (callback) {
        //TODO need to find a decent element to expect on
        callback();
    });

    this.When(/^I login using Invitee Credentails$/, function (callback) {
        teamPage.login(team.email, team.password);
        callback();
    });

    this.When(/^I Accept the Invite$/, function (callback) {
        browser.waitForAngular();
        projPage.clickAcceptInvite();
        callback();
    });

    this.Then(/^I am Collaborating on the Project$/, function(callback){
        browser.waitForAngular();
        projPage.clickCollabProj();
        expect(browser.driver.getCurrentUrl()).to.eventually.match(/prototype/).and.notify(callback);
    });
};

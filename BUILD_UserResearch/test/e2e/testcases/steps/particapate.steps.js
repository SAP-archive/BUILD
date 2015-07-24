/**
 * Created by I313762 on 16/12/2014.
 */
'use strict';

var Study = require('../../pageobjects/participate.po.js');
var UserRe = require('../../pageobjects/userResearch.po.js');
var chai = require('norman-testing-tp').chai;
var chaiAsPromised = require('norman-testing-tp')['chai-as-promised'];
var utility = require('../../support/utility.js');

chai.use(chaiAsPromised);

var expect = chai.expect;
var studyPage;
var studyURL;
var projURL;

var annotation1 = "Who?";
var annotation2 = "What?";
var annotation3 = "Where?";

//var freeText = "This is what i want to say";

var UserRePage = new UserRe('');

module.exports = function() {

    this.When(/^I navigate to the Study Url$/, function (callback) {
        browser.waitForAngular();
		studyPage = new Study(studyURL);
        callback();
    });

    this.Then(/^The start Study Button is available$/, function (callback) {
        browser.waitForAngular();
        expect(studyPage.btnStart.isEnabled()).to.eventually.equal(true).and.notify(callback);
    });

    this.Given(/^I have the link location$/, function (callback) {
        browser.waitForAngular();
		studyURL = utility.studyUrl;
        callback();
    });


    this.When(/^I load the StudyURL$/, function (callback) {
        browser.waitForAngular();
		browser.get(studyURL);
        callback();
    });

    this.When(/^I click the link icon$/, function (callback) {
        browser.waitForAngular();
        UserRePage.clickIconLink()
        callback();
    });

    this.When(/^I get the Study URL$/, function (callback) {
        browser.waitForAngular();
		UserRePage.studyUrl.getAttribute("value").then(function(value){
            studyURL = value;
        });
        callback();
    });


    this.Then(/^I should see the study name, study description, study list$/, function (callback) {
        browser.waitForAngular();
        expect(studyPage.txtStudyDesc.isPresent()).to.eventually.equal(true);
        expect(studyPage.imgThumbs.first().isPresent()).to.eventually.equal(true);
        expect(studyPage.txtStudyName.isPresent()).to.eventually.equal(true).and.notify(callback);
    });


    this.Given(/^I am on the study screen$/, function (callback) {
        browser.waitForAngular();
        expect(studyPage.btnStart.isEnabled()).to.eventually.equal(true).and.notify(callback);
    });

    this.When(/^I click start study$/, function (callback) {
        browser.waitForAngular();
        studyPage.clickStartStudy();
        browser.sleep(1500);
        callback();
    });


    this.Then(/^I should be taking to the enlarge image of the first screen$/, function (callback) {
        browser.waitForAngular();
        expect(studyPage.imgScreen.isPresent()).to.eventually.equal(true).and.notify(callback);
    });


    this.Given(/^I am on screen enlarge page$/, function (callback) {
        browser.waitForAngular();
        expect(studyPage.btnNext.isEnabled()).to.eventually.equal(true).and.notify(callback);
    });


    this.When(/^I click Answer This$/, function (callback) {
        browser.waitForAngular();
		expect(studyPage.choiceBtn1.isEnabled()).to.eventually.equal(true);
        studyPage.clickThisOption();
        browser.waitForAngular();
        callback();
    });

    this.When(/^I click Answer That$/, function (callback) {
        browser.waitForAngular();
		expect(studyPage.choiceBtn1.isEnabled()).to.eventually.equal(true);
        studyPage.clickThatOption();
        browser.waitForAngular();
        callback();

    });

    this.When(/^I click Answer Those$/, function (callback) {
        browser.waitForAngular();
		studyPage.clickThoseOption();
        browser.waitForAngular();
        callback();
    });

    this.When(/^I drop annotation no comment or sentiment$/, function (callback) {
        browser.waitForAngular();
		studyPage.createAnnotationsNoSent(annotation1);
        callback();
    });

    this.When(/^I drop annotations and comment$/, function (callback) {
        browser.waitForAngular();
		for(var i = 0; i < 3; i++) {
            if (i==0) {
                studyPage.createAnnotation(annotation1, i);
           } else if (i==1) {
                studyPage.createAnnotation(annotation2, i);
            } else {
                studyPage.createAnnotation(annotation3, i);
            }
        }
        callback();
    });

    this.When(/^I click annonomus study$/, function (callback) {
        browser.waitForAngular();
		studyPage.clickAnnon();
        callback();
    });

    this.When(/^I answer on the Free Text Question with "([^"]*)"$/, function (answer,callback) {
        browser.waitForAngular();
        studyPage.ansFreeTextQst(answer);
        callback();
    });

    this.When(/^I see No more floating toast after 3 comments$/, function (callback) {
        browser.waitForAngular();
		//browser.sleep(1500);
        expect(studyPage.noMore.isEnabled()).to.eventually.equal(true).and.notify(callback);
    });

    this.Then(/^I should see "([^"]*)" annotations$/, function (anno, callback) {
        browser.waitForAngular();
        expect(studyPage.annotation.count()).to.eventually.equal(parseInt(anno)).and.notify(callback);
    });

    this.Then(/^I enter next screen$/, function (callback) {
        browser.waitForAngular();
        studyPage.clickNextImg();
        browser.waitForAngular();
        callback();
    });

    this.Then(/^I should see the Start Task PopUp$/, function (callback) {
        browser.waitForAngular();
        expect(studyPage.startTaskBtn.isEnabled()).to.eventually.equal(true).and.notify(callback);
    });


    this.Given(/^I am a Task Page to Participate$/, function (callback) {
        browser.waitForAngular();
        expect(studyPage.screenWrap.isEnabled()).to.eventually.equal(true).and.notify(callback);
    });

    this.When(/^I click on the Start Task Button$/, function (callback) {
        browser.waitForAngular();
        //browser.sleep(5500);
        studyPage.clickStartTask();
        browser.waitForAngular();
        callback();
    });

    this.When(/^Click on the Prototype Panel to interact$/, function (callback) {
        browser.waitForAngular();
        studyPage.clickOnTheProtoType();
        browser.waitForAngular();
        callback();
    });

    this.When(/^Click on "([^"]*)" the Links in the Prototype$/, function (arg, callback) {
        browser.waitForAngular();
        studyPage.switchToIframe();
        browser.waitForAngular();
        studyPage.clickProtoLink1();
        browser.waitForAngular();
        if(arg==="All"){
            studyPage.clickProtoIndex();
            browser.waitForAngular();
        }
        studyPage.switchToDefault();
        browser.waitForAngular();
        callback();
    });


    this.When(/^Leave Feedack for the Page$/, function (callback) {
        browser.waitForAngular();
        studyPage.clickFeedback();
        browser.sleep(700);
        //Drop Annotations
        for(var i = 0; i < 3; i++) {
            if (i==0) {
                studyPage.createAnnotation(annotation1, i);
                browser.waitForAngular();
            } else if (i==1) {
                studyPage.createAnnotation(annotation2, i);
                browser.waitForAngular();
            } else {
                studyPage.createAnnotation(annotation3, i);
                browser.waitForAngular();
            }
        }
        studyPage.clickFeedback();
        browser.waitForAngular();
        callback();
    });


    this.When(/^I finish the Task$/, function (callback) {
        browser.waitForAngular();
        studyPage.clickFinish();
        browser.waitForAngular();
        callback();
    });

    this.Then(/^I see the congratulations icon$/, function (callback) {
        browser.waitForAngular();
        expect(studyPage.congrats.isEnabled()).to.eventually.equal(true).and.notify(callback);
    });

    this.Then(/^I see the Freetext "([^"]*)"$/, function (answer,callback) {
        browser.waitForAngular();
        expect(studyPage.freeTextAnswer.getText()).to.eventually.equal(answer).and.notify(callback);
    });

    this.Then(/^Annonomus is still Checked$/, function (callback) {
        browser.waitForAngular();
        expect(studyPage.annonChked.isEnabled()).to.eventually.equal(true).and.notify(callback);
    });



    this.Given(/^I am on a study Participant screen enlarge page$/, function (callback) {
        browser.waitForAngular();
        expect(studyPage.btnDoneStudy.isEnabled()).to.eventually.equal(true).and.notify(callback);
    });


    this.Given(/^I am on last screen enlarge page$/, function (callback) {
        browser.waitForAngular();
        expect(studyPage.btnDoneStudy.isEnabled()).to.eventually.equal(true).and.notify(callback);
    });

    this.When(/^I click done$/, function (callback) {
		browser.waitForAngular();
        studyPage.clickSutdyDone();
        browser.waitForAngular();
        callback();
    });

    this.Then(/^I should be taken to stating page$/, function (callback) {
		browser.waitForAngular();
        expect(studyPage.txtStudyName.isPresent()).to.eventually.equal(true).and.notify(callback);
    });

    this.Then(/^I have the Projects URL/, function (callback) {
        browser.waitForAngular();
		projURL = utility.projUrl;
        callback();
    });

    this.Then(/^There is a tick on the Images/, function (callback) {
        browser.waitForAngular();
        expect(studyPage.participateTick.count()).to.eventually.equal(2).and.notify(callback);
    });

    this.Then(/^Reset Page to Projects Page/, function (callback) {
        browser.waitForAngular();
		browser.get(projURL);
        browser.waitForAngular();
        callback();
    });

};

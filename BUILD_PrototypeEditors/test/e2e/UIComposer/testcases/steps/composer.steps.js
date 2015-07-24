/**
 * Created by I834373 on 3/24/2015.
 */
'use strict';
var UiComposer = require('../../pageobjects/uicomposer.po.js');
var Q = require('q');
var chai = require('norman-testing-tp').chai;
var chaiAsPromised = require('norman-testing-tp')['chai-as-promised'];
chai.should();                          // Necessary for Q.all().should to work
chai.use(chaiAsPromised);
var expect = chai.expect;
var composerPage = new UiComposer('');


var tmpPageCount = 0;

module.exports = function() {

    this.Given(/^I am on the prototype page$/, function (callback) {
        var comparisonStr = 'Prototype pages';
        expect(composerPage.protoPageTitle.getText().then(function(value){
            return protractor.promise.fulfilled(value.substr(0, comparisonStr.length))
        })).to.eventually.equal(comparisonStr).and.notify(callback);
    });

    this.When(/^I click on thumbnail of page "([^"]*)"$/, function (page, callback) {
        //composerPage.dismissErrorMessage();
        browser.waitForAngular();
        composerPage.clickPage(page);
        browser.waitForAngular();
        callback();
    });

    this.Then(/^I am in ui composer canvas view$/, function (callback) {
        expect(composerPage.canvas.isPresent()).to.eventually.be.true.and.notify(callback);
    });

    this.When(/^I drag and drop a control of type "([^"]*)" onto the canvas$/, function (title, callback) {
        composerPage.dragElementOntoCanvas(composerPage.dragElementControlNamed(title));
        browser.waitForAngular();
        callback();
    });

    this.Then(/^A control of type "([^"]*)" is on the canvas$/, function (title, callback) {
        expect(composerPage.elementOnCanvasNamed(title).isPresent()).to.eventually.be.true.and.notify(callback);
    });

    //  this.Then(/^The control is not on the canvas$/, function (callback) {
    //      expect(composerPage.elementOnCanvas.isPresent()).to.eventually.be.false.and.notify(callback);
    //  });

    this.Then(/^The control is not on the canvas$/, function (callback) {
        expect(composerPage.numberOfElementOnCanvas.count()).to.eventually.equal(1).and.notify(callback);

    });
    this.When(/^I click on Undo button$/, function (callback) {
        composerPage.clickIconUndo();
        callback();
    });

    this.When(/^I click on Redo button$/, function (callback) {
        composerPage.clickIconRedo();
        callback();
    });

    this.When(/^I click on the Add Page link$/, function (callback) {
        tmpPageCount = composerPage.pageLinks.count();
        composerPage.pageLinks.count().then(function(value){
            tmpPageCount = value;
            composerPage.clickLinkAddPage();
            callback();
        });
    });

    this.Then(/^A new page is created$/, function (callback) {
        var newVal = tmpPageCount + 1;
        expect(composerPage.pageLinks.count()).to.eventually.equal(newVal).and.notify( function () {
            tmpPageCount = 0;
            callback();
        });
    });

    this.When(/^I wait for "(\d+)" ms$/, function (number, callback) {
        browser.sleep(Number(number));
        callback();
    });

    this.When(/^I click on the link for page "(\d+)"$/, function (number, callback) {
        composerPage.clickLinkPageNumbered(number);
        callback();
    });

    this.Then(/^I am on page "(\d+)"$/, function (number, callback) {
        expect(composerPage.linkPageNumberedIsExpanded(number)).to.eventually.be.true.and.notify(callback);
    });


    this.Then(/^There are "(\d+)" pages$/, function (number, callback) {
        expect(composerPage.pageLinks.count()).to.eventually.equal(Number(number)).and.notify(callback);
    });


    this.When(/^I click on Phone Portrait icon$/, function (callback) {
        composerPage.clickIconPhonePortrait();
        callback();
    });

    this.Then(/^Phone Portrait mode is active$/, function (callback) {
        Q.all([
            expect(composerPage.isInPhonePortraitMode,'isInPhonePortraitMode').to.eventually.be.true,
            expect(composerPage.isInTabletPortraitMode, 'isInTabletPortraitMode').to.eventually.be.false,
            expect(composerPage.isInDesktopMode, 'isInDesktopMode').to.eventually.be.false
        ]).should.notify(callback);
    });

    this.When(/^I click on Tablet Portrait icon$/, function (callback) {
        composerPage.clickIconTabletPortrait();
        callback();
    });

    this.Then(/^Tablet Portrait mode is active$/, function (callback) {
        Q.all([
            expect(composerPage.isInPhonePortraitMode,'isInPhonePortraitMode').to.eventually.be.false,
            expect(composerPage.isInTabletPortraitMode, 'isInTabletPortraitMode').to.eventually.be.true,
            expect(composerPage.isInDesktopMode, 'isInDesktopMode').to.eventually.be.false
        ]).should.notify(callback);
    });

    this.When(/^I click on Desktop icon$/, function (callback) {
        composerPage.clickIconDesktop();
        callback();
    });

    this.Then(/^Desktop mode is active$/, function (callback) {
        Q.all([
            expect(composerPage.isInPhonePortraitMode,'isInPhonePortraitMode').to.eventually.be.false,
            expect(composerPage.isInTabletPortraitMode, 'isInTabletPortraitMode').to.eventually.be.false,
            expect(composerPage.isInDesktopMode, 'isInDesktopMode').to.eventually.be.true
        ]).should.notify(callback);
    });

    this.When(/^I click on Edit icon$/, function (callback) {
        composerPage.clickIconEditMode();
        callback();
    });

    this.Then(/^Edit mode is active$/, function (callback) {
        Q.all([
            expect(composerPage.isInPreviewMode, 'isInPreviewMode').to.eventually.be.false,
            expect(composerPage.isInEditMode, 'isInEditMode').to.eventually.be.true
        ]).should.notify(callback);
    });

    this.When(/^I click on Preview icon$/, function (callback) {
        composerPage.clickIconPreviewMode();
        callback();
    });

    this.Then(/^Preview mode is active$/, function (callback) {
        Q.all([
            expect(composerPage.isInPreviewMode, 'isInPreviewMode').to.eventually.be.true,
            expect(composerPage.isInEditMode, 'isInEditMode').to.eventually.be.false
        ]).should.notify(callback);
    });

    this.When(/^I click on Create Research Study icon$/, function (callback) {
        composerPage.clickIconCreateResearchStudy();
        callback();
    });

    this.Then(/^I am on the Create Research Study popup$/, function (callback) {
        expect(composerPage.dialogCreateResearchStudyIsActive()).to.eventually.be.true.and.notify(callback);
    });

    this.When(/^I type "([^"]*)" into the Name field$/, function (input, callback) {
        browser.waitForAngular();
        composerPage.typeInNameField(input);
        callback();
    });

    this.When(/^I click on button Create and Go To Research$/, function (callback) {
        browser.waitForAngular();
        composerPage.clickButtonCreateAndGotoResearch();
        callback();
    });

    this.Then(/^The Study Name is "([^"]*)"$/, function (name, callback) {
        expect(composerPage.txtStudyTitle()).to.eventually.equal(name).and.notify(callback);
    });


    this.When(/^I type "([^"]*)" into the property input field "([^"]*)"$/, function (input, fieldname, callback) {
        composerPage.typeIntoPropertyInputFieldNamed(fieldname, input);
        callback();
    });

    this.Then(/^The value of property input field "([^"]*)" is "([^"]*)"$/, function (fieldname, input, callback) {
        expect(composerPage.propertyFieldNamed(fieldname).getAttribute('value')).to.eventually.equal(input).and.notify(callback);
    });

    this.When(/^I click on the property toggle field "([^"]*)"$/, function (fieldname, callback) {
        composerPage.clickPropertyToggleFieldNamed(fieldname);
        callback();
    });

    this.Then(/^The property toggle field "([^"]*)" is active/, function (fieldname, callback) {
        expect(composerPage.propertyToggleFieldNamedIsChecked(fieldname)).to.eventually.be.true.and.notify(callback);
    });

    this.Then(/^The property toggle field "([^"]*)" is inactive/, function (fieldname, callback) {
        expect(composerPage.propertyToggleFieldNamedIsChecked(fieldname)).to.eventually.be.false.and.notify(callback);
    });



    this.When(/^I select option "([^"]*)" in the property Action-DDLB$/, function (option, callback) {
        composerPage.selectOptionInPropertyFieldAction(option);
        callback();
    });

    this.Then(/^The property Action-DDLB has option "([^"]*)" selected$/, function (option, callback) {
        expect(composerPage.propertyFieldActionSelectedValue).to.eventually.equal(option).and.notify(callback);
    });


    this.When(/^I select option "([^"]*)" in the property DDLB "([^"]*)"$/, function (input, fieldname, callback) {
        composerPage.selectOptionInPropertyDDLBNamed(fieldname, input);
        callback();
    });

    this.Then(/^The property DDLB "([^"]*)" has option "([^"]*)" selected$/, function (fieldname, option, callback) {
        expect(composerPage.propertyFieldNamedSelectedValue(fieldname)).to.eventually.equal(option).and.notify(callback);
    });

    this.When(/^I type "([^"]*)" into the property input field for the action Alert$/, function (input, callback) {
        composerPage.typeIntoPropertyFieldActionAlertText(input);
        callback();
    });

    this.Then(/^The value of the property input field for the action Alert is "([^"]*)"$/, function (input, callback) {
        expect(composerPage.propertyFieldActionAlertText.getAttribute('value')).to.eventually.equal(input).and.notify(callback);
    });

    this.When(/^I select option "([^"]*)" in the property DDLB for the action NavTo $/, function (option, callback) {
        composerPage.selectOptionInPropertyFieldAction(option);
        callback();
    });

    this.Then(/^The property DDLB for the action NavTo has option "([^"]*)" selected$/, function (option, callback) {
        expect(composerPage.propertyFieldActionSelectedValue).to.eventually.equal(option).and.notify(callback);
    });


    this.When(/^I click on the tree child named "([^"]*)"$/, function (name, callback) {
        composerPage.clickTreeChildNamed(name);
        callback();
    });




    this.Then(/^All is well$/, function (callback) {
        callback();
    });

    this.Then(/^Show me something$/, function (callback) {
        /*
         var el = composerPage.itemInTreeNamed("Button");
         el.getOuterHtml().then(function(value){
         console.log('OH is: ', value, '\n');
         });
         */
        browser.waitForAngular();
        callback();
    });


    this.When(/^I add Page Target to the Link on Canvas$/, function (callback) {
        browser.waitForAngular();
        composerPage.clickPageDrpDwn();
        browser.waitForAngular();
        composerPage.clickPageData();
        browser.waitForAngular();
        callback();
    });

    this.Then(/^Link Target is "([^"]*)"$/, function (link ,callback) {
        browser.waitForAngular();
        expect(composerPage.targetTxt.last().getText()).to.eventually.equal(link).and.notify(callback);
    });


    this.When(/^Create "([^"]*)" Blank Prototype Pages$/, function (num ,callback) {
        var times = parseInt(num);
        for(var i = 0; i < times; i++) {
            browser.waitForAngular();
            composerPage.clickAddBlankPage();
            browser.waitForAngular();
            browser.sleep(1000);
        }
        callback();
    });

    this.When(/^I click Add button to add first blank page$/, function (callback) {
        browser.waitForAngular();
        composerPage.clickAddFirstBlankPage();
        browser.waitForAngular();
        callback();
    });

    this.Then(/^There are "([^"]*)" Pages Created$/, function (num, callback) {
        expect(composerPage.protoTiles.count()).to.eventually.equal(parseInt(num)).and.notify(callback);
    });

    this.Given(/^I am in the ui composer canvas view$/, function (callback) {
        expect(composerPage.canvas.isPresent()).to.eventually.be.true.and.notify(callback);

    });

    this.Then(/^I click the Publish button$/, function (callback) {
        composerPage.clickIconPublish();
        browser.waitForAngular();
        callback();
    });


    this.Then(/^I click on the publish project$/, function (callback) {
        composerPage.clickIconPublishhproject();
        browser.waitForAngular();
        var pubUrl = element(by.id('np-e-publish-urltxt')).getAttribute('value');
        //instead opening a new tab just use the main tab to navigate to the prototype URL:
            browser.driver.get(pubUrl)
            browser.sleep(500);
        ///////////////////////////////////////////
        callback();
    });


    this.Then(/^I verify that I see the button$/, function (callback) {
        browser.driver.wait(function() {    //this will now wait until the button appears are fail out after 30 seconds
            return browser.driver.isElementPresent(by.css(".sapMBtnContent"));
        });
        //This is used for validation , to see if a button from the composer is displayed in a new tab
        expect(browser.driver.findElement(by.className('sapMBtnContent')).isEnabled()).to.eventually.be.true.and.notify(callback);

    });

};


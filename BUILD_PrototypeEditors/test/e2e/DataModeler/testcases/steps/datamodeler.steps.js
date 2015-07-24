'use strict';


var DataModeler = require('../../pageobjects/datamodeler.po.js');
var chai = require('norman-testing-tp').chai;
var assert = chai.assert;
var chaiAsPromised = require('norman-testing-tp')['chai-as-promised'];
chai.use(chaiAsPromised);
var expect = chai.expect;
var path = require('path');
var sleepBeforeCheck = 2000;

var dataModelerPage = new DataModeler('');

module.exports = function () {


    this.Given(/^Data modeler page is displayed$/, function (callback) {
        browser.waitForAngular();
        browser.driver.wait(function() {
            return browser.driver.isElementPresent(by.css(".dm-main-container"));
        });
        expect(dataModelerPage.page.isEnabled()).to.eventually.equal(true).and.notify(callback);
    });

    this.Given(/^Exists Entity "([^ .]*)"$/, function (entityName, callback) {
        browser.waitForAngular();
        browser.sleep(sleepBeforeCheck);
        expect(dataModelerPage.existsEntity(entityName)).to.eventually.equal(true).and.notify(callback);
    });

    this.Then(/^I click on Manual$/, function (callback) {
        browser.waitForAngular();
        dataModelerPage.clickAdd();
        browser.waitForAngular();
        dataModelerPage.clickManual();
        browser.waitForAngular();
        callback();
    });

    this.Then(/^I add Entity named "([^ .]*)"$/, function (entityName, callback) {
        browser.waitForAngular();
        dataModelerPage.clickAdd();
        dataModelerPage.addEntity(entityName);
        browser.waitForAngular();
        callback();
    });

    this.Then(/^I delete Entity named "([^ .]*)"$/, function (entityName, callback) {
        browser.waitForAngular();
        dataModelerPage.deleteEntity(entityName);
        browser.waitForAngular();
        callback();
    });

    this.Then(/^I click on Entity named "([^ .]*)"$/, function (entityName, callback) {
        browser.waitForAngular();
        dataModelerPage.clickEntity(entityName);
        browser.waitForAngular();
        browser.sleep(sleepBeforeCheck);
        callback();
    });

    this.Then(/^I rename Entity "([^ .]*)" to "([^ .]*)"$/, function (oldEntityName, newEntityName, callback) {
        browser.waitForAngular();
        dataModelerPage.renameEntity(oldEntityName, newEntityName);
        browser.waitForAngular();
        browser.sleep(sleepBeforeCheck);
        callback();
    });

    this.Then(/^I upload XL file: "(.*)"$/, function (uploadfile, callback) {
        browser.waitForAngular();
        var absolutePath = path.resolve(__dirname, uploadfile);
        dataModelerPage.uploadFile(absolutePath);
        browser.waitForAngular();
        browser.sleep(sleepBeforeCheck * 5);
        browser.driver.navigate().refresh();
        browser.waitForAngular();
        browser.sleep(sleepBeforeCheck);
        callback();
    });

    this.Then(/^I click on Search/, function (callback) {
        browser.waitForAngular();
        dataModelerPage.clickAdd();
        browser.waitForAngular();
        dataModelerPage.clickSearch();
        browser.waitForAngular();
        callback();
    });

    this.Then(/^I click on Properties Tab/, function (callback) {
        browser.waitForAngular();
        dataModelerPage.clickPropertiesTab();
        browser.waitForAngular();
        callback();
    });

    this.Then(/^I click on Relations Tab/, function (callback) {
        browser.waitForAngular();
        dataModelerPage.clickRelationsTab();
        browser.waitForAngular();
        callback();
    });

    this.Then(/^I click on Samples Tab/, function (callback) {
        browser.waitForAngular();
        dataModelerPage.clickSamplesTab();
        browser.waitForAngular();
        callback();
    });

    this.Then(/^I add property "(.*)" of type "(.*)" to entity "(.*)"$/, function (propertyName, propertyType, entityName, callback) {
        browser.waitForAngular();
        dataModelerPage.addPropertyToEntity(entityName, propertyName, propertyType);
        browser.waitForAngular();
        callback();
    });

    this.Then(/^I add a relation from entity "(.*)" to entity "(.*)" with cardinality "(.*)" named "(.*)"$/, function (entityFrom, entityTo, cardinality, relationName, callback) {
        browser.waitForAngular();
        dataModelerPage.addRelationToEntity(entityFrom, entityTo, cardinality, relationName);
        browser.waitForAngular();
        callback();
    });

    this.Then(/^I check properties for entity "(.*)" are "(.*)" of type "(.*)"$/, function (entityName, properties, types, callback) {
        browser.waitForAngular();
        assert.equal(properties.split(',').length, types.split(',').length + 1, 'There is one more property name than there are property types');
        expect(dataModelerPage.checkEntityPropertyNames(entityName)).to.eventually.equal(properties);
        expect(dataModelerPage.checkEntityPropertyTypes(entityName)).to.eventually.equal(types).and.notify(callback);
    });

    this.Then(/^I check relations for entity "(.*)" are "(.*)" with cardinality "(.*)"$/, function (entityName, relations, cardinality, callback) {
        browser.waitForAngular();
        assert.equal(relations.split(',').length, cardinality.split(',').length, 'There are as many relations as cardinalities');
        expect(dataModelerPage.checkEntityRelationNames(entityName)).to.eventually.equal(relations);
        expect(dataModelerPage.checkEntityRelationCardinalities(entityName)).to.eventually.equal(cardinality).and.notify(callback);
    });

    this.Then(/^I click on Open Editor/, function (callback) {
        browser.waitForAngular();
        dataModelerPage.clickOpenEditor();
        browser.waitForAngular();
        callback();
    });


};

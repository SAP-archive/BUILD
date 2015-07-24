'use strict';

var PageFlow = function (value, cb) {
    if (value.length > 0) {
        var url = value.charAt(0) == '/' ? value : "/" + value;
        console.log(url);
        browser.get(url);
    }
    if (typeof cb === 'function') cb()
};

PageFlow.prototype = Object.create({}, {

// <editor-fold desc="Selectors">
    page: { get: function () {
        return element(by.css('.main-content'));
    }},

    btnGenerateFlow: { get: function () {
        return element(by.css('button[ng-click="showGenerateDialog()"]'));
    }},
    btnRunApp: { get: function () {
        return element(by.css('button[ng-click="runApp()"'));
    }},

    //Choose your application type dialog
    dialogChooseYourApplicationType: { get: function () {
        return element(by.id('generateDialog'));
    }},
    btnGenerate: { get: function () {
        return element(by.css('button[ng-click="closeDialog();"]'));
    }},
    btnCancel: { get: function () {
        return element(by.css('button[ng-click="cancelDialog()"]'));
    }},
    rdbMasterDetailInReadOnly: { get: function () {
        return element(by.id('ReadOnly'));
    }},
    rdbMasterDetailInEdition: { get: function () {
        return element(by.id('ReadWrite'));
    }},
    rdbObjectPage: { get: function () {
        return element(by.id('ObjectPage'));
    }},

// </editor-fold>    

// <editor-fold desc="Actions">    

    clickGenerateFlow: {   value: function () {
        this.btnGenerateFlow.click()
    }},
    clickRunApp: {   value: function () {
        this.btnRunApp.click()
    }},

    clickGenerate: {   value: function () {
        this.btnGenerate.click()
    }},
    clickCancel: {   value: function () {
        this.btnCancel.click()
    }},
    clickMasterDetailInReadOnly: {   value: function () {
        var control = browser.driver.findElement(by.id('ReadOnly'));
        browser.driver.executeScript("arguments[0].style.display = 'inline'; ", control).then(function () {
            control.click();
        });
    }},
    clickMasterDetailInEdition: {   value: function () {
        var control = browser.driver.findElement(by.id('ReadWrite'));
        browser.driver.executeScript("arguments[0].style.display = 'inline'; ", control).then(function () {
            control.click();
        });
    }},
    clickObjectPage: {   value: function () {
        var control = browser.driver.findElement(by.id('ObjectPage'));
        browser.driver.executeScript("arguments[0].style.display = 'inline'; ", control).then(function () {
            control.click();
        });
    }},

// </editor-fold>

// <editor-fold desc="functions">

// </editor-fold>


});

module.exports = PageFlow;
'use strict';

var CreateDataModel = function (value, cb) {
    var url = value.charAt(0) == '/' ? value : "/" + value;
    browser.get(url);
    var width = 1800;
    var height = 1000;
    browser.driver.manage().window().setSize(width, height);
    if (typeof cb === 'function') cb()
};

CreateDataModel.prototype = Object.create({}, {


    //Selectors
    page: {   get: function () {
        return element(by.css('div.dm-main-container'));
    }},
    btnImportsxls: {   get: function () {
        return element(by.css('#dmd-import-excel'));
    }},
    btnCreateNew: {   get: function () {
        return element(by.css('a[ng-click="dataModelDesigner.addNewEntity()"]'));
    }},
    btnSearch: {   get: function () {
        return element(by.css('a[ng-click="dataModelDesigner.openSearch()"]'));
    }},


    //Actions
    clickCreateNew: {   value: function () {
        this.btnCreateNew.click()
    }},
    clickSearch: {   value: function () {
        this.btnSearch.click()
    }},


});

module.exports = CreateDataModel;

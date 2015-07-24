/**
 * Created by I051857 on 29/04/2015.
 */

'use strict';

var SampleDataGrid = function (value, cb) {
    if (value.length > 0) {
        var url = value.charAt(0) == '/' ? value : "/" + value;
        console.log(url);
        browser.get(url);
    }
    if (typeof cb === 'function') cb()
};

SampleDataGrid.prototype = Object.create({}, {

// <editor-fold desc="Selectors">

    page: { get: function () {
        return element(by.css('.sd-editor-dialog'));
    }},

    table: { get: function () {
        return this.page.element(by.css('.sdEditorTabstrip'));
    }},
    btnOk: { get: function () {
        return element(by.css('.sd-editor-dialog')).element(by.css('.ui-button[ng-click="closeDialog();"]'));
    }},

    btnCreateStudy:           { get:   function ()            {  }},

    btnCancel: { get: function () {
        return element(by.css('.sd-editor-dialog')).element(by.css('.ui-dialog-cancel[ng-click="cancelDialog()"]'));
    }},

// </editor-fold>


// <editor-fold desc="Actions">

    clickOK: {   value: function () {
        this.btnOk.click()
    }},

    clickCancel: {   value: function () {
        this.btnCancel.click()
    }},

    clickFirstTab: {value: function () {
        this.firstTab.click();
    }},

    clickSecondTab: {value: function () {
        this.secondTab.click();
    }},

    clickThirdTab: {value: function () {
        this.thirdTab.click();
    }},

    clickFourthTab: {value: function () {
        this.fourthTab.click();
    }},

    clickTab: {value: function (tabName) {
        browser.waitForAngular();
        var tabNames = element.all(by.cssContainingText('.ui-tab-option', tabName)).map(function (elm) {
            return elm.getText();
        });
        tabNames.then(function (result) {
            for (var i = 0; i < result.length; i++) {
                var tbName = result[i];
                if (tbName == tabName) {
                    element.all(by.cssContainingText('.ui-tab-option', tabName)).get(i).click();
                }
            }
        })
    }
    }


// </editor-fold>

})
;

module.exports = SampleDataGrid;

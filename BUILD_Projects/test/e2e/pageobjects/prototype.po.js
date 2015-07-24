/**
 * Login Selenium Page Object for Norman
 * Created by I311186 on 16/12/2014.
 */

'use strict';

var Proto = function (value, cb) {
    if (value.length > 0) {
        //var url = value.charAt(0) == '/' ? value : "/" + value;
        browser.get(value);
    }
    if (typeof cb === 'function') cb();
};


Proto.prototype = Object.create({}, {

    //SELECTORS
    btnAddPage: {
        get: function () {
            return element(by.css('[ng-click="prototype.showNewScreenForm()"]'));
        }
    },
    btnDataModel: {
        get: function () {
            return element(by.css('[ng-click="prototype.openDataModelView()"]'));
        }
    },
    btnPageFlow: {
        get: function () {
            return element(by.css('[ng-click="prototype.openPageFlowView()"]'));
        }
    },
    pageTile: {
        get: function () {
            return element(by.css(''));
        }
    },

    clickAddPage: {
        value: function () {
            this.btnAddPage.click();
        }
    }

});

module.exports = Proto;

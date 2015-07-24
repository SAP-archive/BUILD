'use strict';

var Admin = function (url, cb) {
    if(url.length > 0){
        browser.get(url);
        browser.driver.manage().window().maximize();
    }
    if (typeof cb === 'function') cb()
};

Admin.prototype = Object.create({}, {

    // Selectors
    btnUICatalog: {   get: function () { return element(by.css('div[text="UI Catalog"]')); }},
    pageTitle : {   get: function () { return element(by.css('.navbar-title')); }},
    page : { get: function () { return element(by.css('.page-console-users')); }},

    // Actions
    clickBtnUICatalog:    {   value: function () { this.btnUICatalog.click()  }}


    // Unit functions

});

module.exports = Admin;

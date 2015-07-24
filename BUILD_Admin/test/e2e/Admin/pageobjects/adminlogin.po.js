'use strict';

var AdminLogin = function (url, cb) {
    if(url.length > 0){
        browser.get(url);
        browser.driver.manage().window().maximize();
    }
    if (typeof cb === 'function') cb()
};

AdminLogin.prototype = Object.create({}, {

    // Selectors
    txtUserName: {   get: function ()     { return element(by.model('user.principal'));}},
    txtPassword:  {   get: function ()     { return element(by.model('user.password'));}},
    btnLogIn:     {   get: function ()     { return element(by.css('.login-btn-submit'));}},


    // Actions
    clickLogin:     {   value: function()           { this.btnLogIn.click()}},
    enterEmailLogin:{   value: function (keys)      { return this.txtUserName.sendKeys(keys);}},
    enterPassword:  {   value: function (keys)      { return this.txtPassword.sendKeys(keys);}},

    // Unit functions
    login:          {   value: function (user)  {
        this.enterEmailLogin(user.email);
        this.enterPassword(user.password);
        this.clickLogin();
    }}

});

module.exports = AdminLogin;



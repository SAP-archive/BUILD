/**
 * Login Selenium Page Object for Norman
 * Created by I311186 on 16/12/2014.
 */

'use strict';

var Auth = function (url, cb) {
    if(url.length > 0){
        browser.get(url);
        browser.driver.manage().window().maximize();
    }
    if (typeof cb === 'function') cb()
};


Auth.prototype = Object.create({}, {

    //Selectors
    //login
	txtOldUserName:      {   get: function ()     { return element(by.model('user.email'));}},
    txtUserName:      {   get: function ()     { return element(by.model('user.principal'));}},
    txtUserPwd:  {   get: function ()     { return element(by.model('user.password'));}},
    chkRemeberMe: {   get: function ()     { return element(by.model('user.remember'));}},

    //forgot Password
    txtForgotPwd:  {   get: function ()     { return element(by.model('user.email'));}},
    btnResetPwd:  {   get: function ()     { return element(by.css('.forgot-password-btn'));}},


    // signup forms
    txtSignName:  {   get: function ()     { return element(by.model('user.name'));}},
    txtEmail:     {   get: function ()     { return element(by.model('user.email'));}},
    txtPassword:  {   get: function ()     { return element(by.model('user.password'));}},
    chkAgree:     {   get: function ()     { return element(by.id('chbTerms'));}},
    chkAgreeLabel:{   get: function ()     { return element(by.css('.label-checkbox'));}},

    //Signup/Login Button:
    btnLogIn:     {   get: function ()     { return element(by.css('.login-btn-submit'));}},


    //login error
    lblError :    {   get: function ()     { return element(by.css('.login-form-error'));}},

    //tooltips
    toolTipAgree :        {   get: function ()     { return element(by.css('[ng-show*=\"!user.terms\"]'));}},
    toolTipEmailAddress : {   value: function (value) { return element(by.css('[ng-show*=\"form.email\"]:nth-child('+value+')'));}},
    toolTipName :         {   get: function ()     { return element(by.css('[ng-show*=\"form.name\"]'));}},
    toolTipPassword :     {   get: function ()     { return element(by.css('[ng-show*=\"form.password\"]'));}},

    //Reset Password Message
    msgRestPwd :     {   get: function ()     { return element(by.css('.login-form-success-icon'));}},

    //social sign on
    loginFB:      {   get: function ()     { return element(by.css('.login-btn-fb'));}},
    loginGPlus:   {   get: function ()     { return element(by.css('.login-btn-gl'));}},
    loginLinkedIn:{   get: function ()     { return element(by.css('.login-btn-li'));}},

    //links
    lnkLoginOrSignUp:  {   get: function ()     { return element(by.css('.login-signup'));}},
    lnkForgotPass:     {   get: function ()     { return element(by.css('.forgot-pass'));}},

    //logos
    normanLogo:   {   get: function ()     { return element(by.css('.norman-logo'));}},
    sapLogo:      {   get: function ()     { return element(by.css('.sap-logo'));}},

    //alerts
    loginError:   {   get:function()      { return element(by.css('.login-form-error'));}},

    //actions
	oldEmailLogin:{   value: function (keys)      { return this.txtOldUserName.sendKeys(keys);}},
    enterEmailLogin:{   value: function (keys)      { return this.txtUserName.sendKeys(keys);}},
    enterForgotEmail:{   value: function (keys)      { return this.txtForgotPwd.sendKeys(keys);}},

    enterEmail:     {   value: function (keys)      { return this.txtEmail.sendKeys(keys);}},
    enterName:      {   value: function (keys)      { return this.txtSignName.sendKeys(keys);}},
    enterPassword:  {   value: function (keys)      { return this.txtPassword.sendKeys(keys);}},

    checkAgree:     {   value: function()           { browser.actions().mouseMove(this.chkAgreeLabel, -20, -20).click().perform() ; }},
    checkRememberMe:{   value: function()      { browser.actions().mouseMove(this.chkRemeberMe, -20, -20).click().perform()  }},
    clickLogin:     {   value: function()           { this.btnLogIn.click()}},
    clickResetPwd:     {   value: function()           { this.btnResetPwd.click()}},
    clickForgotPass:{   value: function()           { this.lnkForgotPass.click()}},
    clickCreateAnAccount:    {   value: function()  { this.lnkCreateAnAccount.click()}},


    /**
     * Logs in with provided credentials.
     *
     * @param {String} email      : The users email.
     * @param {String} password   : The users password.
     *
     * This is a grouped action, consisting of a number of smaller authentication page object actions.
     */
     login:        {   value: function (email, password)  {
         this.enterEmailLogin(email);
         this.enterPassword(password);
         this.clickLogin();
     }},
	 
     oldLoginModel:	{   value: function (email, password)  {
         this.oldEmailLogin(email);
         this.enterPassword(password);
         this.clickLogin();
     }},

    /**
    * logs in with remeber me checked.
    */
    loginWithRememberMe:        {   value: function (email, password)  {
        this.enterEmailLogin(email);
        this.enterPassword(password);
        this.checkRememberMe();
        this.clickLogin();
    }},

    /**
     * Signs Up in with provided credentials.
     *
     * @param {String} name       : The users name.
     * @param {String} email      : The users email.
     * @param {String} password   : The users password.
     *
     * This is a grouped action, consisting of a number of smaller authentication page object actions.
     */
    signup: {   value: function (name, email, password)  {
        this.enterName(name);
        this.enterEmail(email);
        this.enterPassword(password);
        //this.checkAgree();
        this.clickLogin();

    }}
});

module.exports = Auth;

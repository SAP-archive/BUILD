/**
 * Login Selenium Page Object for Norman
 * Created by I311186 on 23/02/2015.
 */

'use strict';

var Profile = function (value, cb) {
    if(value.length > 0){
        browser.get(value);
    }
    if (typeof cb === 'function') cb()
};


Profile.prototype = Object.create({}, {

    //1stTime User Video:
    firstTimeVid:       {  get: function () { return element.all(by.css('[ng-click="closeHelpOverlay()"]'));}},
    dontShowAgain:       {  get: function () { return element(by.css('.shell-help-overlay-close-checkbox-label'));}},
    helpPopup:     {  get: function () { return element(by.css('.ui-popup-backdrop.open'));}},

    clickCloseOverlay:  {   value: function()   {this.firstTimeVid.click();}},
    clickDontShow:{     value: function()       {this.dontShowAgain.click();}},
    clickClosePopup:  {   value: function()   {this.helpPopup.click();}},

    //Dialog
    profileModal: {  get: function () { return element(by.css('#auth-settings-modal .open')); }},
     //Views
    contactInfoView: {  get: function () { return element(by.id('contactInfo')); }},
    changePasswordView: {  get: function () { return element(by.id('photo')); }},
    photoView: {  get: function () { return element(by.id('changePassword')); }},


    //SELECTORS
    menuContactInfo: {  get: function () { return element(by.id('menu-contactInfo')); }},
    menuPhoto: {  get: function () { return element(by.id('menu-photo')); }},
    menuChangePwd: {  get: function () { return element(by.id('menu-changePassword')); }},

    //Contact Info
    name: {  get: function () { return element(by.css('input[name="name"]')); }},
    email: {  get: function () { return element(by.css('input[name="email"]')); }},
    avatarLogo: {  get: function () { return element(by.css('#floatingElements .ui-avatar'));}},
    profileSettings: {  get: function () { return element(by.css('.na-settings-link')) }},

    //Photo
    picUpload: {  get: function () { return element(by.css('.na-avatar-file-input'));}},
    lnkCropAndUse: {  get: function () { return element(by.css('.crop-link-container'))}},
    deletePic: {  get: function () { return element(by.css('.na-delete-photo-text'));}},

    //Change Password
    txtNewPassword: {   get: function ()     { return element(by.model('user.newPassword'));}},
    txtNewPasswordConfirm:     {   get: function ()     { return element(by.model('user.confirmNewPassword'));}},
    txtPassword: {   get: function ()     { return element(by.model('user.oldPassword'));}},
    uiAvatarImg: { get: function ()        { return element(by.css('.ui-avatar-image'));}},
    confirmMessage: { get: function()        { return element(by.css('.ui-toast'));}},

    btnSave: {  get: function () { return element(by.css('button[ng-bind="closeText"]'));}},
    btnCancel: {  get: function () { return element(by.css('.ui-dialog-cancel'));}},




    //Menu Actions:
    clickContactInfo: { value: function ()  { this.menuContactInfo.click()}},
    clickPhoto: { value: function ()  { this.menuPhoto.click()}},
    clickChangePwd: { value: function ()  { this.menuChangePwd.click()}},


    //Actions for Contact Info
    enterNewEmail: {   value: function (keys)      { return this.email.sendKeys(keys);}},
    enterNewName: {   value: function (keys)      { return this.name.sendKeys(keys);}},

    clickAvatorLogo: { value: function ()  { this.avatarLogo.click()}},
    clickProfile: { value: function ()  { this.profileSettings.click()}},

    clickSave: { value: function ()   {this.btnSave.click()}},
    clickCancel: { value: function ()   {this.btnCancel.click()}},

    changeName: {   value: function (name)  {
        this.name.clear();
        this.enterNewName(name);
    }},

    changeEmail: {   value: function (email)  {
        this.email.clear();
        this.enterNewEmail(email);

    }},

    changeContactInfo: {   value: function (name, email)  {
        this.name.clear();
        this.enterNewName(name);
        this.email.clear();
        this.enterNewEmail(email);
    }},

    //Actions for Photo
    uploadPicture: { value: function (keys)  {return this.picUpload.sendKeys(keys)}},
    cancelPicUpload: { value: function ()  {return this.btnCancelPic.click()}},
    clickCropAndUse: { value: function ()  {return this.lnkCropAndUse.click()}},
    deletePicture: { value: function ()  {return this.deletePic.click()}},

    //Actions for Change Password:
    enterNewPwd: {   value: function (keys)      { return this.txtNewPassword.sendKeys(keys);}},
    enterConfPwd: {   value: function (keys)      { return this.txtNewPasswordConfirm.sendKeys(keys);}},
    enterOldPwd: {   value: function (keys)      { return this.txtPassword.sendKeys(keys);}},

    changeCss: {
        value: function () {
            var control = browser.driver.findElement(by.css('.ui-video-slider-container'));
            browser.driver.executeScript("arguments[0].style.height = '239px'; ", control).then(function () {
                console.log("Changed the CSS");
            });
        }
    },

    changePwd: { value: function (newpass, oldpass)  {
        this.txtNewPassword.clear();
        this.enterNewPwd(newpass);
        this.txtNewPasswordConfirm.clear();
        this.enterConfPwd(newpass);
        this.txtPassword.clear();
        this.enterOldPwd(oldpass);
    }}

});

module.exports = Profile;

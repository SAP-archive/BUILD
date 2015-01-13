/**
 * File object file for login page
 */

'use strict';

var LoginPage = function() {
    var ptor = protractor.getInstance();
    var driver = ptor.driver;
    // user name input box
    this.nameInput = browser.element(by.model('user.name'));
    // user email input box
    this.emailInput = browser.element(by.model('user.email'));
    // user password input box
    this.password = browser.element(by.model('user.password'));
    // Checkbox to agree to the terms, the way to find the element is different as it is NOT VISIBLE by default
    this.checkBox = driver.findElement(protractor.By.className('ui-checkbox'));
    // Submit button
    this.submitBtn = browser.element(by.className('login-btn-submit'));
};

module.exports = new LoginPage();


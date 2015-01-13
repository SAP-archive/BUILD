/*
 * Create a new user on login page then check the url has changed for /norman
 */

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();




describe('Login Page', function() {
    var page;
    var ptor;
    var driver;
    var loginPage;

    beforeEach(function () {
        ptor = protractor.getInstance();
        driver = ptor.driver;
        // Maximize browser window
        browser.driver.manage().window().maximize();

    });

    it('Enter credential and log in', function () {
        // Access to the login page
        browser.get('/signup');
        browser.waitForAngular();

        // Initialize the login object page
        loginPage =  require('./login.po.js');

        browser.waitForAngular();
        browser.sleep(1000);
        // Enter name
        loginPage.nameInput.sendKeys("clem");

        browser.waitForAngular();
        // Enter email
        loginPage.emailInput.sendKeys("clem@clem.fr");


        browser.waitForAngular();
        // Enter Password
        loginPage.password.sendKeys("clem");

        browser.waitForAngular();
        // Click on accept terms checkbox (the protractor click method can't be used here as the web element in not visible by default)
        driver.executeScript("arguments[0].click()", loginPage.checkBox);

        browser.waitForAngular();
        // Click on submit button
        loginPage.submitBtn.click();

        browser.waitForAngular();
        browser.sleep(1000);

        // Check that the url has change to /norman (the log in was successful)
        browser.getLocationAbsUrl().then(function(url)
        {
            assert.include(url,'/norman','url should contain "/norman"');
        });
    },10000);
});

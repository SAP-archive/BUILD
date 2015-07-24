'use strict';

var chai = require('norman-testing-tp').chai;
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

describe('Main View', function () {
    var page;
    var editPage;
    var beforeCount;
    var afterCount;
    var ptor;

    beforeEach(function () {
        ptor = protractor.getInstance();
        browser.get('/projects');
        browser.waitForAngular();
        page = require('./main.po.js');

    });

    it('Page object test', function () {

        element.all(by.css('.projectItem')).then(function(items)
        {
            beforeCount =  items.length;
        });
        page.addButton.click();
        editPage = require('./edit.po.js');
        editPage.saveButton.click();
        browser.waitForAngular();
        page = require('./main.po.js');
        afterCount = page.projectItems.length;
        expect(afterCount).equal(beforeCount + 1);
    });
});
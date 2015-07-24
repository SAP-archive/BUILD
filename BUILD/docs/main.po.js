/**
 * This file uses the Page Object pattern to define the main page for tests
 * https://docs.google.com/presentation/d/1B6manhG0zEXkC-H-tPo2vwU06JhL8w9-XCF9oehXzAQ
 */

'use strict';
//var protractor = require('protractor');

var MainPage = function () {

    var projectItemsTemp = [];
    
	element.all(by.css('.projectItem')).then(function (items) {

        items.forEach(function(item)
        {
            projectItemsTemp.push(item);
        });
    });


    this.projectItems = projectItemsTemp;
	this.addButton = element(by.id('addNewBtn'));
};

module.exports = new MainPage();


'use strict';

var Q = require('q');

var UiCatalogManager = function (url, cb) {
    if(url.length > 0){
        browser.get(url);
        browser.driver.manage().window().maximize();
    }
    if (typeof cb === 'function') cb()
};


UiCatalogManager.prototype = Object.create({}, {

    // Selectors
    headingTitle:     {   get: function ()     { return element(by.css('label.heading'));}},

    // Actions

    // Unit functions
    existsControl: {
        value: function (keys) {
            browser.waitForAngular();
            var promiseArray = [];

            return element.all(by.cssContainingText('.controlLabel', keys))
                .then(function (controls) {
                    if (controls.length == 0) {
                        return [false];
                    }
                    else {
                        for (var i = 0; i < controls.length; i++) {
                            var control = controls[i];
                            browser.waitForAngular();
                            promiseArray.push(control.getText()
                                .then(function (text) {
                                    return (keys === text);
                                }));
                        }
                        return Q.all(promiseArray);
                    }
                })
                .then(function (booleanArray) {
                    var result = false;
                    for (var i = 0; i < booleanArray.length; i++) {
                        if (booleanArray[i]) {
                            result = true;
                        }
                    }
                    return result;
                });
        }
    }


});

module.exports = UiCatalogManager;

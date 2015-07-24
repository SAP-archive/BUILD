/**
 * Created by I051857 on 24/06/2015.
 */

'use strict';

var Proto = function (value, cb) {
    if(value.length > 0){
        //var url = value.charAt(0) == '/' ? value : "/" + value;
        browser.get(value);
    }
    if (typeof cb === 'function') cb()
};


Proto.prototype = Object.create({}, {

    //SELECTORS
    page:             { get:   function ()     { return element(by.css(' div.shell-projectLandingPage'));}},
    btnGotoDataModeler:     { get:   function ()     { return element(by.css('[ng-click="modelHomeWidget.openDataModelView()"]')); }}

});

module.exports = Proto;

/**
 * Created by I311016 on 16/12/2014.
 */
'use strict';
var Proto = require('../../pageobjects/modelHomeWidget.po.js');
var chai = require('norman-testing-tp').chai;
var expect = chai.expect;
var protoPage = new Proto('');


module.exports = function() {

    //this.After(function (scenario, callback) {
    //    if(scenario.isFailed()){
    //        browser.takeScreenshot().then(function (png) {
    //            var fs = require('fs');
    //            var decodedImage = new Buffer(png, 'base64').toString('binary');
    //            scenario.attach(decodedImage, 'image/png');
    //        });
    //    }
    //    callback();
    //});


    this.Then(/^I open data modeler$/, function (callback) {
        browser.waitForAngular();
        protoPage.btnGotoDataModeler.click();
        browser.waitForAngular();
        callback();
    });


};

/**
 * Created by I316890 on 31/03/2015.
 */

'use strict';

var UIComp = function (value, cb) {
    if(value.length > 0){
        //var url = value.charAt(0) == '/' ? value : "/" + value;
        browser.get(value);
    }
    if (typeof cb === 'function') cb();
};

UIComp.prototype = Object.create({}, {

    //view all Map
    viewAll:             { get:   function ()     {  return element(by.css( '[ng-click="prototype.openPageMapView()"]')); }},

    //Click the View All icon
    clickViewAll:  {   value: function () {
        this.viewAll.click();
    }},

    //add Blank Page:
    btnAddBlankPage:             { get:   function ()     {  return element(by.css( '[ng-click="map.createPage()"]')); }},

    //click Add Blank Page:
    clickAddBlankPage: {   value: function () {
        this.btnAddBlankPage.click();
    }},

    //project Menu Tab:
    projectMenuTab:            { get:   function ()     {  return element(by.css( '.project')); }},

    clickProject:{   value: function () {
        this.projectMenuTab.click();
    }},

    //blank Prototype tiles:
    protoTiles:             { get:   function ()     {  return element.all(by.css( '.np-p-pageMap-tile-inner-bottom-box')); }}

});

module.exports = UIComp;

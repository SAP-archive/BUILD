/**
 * Login Selenium Page Object for Norman
 * Created by I834373 on 03/24/2015.
 */

'use strict';
var fs = require('fs');
var path = require('path');
var driver = browser.driver;
var promise = protractor.promise;

// The following code is from from https://gist.github.com/jamm/52af2b1f998fed1e9520
// Example of usage:
//   expect(element(by.attr('ng-click', 'exampleMethod()')).isDisplayed()).toBe(true);
// vvvvvvvvvvvvvvvvv
by.addLocator('attr',
    /**
     * Find element(s), where attribute = value
     * @param {string} attr
     * @param {string} value
     * @param {Element} [parentElement=]
     * @returns {Array.<Element>}
     */
    function (attr, value, parentElement) {
        parentElement = parentElement || document;
        var nodes = parentElement.querySelectorAll('[' + attr + ']');
        return Array.prototype.filter.call(nodes, function (node) {
            return (node.getAttribute(attr) === value);
        });
    });

//^^^^^^^^^^^^^^^^^^^




var UiComposer = function (value, cb) {
    if(value.length > 0){
        var url = value.charAt(0) == '/' ? value : '/' + value;
        browser.get(url);
    }
    if (typeof cb === 'function') { cb(); }
};


UiComposer.prototype = Object.create({}, {
    // HELPER
    typeIntoInputField: { value: function (el, input) {
        el.clear();
        el.sendKeys(input);
//        browser.waitForAngular();
    }},

    selectDropdownByAttr: { value: function ( element, attr, optionValue ) {
        if (optionValue){
            var options = element.all(by.tagName('option'))
                .then(function(options){
                    for (var i = 0; i < options.length; i++) {
                        // Iterate over option values; use closure to inject current value of i into then clause
                        (function(i) {
                            options[i].getAttribute(attr).then(function (value) {
                                if(value == optionValue) {
                                    options[i].click();
                                }
                            });
                        })(i);
                    }
                });
        }
    }},

    //SELECTORS
    //prototype page
    protoPageTitle:     { get:   function ()     { return element(by.css('#project-prototype h1'));}},
    numOfPages:         { get:   function ()     { return element.all(by.binding('screenName'));}},
    linkPage:           { value: function (name) { return element(by.cssContainingText( '.ui-screen-tile', name));}},
    treeChildNamed:    { value: function (name) {
        return element.all(by.repeater( 'item in item.gridChildren')).filter( function(el){
            return el.getText().then(function(value){
                return value == name;
            })
        }).first();
    }},

    //composer page
    canvas:             { get:   function ()     { return element(by.css('.np-c-grid'));}},
    buttonInCanvas:     { get:   function ()     { return element(by.id('canvasOverlay'));}},

    //blank Prototype tiles:
    protoTiles:             { get:   function ()     {  return element.all(by.css( '.np-p-page-map-tile-inner')); }},

    pendingInvitesCount:     { get:   function ()     { return element.all(by.binding('user.email')); }},
    //return control with given name
    expectedControl:    { value: function (name) { return element(by.cssContainingText( '.np-c-grid-element', name));}},
    numberOfElementOnCanvas: { get:  function ()     { return element.all(by.css('.np-c-grid-element'));}},

    elementOnCanvasNamed:     { value:   function (name)     {
        return element.all(by.css('.np-c-grid-element[np-selected=true]')).filter( function(el) {
            return browser.executeScript('return angular.element(arguments[0]).scope().element.controlMd.catalogControlName;',
                el.getWebElement()).then(function(value){
                    return promise.fulfilled(value == name);
                })
        }).first();
    }},


    dragElementControlNamed:     { value:   function (title) {
        return element(by.css('.ng-scope[display-name=\"' + title + '\"]>.np-component-library-item'));
    }},



    // Header items
    btnAddFirstBlankPage:             { get:   function ()     {  return element(by.css( '.np-e-add-page-tile-button')); }},

    btnAddBlankPage:             { get:   function ()     {  return element(by.css( '.np-p-page-map-add-page-btn')); }},
    btnSelectThumbnail:           { get:   function ()     {  return element.all(by.repeater('choice in map.pageTypes'));}},
    //btnSelectThumbnail:           { get:   function ()     {  return element(by.src( 'data:image/png')); }},
    //btnSelectThumbnail:           { get:   function ()     {  return element(by.css( '[ng-click="map.createPage()"]')); }},
    iconToggleNavBar:   { get:   function ()     { return element(by.id('np-e-toggle-nav-icon'));}},

    iconDataModeler:   { get:   function ()     { return element(by.id('np-e-data-modeler-icon'));}},

    iconUndo:   { get:   function ()     { return element(by.id('np-e-undo-icon'));}},
    iconRedo:   { get:   function ()     { return element(by.id('np-e-redo-icon'));}},

    iconPhonePortrait:   { get:   function ()     { return element(by.id('np-e-form-factor-phone-icon'));}},

    iconTabletPortrait:   { get:   function ()     { return element(by.id('np-e-form-factor-tablet-icon'));}},

    iconDesktop:   { get:   function ()     { return element(by.id('np-e-form-factor-desktop-icon'));}},

    iconPreviewMode: { get:   function ()     { return element(by.id('np-e-preview-icon'));}},

    iconEditMode: { get:   function ()     { return element(by.id('np-e-edit-icon'));}},

    drpDwnTarget:{ get:   function ()     { return element.all(by.css('.np-p-data-selection'));}},

    lnkTarget: { get:   function ()     { return element.all(by.css('.np-s-selectbox-item'));}},

    targetTxt: { get:   function ()     { return element.all(by.css('.np-s-selectbox-toggle'));}},

    iconShareCurrentVersion: { get:   function ()     { return element(by.id('np-e-share-current-version-icon'));}},

    iconCreateResearchStudy:  { get:   function ()     { return element(by.id('np-e-create-research-study-icon'));}},

    iconToggleRuler:   { get:   function ()     { return element(by.id('np-e-ruler-icon'));}},
    iconToggleGrid:   { get:   function ()     { return element(by.id('np-e-grid-icon'));}},
    iconToggleSnapping:   { get:   function ()     { return element(by.id('np-e-snapping-icon'));}},
    iconPublish:{get: function() {return element(by.id('np-e-publish-icon'));}},
    iconPublishproject:{get: function() {return element(by.css('.np-e-publish-pubBtn'));}},

    // Top Left: Object Hierarchy

    pageLinks:          { get:   function ()     { return element(by.model('tree.nodes')).all(by.repeater('node in tree.nodes'));}},
    linkPageNumbered: { value: function (number) { return this.pageLinks.get(number - 1);}},
    linkAddPage:     { get:   function ()     { return element(by.css('.np-e-tree-add-page'));}},


    // Right: Canvas Element Properties

    propertyFieldNamed:  { value: function (name) {
        return element.all(by.repeater('property in propertyPanel.properties'))
            .all(by.attr('title',name))
            .first()
            .element(by.xpath('..'))
            .all(by.css('.np-p-data-input'))
            .first().all(by.css('*:first-child')).first();
    }},

    propertyFieldInteraction: { get:   function ()     { return element(by.model('propertyPanel.event.savedEvent')); }},
    propertyFieldAction: { get:   function ()     { return element(by.model('propertyPanel.event.savedAction')); }},
    propertyFieldActionAlertText: { get:   function ()     { return element(by.css('.np-p-data-event-input')); }},
    propertyFieldActionSelectedValue: { get:   function ()     {
        return browser.executeScript('return angular.element(arguments[0]).scope().propertyPanel.event.savedAction.name;',
            this.propertyFieldAction.getWebElement());
    }},

    propertyFieldNamedSelectedValue: { value:   function (name)     {
        var el = this.propertyFieldNamed(name);
        return browser.executeScript('return angular.element(arguments[0]).scope().property.value;',
            el.getWebElement());
    }},

    // State evaluation methods
    propertyToggleFieldNamedIsChecked:  { value:   function (name)     {
        var el = this.propertyFieldNamed(name);
        return el.getAttribute('ng-model').then(function(model){
            return browser.executeScript('return angular.element(arguments[0]).scope().'+ model +';',
                el.getWebElement());
        });
    }},


    linkPageNumberedIsExpanded: { value: function (number) {
        return this.linkPageNumbered(number).getAttribute('data-collapsed').then( function(value) {
            return promise.fulfilled(value == 'false');
        });
    }},

    doesShowNavBar: { get:   function ()     {
        return this.iconNavBar.getAttribute('class').then( function(value) {
            return promise.fulfilled( value.indexOf('np-e-header-icon-active') > -1 );
        });
    }},

    isInPhonePortraitMode: { get:   function ()     {
        return this.iconPhonePortrait.getAttribute('class').then( function(value) {
            return promise.fulfilled( value.indexOf('np-e-header-icon-active') > -1 );
        });
    }},


    isInTabletPortraitMode: { get:   function ()     {
        return this.iconTabletPortrait.getAttribute('class').then( function(value) {
            return promise.fulfilled( value.indexOf('np-e-header-icon-active') > -1 );
        });
    }},


    isInDesktopMode: { get:   function ()     {
        return this.iconDesktop.getAttribute('class').then( function(value) {
            return promise.fulfilled( value.indexOf('np-e-header-icon-active') > -1 );
        });
    }},

    isInEditMode: { get:   function ()     {
        return this.iconEditMode.getAttribute('class').then( function(value) {
            return promise.fulfilled( value.indexOf('ng-hide') > -1 );
        });
    }},

    isInPreviewMode: { get:   function ()     {
        return this.iconPreviewMode.getAttribute('class').then( function(value) {
            return promise.fulfilled( value.indexOf('ng-hide') > -1 );
        });
    }},


    popupCreateSnapshot:  { get:   function ()     { return element(by.id('snapshot-created-modal'));}},
    isOnPopupCreateSnapshot: { get:   function ()     {
        return this.iconPreviewMode.getAttribute('class').then( function(value) {
            return promise.fulfilled( value.indexOf('ng-hide') > -1 );
        });
    }},

    //actions
//    dismissErrorMessage: { value: function () { element(by.css('.ui-toast-close')).click();}},
    clickPage:          { value: function (name) { this.linkPage(name).click();}},
    clickLinkPageNumbered:  { value: function (number) { this.linkPageNumbered(number).click();}},
    clickLinkAddPage:          { value: function () { this.linkAddPage.click();}},
    clickTreeChildNamed:        { value: function (name) { this.treeChildNamed(name).click();}},

    clickIconToggleNavBar:   { value: function () { this.iconToggleNavBar.click();}},
    clickIconDataModeler:   { value: function () { this.iconDataModeler.click();}},
    clickIconPhonePortrait:   { value: function () { this.iconPhonePortrait.click();}},
    clickIconTabletPortrait:   { value: function () { this.iconTabletPortrait.click();}},
    clickIconDesktop:   { value: function () { this.iconDesktop.click();}},
    clickIconPreviewMode: { value: function () { this.iconPreviewMode.click();}},
    clickIconCreateResearchStudy:  { value: function () { this.iconCreateResearchStudy.click();}},
    clickIconEditMode: { value: function () { this.iconEditMode.click();}},
    clickIconShareCurrentVersion: { value: function () { this.iconShareCurrentVersion.click();}},
    clickIconToggleRuler:   { value: function () { this.iconToggleRuler.click();}},
    clickIconToggleGrid:   { value: function () { this.iconToggleGrid.click();}},
    clickIconToggleSnapping:   { value: function () { this.iconToggleSnapping.click();}},
    clickAddBlankPage: {   value: function () {
        this.btnAddBlankPage.click();
    }},

    clickAddFirstBlankPage: {   value: function () {
        this.btnAddFirstBlankPage.click();
    }},

    clickBlankTemplate :{value: function () {
        this.btnSelectThumbnail.click();
    }},
    clickIconPublish: { value: function() {this.iconPublish.click();}},

    clickIconPublishhproject :{ value: function() {this.iconPublishproject.click();}},

    clickIconUndo: { value: function () { this.iconUndo.click();}},

    clickIconRedo: { value: function () { this.iconRedo.click();}},

    clickPageDrpDwn:{ value: function () { this.drpDwnTarget.last().click();}},

    clickPageData:{ value: function () { this.lnkTarget.last().click();}},

    dragElementOntoCanvas:  {value: function (elem){
        browser.waitForAngular();

        var dnd_javascript = fs.readFileSync(path.resolve(__dirname, '../support/dragDropSimulator.js'));
        browser.executeScript("" + dnd_javascript);

        //Give the script some time to execute.
        browser.sleep(10000);
        browser.waitForAngular();
        browser.executeScript("jQuery(arguments[0]).simulateDragDrop({ dropTarget: '#canvasOverlay'});", elem.getWebElement());
        browser.waitForAngular();

    }},


    // Actions for Property Panel
    clickPropertyToggleFieldNamed: { value: function (name) {
        this.propertyFieldNamed(name).click();
    }},

    typeIntoPropertyInputFieldNamed: { value: function (name, input) {
        this.typeIntoInputField(this.propertyFieldNamed(name), input);
    }},

    typeIntoPropertyFieldActionAlertText: { value: function (input) {
        this.typeIntoInputField(this.propertyFieldActionAlertText, input);
    }},


    selectOptionInPropertyFieldAction:  { value: function (option) {
        this.selectDropdownByAttr(this.propertyFieldAction, 'value', option );
    }},

    selectOptionInPropertyDDLBNamed: { value: function (name, option) {
        this.selectDropdownByAttr(this.propertyFieldNamed(name), 'label', option);
    }},


    // ------------ Create Research Study Popup ----------------
    // elements
    dialogCreateResearchStudy: { get:   function ()     { return element(by.id('study-create-modal'));}},

    inputfieldName: { get:   function ()     {
        return element(by.id('study-create-modal')).element(by.css('.ui-input'));
    }},

    buttonCreateAndGotoResearch: { get:   function ()     {
        return element(by.id('study-create-modal')).element(by.css('.ui-dialog-close')).element(by.css('.ui-button'));
    }},

    // state evaluation methods
    dialogCreateResearchStudyIsActive: { value: function () {
        return this.dialogCreateResearchStudy.getAttribute('style').then( function(value) {
            return promise.fulfilled(value.indexOf('display: block') > -1);
        });
    }},

    // actions
    clickButtonCreateAndGotoResearch: { value: function () { this.buttonCreateAndGotoResearch.click();}},

    typeInNameField: { value: function (input) {
        browser.waitForAngular();
        this.inputfieldName.sendKeys(input);
        browser.waitForAngular();
    }},


    // Study Title on Research Page
    txtStudyTitle: { value:   function ()     { return element(by.css('.title-wrapper .title')).getText();}}

});






module.exports = UiComposer;

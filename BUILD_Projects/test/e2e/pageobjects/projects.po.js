/**
 * Login Selenium Page Object for Norman
 * Created by I311186 on 16/12/2014.
 */

'use strict';

var Projects = function (value, cb) {
    if(value.length > 0){
        //var url = value.charAt(0) == '/' ? value : "/" + value;
        browser.get(value);
    }
    if (typeof cb === 'function') cb();
};

Projects.prototype = Object.create({}, {

    //SELECTORS
    btnNewProj:         { get:   function ()     { return element(by.css( '[ng-click="projectsHomeWidget.showNewProjectForm()"]')); }},
    newProjLink:        { get:   function ()     { return element(by.css( '.new-project-button.ui-button.ui-button-large')); }},
    txtNewProjTitle:    { get:   function ()     { return element(by.css( '.ui-project-tile-new-project-input')); }},
    collabProjectTile:  { get:   function ()     { return element(by.css( '.ui-project-tile')); }},
    lnkProj:            { value: function (name) { return element(by.cssContainingText( '.ui-project-tile', name )); }},
    projectTitle:       { get:   function ()     { return element(by.binding('projectName'));}},
    numProjectTiles:    { get:   function()      { return element.all(by.binding('projectName'));}},
    projInviteLink:     { get:   function()      { return element(by.css('.project-invite-link.ng-binding'));}},
    acceptNewInvite:    { get:   function()      { return element(by.css('[ng-click="acceptProject()"]'));}},
    rejectNewInvite:    { get:   function()      { return element(by.css('[ng-click="rejectProject()"]'));}},
    acceptInvite:       { get:   function()      { return element(by.buttonText('ACCEPT INVITE'));}},
    //
    deleteProjLink:     { get:   function ()    { return element(by.css('.ui-project-tile-cancel-icon'))}},

    upload:                   { get:   function ()            { return element.all(by.css('input[type="file"]')); }},

    files:             { get:   function ()            { return element.all(by.css('.row-link.ng-binding')); }},
    badgeCount:             { get:   function ()            { return element.all(by.css('.badge.ng-binding.ng-scope"]')); }},

    doUpload: { value: function (file) {
        this.upload.first().sendKeys(file);
    }},

    clickNewProject:        {   value: function()       { this.btnNewProj.click()}},
    clickNewProjectLink:    {   value: function()       { this.newProjLink.click()}},
    clickProjectItem:       {    value: function()      { this.txtNewProjTitle.click()}},
    clickProject:           {    value: function()      { this.projectTitle.click()}},
    clickAcceptInvite:      {     value: function()     { this.acceptInvite.click()}},
    clickCollabProj:        {     value: function()     { this.collabProjectTile.click()}},
    //
    clickProjDelete:        {   value: function()       { this.deleteProjLink.click()}},

    clickProjInvLnk:    {   value: function()           { this.projInviteLink.click()}},
    clickAcceptInvBtn:  {   value: function()           { this.acceptNewInvite.click()}},
    clickRejectInvBtn:  {   value: function()           { this.rejectNewInvite.click()}},


    enterProjTitle:     {   value: function (keys)      { return this.txtNewProjTitle.sendKeys(keys);}},
    commitProjTitle:    {   value: function ()      { return this.txtNewProjTitle.sendKeys(protractor.Key.ENTER);}},




    enterPageTitle: { value: function (keys)   { this.txtNewPage.sendKeys(keys);
        this.txtNewPage.sendKeys(protractor.Key.ENTER);
    }},
    openProj:       { value: function (name)   { this.lnkProj(name).click();}},
    //Searches email addresses in the Pending invitations section in the team tab
    //searchPending:  { value: function (email) {
    //  return $('#project-team').isElementPresent(by.cssContainingText( '.team-user-pending-item', email));
    //}},

    createProj:     { value: function (name) {
        this.enterProjTitle(name);
        this.commitProjTitle();
    }}

});

module.exports = Projects;

/**
 * Login Selenium Page Object for Norman
 * Created by I311186 on 16/12/2014.
 */

'use strict';

var Norman = function (value, cb) {
    if(value.length > 0){
        browser.get(value);
    }
    if (typeof cb === 'function') cb()
};


Norman.prototype = Object.create({}, {

    //SELECTORS
    //in Header
    normanLogo:         {  get: function () { return element(by.css('.nav-bar-logo')); }},
    avatarLogo:         {  get: function () { return element(by.css('.ui-avatar-initials'));}},
    lnkLogout:          {  get: function () { return element(by.css('.na-logout-link')); }},
    lnkProfileSettings: {  get: function () { return element(by.css('.na-settings-link')); }},
    txtHeader:          {  get: function () { return element(by.css('.nav-bar-title')); }},
    linkArchive:        {  get: function () { return element(by.css('.archived-project-count-text'));}},
    projectLabel:       {  get: function () { return element(by.binding('archivedPoject.name'));}},

    //1stTime User Video:
    firstTimeVid:       {  get: function () { return element.all(by.css('[ng-click="closeHelpOverlay()"]'));}},
    dontShowAgain:       {  get: function () { return element(by.css('.shell-help-overlay-close-checkbox-label'));}},
    helpPopup:     {  get: function () { return element(by.css('.ui-popup-backdrop.open'));}},

    //Nav Bar
    tabProjects:    { get: function () { return element(by.css('.projects')); }},
    tabProjectsOn:  { get: function () { return element(by.css('.projects.on')); }},
    tabUICatalog:   { get: function () { return element(by.css('.ui.catalog')); }},
    tabCatalog:     { get: function () { return element(by.css('.catalogs')); }},
    tabDocs:        { get: function () { return element(by.css('.docs')); }},
    tabPrototype:   { get: function () { return element(by.css('.prototype')); }},
    tabTeam:        { get: function () { return element(by.css('.team')); }},
    tabResearch:    { get: function () { return element(by.css('.research')); }},
    tabAnalytics:   { get: function () { return element(by.css('.application.analysis')); }},
    tabUX:          { get: function () { return element(by.css('.ux.rules')); }},
    tabAdmin:       { get: function () { return element(by.css('.admin')); }},
    tabHome:        { get: function () { return element(by.css('.home'));}},
    tabSettings:    { get: function () { return element(by.css('.settings'));}},

    //actions
    clickAvLogo:      {   value: function()   { this.avatarLogo.click() }},
    clickProjects:    {   value: function()   { this.tabProjects.click();}},
    clickUICatalog:   {   value: function()   {this.tabUICatalog.click();}},
    clickCatalogs:    {   value: function()   { this.tabCatalog.click();}},
    clickDocs:        {   value: function()   { this.tabDocs.click();}},
    clickPrototype:        {   value: function()   { this.tabPrototype.click();}},
    clickTeam:        {   value: function()   { this.tabTeam.click();}},
    clickResearch:        {   value: function()   {this.tabResearch.click();}},
    clickAnalytics:     {   value: function()   { this.tabAnalytics.click();}},
    clickUX:     {   value: function()   { this.tabUX.click();}},
    clickAdmin:     {   value: function()   { this.tabAdmin.click();}},
    clickLogout:      {   value: function()   { this.lnkLogout.click();}},
    clickArchiveLabel:{   value: function()   {  this.linkArchive.click();}},

    clickProjectLabel:{   value: function()   {this.projectLabel.click();}},

    clickCloseOverlay:  {   value: function()   {this.firstTimeVid.click();}},
    clickDontShow:{     value: function()       {this.dontShowAgain.click();}},
    clickClosePopup:  {   value: function()   {this.helpPopup.click();}},

    clickHome:        {   value: function()   {
        this.tabHome.click();
    }},

    clickSettings:    {   value: function()   {
        this.tabSettings.click();
    }}

});

module.exports = Norman;

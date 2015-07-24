/**
 * Projects Selenium Page Object for Norman
 * Created by I313762 on 10/02/2015.
 */

'use strict';

var UserRe = function (value, cb) {
    if(value.length > 0){
        browser.get(value);
    }
    if (typeof cb === 'function') cb()
};

UserRe.prototype = Object.create({}, {

    //SELECTORS
    tabResearch:              { get:   function ()            { return element(by.css( '.aside .research' )); }},
    msgError:                 { get:   function ()            { return element(by.css(alert)); }},

    imgThumb:                { get: function ()                 { return element.all(by.css('.complete-tick')); }},

    //Research and Feedback
    btnCreateStudy:           { get:   function ()            { return element(by.css( '#norman-user-research button[ng-click*=\"createStudy()\"]' )); }},
    lnkCreateStudy:           { get:   function ()            { return element(by.css( '#norman-user-research a[ng-click*=\"createStudy()\"]' )); }},

    lnkStudy:                 { value: function (name)        { return element(by.cssContainingText( '#norman-user-research [ng-click*=\"studyClick(study)\"', name )); }},
    //returns list of all studies
    lnkAllStudys:             { get:   function ()            { return element.all(by.css( '#norman-user-research [ng-click*=\"studyClick(study)\"')); }},

    upload:                   { get:   function ()            { return element.all(by.css('input[type="file"]')); }},

    //zipUpload:                   { get:   function ()            { return element(by.css('input[type="file"]')); }},
    zipUpload:                { get:   function ()            { return element(by.xpath('//*[@id="transclude-task-dialog"]/div[1]/div[1]/input[1]')); }},
    browseBtn:               { get:   function ()            { return element(by.xpath('//*[@id="study-type-select"]/div/div[1]/button/span')); }},

    progressBar:            { get:   function ()            { return element(by.css('.prototype-upload-progress')); }},

    snapshotTick:             { get:   function ()            { return element(by.css('.snapshot-selected-tick')); }},
    taskName:                 { get:   function ()            { return element(by.model( 'task.name' )) ;}},
    confirmTaskName:          { get:   function ()            { return element(by.xpath('//*[@id="task-dialog"]/div[3]/div[2]/button')); }},


    currentQuestion: { get:   function ()            { return element(by.model('currentQuestion.text')); }},

    taskThumb:{ get:   function ()            { return element.all(by.css( '.ui-thumbnail.medium.light' )) }},

    task:{ get:   function ()            { return element(by.xpath('//*[@id="transclude-editQuestionModal"]/div[1]/ui-content/div/div/div/div[1]')); }},

    startPage:{ get:   function ()            { return element.all(by.css( '[ng-click="setStart(page);saveTask()"]' )) }},
    targetPage:{ get:   function ()            { return element.all(by.css( '[ng-click="setTarget(page);saveTask()"]' )) }},


    openNewQuestion:          { get:   function ()          { return element(by.css('[ng-click="openAssetsModal()"]')); }},
    errorToast:          { get:   function ()          { return element(by.css('.ui-toast-delete.ui-toast-close')); }},

    selectBtn:                { get:   function ()          { return element.all(by.buttonText('DONE')); }},

    newtask:                  { get:   function ()            { return element.all(by.css('.ur-action-text')); }},
    tileDeleteIcon:           { get:   function ()            { return element.all(by.css('.delete-icon')); }},

    confDelete:               { get:   function ()            { return element(by.css('#delete-confirm3 [ng-click*=\"closeDialog()\"]')); }},

    //Edit Study
    txtStudyHeader:           { get:   function ()            { return element(by.css( '#study-edit .heading h1' )); }},
    divStudyBody:             { get:   function ()            { return element(by.css( '#questions-list' )); }},
    btnPencil:                { get:   function ()            { return element(by.css( '.edit-name-actions' )); }},
        txtEditName:          { get:   function ()            { return element(by.model( 'study.name' )) ;}},
        txtDescription:       { get:   function ()            { return element(by.model( 'study.description' )) ;}},
        btnCancelEdit:        { get:   function ()            { return element(by.css( '#study-name [ng-click*=\"onCancelEditName()\"]' )); }},
        btnSaveEdit:          { get:   function ()            { return element(by.css( '#study-name [ng-click*=\"save()\"]' )); }},
    picUpload:                { get:   function ()            { return element(by.css( '#file' )); }},
    btnUpload:                { get:   function ()            { return element(by.css( '#studyUploadButton' )); }},
    btnPreviewDraft:          { get:   function ()            { return element(by.css( '#study-edit .icon-eye' )) }},
    btnPreviewReview:          { get:   function ()            { return element(by.css( '[ng-click="preview()"]' )) }},
    btnPublish:               { get:   function ()            { return element(by.css( '#study-edit [ng-click*=\"publish()\"]' )); }},
        btnCancelPublish:     { get:   function ()            { return element(by.css( '#publishPopup [ng-click*=\"cancelDialog()\"]' )); }},
        btnConfirmPublish:    { get:   function ()            { return element(by.css( '#publishPopup [ng-click*=\"closeDialog()\"]' )); }},
    btnDeleteStudy:           { get:   function ()            { return element(by.css( '.trash-icon' )); }},
        btnCancelStudyDelete: { get:   function ()            { return element(by.css( '#delete-study-confirm .ui-dialog-cancel' )); }},
        btnConfirmStudyDelete:{ get:   function ()            { return element(by.css( '#delete-study-confirm [ng-click*=\"closeDialog();\"]' )); }},
    lnkScreenUpload:          { get:   function ()            { return element(by.css( '#uploadText' )) }},
    lnkScreenDocs:            { get:   function ()            { return element(by.css( '#questions-list [ng-click*=\"openAssetsModal()\"]' )); }},

    charLimit:{ get:   function ()            { return element(by.css( '.selected .numbers' )) }},

    delIcon:{ get:   function ()            { return element.all(by.css( '.delete-icon' )) }},




    iconLink: { get:   function ()            { return element(by.css( '.icon.link' )); }},
    studyUrl: { get:   function ()            { return element(by.css( '.ui-input.light' )); }},
    studyNumbers:            { get:   function ()            { return element.all(by.css( '.badge.ng-binding' )); }},

    //Screens ( screen: order number of screen to select [0,1,2,...] )
    imgScreens:               { get:   function ()            { return element.all(by.css( '#questions-list [ng-click*=\"goToQuestions(question._id)\"]' )); }},
        btnDeleteScreen:      { value: function (screen)      { return element(by.css( '#questions-list [ui-dialog-open*=\"delete-confirm' + screen + '\"]')); }},
            btnCancelScreenDelete:  { value: function(screen) { return element(by.css( '[id*=\"delete-confirm' + screen + '\"] .ui-dialog')); }},
            btnConfirmScreenDelete: { value: function(screen) { return element(by.css( '[id*=\"delete-confirm' + screen + '\"] [ng-click+=\"closeDialog();\"]')); }},
        btnAddQuestions:      { value: function (screen)      { return element(by.css( '#questions-list [ui-popup-open*=\"edit-question-popup' + screen + '\"]' )); }},
    btnRemoveFromStudy:       { get:   function ()            { return element(by.css( '#study-edit-screen [ui-dialog-open*=\"delete-screen-confirm\"]')); }},
        btnConfirmRemove:     { get:   function()             { return element(by.css( '#delete-screen-confirm .ui-dialog-close')); }},
        btnCancelRemove:      { get:   function()             { return element(by.css( '#delete-screen-confirm .ui-dialog-cancel')); }},

    //Questions ( screen: order number of screen to select questions for )
    screen_window:            { get:   function ()            { return element(by.css( '#transclude-editQuestionModal' )); }},
        screen_txtQuestions:  { get:   function ()            { return element.all(by.model( 'question.text')); }},
        screen_btnSaveQuest:  { get:   function ()            { return element(by.css('.close')); }},
        screen_btnNextQuest:  { get:   function ()            { return element(by.buttonText( 'NEXT' )); }},
        screen_btnNewQuest:   { get:   function ()            { return element(by.css( '#questions-edit .add-question' )); }},
        screen_btnDeleteQuest:{ get:   function ()            { return element.all(by.css( '#questions-edit .delete-icon' )); }},
    questiongreenTick:{ get:   function ()            { return element.all(by.css( '.question-count' )); }},


    drpAnnotationLimit: { get:   function ()            { return element(by.model( 'question.answerLimit')); }},
    selectLimit:        { get:   function ()            { return element(by.css('option[value="2"]')); }},
    mulChoiceQst:       { get:   function ()            { return element.all(by.model( 'question.answerOptions[$index]')); }},
    addMltChoiceQst:    { get:   function ()            { return element.all(by.css( '[ng-click="addChoice(question);"]')); }},


    ansAnnOnly: {get:   function ()            { return element(by.css('label[for="questionType1-0"]'));}},
    ansCheckAnn0: {get:   function ()            { return element(by.css('label[for="checkAnnotation-0"]'));}},
    ansFreeTxt:{get:   function ()            { return element(by.css('label[for="questionType2-0"]'));}},
    ansMltChoice:{get:   function ()            { return element(by.css('label[for="questionType3-0"]'));}},
    ansMltAns:{get:   function ()            { return element(by.css('label[for="checkEnableMultiple-0"]'));}},

    setAnnotationLimit: {   value: function(value)           {
        this.drpAnnotationLimit.click()
        browser.waitForAngular();
        this.selectLimit.click();
        browser.waitForAngular();
    }},

    activateAnnoCheckBox: {   value: function () {
        var control = browser.driver.findElement(by.id('checkAnnotation-0'));
        browser.driver.executeScript("arguments[0].style.display = 'inline'; ", control).then(function(){
            control.click();
        });}},

    activateMultipleChoiceCheckBox: {   value: function () {
        var control = browser.driver.findElement(by.id('checkEnableMultiple-0'));
        browser.driver.executeScript("arguments[0].style.display = 'inline'; ", control).then(function(){
            control.click();
        });}},

    activateAnnoOnly: {   value: function () {
        var control = browser.driver.findElement(by.id('questionType1-0'));
        browser.driver.executeScript("arguments[0].style.display = 'inline'; ", control).then(function(){
            control.click();
        });}},

    AnnoOnly: {   value: function () {
        this.ansAnnOnly.click();
    }},

    checkAnno:{   value: function () {
        this.ansCheckAnn0.click();
    }},

    freeText: {   value: function () {
        this.ansFreeTxt.click();
    }},

    mltChoice: {   value: function () {
        this.ansMltChoice.click();
    }},

    checkMltAns: {   value: function () {
        this.ansMltAns.click();
    }},

    mouseOverTile:{   value: function () {
        browser.actions().mouseMove(this.imgScreens.last()).perform();
    }},

    enterUserGuidence:{ value: function (question) {
        this.currentQuestion.clear();
        browser.waitForAngular();
        this.currentQuestion.sendKeys(question);
    }},

    setStart:{   value: function () {
        browser.actions().mouseMove(this.taskThumb.first()).perform();
        browser.waitForAngular();
        this.startPage.first().click();
    }},

    setTarget:{   value: function () {
        browser.actions().mouseMove(this.taskThumb.first()).perform();
        browser.waitForAngular();
        this.targetPage.first().click();
    }},

    deleteLastTile:{   value: function () {
        this.tileDeleteIcon.last().click();
    }},

    activateFreeTxtOnly: {   value: function () {
        var control = browser.driver.findElement(by.id('questionType2-0'));
        browser.driver.executeScript("arguments[0].style.display = 'inline'; ", control).then(function(){
            control.click();
        });}},

    activateMltChoiceOnly: {   value: function () {
        var control = browser.driver.findElement(by.id('questionType3-0'));
        browser.driver.executeScript("arguments[0].style.display = 'inline'; ", control).then(function(){
            control.click();
        });}},

    //Published
    txtStudyLink:             { get:   function ()            { return element(by.css( '#study-published input' )); }},
    btnPublishedDone:         { get:   function ()            { return element(by.css( '#study-published [ng-click*=\"done()\"]' )); }},


    //ACTIONS
    clickNewStudy:     {   value: function()           { this.btnCreateStudy.click()}},
    clickSave:     {   value: function()           { this.btnSaveEdit.click()}},
    uploadPicture: { value: function(keys)  {return this.picUpload.sendKeys(keys)}},
    clickSaveAndClose: {   value: function()           { this.screen_btnSaveQuest.click()}},
    clickSaveAndNext: {   value: function()           { this.screen_btnNextQuest.click()}},
    clickPublish: {   value: function()           { this.btnPublish.click()}},
    clickPublishConfirm: {   value: function()           { this.btnConfirmPublish.click()}},
    clickPublishDone:{   value: function()           { this.btnPublishedDone.click()}},
    clickIconLink: {   value: function()           { this.iconLink.click()}},

    clickCloseToast: {   value: function()           { this.errorToast.click()}},

    clickPreview: {   value: function()           { this.btnPreviewDraft.click()}},
    clickRevPreview: {   value: function()           { this.btnPreviewReview.click()}},

    enterQuestion:{ value: function(keys)  {return this.screen_txtQuestions.get(0).sendKeys(keys)}},



    EnterQuestionAnnotionOnly:              { value: function (question) {
        this.enterQuestion(question);
    }},

    EnterQuestionFreeTextOnly:              { value: function (question) {
        this.enterQuestion(question);
    }},

    EnterQuestionMultipleChoice2Answers:              { value: function (question, mult1, mult2) {
        this.enterQuestion(question);
        this.mulChoiceQst.first().click();
        browser.waitForAngular();
        this.mulChoiceQst.first().sendKeys(mult1);
        browser.waitForAngular();
        this.mulChoiceQst.last().click();
        browser.waitForAngular();
        this.mulChoiceQst.last().sendKeys(mult2);
        browser.waitForAngular();
    }},

    EnterQuestionMultipleChoice3Answers:              { value: function (question, mult1, mult2, mult3) {
        this.addMltChoiceQst.click();
        this.enterQuestion(question);
        this.mulChoiceQst.first().click();
        browser.waitForAngular();
        this.mulChoiceQst.first().sendKeys(mult1);
        browser.waitForAngular();
        this.mulChoiceQst.get(1).click();
        browser.waitForAngular();
        this.mulChoiceQst.get(1).sendKeys(mult2);
        browser.waitForAngular();
        this.mulChoiceQst.last().click();
        browser.waitForAngular();
        this.mulChoiceQst.last().sendKeys(mult3);
        browser.waitForAngular();
    }},


    doUpload: { value: function (file) {
       this.upload.last().sendKeys(file);
    }},

    clickNewTask:{ value: function () {
        this.newtask.first().click();
    }},


    uploadZip: {value: function (file) {
        browser.waitForAngular();
        this.browseBtn.click();
        browser.waitForAngular();
        this.zipUpload.sendKeys(file);
        browser.waitForAngular();
    }},

    nameTask:{value: function (name) {
        browser.waitForAngular();
        this.taskName.clear();
        browser.waitForAngular();
        this.taskName.sendKeys(name);
        browser.waitForAngular();
        this.confirmTaskName.click();
        browser.waitForAngular();
    }},


    clickNewQst: { value: function () {
        //    this.openNewQuestion.click();
        var ele = browser.driver.findElement(by.xpath('//*[@id="study-edit"]/ui-toolbar[1]/div[3]/div[2]'));
        browser.executeScript('arguments[0].click()',ele );
    }},

    clickSelect: { value: function () {
        this.selectBtn.last().click();
    }},


    //GROUPED ACTIONS (composed of multiple project page object actions)

    /**
     * Creates a new study with given name
     * @param {String} name      : name to given to the new study
     * @param {String} desc      : description to given to the new study
     */
    createStudyUi:              { value: function (name, desc) {
        this.txtEditName.sendKeys(name);
        this.txtDescription.sendKeys(desc);
    }},


    /**
     * Deletes a study, when in a study
     */
    deleteStudy:              { value: function () {
        this.btnDeleteStudy.click();
        this.btnConfirmStudyDelete.click();
        browser.driver.sleep(350);
    }},

    /**
     * Deletes a screen when in a study
     * @param {String}/{int} screen      :position of screen in list (0,1,2...)
     */
    deleteScreen:              { value: function (screen_num) {
        var screen = this.imgScreens.get(screen_num);
        browser.actions().mouseMove(screen, 0, 0).perform();
        this.btnDeleteScreen(screen_num).click();
        this.btnConfirmScreenDelete(screen_num).click();
        browser.waitForAngular();
    }},

    confirmDeleteTile: {   value: function () {
        //var control = browser.driver.findElement(by.css('#delete-confirm3 [ng-click*=\"closeDialog()\"]'));
        //browser.driver.executeScript("arguments[0].click();", control.click());
        this.confDelete.click();
    }},

    clickImgThumbs: { value: function()       {
        this.imgThumb.first().click();
        browser.waitForAngular();
        this.imgThumb.get(1).click();
        browser.waitForAngular();
        this.imgThumb.get(2).click();
        browser.waitForAngular();
        this.imgThumb.get(3).click();
        browser.waitForAngular();
    }},


    dragDrop: {   value: function () {

        var drag = element(by.css('.screen.ng-scope.showOver'));
        var origin = this.imgScreens.last();
        var target = this.imgScreens.first();

        //browser.actions().mouseDown(origin).mouseMove(target).mouseUp().perform();

      //  browser.actions().mouseMove(origin, 0).mouseDown().mouseMove(drag, 0).mouseMove(drag, target).mouseUp().perform();
    }},

    userEmailBox:           {    get: function ()       {       return element(by.id('inviteEmail')); }},
    clickEmailBox:          {    value: function()      {       this.userEmailBox.click()}},

    emailInviteAddBtn:      {    get: function ()       {       return element(by.id('inviteAdd')); }},
    clickInviteAddBtn:      {    value: function()      {       this.emailInviteAddBtn.click()}},


    enterEmail:             {   value: function (email) {       this.enterInviteEmail(email);}},

    enterInviteEmail:       {   value: function (keys)  {       return this.userEmailBox.sendKeys(keys);}},
    pendingInviteList:      {   get: function ()        {       return element(by.css('.invite-email'))}},

    deletePendingEmail:         {    get: function ()    {      return element(by.css('.action.icon-delete.small')); }},
    clickDeletePendingEmail:    {   value: function ()   {      this.deletePendingEmail.click(); }},

    addEmailInviteErrorToast:   { get: function ()      {       return element(by.css('.emailErrorToast')); }}




});

module.exports = UserRe;

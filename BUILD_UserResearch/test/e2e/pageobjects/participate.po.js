/**
 * Created by I313762 on 25/02/2015.
 */
/**
 * Projects Selenium Page Object for Study Participant page
 * Created by I313762 on 10/02/2015.
 */

'use strict';

var Partic = function (value, cb) {

    if(value.length > 0){
        browser.get(value);
    }
    if (typeof cb === 'function') cb()
};

Partic.prototype = Object.create({}, {
    //SELECTORS
    txtStudyName:          { get:   function ()            { return element(by.css( '#participant-list h1' )); }},
    txtStudyDesc:          { get:   function ()            { return element(by.css( '#participant-list .description' )); }},
    btnStart:              { get:   function ()            { return element(by.css( '#participant-list [ng-click*="goToQuestion(findNextUnansweredQ())"]' )); }},

    imgThumbs:             { get:   function ()            { return element.all(by.css( '#participant-list div.screens [ng-click*="goToQuestion(question._id)"]' )); }},
    lnkTryNorman:          { get:   function ()            { return element(by.css( '#participant-list a.message-link' )); }},
    btnNext:               { get:   function ()            { return element(by.css( '#norman-user-research [ng-click*="next()"]' )); }},
    btnPrev:               { get:   function ()            { return element(by.css( '#norman-user-research .question-header div.previous' )); }},
    btnDoneStudy:          { get:   function ()            { return element(by.css( '[ng-click="returnToStudy()"]' )); }},
    answerPanel:          { get:   function ()            { return element(by.css( ' .question-panel' )); }},

    btnScreenNum:          { get:   function ()            { return element.all(by.css( '#norman-user-research [ng-click*="onNumberClick($index)"]' )); }},
    lnkStudyName:          { get:   function ()            { return element(by.css( '#norman-user-research .go-to-list' )); }},
    imgScreen:             { get:   function ()            { return element(by.css( '.screen-container' )); }},

    annotation:            { get:   function ()            { return element.all(by.css( '.annotation-icon' )); }},
    annoComment:           { get:   function ()            { return element.all(by.model( 'details[commentPath]' )); }},
    annoDelete:            { get:   function ()            { return element.all(by.css( '[ng-click="delete(commentDetails)"]' )); }},
    annoDone:              { get:   function ()            { return element.all(by.css( '.annotation-popup-participant  [ng-click*="onSave()"]' )); }},
    annoEdit:              { get:   function ()            { return element.all(by.css( '[ng-click="startEdit($event)"]' )); }},
    noMore:                { get:   function ()            { return element(by.css( '.tooltip-not-allowed' )); }},
    saveBtn:               { get:   function ()            { return element(by.css('.answer-panel  [ng-click*="onSave()"]'));}},

    screenWrap:{ get:   function ()            { return element(by.css('.screen-wrapper'));}},

    startTaskBtn:          { get:   function ()            { return element(by.buttonText('START TASK')); }},
    feedbackBtn:          { get:   function ()             { return element.all(by.css( '[ng-click="changeFeedbackMode($event);"]' )); }},
    finishTask:           { get:   function ()             { return element.all(by.css( '[ng-click="endTask(true)"]' )); }},
    congrats:           { get:   function ()             { return element(by.css( '.congrats-image' )); }},



//    freeTextAnswer:        { get:   function ()            { return element.all(by.css('.annotation-comment'));}},
    annon:{get:   function ()            { return element(by.css('label[for="anon-check"]'));}},
    annonChked:{get:   function ()            { return element(by.css('.checked'));}},
    freeTextAnswer:        { get:   function ()            { return element(by.css('.freeform-answer .annotation-comment'));}},


    choiceBtn1: { get:   function ()            { return element(by.css('label[for="choice_0"]'));}},
    choiceBtn2: { get:   function ()            { return element(by.css('label[for="choice_1"]'));}},
    choiceBtn3: { get:   function ()            { return element(by.css('label[for="choice_2"]'));}},


    happySentiment:{ get:   function ()            { return element.all(by.id( 'button-happy' )); }},
    sadSentiment:{ get:   function ()            { return element.all(by.id( 'button-sad' )); }},
    noSentiment:{ get:   function ()            { return element.all(by.id( 'button-neutral' )); }},



    participateTick:       {get:   function ()            { return element.all(by.css( '.tick-icon' )); }},


    choiceRadioBtn:       {get:   function ()            { return element(by.css('label[for="choice_0"]' )); }},

    protoPage1Link:            {get:   function ()            { return element(by.linkText('Link to page1')); }},
    clickProtoLink1:     {   value: function()           { this.protoPage1Link.click()}},
    protoHomeLink:            {get:   function ()            { return element(by.linkText('Link to index')); }},
    clickProtoIndex:     {   value: function()           { this.protoHomeLink.click()}},


    /////Prototype Area:
    takeAction:         {get:   function ()            { return element(by.id('u1445')); }},
    talent:         {get:   function ()            { return element(by.id('u1378')); }},

    clickOnTheProtoType:     {   value: function()           {
    //    this.takeAction.click();
      //  browser.sleep(500);
        //this.talent.click();
        for(var i = 0; i < 10; i++) {
            browser.actions()
                .mouseMove(element(by.css('.screen-container')), {
                    x: this.getRand(),
                    y: this.getRand()
                }).click().perform();
            browser.sleep(50);
        }
    }},


    switchToIframe:     {   value: function()           {
        browser.switchTo().frame('prototype-iframe');
    }},

    switchToDefault:     {   value: function()           {
        browser.switchTo().defaultContent();
    }},

    //ACTIONS

    clickStartStudy:     {   value: function()           { this.btnStart.click()}},
    clickNextImg:        {   value: function()           { this.btnNext.click()}},
    clickPrevImg:        {   value: function()           { this.btnPrev.click()}},
    clickSutdyDone:      {   value: function()           { this.btnDoneStudy.click()}},
    drpAnnotation:       {   value: function()             { this.imgScreen.click() }},
    clickAnnon:       {   value: function()             { this.annon.click() }},

    getRand:          { value: function () {
        var num  = (Math.floor((Math.random() * 25))) + 30;
        if (Math.floor((Math.random() * 2)) == 0) num*=-1;
        return num
    }},

    createAnnotation:          { value: function (comment, loop) {
        browser.sleep(750);
        this.drpAnnotation();
        browser.sleep(750);
        var anno = this.annotation.last();
        this.annoComment.last().sendKeys(comment);
        browser.sleep(750);
        if(loop==0) {
            this.happySentiment.click();
        }else if(loop==1) {
            this.sadSentiment.click();
        }else{
            this.noSentiment.click();
        }
        browser.sleep(750);
        this.clickSaveAnnoBtn();
        browser.sleep(750);
        this.answerPanel.click();
        browser.sleep(750);
        browser.actions().mouseMove(anno, 0).mouseDown().mouseMove(anno, 0).mouseMove(anno, {x:this.getRand(), y:this.getRand()}).mouseUp().perform();
        browser.sleep(750);
    }},

    createAnnotationsNoSent:          { value: function (comment) {
        browser.sleep(750);
        this.drpAnnotation();
        browser.sleep(750);
        var anno = this.annotation.last();
        this.annoComment.last().sendKeys(comment);
        browser.sleep(750);
        this.clickSaveAnnoBtn();
        browser.sleep(750);
        this.answerPanel.click();
        browser.sleep(750);
        browser.actions().mouseMove(anno, 0).mouseDown().mouseMove(anno, 0).mouseMove(anno, {x:this.getRand(), y:this.getRand()}).mouseUp().perform();
        browser.sleep(750);
    }},

    ansFreeTextQst:          { value: function (value) {
        this.annoComment.first().click();
        browser.waitForAngular();
        this.annoComment.first().sendKeys(value);
        browser.waitForAngular();
        this.clickSaveBtn();
}},

    deleteAnnotation:          { value: function () {
        this.annotation.last().click();
        this.annoDelete.last().click();
    }},
    goToScreen:                 { value: function (num) {
        this.imgThumbs.get(num - 1).click();
    }},


    clickSaveBtn: {   value: function () {
        var control = browser.driver.findElement(by.css('.answer-panel  [ng-click*="onSave()"]'));
        browser.driver.executeScript("arguments[0].click()", control);
       // this.saveBtn.click();
    }},


    clickSaveAnnoBtn: {   value: function () {
        var control = browser.driver.findElement(by.css('.annotation-popup-participant  [ng-click*="onSave()"]'));
        browser.driver.executeScript("arguments[0].click()", control);
        //this.annoDone.click();
    }},

    clickThisOption: {   value: function () {
        //var control = element(by.id('choice_0'));
        //browser.executeScript("arguments[0].style.display = 'inline'; ", control).then(function(){
        //    control.click();
        this.choiceBtn1.click();
        }},


    clickThatOption: {   value: function () {
        //var control = browser.driver.findElement(by.css('label[for="choice_1"]'));
        //browser.driver.executeScript("arguments[0].click()", control);
        this.choiceBtn2.click();
    }},

    clickThoseOption: {   value: function () {
        //var control = browser.driver.findElement(by.css('label[for="choice_2"]'));
        //browser.driver.executeScript("arguments[0].click()", control);
        this.choiceBtn3.click();
    }},

    clickStartTask: {   value: function () {
        //var control = browser.driver.findElement(by.css('label[for="choice_2"]'));
        //browser.driver.executeScript("arguments[0].click()", control);
        this.startTaskBtn.click();
    }},

    clickFeedback: {   value: function () {
        //var control = browser.driver.findElement(by.css('label[for="choice_2"]'));
        //browser.driver.executeScript("arguments[0].click()", control);
        this.feedbackBtn.click();
    }},
    clickFinish: {   value: function () {
        //var control = browser.driver.findElement(by.css('label[for="choice_2"]'));
        //browser.driver.executeScript("arguments[0].click()", control);
        this.finishTask.click();
    }}



});

module.exports = Partic;

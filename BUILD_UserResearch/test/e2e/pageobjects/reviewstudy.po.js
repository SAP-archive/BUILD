'use strict';

var StudyReview = function (value, cb) {
	if(value.length > 0){
		var url = value.charAt(0) == '/' ? value : "/" + value;
		browser.get(url);
	}
	if (typeof cb === 'function') cb()
};


StudyReview.prototype = Object.create({}, {
	//SELECTORS
	tabResearch:    { get:   function ()            { return element(by.css( '.aside .research' )); }},
	protoPageHeader :         { get:   function ()            { return element(by.xpath( "//*[@id='project-prototype']//h1[contains(text(), 'Prototype pages')]"  )); }},
	lnkDraft2:                { get:   function ()            { return element(by.xpath( "//*[@id='norman-user-research']//ul//li[contains(text(), 'Draft')]"  )); }},
	lnkActive:                { get:   function ()            { return element(by.css( '#norman-user-research [ng-click*=\"statusFilter = \'active\'\"]' )); }},
	lnkDraft:                 { get:   function ()            { return element(by.css( '#norman-user-research [ng-click*=\"statusFilter = \'draft\'\"]' )); }},
	lnkArchived:              { get:   function ()            { return element(by.css( '#norman-user-research [ng-click*=\"statusFilter = \'archived\'\"]' )); }},
	activeCount :        { get:   function ()            { return element(by.xpath( "//*[@id='norman-user-research']//li[1]/span")); }},
	draftCount :         { get:   function ()            { return element(by.xpath( "//*[@id='norman-user-research']//li[2]/span")); }},
	archivedCount :      { get:   function ()            { return element(by.xpath( "//*[@id='norman-user-research']//li[3]/span")); }},
	studyDisplayed :        { get:   function ()            { return element.all(by.repeater('study in studies'));  }},
	//studyName:              { get:   function ()            { return element(by.binding('name'));  }},
    studyName:              { get:   function ()            { return element(by.css('.study-tile-title-0'));  }},

	studyQuestionText:      { get:   function ()            { return element(by.binding('question.text'));  }},
    studyTile:      { get:   function ()            { return element(by.css('.ui-study-tile'));  }},
	annotationTotal :        { get:   function ()            { return element.all(by.repeater('annotation in qAnnotations'));  }},
	annotationiconTotal :        { get:   function ()            { return element.all(by.css('.annotation-icon'));  }},
    qstReviewCarousel:  { get:   function ()            { return element(by.css( '.question-review-carousel' )); }},


    annon:{ get:   function ()            { return element.all(by.css( '.annotation-participant-name' )); }},
    linkicon:{ get:   function ()            { return element(by.css( '.ico-link' )); }},

    protoTab:{ get:   function ()            { return element(by.id( 'prototype-tab' )); }},
    statsTab:{ get:   function ()            { return element(by.id( 'review-detail-statistics' )); }},
    enableAnno:{ get:   function ()            { return element(by.css( '.show-annotations' )); }},

    reviewOverview:  { get:   function ()            { return element(by.css( '#study-review-overview' )); }},
    reviewPart: { get:   function ()            { return element(by.css( '.action.icon-big-participant' )); }},
    reviewAnno:{ get:   function ()            { return element(by.css( '.action.icon-big-annotation' )); }},
    reviewComment:{ get:   function ()            { return element(by.css( '.action.icon-big-comments' )); }},
    reviewPIe:{ get:   function ()            { return element(by.css( '.pieID' )); }},

    reviewSad:{ get:   function ()            { return element(by.css( '.action.icon-face-sad' )); }},
    reviewHappy:{ get:   function ()            { return element(by.css( '.action.icon-face-smile' )); }},
    reviewNeut:{ get:   function ()            { return element(by.css( '.action.icon-face-normal' )); }},

    overviewLink:{ get:   function ()            { return element(by.partialLinkText('Overview')); }},
    tskQstLink:{ get:   function ()            { return element(by.partialLinkText( 'Tasks & Questions' )); }},
    partLink:{ get:   function ()            { return element(by.partialLinkText( 'Participants' )); }},
    partInviteLink: { get:   function ()            { return element(by.partialLinkText('Participant Invitation')); }},
    settingsLink:{ get:   function ()            { return element(by.partialLinkText( 'Settings' )); }},

    pauseChck:  { get:   function ()            { return element(by.css('label[for="chb-pause"]'));  }},
    restartChck:  { get:   function ()            { return element(by.css('label[for="chb-restart"]'));  }},
    restartUnArchChck:  { get:   function ()            { return element(by.css('label[for="chb-unarchive"]'));  }},
    archChck:  { get:   function ()            { return element(by.css('label[for="chb-archive"]'));  }},
    pauseBtn:   { get:   function ()            { return element(by.css('.btn-pause'));  }},
    archBtn:   { get:   function ()            { return element(by.buttonText('ARCHIVE'));  }},
    restartBtn:   { get:   function ()            { return element(by.buttonText('RESTART'));  }},

    pauseIcon:{ get:   function ()            { return element(by.css('.paused'));  }},

    questions:{ get:   function ()            { return element.all(by.css( '.action-txt.ng-binding' )); }},
    questionsLink:{ get:   function ()            { return element.all(by.css( '[ng-click="goToQuestions(question._id)"]' )); }},

    annoFilter:{ get:   function ()            { return element.all(by.model( 'currentFilter.list' )); }},
    selectAll:        { get:   function ()            { return element.all(by.css('option[value="0"]')); }},
    selectHappy:        { get:   function ()            { return element.all(by.css('option[value="1"]')); }},
    selectSad:        { get:   function ()            { return element.all(by.css('option[value="3"]')); }},
    selectInd:        { get:   function ()            { return element.all(by.css('option[value="2"]')); }},
    selectNone:        { get:   function ()            { return element.all(by.css('option[value="4"]')); }},

    questText:{ get:   function ()            { return element(by.css( '.question.ng-binding' )); }},

    //Review Page Elements:
    prevBtn:    { get:   function ()            { return element(by.buttonText('PREVIOUS'));  }},
    nextBtn:    { get:   function ()            { return element(by.buttonText('NEXT'));  }},
    imageContainer: { get:   function ()            { return element(by.css('.image-review-wrapper'));  }},
    empChk:     { get:   function ()            { return element(by.css('label[for="emphasizeCheck"]'));  }},
    gladChk:    { get:   function ()            { return element(by.css('label[for="happyCheck"]'));  }},
    sadChk:     { get:   function ()            { return element(by.css('label[for="sadCheck"]'));  }},
    nuetChk:    { get:   function ()            { return element(by.css('label[for="neutralCheck"]'));  }},
    noneChk:    { get:   function ()            { return element(by.css('label[for="noneCheck"]'));  }},
    partLnk:    { get:   function ()            { return element(by.css('.icon-link'));  }},
    previewLnk: { get:   function ()            { return element(by.css('.icon-eye'));  }},
    btnStatus:  { get:   function ()            { return element(by.buttonText('PAUSE'));  }},
    empOverlay:{ get:   function ()            { return element(by.css('.image-review-wrapper.ng-scope.emphasize'));  }},

    laserPointer:{ get:   function ()            { return element(by.css('.laser-pointer'));  }},
    sentimentContain:{ get:   function ()            { return element.all(by.css('.sentiment-container'));  }},

    goBackLink : { get:   function ()            { return element.all(by.css('[ng-click="goBack()"]' )); }},

    annotation:            { get:   function ()            { return element.all(by.css( '.annotation-icon' )); }},

    questionPopup:{ get:   function ()            { return element.all(by.css( '.ui-popup-content' )); }},
    questionText:   { get:   function ()            { return element.all(by.css( '.comment.ng-binding.ng-scope' )); }},
    nextAnno:   { get:   function ()            { return element(by.css( '[ng-click="nextAnnotation(annotation)"]' )); }},
    prevAnno:   { get:   function ()            { return element(by.css( '[ng-click="prevAnnotation(annotation)"]' )); }},


    progressbar:{ get:   function ()            { return element(by.css( '.progress-bar-bar' )); }},
    progressbarPercentage:{ get:   function ()            { return element.all(by.css( '.choice-results-text' )); }},


    //Task Stats:
    partNum:{ get:   function ()            { return element(by.css( '.progress-bar-bar' )); }},






	//ACTIONS
	clicktabResearch:    {   value: function()           { this.tabResearch.click(); browser.waitForAngular()}},
	clicklnkActive:      {   value: function()           { this.lnkActive.click(); browser.waitForAngular()}},
	clickInkDraft:       {   value: function()           { this.lnkDraft.click(); browser.waitForAngular()}},
	clicklnkArchived:    {   value: function()           { this.lnkArchived.click(); browser.waitForAngular()}},
	clickStudy:          {   value: function(pos)           { this.studyDisplayed.get(pos).click(); browser.waitForAngular()}},
    clickStudyTile:          {   value: function()           { this.studyTile.click(); }},
    clickNextBtn:          {   value: function()           { this.nextBtn.click(); }},
    clickPrevBtn:          {   value: function()           { this.prevBtn.click(); }},
    clickPause:          {   value: function()           { this.pauseBtn.click(); }},
    clickArichive:          {   value: function()           { this.archBtn.click(); }},
    clickRestart:          {   value: function()           { this.restartBtn.click(); }},
    clickNextAnno:          {   value: function()           { this.nextAnno.click(); }},
    clickPrevAnno:          {   value: function()           { this.prevAnno.click(); }},
    clickButton:         {   value: function(name)   { element(by.buttonText(name)).click(); browser.waitForAngular()}},

    clickGoBackLink:        {   value: function()           { this.goBackLink.click(); }},



    clickSentimentContainer:{value: function()           { this.sentimentContain.first().click(); }},

    clickHappy: {value: function()           { this.gladChk.click(); }},
    clickSad: {value: function()           { this.sadChk.click(); }},
    clickNuetral: {value: function()           { this.nuetChk.click(); }},
    clickNone: {value: function()           { this.noneChk.click(); }},
    clickEmphasize: {value: function()           { this.empChk.click(); }},

    clickOvervew: {value: function()           { this.overviewLink.click(); }},
    clickTskQst: {value: function()           { this.tskQstLink.click(); }},
    clickPart: {value: function()           { this.partLink.click(); }},
    clickPartInvite: {value: function()           { this.partInviteLink.click(); }},
    clickSettings: {value: function()           { this.settingsLink.click(); }},

    clickQuestion:{value: function(pos)           { this.questions.get(pos).click(); }},


    filtering: {   value: function(value)           {
        this.annoFilter.last().click();
        browser.waitForAngular();
        if(value === 'All'){
            this.selectAll.last().click();
        }else if(value === 'Happy'){
            this.selectHappy.last().click();
        }else if(value === 'Indifferent'){
            this.selectInd.last().click();
        }else if(value === 'Sad'){
            this.selectSad.last().click();
        }else if(value === 'None'){
            this.selectNone.last().click();
        }
        browser.waitForAngular();
    }},

    clickAnno: {   value: function(pos)           { this.annotationiconTotal.get(pos).click(); }},

    pauseStudy:{   value: function(){
        this.pauseChck.click();
        browser.waitForAngular();
        this.pauseBtn.click();
    }},

    restartStudy:{   value: function(){
        this.restartChck.click();
        browser.waitForAngular();
        this.restartBtn.click();
    }},

    restartArchivedStudy:{   value: function(){
        this.restartUnArchChck.click();
        browser.waitForAngular();
        this.restartBtn.click();
    }},

    clickProtoType: {   value: function()           { this.protoTab.click(); }},
    clickStatistics: {   value: function()           { this.statsTab.click(); }},

    clickEnableAnno: {   value: function()           { this.enableAnno.click(); }},

    archiveStudy:{   value: function(){
        this.archChck.click();
        browser.waitForAngular();
        this.archBtn.click();
    }},


    // Feature #696


    averageTime:	{ get:		function ()			{	return element(by.binding('time-icon-value')); }},

    textBoxIconTotal:        { get:   function ()            { return element.all(by.css('.textbox-icon'));  }},

    participantNum:     {   get:   function ()  {       return element(by.binding( 'overview.participantsCount' )); }},
    partAnnoTotal:      {   get:    function () {       return element(by.binding('overview.averageAnnotations')); }},
    partCommTotal:      {   get:    function () {       return element(by.binding('overview.averageComments')); }},
    partTaskTotal:      {   get:    function () {       return element(by.binding('overview.averageCompletedTasks')); }},
    partAnswTotal:      {   get:    function () {       return element(by.binding('overview.averageAnswers')); }},

    particBrkDwn:  {   get:    function () {       return element.all(by.css('[ng-click="setSelected($index)"]' )); }},



    targetStats:{   get:    function () {       return element.all(by.css('.text-left.ng-binding' )); }},


    //Overview Page IDs:
    overviewparticipants: {get:    function () {       return element(by.id('overview-participants' )); }},
    overviewannotations:  {get:    function () {       return element(by.id('overview-annotations' )); }},
    overviewcomments:  {get:    function () {       return element(by.id('overview-comments' )); }},

    overviewaveragetime: {get:    function () {       return element(by.id('overview-average-time' )); }},


    overviewsentimentspositivetotal:  {get:    function () {       return element(by.id('overview-sentiments-positive-total' )); }},
    overviewsentimentspositivetotalpercentage:  {get:    function () {       return element(by.id('overview-sentiments-positive-percentage' )); }},

    overviewsentimentsnuetraltotal:  {get:    function () {       return element(by.id('overview-sentiments-nuetral-total' )); }},
    overviewsentimentsnuetraltotalpercentage:  {get:    function () {       return element(by.id('overview-sentiments-nuetral-percentage' )); }},

    overviewsentimentsnegativetotal:  {get:    function () {       return element(by.id('overview-sentiments-negative-total' )); }},
    overviewsentimentsnegativetotalpercentage:  {get:    function () {       return element(by.id('overview-sentiments-negative-percentage' )); }},

    overviewcompleted:  {get:    function () {       return element(by.id('overview-completed' )); }},

    overviewaverageDuration:  {get:    function () {       return element(by.id('overview-averageDuration' )); }},
    overviewshortestDuration:  {get:    function () {       return element(by.id('overview-shortestDuration' )); }},
    overviewlongestDuration:  {get:    function () {       return element(by.id('overview-longestDuration' )); }},


    overviewtaskssuccessfultotal:  {get:    function () {       return element(by.id('overview-tasks-successful-total' )); }},
    overviewtaskssuccessfulpercentage:  {get:    function () {       return element(by.id('overview-tasks-successful-percentage' )); }},

    overviewtasksfailedfultotal:  {get:    function () {       return element(by.id('overview-tasks-failed-total' )); }},
    overviewtasksfailedpercentage:  {get:    function () {       return element(by.id('overview-tasks-failed-percentage' )); }},

    overviewtasksabandonedtotal:  {get:    function () {       return element(by.id('overview-tasks-abandoned-total' )); }},
    overviewtasksabandonedpercentage:  {get:    function () {       return element(by.id('overview-tasks-abandoned-percentage' )); }},

    ///Tasks and Questions Page
    questionparticipants: {get:    function () {       return element.all(by.id('question-participants' )); }},
    questionname: {get:    function () {       return element.all(by.id('question-name' )); }},
    questiontext: {get:    function () {       return element.all(by.id('question-text' )); }},
    questionAvgPages: {get:    function () {       return element(by.id('question-averagePagesVisited' )); }},

    questionSuccessTotal: {get:    function () {       return element(by.id('question-successful-total' )); }},
    questionFailedTotal: {get:    function () {       return element(by.id('question-failed-total' )); }},
    questionAbandonedTotal: {get:    function () {       return element(by.id('question-abandoned-total' )); }},

    questionannotations:    {get:    function () {       return element.all(by.id('question-annotations' )); }},
    questioncomments:       {get:    function () {       return element.all(by.id('question-comments' )); }},

    questionsentimentspositivetotal:{get:    function () {       return element(by.id('question-sentiments-positive-total' )); }},
    questionsentimentsnuetraltotal:{get:    function () {       return element(by.id('question-sentiments-nuetral-total' )); }},
    questionsentimentsnegativetotal:{get:    function () {       return element(by.id('question-sentiments-negative-total' )); }},

    multichoicequestiontext: {get:    function () {       return element.all(by.id('multichoice-question-text' )); }},

    multichoicequestiontextrepsone: {get:    function () {       return element.all(by.id('multichoice-question-text-repsone' )); }},


    //Task Overview in Task:
    statsparticipantnumbercompleted:{get:    function () {       return element(by.id('stats-participant-number-completed' )); }},
    statsparticipantnumbernotcompleted:{get:    function () {       return element(by.id('stats-participant-number-not-completed' )); }},
    statsparticipantnumberabandoned:{get:    function () {       return element(by.id('stats-participant-number-abandoned' )); }},

    participantnumber:{get:    function () {       return element.all(by.id('participant-number' )); }},
    statstaskstatus:{get:    function () {       return element.all(by.id('stats-task-status' )); }},

    statsannotationcount:{get:    function () {       return element.all(by.id('stats-annotation-count' )); }},
    statscommentscount:{get:    function () {       return element.all(by.id('stats-comments-count' )); }},

    statspositiveanno:{get:    function () {       return element.all(by.id('stats-positive-anno' )); }},
    statsnuetralanno:{get:    function () {       return element.all(by.id('stats-nuetral-anno' )); }},
    statsnegativeanno:{get:    function () {       return element.all(by.id('stats-negative-anno' )); }},

    //Prototype Tab

    showheatmap:{get:    function () {       return element(by.css('show-heatmap' )); }},

    clickHeatmap: {   value: function()           { this.showheatmap.click(); }},

    heatmapcanvas:{get:    function () {       return element(by.id('heatmap-canvas' )); }},

    //Page Flow
    sankeyContainer:{get:    function () {       return element(by.css('.sankey-container' )); }},
    sankeytab:{get:    function () {       return element(by.id('sankey-tab' )); }},
    clickPageFlow: {   value: function()           { this.sankeytab.click(); }},

    pageNodes:{get:    function () {       return element.all(by.css('.node' )); }},

    //Statistics Tab:
    reviewdetailstatistics:{get:    function () {       return element(by.id('review-detail-statistics' )); }},
    clickStats: {   value: function()           { this.reviewdetailstatistics.click(); }},


    statsparticipantcount:{get:    function () {       return element(by.id('stats-participant-count' )); }},

    statsannotationscount:{get:    function () {       return element(by.id('stats-annotations-count' )); }},

    statsaveragetime:{get:    function () {       return element(by.id('stats-average-time' )); }},
    statsquickesttime:{get:    function () {       return element(by.id('stats-quickest-time' )); }},
    statsslowesttime:{get:    function () {       return element(by.id('stats-slowest-time' )); }},
    statspagevisited:{get:    function () {       return element(by.id('stats-page-visited' )); }},

    statssuccessfultotal:{get:    function () {       return element(by.id('stats-successful-total' )); }},
    statsfailedtotal:{get:    function () {       return element(by.id('stats-failed-total' )); }},
    statsabandonedtotal:{get:    function () {       return element(by.id('stats-abandoned-total' )); }},
    statspositivesentimenttotal:{get:    function () {       return element(by.id('stats-positive-sentiment-total' )); }},
    statsnuetralsentimenttotal:{get:    function () {       return element(by.id('stats-nuetral-sentiment-total' )); }},
    statsnegativesentimenttotal:{get:    function () {       return element(by.id('stats-negative-sentiment-total' )); }},

    statspositivetotal:{get:    function () {       return element(by.id('stats-positive-total' )); }},
    statsneutraltotal:{get:    function () {       return element(by.id('stats-neutral-total' )); }},
    statsnegativetotal:{get:    function () {       return element(by.id('stats-negative-total' )); }},
    statsfreeformpositivetotal:{get:    function () {       return element(by.id('stats-freeform-positive-total' )); }},
    statsfreeformnuetraltotal:{get:    function () {       return element(by.id('stats-freeform-nuetral-total' )); }},
    statsfreeformnegativetotal:{get:    function () {       return element(by.id('stats-freeform-negative-total' )); }},
    statisticsaverageDurationComment:{get:    function () {       return element(by.id('statistics-averageDurationComment' )); }}





});


module.exports = StudyReview;

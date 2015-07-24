'use strict';


var StudyReview = require('../../pageobjects/reviewstudy.po.js');
var UserRe = require('../../pageobjects/userResearch.po.js');
var chai = require('norman-testing-tp').chai;
var chaiAsPromised = require('norman-testing-tp')['chai-as-promised'];

chai.use(chaiAsPromised);

var expect = chai.expect;
var utility = require('../../support/utility.js');
var review = new StudyReview('');
var UserRePage = new UserRe('');


var StudyReviewURL;

module.exports = function() {


    this.Given(/^I am Study Menu Page$/, function (callback) {
        browser.waitForAngular();
        browser.get(StudyReviewURL);
        browser.waitForAngular();
        callback();
    });

	this.Then(/^Go back to previous page$/, function (callback) {
		browser.navigate().back();
        browser.waitForAngular();
		callback();
	});


	this.Then(/^Active Study group should be preselected be Active$/, function (callback) {
        browser.waitForAngular();
		expect(review.lnkActive.getAttribute("class")).to.eventually.equal("active").and.notify(callback);
	});


	//Draft
	this.When(/^I click draft study list$/, function (callback) {
        browser.waitForAngular();
        review.clickInkDraft();
        browser.waitForAngular();
		callback();
	});

    this.When(/^I click archive study list$/, function (callback) {
        browser.waitForAngular();
        review.clicklnkArchived();
        browser.waitForAngular();
        callback();
    });

	this.Then(/^Active Study group should be preselected be Draft$/, function (callback) {
        browser.waitForAngular();
        expect(review.lnkDraft.getAttribute("class")).to.eventually.equal("active").and.notify(callback);
	});

	//Archived
	this.When(/^I click Archived study$/, function (callback) {
        browser.waitForAngular();
        review.clicklnkArchived();
        browser.waitForAngular();
		callback();
	});

    this.When(/^I Click the Study Tile$/, function (callback) {
        browser.waitForAngular();
        review.clickStudyTile();
        browser.waitForAngular();
        callback();
    });

    this.Then(/^I am in Study Review Page$/, function (callback) {
        browser.waitForAngular();
        expect(review.reviewOverview.isEnabled()).to.eventually.equal(true).and.notify(callback);
    });

    this.Given(/^I am in Study Review Page$/, function (callback) {
        browser.waitForAngular();
        expect(browser.driver.getCurrentUrl()).to.eventually.match(/review/).and.notify(callback);
    });

    this.Given(/^I am in Question Review Page$/, function (callback) {
        browser.waitForAngular();
        expect(review.annoFilter.last().isEnabled()).to.eventually.equal(true).and.notify(callback);
    });

    this.When(/^I click Active study list$/, function (callback) {
        browser.waitForAngular();
        review.clicklnkActive();
        browser.waitForAngular();
        callback();
    });

    this.When(/^I am click the Tasks & Questions link$/, function (callback) {
        browser.waitForAngular();
        review.clickTskQst();
        browser.waitForAngular();
        callback();
    });

    this.Then(/^I am in the Question$/, function (callback) {
        browser.waitForAngular();
        expect(review.annoFilter.last().isEnabled()).to.eventually.equal(true).and.notify(callback);
    });

    this.Then(/^I see the "([^"]*)" Questions$/, function (num,callback) {
        browser.waitForAngular();
        expect(review.questions.count()).to.eventually.equal(parseInt(num)).and.notify(callback);
    });


    this.When(/^I click into the 1st Question$/, function (callback) {
        browser.waitForAngular();
        review.clickQuestion(0);
        browser.waitForAngular();
        callback();
    });

    this.When(/^I click Active study list$/, function (callback) {
        browser.waitForAngular();
        review.clicklnkActive();
        browser.waitForAngular();
        callback();
    });

	this.Then(/^Active Study group should be preselected be Archived$/, function (callback) {
        browser.waitForAngular();
        expect(review.lnkArchived.getAttribute("class")).to.eventually.equal("active").and.notify(callback);
	});



    this.When(/^I click a Sentiment$/, function (callback) {
        browser.waitForAngular();
        review.clickSentimentContainer();
        browser.waitForAngular();
        callback();
    });

    this.Then(/^I see the laser pointer$/, function (callback) {
        browser.waitForAngular();
        expect(review.laserPointer.isEnabled()).to.eventually.equal(true).and.notify(callback);
    });

    this.Then(/^The Sentiment Container count is "([^"]*)"$/, function (num, callback) {
        browser.waitForAngular();
        expect(review.sentimentContain.count()).to.eventually.equal(parseInt(num)).and.notify(callback);
    });

	//activeCount
	this.Then(/^Should be able to confirm the Active Study count$/, function (callback) {
        browser.waitForAngular();
		expect(review.activeCount.getText()).to.eventually.equal("1").and.notify(callback);
	});

    this.Then(/^Prgress bar is visibile$/, function (callback) {
        browser.waitForAngular();
        expect(review.progressbar.isEnabled()).to.eventually.equal(true).and.notify(callback);
    });

    this.Then(/^The "([^"]*)" Progress Bar is "([^"]*)"$/, function (pos, percentage, callback) {
        browser.waitForAngular();
        var position = pos-1;
        expect(review.progressbarPercentage.get(position).getText()).to.eventually.equal(percentage).and.notify(callback);
    });


	//draftCount
	this.Then(/^Should be able to confirm the Draft Study count$/, function (callback) {
        browser.waitForAngular();
		expect(review.draftCount.getText()).to.eventually.equal("2").and.notify(callback);
	});

	//archivedCount
	this.Then(/^Should be able to confirm the Archived Study count$/, function (callback) {
        browser.waitForAngular();
		expect(review.archivedCount.getText()).to.eventually.equal("1").and.notify(callback);
	});

	//activeCount
	this.Then(/^Should be able to confirm the number of Active Study displayed is (\d+)$/, function (count, callback) {
        browser.waitForAngular();
		expect(review.studyDisplayed.count()).to.eventually.equal(parseInt(count)).and.notify(callback);
	});


	this.Then(/^Should be able to select the study in position (\d+)$/, function (pos, callback) {
        browser.waitForAngular();
		review.clickStudy(parseInt(pos));
		callback();
	});

	this.When(/^Study name should be "([^"]*)"$/, function (studyname, callback) {
        browser.waitForAngular();
		expect(review.studyName.getText()).to.eventually.equal(studyname).and.notify(callback);
	});


	this.When(/^I click the button "([^"]*)" to go the next image$/, function (name, callback) {
        browser.waitForAngular();
        review.clickButton(name);
        browser.waitForAngular();
		callback();
	});

    this.When(/^I am on the 1st Question$/, function (callback) {
        browser.waitForAngular();
        expect(review.questText.getText()).to.eventually.equal('"Who am I?"').and.notify(callback);
    });

    this.When(/^I am on the "([^"]*)" Question$/, function (question, callback) {
        var qst = '"'+question+'"';
        browser.waitForAngular();
        expect(review.questText.getText()).to.eventually.equal(qst).and.notify(callback);
    });

    this.When(/^I am on the 2nd Question$/, function (callback) {
        browser.waitForAngular();
        expect(review.questText.getText()).to.eventually.equal('"What am I?"').and.notify(callback);
    });

    this.Then(/^I see "([^"]*)" Annotations$/, function (count, callback) {
        browser.waitForAngular();
        expect(review.annotationiconTotal.count()).to.eventually.equal(parseInt(count)).and.notify(callback);
    });

    this.When(/^I click Next$/, function (callback) {
        browser.waitForAngular();
        review.clickNextBtn();
        browser.waitForAngular();
        callback();
    });

    this.When(/^I filter Sentinment "([^"]*)"$/, function (sent, callback) {
        browser.waitForAngular();
        if(sent==='Happy'){
            review.filtering('Happy');
        }else if(sent==='Sad'){
            review.filtering('Sad');
        }else if(sent==='Indifferent'){
            review.filtering('Indifferent');
        }else if(sent==='None'){
            review.filtering('None');
        }else{
            review.filtering('All')
        }
        browser.waitForAngular();
        callback();
    });

    this.Then(/^I see emphasize overlay$/, function (callback) {
        browser.waitForAngular();
        expect(review.empOverlay.isEnabled()).to.eventually.equal(true).and.notify(callback);
    });


    this.When(/^I click on Study Tile$/, function (callback) {
        browser.waitForAngular();
        review.clickStudyTile();
        browser.waitForAngular();
        callback();
    });

    this.Then(/^I see "([^"]*)" Images with Question Ticks$/, function (count,callback) {
        browser.waitForAngular();
        expect(UserRePage.delIcon.count()).to.eventually.equal(parseInt(count)).and.notify(callback); //*2 for some strange DOM instance
    });

    this.Then(/^I see Images with Question Ticks$/, function (callback) {
        browser.waitForAngular();
        expect(UserRePage.questiongreenTick.first().isEnabled()).to.eventually.equal(true).and.notify(callback);
    });

    this.Then(/^The 1st comment should from Annon User$/, function (callback) {
        browser.waitForAngular();
        expect(review.annon.last().getText()).to.eventually.equal('Participant 1').and.notify(callback);
    });

    this.Then(/^I see the Link Icon$/, function (callback) {
        browser.waitForAngular();
        expect(review.linkicon.isEnabled()).to.eventually.equal(true).and.notify(callback);
    });

    this.Then(/^I end my Review$/, function (callback) {
        browser.waitForAngular();
        review.clickGoBackLink();
        browser.waitForAngular();
        callback();
    });

    this.Then(/^the study is paused$/, function (callback) {
        browser.waitForAngular();
        expect(review.pauseIcon.isEnabled()).to.eventually.equal(true).and.notify(callback)
    });

    this.When(/^I click Pause Button$/, function (callback) {
        browser.waitForAngular();
        review.clickPause();
        browser.waitForAngular();
        callback();
    });

    this.When(/^I go to the settings link in the menu$/, function (callback) {
        browser.waitForAngular();
        review.clickSettings()
        browser.waitForAngular();
        callback();
    });

    this.When(/^I Pause the study$/, function (callback) {
        browser.waitForAngular();
        review.pauseStudy();
        browser.waitForAngular();
        callback();
    });

    this.When(/^I Archive the study$/, function (callback) {
        browser.waitForAngular();
        review.archiveStudy();
        browser.waitForAngular();
        callback();
    });

    this.When(/^I Restart the study$/, function (callback) {
        browser.waitForAngular();
        review.restartStudy();
        browser.waitForAngular();
        callback();
    });

    this.When(/^I Restart Archived the study$/, function (callback) {
        browser.waitForAngular();
        review.restartArchivedStudy();
        browser.waitForAngular();
        callback();
    });

    this.When(/^Get Study Review URL$/, function (callback) {
        browser.waitForAngular();
        browser.driver.getCurrentUrl().then(function(url){
            StudyReviewURL = url;
            callback();
        });
    });

    this.When(/^I click Archive Button$/, function (callback) {
        browser.waitForAngular();
        review.clickArichive();
        browser.waitForAngular();
        callback();
    });

    this.When(/^I enable annotations$/, function (callback) {
        browser.waitForAngular();
        review.clickEnableAnno();
        browser.waitForAngular();
        callback();
    });

    this.When(/^I click on the Protoype Tab$/, function (callback) {
        browser.waitForAngular();
        review.clickProtoType();
        browser.waitForAngular();
        callback();
    });

    this.When(/^I click on the Statistics Tab$/, function (callback) {
        browser.waitForAngular();
        review.clickStatistics();
        browser.waitForAngular();
        callback();
    });

    // Feature  #696

    //this.Given(/^I am in Study Review Page$/, function (callback) {
    //    browser.waitForAngular();
    //    expect(review.reviewOverview.isEnabled()).to.eventually.equal(true).and.notify(callback);
    //});

    this.When(/^I go to the participant link in the menu$/, function (callback) {
        browser.waitForAngular();
        review.clickPart();
        browser.waitForAngular();
        callback();
    });

    this.When(/^I go to the participant invitation link in the menu$/, function (callback) {
        browser.waitForAngular();
        browser.sleep(1000);
        review.clickPartInvite();
        browser.sleep(1000);
        callback();
    });

    this.Then(/^I am on the Participant Page%/, function (callback) {
        browser.waitForAngular();
        expect(review.driver.getCurrentUrl().to.eventually.equal(/participant-overview/).and.notify(callback));
    });

    this.Then(/^I am on the Participant Invitation Page%/, function (callback) {
        browser.waitForAngular();
        browser.sleep(1000);
        expect(review.driver.getCurrentUrl().to.eventually.match(/participant-invitation/).and.notify(callback));
        browser.sleep(10000);
    });

    this.Given(/^I am on the Participant Page$/, function (callback) {
        browser.waitForAngular();
        expect(review.reviewPart.isEnabled()).to.eventually.equal(true).and.notify(callback);
    });

    this.Given(/^I am on the Participant Invitation Page$/, function (callback) {
            callback();
       });

    this.Then(/^The Study has been Participated in$/, function (callback) {
        browser.waitForAngular();
        expect(review.participantNum.isEnabled()).to.eventually.equal(true).and.notify(callback);
    });

    this.Then(/^Users have left feedback$/, function (callback) {
        browser.waitForAngular();
        // Write code here that turns the phrase above into concrete actions
        callback();
    });


    this.When(/^I see "([^"]*)" Participants in the Participant Breakdown Table$/, function (num, callback) {
        expect(review.particBrkDwn.count()).to.eventually.equal(parseInt(num)).and.notify(callback)
    });


    this.Then(/^I see "([^"]*)" Participants Task Target completion$/, function (num, callback) {
        expect(review.targetStats.first().getText()).to,eventually.equal(num).and.notify(callback);
    });

    this.Then(/^I see "([^"]*)" Participants Task Target not completed$/, function (num, callback) {
        expect(review.targetStats.get(1).getText()).to,eventually.equal(num).and.notify(callback);
    });

    this.When(/^I see "([^"]*)" Annotations in Participants$/, function (arg1, callback) {
        browser.waitForAngular();
        // Write code here that turns the phrase above into concrete actions
        expect(review.partAnnoTotal.getText()).to.eventually.equal(arg1).and.notify(callback);
    });

    this.Then(/^I see the "([^"]*)" Questions in Participants$/, function (arg1, callback) {
        browser.waitForAngular();
        // Write code here that turns the phrase above into concrete actions
        expect(review.partCommTotal.getText()).to.eventually.equal(arg1).and.notify(callback);
    });

    this.When(/^There should be "([^"]*)" Participants$/, function (part, callback) {
        browser.waitForAngular();
        expect(review.participantNum.getText()).to.eventually.equal(part).and.notify(callback);
    });

    this.When(/^I see the "([^"]*)" Tasks Completed Average in Participants$/, function (task, callback) {
        browser.waitForAngular();
        expect(review.partTaskTotal.getText()).to.eventually.equal(task).and.notify(callback);
    });

    this.When(/^I see the "([^"]*)" Answers in Participants$/, function (ans, callback) {
        browser.waitForAngular();
        expect(review.partAnswTotal.getText()).to.eventually.equal(ans).and.notify(callback);
    });


    ///Overview Page:
    this.Given(/^I am on the Overview Page$/, function ( callback) {
        expect(review.overviewparticipants.isEnabled()).to.eventually.equal(true).and.notify(callback);
    });

    this.Then(/^I check the participant count is "([^"]*)"$/, function (ans, callback) {
        browser.waitForAngular();
        expect(review.overviewparticipants.getText()).to.eventually.equal(ans).and.notify(callback);
    });

    this.Then(/^I check the annotation count is "([^"]*)"$/, function (ans, callback) {
        browser.waitForAngular();
        expect(review.overviewannotations.getText()).to.eventually.equal(ans).and.notify(callback);
    });

    this.Then(/^I check the comment count is "([^"]*)"$/, function (ans, callback) {
        browser.waitForAngular();
        expect(review.overviewcomments.getText()).to.eventually.equal(ans).and.notify(callback);
    });

    this.Then(/^I check the "([^"]*)" sentiment is "([^"]*)" answers$/, function (sent, count, callback) {
        browser.waitForAngular();
        if(sent==="Postitive"){
            expect(review.overviewsentimentspositivetotal.getText()).to.eventually.equal(count).and.notify(callback);
        }else if(sent==="Nuetral"){
            expect(review.overviewsentimentsnuetraltotal.getText()).to.eventually.equal(count).and.notify(callback);
        }else if(sent==="Negative"){
            expect(review.overviewsentimentsnegativetotal.getText()).to.eventually.equal(count).and.notify(callback);
        }else{
            callback();
        }
    });

    this.Then(/^I check the "([^"]*)" sentiment percentage is "([^"]*)"$/, function (sent, perc, callback) {
        browser.waitForAngular();
        if(sent==="Postitive"){
            expect(review.overviewsentimentsnegativetotalpercentage.getText()).to.eventually.equal(perc).and.notify(callback);
        }else if(sent==="Nuetral"){
            expect(review.overviewsentimentsnuetraltotalpercentage.getText()).to.eventually.equal(perc).and.notify(callback);
        }else if(sent==="Negative"){
            expect(review.overviewsentimentsnegativetotalpercentage.getText()).to.eventually.equal(perc).and.notify(callback);
        }else{
            callback();
        }
    });

    this.Then(/^I check complete tasks is "([^"]*)"$/, function (ans, callback) {
        browser.waitForAngular();
        expect(review.overviewcompleted.getText()).to.eventually.equal(ans).and.notify(callback);
    });

    this.Then(/^I check task "([^"]*)" rate is "([^"]*)"$/, function (state, count, callback) {
        browser.waitForAngular();
        if(state==="Success"){
            expect(review.overviewtaskssuccessfultotal.getText()).to.eventually.equal(count).and.notify(callback);
        }else if(state==="Failure"){
            expect(review.overviewtasksfailedfultotal.getText()).to.eventually.equal(count).and.notify(callback);
        }else if(state==="Abandoned"){
        expect(review.overviewtasksabandonedtotal.getText()).to.eventually.equal(count).and.notify(callback);
        }
        else{
            callback();
        }
    });

    this.Then(/^I check task "([^"]*)" percentage is "([^"]*)"$/, function (state, perc, callback) {
        browser.waitForAngular();
        if(state==="Success"){
            expect(review.overviewtaskssuccessfulpercentage.getText()).to.eventually.equal(perc).and.notify(callback);
        }else if(state==="Failure"){
            expect(review.overviewtasksfailedpercentage.getText()).to.eventually.equal(perc).and.notify(callback);
        }else if(state==="Abandoned"){
            expect(review.overviewtasksabandonedpercentage.getText()).to.eventually.equal(perc).and.notify(callback);
        }
        else{
            callback();
        }
    });

    //Tasks & Questions:
    this.Then(/^QuestionTask "([^"]*)" Participants are "([^"]*)"$/, function (quest, num, callback) {
       var id = parseInt(quest)-1;//-1 for index location correction
        expect(review.questionparticipants.get(id).getText()).to.eventually.equal(num).and.notify(callback);
    });

    this.Then(/^QuestionTask "([^"]*)" Annotations dropped equals "([^"]*)"$/, function (quest, num, callback) {
        var id = parseInt(quest)-2;//-2 for index location correction
        expect(review.questionannotations.get(id).getText()).to.eventually.equal(num).and.notify(callback);
    });

    this.Then(/^QuestionTask "([^"]*)" Comments left equals "([^"]*)"$/, function (quest, num, callback) {
        var id = parseInt(quest)-2; //-2 for index location correction
        expect(review.questioncomments.get(id).getText()).to.eventually.equal(num).and.notify(callback);
    });

    this.Then(/^Task Page visited Avg is "([^"]*)"$/, function (num, callback) {
        expect(review.questionAvgPages.getText()).to.eventually.equal(num).and.notify(callback);
    });

    this.Then(/^Task Target Reached equals "([^"]*)" with percentage "([^"]*)"$/, function (num, perc, callback) {
        var concat = num+" "+perc
        expect(review.questionSuccessTotal.getText()).to.eventually.equal(concat).and.notify(callback);
    });


    this.Then(/^Task Target Not Reached equals "([^"]*)" with percentage "([^"]*)"$/, function (num, perc, callback) {
        var concat = num+" "+perc
        expect(review.questionFailedTotal.getText()).to.eventually.equal(concat).and.notify(callback);
    });

    this.Then(/^Question Annotation Question "([^"]*)" Sentiment "([^"]*)" with percentage "([^"]*)"$/, function (sent ,num, perc, callback) {
        var concat = num+" "+perc
        if(sent==="Postitive"){
            expect(review.questionsentimentspositivetotal.getText()).to.eventually.equal(concat).and.notify(callback);
        }else if(sent==="Nuetral"){
            expect(review.questionsentimentsnuetraltotal.getText()).to.eventually.equal(concat).and.notify(callback);
        }else if(sent==="Negative"){
            expect(review.questionsentimentsnegativetotal.getText()).to.eventually.equal(concat).and.notify(callback);
        }else{
            callback();
        }
    });

    this.Then(/^2 MultiChoice answers Progress Bar for "([^"]*)" is equal to "([^"]*)" and percentage "([^"]*)"$/, function (quest ,num, perc, callback) {
        var concat = num+" "+perc
        var index;
        if(quest==="This"){
            index = 0;
            expect(review.multichoicequestiontext.get(index).getText()).to.eventually.equal(quest);
            expect(review.multichoicequestiontextrepsone.get(index).getText()).to.eventually.equal(concat).and.notify(callback);
        }else if(quest==="That"){
            index =1;
            expect(review.multichoicequestiontext.get(index).getText()).to.eventually.equal(quest);
            expect(review.multichoicequestiontextrepsone.get(index).getText()).to.eventually.equal(concat).and.notify(callback);
        }
    });


    this.Then(/^3 MultiChoice answers Progress Bar for "([^"]*)" is equal to "([^"]*)" and percentage "([^"]*)"$/, function (quest ,num, perc, callback) {
        var concat = num+" "+perc
        var index;
        if(quest==="This"){
            index = 2;
            expect(review.multichoicequestiontext.get(index).getText()).to.eventually.equal(quest);
            expect(review.multichoicequestiontextrepsone.get(index).getText()).to.eventually.equal(concat).and.notify(callback);
        }else if(quest==="That"){
            index =3;
            expect(review.multichoicequestiontext.get(index).getText()).to.eventually.equal(quest);
            expect(review.multichoicequestiontextrepsone.get(index).getText()).to.eventually.equal(concat).and.notify(callback);
        }else if(quest==="Those"){
            index =4;
            expect(review.multichoicequestiontext.get(index).getText()).to.eventually.equal(quest);
            expect(review.multichoicequestiontextrepsone.get(index).getText()).to.eventually.equal(concat).and.notify(callback);
        }else{
            callback()
        }
    });

    //Task States Detail:
    this.Then(/^Stats Target Reached equals "([^"]*)" with percentage "([^"]*)"$/, function (num, perc, callback) {
        var concat = num+" "+perc
        expect(review.statsparticipantnumbercompleted.getText()).to.eventually.equal(concat).and.notify(callback);
    });

    this.Then(/^Stats Not Target Reached equals "([^"]*)" with percentage "([^"]*)"$/, function (num, perc, callback) {
        var concat = num+" "+perc
        expect(review.statsparticipantnumbernotcompleted.getText()).to.eventually.equal(concat).and.notify(callback);
    });

    this.Then(/^Proto Page "([^"]*)" Participants Count equals "([^"]*)"$/, function (page, count, callback) {
        var id = parseInt(page)-1;//-1 for index location correction
        expect(review.participantnumber.get(id).getText()).to.eventually.equal(count).and.notify(callback);
    });

    this.Then(/^Proto Page "([^"]*)" Annotations Count equals "([^"]*)"$/, function (page, count, callback) {
        var id = parseInt(page)-1;//-1 for index location correction
        expect(review.statsannotationcount.get(id).getText()).to.eventually.equal(count).and.notify(callback);
    });

    this.Then(/^Proto Page "([^"]*)" Comments Count equals "([^"]*)"$/, function (page, count, callback) {
        var id = parseInt(page)-1;//-1 for index location correction
        expect(review.statscommentscount.get(id).getText()).to.eventually.equal(count).and.notify(callback);
    });

    this.Then(/^Proto Page "([^"]*)" Task Status Count equals "([^"]*)"$/, function (page, count, callback) {
        var id = parseInt(page)-1;//-1 for index location correction
        expect(review.statstaskstatus.get(id).getText()).to.eventually.equal(count).and.notify(callback);
    });

    this.Then(/^Proto Page "([^"]*)" Task "([^"]*)" Sentiment "([^"]*)" with percentage "([^"]*)"$/, function (page,sent, count,perc, callback) {
        var id = parseInt(page)-1;//-1 for index location correction
        var concat = count+" "+perc;
        if(sent==="Positive"){
            expect(review.statspositiveanno.get(id).getText()).to.eventually.equal(concat).and.notify(callback);
        }else if(sent==="Nuetral"){
            expect(review.statsnuetralanno.get(id).getText()).to.eventually.equal(concat).and.notify(callback);
        }else if(sent==="Negative"){
            expect(review.statsnegativeanno.get(id).getText()).to.eventually.equal(concat).and.notify(callback);
        }
    });

    this.When(/^I enable the Heatmap$/, function (callback) {
       browser.waitForAngular();
        review.clickHeatmap();
        callback();
    });

    this.Then(/^I can see the Heatmap$/, function (callback) {
        browser.waitForAngular();
        expect(review.heatmapcanvas.isEnabled()).to.eventually.equal(true).and.notify(callback);
    });

    this.When(/^I click on the Page Flow Tab$/, function (callback) {
        browser.waitForAngular();
        review.clickPageFlow();
        callback();
    });

    this.Then(/^I can see the Page Flow$/, function (callback) {
        browser.waitForAngular();
        expect(review.sankeyContainer.isEnabled()).to.eventually.equal(true).and.notify(callback);
    });

    this.Then(/^I see "([^"]*)" nodes$/, function (num, callback) {
        browser.waitForAngular();
        expect(review.pageNodes.count()).to.eventually.equal(parseInt(num)).and.notify(callback);
    });
    //******************************************
    //statistics page
    //*****************************************
    this.When(/^I click on the Statistics Tab$/, function (callback) {
        browser.waitForAngular();
        review.clickStatistics();
        callback();
    });

    this.Then(/^I see the Statstics Page Paricipants count is "([^"]*)"$/, function (count, callback) {
        expect(review.statsparticipantcount.getText()).to.eventually.equal(count).and.notify(callback);
    });

    this.Then(/^I see the Statstics Page Annotation count is "([^"]*)"$/, function (count, callback) {
        expect(review.statsannotationscount.getText()).to.eventually.equal(count).and.notify(callback);
    });

    this.Then(/^I see the Statstics Page Comment count is "([^"]*)"$/, function (count, callback) {
        expect(review.statscommentscount.last().getText()).to.eventually.equal(count).and.notify(callback);
    });

    this.Then(/^I see the Task Statstics Page Avg Visted is "([^"]*)"$/, function (count, callback) {
        expect(review.statspagevisited.getText()).to.eventually.equal(count).and.notify(callback);
    });

    this.Then(/^I see the Task Statstics Task Target Reached equals "([^"]*)" with percentage "([^"]*)"$/, function (num, perc, callback) {
        var concat = num+" "+perc
        expect(review.statssuccessfultotal.getText()).to.eventually.equal(concat).and.notify(callback);
    });


    this.Then(/^I see the Task Statstics Task Target Not Reached equals "([^"]*)" with percentage "([^"]*)"$/, function (num, perc, callback) {
        var concat = num+" "+perc
        expect(review.statsfailedtotal.getText()).to.eventually.equal(concat).and.notify(callback);
    });

    this.Then(/^I see the "([^"]*)" Statstics Task Annotation "([^"]*)" Sentiment "([^"]*)" with percentage "([^"]*)"$/, function (type, sent ,num, perc, callback) {
        var concat = num+" "+perc
        if(sent==="Postitive"){
            if(type==="Task"){
                expect(review.statspositivesentimenttotal.getText()).to.eventually.equal(concat).and.notify(callback);
            }else if(type==="Question"){
                expect(review.statspositivetotal.getText()).to.eventually.equal(concat).and.notify(callback);
            }
        }else if(sent==="Nuetral"){
            if(type==="Task"){
                expect(review.statsnuetralsentimenttotal.getText()).to.eventually.equal(concat).and.notify(callback);
            }else if(type==="Question"){
                expect(review.statsneutraltotal.getText()).to.eventually.equal(concat).and.notify(callback);
            }
        }else if(sent==="Negative"){
            if(type==="Task"){
                expect(review.statsnegativesentimenttotal.getText()).to.eventually.equal(concat).and.notify(callback);
            }else if(type==="Question"){
                expect(review.statsnegativetotal.getText()).to.eventually.equal(concat).and.notify(callback);
            }
        }else{
            callback();
        }
    });






};

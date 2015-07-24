/*eslint no-unused-expressions:0*/
'use strict';

var expect = require('norman-testing-tp').chai.expect;
var TestUserContext = require('../api/TestUserContext');
var mainTestUser = new TestUserContext();
var user2 = new TestUserContext();
var ParticipantRestApi = require('../api/ParticipantRestApi');
var StudyRestApi = require('../api/StudyRestApi');
var QuestionRestApi = require('../api/QuestionRestApi');
// our main logged in user
var ParticipantApi = new ParticipantRestApi();
var StudyApi = new StudyRestApi();
var QuestionApi = new QuestionRestApi();
var compareObject = require('../api/testerUtil').compareObject;


var mainTestUserId;
var mainTestUserNameEmail = 'userOneAnonymous_' + new Date().getTime() + '@example.com';
var userIdTwo;
var userTwoNameEmail = 'usertwoAnonymous_' + new Date().getTime() + '@example.com';

var PROJECT_NAME = 'Anonymous Test ' + new Date().getTime();

// Project/Study details
var question = {
    text: 'question',
    url: 'url',
    interactive: true,
    type: 'Annotation',
    answerOptions: [],
    answerIsLimited: false,
    allowMultipleAnswers: false,
    targetURL: [],
    isTargetable: true
};
var questionId;


describe('Anonymous ParticipantService REST API Test', function () {
    this.timeout(30000);
    studyName = 'Annotation ' + new Date().getTime();

    // Project/Study details
    var studyId;
    var annotationId;
    var projectId;
    var studyName;
    var annotation = {
        comment: 'annotation',
        absoluteX: 10,
        absoluteY: 20
    };
    var annotation2 = {
        comment: 'annotation2',
        absoluteX: 50,
        absoluteY: 60
    };
    var annotation2update = {
        comment: 'annotation2update',
        absoluteX: 80,
        absoluteY: 90
    };
    before('Initialize API users and get User data', function (done) {
        // set up main 'mainTestUser' user
        mainTestUser.initialize(mainTestUserNameEmail, 'Minitest!1')
            .then(function () {
                return mainTestUser.me(200);
            })
            .then(function (res) {
                expect(res.body).not.to.be.empty;
                mainTestUserId = res.body._id;
                // set up user2
                return user2.initialize(userTwoNameEmail, 'Minitest!1');
            })
            .then(function () {
                return user2.me(200);
            })
            .then(function (res) {
                userIdTwo = res.body._id;
                expect(res.body).not.to.be.empty;
                done();
            })
            .catch(done);
    });

    after(function (done) {
        done();

        // Only required for one user to do this task!
        /* mainTestUser.resetDB(function () {
         user2.resetDB(done);
         });*/

    });

    it('User One - Should create a new study, created by the logged in user', function (done) {
        annotation2.createBy = mainTestUserId;

        StudyApi.createProject(mainTestUser, {name: PROJECT_NAME}, 201)
            .then(function (res) {
                expect(res.body).to.not.be.empty;
                projectId = res.body._id;
                return StudyApi.createStudy(mainTestUser, projectId, {
                    name: studyName,
                    description: 'description'
                }, 201);
            })
            .then(function (res) {
                expect(res.body).not.to.be.empty;
                expect(res.body.name).to.equal(studyName);
                expect(res.body.status).to.equal('draft');
                studyId = res.body._id;
                expect(studyId).not.to.be.empty;
                done();
            })
            .catch(done);
    });

    /*
     after(function (done) {
     // Only required for one user to do this task!
     mainTestUser.resetDB(function () {
     user2.resetDB(done);
     });
     });*/


    it('User One - Should be able to add a new question', function (done) {
        expect(studyId).not.to.be.empty;

        QuestionApi.createQuestion(mainTestUser, projectId, studyId, question, 201)
            .then(function (res) {
                expect(res.body).not.to.be.empty;
                questionId = res.body._id;
                expect(questionId).not.to.be.empty;
                annotation.questionId = questionId;
                annotation2.questionId = questionId;
                annotation2update.questionId = questionId;

                return StudyApi.getStudy(mainTestUser, projectId, studyId, 200);
            })
            .then(function (res) {
                expect(res.body.questions).to.be.an.instanceof(Array);
                expect(res.body.questions.length).to.equal(1);
                var newQuestion = res.body.questions.pop();
                expect(newQuestion._id).to.be.equal(questionId);
                question._id = newQuestion._id;
                expect(compareObject(newQuestion, question)).to.be.equal(true);
                done();
            })
            .catch(done);
    });

    it('User One - Should be able to publish a study', function (done) {
        expect(studyId).not.to.be.empty;
        StudyApi.updateStudy(mainTestUser, projectId, studyId, {
            name: studyName,
            description: 'description',
            status: 'published'
        }, 200)
            .then(function (res) {
                expect(res.body).not.to.be.empty;
                expect(res.body.name).to.equal(studyName);
                expect(res.body.status).to.equal('published');
                expect(res.body.participants.length).to.equal(0);
                studyId = res.body._id;
                expect(studyId).not.to.be.empty;
                done();
            })
            .catch(done);
    });

    it('User One - Should be able to add a new annotation to a question', function (done) {
        expect(studyId).not.to.be.empty;

        ParticipantApi.addAnnotation(mainTestUser, studyId, annotation2, 201)
            .then(function (res) {

                expect(res.body).not.to.be.empty;
                annotationId = res.body._id;
                expect(annotationId).not.to.be.empty;
                return StudyApi.getStudy(mainTestUser, projectId, studyId, 200);
            })
            .then(function (res) {

                expect(res.body.annotations).to.be.an.instanceof(Array);
                expect(res.body.annotations.length).to.equal(1);
                var newAnnotation = res.body.annotations.pop();
                expect(newAnnotation._id).to.be.equal(annotationId);
                done();

            })
            .catch(done);
    });


    it('User One - Should be able to participate in study', function (done) {
        expect(studyId).not.to.be.empty;
        ParticipantApi.getStudyToParticipatedIn(mainTestUser, studyId, 200)
            .then(function (res) {
                expect(res.body.status).to.equal('published');
                expect(res.body.participants.length).to.equal(1);
                expect(res.body.participants[0]._id).to.equal(mainTestUserId);
                done();
            })
            .catch(done);
    });

    it('User Two - Should be able to participate in study', function (done) {
        expect(studyId).not.to.be.empty;
        ParticipantApi.getStudyToParticipatedIn(user2, studyId, 200)
            .then(function (res) {
                expect(res.body.status).to.equal('published');
                expect(res.body.participants.length).to.equal(1);
                expect(res.body.participants[0]._id).to.equal(userIdTwo);
                expect(res.body.answers.length).to.equal(0);
                expect(res.body.annotations.length).to.equal(0);
                done();
            })
            .catch(done);
    });

    it('User Two - Specifies they want to be anonymous while participating in the study', function (done) {

        ParticipantApi.setAnonymous(user2, studyId, 200)
            .then(function(res){
                expect(res.body.participants.length).to.equal(1);
                expect(res.body.participants[0]._id).to.equal(userIdTwo);
                expect(res.body.participants[0].isAnonymous).to.equal(true);
                done();
            })
            .catch(done);
    });

    it('User Two - Toggles their anonymous flag, will return false', function (done) {
        ParticipantApi.setAnonymous(user2, studyId, 200)
            .then(function(res){
                expect(res.body.participants.length).to.equal(1);
                expect(res.body.participants[0]._id).to.equal(userIdTwo);
                expect(res.body.participants[0].isAnonymous).to.equal(false);
                done();
            })
            .catch(done);
    });

});

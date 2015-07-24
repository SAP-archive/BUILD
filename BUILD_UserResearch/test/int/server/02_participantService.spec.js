/*eslint no-unused-expressions:0*/
'use strict';

var expect = require('norman-testing-tp').chai.expect;
var path = require('path');
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


describe('ParticipantService REST API Test', function () {
    this.timeout(30000);

    var mainTestUserId;
    var mainTestUserNameEmail = 'userOne_' + new Date().getTime() + '@example.com';
    var userIdTwo;

    var userTwoNameEmail = 'usertwo_' + new Date().getTime() + '@example.com';
    var PROJECT_NAME = 'Test Participant ' + new Date().getTime();
    var projectId;
    var studyName;
    var studyId;
    var assetId;
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
    var question2 = {
        text: 'question',
        url: 'url',
        ordinal: 0,
        subOrdinal: 0,
        answerOptions: [],
        answerLimit: 1
    };
    var questionId;
    var question2Id;

    studyName = 'Annotation ' + new Date().getTime();
    var annotationId;
    var annotation2Id;
    var annotation1 = {
        comment: 'annotation1',
        absoluteX: 50,
        absoluteY: 60
    };
    var annotation1update = {
        comment: 'annotation1update',
        absoluteX: 80,
        absoluteY: 90
    };
    var annotation2 = {
        comment: 'annotation2',
        absoluteX: 10,
        absoluteY: 20
    };

    var annotation3 = {
        comment: 'annotation3',
        absoluteX: 50,
        absoluteY: 60
    };

    var annotationInvalid1 = {
        comment: 'annotationInvalid',
        absoluteX: 50
    };

    var annotationInvalid2 = {
        comment: 'annotationInvalid',
        absoluteY: 60
    };
    var answer = {
        answer: 'test answer 3',
        questionId: '5460f0a882f8e368c08d01d5',
        sentiment: 1
    };

    before('Initialize API users and set up test data', function (done) {
        // set up main 'mainTestUser' user
        mainTestUser.initialize(mainTestUserNameEmail, 'Minitest!1')
            .then(function () {
                // set up user2
                return user2.initialize(userTwoNameEmail, 'Minitest!1');
            })
            .then(function () {
                done();
            })
            .catch(done);
    });

    after(function (done) {
        done();
    });

    it('User One - Should respond with user details of the logged in user', function (done) {
        mainTestUser.me(200)
            .then(function (res) {
                mainTestUserId = res.body._id;
                expect(res.body).not.to.be.empty;
                done();
            })
            .catch(done);
    });

    it('User Two - Should respond with user details of the logged in user', function (done) {

        user2.me(200)
            .then(function (res) {
                userIdTwo = res.body._id;
                expect(res.body).not.to.be.empty;
                done();
            })
            .catch(done);
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

    it('Attach a new asset to a project', function (done) {
        StudyApi.uploadProjectAsset(mainTestUser, projectId, path.resolve(__dirname, 'Large.PNG'), 201)
            .then(function (res) {
                var result = res.body;
                expect(result).not.to.be.empty;
                expect(result).to.be.an.instanceof(Array);
                expect(result[0].filename).to.eq('Large.PNG');
                expect(result[0].metadata.isThumb).to.eq(false);
                expect(result[0].metadata.hasThumb).to.eq(false);
                expect(result[0].metadata.version).to.eq(1);
                expect(result[0].metadata.extension).to.eq('PNG');
                expect(result[0].metadata.contentType).to.eq('image/png');
                expect(result[0].length).to.eq(868);
                assetId = result[0]._id;
                expect(assetId).not.to.eql(null);
                expect(assetId).not.to.be.empty;
                done();
            })
            .catch(done);
    });

    it('User One - Should be able to add a new question', function (done) {
        expect(studyId).not.to.be.empty;
        expect(projectId).not.to.be.empty;

        // Attach asset to question
        question.documentId = assetId;

        QuestionApi.createQuestion(mainTestUser, projectId, studyId, question, 201)
            .then(function (res) {
                expect(res.body).not.to.be.empty;
                questionId = res.body._id;
                expect(questionId).not.to.be.empty;
                annotation1.questionId = questionId;
                annotation1update.questionId = questionId;

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

    it('User One - Should return the study with the same annotations used for the creation', function (done) {
        expect(studyId).not.to.be.empty;

        StudyApi.getStudy(mainTestUser, projectId, studyId, 200)
            .then(function (res) {
                expect(res.body).not.to.be.empty;
                expect(res.body.name).to.equal(studyName);
                expect(res.body.status).to.equal('draft');
                expect(res.body._id).to.equal(studyId);
                done();
            })
            .catch(done);
    });

    it('User One - Should be able to add a 2nd new question', function (done) {
        expect(studyId).not.to.be.empty;

        QuestionApi.createQuestion(mainTestUser, projectId, studyId, question2, 201)
            .then(function (res) {
                expect(res.body).not.to.be.empty;
                question2Id = res.body._id;
                expect(question2Id).not.to.be.empty;
                annotation2.questionId = question2Id;
                annotation3.questionId = question2Id;

                return StudyApi.getStudy(mainTestUser, projectId, studyId, 200);
            })
            .then(function (res) {

                expect(res.body.questions).to.be.an.instanceof(Array);
                expect(res.body.questions.length).to.equal(2);
                var newQuestion = res.body.questions[0];
                expect(newQuestion._id).to.be.equal(question2Id);
                question._id = newQuestion._id;
                expect(newQuestion.text).to.equal('question');
                expect(newQuestion.ordinal).to.equal(0);
                expect(newQuestion.subOrdinal).to.equal(0);
                expect(newQuestion.answerLimit).to.equal(1);
                expect(newQuestion.text).to.equal('question');
                done();
            })
            .catch(done);


    });

    it('User One - Should not be able to add a new annotation to a study that is not published', function (done) {
        expect(studyId).not.to.be.empty;

        ParticipantApi.addAnnotation(mainTestUser, studyId, annotation1, 404)
            .then(function () {
                done();
            })
            .catch(done);
    });

    it('Should not be able to add a new answer to a study that is not published', function (done) {
        expect(studyId).not.to.be.empty;
        answer.questionId = question._id;

        ParticipantApi.addAnswer(mainTestUser, studyId, answer, 404)
            .then(function () {
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

    it('User One - Should return an empty list as user has not registered in any study', function (done) {
        expect(studyId).not.to.be.empty;

        ParticipantApi.getStudiesIParticipatedIn(mainTestUser, 200)
            .then(function (res) {
                var result = res.body;
                expect(result).to.be.an.instanceof(Array);
                expect(result).to.be.empty;
                expect(result.length).to.equal(0);
                done();
            })
            .catch(done);
    });


    it('[ Negative Test ] User One Should Not be able to add an annotation if the sentiment type is incorrect', function (done) {
        expect(studyId).not.to.be.empty;

        var annotationWithWrongSentiment = {
            comment: 'annotation2update',
            absoluteX: 80,
            absoluteY: 90,
            questionId: '5460f0a882f8e368c08d01d5',
            sentiment: 100
        };

        ParticipantApi.addAnnotation(mainTestUser, studyId, annotationWithWrongSentiment, 400)
            .then(function () {
                done();
            })
            .catch(done);
    });

    it('[ Negative Test ] Should not be able to add an annotation with absolute url', function (done) {
        expect(studyId).not.to.be.empty;

        annotation2.url = 'http://badUrl';

        ParticipantApi.addAnnotation(mainTestUser, studyId, annotation2, 400)
            .then(function () {
                done();
            })
            .catch(done);
    });

    it('User One - Should be able to add a new annotation', function (done) {
        expect(studyId).not.to.be.empty;
        ParticipantApi.addAnnotation(mainTestUser, studyId, annotation1, 201)
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

    it('User One - Should be able to add a single annotation to Question with Limit of 1', function (done) {
        expect(studyId).not.to.be.empty;
        annotation2.url = '/some/valid/url';

        ParticipantApi.addAnnotation(mainTestUser, studyId, annotation2, 201)
            .then(function (res) {

                expect(res.body).not.to.be.empty;
                annotation2Id = res.body._id;
                expect(annotation2Id).not.to.be.empty;
                return StudyApi.getStudy(mainTestUser, projectId, studyId, 200);
            })
            .then(function (res) {

                expect(res.body.annotations).to.be.an.instanceof(Array);
                expect(res.body.annotations.length).to.equal(2);
                var newAnnotation = res.body.annotations[1];
                expect(newAnnotation._id).to.be.equal(annotation2Id);
                done();

            })
            .catch(done);
    });

    it('[ Negative Test ] Should Not be able to add more annotations than allowed', function (done) {
        expect(studyId).not.to.be.empty;
        ParticipantApi.addAnnotation(mainTestUser, studyId, annotation3, 404)
            .then(function () {
                done();
            }).catch(done);
    });

    it('User One - Should be able to update an annotation', function (done) {
        expect(studyId).not.to.be.empty;
        ParticipantApi.updateAnnotation(mainTestUser, studyId, annotationId, annotation1update, 204)
            .then(function (res) {
                expect(res.body).to.be.empty;
                return StudyApi.getStudy(mainTestUser, projectId, studyId, 200);
            })
            .then(function (res) {

                expect(res.body.annotations).to.be.an.instanceof(Array);
                expect(res.body.annotations.length).to.equal(2);
                var newAnnotation = res.body.annotations[0];
                expect(newAnnotation._id).to.be.equal(annotationId);
                expect(newAnnotation.comment).to.be.equal(annotation1update.comment);
                expect(newAnnotation.absoluteX).to.be.equal(annotation1update.absoluteX);
                expect(newAnnotation.absoluteY).to.be.equal(annotation1update.absoluteY);
                done();
            })
            .catch(done);

    });

    it('[ Negative Test ] User One - Should Not be able to add an Answer with an invalid QuestionId', function (done) {

        var answer = {
            answer: 'test answer 3',
            questionId: '1234ABD',
            sentiment: 1
        };
        ParticipantApi.addAnswer(mainTestUser, studyId, answer, 400)
            .then(function () {
                done();
            })
            .catch(done);
    });

    it('[ Negative Test ] User One - Should Not be able to add an Answer with an invalid QuestionId', function (done) {

        var answer = {
            answer: 'test answer 3',
            questionId: '1234ABD',
            sentiment: 1
        };
        ParticipantApi.addAnswer(mainTestUser, studyId, answer, 400)
            .then(function () {
                done();
            })
            .catch(done);
    });

    it('User One - Should be able to add a new annotation with no comment', function (done) {
        expect(studyId).not.to.be.empty;


        var newAnnotation = {
            comment: '',
            absoluteX: 51,
            absoluteY: 61,
            questionId: questionId
        };

        ParticipantApi.addAnnotation(mainTestUser, studyId, newAnnotation, 201)
            .then(function (res) {
                expect(res.body).not.to.be.empty;
                expect(annotationId).not.to.be.empty;
                return StudyApi.getStudy(mainTestUser, projectId, studyId, 200);
            })
            .then(function (res) {
                expect(res.body.annotations).to.be.an.instanceof(Array);
                expect(res.body.annotations.length).to.equal(3);
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


    it('User One - Should be able to add an answer to a question', function (done) {
        expect(studyId).not.to.be.empty;
        var answer = {questionId: questionId, questionType: 'Freeform', answer: 'This is great', sentiment: 1};

        ParticipantApi.answerQuestion(mainTestUser, studyId, answer, 201)
            .then(function (res) {
                expect(res.body).not.to.be.empty;
                expect(res.body.answer).to.be.equal('This is great');
                expect(res.body.status).to.be.equal('not started');
                expect(res.body.sentiment).to.be.equal(1);
                expect(res.body.questionType).to.be.equal('Freeform');
                done();
            })
            .catch(done);
    });


    it('User One - Should return a list of studies the user is participating in, a number of annotations exist', function (done) {
        expect(studyId).not.to.be.empty;
        ParticipantApi.getStudiesIParticipatedIn(mainTestUser, 200)
            .then(function (res) {
                var result = res.body;
                expect(result).to.be.an.instanceof(Array);
                expect(result.length).to.equal(1);
                expect(result[0].projectId).to.equal(projectId);
                expect(result[0].questions).to.equal(2);
                expect(result[0].participants).to.equal(undefined);
                expect(result[0].comments).to.equal(2);
                expect(result[0].answers).to.equal(1);
                // 3 because main user added 2 annotations, user2 added 1 annotation
                expect(result[0].annotations).to.equal(3);
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


    it('User Two - Should return a list of studies the user is participating in, and only see their activity', function (done) {
        expect(studyId).not.to.be.empty;

        ParticipantApi.getStudiesIParticipatedIn(user2, 200)
            .then(function (res) {
                var result = res.body;
                expect(result).to.be.an.instanceof(Array);
                expect(result.length).to.equal(1);
                expect(result[0].projectId).to.equal(projectId);
                expect(result[0].questions).to.equal(2);
                expect(result[0].participants).to.equal(undefined);
                expect(result[0].comments).to.equal(0);
                expect(result[0].answers).to.equal(0);
                expect(result[0].annotations).to.equal(0);
                done();
            })
            .catch(done);
    });

    it('Validate rendering of images for a study', function (done) {
        expect(studyId).not.to.be.empty;
        expect(assetId).not.to.be.empty;

        ParticipantApi.render(mainTestUser, studyId, assetId, 200)
            .then(function (res) {
                expect(res.headers['content-disposition']).to.eq('filename=Large.PNG');
                expect(res.headers['content-type']).to.eq('image/png');
                done();
            })
            .catch(done);
    });

    it('[Neg Test] Try to render image with invalid asset ID i.e. asset id is unknown', function (done) {
        expect(studyId).not.to.be.empty;
        var assetId = '558934118d122f9c0617ca69';
        ParticipantApi.render(mainTestUser, studyId, assetId, 404)
            .then(function () {

                done();
            })
            .catch(done);
    });

    it('[Neg Test] Try to render image with invalid study ID', function (done) {
        var projectId = 'a4e4c08762e442a70a4c06a3';
        ParticipantApi.render(mainTestUser, projectId, assetId, 404)
            .then(function () {
                done();
            })
            .catch(done);
    });

    it('User One - Should return a specific study, showing participant details', function (done) {
        expect(studyId).not.to.be.empty;

        StudyApi.getStudy(mainTestUser, projectId, studyId, 200)
            .then(function (res) {
                expect(res.body).not.to.be.empty;
                expect(res.body.name).to.equal(studyName);
                expect(res.body.status).to.equal('published');
                expect(res.body._id).to.equal(studyId);
                expect(res.body.participants.length).to.equal(2);
                expect(res.body.annotations.length).to.equal(3);
                expect(res.body.answers.length).to.equal(1);
                expect(res.body.participants[0].name).to.equal(mainTestUserNameEmail);
                expect(res.body.participants[0]._id).to.equal(mainTestUserId);

                done();
            })
            .catch(done);
    });


    it('User One - Should be able to delete an annotation', function (done) {
        expect(studyId).not.to.be.empty;

        ParticipantApi.deleteAnnotation(mainTestUser, studyId, annotationId, 204)
            .then(function () {
                return StudyApi.getStudy(mainTestUser, projectId, studyId, 200);
            })
            .then(function (res) {
                expect(res.body.annotations).to.be.an.instanceof(Array);
                expect(res.body.annotations.length).to.equal(2);
                done();
            })
            .catch(done);

    });

    it('User One - Should return a list of studies the user is participating in, annotations have been removed', function (done) {
        expect(studyId).not.to.be.empty;
        ParticipantApi.getStudiesIParticipatedIn(mainTestUser, 200)
            .then(function (res) {
                var result = res.body;
                expect(result).to.be.an.instanceof(Array);
                expect(result).not.to.be.empty;
                expect(result[0].questions).to.equal(2);
                expect(result[0].participants).to.equal(undefined);
                expect(result[0].annotations).to.equal(2);
                expect(result[0].answers).to.equal(1);
                expect(result[0].comments).to.equal(1);
                done();
            }).catch(done);


    });

    it('User One and Two - Should only return one user for both users when accessing the same study', function (done) {
        expect(studyId).not.to.be.empty;
        ParticipantApi.getStudyToParticipatedIn(mainTestUser, studyId, 200)
            .then(function (res) {
                expect(res.body.status).to.equal('published');
                expect(res.body.participants.length).to.equal(1);
                expect(res.body.participants[0]._id).to.equal(mainTestUserId);
                return ParticipantApi.getStudyToParticipatedIn(user2, studyId, 200);
            })
            .then(function (res) {
                expect(res.body.status).to.equal('published');
                expect(res.body.participants.length).to.equal(1);
                expect(res.body.participants[0]._id).to.equal(userIdTwo);
                done();
            })
            .catch(done);
    });

    /***********************************************************************************/
    /*                              Pause & Archive                                    */
    /***********************************************************************************/
    it('User One - Who is an owner should be able to pause a study', function (done) {
        expect(studyId).not.to.be.empty;

        StudyApi.pauseStudy(mainTestUser, projectId, studyId)
            .then(function (res) {
                expect(res.body).not.to.be.empty;
                expect(res.body.status).to.be.equal('paused');
                done();
            })
            .catch(done);

    });

    it('User One - Who is an owner should be able to archive a study', function (done) {
        expect(studyId).not.to.be.empty;
        StudyApi.archiveStudy(mainTestUser, projectId, studyId)
            .then(function (res) {
                expect(res.body).not.to.be.empty;
                expect(res.body.status).to.be.equal('archived');
                done();
            })
            .catch(done);

    });

    it('User Two - Who is participating in a study should no longer see the study as its archived', function (done) {
        expect(studyId).not.to.be.empty;

        ParticipantApi.getStudiesIParticipatedIn(user2, 200)
            .then(function (res) {
                var result = res.body;
                expect(result).to.be.an.instanceof(Array);
                expect(result.length).to.equal(0);
                done();
            })
            .catch(done);
    });


    /**
    * [Neg. Test with invalidate parameter] New annotation - Should return 400.
    */
    it('[Neg. Test] - [Invalidate parameter] - Should not be able to add a new annotation - Missing absoluteX', function (done) {
        expect(studyId).not.to.be.empty;
        ParticipantApi.addAnnotation(mainTestUser, studyId, annotationInvalid1, 400)
            .then(function (res) {
                expect(res.body.message).to.equal('request missing required parameters.');
                done();
            })
            .catch(done);
    });

    /**
    * [Neg. Test with invalidate parameter] New annotation - Should return 400.
    */
    it('[Neg. Test] - [Invalidate parameter] - Should not be able to add a new annotation - Missing absoluteY', function (done) {
        expect(studyId).not.to.be.empty;
        ParticipantApi.addAnnotation(mainTestUser, studyId, annotationInvalid2, 400)
            .then(function (res) {
                expect(res.body.message).to.equal('request missing required parameters.');
                done();
            })
            .catch(done);
    });


    it('[Neg. Test] - [Invalidate parameter] - Should be able to update annotation - Missing absoluteX', function (done) {
        expect(studyId).not.to.be.empty;
        expect(annotation1update).not.to.be.empty;
        var invalidAnnovationToUpdate = annotation1update;
        delete invalidAnnovationToUpdate.absoluteX;

        ParticipantApi.updateAnnotation(mainTestUser, studyId, annotationId, invalidAnnovationToUpdate, 400)
            .then(function (res) {
                expect(res.body.message).to.equal('request missing required parameters.');
                done();
            })
            .catch(done);

    });


    it('[Neg. Test] - [Invalidate parameter] - Should be able to update annotation - Missing absoluteY', function (done) {
        expect(studyId).not.to.be.empty;
        expect(annotation1update).not.to.be.empty;
        var invalidAnnovationToUpdate = annotation1update;
        delete invalidAnnovationToUpdate.absoluteY;

        ParticipantApi.updateAnnotation(mainTestUser, studyId, annotationId, invalidAnnovationToUpdate, 400)
            .then(function (res) {
                expect(res.body.message).to.equal('request missing required parameters.');
                done();
            })
            .catch(done);

    });


    it('[Neg. Test] - [Invalidate parameter] - Should be able to update annotation - Missing id', function (done) {
        expect(studyId).not.to.be.empty;
        expect(annotation1update).not.to.be.empty;
        var invalidAnnovationToUpdate = annotation1update;
        delete invalidAnnovationToUpdate.id;

        ParticipantApi.updateAnnotation(mainTestUser, studyId, annotationId, invalidAnnovationToUpdate, 400)
            .then(function (res) {
                expect(res.body.message).to.equal('request missing required parameters.');
                done();
            })
            .catch(done);

    });


    it('[Neg. Test] - Should not be able to add an answer to a question with wrong sentiment', function (done) {
        expect(studyId).not.to.be.empty;
        var answer = {questionId: questionId, questionType: 'Freeform', answer: 'This is great', sentiment: 4};

        ParticipantApi.answerQuestion(mainTestUser, studyId, answer, 400)
            .then(function (res) {
                done();
            })
            .catch(done);
    });

})
;

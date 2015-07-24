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


describe('QuestionsTasks Tests', function () {
    this.timeout(30000);
    var mainTestUserId;
    var mainTestUserNameEmail = 'userOne_' + new Date().getTime() + '@example.com';
    var userTwoId;
    var userTwoNameEmail = 'userTwo_' + new Date().getTime() + '@example.com';
    var PASSWORD = 'Minitest!1';

    var PROJECT_NAME = 'QuestionTasks Test ' + new Date().getTime();
    var projectId;
    var studyName,
        studyId,
        questionId,
        question = {
            text: 'question',
            url: 'url',
            ordinal: 0,
            subOrdinal: 0,
            answerOptions: [],
            answerIsLimited: false,
            answerLimit: null,
            allowMultipleAnswers: false,
            targetURL: [],
            isTargetable: true
        },
        question2 = {
            text: 'question2',
            url: 'url2',
            ordinal: 1,
            subOrdinal: 0,
            type: 'Annotation',
            answerOptions: [],
            answerIsLimited: false,
            answerLimit: null,
            allowMultipleAnswers: false,
            targetURL: [],
            isTargetable: true
        },
        question2update = {
            text: 'question2 update',
            ordinal: 1,
            subOrdinal: 0,
            url: 'url2',
            type: 'Freeform',
            answerOptions: [],
            answerIsLimited: false,
            answerLimit: null,
            allowMultipleAnswers: false,
            targetURL: [],
            isTargetable: true
        };

    before('Initialize API users and set Up test data', function (done) {
        // set up main 'mainTestUser' user
        mainTestUser.initialize(mainTestUserNameEmail, PASSWORD)
            .then(function () {
                return mainTestUser.me(200);
            })
            .then(function (res) {
                expect(res.body).not.to.be.empty;
                mainTestUserId = res.body._id;
                // set up user2
                return user2.initialize(userTwoNameEmail, PASSWORD);
            })
            .then(function () {
                return user2.me(200);
            })
            .then(function (res) {
                userTwoId = res.body._id;
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

        StudyApi.createProject(mainTestUser, {name: PROJECT_NAME}, 201)
            .then(function (res) {
                expect(res.body).to.not.be.empty;
                projectId = res.body._id;

                studyName = 'Annotation ' + new Date().getTime();
                return StudyApi.createStudy(mainTestUser, projectId, {
                    name: studyName,
                    description: 'description',
                    questions: [question]
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

    it('Should return the study with the same questions used for the creation', function (done) {
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
    it('Should be able to add a new question', function (done) {
        expect(studyId).not.to.be.empty;
        QuestionApi.createQuestion(mainTestUser, projectId, studyId, question2, 201)
            .then(function (res) {
                expect(res.body).not.to.be.empty;
                questionId = res.body._id;
                expect(questionId).not.to.be.empty;
                return StudyApi.getStudy(mainTestUser, projectId, studyId, 200);
            })
            .then(function (res) {
                expect(res.body.questions).to.be.an.instanceof(Array);
                expect(res.body.questions.length).to.equal(2);
                var newQuestion = res.body.questions.pop();
                expect(newQuestion._id).to.be.equal(questionId);
                question2._id = newQuestion._id;

                expect(compareObject(newQuestion, question2)).to.be.equal(true);
                done();
            })
            .catch(done);
    });

    it('Should be able to update a question', function (done) {
        expect(studyId).not.to.be.empty

        QuestionApi.updateQuestion(mainTestUser, projectId, studyId, questionId, question2update, 204)
            .then(function (res) {
                expect(res.body).to.be.empty
                return StudyApi.getStudy(mainTestUser, projectId, studyId, 200);
            })
            .then(function (res) {
                expect(res.body.questions).to.be.an.instanceof(Array);
                expect(res.body.questions.length).to.equal(2);
                var newQuestion = res.body.questions.pop();
                expect(newQuestion._id).to.be.equal(questionId);
                question2update._id = newQuestion._id;
                expect(compareObject(newQuestion, question2update)).to.be.equal(true);
                done();
            })
            .catch(done);

    });

    it('Should be able to update order of questions question', function (done) {
        expect(studyId).not.to.be.empty;
        var updatedQuestions = [];
        StudyApi.getStudy(mainTestUser, projectId, studyId, 200)
            .then(function (res) {
                expect(res.body).not.to.be.empty;
                expect(res.body.name).to.equal(studyName);
                expect(res.body.status).to.equal('draft');
                expect(res.body._id).to.equal(studyId);
                expect(res.body.questions.length).to.equal(2);
                res.body.questions.filter(function (q) {
                    if (q.text === question.text) {
                        expect(q.ordinal).to.equal(0);
                        expect(q.subOrdinal).to.equal(0);
                        updatedQuestions.push({
                            _id: q._id,
                            ordinal: 1
                        });

                    }
                    else {
                        expect(q.ordinal).to.equal(1);
                        expect(q.subOrdinal).to.equal(0);
                        updatedQuestions.push({
                            _id: q._id,
                            ordinal: 0
                        });
                    }
                });
                return QuestionApi.updateMultipleQuestion(mainTestUser, projectId, studyId, {
                    questions: updatedQuestions
                }, 200);
            })
            .then(function () {
                return StudyApi.getStudy(mainTestUser, projectId, studyId, 200);
            })
            .then(function (res) {
                expect(res.body).not.to.be.empty;
                expect(res.body.name).to.equal(studyName);
                expect(res.body.status).to.equal('draft');
                expect(res.body._id).to.equal(studyId);
                expect(res.body.questions.length).to.equal(2);
                res.body.questions.filter(function (q) {
                    if (q.text === question.text) {
                        expect(q.ordinal).to.equal(1);
                    }
                    else {
                        expect(q.ordinal).to.equal(0);
                    }
                });
                done();
            })
            .catch(done);

    });

    it('Should be able to delete a question', function (done) {
        expect(studyId).not.to.be.empty;

        QuestionApi.deleteQuestion(mainTestUser, projectId, studyId, questionId, 204)
            .then(function () {
                return StudyApi.getStudy(mainTestUser, projectId, studyId, 200);
            })
            .then(function (res) {
                expect(res.body.questions).to.be.an.instanceof(Array);
                expect(res.body.questions.length).to.equal(1);
                res.body.questions[0].ordinal = 0;
                res.body.questions[0].subOrdinal = 0;
                return res.body.questions;
            })
            .then(function (questions) {
                QuestionApi.updateMultipleQuestion(mainTestUser, projectId, studyId, {
                    questions: questions
                }, 200);
            })
            .then(function () {
                return StudyApi.getStudy(mainTestUser, projectId, studyId, 200);
            })
            .then(function (res) {
                expect(res.body.questions).to.be.an.instanceof(Array);
                expect(res.body.questions.length).to.equal(1);
                res.body.questions.ordinal = 0;
                res.body.questions.subOrdinal = 0;
                done();
            })
            .catch(done);
    });

    /**************** Scenario - create multiple questions to the same image and then bulk delete ******************/

    it('Should be able to delete a group of questions', function (done) {
        expect(studyId).not.to.be.empty;
        var deleteQuestionId = '';

        var questionWithOrdinal = {
            text: 'question2',
            url: 'url2',
            ordinal: 1,
            subOrdinal: 0,
            type: 'Annotation',
            answerOptions: [],
            answerIsLimited: false,
            answerLimit: null,
            allowMultipleAnswers: false,
            targetURL: []
        };

        // Create a group of questions with the same Ordinal value but with different subOrdinal values
        // There should still be one question left
        StudyApi.getStudy(mainTestUser, projectId, studyId, 200)
            .then(function (res) {
                // Validate existing state of questions
                expect(res.body.questions).to.be.an.instanceof(Array);
                expect(res.body.questions.length).to.equal(1);
                expect(res.body.questions[0].ordinal).to.equal(0);
            }).then(function () {
                // Create a new question with the group ordinal of 1
                return QuestionApi.createQuestion(mainTestUser, projectId, studyId, questionWithOrdinal, 201)
            })
            .then(function (res) {
                expect(res.body).not.to.be.empty;
                deleteQuestionId = res.body._id;
                expect(deleteQuestionId).not.to.be.empty;
                expect(res.body.text).to.equal('question2');
                // Create a new question with the group ordinal of 1
                return QuestionApi.createQuestion(mainTestUser, projectId, studyId, questionWithOrdinal, 201)
            })
            .then(function (res) {
                expect(res.body).not.to.be.empty;
                expect(res.body.ordinal).to.equal(1);
                expect(res.body.subOrdinal).to.equal(0);
                questionWithOrdinal.subOrdinal = 1
                // Create a new question with the group ordinal of 1
                return QuestionApi.createQuestion(mainTestUser, projectId, studyId, questionWithOrdinal, 201)
            })
            .then(function (res) {
                expect(res.body).not.to.be.empty;
                expect(res.body.ordinal).to.equal(1);
                expect(res.body.subOrdinal).to.equal(1);
                questionWithOrdinal.subOrdinal = 2;
                // Create a new question with the group ordinal of 1
                return QuestionApi.createQuestion(mainTestUser, projectId, studyId, questionWithOrdinal, 201)
            })
            .then(function (res) {
                expect(res.body).not.to.be.empty;
                expect(res.body.ordinal).to.equal(1);
                expect(res.body.subOrdinal).to.equal(2);
                return StudyApi.getStudy(mainTestUser, projectId, studyId, 200)
            })
            .then(function (res) {
                // Validate questions now has three questions
                expect(res.body.questions).to.be.an.instanceof(Array);
                expect(res.body.questions.length).to.equal(5);
                expect(res.body.questions[3].ordinal).to.equal(1);
                expect(res.body.questions[2].ordinal).to.equal(1);
                expect(res.body.questions[1].ordinal).to.equal(1);
                expect(res.body.questions[0].ordinal).to.equal(0);
            })
            .then(function () {
                // Should only delete the question with an ordinal of 1
                return QuestionApi.deleteQuestionBulk(mainTestUser, projectId, studyId, deleteQuestionId, 204);
            })
            .then(function () {
                // There should still be one question left
                return StudyApi.getStudy(mainTestUser, projectId, studyId, 200);
            })
            .then(function (res) {
                expect(res.body.questions).to.be.an.instanceof(Array);
                expect(res.body.questions.length).to.equal(1);
                expect(res.body.questions[0].ordinal).to.equal(0);
                done();
            })
            .catch(done);
    });


    /************************* TASKs ****************************/
    var taskId;
    var task = {
        url: 'someurl',
        text: 'Som instruction Text',
        name: 'Task1',
        snapshotVersion: 'snapshot_1'
    };
    var invalidtask = {
        url: 'someurl',
        text: 'Som instruction Text',
        name: 'Task1'
    };
    var invalidtaskMissingParam = {
        url: 'someurl',
        text: 'Som instruction Text'
    };
    var invalidtaskValidation = {
        url: 'someurl',
        text: 'Som instruction Text',
        name: 'invalidt ask Validation',
        type: 'Invalid'
    };
    it('Should Not be able to create an invalid  Task', function (done) {
        expect(studyId).not.to.be.empty;

        QuestionApi.createTask(mainTestUser, projectId, studyId, invalidtask, 400)
            .then(function (res) {
                expect(res.body.error).to.exist;
                done();
            })
            .catch(done);
    });

    it('Should be able to add a new Task', function (done) {
        expect(studyId).not.to.be.empty;

        QuestionApi.createTask(mainTestUser, projectId, studyId, task, 201)
            .then(function (res) {
                expect(res.body.error).to.not.exist;
                done();
            })
            .catch(done);
    });

    it('Should be able to get all Tasks for study', function (done) {
        expect(studyId).not.to.be.empty;

        QuestionApi.getTasks(mainTestUser, projectId, studyId, 200)
            .then(function (res) {
                expect(res.body).to.be.an.instanceof(Array);
                expect(res.body.length).to.equal(1);
                expect(res.body[0].type).to.equal('Task');
                expect(res.body[0].url).to.equal('someurl');
                expect(res.body[0].text).to.equal('Som instruction Text');
                expect(res.body[0].name).to.equal('Task1');
                expect(res.body[0]._id).to.not.be.undefined;
                taskId = res.body[0]._id;
                done();
            })
            .catch(done);
    });

    it('Should be able to get a task by Id', function (done) {
        expect(studyId).not.to.be.empty;
        expect(taskId).not.to.be.empty;

        QuestionApi.getTask(mainTestUser, projectId, studyId, taskId, 200)
            .then(function (res) {
                expect(res.body.url).to.equal(task.url);
                expect(res.body.targetURL.length).to.equal(0);
                expect(res.body.name).to.equal(task.name);
                expect(res.body.type).to.equal('Task');
                expect(res.body.text).to.equal(task.text);
                done();
            })
            .catch(done);

    });

    it('Should be able to update a task', function (done) {
        var updatedTask = {
            _id: taskId,
            url: 'abc/123',
            text: 'updated instructions',
            targetURL: ['/url1', '/url2']
        };

        QuestionApi.updateTask(mainTestUser, projectId, studyId, taskId, updatedTask, 204)
            .then(function () {

                return QuestionApi.getTask(mainTestUser, projectId, studyId, taskId, 200);
            })
            .then(function (res) {
                expect(res.body.url).to.equal(updatedTask.url);
                expect(res.body.targetURL.length).to.equal(updatedTask.targetURL.length);
                expect(res.body.targetURL[0]).to.equal(updatedTask.targetURL[0]);
                expect(res.body.targetURL[1]).to.equal(updatedTask.targetURL[1]);
                expect(res.body.name).to.equal(task.name);
                expect(res.body.type).to.equal('Task');
                expect(res.body.text).to.equal(updatedTask.text);
                done();
            })
            .catch(done);
    });

    it('Should be able to Delete a task', function (done) {
        QuestionApi.deleteTask(mainTestUser, projectId, studyId, taskId, 200)
            .then(function () {

                return QuestionApi.getTask(mainTestUser, projectId, studyId, taskId, 404);
            })
            .then(function () {
                done();
            })
            .catch(done);
    });

    /**
     * [Neg. Test with invalidate parameter]  Create new task - Should return 400.
     */
    it('[Neg. Test] - [Invalidate Params Request]  - Should not create a new task.', function (done) {
        expect(studyId).not.to.be.empty;
        QuestionApi.createTask(mainTestUser, projectId, studyId, invalidtaskMissingParam, 400)
            .then(function (res) {
                expect(res.body.message).to.equal('request missing required parameters.');
                done();
            })
            .catch(done);
    });

    /**
     * [Neg. Test with invalidate schema/data] Create new task - Should return 400.
     */
    it('[Neg. Test] - [Invalidate Schema] - Should not create a new task.', function (done) {
        expect(studyId).not.to.be.empty;
        QuestionApi.createTask(mainTestUser, projectId, studyId, invalidtaskValidation, 400)
            .then(function (res) {
                expect(res.body.error).to.equal('Cannot create Task with out a name or a snapshotVersion');
                done();
            })
            .catch(done);
    });
});

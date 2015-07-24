/*eslint no-unused-expressions:0*/
'use strict';

var expect = require('norman-testing-tp').chai.expect;
var TestUserContext = require('../api/TestUserContext');
var mainTestUser = new TestUserContext();
var ParticipantRestApi = require('../api/ParticipantRestApi');
var StudyRestApi = require('../api/StudyRestApi');
var ReviewRestApi = require('../api/ReviewRestApi');

var ParticipantApi = new ParticipantRestApi();
var StudyApi = new StudyRestApi();
var ReviewApi = new ReviewRestApi();

var PROJECT_NAME = 'Test Basic';
var mainTestUserId;
var mainTestUserNameEmail = 'userOne_' + new Date().getTime() + '@example.com';

var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var originalSnapShotService;
function mockService(module) {
    //only use if shared workspace added to sample app services config
    //originalSnapShotService = registry.getModule('SnapshotService');
    if (originalSnapShotService) {
        registry.unregisterModule('SnapshotService');
    }
    registry.registerModule(module, 'SnapshotService');
}

function unMockService(cb, err) {
    registry.unregisterModule('SnapshotService');
    if (originalSnapShotService) {
        registry.registerModule(originalSnapShotService, 'SnapshotService');
    }
    if (err) return cb(err);

    return cb();
}




describe('Trackings & Review Service REST API Test', function () {
    this.timeout(30000);
    var projectId;
    var studyId;
    var question1 = {
        text: 'is this a question?',
        url: 'url',
        ordinal: 0,
        subOrdinal: 0,
        thumbnail: '/some/url/1',
        answerOptions: [],
        type: 'Freeform'
    };
    var question2 = {
        text: 'question2',
        url: 'url2',
        ordinal: 2,
        subOrdinal: 0,
        thumbnail: '/some/url/2',
        answerOptions: [],
        type: 'Annotation'
    };
    var question3 = {
        text: 'question3, a or b?',
        url: 'url3',
        ordinal: 3,
        subOrdinal: 0,
        thumbnail: '/some/url/3',
        answerOptions: ['a', 'b'],
        type: 'MultipleChoice'
    };
    var questionId1;
    var questionId2;
    var questionId3;
    var taskId;
    var taskId2;
    var annotation1 = {
        comment: 'annotation',
        absoluteX: 10,
        absoluteY: 20,
        sentiment: 1
    };
    var annotation2 = {
        comment: 'annotation2',
        absoluteX: 50,
        absoluteY: 60,
        sentiment: 3
    };
    var answer1 = {
        questionType: 'Freeform',
        sentiment: 1,
        answer: 'yes it is'
    };
    var answer2 = {
        questionType: 'Annotation',
        sentiment: 3,
        answer: 'yes, it is answer 2'
    };
    var answer3 = {
        questionType: 'MultipleChoice',
        sentiment: 2,
        answer: '0' // an answered multichoice gives the value selected not the text
    };

    var task = {
        text: 'Get to end of Task',
        url: 'url3',
        ordinal: 3,
        thumbnail: '/task/start/url',
        type: 'Task',
        interactive: true
    };
    var taskAnswer = {
        status: 'completed correctly',
        questionType: 'Task'
    };
    var task2 = {
        text: 'Get to end of Task 2',
        url: 'url3',
        ordinal: 4,
        thumbnail: '/task2/start/url',
        type: 'Task'
    };
    var taskAnswer2 = {
        status: 'completed correctly',
        questionType: 'Task'
    };
    var study = {
        name: 'Study For Testing Review',
        description: 'description',
        status: 'published',
        questions: [question1, question2, question3, task, task2]
    };

    var deepLink1 = {}
    deepLink1.pageUrl = '/api/participant/prototype/d38d0eeb77b79a1b0a53d9f1/render/AxureProject1/new_arrivals.html';
    deepLink1.thumbnail = '/deploy/public/667d29b3a2c455a20a326682/5/resources/thumbnail/index.png';

    var deepLink2 = {};
    deepLink2.pageUrl =  '/api/participant/prototype/d38d0eeb77b79a1b0a53d9f1/render/AxureProject1/product_listing.html';
    deepLink2.thumbnail =  '/deploy/public/667d29b3a2c455a20a326682/5/resources/thumbnail/SalesOrder.png';

    var deepLink3 = {};
    deepLink3.pageUrl = '/api/participant/prototype/d38d0eeb77b79a1b0a53d9f1/render/AxureProject1/checkout.html';
    deepLink3.thumbnail = '/deploy/public/667d29b3a2c455a20a326682/5/resources/thumbnail/SalesOrder.png'

    before('Initialize API', function (done) {
        mainTestUser.initialize(mainTestUserNameEmail, 'Minitest!1').then(function () {
            return mainTestUser.me(200);
        })
            .then(function (res) {
                mainTestUserId = res.body._id;
                expect(res.body).not.to.be.empty;
                return StudyApi.createProject(mainTestUser, {
                    name: PROJECT_NAME
                }, 201);
            }).then(function (res) {
                projectId = res.body._id;
                return StudyApi.createStudy(mainTestUser, projectId, study, 201);
            })
            .then(function (res) {
                studyId = res.body._id;

                for (var i = 0, len = res.body.questions.length; i < len; i++) {
                    if (res.body.questions[i].type === question1.type && res.body.questions[i].text === question1.text) {
                        questionId1 = res.body.questions[i]._id;
                    }
                    else if (res.body.questions[i].type === question2.type && res.body.questions[i].text === question2.text) {
                        questionId2 = res.body.questions[i]._id;
                    }
                    else if (res.body.questions[i].type === question3.type && res.body.questions[i].text === question3.text) {
                        questionId3 = res.body.questions[i]._id;
                    }
                    else if (res.body.questions[i].type === task.type && res.body.questions[i].text === task.text) {
                        taskId = res.body.questions[i]._id;

                    }
                    else if (res.body.questions[i].type === task2.type && res.body.questions[i].text === task2.text) {
                        taskId2 = res.body.questions[i]._id;
                    }
                }
                annotation1.questionId = questionId2;
                annotation2.questionId = questionId2;

                answer1.questionId = questionId1;
                answer2.questionId = questionId2;
                answer3.questionId = questionId3;
                taskAnswer.questionId = taskId;
                taskAnswer2.questionId = taskId2;


                var testDeepLinks = {
                    deepLinks: [deepLink1, deepLink2, deepLink3]
                };


                var mockedService = {
                    getSnapshots: function () {
                        var deferred = Promise.defer();
                        var snapshots = [testDeepLinks];
                        deferred.resolve(snapshots);
                        return deferred.promise;
                    }
                };
                mockService(mockedService);
                done();
            }).catch(done);
    });

    after(function (done) {
        // Only required for one user to do this task!
        //mainTestUser.resetDB(done);
        unMockService(done);
    });


    it('User One - Participate with Trackings ', function (done) {
        var tracking = {
            clickX: 476,
            clickY: 124,
            domElementHeight: 18,
            domElementId: 'cache9',
            domElementTag: 'SPAN',
            domElementText: 'WOMENS',
            domElementWidth: 66,
            eventType: 'iframeClick',
            hash: '',
            offset: -60,
            pageHeight: 855,
            pageTitle: 'New Arrivals',
            pageUrl: 'http://localhost:9000/deploy/public/2254f6bd4aac1ff80a1e33f9/1//AxureProject1/new_arrivals.html',
            pageWidth: 1000,
            pathName: '/deploy/public/2254f6bd4aac1ff80a1e33f9/1//AxureProject1/new_arrivals.html',
            projectId: projectId,
            questionId: annotation1.questionId,
            scrollLeft: 0,
            scrollTop: 0,
            studyId: studyId,
            timezone: '2015-05-19T16:32:39.684Z'
        };

       var oNavigationTracking1 =  {
            closeTrackId: "4c7b47e967057bd90a53da81",
            context: {context_type: "html", entity: "", data: ""},
            eventType: "navigation",
            hash: "",
            offset: -60,
            pageUrl: "http://localhost:9000/api/participant/prototype/d38d0eeb77b79a1b0a53d9f1/render/AxureProject1/new_arrivals.html",
            pathName: "/api/participant/prototype/d38d0eeb77b79a1b0a53d9f1/render/AxureProject1/new_arrivals.html",
            projectId: projectId,
            questionId: taskId,
            referrer: "http://localhost:9000/api/participant/prototype/d38d0eeb77b79a1b0a53d9f1/render/AxureProject1/payment.html",
            studyId: studyId,
            timezone: "2015-06-29T08:53:18.087Z"
        };


        var oNavigationTracking2 = {
            closeTrackId: "def0dee337f2f1c60a53da8e",
            context: {context_type: "html", entity: "", data: ""},
            eventType: "navigation",
            hash: "",
            offset: -60,
            pageUrl: "http://localhost:9000/api/participant/prototype/d38d0eeb77b79a1b0a53d9f1/render/AxureProject1/product_listing.html",
            pathName: "/api/participant/prototype/d38d0eeb77b79a1b0a53d9f1/render/AxureProject1/product_listing.html",
            projectId: projectId,
            questionId: taskId,
            referrer: "http://localhost:9000/api/participant/prototype/d38d0eeb77b79a1b0a53d9f1/render/AxureProject1/new_arrivals.html",
            studyId: studyId,
            timezone: "2015-06-29T08:57:34.874Z"
        };

        var oNavigationTracking3 = {
            closeTrackId: "6d4524f3e11dd9630a53db8f",
            context: {context_type: "html", entity: "", data: ""},
            eventType: "navigation",
            hash: "#ShoppingBagCounter=QTY&CSUM=1",
            offset: -60,
            pageUrl: "http://localhost:9000/api/participant/prototype/d38d0eeb77b79a1b0a53d9f1/render/AxureProject1/checkout.html#ShoppingBagCounter=QTY&CSUM=1",
            pathName: "/api/participant/prototype/d38d0eeb77b79a1b0a53d9f1/render/AxureProject1/checkout.html",
            projectId: projectId,
            questionId: taskId,
            referrer: "http://localhost:9000/api/participant/prototype/d38d0eeb77b79a1b0a53d9f1/render/AxureProject1/product_listing.html",
            studyId: studyId,
            timezone: "2015-06-29T09:02:44.485Z",
        };

        ParticipantApi.getStudyToParticipatedIn(mainTestUser, studyId, 200
        )
            .then(function () {
                return ParticipantApi.addAnnotation(mainTestUser, studyId, annotation1, 201);
            })
            .then(function (){
                return ParticipantApi.track(mainTestUser, studyId, tracking, 201);
            })
            .then(function (){
                tracking.questionId = 'invalidId';
                return ParticipantApi.track(mainTestUser, studyId, tracking, 400);
            })
            .then(function () {
                return ParticipantApi.addAnnotation(mainTestUser, studyId, annotation2, 201);
            })
            .then(function () {

                return ParticipantApi.addAnswer(mainTestUser, studyId, answer1, 201);
            })
            .then(function () {
                return ParticipantApi.addAnswer(mainTestUser, studyId, answer2, 201);
            })
            .then(function () {
                return ParticipantApi.addAnswer(mainTestUser, studyId, answer3, 201);
            })
            .then(function () {
                return ParticipantApi.addAnswer(mainTestUser, studyId, taskAnswer, 201);
            })
            .then(function () {
                return ParticipantApi.addAnswer(mainTestUser, studyId, taskAnswer2, 201);
            })
            .then(function(){
                return ParticipantApi.track(mainTestUser, studyId, oNavigationTracking1, 201);
            })
            .then(function(){
                return ParticipantApi.track(mainTestUser, studyId, oNavigationTracking2, 201);
            })
            .then(function(){
                return ParticipantApi.track(mainTestUser, studyId, oNavigationTracking3, 201);
            })
            .then(function () {
                done();
            })
            .catch(done);

    });


    it('Get Review Stats', function (done) {

        // promiseRequest('/api/projects/' + projectId + '/studies/' + studyId + '/review', null, 200, 'GET')
        ReviewApi.getStudyStats(mainTestUser, projectId, studyId, 200)
            .then(function (res) {

                expect(res.body).to.not.eq(undefined);
                expect(res.body.overview.studyId).to.eq(studyId);
                expect(res.body.overview.name).to.eq(study.name);
                expect(res.body.overview.annotations).to.eq(2);
                expect(res.body.overview.comments).to.eq(2);
                expect(res.body.overview.participants).to.eq(1);
                expect(res.body.overview.sentiments.positive.total).to.eq(2);
                expect(res.body.overview.sentiments.positive.percentage).to.eq(66.67);

                expect(res.body.overview.sentiments.negative.total).to.eq(0);
                expect(res.body.overview.sentiments.negative.percentage).to.eq(0);

                expect(res.body.overview.sentiments.neutral.total).to.eq(1);
                expect(res.body.overview.sentiments.neutral.percentage).to.eq(33.33);
                expect(res.body.overview.sentiments.chart).to.deep.equal([2, 1, 0]);

                expect(res.body.overview.participants).to.eq(1);
                expect(res.body.overview.tasks.successful.total).to.eq(2);
                expect(res.body.overview.tasks.successful.percentage).to.eq(100);

                expect(res.body.overview.tasks.failed.total).to.eq(0);
                expect(res.body.overview.tasks.failed.percentage).to.eq(0);

                expect(res.body.overview.tasks.abandoned.total).to.eq(0);
                expect(res.body.overview.tasks.abandoned.percentage).to.eq(0);

                expect(res.body.overview.tasks.chart).to.deep.equal([2, 0, 0]);

                expect(res.body.questions.length).to.eq(5);

                //Test for study review
                expect(res.body.averageAnnotations).to.eq(2);
                expect(res.body.averageComments).to.eq(2);
                expect(res.body.averageCompletedTasks).to.eq(2);
                expect(res.body.participantsCount).to.eq(1);
                expect(res.body.averageAnswers).to.eq(3); //Total answers are 5, 3 anser and 2 task.
                expect(res.body.averageTimeInStudy).to.eq(0);

                expect(res.body.breakdown).to.be.an('object');

                done();

            }).catch(done);
    });

    it('Get Question Stats', function (done) {


        ReviewApi.getQuestionStats(mainTestUser, projectId, studyId, questionId3, 200)
            .then(function (res) {
                expect(res.body).to.not.eq(undefined);
                expect(res.body.stats._id).to.eq(questionId3);
                expect(res.body.stats.text).to.eq('question3, a or b?');
                expect(res.body.stats.type).to.eq('MultipleChoice');
                expect(res.body.stats.thumbnail).to.eq('/some/url/3');
                expect(res.body.stats.averageDuration).to.eq(0);
                expect(res.body.stats.participants).to.eq(1);
                expect(res.body.stats.annotations).to.eq(0);
                expect(res.body.stats.comments).to.eq(0);
                done();
            }).catch(function (err) {
                done(err);
            });
    });

    it('Gets the Sankey Stats for the first task', function (done) {
        ReviewApi.getQuestionStats(mainTestUser, projectId, studyId, taskId, 200)
            .then(function (res) {
                expect(res.body).to.not.eq(undefined);
                expect(res.body.stats.sankey).to.not.eq(undefined);
                expect(res.body.stats.sankey.nodes.length).to.eq(3);
                expect(res.body.stats.sankey.links.length).to.eq(2);
                expect(res.body.stats.sankey.nodes[0].image).eq(deepLink1.thumbnail);
                expect(res.body.stats.sankey.nodes[1].image).eq(deepLink2.thumbnail);
                expect(res.body.stats.sankey.nodes[2].image).eq(deepLink3.thumbnail);
                expect(res.body.stats.sankey.links[0].source).eq(0);
                expect(res.body.stats.sankey.links[0].target).eq(1);
                expect(res.body.stats.sankey.links[0].value).eq(30);
                expect(res.body.stats.sankey.links[1].source).eq(1);
                expect(res.body.stats.sankey.links[1].target).eq(2);
                expect(res.body.stats.sankey.links[1].value).eq(30);
                done();
            }).catch(function (err) {
                done(err);
            });
    });

    it('Get the Sankey stats for the second task - should be blank', function(done){
        ReviewApi.getQuestionStats(mainTestUser, projectId, studyId, taskId2, 200)
            .then(function(res){
               expect(res.body).to.not.eq(undefined);
               expect(res.body.stats.sankey).to.not.eq(undefined);
               // no navigation data should have be sent
               expect(res.body.stats.sankey.nodes.length).to.eq(0);
               expect(res.body.stats.sankey.links.length).to.eq(0);
               done();
            }).catch(function(err){
               done(err);
            });
    });

})
;

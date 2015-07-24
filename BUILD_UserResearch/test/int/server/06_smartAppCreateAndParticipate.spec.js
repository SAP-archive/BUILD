/*eslint no-unused-expressions:0*/
'use strict';

var expect = require('norman-testing-tp').chai.expect;
var TestUserContext = require('../api/TestUserContext');
var mainTestUser = new TestUserContext();
var user2 = new TestUserContext();
var ParticipantRestApi = require('../api/ParticipantRestApi');
var StudyRestApi = require('../api/StudyRestApi');
var QuestionRestApi = require('../api/QuestionRestApi');
var ReviewRestApi = require('../api/ReviewRestApi');
var ParticipantApi = new ParticipantRestApi();
var StudyApi = new StudyRestApi();
var QuestionApi = new QuestionRestApi();
var ReviewApi = new ReviewRestApi();
//var compareObject = require('../api/testerUtil').compareObject;
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

function randomPoint() {
    return Math.floor(Math.random() * 100) + 1;
}

var host = 'http://www.some.host:123';
var indexPageUrl = '/deploy/public/667d29b3a2c455a20a326682/5/index.html';
var salesPageUrl = '/deploy/public/667d29b3a2c455a20a326682/5/index.html#/SalesOrder';
var lastNavigationId;
var currentLocation;

function randomClick(pageUrl, pathName) {
    return {
        clickX: randomPoint(),
        clickY: randomPoint(),
        eventType: 'iframeClick',
        hash: '',
        pageUrl: pageUrl || host + indexPageUrl,
        pathName: pathName || indexPageUrl
    };
}
describe('ParticipantService SmartTemplate REST API Test', function () {

    this.timeout(30000);

    var mainTestUserId;
    var mainTestUserNameEmail = 'userOne_' + new Date().getTime() + '@example.com';
    var userIdTwo;

    var userTwoNameEmail = 'usertwo_' + new Date().getTime() + '@example.com';
    var PROJECT_NAME = 'Test Participant ' + new Date().getTime();
    var projectId;
    var studyName;
    var studyId;
    var studyValue;
    var taskId;

    var annotation1 = {
        absoluteX: randomPoint(),
        absoluteY: randomPoint()
    };

    var annotation2 = {
        comment: 'annotation2',
        absoluteX: randomPoint(),
        absoluteY: randomPoint(),
        sentiment: 0
    };

    var annotation3 = {
        absoluteX: randomPoint(),
        absoluteY: randomPoint(),
        sentiment: 1,
        comment: 'this is a comment for'
    };

    var annotation4 = {
        comment: 'annotation2',
        absoluteX: randomPoint(),
        absoluteY: randomPoint(),
        sentiment: 2
    };

    var annotation5 = {
        absoluteX: randomPoint(),
        absoluteY: randomPoint(),
        sentiment: 2,
        comment: 'this is a comment for'
    };

    var annotation6 = {
        absoluteX: randomPoint(),
        absoluteY: randomPoint(),
        sentiment: 3,
        comment: 'this is a comment for'
    };

    var annotation7 = {
        absoluteX: randomPoint(),
        absoluteY: randomPoint(),
        sentiment: 3,
        comment: 'this is a comment for'
    };
    studyName = 'SmartTemplate ' + new Date().getTime();

    var task = {
        url: 'someurl',
        text: 'Som instruction Text',
        name: 'Task1',
        snapshotVersion: 'snapshot_1',
        isSmartApp: true,
        // This needs to be updated to 'UI5' once the snapshots service is available for SmartTemplates & UI5 apps
        snapshotUILang: 'UI5'
    };
    before('Initialize API users and set up test data', function (done) {
        // set up main 'mainTestUser' user
        mainTestUser.initialize(mainTestUserNameEmail, 'Minitest!1')
            .then(function () {
                // set up user2
                return user2.initialize(userTwoNameEmail, 'Minitest!1');
            })
            .then(function () {
                return mainTestUser.me(200);
            }).then(function (res) {
                expect(res.body).to.not.be.empty;
                mainTestUserId = res.body._id;
                return user2.me(200);
            })
            .then(function (res) {
                expect(res.body).to.not.be.empty;
                userIdTwo = res.body._id;
                return StudyApi.createProject(mainTestUser, {name: PROJECT_NAME}, 201);
            })
            .then(function (res) {
                expect(res.body).to.not.be.empty;
                projectId = res.body._id;
                return StudyApi.createStudy(mainTestUser, projectId, {
                    name: studyName,
                    description: 'description'
                }, 201);
            })
            .then(function (res) {
                expect(res.body).to.not.be.empty;
                studyId = res.body._id;

                var testDeepLinks = {
                    deepLinks: [{
                        pageUrl: indexPageUrl,
                        thumbnail: '/deploy/public/667d29b3a2c455a20a326682/5/resources/thumbnail/index.png'
                    },
                    {
                        pageUrl: salesPageUrl,
                        thumbnail: '/deploy/public/667d29b3a2c455a20a326682/5/resources/thumbnail/SalesOrder.png'
                    }]
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
            })
            .catch(done);

    });

    after(function (done) {
        unMockService(done);
    });


    it('[1] User One - Should be able to add a new Task for a smartTemplate', function (done) {
        expect(studyId).not.to.be.empty;

        QuestionApi.createTask(mainTestUser, projectId, studyId, task, 201)
            .then(function (res) {
                expect(res.body.error).to.not.exist;
                done();
            })
            .catch(done);
    });

    it('[2] User One - Should be able to publish a study', function (done) {
        expect(studyId).not.to.be.empty;
        StudyApi.updateStudy(mainTestUser, projectId, studyId, {
            status: 'published'
        }, 200)
            .then(function (res) {
                expect(res.body).not.to.be.empty;
                expect(res.body.name).to.equal(studyName);
                expect(res.body.status).to.equal('published');
                expect(res.body.participants.length).to.equal(0);
                expect(res.body.questions.length).to.equal(1);
                studyId = res.body._id;
                expect(studyId).not.to.be.empty;
                done();
            })
            .catch(done);
    });
    it('[3] User One (Review) - Should see 0 participate in the review Stats ', function (done) {
        ReviewApi.getStudyStats(mainTestUser, projectId, studyId, 200)
            .then(function (res) {
                var review = res.body;
                expect(review).to.not.be.empty;
                expect(review.overview.participants).to.equal(0);
                done();
            })
            .catch(done);
    });
    it('[4] User One (Participate)- should be able to get Study to participate in', function (done) {
        ParticipantApi.getStudyToParticipatedIn(mainTestUser, studyId, 200)
            .then(function (res) {
                expect(res.body).to.not.be.empty;
                studyValue = res.body;
                expect(studyValue.name).to.equal(studyName);
                expect(studyValue.description).to.equal('description');
                expect(studyValue.questions).to.not.be.empty;
                expect(studyValue.questions.length).to.equal(1);
                expect(studyValue.questions[0]._id).to.not.be.empty;
                taskId = studyValue.questions[0]._id;
                done();
            }).catch(done);
    });
    it('[5] User One (Review) - Should see 1 participate in the review Stats ', function (done) {
        ReviewApi.getStudyStats(mainTestUser, projectId, studyId, 200)
            .then(function (res) {
                var review = res.body;

                expect(review).to.not.be.empty;
                expect(review.overview.participants).to.equal(1);
                done();
            })
            .catch(done);
    });

    it('[6] User One (Participate) - Should Start be able to Task', function (done) {
        ParticipantApi.startTask(mainTestUser, projectId, studyId, taskId, '/api/some/prototype/index.html', 'http://somehost:1234/api/some/prototype/index.html')
            .then(function (res) {
                expect(res.answerRes).to.not.be.empty;
                expect(res.trackingRes).to.not.be.empty;
                done();

            }).catch(done);
    });

    it('[7] User One (Participate) - Drops 3 annotations', function (done) {
        annotation1.questionId = taskId;
        annotation2.questionId = taskId;
        annotation3.questionId = taskId;
        ParticipantApi.addAnnotation(mainTestUser, studyId, annotation1, 201)
            .then(function (res) {

                expect(res.body).to.not.be.empty;
                expect(res.body._id).to.not.be.empty;
                annotation1._id = res.body._id;
                return ParticipantApi.addAnnotation(mainTestUser, studyId, annotation2, 201);
            })
            .then(function (res) {
                expect(res.body).to.not.be.empty;
                expect(res.body._id).to.not.be.empty;
                annotation2._id = res.body._id;
                return ParticipantApi.addAnnotation(mainTestUser, studyId, annotation3, 201);
            })
            .then(function (res) {
                expect(res.body).to.not.be.empty;
                expect(res.body._id).to.not.be.empty;
                annotation3._id = res.body._id;
                done();
            })
            .catch(done);
    });

    it('[8] User One (Review) - Should see breakdown for User One and  overview details in the review Stats ', function (done) {
        ReviewApi.getStudyStats(mainTestUser, projectId, studyId, 200)
            .then(function (res) {
                var review = res.body;
                expect(review).to.not.be.empty;
                expect(review.overview.participants).to.equal(1);

                //should have 3 annotation in user's breakdown
                expect(review.breakdown[mainTestUserId].annotations).to.equal(3);
                //should have 2 comments in user's breakdown
                expect(review.breakdown[mainTestUserId].comments).to.equal(2);

                //should have 0 completed tasks in user's breakdown
                expect(review.breakdown[mainTestUserId].completedTasks).to.equal(0);

                //averages should match User breakdown as only on participant
                expect(review.averageAnnotations).to.equal(3);
                expect(review.averageComments).to.equal(2);
                expect(review.averageCompletedTasks).to.equal(0);
                expect(review.participantsCount).to.equal(1);

                expect(review.overview.sentiments.positive.total).to.equal(1);
                expect(review.overview.sentiments.positive.percentage).to.equal(100);

                expect(review.overview.sentiments.chart.length).to.equal(3);
                expect(review.overview.sentiments.chart[0]).to.equal(1);

                done();
            })
            .catch(done);
    });

    it('[9] User One (Participant) - can save a tracking for a click event ', function (done) {
       var click = randomClick();
        click.context = {
            context_type : 'ST'
        };

        ParticipantApi.track(mainTestUser, studyId, click, 201)
            .then(function (res) {
                expect(res.body).to.not.be.empty;
                expect(res.body._id).to.not.be.empty;
                done();
            })
            .catch(done);
    });

    it('[10] User One (Participant) - navigate to new page on task an drop 2 annotations', function (done) {
        var click = randomClick();
        click.pageUrl += click.hash;
        click.context = {
            context_type: 'ST'

        };
        var contextData = 'apples';
        annotation4.questionId = taskId;
        annotation5.questionId = taskId;
        ParticipantApi.track(mainTestUser, studyId, click, 201)
            .then(function (res) {
                expect(res.body).to.not.be.empty;
                expect(res.body._id).to.not.be.empty;
                var hashChangeEvent = {
                    projectId: projectId,
                    studyId: studyId,
                    questionId: taskId,
                    type: 'iframeHashchange',
                    newLocation: host + salesPageUrl + '(\'' + contextData + '\')'
                };

                return ParticipantApi.track(mainTestUser, studyId, hashChangeEvent, 201);
            })
            .then(function (res) {
                expect(res.body).to.not.be.empty;
                expect(res.body._id).to.not.be.empty;
                currentLocation =  host + salesPageUrl + '(\'' + contextData + '\')';
                var navEvent = {
                    projectId: projectId,
                    studyId: studyId,
                    questionId: taskId,
                    type: 'navigation',
                    hash: '#/SalesOrder(\'' + contextData + '\')',
                    pageUrl: currentLocation,
                    pathName: indexPageUrl,
                    referrer: host + indexPageUrl
                };
                navEvent.context = {
                    context_type: 'ST',
                    entity: 'SalesOrder',
                    data: contextData
                };

                return ParticipantApi.track(mainTestUser, studyId, navEvent, 201);
            })
            .then(function (res) {
                expect(res.body).to.not.be.empty;
                expect(res.body._id).to.not.be.empty;
                lastNavigationId = res.body._id;
                return ParticipantApi.addAnnotation(mainTestUser, studyId, annotation4, 201);
            })
            .then(function (res) {

                expect(res.body).to.not.be.empty;
                expect(res.body._id).to.not.be.empty;
                annotation4._id = res.body._id;
                return ParticipantApi.addAnnotation(mainTestUser, studyId, annotation5, 201);
            })
            .then(function (res) {
                expect(res.body).to.not.be.empty;
                expect(res.body._id).to.not.be.empty;
                annotation5._id = res.body._id;

                done();
            })
            .catch(done);
    });
    it('[11] User One (Review) - Should see breakdown for User One and  overview details in the review Stats ', function (done) {
        ReviewApi.getStudyStats(mainTestUser, projectId, studyId, 200)
            .then(function (res) {
                var review = res.body;
                expect(review).to.not.be.empty;
                expect(review.overview.participants).to.equal(1);

                //should have 3 annotation in user's breakdown
                expect(review.breakdown[mainTestUserId].annotations).to.equal(5);
                //should have 2 comments in user's breakdown
                expect(review.breakdown[mainTestUserId].comments).to.equal(4);

                //should have 0 completed tasks in user's breakdown
                expect(review.breakdown[mainTestUserId].completedTasks).to.equal(0);

                //averages should match User breakdown as only on participant
                expect(review.averageAnnotations).to.equal(5);
                expect(review.averageComments).to.equal(4);
                expect(review.averageCompletedTasks).to.equal(0);
                expect(review.participantsCount).to.equal(1);

                expect(review.overview.sentiments.positive.total).to.equal(1);

                expect(review.overview.sentiments.positive.percentage).to.equal(33.33);
                expect(review.overview.sentiments.positive.total).to.equal(1);
                expect(review.overview.sentiments.negative.percentage).to.equal(66.67);
                expect(review.overview.sentiments.negative.total).to.equal(2);

                expect(review.overview.sentiments.chart.length).to.equal(3);
                expect(review.overview.sentiments.chart[0]).to.equal(1);
                expect(review.overview.sentiments.chart[2]).to.equal(2);

                expect(review.questions.length).to.equal(1);
                var taskDetails = review.questions[0];
                expect(taskDetails._id).to.equal(taskId);

                // visited only 2 pages (different contexts e.g. apples & oranges are considered new pages)
                expect(taskDetails.averagePagesVisited).to.equal(2);
                expect(taskDetails.links.length).to.equal(2);

                done();
            })
            .catch(done);
    });


    it('[12] User One (Participant) - navigate to 3rd page (different context) on task an drop 2 annotations', function (done) {
        var click = randomClick();
        click.pageUrl += click.hash;
        click.context = {
            context_type: 'ST'
        };
        var contextData = 'oranges';
        annotation6.questionId = taskId;
        annotation7.questionId = taskId;
        ParticipantApi.track(mainTestUser, studyId, click, 201)
            .then(function (res) {
                expect(res.body).to.not.be.empty;
                expect(res.body._id).to.not.be.empty;
                var hashChangeEvent = {
                    projectId: projectId,
                    studyId: studyId,
                    questionId: taskId,
                    type: 'iframeHashchange',
                    newLocation: host + salesPageUrl + '(\'' + contextData + '\')'
                };

                return ParticipantApi.track(mainTestUser, studyId, hashChangeEvent, 201);
            })
            .then(function (res) {
                expect(res.body).to.not.be.empty;
                expect(res.body._id).to.not.be.empty;
                currentLocation =  host + salesPageUrl + '(\'' + contextData + '\')';
                var navEvent = {
                    projectId: projectId,
                    studyId: studyId,
                    questionId: taskId,
                    type: 'navigation',
                    hash: '#/SalesOrder(\'' + contextData + '\')',
                    pageUrl: currentLocation,
                    pathName: indexPageUrl,
                    referrer: host + indexPageUrl
                };
                navEvent.context = {
                    context_type: 'ST',
                    entity: 'SalesOrder',
                    data: contextData
                };

                return ParticipantApi.track(mainTestUser, studyId, navEvent, 201);
            })
            .then(function (res) {
                expect(res.body).to.not.be.empty;
                expect(res.body._id).to.not.be.empty;

                lastNavigationId = res.body._id;
                return ParticipantApi.addAnnotation(mainTestUser, studyId, annotation6, 201);
            })
            .then(function (res) {

                expect(res.body).to.not.be.empty;
                expect(res.body._id).to.not.be.empty;
                annotation4._id = res.body._id;
                return ParticipantApi.addAnnotation(mainTestUser, studyId, annotation7, 201);
            })
            .then(function (res) {
                expect(res.body).to.not.be.empty;
                expect(res.body._id).to.not.be.empty;
                annotation5._id = res.body._id;

                done();
            })
            .catch(done);
    });

    it('[13] User One (participant) - end Task ', function (done) {
        ParticipantApi.track(mainTestUser, studyId, {_id : lastNavigationId}, 201)
            .then(function (res) {
                expect(res.body).to.not.be.empty;
                expect(res.body._id).to.equal(lastNavigationId);
                var ans = {
                    answer: currentLocation,
                    questionId: taskId,
                    questionType: 'Task',
                    sentiment: 0,
                    status: 'completed correctly'
                };
                return ParticipantApi.addAnswer(mainTestUser, studyId, ans, 200);
            })
            .then(function (res) {
                expect(res.body).to.not.be.empty;
                done();
            })
            .catch(done);
    });

    it('[14] User One (Review) - Should see breakdown for User One and overview details in the review Stats ', function (done) {
        ReviewApi.getStudyStats(mainTestUser, projectId, studyId, 200)
            .then(function (res) {
                var review = res.body;
                expect(review).to.not.be.empty;
                expect(review.overview.participants).to.equal(1);

                //should have 7 annotation in user's breakdown
                expect(review.breakdown[mainTestUserId].annotations).to.equal(7);
                //should have 6 comments in user's breakdown
                expect(review.breakdown[mainTestUserId].comments).to.equal(6);

                //should have 1 completed tasks in user's breakdown as task is now complete
                expect(review.breakdown[mainTestUserId].completedTasks).to.equal(1);

                //averages should match User breakdown as only on participant
                expect(review.averageAnnotations).to.equal(7);
                expect(review.averageComments).to.equal(6);
                expect(review.averageCompletedTasks).to.equal(1);
                expect(review.participantsCount).to.equal(1);

                expect(review.overview.sentiments.positive.total).to.equal(1);

                expect(review.overview.sentiments.positive.percentage).to.equal(20);
                expect(review.overview.sentiments.positive.total).to.equal(1);

                expect(review.overview.sentiments.negative.percentage).to.equal(40);
                expect(review.overview.sentiments.negative.total).to.equal(2);

                expect(review.overview.sentiments.neutral.total).to.equal(2);
                expect(review.overview.sentiments.neutral.percentage).to.equal(40);

                expect(review.overview.sentiments.chart.length).to.equal(3);
                // positive
                expect(review.overview.sentiments.chart[0]).to.equal(1);
                // neutral
                expect(review.overview.sentiments.chart[1]).to.equal(2);
                // negative
                expect(review.overview.sentiments.chart[2]).to.equal(2);


                expect(review.questions.length).to.equal(1);
                var taskDetails = review.questions[0];
                expect(taskDetails._id).to.equal(taskId);

                // visited only 3 pages (different contexts e.g. apples & oranges are considered new pages)
                expect(taskDetails.averagePagesVisited).to.equal(3);
                expect(taskDetails.links.length).to.equal(2);

                done();
            })
            .catch(done);
    });

});

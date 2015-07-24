/*eslint no-unused-expressions:0*/
'use strict';

var expect = require('norman-testing-tp').chai.expect;
var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var Promise = require('norman-promise');

var path = require('path');

var TestUserContext = require('../api/TestUserContext');
var mainTestUser = new TestUserContext();
var StudyRestApi = require('../api/StudyRestApi');
var api = new StudyRestApi();

var PROJECT_NAME = 'Test Basic';
var userNameEmail = 'studyService_' + new Date().getTime() + '@example.com';
var remember;
function mockService(module) {
    //only use if shared workspace added to sample app services config
    //originalSnapShotService = registry.getModule('SnapshotService');
    if (remember) {
        registry.unregisterModule('SnapshotService');
    }
    registry.registerModule(module, 'SnapshotService');
}

function unMockService(cb, err) {
    registry.unregisterModule('SnapshotService');
    if (remember) {
        registry.registerModule(remember, 'SnapshotService');
    }
    if (err) return cb(err);

    return cb();
}


describe('StudyService REST API Test', function () {

    this.timeout(30000);
    var projectId;
    var studyName;
    var studyId;
    var question = {text: 'question', ordinal: 0, url: 'url'};
    var smartApp = {text: 'SAquestion', ordinal: 0, url: 'SAurl', isSmartApp: true};

    before('1 - Initialize API', function (done) {
        console.log('1 - Initialize API');
        mainTestUser.initialize(userNameEmail, 'Minitest!1').then(function () {
            return api.createProject(mainTestUser, {name: PROJECT_NAME}, 201);
        }).then(function (res) {
            console.log('1 - createProject API');
            projectId = res.body._id;
            done();
        }).catch(function (err) {
            console.log('');
            console.log('1 - StudyService >>> Before: ERROR', err);
            console.log('');
            done(err);
        });
    });

    after(function (done) {
        // Only required for one user to do this task!
        //mainTestUser.resetDB(done);
        done();
    });


    it('2 - Should respond with an empty list if there are no studies associated to the projectId', function (done) {
        api.getStudies(mainTestUser, projectId, 200)
            .then(function (res) {
                console.log('2 - getStudies ');
                expect(res.body).to.be.an.instanceof(Array);
                expect(res.body).to.be.empty;
                done();
            })
            .catch(done);
    });

    it('3 - Should create a new study, created by the logged in user', function (done) {
        studyName = 'Study Service Test ' + new Date().getTime();
        api.createStudy(mainTestUser, projectId, {
            name: studyName,
            description: 'description',
            questions: [question]
        }, 201)
            .then(function (res) {
                console.log('3 - createStudy ');
                expect(res.body).not.to.be.empty;
                expect(res.body.name).to.equal(studyName);
                expect(res.body.status).to.equal('draft');
                expect(res.body.questions).to.be.an.instanceof(Array);
                expect(res.body.questions.length).to.equal(1);
                studyId = res.body._id;
                expect(studyId).not.to.be.empty;
                done();
            })
            .catch(done);
    });

    // this is expecting a 500 as we have removed the depndencies needed for the sample UR app
    it('4 - Should create a new study with a Task, created by the logged in user', function (done) {
        var testDeepLink = {
            pageUrl: '/deploy/public/667d29b3a2c455a20a326682/5/index.html#/S0',
            thumbnail: '/deploy/public/667d29b3a2c455a20a326682/5/resources/thumbnail/S0.png'
        };
        var mockedService = {
            getSnapshots: function () {
                var deferred = Promise.defer();
                var snapshots = [{deepLinks: [testDeepLink]}];
                deferred.resolve(snapshots);
                return deferred.promise;
            }
        };
        mockService(mockedService);

        var studyName2 = 'Study 2 Service Test ' + new Date().getTime();
        api.createStudyWithQuestion(mainTestUser, projectId, {
            name: studyName2,
            description: 'description',
            type: 'Task',
            snapshotVersion: 1
        }, 201)
            .then(function (res) {

                var result = res.body;

                expect(result.questions).to.not.be.empty;
                expect(result.questions.length).to.not.be.empty;
                expect(result.questions[0]).to.not.be.empty;
                expect(result.questions[0].url).to.not.be.empty;
                expect(result.questions[0].thumbnail).to.not.be.empty;

                unMockService(done);
            })
            .catch(function (err) {
                unMockService(done, err);
            });
    });

    it('5 - Should respond with a list of studies owned by the logged in user', function (done) {
        api.getStudies(mainTestUser, projectId, 200)
            .then(function (res) {
                console.log('5 - getStudies ');
                expect(res.body).to.be.an.instanceof(Array);
                expect(res.body).not.to.be.empty;
                expect(res.body.length).to.equal(2);
                expect(res.body[0].status).to.equal('draft');
                expect(res.body[0].name).to.equal(studyName);
                studyId = res.body[0]._id;
                expect(studyId).not.to.be.empty;
                done();
            })
            .catch(done);
    });

    it('6 - Should return a specific study based on known study id', function (done) {
        api.getStudy(mainTestUser, projectId, studyId, 200)
            .then(function (res) {
                console.log('5 - getStudy ');
                expect(res.body).not.to.be.empty;
                expect(res.body.name).to.equal(studyName);
                expect(res.body.status).to.equal('draft');
                expect(res.body._id).to.equal(studyId);
                done();
            })
            .catch(done);
    });

    it('26 - Should invite user to study.', function (done) {
        var invite_list = [];
        var email1 = 'a@a.com';
        var email2 = 'a@b.com';
        invite_list.push({email: email1, status: 'new'});
        invite_list.push({email: email2, status: 'new'});

        api.sendInvitee(mainTestUser, projectId, studyId, {inviteList: invite_list}, 201)
            .then(function (res) {
                console.log('26 - send invitation');
                expect(res.body).not.to.be.empty;
                expect(res.body.newInvitee).to.be.an.instanceof(Array);
                expect(res.body.newInvitee.length).to.equal(2);

                api.getStudy(mainTestUser, projectId, studyId, 200)
                    .then(function (res) {
                         console.log('26 - send invitation>> getStudy');
                         expect(res.body).not.to.be.empty;
                         expect(res.body.name).to.equal(studyName);
                         expect(res.body._id).to.equal(studyId);
                         expect(res.body.invite_list).to.be.an.instanceof(Array);
                         expect(res.body.invite_list.length).to.equal(2);
                        done();
                    })
                    .catch(done);
            })
            .catch(done);
    });



    it('7 - Should be able to update existing study', function (done) {


        studyName += ' updated';
        api.updateStudy(mainTestUser, projectId, studyId, {
            name: studyName,
            description: 'description',
            status: 'published'
        }, 200)
            .then(function (res) {
                console.log('7 - updateStudy ');
                expect(res.body).not.to.be.empty;
                expect(res.body.name).to.equal(studyName);
                expect(res.body.status).to.equal('published');
                expect(res.body.questions).to.be.an.instanceof(Array);
                expect(res.body.questions.length).to.equal(1);
                studyId = res.body._id;
                expect(studyId).not.to.be.empty;
                done();
            })
            .catch(done);
    });


    it('8 - Should respond with a list of studies containing the updated study', function (done) {
        api.getStudies(mainTestUser, projectId, 200)
            .then(function (res) {
                console.log('8 - getStudies ');
                expect(res.body).to.be.an.instanceof(Array);
                expect(res.body).not.to.be.empty;
                expect(res.body.length).to.equal(2);
                expect(res.body[1].status).to.equal('published');
                expect(res.body[1].name).to.equal(studyName);
                studyId = res.body[1]._id;
                expect(studyId).not.to.be.empty;
                done();
            })
            .catch(done);
    });

    it('9 - Should return the updated study based on known study id', function (done) {
        api.getStudy(mainTestUser, projectId, studyId, 200)
            .then(function (res) {
                console.log('9 - getStudy ');
                expect(res.body).not.to.be.empty;
                expect(res.body.name).to.equal(studyName);
                expect(res.body.status).to.equal('published');
                expect(res.body._id).to.equal(studyId);
                done();
            })
            .catch(done);
    });

    it('10 - Should delete a study owned by the logged in user', function (done) {
        api.deleteStudy(mainTestUser, projectId, studyId, 204)
            .then(function (res) {
                console.log('9 - deleteStudy ');
                expect(res.body).to.be.empty;
                done();
            })
            .catch(done);
    });

    it('11 - Should respond with a single study in list after one study has been deleted', function (done) {
        api.getStudies(mainTestUser, projectId, 200)
            .then(function (res) {
                console.log('11 - getStudies ');
                expect(res.body).to.be.an.instanceof(Array);
                expect(res.body.length).to.equal(1);
                done();
            })
            .catch(done);
    });

    it('13 - Should return a 404 when a deleted study is requested', function (done) {
        api.getStudy(mainTestUser, projectId, studyId, 404)
            .then(function (res) {
                console.log('12 - getStudy ');
                expect(res.body).to.be.empty;
                done();
            })
            .catch(done);
    });

    /**
     * Tests for updating the study status
     *
     * Test 1 - should not be able to update details such as name and description after publishing
     */
    it('14 - Should not be able to update study details after it has been published', function (done) {

        api.updateStudy(mainTestUser, projectId, studyId, {
            name: 'New study name after publishing',
            description: 'new description'
        }, 400)
            .then(function (res) {
                console.log('13 - updateStudy ');
                expect(res.text).to.equal('["Unable to update name or description of a published study."]');
                done();
            })
            .catch(done);
    });

    /**
     * Test Published -> Draft.  Should not be allowed.
     */
    it('15 - Should not be able to update status from published to draft.', function (done) {
        api.updateStudy(mainTestUser, projectId, studyId, {status: 'draft'}, 400)
            .then(function (res) {
                console.log('14 - updateStudy ');
                expect(res.text).to.equal('["Invalid update for study status."]');
                done();
            })
            .catch(done);
    });

    /**
     * Test Published -> Archived.  Should not be allowed.
     */
    it('16 - Should not be able to update status from published to archived.', function (done) {
        api.updateStudy(mainTestUser, projectId, studyId, {status: 'archived'}, 400)
            .then(function (res) {
                console.log('14 - updateStudy ');
                expect(res.text).to.equal('["Invalid update for study status."]');
                done();
            })
            .catch(done);
    });

    /**
     * Test Published -> Paused.  Should be ok.
     */
    it('17 - Should  be able to update status from published to paused.', function (done) {
        api.updateStudy(mainTestUser, projectId, studyId, {status: 'paused'}, 200)
            .then(function (res) {
                console.log('16 - updateStudy ');
                expect(res.body.status).to.equal('paused');
                done();
            })
            .catch(done);
    });

    /**
     * Test Paused -> Draft.  Not allowed.
     */
    it('18 - Should not be able to update status from paused to draft.', function (done) {
        api.updateStudy(mainTestUser, projectId, studyId, {status: 'draft'}, 400)
            .then(function (res) {
                console.log('17 - updateStudy ');
                expect(res.text).to.equal('["Invalid update for study status."]');
                done();
            })
            .catch(done);
    });

    /**
     * Test Paused -> Published.  Should be ok.
     */
    it('19 - Should be able to update status from paused to published.', function (done) {
        api.updateStudy(mainTestUser, projectId, studyId, {status: 'published'}, 200)
            .then(function (res) {
                console.log('18 - updateStudy :published');
                expect(res.body.status).to.equal('published');

                /**
                 * Post-test clean-up.
                 * Changing status back to paused for subsequent tests
                 */
                return api.updateStudy(mainTestUser, projectId, studyId, {status: 'paused'}, 200);
            })
            .then(function (res) {
                console.log('13 - updateStudy :paused');
                expect(res.body.status).to.equal('paused');
                done();
            })
            .catch(done);
    });

    /**
     * Test Paused -> Archived.  Should be ok.
     */
    it('20 - Should be able to update status from paused to archived.', function (done) {
        api.updateStudy(mainTestUser, projectId, studyId, {status: 'archived'}, 200)
            .then(function (res) {
                console.log('19 - updateStudy ');
                expect(res.body.status).to.equal('archived');
                done();
            })
            .catch(done);
    });

    /**
     * Test Archived -> Draft.  Should not be allowed.
     */
    it('21 - Should not be able to update status from archived to draft.', function (done) {

        api.updateStudy(mainTestUser, projectId, studyId, {status: 'draft'}, 400)
            .then(function (res) {
                console.log('20 - updateStudy ');
                expect(res.text).to.equal('["Invalid update for study status."]');
                done();
            })
            .catch(done);
    });

    /**
     * Test Archived -> Paused.  Should not be allowed.
     */
    it('22 - Should not be able to update status from archived to paused.', function (done) {
        api.updateStudy(mainTestUser, projectId, studyId, {status: 'paused'}, 400)
            .then(function (res) {
                console.log('21 - updateStudy ');
                expect(res.text).to.equal('["Invalid update for study status."]');
                done();
            })
            .catch(done);
    });

    /**
     * Test Archived -> Published.  Should be ok.
     */
    it('23 - Should be able to update status from archived to published.', function (done) {
        api.updateStudy(mainTestUser, projectId, studyId, {status: 'published'}, 200)
            .then(function (res) {
                console.log('22 - updateStudy ');
                expect(res.body.status).to.equal('published');
                done();
            })
            .catch(done);
    });

    /**
     * [Neg. Test with invalidate parameter] Create new study - Should return 400.
     */
    it('24 - [Neg. Test] - [Invalidate Params Request] - Should not create a new study.', function (done) {
        studyName = 'Study123';
        // name parameter is required:
        api.createStudy(mainTestUser, projectId, {description: 'description', questions: [question]}, 400)
            .then(function (res) {
                console.log('23 - createStudy ');
                expect(res.body.message).to.equal('request missing required parameters.');
                done();
            })
            .catch(done);
    });


    /**
     * [Neg. Test with invalidate schema/data] Create new study - Should return 400.
     */
    it('25 - [Neg. Test] - [Invalidate Schema] - Should not create a new study.', function (done) {
        studyName = 'Study123';

        var INVALID_MAX_LENGTH_NAME = studyName + 'Invalid Max Length Name ... Invalid Max Length Name';
        api.createStudy(mainTestUser, projectId, {
            name: INVALID_MAX_LENGTH_NAME,
            description: 'description',
            questions: [question]
        }, 400)
            .then(function (res) {
                console.log('24 - createStudy ');
                expect(res.body.message).to.equal('Validation failed');
                expect(res.body.errors.name.message).to.equal('Study name should be between 1 and 45 characters');
                expect(res.body.errors.name.value).to.equal(INVALID_MAX_LENGTH_NAME);
                done();
            })
            .catch(done);
    });




});

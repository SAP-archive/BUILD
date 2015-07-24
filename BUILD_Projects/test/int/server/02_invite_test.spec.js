'use strict';

var expect = require('norman-testing-tp').chai.expect;

var ProjectAPI = require('../api/ProjectsRestApi');
var userOne = new ProjectAPI();
var userTwo = new ProjectAPI();
var userThree = new ProjectAPI();

var projectId;
var PROJECT_NAME = 'Test Invite';
var USER_ONE_EMAIL = 'do.not-reply.user.1@example.com';
var USER_TWO_EMAIL = 'do.not-reply.user.2@example.com';
var USER_THREE_EMAIL = 'do.not-reply.user.3@example.com';

describe('Invite REST API Test', function () {
    this.timeout(15000);

    before('Initialize User One', function (done) {
        userOne.initialize(USER_ONE_EMAIL, 'Minipas!1', true).then(done);
    });

    before('Initialize User Two', function (done) {
        userTwo.initialize(USER_TWO_EMAIL, 'Minipas!1').then(done);
    });

    before('Initialize User Three', function (done) {
        userThree.initialize(USER_THREE_EMAIL, 'Minipas!1').then(done);
    });

    after(function (done) {
        // Only required for one user to do this task!
        userOne.resetDB(done);
    });

    it('Call POST /api/projects - Create project', function (done) {
        userOne.createProject(201, {'name': PROJECT_NAME}, function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(userOne.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result).not.to.be.empty;
                expect(result.name).to.equal(PROJECT_NAME);
                expect(result.deleted).to.equal(false);
                expect(result.user_list).to.be.an.instanceof(Array);
                expect(result.user_list.length).to.equal(1);
                expect(result.invite_list).to.be.an.instanceof(Array);
                expect(result.invite_list).to.be.empty;
                expect(result.reject_list).to.be.an.instanceof(Array);
                expect(result.reject_list).to.be.empty;
                projectId = result._id;
                expect(projectId).not.to.eql(null);
                expect(projectId).not.to.be.empty;
                done();
            }
        });
    });

    it('Call POST /api/projects/:projectId/invite - User one creates invite for user two', function (done) {
        userOne.createInvite(201, projectId, {'email_list': [{'email': USER_TWO_EMAIL}]}, function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(userOne.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result).not.to.be.empty;
                expect(result.newInvitee).not.to.be.empty;
                expect(result.newInvitee).to.be.an.instanceof(Array);
                expect(result.newInvitee.length).to.equal(1);
                expect(result.newInvitee[0].email).to.equal(USER_TWO_EMAIL);

                userOne.getProject(200, projectId, function (err, res) {
                    if (err) {
                        done(err);
                    } else {
                        expect(userOne.isContentTypeJSON(res)).to.be.true;
                        var project = res.body;
                        expect(project.name).to.equal(PROJECT_NAME);
                        expect(project.deleted).to.equal(false);
                        expect(project.user_list).to.be.an.instanceof(Array);
                        expect(project.user_list.length).to.equal(1);
                        expect(project.invite_list).to.be.an.instanceof(Array);
                        expect(project.invite_list).not.to.be.empty;
                        expect(project.invite_list[0].email).to.equal(USER_TWO_EMAIL);
                        expect(project.reject_list).to.be.an.instanceof(Array);
                        expect(project.reject_list).to.be.empty;
                        done();
                    }
                });
            }
        });
    });

    it('Call POST /api/projects/:projectId/invite - Create same invite again, system state should as-is', function (done) {
        userOne.createInvite(201, projectId, {'email_list': [{'email': USER_TWO_EMAIL}]}, function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(userOne.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result).not.to.be.empty;
                expect(result.newInvitee).not.to.be.empty;
                expect(result.newInvitee).to.be.an.instanceof(Array);
                expect(result.newInvitee.length).to.equal(1);
                expect(result.newInvitee[0].email).to.equal(USER_TWO_EMAIL);

                userOne.getProject(200, projectId, function (err, res) {
                    if (err) {
                        done(err);
                    } else {
                        expect(userOne.isContentTypeJSON(res)).to.be.true;
                        var project = res.body;
                        expect(project.name).to.equal(PROJECT_NAME);
                        expect(project.deleted).to.equal(false);
                        expect(project.user_list).to.be.an.instanceof(Array);
                        expect(project.user_list.length).to.equal(1);
                        expect(project.invite_list).to.be.an.instanceof(Array);
                        expect(project.invite_list).not.to.be.empty;
                        expect(project.invite_list[0].email).to.equal(USER_TWO_EMAIL);
                        expect(project.reject_list).to.be.an.instanceof(Array);
                        expect(project.reject_list).to.be.empty;
                        done();
                    }
                });
            }
        });
    });

    it('Call POST /api/projects/:projectId/invite - User one should not be allowed to add themselves', function (done) {
        userOne.createInvite(400, projectId, {'email_list': [{'email': USER_ONE_EMAIL}]}, function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(userOne.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result).not.to.be.empty;
                expect(result.error).to.equal('Cannot invite yourself to a project that you are already a member of!');
                done();
            }
        });
    });

    it('Call POST /api/projects/:projectId/invite - User one should not be allowed to invite a user with an invalid email address', function (done) {
        userOne.createInvite(400, projectId, {'email_list': [{'email': 'invalid@email'}]}, function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(userOne.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result).not.to.be.empty;
                expect(result.error).to.equal('There is a problem with the request, missing required fields');
                done();
            }
        });
    });

    it('Call POST /api/projects/:projectId/invite - User one should not be allowed to create an invite if missing fields', function (done) {
        userOne.createInvite(400, projectId, {'email_list': [{'wrong_field': USER_ONE_EMAIL}]}, function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(userOne.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result).not.to.be.empty;
                expect(result.error).to.equal('There is a problem with the request, missing required fields');
                done();
            }
        });
    });

    it('Call POST /api/projects/:projectId/invite - User one should not be allowed to create an invite if missing fields', function (done) {
        userOne.createInvite(400, projectId, {'wrong_list': [{'email': USER_ONE_EMAIL}]}, function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(userOne.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result).not.to.be.empty;
                expect(result.error).to.equal('There is a problem with the request, missing required fields');
                done();
            }
        });
    });

    it('Call POST /api/projects/:projectId/invite - User one should not be allowed to create an invite email field is empty', function (done) {
        userOne.createInvite(400, projectId, {'email_list': [{'email': ''}]}, function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(userOne.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result).not.to.be.empty;
                expect(result.error).to.equal('There is a problem with the request, missing required fields');
                done();
            }
        });
    });

    it('Call POST /api/projects/:projectId/invite - User one should not be allowed to create an invite email field is an integer', function (done) {
        userOne.createInvite(400, projectId, {'email_list': [{'email': 12345}]}, function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(userOne.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result).not.to.be.empty;
                expect(result.error).to.equal('There is a problem with the request, missing required fields');
                done();
            }
        });
    });

    /**
     * Second user retrieves and accepts an invite
     */

    it('Call GET /api/projects/ - User two projects list which will contain an invite from user one', function (done) {
        userTwo.getProjects(200, function (err, res) {
            if (err) {
                return done(err);
            }
            expect(userTwo.isContentTypeJSON(res)).to.be.true;
            var result = res.body;
            expect(result).to.be.an.instanceof(Array);
            expect(result).not.to.be.empty;
            expect(result.length).to.equal(1);
            expect(result[0].name).to.equal(PROJECT_NAME);
            // User has an outstanding invite
            expect(result[0].invite_list.length).to.equal(1);
            expect(result[0].invite_list[0].email).to.equal(USER_TWO_EMAIL);
            expect(result[0].reject_list).to.be.empty;
            expect(result[0].user_list.length).to.equal(1);
            done();
        });
    });

    it('Call PUT /api/projects/:projectId/invite - User two accepts invite to project created by user one', function (done) {
        userTwo.acceptInvite(200, projectId, function (err, res) {
            if (err) {
                return done(err);
            }
            expect(userTwo.isContentTypeJSON(res)).to.be.true;
            var result = res.body;
            expect(result).not.to.be.empty;
            expect(result.invite_list.length).to.equal(0);
            expect(result.reject_list).to.be.empty;
            expect(result.user_list.length).to.equal(2);
            done();
        });
    });

    it('Call GET /api/projects/ - User two projects list will now have an updated user list', function (done) {
        userTwo.getProjects(200, function (err, res) {
            if (err) {
                return done(err);
            }
            expect(userTwo.isContentTypeJSON(res)).to.be.true;
            var result = res.body;
            expect(result).to.be.an.instanceof(Array);
            expect(result).not.to.be.empty;
            expect(result.length).to.equal(1);
            expect(result[0].name).to.equal(PROJECT_NAME);
            expect(result[0].invite_list.length).to.equal(0);
            expect(result[0].reject_list).to.be.empty;
            expect(result[0].user_list.length).to.equal(2);
            done();
        });
    });

    /**
     * Third user retrieves and rejects an invite
     */

    it('Call POST /api/projects/:projectId/invite - Create invite for user three', function (done) {
        userOne.createInvite(201, projectId, {'email_list': [{'email': USER_THREE_EMAIL}]}, function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(userOne.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result).not.to.be.empty;
                expect(result.newInvitee).not.to.be.empty;
                expect(result.newInvitee).to.be.an.instanceof(Array);
                expect(result.newInvitee.length).to.equal(1);
                expect(result.newInvitee[0].email).to.equal(USER_THREE_EMAIL);

                userOne.getProject(200, projectId, function (err, res) {
                    if (err) {
                        done(err);
                    } else {
                        expect(userOne.isContentTypeJSON(res)).to.be.true;
                        var project = res.body;
                        expect(project.name).to.equal(PROJECT_NAME);
                        expect(project.deleted).to.equal(false);
                        expect(project.user_list).to.be.an.instanceof(Array);
                        expect(project.user_list.length).to.equal(2);
                        expect(project.invite_list).to.be.an.instanceof(Array);
                        expect(project.invite_list).not.to.be.empty;
                        expect(project.invite_list[0].email).to.equal(USER_THREE_EMAIL);
                        expect(project.reject_list).to.be.an.instanceof(Array);
                        expect(project.reject_list).to.be.empty;
                        done();
                    }
                });
            }
        });
    });

    it('Call GET /api/projects/ - User three projects list will contain an invite from user one', function (done) {
        userThree.getProjects(200, function (err, res) {
            if (err) {
                return done(err);
            }
            expect(userTwo.isContentTypeJSON(res)).to.be.true;
            var result = res.body;
            expect(result).to.be.an.instanceof(Array);
            expect(result).not.to.be.empty;
            expect(result.length).to.equal(1);
            expect(result[0].name).to.equal(PROJECT_NAME);
            // User has an outstanding invite
            expect(result[0].invite_list.length).to.equal(1);
            expect(result[0].invite_list[0].email).to.equal(USER_THREE_EMAIL);
            expect(result[0].reject_list).to.be.empty;
            expect(result[0].user_list.length).to.equal(2);
            done();
        });
    });

    it('Call PUT /api/projects/:projectId/invite - User three rejects invite to project created by user one', function (done) {
        userThree.rejectInvite(204, projectId, function (err) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    it('Call GET /api/projects/ - User one projects list will now have an updated reject list', function (done) {
        userOne.getProjects(200, function (err, res) {
            if (err) {
                return done(err);
            }
            expect(userTwo.isContentTypeJSON(res)).to.be.true;
            var result = res.body;
            expect(result).to.be.an.instanceof(Array);
            expect(result).not.to.be.empty;
            expect(result.length).to.equal(1);
            expect(result[0].name).to.equal(PROJECT_NAME);
            expect(result[0].invite_list.length).to.equal(0);
            expect(result[0].reject_list.length).to.equal(1);
            expect(result[0].user_list.length).to.equal(2);
            done();
        });
    });

});

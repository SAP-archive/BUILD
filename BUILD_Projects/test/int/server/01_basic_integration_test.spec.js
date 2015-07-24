'use strict';

var expect = require('norman-testing-tp').chai.expect;

var ProjectAPI = require('../api/ProjectsRestApi');
var api = new ProjectAPI();

var projectId;
var PROJECT_NAME = 'Test Basic';

describe('Basic REST API Test', function () {
    this.timeout(15000);

    before('Initialize API', function (done) {
        api.initialize('contact.build@sap.com', 'Minipas!1', true).then(done);
    });

    after(function (done) {
        // Only required for one user to do this task!
        api.resetDB(done);
    });

    it('Call POST /api/projects - Create project', function (done) {
        api.createProject(201, {name: PROJECT_NAME}, function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(api.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result).not.to.be.empty;
                expect(result.name).to.equal(PROJECT_NAME);
                expect(result.deleted).to.equal(false);
                expect(result.user_list).to.be.an.instanceof(Array);
                expect(result.user_list.length).to.equal(1);
                expect(result.user_list[0].email).to.equal('contact.build@sap.com');
                expect(result.user_list[0].name).to.equal('contact.build@sap.com');
                expect(result.invite_list).to.be.an.instanceof(Array);
                expect(result.invite_list).to.be.empty;
                expect(result.reject_list).to.be.an.instanceof(Array);
                expect(result.reject_list).to.be.empty;

                // Set projectId, used in subsequent test cases
                projectId = result._id;
                expect(projectId).not.to.eql(null);
                expect(projectId).not.to.be.empty;
                done();
            }
        });
    });

    it('Call GET /api/projects/:projectId - Get New Project', function (done) {
        api.getProject(200, projectId, function (err, res) {
            if (err) {
                return done(err);
            }
            expect(api.isContentTypeJSON(res)).to.be.true;
            var result = res.body;
            expect(result).not.to.be.empty;
            expect(result.name).to.equal(PROJECT_NAME);
            expect(result.invite_list).to.be.empty;
            expect(result.reject_list).to.be.empty;
            expect(result.user_list).not.to.be.empty;
            done();
        });
    });

    it('Call GET /api/projects/ - Get Projects belonging to user', function (done) {
        api.getProjects(200, function (err, res) {
            if (err) {
                return done(err);
            }
            expect(api.isContentTypeJSON(res)).to.be.true;
            var result = res.body;
            expect(result).to.be.an.instanceof(Array);
            expect(result).not.to.be.empty;
            expect(result.length).to.equal(1);
            expect(result[0].name).to.equal(PROJECT_NAME);
            expect(result[0].invite_list).to.be.empty;
            expect(result[0].reject_list).to.be.empty;
            expect(result[0].user_list).not.to.be.empty;
            expect(result[0].user_list[0].email).to.equal('contact.build@sap.com');
            expect(result[0].user_list[0].name).to.equal('contact.build@sap.com');
            done();
        });
    });

    it('Call POST /api/projects - Create duplicate project, this is allowed', function (done) {
        api.createProject(201, {name: PROJECT_NAME}, function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(api.isContentTypeJSON(res)).to.be.true;
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
                done();
            }
        });
    });

    it('Call GET /api/projects/ - Get All Projects, count should have incremented', function (done) {
        api.getProjects(200, function (err, res) {
            if (err) {
                return done(err);
            }
            expect(api.isContentTypeJSON(res)).to.be.true;
            var result = res.body;
            expect(result).to.be.an.instanceof(Array);
            expect(result).not.to.be.empty;
            // User now has two projects assigned to them
            expect(result.length).to.equal(2);
            done();
        });
    });

    it('Call PUT /api/projects/ - Update existing project', function (done) {
        var TMP_PROJECT_NAME = 'Update Test Project';
        api.updateProject(200, projectId, {name: TMP_PROJECT_NAME}, function (err, res) {
            if (err) {
                return done(err);
            }
            expect(api.isContentTypeJSON(res)).to.be.true;
            var result = res.body;
            expect(result).not.to.be.empty;
            expect(result.name).to.equal(TMP_PROJECT_NAME);
            expect(result.deleted).to.equal(false);
            expect(result.archived).to.equal(false);
            expect(result.user_list).to.be.an.instanceof(Array);
            expect(result.user_list.length).to.equal(1);
            expect(result.invite_list).to.be.an.instanceof(Array);
            expect(result.invite_list).to.be.empty;
            expect(result.reject_list).to.be.an.instanceof(Array);
            expect(result.reject_list).to.be.empty;
            done();
        });
    });

    it('Call GET /api/projects/:projectId/team - should return a team list for a project', function (done) {
        api.getTeam(200, projectId, function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(api.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result.reject_list).to.be.an.instanceof(Array);
                expect(result.reject_list).to.be.empty;
                expect(result.invite_list).to.be.an.instanceof(Array);
                expect(result.invite_list).to.be.empty;
                expect(result.user_list).to.be.an.instanceof(Array);
                expect(result.user_list).not.to.be.empty;
                expect(result.user_list[0].email).to.equal('contact.build@sap.com');
                expect(result.user_list[0].name).to.equal('contact.build@sap.com');
                done();
            }
        });
    });

    it('Call PUT /api/projects/ - Archive project', function (done) {
        api.updateProject(200, projectId, {archived: true}, function (err, res) {
            if (err) {
                return done(err);
            }
            expect(api.isContentTypeJSON(res)).to.be.true;
            var result = res.body;
            expect(result).not.to.be.empty;
            expect(result.deleted).to.equal(false);
            expect(result.archived).to.equal(true);
            expect(result.user_list).to.be.an.instanceof(Array);
            expect(result.user_list.length).to.equal(1);
            expect(result.invite_list).to.be.an.instanceof(Array);
            expect(result.invite_list).to.be.empty;
            expect(result.reject_list).to.be.an.instanceof(Array);
            expect(result.reject_list).to.be.empty;
            done();
        });
    });

    it('Call GET /api/projects/ - Get ALL archived projects', function (done) {
        api.getArchivedProjects(200, true, function (err, res) {
            if (err) {
                return done(err);
            }
            expect(api.isContentTypeJSON(res)).to.be.true;
            var result = res.body;
            expect(result).to.be.an.instanceof(Array);
            expect(result).not.to.be.empty;
            expect(result.length).to.equal(1);
            expect(result[0].archived).to.equal(true);
            done();
        });
    });

    it('Call GET /api/projects/ - Get ALL non-archived projects', function (done) {
        api.getArchivedProjects(200, false, function (err, res) {
            if (err) {
                return done(err);
            }
            expect(api.isContentTypeJSON(res)).to.be.true;
            var result = res.body;
            expect(result).to.be.an.instanceof(Array);
            expect(result).not.to.be.empty;
            expect(result.length).to.equal(1);
            expect(result[0].archived).to.equal(false);
            done();
        });
    });

    it('Call GET /api/projects/ - Get All Projects, no showArchived flag has been set', function (done) {
        api.getProjects(200, function (err, res) {
            if (err) {
                return done(err);
            }
            expect(api.isContentTypeJSON(res)).to.be.true;
            var result = res.body;
            expect(result).to.be.an.instanceof(Array);
            expect(result).not.to.be.empty;
            // User now has two projects assigned to them
            expect(result.length).to.equal(2);
            done();
        });
    });

    it('Call DELETE /api/projects/ - Delete existing project', function (done) {
        api.deleteProject(204, projectId, function (err) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    it('Call GET /api/projects/ - Get ALL Projects belonging to user', function (done) {
        api.getProjects(200, function (err, res) {
            if (err) {
                return done(err);
            }
            expect(api.isContentTypeJSON(res)).to.be.true;
            var result = res.body;
            expect(result).to.be.an.instanceof(Array);
            expect(result).not.to.be.empty;
            // Should only display one as the previous was removed
            expect(result.length).to.equal(1);
            done();
        });
    });

    it('Call POST /api/projects/ - should not be able to create a project if missing field: name', function (done) {
        api.createProject(400, {wrong_field: PROJECT_NAME}, function (err, res) {
            if (err) {
                return done(err);
            }
            expect(api.isContentTypeJSON(res)).to.be.true;
            var result = res.body;
            expect(result).not.to.be.empty;
            done();
        });
    });

    it('Call DELETE /api/projects/:projectId/ - should not be able to delete a project that does not exist', function (done) {
        api.deleteProject(404, projectId, function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(api.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result).to.be.empty;
                done();
            }
        });
    });

});

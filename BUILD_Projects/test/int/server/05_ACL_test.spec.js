'use strict';

var path = require('path');
var expect = require('norman-testing-tp').chai.expect;

var ProjectAPI = require('../api/ProjectsRestApi');
var userOne = new ProjectAPI();
var userTwo = new ProjectAPI();

var projectId;
var assetId;
var USER_ONE_EMAIL = 'projects.module@sap.com';
var USER_TWO_EMAIL = 'projects.module.user2@sap.com';
var PROJECT_NAME = 'Test ACL';

describe('ACL REST userOne Test', function () {
    this.timeout(15000);

    before('Initialize User One', function (done) {
        userOne.initialize(USER_ONE_EMAIL, 'Minisap!1', true).then(done);
    });

    before('Initialize User Two', function (done) {
        userTwo.initialize(USER_TWO_EMAIL, 'Minisap!1').then(done);
    });

    after(function (done) {
        // Only required for one user to do this task!
        userOne.resetDB(done);
    });

    it('Call POST /api/projects - Create a project belonging to user one', function (done) {
        userOne.createProject(201, {name: PROJECT_NAME}, function (err, res) {
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

    it('Call POST /api/projects/:projectId/asset - Attach an new asset to the new project', function (done) {
        userOne.uploadAsset(201, projectId, path.resolve(__dirname, 'Large.png'), function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(userOne.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result).not.to.be.empty;
                expect(result).to.be.an.instanceof(Array);
                expect(result[0].metadata.isThumb).to.eq(false);
                expect(result[0].metadata.hasThumb).to.eq(false);
                expect(result[0].metadata.version).to.eq(1);
                assetId = result[0]._id;
                expect(assetId).not.to.eql(null);
                expect(assetId).not.to.be.empty;
                done();
            }
        });
    });

    it('Negative - Call PUT /api/projects/ - should be prevented for user two', function (done) {
        var TMP_PROJECT_NAME = 'Update Test Project';
        userTwo.updateProject(403, projectId, {name: TMP_PROJECT_NAME}, function (err) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    it('Negative - Call POST /api/projects/:projectId/asset - should be prevented for user two', function (done) {
        userTwo.uploadAsset(403, projectId, path.resolve(__dirname, 'Large.png'), function (err) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    it('Negative - Call GET /api/projects/:projectId/document/:assetId - should be prevented for user two', function (done) {
        userTwo.renderAssetByVersion(403, projectId, 1, 1, function (err) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    it('Negative - Call GET /api/projects/:projectId - should be prevented for user two', function (done) {
        userTwo.getProject(403, projectId, function (err) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    it('Negative - Call GET /api/projects/:projectId - should be prevented for user two', function (done) {
        userTwo.getArchivedProject(403, projectId, function (err) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    it('Negative - Call GET /api/projects/:projectId/document/:assetId/render - should be prevented for user two', function (done) {
        userTwo.renderAsset(403, projectId, assetId, null, function (err) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    it('Negative - Call POST /api/projects/:projectId/invite - should be prevented for user two', function (done) {
        userTwo.createInvite(403, projectId, {'email_list': [{'email': USER_TWO_EMAIL}]}, function (err) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    it('Negative - Call POST /api/projects/:projectId/invite - should be prevented for user two', function (done) {
        userTwo.getTeam(403, projectId, function (err) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    it('Negative - Call GET /api/projects/:projectId/document/ - should be prevented for user two', function (done) {
        userTwo.getAssets(403, projectId, function (err) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    it('Negative - Call GET /api/projects/:projectId/document/:assetId - should be prevented for user two', function (done) {
        userTwo.getAsset(403, projectId, assetId, function (err) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    it('Negative - Call PUT /api/projects/:projectId - should be prevented for user two', function (done) {
        var tmpProjectName = 'Update Test Project';
        userTwo.updateProject(403, projectId, {name: tmpProjectName}, function (err) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    it('Negative - Call DELETE /api/projects/:projectId - should be prevented for user two', function (done) {
        userTwo.deleteProject(403, projectId, function (err) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    it('Negative - Call DELETE /api/projects/:projectId/asset - should be prevented for user two', function (done) {
        userTwo.deleteAsset(403, projectId, assetId, function (err) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    it('Negative - Call GET /api/projects/:projectId/history - should be prevented for user two', function (done) {
        userTwo.getHistory(403, projectId, function (err) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    it('Negative - POST /api/projects/:projectId/history - should be prevented for user two', function (done) {
        userTwo.createHistory(403, projectId, {}, function (err) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

});

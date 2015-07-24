'use strict';

var expect = require('norman-testing-tp').chai.expect;
var path = require('path');
var jszip = require("jszip");

var API = require('../api/SharedWorkspaceRestApi');
var apiUser1 = new API();
var apiUser2 = new API();
var api = new API();

var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var logger = commonServer.logging.createLogger("01_basic_integration_test.spec");
var projectId, user1Id, user2Id, userId;
var PROJECT_NAME = 'Test Basic';


describe('Basic REST API Test', function () {

    describe('Create and lock own project (User1)', function () {
       this.timeout(30000);

        before('Initialize API', function (done) {
            apiUser1.initialize('sw1.module@test.com', 'Minitest!1').then(done);
        });

        // Need the userId to validate certains fields are populated correctly
        it('Call GET /api/users/me - Get user 1 details', function (done) {
            apiUser1.getUserDetails(200, function (err, res) {
                if (err) {
                    return done(err);
                }
                expect(apiUser1.isContentTypeJSON(res)).to.equal(true);
                var result = res.body;
                //logger.info(res.body);
                expect(result).not.to.be.empty;
                expect(result._id).not.to.be.empty;
                user1Id = result._id;
                done();
            });
        });

        it('Call POST /api/projects - Create project', function (done) {
            apiUser1.createProject(201, {name: PROJECT_NAME}, function (err, res) {
                if (err) {
                    done(err);
                } else {
                    expect(apiUser1.isContentTypeJSON(res)).to.equal(true);
                    var result = res.body;
                    //logger.info(res.body);
                    expect(result).not.to.be.empty;
                    expect(result.name).to.equal(PROJECT_NAME);
                    expect(result.deleted).to.equal(false);
                    expect(result.user_list).to.be.an.instanceof(Array);
                    expect(result.user_list.length).to.equal(1);
                    expect(result.user_list[0]._id).to.equal(user1Id);
                    expect(result.invite_list).to.be.an.instanceof(Array);
                    expect(result.invite_list).to.be.empty;
                    expect(result.reject_list).to.be.an.instanceof(Array);
                    expect(result.reject_list).to.be.empty;
                    // Set projetId, used in subsequent test cases
                    projectId = result._id;
                    expect(projectId).not.to.eql(null);
                    expect(projectId).not.to.be.empty;
                    done();
                }
            });
        });

        it('Call GET /api/projects/:projectId - Get New Project', function (done) {
            apiUser1.getProject(200, projectId, function (err, res) {
                if (err) {
                    return done(err);
                };
                expect(apiUser1.isContentTypeJSON(res)).to.equal(true);
                var result = res.body;
                expect(result).not.to.be.empty;
                expect(result.name).to.equal(PROJECT_NAME);
                expect(result.invite_list).to.be.empty;
                expect(result.reject_list).to.be.empty;
                expect(result.user_list).not.to.be.empty;
                done();
            });
        });

        it('Call GET /api/projects/:projectId/prototype/lock - Get Project Prototype unlocked status', function (done) {
            apiUser1.getPrototypeLock(200, projectId, function (err, res) {
                if (err) {
                    return done(err);
                };
                expect(apiUser1.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                //logger.info(res.body);
                expect(result.exists).to.be.false;
                expect(result.userId).to.be.undefined;
                done();
            });
        });

        it('Call POST /api/projects/:projectId/prototype/lock - Create Lock for User1 for current project', function (done) {
            apiUser1.createPrototypeLock(200, projectId, function (err, res) {
                if (err) {
                    return done(err);
                };
                expect(apiUser1.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                //logger.info(res.body);
                expect(result.success).to.be.true;
                expect(result.userId).to.be.undefined;
                done();
            });
        });

        it('Call GET /api/projects/:projectId/prototype/lock - Get Project Prototype locked status', function (done) {
            apiUser1.getPrototypeLock(200, projectId, function (err, res) {
                if (err) {
                    return done(err);
                };
                expect(apiUser1.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                //logger.info(res.body);
                expect(result.exists).to.be.true;
                expect(result.userId).to.be.equal(user1Id);
                done();
            });
        });
    });

    describe('Check if access forbiden for non-shared project', function () {
        this.timeout(20000);

        before('Initialize API', function (done) {
            apiUser2.initialize('sw2.module@test.com', 'Minitest!1').then(done);
        });

        it('Call GET /api/users/me - Get user 2 details', function (done) {
            apiUser2.getUserDetails(200, function (err, res) {
                if (err) {
                    return done(err);
                }
                expect(apiUser2.isContentTypeJSON(res)).to.equal(true);
                var result = res.body;
                //logger.info(res.body);
                expect(result).not.to.be.empty;
                expect(result._id).not.to.be.empty;
                user2Id = result._id;
                done();
            });
        });

        it('Call GET /api/projects/:projectId/prototype/lock - Check Project Prototype locked by User1 status', function (done) {
            apiUser2.getPrototypeLock(403, projectId, function (err, res) {
                if (err) {
                    return done(err);
                };
                expect(apiUser2.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                //logger.info(res.body);
                done();
            });
        });

        it('Call POST /api/projects/:projectId/prototype/lock - Try Create Lock by User2 for current project (success=false)', function (done) {
            apiUser2.createPrototypeLock(403, projectId, function (err, res) {
                if (err) {
                    return done(err);
                };
                expect(apiUser2.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                //logger.info(res.body);
                done();
            });
        });

        it('Call DELETE /api/projects/:projectId/prototype/lock - Try Unlock by User2 for current project (success=false)', function (done) {
            apiUser2.deletePrototypeLock(403, projectId, function (err, res) {
                if (err) {
                    return done(err);
                };
                expect(apiUser2.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                //logger.info(res.body);
                done();
            });
        });

        it('Call GET /api/projects/:projectId/prototype/lock - Check Project Prototype is still locked by User1 status', function (done) {
            apiUser2.getPrototypeLock(403, projectId, function (err, res) {
                if (err) {
                    return done(err);
                };
                expect(apiUser2.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                //logger.info(res.body);
                done();
            });
        });
    });

    describe('Share project created by User1 with User2', function () {
        this.timeout(20000);

/*        before('Initialize API', function (done) {
            apiUser1.initialize('sw1.module@test.com', 'Minitest!1').then(done);
        });*/

        it('Call POST /api/projects/:projectId/invite - Share project with User 2', function (done) {
            apiUser1.createInvite(201, projectId, {email_list: [{email: "sw2.module@test.com"}]}, function (err, res) {
                if (err) {
                    return done(err);
                };
                expect(apiUser1.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                //logger.info(res.body);
                expect(result).not.to.be.empty;
                expect(result.newInvitee[0].email).to.equal('sw2.module@test.com');
                done();
            });
        });
    });

    describe('Check if shared project locked by owner', function () {
        this.timeout(20000);

/*        before('Initialize API', function (done) {
            apiUser2.initialize('sw2.module@test.com', 'Minitest!1').then(done);
        });*/

        it('Call PUT /api/projects/:projectId/invite - User 2 accepts invite to project created by user 1', function (done) {
            apiUser2.acceptInvite(200, projectId, function (err, res) {
                if (err) {
                    return done(err);
                }
                expect(apiUser2.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result).not.to.be.empty;
                expect(result.invite_list.length).to.equal(0);
                expect(result.reject_list).to.be.empty;
                expect(result.user_list.length).to.equal(2);
                done();
            });
        });

        it('Call GET /api/projects/:projectId/prototype/lock - Check Project Prototype locked by User1 status', function (done) {
            apiUser2.getPrototypeLock(200, projectId, function (err, res) {
                if (err) {
                    return done(err);
                };
                expect(apiUser2.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                //logger.info(res.body);
                expect(result.exists).to.be.true;
                expect(result.userId).to.be.equal(user1Id);
                done();
            });
        });

        it('Call POST /api/projects/:projectId/prototype/lock - Try Create Lock by User2 for current project (success=false)', function (done) {
            apiUser2.createPrototypeLock(200, projectId, function (err, res) {
                if (err) {
                    return done(err);
                };
                expect(apiUser2.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                //logger.info(res.body);
                expect(result.success).to.be.false;
                expect(result.userId).to.be.equal(user1Id);
                done();
            });
        });

        it('Call DELETE /api/projects/:projectId/prototype/lock - Try Unlock by User2 for current project (success=false)', function (done) {
            apiUser2.deletePrototypeLock(200, projectId, function (err, res) {
                if (err) {
                    return done(err);
                };
                expect(apiUser2.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                //logger.info(res.body);
                expect(result.success).to.be.false;
                expect(result.userId).to.be.equal(user1Id);
                done();
            });
        });

        it('Call GET /api/projects/:projectId/prototype/lock - Check Project Prototype is still locked by User1 status', function (done) {
            apiUser2.getPrototypeLock(200, projectId, function (err, res) {
                if (err) {
                    return done(err);
                };
                expect(apiUser1.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                //logger.info(res.body);
                expect(result.exists).to.be.true;
                expect(result.userId).to.be.equal(user1Id);
                done();
            });
        });
    });

    describe('Unlock own project User1', function () {
        this.timeout(20000);

/*        before('Initialize API', function (done) {
            apiUser1.initialize('sw1.module@test.com', 'Minitest!1').then(done);
        });*/

        it('Call GET /api/projects/:projectId/prototype/lock - Check Project is still locked by User1 status', function (done) {
            apiUser1.getPrototypeLock(200, projectId, function (err, res) {
                if (err) {
                    return done(err);
                };
                expect(apiUser1.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                //logger.info(res.body);
                expect(result.exists).to.be.true;
                expect(result.userId).to.be.equal(user1Id);
                done();
            });
        });

        it('Call DELETE /api/projects/:projectId/prototype/lock - Unlock own project (success=false)', function (done) {
            apiUser1.deletePrototypeLock(200, projectId, function (err, res) {
                if (err) {
                    return done(err);
                };
                expect(apiUser1.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                //logger.info(res.body);
                expect(result.success).to.be.true;
                expect(result.userId).to.be.undefined;
                done();
            });
        });

        it('Call GET /api/projects/:projectId/prototype/lock - Check Project is unlocked', function (done) {
            apiUser1.getPrototypeLock(200, projectId, function (err, res) {
                if (err) {
                    return done(err);
                };
                expect(apiUser1.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                //logger.info(res.body);
                expect(result.exists).to.be.false;
                expect(result.userId).to.be.undefined;
                done();
            });
        });

        it('Call DELETE /api/projects/:projectId/prototype/lock - Try Unlock again (success=true)', function (done) {
            apiUser1.deletePrototypeLock(200, projectId, function (err, res) {
                if (err) {
                    return done(err);
                };
                expect(apiUser1.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                //logger.info(res.body);
                expect(result.success).to.be.true;
                expect(result.userId).to.be.undefined;
                done();
            });
        });
    });

    describe('Lock other user project', function () {
        this.timeout(20000);

/*        before('Initialize API', function (done) {
            apiUser2.initialize('sw2.module@test.com', 'Minitest!1').then(done);
        });*/

        it('Call GET /api/projects/:projectId/prototype/lock - Check Project unlocked', function (done) {
            apiUser2.getPrototypeLock(200, projectId, function (err, res) {
                if (err) {
                    return done(err);
                };
                expect(apiUser2.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                //logger.info(res.body);
                expect(result.exists).to.be.false;
                expect(result.userId).to.be.undefined;
                done();
            });
        });

        it('Call POST /api/projects/:projectId/prototype/lock - Create Lock by User2 for current project (success=true)', function (done) {
            apiUser2.createPrototypeLock(200, projectId, function (err, res) {
                if (err) {
                    return done(err);
                };
                expect(apiUser2.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                //logger.info(res.body);
                expect(result.success).to.be.true;
                expect(result.userId).to.be.undefined;
                done();
            });
        });

        it('Call GET /api/projects/:projectId/prototype/lock - Check Project Prototype is locked by User1 status', function (done) {
            apiUser2.getPrototypeLock(200, projectId, function (err, res) {
                if (err) {
                    return done(err);
                };
                expect(apiUser2.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                //logger.info(res.body);
                expect(result.exists).to.be.true;
                expect(result.userId).to.be.equal(user2Id);
                done();
            });
        });
    });

    describe('Check if shared project locked by another', function () {
        this.timeout(20000);

/*        before('Initialize API', function (done) {
            apiUser2.initialize('sw1.module@test.com', 'Minitest!1').then(done);
        });*/

        it('Call GET /api/projects/:projectId/prototype/lock - Check Project Prototype locked by User 2 status', function (done) {
            apiUser1.getPrototypeLock(200, projectId, function (err, res) {
                if (err) {
                    return done(err);
                };
                expect(apiUser1.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                //logger.info(res.body);
                expect(result.exists).to.be.true;
                expect(result.userId).to.be.equal(user2Id);
                done();
            });
        });

        it('Call POST /api/projects/:projectId/prototype/lock - Try Create Lock by User1 for current project (success=false)', function (done) {
            apiUser1.createPrototypeLock(200, projectId, function (err, res) {
                if (err) {
                    return done(err);
                };
                expect(apiUser1.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                //logger.info(res.body);
                expect(result.success).to.be.false;
                expect(result.userId).to.be.equal(user2Id);
                done();
            });
        });

        it('Call DELETE /api/projects/:projectId/prototype/lock - Try Unlock by User1 for current project (success=false)', function (done) {
            apiUser1.deletePrototypeLock(200, projectId, function (err, res) {
                if (err) {
                    return done(err);
                };
                expect(apiUser1.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                //logger.info(res.body);
                expect(result.success).to.be.false;
                expect(result.userId).to.be.equal(user2Id);
                done();
            });
        });

        it('Call GET /api/projects/:projectId/prototype/lock - Check Project Prototype is still locked by User2 status', function (done) {
            apiUser2.getPrototypeLock(200, projectId, function (err, res) {
                if (err) {
                    return done(err);
                };
                expect(apiUser2.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                //logger.info(res.body);
                expect(result.exists).to.be.true;
                expect(result.userId).to.be.equal(user2Id);
                done();
            });
        });
    });

    //Move these test to Shared Workspace
    describe('Check if snapshot can be created and shared as archive', function () {
        this.timeout(20000);

        before('Initialize API', function (done) {
            api.initialize('sw3.module@test.com', 'Minitest!1').then(done);
        });
        // Need the userId to validate certains fields are populated correctly
        it('Call GET /api/users/me - Get user details', function (done) {
            api.getUserDetails(200, function (err, res) {
                if (err) {
                    return done(err);
                }
                expect(api.isContentTypeJSON(res)).to.equal(true);
                var result = res.body;
                //logger.info(res.body);
                expect(result).not.to.be.empty;
                expect(result._id).not.to.be.empty;
                userId = result._id;
                done();
            });
        });

        it('Call POST /api/projects - Create project', function (done) {
            api.createProject(201, {name: PROJECT_NAME}, function (err, res) {
                if (err) {
                    done(err);
                } else {
                    expect(api.isContentTypeJSON(res)).to.equal(true);
                    var result = res.body;
                    //logger.info(res.body);
                    expect(result).not.to.be.empty;
                    expect(result.name).to.equal(PROJECT_NAME);
                    expect(result.deleted).to.equal(false);
                    expect(result.user_list).to.be.an.instanceof(Array);
                    expect(result.user_list.length).to.equal(1);
                    expect(result.user_list[0]._id).to.equal(userId);
                    expect(result.invite_list).to.be.an.instanceof(Array);
                    expect(result.invite_list).to.be.empty;
                    expect(result.reject_list).to.be.an.instanceof(Array);
                    expect(result.reject_list).to.be.empty;
                    // Set projetId, used in subsequent test cases
                    projectId = result._id;
                    expect(projectId).not.to.eql(null);
                    expect(projectId).not.to.be.empty;
                    done();
                }
            });
        });

        it('Call POST /api/projects/:projectId/prototype/lock - Create Lock for User1 for current project', function (done) {
            api.createPrototypeLock(200, projectId, function (err, res) {
                if (err) {
                    return done(err);
                };
                expect(apiUser1.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                //logger.info(res.body);
                expect(result.success).to.be.true;
                expect(result.userId).to.be.undefined;
                done();
            });
        });

        it('Call POST /api/projects/:projectId/prototype/page - create Page 1 (S0)', function (done) {
            var model = {floorplans: 1};
            api.createPage(200, projectId, model, function (err, res) {
                if (err) {
                    return done(err);
                };
                expect(api.isContentTypeJSON(res)).to.equal(true);
                var result = res.body;
                //logger.info(res.body);
                expect(result).not.to.be.empty;
                expect(result.pages.length).to.equal(1);
                done();
            });
        });

        it('Call POST /api/projects/:projectId/prototype/snapshot - create Snapshot', function (done) {
            var model = {"snapshotDesc": ""};
            api.createSnapshot(200, projectId, model, function (err, res) {
                if (err) {
                    return done(err);
                }
                ;
                expect(api.isContentTypeJSON(res)).to.equal(true);
                var result = res.body;
                //logger.info(res.body);
                expect(result).not.to.be.empty;
                expect(result.snapshotVersion).to.equal(1);
                done();
            });
        });

        it('Call GET /api/projects/:projectId/prototype/snapshot?version=1 - get snapshot version=1', function (done) {
            api.getSnapshot(200, projectId, '1', function (err, res) {
                if (err) {
                    return done(err);
                }
                ;
                expect(api.isContentTypeJSON(res)).to.be.equal(true);
                var result = res.body;
                //logger.info(res.body);
                expect(result).not.to.be.empty;
                done();
            });
        });

        /* TODO: check if it is valid use case
        it('Call GET /api/projects/:projectId/prototype/snapshot?version=latest - get snapshot version=latest', function (done) {
            api.getSnapshot(200, projectId, 'latest', function (err, res) {
                if (err) {
                    return done(err);
                }
                ;
                expect(api.isContentTypeJSON(res)).to.be.equal(true);
                var result = res.body;
                //logger.info(res.body);
                expect(result).not.to.be.empty;
                done();
            });
        });
        */

        it('Call GET /api/projects/:projectId/prototype/snapshot - get latest snapshot if version is not specified', function (done) {
            api.getSnapshot(200, projectId, '', function (err, res) {
                if (err) {
                    return done(err);
                }
                ;
                expect(api.isContentTypeJSON(res)).to.be.equal(true);
                var result = res.body;
                //logger.info(res.body);
                expect(result).not.to.be.empty;
                done();
            });
        });

        it('Call GET /api/projects/:projectId/prototype/zipsnapshot?version=1 - get zipped snapshot version=1', function (done) {
            api.getZippedSnapshot(200, projectId, '1', function (err, res) {
                if (err) {
                    return done(err);
                }
                ;
                //logger.info(res.headers);
                expect(api.isContentTypeStreamZIP(res)).to.be.equal(true);
                expect(res.headers['content-disposition'].indexOf("filename=snapshot_" + projectId + ".zip")).not.to.equal(0);
                var result = res.body;
                //logger.info(res.body);
                expect(result).not.to.be.empty;
                done();
            });
        });

        /* TDOD: check if it is correct use case
        it('Call GET /api/projects/:projectId/prototype/zipsnapshot?version=latest - get zipped snapshot version=latest', function (done) {
            api.getZippedSnapshot(200, projectId, 'latest', function (err, res) {
                if (err) {
                    return done(err);
                }
                ;
                //logger.info(res.headers);
                expect(api.isContentTypeStreamZIP(res)).to.be.equal(true);
                expect(res.headers['content-disposition'].indexOf("filename=snapshot_" + projectId + ".zip")).not.to.equal(0);
                var result = res.body;
                //logger.info(res.body);
                expect(result).not.to.be.empty;
                done();
            });
        });
        */


        it('Import material/Product.xlsx data', function (done) {
            api.importModel(201, projectId, path.resolve(__dirname, 'material/Product.xlsx'), function (err, res) {
                if (err) {
                    done(err);
                } else {
                    var model = res.body.result;
                    //logger.info(res.body);
                    expect(model.projectId).to.be.equal(projectId);
                    done();
                }
            });
        });

        // TODO: Fix it
        it('Call POST /api/projects/:projectId/prototype - Create data driven prototype', function (done) {
            api.createPrototype(200, projectId, {applicationType: 'Read'}, function (err, res) {
                if (err) {
                    done(err);
                } else {

                    expect(api.isContentTypeJSON(res)).to.equal(true);
                    var result = res.body;
                    //logger.info(res.body);
                    expect(result).not.to.be.empty;
                    expect(result.navigations.length).to.equal(3);
                    expect(result.pages.length).to.equal(4);
                    expect(result.uiLang).to.equal("UI5");
                    expect(result.appType).to.equal("masterDetail");
                    // expect(result.artifacts.length).to.equal(3);
                    done();
                }
            });
        });


        it('Call GET /api/projects/:projectId/prototype/zipsnapshot - get zipped latest snapshot', function (done) {
            api.getZippedSnapshot(200, projectId, '', function (err, res) {
                if (err) {
                    return done(err);
                };
                //logger.info(res.headers);
                expect(api.isContentTypeStreamZIP(res)).to.be.equal(true);
                expect(res.headers['content-disposition'].indexOf("filename=snapshot_"+projectId+".zip")).not.to.equal(0);
                var result = res.body;
                //logger.info(res.body);
                expect(result).not.to.be.empty;
                done();
            });
        });

        it('Call GET /deploy/public/:projectId/1/index.html - get redirect to deployed snapshot version 1 index.html', function (done) {
            api.getDeploy(302, projectId, '1', 'index.html', function (err, res) {
                if (err) {
                    return done(err);
                };
                logger.info(res.text);
                //var result = res.body;
                //logger.info(res.body);
                expect(res.text).not.to.be.empty;
                done();
            });
        });

        it('Call GET /deploy/public/:projectId/latest/index.html - get redirect to deployed snapshot latest version index.html', function (done) {
            api.getDeploy(302, projectId, '1', 'index.html', function (err, res) {
                if (err) {
                    return done(err);
                };
                logger.info(res.text);
                //var result = res.body;
                //logger.info(res.body);
                expect(res.text).not.to.be.empty;
                done();

            });
        });

        it('Call GET /api/projects/:projectId/prototype/1/index.html - get deployed snapshot version 1 index.html', function (done) {
            api.getDeploy(302, projectId, '1', 'index.html', function (err, res) {
                if (err) {
                    return done(err);
                };
                //logger.info(res.text);
                //var result = res.body;
                //logger.info(res.body);
                expect(res.text).not.to.be.empty;
                done();
            });
        });

        it('Call GET /api/projects/:projectId/prototype/latest/index.html - get deployed snapshot latest version index.html', function (done) {
            api.getSnapshotArtifact(200, projectId, '1', 'index.html', function (err, res) {
                if (err) {
                    return done(err);
                };
                //logger.info(res.text);
                //var result = res.body;
                //logger.info(res.body);
                expect(res.text).not.to.be.empty;
                done();

            });
        });

        it('Call GET /api/projects/:projectId/prototype/zipsnapshot?version=1 - get zipped snapshot 1 (parse zip)', function (done) {
            api.getZippedSnapshot(200, projectId, '1', function (err, res) {
                if (err) {
                    return done(err);
                };

                logger.info(res.headers);
                expect(api.isContentTypeStreamZIP(res)).to.be.equal(true);
                expect(res.headers['content-disposition'].indexOf("filename=snapshot_"+projectId+".zip")).not.to.equal(0);

                var zip = res.body;
                expect(zip).not.to.be.empty;

                // Unzip and verify content
                var zipper = new jszip();
                // more files !
                zipper.load(zip);

                var expected_fileslist = [
                    "Component.js",
                    "Component-preload.js",
                    "index.html",
                    "models/formulaCalculation.js",
                    "models/metadata.xml",
                    "resources/thumbnail/S0.png",
                    "view/S0.controller.js",
                    "view/S0.view.xml"
                ];

                expect(zipper.files).to.have.all.keys(expected_fileslist);
                done();
            });
        });
    });

});

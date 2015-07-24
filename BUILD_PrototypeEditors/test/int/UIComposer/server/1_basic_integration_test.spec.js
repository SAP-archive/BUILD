'use strict';

var expect = require('norman-testing-tp').chai.expect;
var path = require('path');

var API = require('../api/UIComposerRestApi');
var api = new API();

var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var logger = commonServer.logging.createLogger("01_basic_integration_test.spec");
var projectId, userId, S0;
var PROJECT_NAME = 'Test Basic';


describe('Basic REST API Test', function () {
    this.timeout(2000000);

    before('Initialize API', function (done) {
        api.initialize('ui-composer.module@test.com', 'Minitest!1').then(done);
    });

    after(function (done) {
        // Only required for one user to do this task!
        // Disable clean/reset DB after test execution to allow run test on remote server
        //api.resetDB(done);
        done();
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

/*
    it('Call GET /sapui5/resources/sap/norman/library.js - Get custom norman ui5 library', function (done) {
        api.getUi5libs(200, 'resources/sap/norman/library.js', function (err, res) {
            if (err) {
                return done(err);
            }
            expect(api.isContentType(res, 'application/javascript')).to.equal(true);
            //logger.info(res.text);
            expect(res.text).not.to.be.empty;
            expect(res.text).to.have.string('sap.ui.getCore().initLibrary');
            done();
        });
    });

    it('Call GET resources/sap-ui-version.json - Get selected ui library (sapui5)', function (done) {
        api.getUi5libs(200, 'resources/sap-ui-version.json', function (err, res) {
            if (err) {
                return done(err);
            }
            expect(api.isContentType(res, 'application/json')).to.equal(true);
            //logger.info(res.text);
            expect(res.text).not.to.be.empty;
            expect(res.text).to.have.string('com.sap.openui5.dist:sdk:1.26.6:war');
            done();
        });
    });
*/

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

    it('Call POST /api/projects/:projectId/prototype/lock - Create Lock for current project (success=true)', function (done) {
        api.createPrototypeLock(200, projectId, function (err, res) {
            if (err) {
                return done(err);
            };
            expect(api.isContentTypeJSON(res)).to.be.true;
            var result = res.body;
            //logger.info(res.body);
            expect(result.success).to.be.true;
            expect(result.userId).to.be.undefined;
            done();
        });
    });

    it('Call GET /api/projects/:projectId - Get New Project', function (done) {
        api.getProject(200, projectId, function (err, res) {
            if (err) {
                return done(err);
            };
            expect(api.isContentTypeJSON(res)).to.equal(true);
            var result = res.body;
            expect(result).not.to.be.empty;
            expect(result.name).to.equal(PROJECT_NAME);
            expect(result.invite_list).to.be.empty;
            expect(result.reject_list).to.be.empty;
            expect(result.user_list).not.to.be.empty;
            done();
        });
    });


    it('Call GET /api/projects/:projectId/prototype - Get Project Prototype', function (done) {
       api.getPrototype(200, projectId, function (err, res) {
           if (err) {
               return done(err);
           };
           expect(api.isContentTypeJSON(res)).to.be.true;
           var result = res.body;
           logger.info(res.body);
           //expect(result).to.be.empty;
           //expect(result.pages).to.be.empty;
           done();
       });
    });

    /*
    it('Call GET /api/projects/:projectId/prototype/page?pageName=S1&controlId=Page&getName=getActions - get Page', function (done) {
         api.getPage(200, projectId, 'S1', 'Page', 'getActions', function (err, res) {
             if (err) {
                 return done(err);
             };
             expect(api.isContentTypeJSON(res)).to.equal(true);
             var result = res.body;
             //logger.info(res.body);
             expect(result).not.to.be.empty;
             done();
         });
    });
    */

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

    it('Call POST /api/projects/:projectId/prototype/page - create Page 2 (S1)', function (done) {
        var model = {floorplans: 1};
        api.createPage(200, projectId, model, function (err, res) {
            if (err) {
                return done(err);
            };
            expect(api.isContentTypeJSON(res)).to.equal(true);
            var result = res.body;
            //logger.info(res.body);
            expect(result).not.to.be.empty;
            expect(result.pages.length).to.equal(2);
            done();
        });
    });

    it('Call GET /api/projects/:projectId/prototype/page/?pageName=S0 - get page S0', function (done) {
        api.getPage(200, projectId, 'S0', '', '', function (err, res) {
            if (err) {
                return done(err);
            };
            expect(api.isContentTypeJSON(res)).to.equal(true);
            var result = res.body;
            S0 = result; // store S0 for update request
            // logger.info( result);
            expect(result).not.to.be.empty;
            //TODO: uncomment assert when fixed
            //expect(result.displayName).to.be.equal('Page 1');
            done();
        });
    });

    it('Call PUT /api/projects/:projectId/prototype/page - update Page 1 (S0) modify page name', function (done) {

        // Modify Page Display Name
        S0.displayName = 'Page 1 (Modified)';
        var model = { 'pages': JSON.stringify({'S0': S0}) };

        api.updatePage(200, projectId, model, function (err, res) {
            if (err) {
               return done(err);
            };
            expect(api.isContentTypeJSON(res)).to.be.equal(true);
            var result = res.body;
            expect(result).not.to.be.empty;
            // TODO: Add postProcess call to prototype Builder
            //expect(result.pages[0].displayName).to.be.equal('Page 1 (Modified)');
            done();
        });
    });

    it('Call PUT /api/projects/:projectId/prototype/page - update Page 1 (S0) add button', function (done) {

        // Modify Page by adding button

        var buttonControl = {
            "catalogControlName": "sap_m_Button",
            "catalogId": S0.controls[0].catalogId,
            "controlId": "np-sap_m_Button-1",
            "parentControlId": "sap_m_Page_0",
            "parentGroupId": "content",
            "parentGroupIndex": 0,
            "groups": [],
            "properties": [
                {
                    "name": "enabled",
                    "value": true,
                    "type": "boolean"
                },
                {
                    "name": "icon",
                    "value": null,
                    "type": "URI"
                },
                {
                    "name": "iconDensityAware",
                    "value": false,
                    "type": "boolean"
                },
                {
                    "name": "iconFirst",
                    "value": false,
                    "type": "boolean"
                },
                {
                    "name": "text",
                    "value": "Button",
                    "type": "string"
                },
                {
                    "name": "type",
                    "value": "Default",
                    "type": "sap_m_ButtonType"
                },
                {
                    "name": "width",
                    "value": "auto",
                    "type": "CSSSize"
                }
            ],
            "designProperties": [],
            "floorplanProperties": [
                {
                    "name": "left",
                    "value": "164.24246123342803px"
                },
                {
                    "name": "top",
                    "value": "237.1268994880445px"
                }
            ],
            "events": []
        };

        // remove db _id
        delete S0.controls[0]._id;
        // add button control name to content children
        S0.controls[0].groups[0].children=["np-sap_m_Button-1"];
        // add button control
        S0.controls.push(buttonControl);

        var model = { 'pages': JSON.stringify({'S0': S0}) };

        api.updatePage(200, projectId, model, function (err, res) {
            if (err) {
                return done(err);
            };
            expect(api.isContentTypeJSON(res)).to.be.equal(true);
            var result = res.body;
            expect(result).not.to.be.empty;
            // TODO: Add postProcess call to prototype Builder
            //expect(result.pages[0].displayName).to.be.equal('Page 1 (Modified)');
            done();
        });
    });

    it('Call GET /api/projects/:projectId/prototype/page/?pageName=S0 - get page S0', function (done) {
        api.getPage(200, projectId, 'S0', '', '', function (err, res) {
            if (err) {
                return done(err);
            };
            expect(api.isContentTypeJSON(res)).to.equal(true);
            var result = res.body;
            S0 = result; // store S0 for update request
            // logger.info( result);
            expect(result).not.to.be.empty;

            // TODO: Add postProcess call to prototype Builder then uncomment following
            //expect(result.displayName).to.be.equal('Page 1 (Modified)');

            done();
        });
    });

    it('Call DELETE /api/projects/:projectId/prototype/page - delete Page 2 (S1)', function (done) {
        api.deletePage(200, projectId, "S1", function (err, res) {
            if (err) {
                return done(err);
            };
            expect(api.isContentTypeJSON(res)).to.be.equal(true);
            var result = res.body;
            //logger.info(res.body);
            expect(result).not.to.be.empty;
            expect(result.pages.length).to.equal(1);
            done();
        });
    });

    it('Call GET /api/projects/:projectId/prototype/artifact/view/S0.view.xml - get artifact view/S0.view.xml', function (done) {
         api.getArtifact(200, projectId, 'view/S0.view.xml', function (err, res) {
             if (err) {
                 return done(err);
             };
             expect(api.isContentTypeXML(res)).to.equal(true);
             var result = res.text;
             //logger.info(res.text);
             expect(result).not.to.be.empty;
             done();
         });
    });

    it('Call DELETE /api/projects/:projectId/prototype/lock - Unlock current project (success=true)', function (done) {
        api.deletePrototypeLock(200, projectId, function (err, res) {
            if (err) {
                return done(err);
            };
            expect(api.isContentTypeJSON(res)).to.be.true;
            var result = res.body;
            //logger.info(res.body);
            done();
        });
    });

});

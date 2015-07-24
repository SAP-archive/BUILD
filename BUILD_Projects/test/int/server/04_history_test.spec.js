'use strict';

var expect = require('norman-testing-tp').chai.expect;

var ProjectAPI = require('../api/ProjectsRestApi');
var api = new ProjectAPI();

var projectId;

var EMAIL_ADDRESS = 'contact.build@sap.com';
var PROJECT_NAME = 'Test History Project';
var TEST_USER = 'user1234';
var TEST_RESOURCE_NAME = 'screenshot1';
var TEST_RESOURCE_ID = 'resource123abc';
var TEST_RESOURCE_VERSION = 1;
var TEST_RESOURCE_TYPE = 'picture';
var TEST_RESOURCE_DESC = 'this is a screenshot';
var TEST_RESOURCE_URL = 'some/url/to/screenshot1_thumbnail.png';

describe('History REST API Test', function () {
    this.timeout(15000);

    before('Initialize API', function (done) {
        api.initialize(EMAIL_ADDRESS, 'Minipas!1', true).then(done);
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

    it('Call POST /api/projects/:projectId/history - create history event', function (done) {

        var model = {
            project_id: projectId,
            user: TEST_USER,
            resource_id: TEST_RESOURCE_ID,
            resource_version: TEST_RESOURCE_VERSION + 1,
            resource_type: TEST_RESOURCE_TYPE,
            resource_name: TEST_RESOURCE_NAME,
            resource_url: TEST_RESOURCE_URL,
            thumbnail_url: TEST_RESOURCE_URL,
            description: TEST_RESOURCE_DESC
        };

        api.createHistory(201, projectId, model, function (err, res) {
            if (err) {
                done(err);
            } else {
                var result = res.body;
                expect(result.resource_id).to.equal(TEST_RESOURCE_ID);
                expect(result.project_id).to.equal(projectId);
                done();
            }
        });
    });

    it('Call GET /api/projects/:projectId/history - Get history', function (done) {
        api.getHistory(200, projectId, function (err, res) {
            if (err) {
                return done(err);
            }
            expect(api.isContentTypeJSON(res)).to.be.true;
            var result = res.body;
            expect(result).not.to.be.empty;
            expect(result).to.be.an.instanceof(Array);
            expect(result[0].project_id).to.eq('' + projectId);
            expect(result.length).to.equal(2);
            done();
        });
    });

    it('Call POST /api/projects/:projectId/history - Should not be able to create a duplicate item', function (done) {

        var model = {
            project_id: projectId,
            user: TEST_USER,
            resource_id: TEST_RESOURCE_ID,
            resource_version: TEST_RESOURCE_VERSION + 1,
            resource_type: TEST_RESOURCE_TYPE,
            resource_name: TEST_RESOURCE_NAME,
            resource_url: TEST_RESOURCE_URL,
            thumbnail_url: TEST_RESOURCE_URL,
            description: TEST_RESOURCE_DESC
        };

        api.createHistory(422, projectId, model, function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(api.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result.name).to.equal('MongoError');
                done();
            }
        });
    });

    it('Call POST /api/projects/:projectId/history - Should not be able to create a history item if nothing is passed', function (done) {

        var model = {};

        api.createHistory(400, projectId, model, function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(api.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result.error).to.equal('Missing required field(s)');
                done();
            }
        });
    });

});

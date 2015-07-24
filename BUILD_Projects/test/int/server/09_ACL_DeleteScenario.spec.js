'use strict';

var path = require('path');
var _ = require('norman-server-tp')['lodash-node'];

var expect = require('norman-testing-tp').chai.expect;
var ProjectAPI = require('../api/ProjectsRestApi');
var userOne = new ProjectAPI();
var userTwo = new ProjectAPI();
var userOneId, userTwoId;

var projectId;
var assetIdOne;
var assetIdTwo;

var EMAIL_ADDRESS = 'contact.build@sap.com';
var PROJECT_NAME = 'Test Doc';
var USER_TWO_EMAIL = 'contact.build.2@sap.com';

/**
 *
 * Test case around ACL and deleting assets
 *
 * - User One creates a project
 * - User One invites User two to project
 * - User One uploads assets to the project
 * - User One uploads assets to the project
 * - User Two logs in and views projects available
 * - User Two accepts invite
 * - User Two deletes asset from project
 * - User One deletes asset from project
 * - User One confirms there are no assets associated with the project
 *
 */

describe('Document REST Test cases', function () {
    this.timeout(15000);

    before('Initialize userOne', function (done) {
        userOne.initialize(EMAIL_ADDRESS, 'Minipas!1', true)
            .then(function () {
                userOne.getUserDetails(200, function (err, res) {
                    userOneId = JSON.parse(res.text)._id.toString();
                    done();
                });
            });
    });

    before('Initialize User Two userOne', function (done) {
        userTwo.initialize(USER_TWO_EMAIL, 'Minipas!1')
            .then(function () {
                userTwo.getUserDetails(200, function (err, res) {
                    userTwoId = JSON.parse(res.text)._id.toString();
                    done();
                });
            });
    });

    after(function (done) {
        // Only required for one user to do this task!
        userOne.resetDB(done);
    });

    it('User One creates a project', function (done) {
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

    it('User One invites User two to project', function (done) {
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

    it('User One uploads assets to the project - Item One', function (done) {
        userOne.uploadAsset(201, projectId, path.resolve(__dirname, 'Large.png'), function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(userOne.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result).not.to.be.empty;
                expect(result).to.be.an.instanceof(Array);
                expect(result[0].filename).to.eq('Large.png');
                expect(result[0].metadata.isThumb).to.eq(false);
                expect(result[0].metadata.hasThumb).to.eq(false);
                expect(result[0].metadata.version).to.eq(1);
                expect(result[0].metadata.extension).to.eq('png');
                expect(result[0].metadata.contentType).to.eq('image/png');
                expect(result[0].length).to.eq(257734);
                assetIdOne = result[0]._id;
                expect(assetIdOne).not.to.eql(null);
                expect(assetIdOne).not.to.be.empty;
                done();
            }
        });
    });

    it('User One uploads assets to the project - Item Two', function (done) {
        userOne.uploadAsset(201, projectId, path.resolve(__dirname, 'testFile.notsupported'), function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(userOne.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result).not.to.be.empty;
                expect(result).to.be.an.instanceof(Array);
                expect(result[0].filename).to.eq('testFile.notsupported');
                expect(result[0].metadata.isThumb).to.eq(false);
                expect(result[0].metadata.hasThumb).to.eq(false);
                expect(result[0].metadata.version).to.eq(1);
                assetIdTwo = result[0]._id;
                expect(assetIdTwo).not.to.eql(null);
                expect(assetIdTwo).not.to.be.empty;
                done();
            }
        });
    });

    it('User Two logs in and views projects available', function (done) {
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

    it('User Two accepts invite', function (done) {
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

    it('Check owner', function (done) {
        userTwo.getProjects(200, function (err, res) {
            if (err) {
                return done(err);
            }
            expect(userTwo.isContentTypeJSON(res)).to.be.true;
            var result = res.body;
            expect(result).to.be.an.instanceof(Array);
            expect(result).not.to.be.empty;
            expect(result.length).to.equal(1);
            result = _.find(result, {_id: projectId});
            expect(result.name).to.equal(PROJECT_NAME);
            // User has an outstanding invite
            expect(result.invite_list.length).to.equal(0);
            expect(result.user_list.length).to.equal(2);
            result.user_list.forEach(function(user){
                expect(user.role).to.equal(user.user_id === userOneId ? 'owner': 'contributor');
            });

            done();
        });
    });

    it('User One change owner', function (done) {
        userOne.changeOwner(204, projectId, {userId: userTwoId}, function (err, res) {
            if (err) {
                done(err);
            } else {
                done();
            }
        });
    });

    it('Check if owner changed', function (done) {
        userTwo.getProjects(200, function (err, res) {
            if (err) {
                return done(err);
            }
            expect(userTwo.isContentTypeJSON(res)).to.be.true;
            var result = res.body;
            expect(result).to.be.an.instanceof(Array);
            expect(result).not.to.be.empty;
            expect(result.length).to.equal(1);
            result = _.find(result, {_id: projectId});
            expect(result.name).to.equal(PROJECT_NAME);
            // User has an outstanding invite
            expect(result.invite_list.length).to.equal(0);
            expect(result.user_list.length).to.equal(2);
            result.user_list.forEach(function(user){
                expect(user.role).to.equal(user.user_id === userTwoId? 'owner': 'contributor');
            });
            done();
        });
    });

    it('User Two deletes asset from project', function (done) {
        userTwo.deleteAsset(204, projectId, assetIdOne, function (err) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    it('User One deletes asset from project', function (done) {
        userTwo.deleteAsset(204, projectId, assetIdTwo, function (err) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    it('User One confirms there are no assets associated with the project', function (done) {
        userOne.getAssets(200, projectId, function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(userOne.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result).to.be.empty;
                expect(result).to.be.an.instanceof(Array);
                expect(result.length).to.eq(0);
                done();
            }
        });
    });
});

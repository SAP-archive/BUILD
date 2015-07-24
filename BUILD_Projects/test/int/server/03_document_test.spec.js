'use strict';

var path = require('path');

var expect = require('norman-testing-tp').chai.expect;
var ProjectAPI = require('../api/ProjectsRestApi');
var userOne = new ProjectAPI();
var userTwo = new ProjectAPI();

var projectId;
var assetId;
var parentAssetId;

var EMAIL_ADDRESS = 'contact.build@sap.com';
var PROJECT_NAME = 'Test Doc';
var USER_TWO_EMAIL = 'contact.build.2@sap.com';

describe('Document REST Test cases', function () {
    this.timeout(15000);

    before('Initialize userOne', function (done) {
        userOne.initialize(EMAIL_ADDRESS, 'Minipas!1', true).then(done);
    });

    before('Initialize User Two userOne', function (done) {
        userTwo.initialize(USER_TWO_EMAIL, 'Minipas!1').then(done);
    });

    after(function (done) {
        // Only required for one user to do this task!
        userOne.resetDB(done);
    });

    it('Call POST /userOne/projects - Create project should create 201 ', function (done) {
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

    it('Call POST /userOne/projects/:projectId/document - Attach a new asset to a project', function (done) {
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
                assetId = result[0]._id;
                expect(assetId).not.to.eql(null);
                expect(assetId).not.to.be.empty;
                done();
            }
        });
    });

    it('Call POST /userOne/projects/:projectId/document - Attach another random asset to a project', function (done) {
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
                done();
            }
        });
    });

    it('Call POST /userOne/projects/:projectId/document - Allow the same asset to be uploaded again', function (done) {
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
                done();
            }
        });
    });

    it('Call GET /userOne/projects/:projectId/document/ - Get all assets associated with a project', function (done) {
        userOne.getAssets(200, projectId, function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(userOne.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result).not.to.be.empty;
                expect(result).to.be.an.instanceof(Array);
                expect(result.length).to.eq(3);
                expect(result[0].filename).to.eq('Large.png');
                expect(result[0].metadata.isThumb).to.eq(false);
                expect(result[0].metadata.hasThumb).to.eq(false);
                expect(result[0].metadata.version).to.eq(1);
                expect(result[0].metadata.extension).to.eq('png');
                expect(result[0].metadata.contentType).to.eq('image/png');
                expect(result[0].length).to.eq(257734);
                done();
            }
        });
    });

    it('Call GET /userOne/projects/:projectId/document/:assetId - Get specific asset details', function (done) {
        userOne.getAsset(200, projectId, assetId, function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(userOne.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result).not.to.be.empty;
                expect(result.filename).to.eq('Large.png');
                expect(result.metadata.isThumb).to.eq(false);
                expect(result.metadata.hasThumb).to.eq(false);
                expect(result.metadata.version).to.eq(1);
                expect(result.metadata.extension).to.eq('png');
                expect(result.metadata.contentType).to.eq('image/png');
                expect(result.length).to.eq(257734);
                done();
            }
        });
    });

    it('Call GET /userOne/projects/:projectId/document/:assetId - Get specific asset details', function (done) {
        userOne.getAssetByVersion(200, projectId, assetId, 1, function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(userOne.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result).not.to.be.empty;
                expect(result.filename).to.eq('Large.png');
                expect(result.metadata.isThumb).to.eq(false);
                expect(result.metadata.hasThumb).to.eq(false);
                expect(result.metadata.version).to.eq(1);
                expect(result.metadata.extension).to.eq('png');
                expect(result.metadata.contentType).to.eq('image/png');
                expect(result.length).to.eq(257734);
                done();
            }
        });
    });

    it('Call GET /userOne/projects/:projectId/document/:assetId/render - Render a specific image', function (done) {
        userOne.renderAsset(200, projectId, assetId, null, function (err, res) {
            if (err) {
                done(err);
            } else {
                var result = res.body;
                expect(result).not.to.be.empty;
                expect(res.headers['content-disposition']).to.eq('filename=Large.png');
                expect(res.headers['content-length']).to.eq('257734');
                expect(res.headers['content-type']).to.eq('image/png');
                expect(res.headers['etag']).not.to.be.empty;
                done();
            }
        });
    });

    it('Call GET /userOne/projects/:projectId/document/ - filter by image/png', function (done) {
        userOne.filterAssets(200, projectId, 'fileType=image/png', function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(userOne.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result).not.to.be.empty;
                expect(result).to.be.an.instanceof(Array);
                expect(result.length).to.eq(1);
                done();
            }
        });
    });

    it('Call GET /userOne/projects/:projectId/document/ - filter by image/jpeg', function (done) {
        userOne.filterAssets(200, projectId, 'fileType=image/jpeg', function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(userOne.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result).to.be.empty;
                done();
            }
        });
    });

    // No thumbnails have been loaded, so nothing should be returned
    it('Call GET /userOne/projects/:projectId/document/ - Filter by thumbnails', function (done) {
        userOne.filterAssets(200, projectId, 'thumbOnly=true', function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(userOne.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result).to.be.empty;
                done();
            }
        });
    });

    it('Call GET /userOne/projects/:projectId/document/ - Filter by thumbnails with invalid option', function (done) {
        userOne.filterAssets(200, projectId, 'thumbOnly=false', function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(userOne.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result).not.to.be.empty;
                expect(result).to.be.an.instanceof(Array);
                expect(result.length).to.eq(3);
                expect(result[0].filename).to.eq('Large.png');
                expect(result[0].metadata.isThumb).to.eq(false);
                expect(result[0].metadata.hasThumb).to.eq(false);
                expect(result[0].metadata.version).to.eq(1);
                expect(result[0].metadata.extension).to.eq('png');
                expect(result[0].metadata.contentType).to.eq('image/png');
                expect(result[0].length).to.eq(257734);
                done();
            }
        });
    });

    it('Call GET /userOne/projects/:projectId/document/ - Filter by thumbnails with invalid option', function (done) {
        userOne.filterAssets(200, projectId, 'thumbOnly=notworking', function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(userOne.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result).not.to.be.empty;
                expect(result).to.be.an.instanceof(Array);
                expect(result.length).to.eq(3);
                expect(result[0].filename).to.eq('Large.png');
                expect(result[0].metadata.isThumb).to.eq(false);
                expect(result[0].metadata.hasThumb).to.eq(false);
                expect(result[0].metadata.version).to.eq(1);
                expect(result[0].metadata.extension).to.eq('png');
                expect(result[0].metadata.contentType).to.eq('image/png');
                expect(result[0].length).to.eq(257734);
                done();
            }
        });
    });


    it('Call GET /userOne/projects/:projectId/document/ - Filter assets by image/jpeg', function (done) {
        userOne.filterAssets(200, projectId, 'fileType=image/jpeg', function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(userOne.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result).to.be.empty;
                done();
            }
        });
    });

    it('Call PUT /userOne/projects/ - Archive project', function (done) {
        userOne.updateProject(200, projectId, {archived: true}, function (err, res) {
            if (err) {
                return done(err);
            }
            expect(userOne.isContentTypeJSON(res)).to.be.true;
            var result = res.body;
            expect(result).not.to.be.empty;
            expect(result.deleted).to.equal(false);
            expect(result.archived).to.equal(true);
            done();
        });
    });

    it('Call DELETE /userOne/projects/:projectId/document - Try to delete existing asset', function (done) {
        userOne.deleteAsset(204, projectId, assetId, function (err) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    it('Call GET /userOne/projects/:projectId/document/:assetId - Should not be able to view a asset that was deleted', function (done) {
        userOne.getAsset(404, projectId, assetId, function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(userOne.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result).to.be.empty;
                done();
            }
        });
    });



    it('Call GET /userOne/projects/:projectId/document/?linkImage=true - Should be able to handle thumbnails', function (done) {
        var attachments = [];
        attachments.push(path.join(__dirname, './thumb_Small.png'));
        attachments.push(path.join(__dirname, './Small.png'));
        userOne.uploadLinkImage(201, projectId, attachments, function (err, res) {
            if (err) {
                return done(err);
            }
            expect(userOne.isContentTypeJSON(res)).to.be.true;
            var result = res.body;
            expect(result).not.to.be.empty;
            expect(result.length).to.be.eq(1);
            // Main image
            expect(result[0].filename).to.equal('Small.png');
            expect(result[0].metadata.isThumb).to.be.eq(false);
            expect(result[0].metadata.hasThumb).to.eq(true);
            expect(result[0].metadata.contentType).to.be.eq('image/png');
            expect(result[0].metadata.extension).to.be.eq('png');
            expect(result[0].metadata.project).to.be.eq(projectId);
            parentAssetId = result[0]._id;
            done();
        });
    });

    it('Call GET /userOne/projects/:projectId/document/:assetId?thumbOnly=true - Get thumbnail details of parent image', function (done) {
        userOne.getAssetWithFilter(200, projectId, parentAssetId, 'thumbOnly=true', function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(userOne.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result).not.to.be.empty;
                expect(result.filename).to.eq('thumb_Small.png');
                expect(result.metadata.isThumb).to.eq(true);
                expect(result.metadata.hasThumb).to.eq(false);
                expect(result.metadata.version).to.eq(1);
                expect(result.metadata.extension).to.eq('png');
                expect(result.metadata.contentType).to.eq('image/png');
                expect(result.length).to.eq(49128);
                done();
            }
        });
    });

    it('Call GET /userOne/projects/:projectId/document/ - Filter by thumbnails, one should exist!', function (done) {
        userOne.filterAssets(200, projectId, 'thumbOnly=true', function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(userOne.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result).not.to.be.empty;
                expect(result.length).to.be.eq(1);
                expect(result[0].filename).to.equal('thumb_Small.png');
                expect(result[0].metadata.isThumb).to.be.eq(true);
                expect(result[0].metadata.contentType).to.be.eq('image/png');
                expect(result[0].metadata.extension).to.be.eq('png');
                expect(result[0].metadata.project).to.be.eq(projectId);
                expect(result[0].metadata.hasThumb).to.eq(false);
                expect(result[0].metadata.parent_id).to.eq(parentAssetId);
                done();
            }
        });
    });

    it('Call GET /userOne/projects/:projectId/document/:assetId/render?thumbOnly=true - Render a specific image as a thumbnail', function (done) {
        userOne.renderAsset(200, projectId, parentAssetId, 'thumbOnly=true', function (err, res) {
            if (err) {
                done(err);
            } else {
                var result = res.body;
                expect(result).not.to.be.empty;
                expect(res.headers['content-disposition']).to.eq('filename=thumb_Small.png');
                expect(res.headers['content-length']).to.eq('49128');
                expect(res.headers['content-type']).to.eq('image/png');
                expect(res.headers['etag']).not.to.be.empty;
                done();
            }
        });
    });

    it('Call GET /userOne/projects/:projectId/document/:assetId/render?download=true - Download a specific image as a thumbnail', function (done) {
        userOne.renderAsset(200, projectId, parentAssetId, 'download=true', function (err, res) {
            if (err) {
                done(err);
            } else {
                var result = res.body;
                expect(result).not.to.be.empty;
                expect(res.headers['content-disposition']).to.eq('attachment; filename=Small.png');
                expect(res.headers['content-length']).to.eq('15645');
                expect(res.headers['content-type']).to.eq('image/png');
                expect(res.headers['etag']).not.to.be.empty;
                done();
            }
        });
    });

    it('Call GET /userOne/projects/:projectId/document/:assetId/render - Render a specific version of an asset', function (done) {
        userOne.renderAssetByVersion(200, projectId, parentAssetId, 1, function (err, res) {
            if (err) {
                done(err);
            } else {
                var result = res.body;
                expect(result).not.to.be.empty;
                expect(res.headers['content-disposition']).to.eq('filename=Small.png');
                expect(res.headers['content-length']).to.eq('15645');
                expect(res.headers['content-type']).to.eq('image/png');
                expect(res.headers['cache-control']).to.eq('private, max-age=86400');
                expect(res.headers['expires']).not.to.be.empty;
                expect(res.headers['last-modified']).not.to.be.empty;
                expect(res.headers['etag']).to.be.empty;
                done();
            }
        });
    });

    it('Call GET /userOne/projects/:projectId/document/?linkImage=true - Try to upload images with incorrect image names', function (done) {
        var attachments = [];
        attachments.push(path.join(__dirname, './Small.png'));
        attachments.push(path.join(__dirname, './Small.png'));
        userOne.uploadLinkImage(400, projectId, attachments, function (err, res) {
            if (err) {
                return done(err);
            }
            expect(userOne.isContentTypeJSON(res)).to.be.true;
            var result = res.body;
            expect(result).not.to.be.empty;
            expect(result.error).to.equal('Missing thumbnail in request');
            done();
        });
    });

    // This returns a 500 which is handled by the multi-part middleware
    it('Call GET /userOne/projects/:projectId/document/?linkImage=true - Try to upload images with no files attached', function (done) {
        var attachments = [];
        userOne.uploadLinkImage(500, projectId, attachments, function (err) {
            if (err) {
                return done(err);
            }
            done();
        });
    });

    it('Call GET /userOne/projects/:projectId/document/?linkImage=true - Try to upload images with no multi-part set', function (done) {
        var attachments = [];
        userOne.uploadAssetWithNoMultiPart(400, projectId, attachments, function (err, res) {
            if (err) {
                return done(err);
            }
            expect(userOne.isContentTypeJSON(res)).to.be.true;
            var result = res.body;
            expect(result).not.to.be.empty;
            expect(result.error).to.equal('No files attached');
            done();
        });
    });

    it('Call GET /userOne/projects/:projectId/document/?linkImage=true - Should be able to upload an image with the name thumb_', function (done) {
        userOne.uploadAsset(201, projectId, path.resolve(__dirname, 'thumb_Small.png'), function (err, res) {
            if (err) {
                done(err);
            } else {
                expect(userOne.isContentTypeJSON(res)).to.be.true;
                var result = res.body;
                expect(result).not.to.be.empty;
                expect(result).to.be.an.instanceof(Array);
                expect(result[0].filename).to.eq('thumb_Small.png');
                expect(result[0].metadata.isThumb).to.eq(false);
                expect(result[0].metadata.hasThumb).to.eq(false);
                expect(result[0].metadata.version).to.eq(1);
                done();
            }
        });
    });

});

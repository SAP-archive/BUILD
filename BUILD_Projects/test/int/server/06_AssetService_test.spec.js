'use strict';

var path = require('path');
var expect = require('norman-testing-tp').chai.expect;

var ProjectAPI = require('../api/ProjectsRestApi');
var api = new ProjectAPI();

var projectId;
var assetId;
var PROJECT_NAME = 'Test Asset Service';

describe('Asset Service Test', function () {
    this.timeout(15000);
    var assetService;

    before('Initialize User One', function (done) {
        api.initialize(new Date().getTime() + '@sap.com', 'Minipas!1', true).then(done);
    });

    before('Setup assetService', function (done) {
        var registry = require('norman-common-server').registry;
        assetService = registry.getModule('AssetService');
        done();
    });

    after(function (done) {
        // Only required for one user to do this task!
        api.resetDB(done);
    });

    after(function (done) {
        // Only required for one user to do this task!
        api.shutdown(done);
    });

    it('Call POST /api/projects - Create a new project', function (done) {
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

    it('Call GET /api/projects/:projectId/document/?linkImage=true - Should be able to handle thumbnails', function (done) {
        var attachments = [];
        attachments.push(path.join(__dirname, './thumb_Small.png'));
        attachments.push(path.join(__dirname, './Small.png'));
        api.uploadLinkImage(201, projectId, attachments, function (err, res) {
            if (err) {
                return done(err);
            }
            expect(api.isContentTypeJSON(res)).to.be.true;
            var result = res.body;
            expect(result).not.to.be.empty;
            expect(result.length).to.be.eq(1);
            // Main image
            expect(result[0].filename).to.equal('Small.png');
            expect(result[0].metadata.isThumb).to.be.eq(false);
            expect(result[0].metadata.hasThumb).to.be.eq(true);
            expect(result[0].metadata.contentType).to.be.eq('image/png');
            expect(result[0].metadata.extension).to.be.eq('png');
            expect(result[0].metadata.project).to.be.eq(projectId);
            assetId = '' + result[0]._id;
            expect(assetId).not.to.eql(null);
            expect(assetId).not.to.be.empty;
            done();
        });
    });

    // Test case can be tested via AP
    it('Call assetService - Return asset details', function (done) {
        assetService.getAsset(assetId, 1, false).then(function (asset) {
            if (!asset) {
                done(new Error('Expecting item to be found'));
            }
            expect(asset).not.to.be.empty;
            expect(asset.metadata.isThumb).to.eq(false);
            expect(asset.metadata.version).to.eq(1);
            expect(asset.metadata.extension).to.equal('png');
            expect(asset.metadata.contentType).to.equal('image/png');
            done();
        }).catch(function () {
            done(new Error('Should not fail'));
        });
    });

    it('Call assetService - Should not return a version that does not exist', function (done) {
        assetService.getAsset(assetId, 2, false).then(function (asset) {
            if (!asset) {
                done();
            } else {
                done(new Error('Expecting item NOT to be found'));
            }
        }).catch(function () {
            done(new Error('Should not fail'));
        });
    });

    it('Call assetService - Should not return a thumb version that does not exist', function (done) {
        assetService.getAsset(assetId, 2, true).then(function (asset) {
            if (!asset) {
                done();
            } else {
                done(new Error('Expecting item NOT to be found'));
            }
        }).catch(function () {
            done(new Error('Should not fail'));
        });
    });

    it('Call assetService - should return latest version', function (done) {
        assetService.getAsset(assetId, '', false).then(function (asset) {
            if (!asset) {
                done(new Error('Expecting item to be found'));
            }
            expect(asset).not.to.be.empty;
            expect(asset.metadata.isThumb).to.eq(false);
            expect(asset.metadata.version).to.eq(1);
            expect(asset.metadata.extension).to.equal('png');
            expect(asset.metadata.contentType).to.equal('image/png');
            done();
        }).catch(function () {
            done(new Error('Should not fail'));
        });
    });

    it('Call assetService - get asset with content details', function (done) {
        assetService.getAssetWithContent(assetId, '', false).then(function (asset) {
            if (!asset) {
                done(new Error('Expecting item to be found'));
            }
            expect(asset).not.to.be.eq(null);
            expect(asset.filename).to.eq('Small.png');
            expect(asset.contentType).to.eq('image/png');
            done();
        }).catch(function () {
            done(new Error('Should not fail'));
        });
    });

    it('Call DELETE /api/projects/:projectId/document - Try to delete existing asset', function (done) {
        api.deleteAsset(204, projectId, assetId, function (err) {
            if (err) {
                return done(err);
            }
            done();
        })
    });

    it('Call assetService - should not return an item that is deleted and no version passed in', function (done) {
        assetService.getAsset(assetId, '', false).then(function (asset) {
            if (!asset) {
                done();
            } else {
                done(new Error('Expecting item NOT to be found'));
            }
        }).catch(function () {
            done(new Error('Should not fail'));
        });
    });

    it('Call assetService - should return an asset if version is specified ', function (done) {
        assetService.getAsset(assetId, 1, false).then(function (asset) {
            if (!asset) {
                done(new Error('Expecting item to be found'));
            }
            expect(asset).not.to.be.empty;
            expect(asset.metadata.isThumb).to.eq(false);
            expect(asset.metadata.version).to.eq(1);
            expect(asset.metadata.extension).to.equal('png');
            expect(asset.metadata.contentType).to.equal('image/png');
            done();
        }).catch(function () {
            done(new Error('Should not fail'));
        });
    });

    it('Call assetService - should throw an error if asset ID is not valid', function (done) {
        assetService.getAsset('', 1, false)
            .then(function () {
                done(new Error('Should not succeed'));
            })
            .catch(function (err) {
                expect(err).not.to.be.null;
                expect(err.message).to.equal('Asset ID is a required field');
                done();
            });
    });

    it('Call assetService - should throw an error if thumbnail is not the correct type', function (done) {
        assetService.getAsset(assetId, 1, 'something')
            .then(function () {
                done(new Error('Should not succeed'));
            })
            .catch(function (err) {
                expect(err).not.to.be.null;
                expect(err.message).to.equal('Thumbnail field is not set correctly');
                done();
            });
    });

    it('Call assetService - should throw error if missing files', function (done) {
        assetService.handleFileUpload(assetId, assetId, {}, [], true)
            .then(function () {
                done(new Error('Should not succeed'));
            })
            .catch(function (err) {
                expect(err).not.to.be.null;
                expect(err.message).to.equal('Missing thumbnail in request');
                done();
            });
    });

    it('Call assetService - should throw error if linkThumb is wrong type', function (done) {
        assetService.handleFileUpload(assetId, assetId, {}, [], 'wrong_value')
            .then(function () {
                done(new Error('Should not succeed'));
            })
            .catch(function (err) {
                expect(err).not.to.be.null;
                expect(err.message).to.equal('One of the parameters are not set correctly');
                done();
            });
    });

    it('Call assetService - should throw an error if path is empty', function (done) {
        assetService.getPrototypeAsset(assetId)
            .then(function () {
                done(new Error('Should not succeed'));
            })
            .catch(function (err) {
                expect(err).not.to.be.null;
                expect(err.message).to.equal('A required field is missing');
                done();
            });
    });

    it('Call assetService - should throw an error if study ID is not a valid Mongo ID', function (done) {
        assetService.getPrototypeAsset('12345', '/JL/page1.html.png')
            .then(function () {
                done(new Error('Should not succeed'));
            })
            .catch(function (err) {
                expect(err).not.to.be.null;
                expect(err.message).to.equal('A required field is missing');
                done();
            });
    });

    it('Call assetService - should not return a project asset', function (done) {
        assetService.getPrototypeAsset(assetId, '/JL/page1.html.png')
            .then(function (studyAsset) {
                if (!studyAsset) {
                    done();
                } else {
                    done(new Error('Expecting item to be found'));
                }
            })
            .catch(done);
    });

    it('Call assetService - should throw an error if study ID is not a valid Mongo ID', function (done) {
        assetService.getPrototypeAsset(assetId, '/JL/page1.html.png')
            .then(function (studyAsset) {
                if (!studyAsset) {
                    done();
                } else {
                    done(new Error('Expecting item to be found'));
                }
            })
            .catch(done);
    });

    it('Call assetService - should throw error if missing files', function (done) {
        // Reusing assetId as userId
        assetService.handlePrototypeUpload(projectId, assetId, assetId, {}, 'Prototypes')
            .then(function (res) {
                expect(res.files).to.equal(0);
                done();
            })
            .catch(done);
    });

    it('Call assetService - should throw error if missing files', function (done) {
        // Reusing assetId as userId
        assetService.handlePrototypeUpload(projectId, assetId, assetId, {}, 'Prototypes')
            .then(function (res) {
                expect(res.files).to.equal(0);
                done();
            })
            .catch(done);
    });

    it('Call assetService - should throw error if missing files', function (done) {
        var files = {};
        var name = 'file1';
        files[name] = {
            buffer: new Buffer('some binary data', 'binary').toString('base64'),
            path: name
        };

        assetService.handlePrototypeUpload(projectId, assetId, assetId, files, 'Prototypes')
            .then(function (res) {
                expect(res.files).to.equal(1);
                done();
            })
            .then(function () {
                assetService.getPrototypeAsset(assetId, 'file1')
                    .then(function (studyAsset) {
                        if (!studyAsset) {
                            done(new Error('Expecting item to be found'));
                        } else {
                            expect(studyAsset.metadata.entryPath).to.equal('file1');
                            expect(studyAsset.metadata.project).to.equal(projectId);
                            expect(studyAsset.metadata.hasThumb).to.equal(false);
                            expect(studyAsset.metadata.version).to.equal(1);
                            expect(studyAsset.metadata.extension).to.equal('file1');
                            expect(studyAsset.filename).to.equal('file1.png');
                            done();
                        }
                    });
            })
            .catch(done);
    });

});

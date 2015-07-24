'use strict';

var expect = require('chai').expect;
var commonServer = require('norman-common-server');
var Promise = require('norman-promise');
var commonServerLogger = commonServer.logging;
var logger = commonServerLogger.createLogger('snapshot.service-test');
var NormanError = commonServer.NormanError;
var commonMessage = require('../../lib/services/common/common.message.js');
var tp = commonServer.tp,
    registryStub,
    snapshotService,
    stream = tp.streamifier,
    skipTests = false,
    _ = tp.lodash,
    loggerStub;

var sinon = require("norman-testing-tp").sinon;
var projectId = '0397820d2eccf02f0999a074';
var mockSnapshotUILang = 'UI5';
var mockSnapshotUrl1 = '/public/54a32fe8fb9c9afa26840304/1/index.html';
var mockSnapshotDesc1 = 'test1';
var mockSnapshotUrl2 = '/public/54a32fe8fb9c9afa26840304/2/index.html';
var mockSnapshotDesc2 = 'test2';
var mockSnapshotUrl3 = '/public/54a32fe8fb9c9afa26840302/2/index.html';
var mockSnapshotDesc3 = 'test3';
var mockSnapshotUrlLatest = '/public/54a32fe8fb9c9afa26840304/latest/index.html';
var mockUserId = 'Norman test';

var serviceLoggerMock = {
    error: function (error) {

    },
    info: function (info) {

    },
    debug: function (log) {

    }
};

var mockSnapshotVersion1 = {
    '_id': '54e653b35b5f0854042fc545',
    'version': 1,
    'appMetadata': '442291923a76da8e09a926c3',
    'stats': {
        'created_by': mockUserId,
        'created_at': '2015-02-19T21:20:51.837Z'
    },
    'artifacts': [],
    'sampleMetadata': [],
    'dataModelMetadata': [],
    'pageMetadata': [
        'f73376f673db389909a926c2',
        'a37cb0abe33db8e109a926c2',
        '0bc776d6cb7a8adf09a926c2'
    ],
    'snapshot': {
        'snapshotUrl': mockSnapshotUrl1,
        'snapshotDesc': mockSnapshotDesc1,
        'snapshotUILang': mockSnapshotUILang,
        'version': '1',
        'stats': {
            'created_by': mockUserId,
            'created_at': '2015-02-19T21:20:51.837Z'
        },
        'deepLinks': [{
            'pageName': 'S0',
            'thumbnail': '/resources/thumbnail/S0.png',
            'pageUrl': '/public/54a32fe8fb9c9afa26840304/1/index.html#S0',
            '_id': '54e777f231b0eb082610292d'
        }, {
            'pageName': 'S1',
            'thumbnail': '/resources/thumbnail/S1.png',
            'pageUrl': '/public/54a32fe8fb9c9afa26840304/1/index.html#S1',
            '_id': '54e777f231b0eb082610292c'
        }, {
            'pageName': 'S2',
            'thumbnail': '/resources/thumbnail/S2.png',
            'pageUrl': '/public/54a32fe8fb9c9afa26840304/1/index.html#S2',
            '_id': '54e777f231b0eb082610292b'
        }],
        toObject: function () {
            return this;
        }
    },
    'isHistory': false,
    'isSnapshot': true
};
var mockSnapshotVersion2 = {
    '_id': '54e653b35b5f0854042fc545',
    'version': 2,
    'appMetadata': '442291923a76da8e09a926c3',
    'stats': {
        'created_by': mockUserId,
        'created_at': '2015-02-19T21:20:51.837Z'
    },
    'artifacts': [],
    'sampleMetadata': [],
    'dataModelMetadata': [],
    'pageMetadata': [
        'f73376f673db389909a926c2',
        'a37cb0abe33db8e109a926c2',
        '0bc776d6cb7a8adf09a926c2'
    ],
    'snapshot': {
        'snapshotUrl': mockSnapshotUrl2,
        'snapshotDesc': mockSnapshotDesc2,
        'snapshotUILang': mockSnapshotUILang,
        'version': '2',
        'stats': {
            'created_by': mockUserId,
            'created_at': '2015-02-19T21:20:51.837Z'
        },
        'deepLinks': [{
            'pageName': 'S0',
            'thumbnail': '/resources/thumbnail/S0.png',
            'pageUrl': '/public/54a32fe8fb9c9afa26840304/2/index.html#S0',
            '_id': '54e78d0af98e4168302160d5'
        }, {
            'pageName': 'S1',
            'thumbnail': '/resources/thumbnail/S1.png',
            'pageUrl': '/public/54a32fe8fb9c9afa26840304/2/index.html#S1',
            '_id': '54e78d0af98e4168302160d4'
        }, {
            'pageName': 'S2',
            'thumbnail': '/resources/thumbnail/S2.png',
            'pageUrl': '/public/54a32fe8fb9c9afa26840304/2/index.html#S2',
            '_id': '54e78d0af98e4168302160d3'
        }],
        toObject: function () {
            return this;
        }
    },
    'isHistory': false,
    'isSnapshot': true
};


var mockSnapshotVersion3 = {
    '_id': '54e653b35b5f0854042fc545',
    'version': 3,
    'appMetadata': '442291923a76da8e09a926c3',
    'stats': {
        'created_by': mockUserId,
        'created_at': '2015-02-19T21:20:51.837Z'
    },
    'artifacts': [],
    'sampleMetadata': [],
    'dataModelMetadata': [],
    'pageMetadata': [
        'f73376f673db389909a926c2',
        'a37cb0abe33db8e109a926c2',
        '0bc776d6cb7a8adf09a926c2'
    ],
    'snapshot': {
        'snapshotUrl': mockSnapshotUrl3,
        'snapshotDesc': mockSnapshotDesc3,
        'snapshotUILang': mockSnapshotUILang,
        'version': '2',
        'stats': {
            'created_by': mockUserId,
            'created_at': '2015-02-19T21:20:51.837Z'
        },
        'deepLinks': [{
            'pageName': 'S0',
            'thumbnail': '/resources/thumbnail/S0.png',
            'pageUrl': '/public/54a32fe8fb9c9afa26840304/2/index.html#S0',
            '_id': '54e78d0af98e4168302160d5'
        }, {
            'pageName': 'S1',
            'thumbnail': '/resources/thumbnail/S1.png',
            'pageUrl': '/public/54a32fe8fb9c9afa26840304/2/index.html#S1',
            '_id': '54e78d0af98e4168302160d4'
        }, {
            'pageName': 'S2',
            'thumbnail': '/resources/thumbnail/S2.png',
            'pageUrl': '/public/54a32fe8fb9c9afa26840304/2/index.html#S2',
            '_id': '54e78d0af98e4168302160d3'
        }],
        toObject: function () {
            return this;
        }
    },
    'isHistory': false,
    'isSnapshot': false
};

var mockSnapshotVersions = [mockSnapshotVersion1, mockSnapshotVersion2];
var mockPrototype = {
    projectId: projectId,
    versions: [mockSnapshotVersion2],
    save: function (callback) {
        return callback();
    },
    markModified: function () {
    }
};


var mockPrototype2 = {
    projectId: projectId,
    versions: [mockSnapshotVersion3],
    save: function (callback) {
        return callback();
    },
    markModified: function () {
    }
};

var mockArtifacts = [{
    id: 'f4bf4468f950f31c0a0e35d1'
}, {
    id: 'f4bf4468f950f31c0a0e35d2'
}, {
    id: 'f4bf4468f950f31c0a0e35d3'
}];
var mockAppMetadata = {
    pages: [{
        'name': 'S0',
        'pageUrl': 'index.html/#S0',
        'thumbnailUrl': 'resources/thumbnail/S0.png'
    }, {
        'name': 'S1',
        'pageUrl': 'index.html/#S1',
        'thumbnailUrl': 'resources/thumbnail/S1.png'
    }],
    uiLang: mockSnapshotUILang
};

var PrototypeServiceMock = {
    getVersionsbyMatchingProperty: function (projectId) {
        if (projectId === 'latestVersionNotSnapshot') {
            return Promise.resolve([mockSnapshotVersion3]);
        }
        else {
            return Promise.resolve(mockSnapshotVersions);
        }


    },
    getPrototype: function (projectId) {
        if (projectId === 'latestVersionNotSnapshot') {
            return Promise.resolve(mockPrototype2);
        }
        else {
            return Promise.resolve(mockPrototype);
        }
    },
    getMetadata: function () {
        var response = {};
        response.artifacts = mockArtifacts;
        response.appMetadata = mockAppMetadata;
        return Promise.resolve(response);
    },
    updateTimeInLock: function () {
        return Promise.resolve();
    }
};

var mockGetArtifactResult = [{
    filename: 'index-prod.html',
    id: '0397820d2eccf02f0999a079',
    metadata: {
        path: 'index-prod.html',
        projectId: projectId
    }
}];
var mockFileContent = 'Hello';

var ArtifactServiceMock = {
    getArtifactByMetadata: function () {
        return Promise.resolve(mockGetArtifactResult);
    },
    updateMetadata: function () {
        return Promise.resolve();
    },
    copyArtifacts: function () {
        return Promise.resolve();
    },
    getArtifactReadStream: function () {
        return Promise.resolve(stream.createReadStream(mockFileContent));
    }

};

var mockErrorMessage = 'promise rejected';
var RejectedPromise = Promise.reject(new NormanError(mockErrorMessage));
var PrototypeServiceMockFailure = {
    getVersionsbyMatchingProperty: function () {
        return RejectedPromise;
    },
    getPrototype: function () {
        return RejectedPromise;
    },
    getMetadata: function () {
        return RejectedPromise;
    }
};

var ArtifactServiceMockFailure = {
    getArtifactByMetadata: function () {
        RejectedPromise
    },
    updateMetadata: function () {
        return RejectedPromise;
    },
    copyArtifacts: function () {
        return RejectedPromise;
    },
    getArtifactReadStream: function () {
        return RejectedPromise;
    }

};

describe('SnapshotService', function () {

    before(function (done) {
        loggerStub = sinon.stub(commonServerLogger, 'createLogger').returns(serviceLoggerMock);
        done();
    });
    after(function (done) {
        loggerStub.restore();
        done();
    });

    describe('SnapshotService Tests', function () {
        this.timeout(15000);
        beforeEach(function (done) {
            var registry = commonServer.registry;

            // mocking calls to SharedWorkspace & Registry to fetch SharedWorkspace services
            registryStub = sinon.stub(registry, 'getModule');
            registryStub.withArgs('PrototypeService').returns(PrototypeServiceMock);
            registryStub.withArgs('ArtifactService').returns(ArtifactServiceMock);
            var SnapshotService = require('../../lib/services/snapshot');
            snapshotService = new SnapshotService();
            done();
        });

        afterEach(function (done) {
            registryStub.restore();
            done();
        });

        describe('GET API', function () {

            it('should get all snapshots', function (done) {
                if (skipTests) {
                    logger.info('skipping [get snapshots]');
                    return done();
                }

                logger.info('beginning test [get snapshots]');

                function verify(snapshots) {
                    logger.info('verification of result json [get snapshots]');
                    expect(snapshots).to.have.length(2);
                    expect(snapshots[0].version).to.equal('1');
                    expect(snapshots[1].version).to.equal('2');
                    expect(snapshots[0].snapshotUrl).to.equal(mockSnapshotUrl1);
                    expect(snapshots[1].snapshotUrl).to.equal(mockSnapshotUrl2);
                    expect(snapshots[0].snapshotDesc).to.equal(mockSnapshotDesc1);
                    expect(snapshots[1].snapshotDesc).to.equal(mockSnapshotDesc2);
                    expect(snapshots[0].snapshotUILang).to.equal(mockSnapshotUILang);
                    expect(snapshots[1].snapshotUILang).to.equal(mockSnapshotUILang);
                    expect(snapshots[0].deepLinks).to.have.length(3);
                    expect(snapshots[1].deepLinks).to.have.length(3);
                    logger.info('finishing test [get snapshots]');
                    done();
                }

                snapshotService.getSnapshots(projectId).then(function (snapshots) {
                    setTimeout(function () {
                        verify(snapshots);
                    }, 0);
                });

            });

            it('should get specific snapshot', function (done) {
                if (skipTests) {
                    logger.info('skipping [get snapshots]');
                    return done();
                }

                logger.info('beginning test [get snapshots]');

                function verify(snapshots) {
                    logger.info('verification of result json [get snapshots]');
                    expect(snapshots).to.have.length(1);
                    expect(snapshots[0].version).to.equal('2');
                    expect(snapshots[0].snapshotUrl).to.equal(mockSnapshotUrl2);
                    expect(snapshots[0].snapshotDesc).to.equal(mockSnapshotDesc2);
                    expect(snapshots[0].deepLinks).to.have.length(3);
                    expect(snapshots[0].snapshotUILang).to.equal(mockSnapshotUILang);
                    logger.info('finishing test [get snapshots]');
                    done();
                }

                snapshotService.getSnapshots(projectId, '2').then(function (snapshots) {
                    setTimeout(function () {
                        verify(snapshots);
                    }, 0);
                });
            });


            it('should get snapshot :given a version', function (done) {

                function verify(snapshots) {
                    expect(snapshots.version).to.equal('2');
                    expect(snapshots.snapshotUrl).to.equal(mockSnapshotUrl2);
                    expect(snapshots.snapshotDesc).to.equal(mockSnapshotDesc2);
                    expect(snapshots.deepLinks).to.have.length(3);
                    expect(snapshots.snapshotUILang).to.equal(mockSnapshotUILang);
                    done();
                }

                snapshotService.getSnapshot(projectId, '2')
                    .then(function (snapshots) {
                        setTimeout(function () {
                            verify(snapshots);
                        }, 0);
                    });
            });

            it('get snapshot with args: snapshotversion and projectId, where snapshot version is latest ', function (done) {

                function verify(snapshots) {
                    expect(snapshots.version).to.equal('2');
                    expect(snapshots.snapshotUrl).to.equal(mockSnapshotUrlLatest);
                    expect(snapshots.snapshotDesc).to.equal(mockSnapshotDesc2);
                    expect(snapshots.deepLinks).to.have.length(3);
                    expect(snapshots.snapshotUILang).to.equal(mockSnapshotUILang);
                    done();
                }
                snapshotService.getSnapshot(projectId, 'latest')
                    .then(function (snapshots) {
                        setTimeout(function () {
                            verify(snapshots);
                        }, 0);
                    });
            });

            it('should get latest snapshot', function (done) {
                if (skipTests) {
                    logger.info('skipping [get snapshots]');
                    return done();
                }

                logger.info('beginning test [get snapshots]');

                function verify(snapshot) {
                    logger.info('verification of result json [get snapshots]');
                    // latest version is 2 in mock data
                    expect(snapshot.version).to.equal('2');
                    expect(snapshot.snapshotUrl).to.equal(mockSnapshotUrlLatest);
                    expect(snapshot.snapshotDesc).to.equal(mockSnapshotDesc2);
                    expect(snapshot.deepLinks).to.have.length(3);
                    expect(snapshot.existing).to.equal(true);
                    logger.info('finishing test [get snapshots]');
                    done();
                }

                snapshotService.getSnapshots(projectId, 'latest').then(function (snapshot) {
                    setTimeout(function () {
                        verify(snapshot);
                    }, 0);
                });

            });

            //
            it('should get all artifacts for snapshot deployment', function (done) {
                logger.info('beginning test [getAllArtifactsForDeployment]');

                function verify(result) {
                    logger.info('verification of result [getAllArtifactsForDeployment]');
                    expect(result).to.have.length(mockGetArtifactResult.length);
                    expect(result[0].filename).to.equal(mockGetArtifactResult[0].filename);
                    expect(result[0].fullpath).to.equal(mockGetArtifactResult[0].metadata.path);
                    expect(result[0].content).not.to.be.null;
                    logger.info('finishing test [getAllArtifactsForDeployment]');
                    done();
                }

                snapshotService.getAllArtifactsForDeployment(projectId, 2).then(function (result) {
                    setTimeout(function () {
                        verify(result);
                    }, 0);
                });
            });

            it('should get artifact for snapshot', function(done) {
                logger.info('beginning test [getArtifactForSnapshot]');

                function verify(result) {
                    logger.info('verification of result [getArtifactForSnapshot]');
                    expect(result.filename).to.equal(mockGetArtifactResult[0].filename);
                    expect(result.fullpath).to.equal(mockGetArtifactResult[0].metadata.path);
                    expect(result.contentType).to.equal(mockGetArtifactResult[0].contentType);
                    expect(result[0].content).not.to.be.null;
                    logger.info('finishing test [getArtifactForSnapshot]');
                    done();
                }

                snapshotService.getArtifactForSnapshot(projectId, 2, mockGetArtifactResult[0].filename).then(function(result) {
                    setTimeout(function() {
                        verify(result);
                    }, 0);
                });
                done();
            });



        });

        describe('POST API', function () {

            it('should create snapshot', function (done) {
                logger.info('beginning test [create snapshot]');

                function verify(result) {
                    logger.info('verification of result json [create snapshot]');
                    expect(result.projectId).to.equal(projectId);
                    expect(result.snapshotVersion).to.equal('2');
                    expect(result.snapshotDesc).to.equal(mockSnapshotDesc2);
                    expect(result.prototypeVersion).to.equal(2);
                    expect(result.created_by).to.equal(mockUserId);
                    logger.info('finishing test [create snapshot]');
                    done();
                }

                snapshotService.createSnapshot(projectId, 'test snapshot description', mockUserId).then(function (result) {
                    setTimeout(function () {
                        verify(result);
                    }, 0);
                });
            });

            it('should create snapshot: with latest verion of prototype not being a snapshot version', function (done) {

                function verify(result) {
                    expect(result.projectId).to.equal('latestVersionNotSnapshot');
                    expect(result.snapshotVersion).to.equal(3);
                    expect(result.snapshotDesc).to.equal(mockSnapshotDesc3);
                    expect(result.prototypeVersion).to.equal(3);
                    expect(result.created_by).to.equal(mockUserId);
                    done();
                }

                snapshotService.createSnapshot('latestVersionNotSnapshot', mockSnapshotDesc3, mockUserId)
                    .then(function (result) {
                        setTimeout(function () {
                            verify(result);
                        }, 0);
                    });
            });

            it('should save snapshot url - retrieve latest snapshot', function (done) {
                logger.info('beginning test [save snapshot url]');

                var mockIsLatest = true;
                var mockSnapshotUrl = '/deploy/public/' + projectId + '/index.html';

                function verify(result) {
                    logger.info('verification of result json [save snapshot url]');
                    expect(result.deepLinks).to.have.length(mockAppMetadata.pages.length);
                    expect(result.deepLinks[0].pageName).to.equal(mockAppMetadata.pages[0].name);
                    expect(result.deepLinks[0].thumbnail).to.equal('/deploy/public/' + projectId + '/' + mockAppMetadata.pages[0].thumbnailUrl);
                    expect(result.deepLinks[0].pageUrl).to.equal('/deploy/public/' + projectId + '/' + mockAppMetadata.pages[0].pageUrl);
                    expect(result.deepLinks[1].pageName).to.equal(mockAppMetadata.pages[1].name);
                    expect(result.deepLinks[1].thumbnail).to.equal('/deploy/public/' + projectId + '/' + mockAppMetadata.pages[1].thumbnailUrl);
                    expect(result.deepLinks[1].pageUrl).to.equal('/deploy/public/' + projectId + '/' + mockAppMetadata.pages[1].pageUrl);
                    var firstPageUrl = '/deploy/public/' + projectId + '/' + mockAppMetadata.pages[0].pageUrl;
                    var snapshotUrl = firstPageUrl.replace('/1/', '/latest/');
                    expect(result.finalSnapshotUrl).to.equal(snapshotUrl);
                    expect(result.snapshotUILang).to.equal(mockSnapshotUILang);
                    logger.info('finishing test [save snapshot url]');
                    done();
                }

                snapshotService.saveSnapshotUrl(projectId, 1, mockSnapshotUrl, mockIsLatest).then(function (result) {
                    setTimeout(function () {
                        verify(result);
                    }, 0);
                });

            });


            it('should save snapshot url - retrieve specific snapshot version', function (done) {
                logger.info('beginning test [save snapshot url]');

                var mockIsLatest = false;
                var mockSnapshotUrl = '/deploy/public/' + projectId + '/index.html';

                function verify(result) {
                    logger.info('verification of result json [save snapshot url]');
                    expect(result.deepLinks).to.have.length(mockAppMetadata.pages.length);
                    expect(result.deepLinks[0].pageName).to.equal(mockAppMetadata.pages[0].name);
                    expect(result.deepLinks[0].thumbnail).to.equal('/deploy/public/' + projectId + '/' + mockAppMetadata.pages[0].thumbnailUrl);
                    expect(result.deepLinks[0].pageUrl).to.equal('/deploy/public/' + projectId + '/' + mockAppMetadata.pages[0].pageUrl);
                    expect(result.deepLinks[1].pageName).to.equal(mockAppMetadata.pages[1].name);
                    expect(result.deepLinks[1].thumbnail).to.equal('/deploy/public/' + projectId + '/' + mockAppMetadata.pages[1].thumbnailUrl);
                    expect(result.deepLinks[1].pageUrl).to.equal('/deploy/public/' + projectId + '/' + mockAppMetadata.pages[1].pageUrl);
                    var firstPageUrl = '/deploy/public/' + projectId + '/' + mockAppMetadata.pages[0].pageUrl;
                    expect(result.finalSnapshotUrl).to.equal(firstPageUrl);
                    expect(result.snapshotUILang).to.equal(mockSnapshotUILang);
                    logger.info('finishing test [save snapshot url]');
                    done();
                }

                snapshotService.saveSnapshotUrl(projectId, 1, mockSnapshotUrl, mockIsLatest).then(function (result) {
                    setTimeout(function () {
                        verify(result);
                    }, 0);
                });


            });

        });

    });

    describe('SnapshotService failure scenarios', function () {
        this.timeout(15000);
        beforeEach(function (done) {
            var registry = commonServer.registry;
            // mocking calls to SharedWorkspace & Registry to fetch SharedWorkspace services
            registryStub = sinon.stub(registry, 'getModule');
            registryStub.withArgs('PrototypeService').returns(PrototypeServiceMockFailure);
            registryStub.withArgs('ArtifactService').returns(ArtifactServiceMockFailure);
            var SnapshotService = require('../../lib/services/snapshot');
            snapshotService = new SnapshotService();
            done();
        });

        afterEach(function (done) {
            registryStub.restore();
            done();
        });


        it('get snapshots should fail with error message', function (done) {
            if (skipTests) {
                logger.info('skipping [get snapshots failure]');
                return done();
            }

            logger.info('beginning test [get snapshots failure]');

            snapshotService.getSnapshots(projectId)
                .then(function (success) {
                    expect(success).to.be.equal(undefined);
                }, function (error) {
                    expect(error).to.be.equal(new NormanError(commonMessage.error.SWE026 + err, 'SWE026'));
                });
            logger.info('finished [get snapshots failure]');
            return done();
        });

        it('create snapshot should fail with error message', function (done) {
            logger.info('beginning test [create snapshot failure]');

            snapshotService.createSnapshot(projectId, 'test snapshot description', mockUserId)
                .then(function (success) {
                    expect(success).to.be.equal(undefined);
                }, function (error) {
                    expect(error).to.be.equal(new NormanError(commonMessage.error.SWE010 + err, 'SWE010'));
                });
            logger.info('finished [create snapshot failure]');
            return done();
        });

        it('should save snapshot url should fail with error message', function (done) {
            logger.info('beginning test [save snapshot url failure]');

            var mockIsLatest = true;
            var mockSnapshotUrl = '/deploy/public/' + projectId + '/index.html';

            snapshotService.saveSnapshotUrl(projectId, 1, mockSnapshotUrl, mockIsLatest)
                .then(function (success) {
                    expect(success).to.be.equal(undefined);
                }, function (error) {
                    expect(error).to.be.equal(new NormanError(commonMessage.error.SWE021 + err, 'SWE021'));
                });
            logger.info('finished [save snapshot url failure]');
            return done();
        });

        it('should get artifact for snapshot fail with error message', function (done) {
            logger.info('beginning test [get artifact for snapshot failure]');

            snapshotService.getArtifactForSnapshot(projectId, 2, 'test.html')
                .then(function (success) {
                    expect(success).to.be.equal(undefined);
                }, function (error) {
                    expect(error).to.be.equal(new NormanError(commonMessage.error.SWE020 + err, 'SWE020'));
                });
            logger.info('finished [get artifact for snapshot failure]');
            return done();
        });

    });

});
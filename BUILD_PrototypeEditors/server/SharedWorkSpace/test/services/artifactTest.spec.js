'use strict';

var chai = require("norman-testing-tp").chai;
var sinon = require("norman-testing-tp").sinon;
var Promise = require("norman-promise");
var ArtifactService,
    artifactService;
var artifactModel;
var Promise = require('norman-promise');
var expect = chai.expect;
var commonServer = require("norman-common-server");
var tp = commonServer.tp,
    _ = tp.lodash;
var Grid = require('gridfs-stream');
var NormanError = commonServer.NormanError;
var commonServerRegistry = commonServer.registry;
var mongoose = commonServer.db.mongoose;
var mongo = commonServer.db.mongoose.mongo;
var Logger = commonServer.logging;
var connection = commonServer.db.connection;
var stream = tp.streamifier;
var serviceName = 'Module';
var loggerStub, cSRegistryGetModule, cSConnectionGetDb;
var projectId = '3bfa96ceb7b88f600a26495c';
var testSinon = sinon.sandbox.create();
var failedError = new NormanError('upload of single file failed');


var mockfile1 = {
    '_id': 'fileid',
    'path': 'path1',
    filename: 'file1',
    'contentType': 'xml',
    'metadata': {
        'path': 'view/file1.path',
        'projectId': '3bfa96ceb7b88f600a26495d',
        'testValue': 'true'
    }
};

var mockfile2 = {
    '_id': 'fileid2',
    'path': 'path2',
    filename: 'file2',
    'contentType': 'xml',
    'metadata': {
        'path': 'view/file2.path',
        'projectId': '3bfa96ceb7b88f600a26495c',
        'testValue': 'true'
    }
};


var mockfile3 = {
    '_id': 'fileid3',
    'path': 'path3',
    filename: 'file3',
    'contentType': 'xml',
    'metadata': {
        'path': 'view/file3.path',
        'projectId': '3bfa96ceb7b88f600a26495e',
        'testValue': 'true'
    }
};

var mockfile4 = {
    '_id': 'fileid4',
    'path': 'path4',
    filename: 'file4',
    'contentType': 'xml',
    'metadata': {
        'path': 'view/file4.path',
        'projectId': '3bfa96ceb7b88f600a26495d',
        'testValue': 'true'
    }
};


var artifactServiceMock = {
    getArtifactByMetadata: function (search) {
        if ((search) && (search.metadata.path === mockfile2.path)) {
            return failedError;
        } else {
            console.log(search);
        }
    },
    uploadArtifacts: function (projectId, files) {
        return Promise.resolve([{
            'filename': 'sampleFile',
            'metadata.path': 'path',
            '_id': '0397820d2eccf02f0999a074'
        }
        ]);
    }
};


var serviceLoggerMock = {
    error: function (error) {
        return error;
    },
    info: function (info) {

    },
    debug: function (log) {

    }
};




describe('Artifact Service', function () {

    var artifactModelMock = {
        create: function () {
            return {
                Prototype: {},
                Version: {}
            }
        },
        createIndexes: function (done) {
            done();
        },
        ensureIndexes: function () {

        },
        exec: function (done) {
            done();
        },
        find: function (done) {
            done();
        },
        sort: function (done) {
            done();
        },
        remove: function (done) {
            done();
        },
        lean: function (done) {
            done();
        },
        findById: function (done) {
            done();
        },
        update: function (done) {
            done();
        }
    };

    var mongooseCreateStub = testSinon.stub(mongoose, 'createModel');
    mongooseCreateStub.withArgs('Grid').returns(artifactModelMock);


    before(function (done) {
        cSRegistryGetModule = testSinon.stub(commonServerRegistry, 'getModule');
        cSConnectionGetDb = testSinon.stub(connection, 'getDb');
        cSRegistryGetModule.withArgs('ArtifactService').returns(artifactServiceMock);
        cSConnectionGetDb.withArgs('norman-shared-workspace-server').returns({
            collection: function (name) {

            }
        });

        loggerStub = testSinon.stub(Logger, 'createLogger').returns(serviceLoggerMock);
        ArtifactService = require("../../lib/services/artifact");
        artifactModel = require("../../lib/services/artifact/model");
        artifactService = new ArtifactService();
        done();
    });

    after(function (done) {
        testSinon.restore();
        done();
    });

    describe('Artifact Model Check', function () {
        var func = testSinon.spy();
        it('createModel', function (done) {
            var returnVal = artifactModel.create();
            expect(returnVal).to.be.equal(artifactModelMock);
            done();
        });
        it('createIndexes', function (done) {
            artifactModel.createIndexes(func);
            expect(func.called).to.be.true;
            done();
        });
        it('destroy', function (done) {
            artifactModel.destroy(func);
            expect(func.called).to.be.true;
            done();
        });
    });

    describe('ArtifactService : lifecycle methods check', function () {

        var func = testSinon.spy();
        //before
        before(function (done) {
            done();
        });

        //after
        after(function (done) {
            func.reset();
            done();
        });

        //life cycle methods
        it('initialize', function (done) {
            artifactService.initialize(func);
            expect(func.called).to.be.true;
            done();
        });
        it('checkSchema', function (done) {
            artifactService.checkSchema(func);
            expect(func.called).to.be.true;
            done();
        });
        it('shutdown', function (done) {
            artifactService.shutdown(func);
            expect(func.called).to.be.true;
            done();
        });
        it('onInitialized', function (done) {
            artifactService.onInitialized(func);
            expect(func.called).to.be.true;
            done();
        });
    });


    describe('Artifact Service : Core Functions Check', function (done) {

        var func = testSinon.spy(),
            gridModelFindStub,
            gModelFindByIdStub,
            gModelUpdateStub,
            gridWrtStreamStub,
            gridReadStreamStub,
            gridRemoveStub;

        var fileArray = [mockfile1, mockfile2];
        var fileArrayFailure = [mockfile3];

        var writeStreamMock = {
            on: function (val, callback) {
                if (val === 'close') {
                    return callback(mockfile1);
                } else if (val === 'error') {
                    return callback({});
                }
            }
        };

        var readStreamMock = {
            pipe: function (val) {
                return val;
            },
            on: function (val) {
                return mockfile1;
            }
        };

        var readStreamMockPipeSuccess = {
            pipe: function (val) {
                return this;
            },
            on: function (val) {
                return this;
            }
        };

        var readStreamMockFailure = {
            on: function (val, callback) {
                if (val === 'error') {
                    return callback(this);
                }
            },
            pipe: function (val) {
                return;
            }
        };

        var readStreamMockFailure2 = {
            on: function (val, callback) {
                if (val === 'error') {
                    return callback(failedError);
                }
            }
        };


        var writeStreamMockSuccess = {
            on: function (val, callback) {
                if (val === 'close') {
                    return callback(mockfile1);
                } else if (val === 'error') {
                    return callback({});
                }
            }
        };

        var writeStreamArgsSuccess = {
            filename: mockfile1.filename,
            mode: 'w',
            content_type: mockfile1.contentType,
            metadata: mockfile1.metadata,
            root: 'artifacts'
        };


        var gridModelMock = {
            collection: function (name) {

            },
            find: function (val) {
                return this;
            },
            sort: function (value) {
                return this;
            },
            lean: function () {
                return this;
            },
            exec: function (result) {
                if (mockfile2.path == result) {
                    result(failedError);
                } else {
                    result(null, [mockfile1]);
                }
            },
            remove: function (result) {
                return result;
            },
            findById: function (id) {
                return this;

            }
        };

        var gridModelMockExecFailure1 = {
            sort: function (value) {
                return this;
            },
            lean: function () {
                return this;
            },
            exec: function (result) {
                result(failedError);
            },
            findById: function (id) {
                return this;
            }
        };


        var gridModelMockExecFailure2 = {
            sort: function (value) {
                return this;
            },
            lean: function () {
                return this;
            },
            exec: function (result) {
                result(null, [mockfile3]);
            }
        };

        var gridModelMockSuccess2 = {
            sort: function (value) {
                return this;
            },
            lean: function () {
                return this;
            },
            exec: function (result) {
                result(null, mockfile4);
            },
            findById: function (id) {
                return this;
            }
        };

        var gridModelMockEmptyFile = {
            sort: function (value) {
                return this;
            },
            lean: function () {
                return this;
            },
            exec: function (result) {
                result(null, []);
            },
            findById: function (id) {
                return this;
            }
        };

        //***************************************/
        //*  Stub all required methods          */
        //***************************************/

        before(function (done) {
            //need to initialize the instance !
            artifactService.initialize(func);
            //stub model methods
            gridModelFindStub = testSinon.stub(artifactService.gridModel, 'find');
            gridModelFindStub.withArgs(mockfile1.metadata).returns(gridModelMock);
            gridModelFindStub.withArgs(mockfile2.metadata).returns(gridModelMockExecFailure1);
            gridModelFindStub.withArgs(mockfile3.metadata).returns(gridModelMockExecFailure2);
            gridModelFindStub.withArgs({
                'metadata.projectId': mockfile1.metadata.projectId,
                'metadata.path': mockfile1.metadata.path,
                'metadata.testValue': mockfile1.metadata.testValue
            }).returns(gridModelMock);
            gridModelFindStub.withArgs({
                'metadata.projectId': mockfile2.metadata.projectId,
                'metadata.path': mockfile2.metadata.path,
                'metadata.testValue': mockfile2.metadata.testValue
            }).returns(gridModelMock);
            gridModelFindStub.withArgs({
                'metadata.projectId': mockfile3.metadata.projectId,
                'metadata.path': mockfile3.metadata.path,
                'metadata.testValue': mockfile3.metadata.testValue
            }).returns(gridModelMockExecFailure1);


            gridModelFindStub.withArgs({
                'metadata.projectId': mockfile1.metadata.projectId,
                'metadata.path': mockfile1.path,
                'metadata.snapshotVersion': {$exists : false}
            }).returns(gridModelMock);

            gridModelFindStub.withArgs({
                'metadata.projectId': mockfile4.metadata.projectId,
                'metadata.path': mockfile4.path,
                'metadata.snapshotVersion': {$exists : false}
            }).returns(gridModelMockEmptyFile);

            gridModelFindStub.withArgs({'metadata.projectId': mockfile1.metadata.projectId}).returns(gridModelMock);
            gridModelFindStub.withArgs({'metadata.projectId': mockfile2.metadata.projectId}).returns(gridModelMockExecFailure1);
            gridModelFindStub.withArgs({'metadata.projectId': mockfile3.metadata.projectId}).returns(gridModelMockExecFailure2);
            gridModelFindStub.withArgs({
                'metadata.projectId': mockfile3.metadata.projectId,
                'metadata.path': mockfile3.path,
                'metadata.snapshotVersion': {$exists : false}
            }).returns(gridModelMockExecFailure1);

            //stub gridModel.findById
            gModelFindByIdStub = testSinon.stub(artifactService.gridModel, 'findById');
            gModelFindByIdStub.withArgs(mockfile1._id).returns(gridModelMock.findById());
            gModelFindByIdStub.withArgs(mockfile4._id).returns(gridModelMockSuccess2.findById());
            gModelFindByIdStub.withArgs(mockfile3._id).returns(gridModelMockExecFailure1.findById());

            //stub gridModel.update()
            gModelUpdateStub = testSinon.stub(artifactService.gridModel, 'update').returns(mockfile1);
            gModelUpdateStub.withArgs({_id: {$in: mockfile1._id}}, mockfile1.metadata, {multi: true}).yields(null, mockfile1);
            gModelUpdateStub.withArgs({_id: {$in: mockfile3._id}}, mockfile3.metadata, {multi: true}).yields(failedError);

            //stub grid.createWriteStream()
            gridWrtStreamStub = testSinon.stub(artifactService.grid, 'createWriteStream').returns(writeStreamMock);
            gridWrtStreamStub.withArgs(writeStreamArgsSuccess).returns(writeStreamMockSuccess);

            //stub grid.createReadStream()
            gridReadStreamStub = testSinon.stub(artifactService.grid, 'createReadStream');
            gridReadStreamStub.withArgs({_id: mockfile1._id, root: 'artifacts'}).returns(readStreamMock);
            gridReadStreamStub.withArgs({_id: mockfile4._id, root: 'artifacts'}).returns(readStreamMockPipeSuccess);
            gridReadStreamStub.withArgs({_id: mockfile3._id, root: 'artifacts'}).returns(readStreamMockFailure);
            gridReadStreamStub.withArgs({_id: mockfile2._id, root: 'artifacts'}).returns(readStreamMockFailure2);

            //stub grid.remove()
            gridRemoveStub = testSinon.stub(artifactService.grid, 'remove');
            gridRemoveStub.withArgs({
                _id: mockfile1._id,
                root: 'artifacts'
            }).yields(null);

            gridRemoveStub.withArgs({
                _id: mockfile3._id,
                root: 'artifacts'
            }).yields(failedError);

            //stub stream.createReadStream()
            testSinon.stub(artifactService.stream, 'createReadStream').returns(readStreamMock);

            done();
        });

        //***************************************/
        //*  Restore all Stubbed methods        */
        //***************************************/

        after(function (done) {
            testSinon.restore();
            done();
        });


        //***************************************/
        //*  Let the tests begin !              */
        //***************************************/

        it('upload single file', function (done) {
            artifactService.uploadArtifact(mockfile1.metadata.projectId, mockfile1, true)
                .then(function (response) {
                    expect(response).to.be.equal(mockfile1);
                    done();
                });
        });

        it('upload single file : fail to upload', function (done) {
            artifactService.uploadArtifact(mockfile3.metadata.projectId, mockfile3, true)
                .then(function (response) {
                    //this cannot happen
                    expect(response).to.be.equal(undefined);
                    done();
                })
                .catch(function (err) {
                    expect(err.code).to.be.equal('SWE011');
                    done();
                });
        });

        it('upload single file - dont removeOld Id', function (done) {
            artifactService.uploadArtifact(mockfile1.metadata.projectId, mockfile1, false)
                .then(function (response) {
                    expect(response).to.be.equal(mockfile1);
                    done();
                });
        });

        it('upload single file - empty removeOld Ids', function (done) {
            artifactService.uploadArtifact(mockfile1.metadata.projectId, mockfile1, 'empty')
                .then(function (response) {
                    expect(response).to.be.equal(mockfile1);
                    done();
                });
        });

        it('upload multiple Artifacts', function (done) {
            artifactService.uploadArtifacts(projectId, fileArray, true)
                .then(function (responseArray) {
                    expect(responseArray[0]).to.be.equal(mockfile1);
                    expect(responseArray[1]).to.be.equal(mockfile1);
                    done();
                });
        });

        it('upload multiple Artifacts - failed to upload', function (done) {
            artifactService.uploadArtifacts(projectId, fileArrayFailure, true)
                .then(function (responseArray) {
                    //this cannot happen
                    expect(responseArray).to.be.equal(undefined);
                    done();
                })
                .catch(function (err) {
                    expect(err.code).to.be.equal('SWE012');
                    done();
                });
        });


        it('get artifact : single file', function (done) {
            artifactService.getArtifact(mockfile1._id)
                .then(function (response) {
                    expect(response[0]).to.be.equal(mockfile1);
                    done();
                });
        });

        it('get artifact : failed to find', function (done) {
            artifactService.getArtifact(mockfile3._id)
                .then(function (response) {
                    expect(response).to.be.equal(undefined);
                    done();
                }).catch(function (err) {
                    expect(err.code).to.be.equal('SWE013');
                    done();
                });
        });

        it('get artifact stream by Id', function (done) {
            artifactService.getArtifactReadStream(mockfile1._id)
                .then(function (response) {
                    expect(response).to.be.equal(mockfile1);
                    done();
                });
        });

        it('get artifact stream by Id - failure', function (done) {
            artifactService.getArtifactReadStream(mockfile2._id)
                .then(function (response) {
                    expect(response).to.be.equal(undefined);
                    done();
                }).catch(function (err) {
                    expect(err.code).to.be.equal('SWE014');
                    done();
                });
        });


        it('get artifact by path', function (done) {
            artifactService.getArtifactByPath(mockfile1.metadata.projectId, mockfile1.path)
                .then(function (response) {
                    expect(response.contentType).to.be.equal(mockfile1.contentType);
                    expect(response.filename).to.be.equal(mockfile1.filename);
                    done();
                });
        });

        it('get artifact by path : failed to find', function (done) {
            artifactService.getArtifactByPath(mockfile3.metadata.projectId, mockfile3.path)
                .then(function (response) {
                    expect(response).to.be.equal(undefined);
                    done();
                })
                .catch(function (err) {
                    expect(err.code).to.be.equal('SWE018');
                    done()
                });
        });


        it('get artifact by path : found empty artifact', function (done) {
            artifactService.getArtifactByPath(mockfile4.metadata.projectId, mockfile4.path)
                .then(function (response) {
                    expect(response).to.be.equal(null);
                    done();
                })
                .catch(function (err) {
                    //this cannot happen
                    expect(err).to.be.equal(undefined);
                    done()
                });
        });


        it('get artifact by projectId', function (done) {
            artifactService.getArtifactByProjectId(mockfile1.metadata.projectId)
                .then(function (response) {
                    expect(response[0]).to.be.equal(mockfile1);
                    done();
                });
        });

        it('get artifact by projectId : failed to find', function (done) {
            artifactService.getArtifactByProjectId(mockfile2.metadata.projectId)
                .then(function (response) {
                    expect(response).to.be.equal(undefined);
                    done();
                })
                .catch(function (err) {
                    expect(err.code).to.be.equal('SWE018');
                    done()
                });
        });

        it('remove artifact by metadata', function (done) {
            artifactService.removeArtifactByMetadata(mockfile1.metadata)
                .then(function (response) {
                    expect(response).to.be.equal('OK');
                    done();
                });
        });

        it('remove artifact by metadata : cannot find artifact to remove ', function (done) {
            artifactService.removeArtifactByMetadata(mockfile2.metadata)
                .then(function (response) {
                    //this cannot have response
                    expect(response).to.be.equal(undefined);
                    done();
                }).catch(function (err) {
                    expect(err.code).to.be.equal('SWE013');
                    done();
                });
        });

        it('remove artifact by metadata : found artifact but couldnot remove it ', function (done) {
            artifactService.removeArtifactByMetadata(mockfile3.metadata)
                .then(function (response) {
                    //this cannot have response
                    expect(response).to.be.equal(undefined);
                    done();
                })
                .catch(function (err) {
                    expect(err.code).to.be.equal('SWE015');
                    done();
                });
        });

        it('remove artifact by projectId ', function (done) {
            artifactService.removeArtifactByProjectID(mockfile1.metadata.projectId)
                .then(function (response) {
                    //this cannot have response
                    expect(response).to.be.equal('OK');
                    done();
                })
                .catch(function (err) {
                    //this cannot happen
                    expect(err).to.be.equal(undefined);
                    done();
                });
        });

        it('remove artifact by project Id : found artifact(s) but couldnot remove it ', function (done) {
            artifactService.removeArtifactByProjectID(mockfile3.metadata.projectId)
                .then(function (response) {
                    //this cannot have response
                    expect(response).to.be.equal(undefined);
                    done();
                })
                .catch(function (err) {
                    expect(err.code).to.be.equal('SWE017');
                    done();
                });
        });

        it('remove artifact by Id', function (done) {
            artifactService.removeArtifactById(mockfile1._id)
                .then(function (response) {
                    expect(response).to.be.equal('OK');
                    done();
                });
        });

        it('copy artifacts', function (done) {
            artifactService.copyArtifacts(mockfile4)
                .then(function (response) {
                    expect(response).to.be.equal(mockfile1);
                    done();
                });
        });

        it('get artifacts and readStream', function (done) {
            artifactService.getArtifactAndReadStream(mockfile4._id)
                .then(function (response) {
                    expect(response.filename).to.be.equal(mockfile4.filename);
                    expect(response.contentType).to.be.equal(mockfile4.contentType);
                    done();
                });
        });


        it('get artifacts and readStream - failed to find artifact', function (done) {
            artifactService.getArtifactAndReadStream(mockfile3._id)
                .then(function (response) {
                    expect(response).to.be.equal(undefined);
                    done();
                }).catch(function (err) {
                    expect(err.code).to.be.equal('SWE013');
                    done();
                });
        });

        it('updateMetadata', function (done) {
            artifactService.updateMetadata(mockfile1._id, mockfile1.metadata)
                .then(function (response) {
                    expect(response).to.be.equal(mockfile1);
                    done();
                });
        });

        it('updateMetadata: failed to update', function (done) {
            artifactService.updateMetadata(mockfile3._id, mockfile3.metadata)
                .then(function (response) {
                    expect(response).to.be.equal(undefined);
                    done();
                })
                .catch(function (err) {
                    expect(err.code).to.be.equal('SWE013');
                    done();
                });
        });


    });

});

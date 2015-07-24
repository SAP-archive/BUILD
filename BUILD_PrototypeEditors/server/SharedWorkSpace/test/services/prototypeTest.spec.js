'use strict';

var chai = require("norman-testing-tp").chai;
var sinon = require("norman-testing-tp").sinon;
var Promise = require("norman-promise");
var PrototypeService,
    prototypeService;
var expect = chai.expect;
var commonServer = require("norman-common-server");
var tp = commonServer.tp,
    _ = tp.lodash;
var NormanError = commonServer.NormanError;
var commonServerRegistry = commonServer.registry;
var mongoose = commonServer.db.mongoose;
var mongoose1 = commonServer.db.mongoose;
var mongo = commonServer.db.mongoose.mongo;
var Logger = commonServer.logging;
var connection = commonServer.db.connection;
var loggerStub, cSRegistryGetModule, cSConnectionGetDb;
var projectId = '3bfa96ceb7b88f600a26495c';
var failedError = new NormanError('upload of single file failed');
var createBy = 'Testuser';
var testSinon = sinon.sandbox.create();
var createIndex;

var thumbnail1 = {
    buffer: 'some file text'
};
var thumbnail2 = {
    buffer: 'some file text'
};

var thumbnails = [thumbnail1, thumbnail2];

var serviceLoggerMock = {
    error: function (error) {
        return error;
    },
    info: function (info) {

    },
    debug: function (log) {

    }
};

var prototypeMock = {
    '_id': 'f4fca45b940781ae0a2fbf47',
    'projectId': '3205809856f3f4280a2fbef0',
    'deleted': false,
    'versions': [
        {
            '_id': '556cec18795c0bc062fddce1',
            'version': 1,
            'appMetadata': 'fa674be44e8f3a550a2fbf20',
            'stats': {
                'created_by': '556ce4f6a7c85ba34e492adf',
                'created_at': '2015-06-01T23:34:48.118Z'
            },
            'artifacts': [
                {
                    'filename': 'S0.png',
                    'path': 'resources/thumbnail/S0.png',
                    'id': '556cec19795c0bc062fddce2',
                    '_id': '556cec37795c0bc062fddce7'
                },
                {
                    'filename': 'S1.png',
                    'path': 'resources/thumbnail/S1.png',
                    'id': '556cec1a795c0bc062fddce3',
                    '_id': '556cec37795c0bc062fddce8'
                }
            ],
            'sampleMetadata': [
                '556cebe3795c0bc062fddccc'
            ],
            'dataModelMetadata': [
                '556cebe3795c0bc062fddccd'
            ],
            'pageMetadata': [
                'ad9cb2c4151b19f70a2fbf0f',
                'e480c744412d1c110a2fbf16'
            ],
            'snapshot': {
                'deepLinks': []
            },
            'isInvalid': false,
            'isHistory': false,
            'isSnapshot': false
        }
    ]
};


var artifactServiceMock = {
    uploadArtifacts: function (projectId, files) {
        return Promise.resolve([{
            'filename': 'sampleFile',
            'metadata': {
                'path': 'path'
            },
            '_id': '0397820d2eccf02f0999a074'
        }
        ]);
    }
};

var prototypeServiceMock = {
    updateTimeInLock: function (projectId) {
        return Promise.resolve();
    }
};

var objDataMock = {
    '_id': 'SavedObj'
};

var appMetadataMock = function () {

};

appMetadataMock.prototype.save = function (func) {
    return func(null, objDataMock);
};

var pageMetadataMock = function () {

};

pageMetadataMock.prototype.save = function (func) {
    return func(null, objDataMock);
};

var dataModelMetadataMock = function () {

};

dataModelMetadataMock.prototype.save = function (func) {
    return func(null, objDataMock);
};

var sampleMetadataMock = function () {

};

sampleMetadataMock.prototype.save = function (func) {
    return func(null, objDataMock);
};

var metadataModelArray = [];

metadataModelArray.push({
    model: new appMetadataMock(),
    OP: 'CREATE',
    type: 'appMetadata'
});

metadataModelArray.push({
    model: new pageMetadataMock(),
    OP: 'CREATE',
    type: 'pageMetadata'
});

var versionObjectMock = function () {
    this.version = '';
    this.isSnapshot = '';
    this.isHistory = '';
    this.isInvalid = '';
    this.snapshot = {
        version: '',
        snapshotDesc: '',
        snapshotUrl: '',
        snapshotUILang: '',
        isSmartApp: '',
        deepLinks: [],
        stats: {
            created_at: '',   // explicitly needs to be updated
            created_by: ''
        }
    };
    this.appMetadata = '';
    this.userResearchHeader = '';
    this.pageMetadata = [];
    this.dataModelMetadata = [];
    this.sampleMetadata = [];
    this.artifacts = [];
    this.stats = {
        created_at: '',
        created_by: ''
    };
};

var protoTypeObjectMock = function () {
    this.projectId = '';
    this.versions = [];
    this.deleted = '';
    this.save = function (func) {
        func(null);
    };
};

protoTypeObjectMock.findOne = function () {
};

protoTypeObjectMock.findByIdAndUpdate = function () {

};


var prototypeLockObjectMock = function () {
    this.projectId = '';
    this.lastModifedAt = '';
    this.sessionHashId = '';
    this.userId = '';
};


describe('Prototype Service', function () {
    var prototypeModel;
    var versionModel;
    var prototypeLockModel;

    before(function (done) {
        testSinon.stub(mongoose, 'createModel', function (arg1, arg2) {
            var model;
            if (arg1 === 'prototype') {
                prototypeModel = protoTypeObjectMock;
                model = protoTypeObjectMock;
            }
            else if (arg1 === 'version') {
                versionModel = versionObjectMock;
                model = versionObjectMock;
            }
            else {
                prototypeLockModel = prototypeLockObjectMock;
                model = prototypeLockObjectMock;
            }
            return model;
        });
        testSinon.stub(mongoose, 'model', function (arg1, arg2) {
            var model;
            if (arg1 === 'appMetadata') {
                model = appMetadataMock;
            }
            else if (arg1 === 'pageMetadata') {
                model = pageMetadataMock;
            }
            else if (arg1 === 'dataModelMetadata') {
                model = dataModelMetadataMock;
            }
            else {
                model = sampleMetadataMock;
            }
            return model;
        });
        cSRegistryGetModule = testSinon.stub(commonServerRegistry, 'getModule');
        cSConnectionGetDb = testSinon.stub(connection, 'getDb');
        cSRegistryGetModule.withArgs('ArtifactService').returns(artifactServiceMock);
        cSRegistryGetModule.withArgs('PrototypeService').returns(prototypeServiceMock);
        cSConnectionGetDb.withArgs('norman-prototype-editors-test-shared-workspace').returns({
            collection: function (name) {

            }
        });
        loggerStub = testSinon.stub(Logger, 'createLogger').returns(serviceLoggerMock);
        PrototypeService = require("../../lib/services/prototype");
        prototypeService = new PrototypeService();
        done();
    });

    after(function (done) {
        testSinon.restore();
        done();
    });


    describe('Prototype Service : Core Functions Check', function (done) {

        //***************************************/
        //*  Stub all required methods          */
        //***************************************/

        before(function (done) {
            var mockDone = function () {

            };
            var PrototypeModel = require('../../lib/services/prototype/model');
            createIndex = sinon.stub(PrototypeModel, 'createIndexes').returns();
            prototypeService.initialize(mockDone);
            prototypeService.onInitialized(mockDone);
            prototypeService.checkSchema(mockDone);
            expect(createIndex.called).to.be.true;
            done();
        });

        //***************************************/
        //*  Restore all Stubbed methods        */
        //***************************************/

        after(function (done) {
            var mockDone = function () {

            };
            prototypeService.shutdown(mockDone);
            testSinon.restore();
            createIndex.restore();
            done();
        });



        //***************************************/
        //*  Let the tests begin !              */
        //***************************************/

        it('processPrototype - createPrototype', function (done) {
            //uncomment below - its a place holder

            var fineOneStub = testSinon.stub(prototypeModel, 'findOne', function (input, func) {
                return func(null, null);
            });

            prototypeService.processPrototype(projectId, metadataModelArray, createBy, thumbnails)
                .then(function (response) {
                    //need to check!
                    expect(response.status).to.equal('OK');
                    fineOneStub.restore();
                    done();
                });
        });

        it('processPrototype - updatePrototype', function (done) {
            //uncomment below - its a place holder

            var fineOneStub = testSinon.stub(prototypeModel, 'findOne', function (input, func) {
                return func(null, prototypeMock);
            });

            var findByIdAndUpdateStub = testSinon.stub(prototypeModel, 'findByIdAndUpdate', function (input, push, opt1, func) {
                prototypeMock.versions.push(push.$push.versions);
                return func(null, prototypeMock);
            });

            var updateLockSpy = sinon.spy(prototypeServiceMock, 'updateTimeInLock');


            prototypeService.processPrototype(projectId, metadataModelArray, createBy, thumbnails)
                .then(function (response) {
                    //need to check!
                    expect(response.status).to.equal('OK');
                    fineOneStub.restore();
                    findByIdAndUpdateStub.restore();
                    expect(updateLockSpy.calledOnce).to.be.equal(true);
                    done();
                });
        });


        it('create prototype', function (done) {
            //uncomment below - its a place holder
            //prototypeService.createPrototype(projectId, metadataModelArray, createBy,thumbnails)
            //    .then(function (response) {
            //        //need to check!
            //        done();
            //    });
            done();
        });

        it('get prototype', function (done) {
            //uncomment below - its a place holder
            //prototypeService.getPrototype(projectId)
            //    .then(function (response) {
            //        //need to check!
            //        done();
            //    });
            done();
        });


        it('get metadata', function (done) {
            //uncomment below - its a place holder
            //prototypeService.getMetadata(projectId)
            //    .then(function (response) {
            //        //need to check!
            //        done();
            //    });
            done();
        });

        it('do metadata', function (done) {
            //uncomment below - its a place holder
            //prototypeService.doMetadata(projectId)
            //    .then(function (response) {
            //        //need to check!
            //        done();
            //    });
            done();
        });


        it('Prototype getVersionsbyMatchingProperty', function (done) {
            //uncomment below - its a place holder
            //prototypeService.getVersionsbyMatchingProperty(projectId)
            //    .then(function (response) {
            //        //need to check!
            //        done();
            //    });
            done();
        });

        it('invalidatePrototypeVersion', function (done) {
            ////uncomment below - its a place holder
            //prototypeService.invalidatePrototypeVersion(projectId)
            //    .then(function (response) {
            //        //need to check!
            //        done();
            //    });
            done();
        });

        it('createLock', function (done) {
            //prototypeService.createLock(projectId)
            //    .then(function (response) {
            //        //need to check!
            //        done();
            //    });
            done();
        });

        it('checkLock', function (done) {
            //uncomment below - its a place holder
            //prototypeService.checkLock(projectId)
            //    .then(function (response) {
            //        //need to check!
            //        done();
            //    });
            done();
        });

        it('deleteLock', function (done) {
            //uncomment below - its a place holder
            //prototypeService.deleteLock(projectId)
            //    .then(function (response) {
            //        //need to check!
            //        done();
            //    });
            done();
        });

        it('updateTimeInLock', function (done) {
            //uncomment below - its a place holder
            //prototypeService.updateTimeInLock(projectId)
            //    .then(function (response) {
            //        //need to check!
            //        done();
            //    });
            done();
        });


        it('canProcessProject', function (done) {
            //uncomment below - its a place holder
            //prototypeService.canProcessProject(projectId)
            //    .then(function (response) {
            //        //need to check!
            //        done();
            //    });
            done();
        });

    });

});

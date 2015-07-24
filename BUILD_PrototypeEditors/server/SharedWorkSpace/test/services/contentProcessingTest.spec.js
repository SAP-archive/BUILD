/**
 * Created by i055023 on 5/5/15.
 */
'use strict';

var chai = require("norman-testing-tp").chai;
var sinon = require("norman-testing-tp").sinon;
var Promise = require("norman-promise");
var commonServer = require("norman-common-server");
var NormanError = commonServer.NormanError;
var commonServerRegistry = commonServer.registry;
var mongoose = commonServer.db.mongoose;
var Logger = commonServer.logging;
var serviceLoggerMock = {
    error: function (error) {

    },
    info: function (info) {

    },
    debug: function (log) {

    }
};
var loggerStub, contentProcessingService;
var Promise = require('norman-promise');
var expect = chai.expect;

var tp = commonServer.tp,
    _ = tp.lodash;


var cSRegistryGetModule, deleteLockSpy;

var requestMock = {
    'body': {
        'createPrototype': {
            'numPages': 2
        }
    },
    buildSessionId: 'sessionId'
};


var req = {
    context: {
        session: {
            id: 'testSessionId'
        }
    },
    cookies: {
        buildSessionId: 'testSessionId'
    }
};


var prototypeServiceMock = {
    processPrototype: function (projectId, metadataArray, user, mergedfiles) {
        return Promise.resolve({
            'status': 'OK',
            'prototype': 'prototype'
        });
    },
    canProcessProject: function (projectId) {
        if (projectId === 'cannotProcessProject') {
            return Promise.resolve(false);
        } else if (projectId === 'raiseError') {
            return Promise.reject(new NormanError('mock error'));
        } else {
            return Promise.resolve(true);
        }
    },
    invalidatePrototypeVersion: function (projectId) {
        if (projectId === 'raisePostProcessError') {
            return Promise.resolve({status: 'OK'});
        } else if (projectId === 'raiseInvalidationError') {
            return Promise.resolve(null);
        } else if (projectId === 'raisePostProcessError1') {
            return Promise.reject(new NormanError('cannot invalidate - something went wrong'));
        }
    },
    deleteLock: function () {

    }
};


var registeredModuleMock = {
    processData: function (projectId) {
        if (projectId === 'raisePostProcessError') {
            return Promise.resolve({
                'metadataArray': {
                    model: 'raisePostProcessError',
                    type: 'raisePostProcessError',
                    OP: 'raisePostProcessError'
                }
            });
        } else if (projectId === 'raiseInvalidationError') {
            return Promise.resolve({
                'metadataArray': {
                    model: 'raiseInvalidationError',
                    type: 'raiseInvalidationError',
                    OP: 'raiseInvalidationError'
                }
            });
        } else if (projectId === 'raisePostProcessError1') {
            return Promise.resolve({
                'metadataArray': {
                    model: 'raisePostProcessError1',
                    type: 'raisePostProcessError1',
                    OP: 'raisePostProcessError1'
                }
            });
        }
        else {
            return Promise.resolve({
                'metadataArray': {
                    model: 'model',
                    type: 'appMetadata',
                    OP: 'CREATE'
                },
                'files': {
                    'path': 'buffer'
                }
            });
        }

    },
    postProcessData: function (response) {
        if (response) {
            if (response.metadataArray[0].model === 'raiseInvalidationError' || response.metadataArray[0].model === 'raisePostProcessError' || response.metadataArray[0].model === 'raisePostProcessError1') {
                return Promise.reject(new NormanError('failed to perform postProcessData'));
            }
        }
        else {
            return Promise.resolve('OK');
        }
    }
};


var swRegistryMock = {
    preModules: {'mod1': registeredModuleMock},
    postModules: {'mod1': registeredModuleMock},
    getModules: function (call) {
        if (call === 'pre') {
            return this.preModules;
        }
        if (call === "post") {
            return this.postModules;
        }
    },
    emptyPostModule: function () {
        this.postModules = {};
    }
};

var cProcessing;
describe('Content Processing Service', function () {
    before(function (done) {
        cSRegistryGetModule = sinon.stub(commonServerRegistry, 'getModule');
        cSRegistryGetModule.withArgs('PrototypeService').returns(prototypeServiceMock);
        cSRegistryGetModule.withArgs('SwRegistryService').returns(swRegistryMock);
        loggerStub = sinon.stub(Logger, 'createLogger').returns(serviceLoggerMock);
        contentProcessingService = require("../../lib/services/contentprocessing");
        cProcessing = new contentProcessingService();
        done();
    });

    after(function (done) {
        loggerStub.restore();
        cSRegistryGetModule.restore();
        done();
    });

    it("Should process Metadata and returns response", function (done) {
        cProcessing.processMetadata("0397820d2eccf02f0999a074", '', requestMock, 'testUser').then(function (response) {
            expect(response.metadataArray.length).to.equal(1);
            expect(response.status).to.equal('OK');
            expect(response.prototype).to.equal('prototype');
            done();
        });
    });
    it("Process Metadata: canProcessProject = false ", function (done) {
        cProcessing.processMetadata('cannotProcessProject', '', requestMock, 'testUser')
            .catch(function (error) {
                expect(error.code).to.equal('SWPRE004');
                done();
            });
    });

    it("Process Metadata: canProcessProject raised exception ", function (done) {
        cProcessing.processMetadata('raiseError', '', requestMock, 'testUser')
            .catch(function (error) {
                expect(error.code).to.equal('SWPRE001');
                done();
            });
    });

    it("Process Metadata failure scenario: invalidate Prototype Version", function (done) {
        cProcessing.processMetadata('raisePostProcessError', '', requestMock, 'testUser')
            .catch(function (error) {
                expect(error.code).to.equal('SWPRE002');
                done();
            });
    });

    it("Process Metadata failure scenario: invalidate Prototype Version: ivalidation raised exception", function (done) {
        cProcessing.processMetadata('raisePostProcessError1', '', requestMock, 'testUser')
            .catch(function (error) {
                expect(error.code).to.equal('SWPRE003');
                done();
            });
    });

    it("Process Metadata failure scenario: invalidate Prototype Version: failed invalidation", function (done) {
        cProcessing.processMetadata('raiseInvalidationError', '', requestMock, 'testUser')
            .catch(function (error) {
                expect(error.code).to.equal('SWPRE003');
                done();
            });
    });

    it("Should process Metadata and skip post Processing and returns response", function (done) {
        swRegistryMock.emptyPostModule();
        cProcessing.processMetadata("0397820d2eccf02f0999a074", '', requestMock, 'testUser').then(function (response) {
            expect(response.metadataArray.length).to.equal(1);
            expect(response.status).to.equal('OK');
            expect(response.prototype).to.equal('prototype');
            done();
        });
    });

    it("Should throw error on empty request for process Metadata", function (done) {
        after(function (done) {
            done();
        });
        cProcessing.processMetadata("0397820d2eccf02f0999a074", '', '', 'testUser').catch(function (error) {
            expect(error.message).to.equal('no data for processing');
            done();
        });
    });

    it('Should delete lock on browser close and not call on normal save', function (done) {
        after(function (done) {
            done();
        });

        deleteLockSpy = sinon.spy(prototypeServiceMock, 'deleteLock');

        requestMock.body.deleteLock = true;
        cProcessing.processMetadata("0397820d2eccf02f0999a074", '', requestMock, 'testUser').then(function () {
            expect(deleteLockSpy.calledOnce).to.be.equal(true);
            done();
        });

        requestMock.body.deleteLock = false;
        cProcessing.processMetadata("0397820d2eccf02f0999a074", '', requestMock, 'testUser').then(function () {
            expect(deleteLockSpy.calledOnce).to.be.equal(false);
            done();
        });

    });

    it('Test method: initialize', function (done) {
        var func = sinon.spy();
        cProcessing.initialize(func);
        expect(func.called).to.be.true;
        done();
    });

    it('Test method: shutdown', function (done) {
        var func = sinon.spy();
        cProcessing.shutdown(func);
        expect(func.called).to.be.true;
        done();
    });

});


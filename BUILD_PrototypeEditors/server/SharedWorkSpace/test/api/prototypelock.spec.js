(function () {
    'use strict';
    var expect = require('norman-testing-tp').chai.expect,
        commonServer = require('norman-common-server'),
        sinon = require('sinon'),
        Promise = require('norman-promise'),
        prototypeLockService,
        registryStub,
        NormanError = commonServer.NormanError,
        generalError = new NormanError('test error'),
        successData = {testStatus: 'OK'},
        Logger = commonServer.logging,
        loggerStub;

    var PrototypeServiceMock = {
        createLock: function (projectId) {
            if (projectId === 'raiseError') {
                return Promise.reject(generalError);
            } else {
                return Promise.resolve(successData);
            }
        },
        checkLock: function (projectId) {
            if (projectId === 'raiseError') {
                return Promise.reject(generalError);
            } else {
                return Promise.resolve(successData);
            }
        },
        deleteLock: function (projectId) {
            if (projectId === 'raiseError') {
                return Promise.reject(generalError);
            } else {
                return Promise.resolve(successData);
            }
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

    var mockRequest = {
        originalUrl: '/api/project/0397820d2eccf02f0999a074/prototype/lock',
        cookies: {
            buildSessionId: 'cookieSessionId'
        },
        context: {
            session: {
                id: 'testSessionId'
            }
        },
        user: {
            _id: 'testUser'
        }
    };

    var mockFailureRequest = {
        originalUrl: '/api/project/raiseError/prototype/lock',
        cookies: {
            buildSessionId: 'testSessionId'
        },
        user: {
            _id: 'testUser'
        }
    };

    var mockResponse = {
        status: function (val) {
            this.statusCode = val;
            return this;
        },
        json: function (val) {
            this.jsonVal = val;
        }
    };


    describe('PrototypeLock API Test', function () {

        this.timeout(15000);
        before(function (done) {
            var registry = commonServer.registry;
            registryStub = sinon.stub(registry, 'getModule');
            registryStub.withArgs('PrototypeService').returns(PrototypeServiceMock);
            loggerStub = sinon.stub(Logger, 'createLogger').returns(serviceLoggerMock);
            prototypeLockService = require('../../lib/api/prototypeLock/controller');
            done();
        });

        after(function (done) {
            loggerStub.restore();
            registryStub.restore();
            done();
        });


        it('prototypeLock.api createPrototypelock', function (done) {
            var spy = sinon.spy(PrototypeServiceMock, 'createLock');
            Promise.resolve(prototypeLockService.createPrototypeLock(mockRequest, mockResponse))
                .then(function () {
                    expect(mockResponse.jsonVal).to.be.equal(successData);
                    expect(mockResponse.statusCode).to.be.equal(200);
                    expect(spy.called).to.be.ok;
                    expect(spy.args[0][0]).to.be.equal('0397820d2eccf02f0999a074');
                    expect(spy.args[0][1]).to.be.equal('testSessionId');
                    done();
                });
        });

        it('prototypeLock.api createPrototypelock - failed to lock', function (done) {
            Promise.resolve(prototypeLockService.createPrototypeLock(mockFailureRequest, mockResponse))
                .then(function () {
                    expect(mockResponse.jsonVal).to.be.equal(generalError);
                    expect(mockResponse.statusCode).to.be.equal(500);
                    done();
                });
        });

        it('prototypeLock.api getPrototypeLock', function (done) {
            Promise.resolve(prototypeLockService.getPrototypeLock(mockRequest, mockResponse))
                .then(function () {
                    expect(mockResponse.jsonVal).to.be.equal(successData);
                    expect(mockResponse.statusCode).to.be.equal(200);
                    done();
                });
        });

        it('prototypeLock.api getPrototypeLock - failed to fetch', function (done) {
            Promise.resolve(prototypeLockService.getPrototypeLock(mockFailureRequest, mockResponse))
                .then(function () {
                    expect(mockResponse.jsonVal).to.be.equal(generalError);
                    expect(mockResponse.statusCode).to.be.equal(500);
                    done();
                });
        });

        it('prototypeLock.api deletePrototypeLock', function (done) {
            Promise.resolve(prototypeLockService.deletePrototypeLock(mockRequest, mockResponse))
                .then(function () {
                    expect(mockResponse.jsonVal).to.be.equal(successData);
                    expect(mockResponse.statusCode).to.be.equal(200);
                    done();
                });
        });

        it('prototypeLock.api deletePrototypeLock - failed to delete', function (done) {
            Promise.resolve(prototypeLockService.deletePrototypeLock(mockFailureRequest, mockResponse))
                .then(function () {
                    expect(mockResponse.jsonVal).to.be.equal(generalError);
                    expect(mockResponse.statusCode).to.be.equal(500);
                    done();
                });
        });

    });

})();

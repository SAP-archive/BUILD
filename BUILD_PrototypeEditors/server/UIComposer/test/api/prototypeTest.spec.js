'use strict';
(function () {
    var expect = require('norman-testing-tp').chai.expect;
    var commonServer = require('norman-common-server');
    var Promise = require('norman-promise');
    var NormanError = commonServer.NormanError;
    var sinon = require('sinon');
    var prototypeService;
    var mockMsg = {testMsg: 'Test', error: {SWE010: 'fail2', SWE011: 'Null project Id'}};
    var fakeNormanError = new NormanError('something went wrong');
    var fakeProjectidError = new NormanError('Wrong ProjectId');
    var registryStub;
    var mockProjectId = '3753aef3be2307900a3b66cc';

    var ComposerCommonServiceMock = {
        messages: mockMsg,
        shutdown: function () {
            return {};
        },
        sendResponse: function (response, status, data) {
            response.data = data;
            return response;
        },
        sendError: function (response, status, error) {
            response.status = status;
            response.error = error;
            return response;
        }
    };

    var ComposerPrototypeServiceMock = {

        createDataDrivenPrototype: function (projectId) {
            if (projectId === mockProjectId) {
                return Promise.resolve('success!');
            }
            else {
                return Promise.reject(fakeNormanError);
            }

        },
        getPrototype: function (projectId) {
            if (projectId === mockProjectId) {
                return Promise.resolve({appMetadata:'Success'});
            }
            else {
                return Promise.reject(fakeProjectidError);
            }
        },
        updatePrototype: function (projectId, req, userId) {
            if (projectId === mockProjectId) {
                return Promise.resolve('Success');
            }
            else {
                return Promise.reject(fakeProjectidError);
            }
        }

    };

    describe('prototype.api.test', function () {

        this.timeout(15000);
        before(function (done) {
            var registry = commonServer.registry;
            registryStub = sinon.stub(registry, 'getModule');
            registryStub.withArgs('composerCommonService').returns(ComposerCommonServiceMock);
            registryStub.withArgs('composerPrototypeService').returns(ComposerPrototypeServiceMock);
            prototypeService = require('../../lib/api/prototype/controller');
            done();
        });

        after(function (done) {
            registryStub.restore();
            done();
        });


        it('uicomposerServer.api.prototype createPrototypeSuccess', function (done) {
            var req;
            var mockResponse = {};
            req = {
                originalUrl: '/api/projects/' + mockProjectId + '/prototype',
                body:{applicationType: 'master-detail'},
                user:{_id: '1323'}
            };
            Promise.resolve(prototypeService.createPrototype(req, mockResponse))
                .then(function () {
                    expect(mockResponse.data).to.be.equal('success!');
                    done();
                });

        });


        it('uicomposerServer.api.prototype createPrototypeFail1', function (done) {
            var req;
            var mockResponse = {};
            req = {
                originalUrl: '/api/projects/failurecase/prototype',
                body: {applicationType: 'master-detail'},
                user: {_id: '1323'}
            };
            Promise.resolve(prototypeService.createPrototype(req, mockResponse))
                .then(function () {
                    expect(mockResponse.error).to.be.equal(fakeNormanError);
                    expect(mockResponse.status).to.be.equal(500);
                    done();
                });

        });

        it('uicomposerServer.api.prototype createPrototypeFail2', function (done) {
            var mockResponse = {};
            var req = {
                originalUrl: '/api/projects',
                body: {applicationType: 'master-detail'},
                user: {_id: '1323'}
            };
            Promise.resolve(prototypeService.createPrototype(req, mockResponse))
                .then(function () {
                    expect(mockResponse.error.message).to.be.equal(mockMsg.error.SWE010);
                    expect(mockResponse.status).to.be.equal(500);
                    done();
                });

        });


        it('uicomposerServer.api.prototype getPrototypeSuccess', function (done) {
            var req = {originalUrl : '/api/projects/' + mockProjectId + '/prototype'};
            var mockResponse = {};
            Promise.resolve(prototypeService.getPrototype(req, mockResponse)).then(function () {
                expect(mockResponse.data).to.be.equal('Success');
                done();
            });
        });


        it('uicomposerServer.api.prototype getPrototypeFailure', function (done) {
            var projectId = 'failureId';
            var req = {originalUrl:'/api/projects/' + projectId + '/prototype'};
            var mockResponse = {};
            Promise.resolve(prototypeService.getPrototype(req, mockResponse)).then(function () {
                expect(mockResponse.error).to.be.equal(fakeProjectidError);
                done();
            });
        });


        it('uicomposerServer.api.prototype getPrototypeFailure2', function (done) {
            var req = {originalUrl:'/api/projects'}; //project id is null
            var mockResponse = {};
            Promise.resolve(prototypeService.getPrototype(req, mockResponse)).then(function () {
                expect(mockResponse.status.message).to.be.equal(mockMsg.error.SWE011);
                done();
            });
        });

        it('uicomposerServer.api.prototype updatePrototypeSuccess', function (done) {
            var req = {originalUrl : '/api/projects/' + mockProjectId + '/prototype'};
            req.user = {_id: '1323'};
            req.body = { displayNames :[{
                pageName: 'S0',
                displayName: 'name1'
            }]};
            var mockResponse = {};
            Promise.resolve(prototypeService.updatePrototype(req, mockResponse)).then(function () {
                expect(mockResponse.data).to.be.equal('Success');
                done();
            });
        });


        it('uicomposerServer.api.prototype updatePrototypeFailure', function (done) {
            var projectId = 'failureId';
            var req = {originalUrl:'/api/projects/' + projectId + '/prototype'};
            req.user = {_id: '1323'};
            req.body = { displayNames :[{
                pageName: 'S0',
                displayName: 'name1'
            }]};
            var mockResponse = {};
            Promise.resolve(prototypeService.updatePrototype(req, mockResponse)).then(function () {
                expect(mockResponse.error).to.be.equal(fakeProjectidError);
                done();
            });
        });


        it('uicomposerServer.api.prototype updatePrototypeFailure2', function (done) {
            var req = {originalUrl:'/api/projects'}; //project id is null
            req.user = {_id: '1323'};
            req.body = { displayNames :[{
                pageName: 'S0',
                displayName: 'name1'
            }]};
            var mockResponse = {};
            Promise.resolve(prototypeService.updatePrototype(req, mockResponse)).then(function () {
                expect(mockResponse.status.message).to.be.equal(mockMsg.error.SWE011);
                done();
            });
        });

    });
})();

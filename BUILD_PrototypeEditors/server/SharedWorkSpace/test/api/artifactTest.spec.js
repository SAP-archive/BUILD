(function () {
    'use strict';
    var expect = require('norman-testing-tp').chai.expect;
    var commonServer = require('norman-common-server');
    var sinon = require('sinon');
    var artifactService;
    var Promise = require('norman-promise');
    var registryStub;
    var projectId = '0397820d2eccf02f0999a074';
    var path = '/index.html';
    var NormanError = commonServer.NormanError;
    var promiseRejectError = new NormanError('artifact fetch failed');

    var mockArtifact = {
        readStream: {
            pipe: function (res) {
                return res.done = 'true';
            }
        },
        path: '/index.html',
        contentType: 'xml'
    };

    var mockRequest = {originalUrl: '/api/project/0397820d2eccf02f0999a074/prototype/artifact/view/S0.xml'};
    var mockRequestFailure = {originalUrl: '/api/project/raiseError/prototype/artifact/view/S0.xml'};
    var mockRequestWithNoData = {originalUrl: '/api/project/noData/prototype/artifact/view/S0.xml'};

    var mockResponse = {
        header: function (key, value) {
            if (key === 'Pragma') {
                value = 'someTestValue';
            }
            this[key] = value;
        },
        status: function (val) {
            mockResponse.statusCode = val;
        },
        json: function (val) {
            mockResponse.json = val;
        }
    };

    var ArtifactServiceMock = {
        getArtifactByPath: function (projectId) {
            if (projectId === 'raiseError') {
                return Promise.reject(promiseRejectError);
            } else if (projectId === 'noData') {
                return Promise.resolve(null);
            }
            else {
                return Promise.resolve(mockArtifact);
            }
        }
    };

    //before hooks

    describe('SharedWorkspace.Artifact.API.Unit.Test', function () {

        this.timeout(15000);
        before(function (done) {
            done();
        });

        after(function (done) {
            done();
        });

        beforeEach(function () {
            var registry = commonServer.registry;
            registryStub = sinon.stub(registry, 'getModule');
            registryStub.withArgs('ArtifactService').returns(ArtifactServiceMock);
            artifactService = require('../../lib/api/artifact/controller');
        });
        afterEach(function () {
            registryStub.restore();
        });

        it('SharedWorkspace.api.artifact getArtifact()', function (done) {
            //let the test begin
            Promise.resolve(artifactService.getArtifact(mockRequest, mockResponse))
                .then(function () {
                    expect(mockResponse.done).to.be.equal('true');
                    expect(mockResponse.Pragma).to.be.equal('someTestValue');
                    done();
                });
        });

        it('SharedWorkspace.api.artifact getArtifact() failure scenario', function (done) {
            //let the test begin
            Promise.resolve(artifactService.getArtifact(mockRequestFailure, mockResponse))
                .then(function () {
                    expect(mockResponse.statusCode).to.be.equal(500);
                }, function (error) {
                    expect(error).to.be.equal(undefined);
                });
            return done();
        });

        it('SharedWorkspace.api.artifact getArtifact() emptyArtifact returned scenario', function (done) {
            //let the test begin
            Promise.resolve(artifactService.getArtifact(mockRequestWithNoData, mockResponse))
                .then(function () {
                    expect(mockResponse.statusCode).to.be.equal(404);
                }, function (error) {
                    expect(error).to.be.equal(undefined);
                });
            return done();
        });


    });
})();

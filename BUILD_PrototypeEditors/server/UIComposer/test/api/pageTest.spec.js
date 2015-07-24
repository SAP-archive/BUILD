'use strict';
(function () {
    var expect = require('norman-testing-tp').chai.expect;
    var commonServer = require('norman-common-server');
    var sinon = require('sinon');
    var Promise = require('norman-promise');
    var registryStub;
    var Logger = commonServer.logging;
    var NormanError = commonServer.NormanError;
    var promiseRejectError = new NormanError('page update/save/delete failed');
    var testSinon = sinon.sandbox.create();
    var pageMetadataService,
        mockCreateProjectId = 'createProjectId',
        mockUpdateProjectId = 'updateProjectId',
        mockDeleteProjectId = 'deleteProjectId',
        mockGetProjectId = 'getProjectId',
        mockUpdateCordProjectId = 'updateCoordinateProjectId';


    var serviceLoggerMock = {
        error: function () {

        },
        info: function () {

        },
        debug: function () {

        }
    };
    function getMockUrl(projectId) {
        return '/api/project/' + projectId.toString() + '/prototype/page';
    }
    var request = {},
        response = {};

    var fakeRequest = function () {
        this.originalUrl = '';
        this.body = {
            floorplans: 'ABSOLUTE',
            pages: JSON.stringify([{m:'testPage1'}, {m:'testPage2'}])
        };
        this.user = {
            _id: 'TestUser'
        };
        this.files = ['file1', 'file2'];
        this.query = {
            pageName : 'page1',
            controlId: '123',
            getName:'1234'

        };
        this.coordinatesArray = {};
    };
    var mockCreatePage = {createPage: true};
    var mockDeletePage = {deletePage: true};
    var mockUpdatePage = {updatePage: true};
    var mockGetPage = {getPage: true};
    var mockUpdateCordPage = {updateCordPage : true};

    var fakeResponse = function () {
        this.statusCode = undefined;
        this.header = function (key, value) {
            this[key] = value;
        };
        this.status = function (val) {
            this.statusCode = val;
            return this;
        };
        this.sendStatus = function (val) {
            this.statusCode = val;
            return this;
        };
        this.json = function (val) {
            this.jsonVal = val;
        };
    };

    var PageMetadataServiceMock = {
        createPage: function (projectId) {
            if (projectId === 'raiseError') {
                return Promise.reject(promiseRejectError);
            } else if (projectId === mockCreateProjectId) {
                return Promise.resolve(mockCreatePage);
            }
        },
        updatePage: function (projectId) {
            if (projectId === 'raiseError') {
                return Promise.reject(promiseRejectError);
            } else if (projectId === mockUpdateProjectId) {
                return Promise.resolve(mockUpdatePage);
            }
        },
        deletePage: function (projectId) {
            if (projectId === 'raiseError') {
                return Promise.reject(promiseRejectError);
            } else if (projectId === mockDeleteProjectId) {
                return Promise.resolve(mockDeletePage);
            }
        },
        getPage : function (projectId) {
            if (projectId === 'raiseError') {
                return Promise.reject(promiseRejectError);
            } else if (projectId === mockGetProjectId) {
                return Promise.resolve(mockGetPage);
            }
        },
        updateCoordinates : function (projectId) {
            if (projectId === 'raiseError') {
                return Promise.reject(promiseRejectError);
            } else if (projectId === mockUpdateCordProjectId) {
                return Promise.resolve(mockUpdateCordPage);
            }
        }

    };

    //before hooks

    describe('UIComposerServer.PageService.API.Unit.Test', function () {

        //********************************/
        //* life cycle methods
        //********************************/

        this.timeout(15000);

        before(function (done) {
            var registry = commonServer.registry;
            registryStub = testSinon.stub(registry, 'getModule');
            registryStub.withArgs('pageMetadataService').returns(PageMetadataServiceMock);
            testSinon.stub(Logger, 'createLogger').returns(serviceLoggerMock);
            pageMetadataService = require('../../lib/api/page/controller');
            done();
        });

        after(function (done) {
            testSinon.restore();
            done();
        });

        beforeEach(function (done) {
            request = new fakeRequest();
            response = new fakeResponse();
            done();
        });

        afterEach(function (done) {
            request = undefined;
            response = undefined;
            done();
        });

        //********************************/
        //* tests begins
        //********************************/


        it('createPage : successful scenario', function (done) {
            request.originalUrl = getMockUrl(mockCreateProjectId);
            Promise.resolve(pageMetadataService.createPage(request, response))
                .then(function () {
                    expect(response.jsonVal.createPage).to.be.true;
                    expect(response.statusCode).to.be.equals(200);
                    done();
                });
        });

        it('createPage :failed to create', function (done) {
            request.originalUrl = getMockUrl('raiseError');
            Promise.resolve(pageMetadataService.createPage(request, response))
                .then(function () {
                    expect(response.statusCode).to.be.equals(500);
                    done();
                });
        });

        it('updatePage :successful scenario', function (done) {
            request.originalUrl = getMockUrl(mockUpdateProjectId);
            Promise.resolve(pageMetadataService.updatePage(request, response))
                .then(function () {
                    expect(response.jsonVal.updatePage).to.be.true;
                    expect(response.statusCode).to.be.equals(200);
                    done();
                });
        });

        it('updatePage :failed to update scenario', function (done) {
            request.originalUrl = getMockUrl('raiseError');
            Promise.resolve(pageMetadataService.updatePage(request, response))
                .then(function () {
                    expect(response.statusCode).to.be.equals(500);
                    expect(response.jsonVal).to.be.equals(promiseRejectError);
                    done();
                });
        });

        it('updatePage :empty pages and files scenario : dont process', function (done) {
            request.originalUrl = getMockUrl(mockUpdateProjectId);
            request.body.pages = '{}';
            request.files = [];

            Promise.resolve(pageMetadataService.updatePage(request, response))
                .then(function () {
                    expect(response.statusCode).to.be.equals(200);
                    done();
                });
        });


        it('deletePage :successful scenario', function (done) {
            request.originalUrl = getMockUrl(mockDeleteProjectId);
            Promise.resolve(pageMetadataService.deletePage(request, response))
                .then(function () {
                    expect(response.jsonVal.deletePage).to.be.true;
                    expect(response.statusCode).to.be.equals(200);
                    done();
                });
        });

        it('deletePage :failed to delete scenario', function (done) {
            request.originalUrl = getMockUrl('raiseError');
            Promise.resolve(pageMetadataService.deletePage(request, response))
                .then(function () {
                    expect(response.statusCode).to.be.equals(500);
                    expect(response.jsonVal).to.be.equals(promiseRejectError);
                    done();
                });
        });


        it('getPage :successful scenario', function (done) {
            request.originalUrl = getMockUrl(mockGetProjectId);
            Promise.resolve(pageMetadataService.getPage(request, response))
                .then(function () {
                    expect(response.jsonVal.getPage).to.be.true;
                    expect(response.statusCode).to.be.equals(200);
                    done();
                });
        });

        it('getPage :failed to fetch scenario', function (done) {
            request.originalUrl = getMockUrl('raiseError');
            Promise.resolve(pageMetadataService.getPage(request, response))
                .then(function () {
                    expect(response.statusCode).to.be.equals(500);
                    expect(response.jsonVal).to.be.equals(promiseRejectError);
                    done();
                });
        });


        it('updateCoordinates :successful scenario', function (done) {
            request.originalUrl = getMockUrl(mockUpdateCordProjectId);
            Promise.resolve(pageMetadataService.updateCoordinates(request, response))
                .then(function () {
                    expect(response.jsonVal.updateCordPage).to.be.true;
                    expect(response.statusCode).to.be.equals(200);
                    done();
                });
        });

        it('updateCoordinates :failure scenario', function (done) {
            request.originalUrl = getMockUrl('raiseError');
            Promise.resolve(pageMetadataService.updateCoordinates(request, response))
                .then(function () {
                    expect(response.statusCode).to.be.equals(500);
                    expect(response.jsonVal).to.be.equals(promiseRejectError);
                    done();
                });
        });

    });
})();

'use strict';
(function () {
    var expect = require('norman-testing-tp').chai.expect;
    var commonServer = require('norman-common-server');
    var Promise = require('norman-promise');
    var logger = commonServer.logging.createLogger('test.ui-composer-server.processSwService');
    var sinon = require('sinon');
    var skipTests = false;
    var processSwService;
    var registryStub;
    var registry = commonServer.registry;
    var testSinon = sinon.sandbox.create();
    var constants = require('./../constants');
    var NormanError = commonServer.NormanError;

    var projectId = '0397820d2eccf02f0999a074';
    var mockStats = {};
    mockStats.created_by = 'TestUser';

    var mockDone = function () {
    };

    var SwRegistryServiceMock = {
        registerModule: function () {
            return true;
        },
        processMetadata: function () {

        }
    };

    var mockModelAppMetadata = {
        pages: [],
        navigations: []
    };
    var mockMetadataArray = [{
        model: mockModelAppMetadata,
        type: 'appMetadata',
        OP: 'CREATE'
    }];

    var returnPromise = Promise.resolve({operations: mockMetadataArray, thumbnails: null});
    var PageMetadataServiceMock = {
        createApp: function () {
            return returnPromise;
        },
        createPages: function () {
            return returnPromise;
        },
        processUpdatePage: function () {
            return returnPromise;
        },
        processDeletePage: function () {
            return returnPromise;
        },
        reinitializePrototype: function () {
            return returnPromise;
        },
        processUpdateCoordinates: function () {
            return returnPromise;
        }
    };

    var mockErrorMessage = 'promise rejected';
    var PageMetadataServiceMockForThrowingErrors = {
        processUpdatePage: function () {
            Promise.reject(new NormanError(mockErrorMessage));
        }
    };
//  before hooks


    describe('UIComposer.processSwService.Tests', function () {

        this.timeout(15000);

        beforeEach(function (done) {
            var ProcessSwService = require('../lib/services/processSwService');
            processSwService = new ProcessSwService();
            // var registry = commonServer.registry;

            // mocking calls to SharedWorkspace & Registry to fetch SharedWorkspace services and Prototype builder services
            registryStub = testSinon.stub(registry, 'getModule');
            registryStub.withArgs('pageMetadataService').returns(PageMetadataServiceMock);
            registryStub.withArgs('SwRegistryService').returns(SwRegistryServiceMock);
            done();
        });
        afterEach(function (done) {
            processSwService.shutdown(mockDone);
            testSinon.restore();
            done();
        });


        it('UIComposerServer.processSwService onInitialized()', function (done) {
            logger.info('beginning to test : UIComposer.processSwService onInitialized()');

            if (skipTests) {
                return done();
            }

            // ensure all props are undefined!
            expect(processSwService.pageMetadataService).to.be.equal(undefined);
            expect(processSwService.swRegistry).to.be.equal(undefined);

            // lets test this method!
            processSwService.onInitialized(mockDone);

            // ensure all props are defined!
            expect(processSwService.pageMetadataService).to.be.equal(PageMetadataServiceMock);
            expect(processSwService.swRegistry).to.be.equal(SwRegistryServiceMock);

            logger.info('end of test : UIComposer.processSwService onInitialized()');
            return done();
        });

        it('UIComposerServer.processSwService processData() create app', function (done) {
            logger.info('beginning to test : UIComposer.processSwService processData() create app');

            if (skipTests) {
                return done();
            }

            function verify(response) {
                logger.info('end of test : UIComposer.processSwService processData() create app');
                expect(response.metadataArray).to.be.equal(mockMetadataArray);
                expect(response.files).to.be.equal(null);
                return done();
            }

            // init global variables
            processSwService.onInitialized(mockDone);

            var req = {};
            req.body = {};
            req.body.createPrototype = {numPages: 2};
            processSwService.processData(projectId, constants.operationCreatePrototype, req, mockStats.created_by).then(function (response) {
                setTimeout(function () {
                    verify(response);
                }, 0);
            });
        });

        it('UIComposerServer.processSwService processData() create page', function (done) {
            logger.info('beginning to test : UIComposer.processSwService processData() create page');

            if (skipTests) {
                return done();
            }

            function verify(response) {
                logger.info('end of test : UIComposer.processSwService processData() create page');
                expect(response.metadataArray).to.be.equal(mockMetadataArray);
                expect(response.files).to.be.equal(null);
                return done();
            }

            // init global variables
            processSwService.onInitialized(mockDone);

            var req = {};
            req.body = {};
            req.body.createPage = {floorplans: []};
            processSwService.processData(projectId, constants.operationCreatePage, req, mockStats.created_by).then(function (response) {
                setTimeout(function () {
                    verify(response);
                }, 0);
            });
        });

        it('UIComposerServer.processSwService processData() update page', function (done) {
            logger.info('beginning to test : UIComposer.processSwService processData() update page');

            if (skipTests) {
                return done();
            }

            function verify(response) {
                logger.info('end of test : UIComposer.processSwService processData() update page');
                expect(response.metadataArray).to.be.equal(mockMetadataArray);
                expect(response.files).to.be.equal(null);
                return done();
            }

            // init global variables
            processSwService.onInitialized(mockDone);

            var req = {};
            req.body = {};
            req.body.updatePage = {pages: [], files: []};
            processSwService.processData(projectId, constants.operationUpdatePage, req, mockStats.created_by).then(function (response) {
                setTimeout(function () {
                    verify(response);
                }, 0);
            });
        });

        it('UIComposerServer.processSwService processData() delete page', function (done) {
            logger.info('beginning to test : UIComposer.processSwService processData() delete page');

            if (skipTests) {
                return done();
            }

            function verify(response) {
                logger.info('end of test : UIComposer.processSwService processData() delete page');
                expect(response.metadataArray).to.be.equal(mockMetadataArray);
                expect(response.files).to.be.equal(null);
                return done();
            }

            // init global variables
            processSwService.onInitialized(mockDone);

            var req = {};
            req.body = {};
            req.body.deletePage = {pageName: 'test pagename'};
            processSwService.processData(projectId, constants.operationDeletePage, req, mockStats.created_by).then(function (response) {
                setTimeout(function () {
                    verify(response);
                }, 0);
            });
        });

        it('UIComposerServer.processSwService processData() reinitialize prototype', function (done) {
            logger.info('beginning to test : UIComposer.processSwService processData() reinitialize prototype');

            if (skipTests) {
                return done();
            }

            function verify(response) {
                logger.info('end of test : UIComposer.processSwService processData() reinitialize prototype');
                expect(response.metadataArray).to.be.equal(mockMetadataArray);
                expect(response.files).to.be.equal(null);
                return done();
            }

            // init global variables
            processSwService.onInitialized(mockDone);

            var req = {};
            req.body = {};
            req.body.reinitializePrototype = {applicationType: 'test'};
            processSwService.processData(projectId, constants.operationReinitializePrototype, req, mockStats.created_by).then(function (response) {
                setTimeout(function () {
                    verify(response);
                }, 0);
            });
        });

        it('UIComposerServer.processSwService processData() update coordinates', function (done) {
            logger.info('beginning to test : UIComposer.processSwService processData() update coordinates');

            if (skipTests) {
                return done();
            }

            function verify(response) {
                logger.info('end of test : UIComposer.processSwService processData() update coordinates');
                expect(response.metadataArray).to.be.equal(mockMetadataArray);
                expect(response.files).to.be.equal(null);
                return done();
            }

            // init global variables
            processSwService.onInitialized(mockDone);

            var req = {};
            req.body = {};
            req.body.updateCoordinates = {coordinatesArray: []};
            processSwService.processData(projectId, constants.operationUpdateCoordinates, req, mockStats.created_by).then(function (response) {
                setTimeout(function () {
                    verify(response);
                }, 0);
            });
        });

        it('UIComposerServer.processSwService processData() update prototype Display Names', function (done) {
            logger.info('beginning to test : UIComposer.processSwService processData() update display Names');

            if (skipTests) {
                return done();
            }

            function verify(response) {
                logger.info('end of test : UIComposer.processSwService processData() update coordinates');
                expect(response.metadataArray).to.be.equal(mockMetadataArray);
                expect(response.files).to.be.equal(null);
                return done();
            }

            // init global variables
            processSwService.onInitialized(mockDone);

            var req = {};
            req.body = {};
            req.body.updateCoordinates = {coordinatesArray: []};
            processSwService.processData(projectId, constants.operationUpdateCoordinates, req, mockStats.created_by).then(function (response) {
                setTimeout(function () {
                    verify(response);
                }, 0);
            });
        });
    });



    describe('UIComposer.processSwService.Tests Failure Scenario', function () {

        this.timeout(15000);

        beforeEach(function (done) {
            var ProcessSwService = require('../lib/services/processSwService');
            processSwService = new ProcessSwService();

            // mocking calls to SharedWorkspace & Registry to fetch SharedWorkspace services and Prototype builder services
            registryStub = testSinon.stub(registry, 'getModule');
            registryStub.withArgs('pageMetadataService').returns(PageMetadataServiceMockForThrowingErrors);
            registryStub.withArgs('SwRegistryService').returns(SwRegistryServiceMock);
            done();
        });
        afterEach(function (done) {
            testSinon.restore();
            done();
        });

        it('UIComposerServer.processSwService processData() update page', function (done) {
            logger.info('beginning to test : UIComposer.processSwService processData() update page');

            if (skipTests) {
                return done();
            }

            // init global variables
            processSwService.onInitialized(mockDone);

            var req = {};
            req.body = {};
            req.body.updatePage = {pages: [], files: []};

            processSwService.processData(projectId, constants.operationUpdatePage, req, mockStats.created_by)
                .then(function (success) {
                    expect(success).to.be.equal(undefined);
                }, function (error) {
                    expect(error).to.be.equal(new NormanError(mockErrorMessage));
                });
            return done();

        });
    });

})();

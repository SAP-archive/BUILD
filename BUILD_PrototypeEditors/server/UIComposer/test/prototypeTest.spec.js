'use strict';
(function () {
    var expect = require('norman-testing-tp').chai.expect;
    var commonServer = require('norman-common-server');
    var Promise = require('norman-promise');
    var logger = commonServer.logging.createLogger('test.ui-composer-server.prototypeService');
    var sinon = require('sinon');
    var skipTests = false;
    var mockMsg = {testMsg: 'Test'};
    var prototypeService;
    var registryStub;
    var idMock = {_id: '0397820d2eccf02f0999a074'};
    var projectId = '0397820d2eccf02f0999a074';
    var createdBy = 'TestCreatedByUser';
    var testSinon = sinon.sandbox.create();
    var numPages = '0';
    var applicationType = 'App';
    var NormanError = commonServer.NormanError;
    var appMetadataEmptyMock, appMetadataExistingMock = null;
    require('sinon-as-promised');

    var mockDone = function () {
    };
    appMetadataEmptyMock = {
        appMetadata: {
            pages: [],
            navigations: [],
            catalogId: '1234'
        }
    };

    appMetadataExistingMock = {
        appMetadata: {
            catalogId: '1234',
            navigations: [
                {
                    pageFrom: 'S0',
                    pageTo: 'S1',
                    target: 'pages'
                },
                {
                    pageFrom: 'S1',
                    pageTo: 'S0',
                    target: 'pages'
                }
            ],
            pages: [
                {
                    name: 'S0',
                    displayName: 'Page 1',
                    routePattern: '/S0',
                    pageUrl: 'index.html#/S0',
                    thumbnailUrl: 'resources/thumbnail/S0.png',
                    id: '422595545d478e9e0a0e35d6'
                },
                {
                    name: 'S1',
                    displayName: 'Page 2',
                    routePattern: '/S1',
                    pageUrl: 'index.html#/S1',
                    thumbnailUrl: 'resources/thumbnail/S1.png',
                    id: 'f4bf4468f950f31c0a0e35dd'
                }
            ],
            uiLang: 'UI5',
            appType: 'App'
        }
    };
    var PrototypeServiceMock = {
        getMetadata: function (testing) {
            if (testing === 'appMetadataExistingMock') {
                return Promise.resolve(appMetadataExistingMock);
            }
            return Promise.resolve(appMetadataEmptyMock);
        },
        doMetadata: function (testing) {
            if (testing === 'doMetadataEmpty') {
                return Promise.resolve({});
            }
            if (testing === 'doMetadataNull') {
                return Promise.resolve(null);
            }
            return Promise.resolve(idMock);
        },
        shutdown: function () {
            return {};
        }
    };

    var mockModelAppMetadata = {
        pages: [],
        navigations: []
    };
    var SwProcessingMock = {
        processMetadata: function (_projectId, event) {
            if ((_projectId !== 'raiseError') && (event === 'reinitializePrototype')) {
                return Promise.resolve({
                    metadataArray: [{
                        model: mockModelAppMetadata,
                        type: 'appMetadata',
                        OP: 'CREATE'
                    }]
                });
            }
            return Promise.resolve();
        }
    };


    var PageFlowMock = {
        shutdown: function () {
            return {};
        },
        getPageFlow: function () {
            return Promise.resolve({});
        },
        createPrototype: function (_projectId) {
            if (_projectId === 'raisePageFlowErr') {
                return Promise.reject(new NormanError('Page Flow Failed'));
            }
            return Promise.resolve({swProcessing: SwProcessingMock});
        }
    };

    var ComposerCommonServiceMock = {
        messages: mockMsg,
        shutdown: function () {
            return {};
        },
        sendResponse: function () {
            return {};
        },
        sendError: function () {
            return {};
        }
    };

    // before hooks

    describe('UIComposer.PrototypeService.Tests', function () {

        this.timeout(15000);
        before(function (done) {
            done();
        });

        after(function (done) {
            done();
        });

        beforeEach(function () {
            var PrototypeService = require('../lib/services/prototype');
            prototypeService = new PrototypeService();
            var registry = commonServer.registry;
            // mocking calls to SharedWorkspace & Registry to fetch SharedWorkspace services and Prototype builder services
            registryStub = testSinon.stub(registry, 'getModule');
            registryStub.withArgs('PageFlow').returns(PageFlowMock);
            registryStub.withArgs('SwProcessing').returns(SwProcessingMock);
            registryStub.withArgs('PrototypeService').returns(PrototypeServiceMock);
            registryStub.withArgs('composerCommonService').returns(ComposerCommonServiceMock);
        });
        afterEach(function () {
            var mockDone = function () {

            };
            prototypeService.shutdown(mockDone);
            testSinon.restore();

        });


        it('UIComposerServer.prototypeService initialized', function (done) {
            logger.info('beginning to test : UIComposer.prototypeService initialize()');
            var appMetadataModel = require('../lib/services/appMetadata/model');
            var appMetadataModelStub = sinon.stub(appMetadataModel, 'create').returns();
            if (skipTests) {
                return done();
            }

            var func = testSinon.spy();

            prototypeService.initialize(func);
            expect(func.called).to.be.true;
            appMetadataModelStub.restore();
            func.reset();
            done();
        });


        it('UIComposerServer.prototypeService shutdown', function (done) {
            logger.info('beginning to test : UIComposer.prototypeService shutdown()');

            if (skipTests) {
                return done();
            }

            var func = testSinon.spy();

            prototypeService.shutdown(func);
            expect(func.called).to.be.true;
            func.reset();
            done();
        });

        it('UIComposerServer.prototypeService onInitialized()', function (done) {

            logger.info('beginning to test : UIComposer.prototypeService onInitialized()');

            if (skipTests) {
                return done();
            }

            // ensure all props are undefined!
            expect(prototypeService.sharedWorkspaceService).to.be.equal(undefined);
            expect(prototypeService.pageFlowService).to.be.equal(undefined);
            expect(prototypeService.swProcessing).to.be.equal(undefined);
            expect(prototypeService.composerCommonService).to.be.equal(undefined);
            expect(prototypeService.messages).to.be.equal(undefined);

            // lets test this method!
            prototypeService.onInitialized(mockDone);

            // ensure all props are undefined!
            expect(prototypeService.sharedWorkspaceService).to.be.equal(PrototypeServiceMock);
            expect(prototypeService.pageFlowService).to.be.equal(PageFlowMock);
            expect(prototypeService.swProcessing).to.be.equal(SwProcessingMock);
            expect(prototypeService.composerCommonService).to.be.equal(ComposerCommonServiceMock);
            expect(prototypeService.messages).to.be.equal(mockMsg);

            logger.info('end of test : UIComposer.prototypeService onInitialized()');
            return done();
        });


        it('UIComposerServer.prototypeService createDataDrivenPrototype()', function (done) {

            logger.info('beginning of test : UIComposer.prototypeService createDataDrivenPrototype()');

            if (skipTests) {
                return done();
            }

            // init global variables
            prototypeService.onInitialized(mockDone);

            var req = {};
            req.body = {};
            // let the test begin
            prototypeService.createDataDrivenPrototype(projectId, numPages, createdBy, applicationType, req)
                .then(function (success) {
                    expect(success).to.be.equal(mockModelAppMetadata);
                }, function (error) {
                    logger.error('test failed : UIComposer.prototypeService createDataDrivenPrototype(). Reason: ' + error);
                    done(error);
                });
            logger.info('end of test : UIComposer.prototypeService createDataDrivenPrototype()');
            return done();
        });


        it('UIComposerServer.prototypeService createDataDrivenPrototype() failure scenario 1', function (done) {

            logger.info('beginning of test : UIComposer.prototypeService createDataDrivenPrototype() failure scenario');

            if (skipTests) {
                return done();
            }

            // init global variables
            prototypeService.onInitialized(mockDone);

            // let the test begin
            prototypeService.createDataDrivenPrototype('raiseError', numPages, createdBy, applicationType)
                .then(function (success) {
                    expect(success).to.be.equal(undefined);
                }, function (error) {
                    expect(error).to.be.equal(new NormanError(this.messages.error.SWE012));
                });
            logger.info('end of test : UIComposer.prototypeService createDataDrivenPrototype()');
            return done();
        });

        it('UIComposerServer.prototypeService createDataDrivenPrototype() failure scenario 2', function (done) {

            logger.info('beginning of test : UIComposer.prototypeService createDataDrivenPrototype() failure scenario');

            if (skipTests) {
                return done();
            }

            // init global variables
            prototypeService.onInitialized(mockDone);


            // let the test begin
            prototypeService.createDataDrivenPrototype('raisePageFlowErr', numPages, createdBy, applicationType)
                .then(function (success) {
                    expect(success).to.be.equal(undefined);
                }, function (error) {
                    expect(error).to.be.equal(new NormanError('Page Flow Failed'));
                });
            logger.info('end of test : UIComposer.prototypeService createDataDrivenPrototype()');
            return done();
        });

        it('UIComposerServer.prototypeService getPrototype', function (done) {

            logger.info('beginning of test : UIComposer.prototypeService createDataDrivenPrototype() failure scenario');

            if (skipTests) {
                return done();
            }

            // init global variables
            prototypeService.onInitialized(mockDone);


            // let the test begin
            prototypeService.getPrototype('appMetadataExistingMock')
                .then(function (success) {
                    expect(success).to.be.equal(appMetadataExistingMock);
                }, function (error) {
                    expect(error).to.be.equal(new NormanError('Page Flow Failed'));
                });
            logger.info('end of test : UIComposer.prototypeService createDataDrivenPrototype()');
            return done();
        });

    });
})();

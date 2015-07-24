'use strict';
(function () {
    var expect = require('norman-testing-tp').chai.expect;
    var commonServer = require('norman-common-server');
    var Promise = require('norman-promise');
    var logger = commonServer.logging.createLogger('test.ui-composer-server.pageMetadata');
    var sinon = require('sinon');
    var fs = require('fs');
    var mongoose = commonServer.db.mongoose;
    var NormanError = commonServer.NormanError;
    var path = require('path');
    var testSinon = sinon.sandbox.create();
    require('sinon-as-promised');
    var _ = require('norman-server-tp').lodash;

    var pageMetadataService;
    var registryStub;

    var catalogId = '5519e64aa732319ea54194eb';

    var catalogInfoMock = {
        catalogName: 'r1c1ui5',
        catalogVersion: '1_0',
        _id: catalogId
    };

    var catalogMock = {
        _id: catalogId,
        catalogLang: 'openui5',
        catalogName: 'r1c1ui5',
        catalogVersion: '1_0',
        controls: {
            sap_m_Page: {
                additionalMetadata: {
                    aggregations: {
                        content: {
                            name: 'content',
                            defaultValue: [
                                {
                                    name: 'sap_ui_commons_layout_AbsoluteLayout'
                                }
                            ]
                        }
                    },
                    parent: 'sap_m_Page'
                },
                groupName: 'sap_m',
                name: 'sap_m_Page'
            },
            sap_ui_commons_layout_AbsoluteLayout: {
                additionalMetadata: {
                    parent: 'sap_ui_commons_layout_AbsoluteLayout',
                    properties: {
                        verticalScrolling: {
                            defaultValue: 'Auto',
                            name: 'verticalScrolling',
                            possibleValues: null,
                            type: 'string'
                        },
                        horizontalScrolling: {
                            defaultValue: 'Auto',
                            name: 'horizontalScrolling',
                            possibleValues: null,
                            type: 'string'
                        }
                    },
                    aggregations: {
                        positions: {
                            name: 'positions',
                            types: ['sap_ui_commons_layout_PositionContainer']
                        }
                    }
                },

                groupName: 'floorplan controls',
                name: 'sap_ui_commons_layout_AbsoluteLayout'
            }
        },
        floorPlans: {
            ABSOLUTE: {
                name: 'ABSOLUTE',
                rootControl: 'sap_m_Page',
                controls: {
                    AbsoluteLayout: 'sap_ui_commons_layout_AbsoluteLayout',
                    PositionContainer: 'sap_ui_commons_layout_PositionContainer'
                },
                thumbnail: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABQAAAAQAAQMAAACEXWYAAAAAA1BMVEX///+nxBvIAAAAtElEQVQYGe3BAQEAAACAkP6v7ggKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGIQeAAHYiJ6XAAAAAElFTkSuQmCC'
            }
        },
        isRootCatalog: false,
        isDefault: true,
        libraryObjectId: '',
        libraryPublicURL: '',
        libraryURL: '/resources/sap-ui-core.js',
        libraryVersion: '1_26_6',
        rootCatalogId: null
    };

    var idMock = {_id: '0397820d2eccf02f0999a074'};

    var appMetadataEmptyMock, appMetadataExistingMock, appMetadataExistingOnePageMock = null;

    var PrototypeServiceMock = {
        reset: function () {
            appMetadataEmptyMock = {
                appMetadata: {
                    pages: [],
                    navigations: [],
                    catalogId: catalogId
                }
            };

            appMetadataExistingMock = {
                appMetadata: {
                    catalogId: catalogId,
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
                            id: '422595545d478e9e0a0e35d6',
                            coordinates: {
                                x: 0,
                                y: 0
                            },
                            controls: [
                                {
                                    events: []
                                }
                            ]
                        },
                        {
                            name: 'S1',
                            displayName: 'Page 2',
                            routePattern: '/S1',
                            pageUrl: 'index.html#/S1',
                            thumbnailUrl: 'resources/thumbnail/S1.png',
                            id: 'f4bf4468f950f31c0a0e35dd',
                            coordinates: {
                                x: 0,
                                y: 0
                            },
                            controls: [
                                {
                                    events: []
                                }
                            ]
                        }
                    ],
                    uiLang: 'UI5',
                    appType: 'App'
                }
            };

            appMetadataExistingOnePageMock = {
                appMetadata: {
                    catalogId: catalogId,
                    navigations: [],
                    pages: [
                        {
                            name: 'S0',
                            displayName: 'Page 1',
                            routePattern: '/S0',
                            pageUrl: 'index.html#/S0',
                            thumbnailUrl: 'resources/thumbnail/S0.png',
                            id: '422595545d478e9e0a0e35d6'
                        }
                    ],
                    uiLang: 'UI5',
                    appType: 'App'
                }
            };
        },
        getMetadata: function (testing) {
            if (testing === 'appMetadataExistingMock') {
                return Promise.resolve(appMetadataExistingMock);
            }
            else if (testing === 'createAppError') {
                return Promise.reject(new NormanError('App Creation Error'));
            }
            else if (testing === 'createAppErrorWithCode') {
                return Promise.reject(new NormanError('App Creation Error', 'SWE001'));
            }
            else if (testing === 'processCoordinates') {
                return Promise.resolve(appMetadataExistingMock);
            }
            else if (testing === 'updateDisplayNames') {
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

    var SwProcessingMock = {
        processMetadata: function (testing) {
            if (testing === 'emptyPageFlow') {
                return Promise.resolve({
                    metadataArray: [{
                        model: {
                            pages: [],
                            navigations: [],
                            catalogId: catalogId
                        },
                        type: 'appMetadata',
                        OP: 'CREATE'
                    }]
                });
            }
            else if (testing === 'deletePage') {
                return Promise.resolve({
                    metadataArray: [{
                        model: appMetadataExistingMock,
                        type: 'appMetadata',
                        OP: 'CREATE'
                    }]
                });
            }
            else if (testing === '0397820d2eccf02f0999a075') {
                return Promise.resolve({
                    metadataArray: [{
                        model: appMetadataExistingOnePageMock,
                        type: 'appMetadata',
                        OP: 'CREATE'
                    }]
                });
            }
            else if (testing === 'updateCoordinate') {
                return Promise.resolve({
                    metadataArray: [{
                        model: appMetadataExistingOnePageMock,
                        type: 'appMetadata',
                        OP: 'CREATE'
                    }]
                });
            }
            else if (testing === 'updateCoordinateWithError') {
                return Promise.reject(new NormanError('Coordinate Error'));
            }
            else {
                return Promise.resolve();
            }
        }
    };

    var PrototypeBuilderMock = {
        shutdown: function () {
            return {};
        }
    };

    var UICatalogMock = {
        shutdown: function () {
            return {};
        },
        getCatalogs: function () {
            return Promise.resolve([catalogInfoMock]);
        },
        getCatalogById: function () {
            return Promise.resolve(catalogMock);
        }
    };


    var pageFlowEmpty = null;
    var pageFlowComplete = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'material/appFlow.json')), 'utf-8');


    var PageFlow = {
        shutdown: function () {
            return {};
        },
        getPageFlow: function (projectId) {
            var pageFlow = (projectId === 'emptyPageFlow' ? pageFlowEmpty : pageFlowComplete);
            return Promise.resolve(pageFlow);
        }
    };

    // before hooks


    describe('PageMetadataService', function () {
        this.timeout(15000);

        describe('pageMetadata Model Check', function () {
            var pMModel = require('../lib/services/pageMetadata/model');
            var mongooseModelMock = {
                ensureIndexes: function () {

                }
            };
            before(function (done) {
                testSinon.stub(mongoose, 'createModel').returns(mongooseModelMock);
                done();
            });
            after(function (done) {
                testSinon.restore();
                done();
            });

            it('createModel', function (done) {
                var returnVal = pMModel.create();
                expect(returnVal.pageMetadata).to.be.equal(mongooseModelMock);
                done();
            });
            it('createIndexes', function (done) {
                var func = testSinon.spy();
                pMModel.createIndexes(func);
                expect(func.called).to.be.true;
                func.reset();
                done();
            });
            it('destroy', function (done) {
                var func = sinon.spy();
                pMModel.destroy(func);
                expect(func.called).to.be.true;
                func.reset();
                done();
            });
        });

        describe('pageMetadata Service Check', function () {
            var appMetadataModel;
            var pageMetadataModel;

            beforeEach(function () {
                var PageMetadata = require('../lib/services/pageMetadata');
                pageMetadataService = new PageMetadata();
                var registry = commonServer.registry;

                // mocking calls to SharedWorkspace & Registry to fetch SharedWorkspace services and Prototype builder services
                registryStub = testSinon.stub(registry, 'getModule');
                registryStub.withArgs('PrototypeService').returns(PrototypeServiceMock);
                registryStub.withArgs('PrototypeBuilder').returns(PrototypeBuilderMock);
                registryStub.withArgs('UICatalog').returns(UICatalogMock);
                registryStub.withArgs('PageFlow').returns(PageFlow);

                registryStub.withArgs('SwProcessing').returns(SwProcessingMock);

                // reset appMetadata
                PrototypeServiceMock.reset();
            });
            afterEach(function () {
                testSinon.restore();
            });

            before(function (done) {
                testSinon.stub(mongoose, 'createModel', function (arg1, arg2) {
                    var model;
                    if (arg1 === 'appMetadata') {
                        appMetadataModel = mongoose.model(arg1, arg2);
                        model = appMetadataModel;
                    }
                    else {
                        pageMetadataModel = mongoose.model(arg1, arg2);
                        model = pageMetadataModel;
                    }
                    return model;
                });
                done();
            });
            after(function (done) {
                var mockDone = function () {

                };
                pageMetadataService.shutdown(mockDone);
                testSinon.restore();
                done();
            });
            it('initialization', function (done) {
                logger.info('beginning to test - initialization');
                var func = testSinon.spy();
                pageMetadataService.initialize(func);
                expect(func.called).to.be.true;
                done();

            });
            it('checkSchema', function (done) {
                logger.info('beginning to test - initialization');
                testSinon.stub(pageMetadataModel, 'ensureIndexes').returns();
                var func = testSinon.spy();
                pageMetadataService.checkSchema(func);
                expect(func.called).to.be.true;
                done();

            });

            it('onInitialized', function (done) {
                logger.info('beginning to test - initialization');
                var func = testSinon.spy();
                pageMetadataService.onInitialized(func);
                expect(func.called).to.be.true;
                done();

            });
            it('shutdown', function (done) {
                logger.info('beginning to test - initialization');
                var func = testSinon.spy();
                pageMetadataService.shutdown(func);
                expect(func.called).to.be.true;
                done();

            });
            it('createApp: with args number of pages', function (done) {
                logger.info('beginning to test [createPageWithoutAppMetadataUpdate with args: number of pages]');

                // enough mocking - actual test beings here !!!
                var projectId = '0397820d2eccf02f0999a075', numPages = 2;

                pageMetadataService.createApp(projectId, numPages, 'App').then(
                    function (result) {
                        // two pages is expected to be created
                        expect(result.pagesMetadata.length).to.be.equal(numPages);
                        // check if the pages have ID and names
                        expect(result.pagesMetadata[0].name).to.equal('S0');
                        expect(result.pagesMetadata[1].name).to.equal('S1');
                        expect(result.pagesMetadata[0]._id).not.to.be.null;
                        done();
                    },
                    function (error) {
                        if (error) {
                            logger.error('something went wrong, checking the result with MockedData of createdPage failed');
                        }
                        done(error);
                    });
            });

            it('createApp with args: empty data driven pageflow', function (done) {

                logger.info('beginning to test [createPage with args: empty data driven pageflow]');

                // enough mocking - actual test beings here !!!
                var projectId = 'emptyPageFlow', numPages = 0, stats = {
                    created_by: 'TestNormanUser',
                    updated_by: 'TestNormanUser'
                };

                pageMetadataService.createApp(projectId, numPages, stats, 'masterDetail').then(
                    function (result) {
                        logger.info('checking the result with MockedData of createdPage.');

                        // valid appMetadata
                        expect(result.appMetadata).not.to.be.null;
                        expect(result.appMetadata.pages.length).to.be.equal(0);
                        done();
                    },
                    function (error) {
                        if (error) {
                            logger.error('something went wrong, checking the result with MockedData of createdPage failed');
                        }
                        done(error);
                    });
            });

            it('createApp: full data driven pageflow', function (done) {

                logger.info('beginning to test [createPage with args: full data driven pageflow]');

                // enough mocking - actual test beings here !!!
                var projectId = 'completePageFlow', numPages = 0, stats = {
                    created_by: 'TestNormanUser',
                    updated_by: 'TestNormanUser'
                };

                pageMetadataService.createApp(projectId, numPages, stats, 'masterDetail').then(
                    function (result) {
                        logger.info('checking the result with MockedData of createdPage.');

                        // valid appMetadata
                        expect(result.appMetadata).not.to.be.null;
                        expect(result.appMetadata.appType).to.equal('masterDetail');
                        expect(result.appMetadata.pages.length).to.equal(4);
                        expect(result.appMetadata.navigations.length).to.equal(3);

                        // valid pages
                        var pages = result.appMetadata.pages;
                        for (var i = 0; i < pages.length; i++) {
                            expect(pages[i].displayName).not.to.be.null;
                            expect(pages[i].name).not.to.be.null;
                            expect(pages[i].pageUrl).not.to.be.null;
                            expect(pages[i].thumbnailUrl).not.to.be.null;
                        }
                        done();
                    },
                    function (error) {
                        if (error) {
                            logger.error('something went wrong, checking the result with MockedData of createdPage failed');
                        }
                        done(error);
                    });

            });


            it('createApp: Error', function (done) {

                logger.info('beginning to test [createPage with args: full data driven pageflow]');

                // enough mocking - actual test beings here !!!
                var projectId = 'createAppError', numPages = 0, stats = {
                    created_by: 'TestNormanUser',
                    updated_by: 'TestNormanUser'
                };

                pageMetadataService.createApp(projectId, numPages, stats, null).then(
                    function () {
                        done();
                    },
                    function (error) {
                        expect(error.message).to.equal('App Creation Error');
                        done();
                    });

            });


            // CREATE PAGE ***********************

            it('createPage with args: floorplan names and update AppMetadata', function (done) {

                logger.info('beginning to test [create a page with args: floorplan names]');

                // enough mocking - actual test beings here !!!
                var projectId = '0397820d2eccf02f0999a075', numPages = 1, stats = {
                    created_by: 'TestNormanUser',
                    updated_by: 'TestNormanUser'
                };

                pageMetadataService.createPage(projectId, numPages, stats).then(
                    function (result) {
                        logger.info('checking the result with MockedData of createdPage.');

                        // valid appMetadata
                        expect(result.appMetadata).not.to.be.null;
                        // one page is expected to be created
                        expect(result.appMetadata.pages.length).to.be.equal(numPages);
                        // check if the page have ID and names
                        expect(result.appMetadata.pages[0].name).to.equal('S0');

                        done();
                    },
                    function (error) {
                        if (error) {
                            logger.error('something went wrong, checking the result with MockedData of createdPage failed');
                        }
                        done(error);
                    });

            });


            it('createPage: doMetadataEmpty', function (done) {

                logger.info('beginning to test [createPage: doMetadataEmpty]');

                // enough mocking - actual test beings here !!!
                var projectId = 'doMetadataEmpty', numPages = 1, stats = {
                    created_by: 'TestNormanUser',
                    updated_by: 'TestNormanUser'
                };

                pageMetadataService.createPage(projectId, numPages, stats).then(
                    function () {
                        logger.info('should not get here');
                        done('should not get here');
                    },
                    function (error) {
                        expect(error).not.to.be.null;
                        done();
                    });

            });

            it('createPage: generatePrototypePagesEmpty', function (done) {

                logger.info('beginning to test [createPage: generatePrototypePagesEmpty]');

                // enough mocking - actual test beings here !!!
                var projectId = 'generatePrototypePagesEmpty', numPages = 1, stats = {
                    created_by: 'TestNormanUser',
                    updated_by: 'TestNormanUser'
                };


                pageMetadataService.createPage(projectId, numPages, stats).then(
                    function () {
                        logger.info('should not get here');
                        done('should not get here');
                    },
                    function (error) {
                        expect(error).not.to.be.null;
                        done();
                    });

            });

            it('createPage: generatePrototypePagesError', function (done) {

                logger.info('beginning to test [createPage: generatePrototypePagesError]');

                // enough mocking - actual test beings here !!!
                var projectId = 'generatePrototypePagesError', numPages = 1, stats = {
                    created_by: 'TestNormanUser',
                    updated_by: 'TestNormanUser'
                };

                pageMetadataService.createPage(projectId, numPages, stats).then(
                    function () {
                        logger.info('should not get here');
                        done('should not get here');
                    },
                    function (error) {
                        expect(error).not.to.be.null;
                        done();
                    });

            });

            it('createPage with args: empty data driven pageflow', function (done) {

                logger.info('beginning to test [createPage with args: empty data driven pageflow]');

                // enough mocking - actual test beings here !!!
                var projectId = 'emptyPageFlow', numPages = 0, stats = {
                    created_by: 'TestNormanUser',
                    updated_by: 'TestNormanUser'
                };

                pageMetadataService.createPage(projectId, numPages, stats, 'masterDetail').then(
                    function (result) {
                        logger.info('checking the result with MockedData of createdPage.');

                        // valid appMetadata
                        expect(result).not.to.be.null;
                        expect(result.pages.length).to.be.equal(0);
                        done();
                    },
                    function (error) {
                        if (error) {
                            logger.error('something went wrong, checking the result with MockedData of createdPage failed');
                        }
                        done(error);
                    });

            });


            it('createPage: full data driven pageflow', function (done) {

                logger.info('beginning to test [createPage with args: full data driven pageflow]');

                // enough mocking - actual test beings here !!!
                var projectId = 'completePageFlow', numPages = 0, stats = {
                    created_by: 'TestNormanUser',
                    updated_by: 'TestNormanUser'
                };

                pageMetadataService.createPages(projectId, numPages, stats, 'masterDetail').then(
                    function (result) {
                        logger.info('checking the result with MockedData of createdPage.');

                        // valid appMetadata
                        expect(result.appMetadata).not.to.be.null;
                        expect(result.appMetadata.appType).to.equal('masterDetail');
                        expect(result.appMetadata.pages.length).to.equal(4);
                        expect(result.appMetadata.navigations.length).to.equal(3);

                        // valid pages
                        var pages = result.appMetadata.pages;
                        for (var i = 0; i < pages.length; i++) {
                            expect(pages[i].displayName).not.to.be.null;
                            expect(pages[i].name).not.to.be.null;
                            expect(pages[i].pageUrl).not.to.be.null;
                            expect(pages[i].thumbnailUrl).not.to.be.null;
                        }
                        done();
                    },
                    function (error) {
                        if (error) {
                            logger.error('something went wrong, checking the result with MockedData of createdPage failed');
                        }
                        done(error);
                    });

            });

            // DELETE ALL PAGES ***********************


            it('deleteAllPages : test', function (done) {

                logger.info('beginning to test [deleteAllPages : test]');

                // enough mocking - actual test beings here !!!
                var projectId = 'appMetadataExistingMock', stats = {
                    created_by: 'TestNormanUser',
                    updated_by: 'TestNormanUser'
                };

                pageMetadataService.deleteAllPages(projectId, stats).then(
                    function (result) {
                        logger.info('checking the result with MockedData of createdPage.');

                        // valid appMetadata
                        expect(result).not.to.be.null;

                        done();
                    },
                    function (error) {
                        if (error) {
                            logger.error('something went wrong, deleteAllPages : test');
                        }
                        done(error);
                    });

            });


            it('deleteAllPages : empty', function (done) {

                logger.info('beginning to test [deleteAllPages : empty]');

                // enough mocking - actual test beings here !!!
                var projectId = 'getAppMetadataEmpty', stats = {
                    created_by: 'TestNormanUser',
                    updated_by: 'TestNormanUser'
                };

                pageMetadataService.deleteAllPages(projectId, stats).then(
                    function (result) {
                        logger.info('checking the result with MockedData of createdPage.');

                        // valid appMetadata
                        expect(result).not.to.be.null;

                        done();
                    },
                    function (error) {
                        if (error) {
                            logger.error('something went wrong, deleteAllPages : empty');
                        }
                        done(error);
                    });

            });

            // DELETE PAGE ***********************

            it('deletePage : test', function (done) {

                logger.info('beginning to test [deletePage : empty]');

                // enough mocking - actual test beings here !!!
                var projectId = 'deletePage', stats = {created_by: 'TestNormanUser', updated_by: 'TestNormanUser'};

                pageMetadataService.deletePage(projectId, 'S0', stats).then(
                    function (result) {
                        logger.info('checking the result with MockedData of deletePage.');

                        // valid appMetadata
                        expect(result).not.to.be.null;

                        done();
                    },
                    function (error) {
                        if (error) {
                            logger.error('something went wrong, getPage : test');
                        }
                        done(error);
                    });

            });


            it('deletePage : non existant', function (done) {

                logger.info('beginning to test [deletePage : non existant]');

                // enough mocking - actual test beings here !!!
                var projectId = 'appMetadataExistingMock', stats = {
                    created_by: 'TestNormanUser',
                    updated_by: 'TestNormanUser'
                };

                pageMetadataService.getPage(projectId, 'test', stats).then(
                    function () {
                        logger.info('should not get here');
                        done('should not get here');
                    },
                    function (error) {
                        expect(error).not.to.be.null;
                        done();
                    });

            });

            /* it('deletePage : processDeletePage', function (done) {

             logger.info('beginning to test [processDeletePage]');

             pageMetadataStub = sinon.stub(pageMetadataModel, 'find', function (input, func) {
             return func(null, appMetadataExistingMock.appMetadata.pages);
             });

             // enough mocking - actual test beings here !!!
             var projectId = 'appMetadataExistingMock', stats = {created_by: 'TestNormanUser', updated_by: 'TestNormanUser'};

             pageMetadataService.processDeletePage(projectId, 'S0').then(
             function (result) {
             logger.info('checking the result with MockedData of deletePage.');

             // valid appMetadata
             expect(result).not.to.be.null;

             done();
             },
             function (error) {
             if (error) {
             logger.error('something went wrong, getPage : test');
             }
             done(error);
             });



             });*/


            // GET PAGE ***********************

            it('getPage : test', function (done) {

                logger.info('beginning to test [getPage : empty]');
                testSinon.stub(pageMetadataModel, 'find', function (input, func) {
                    return func(null, appMetadataExistingMock.appMetadata.pages);
                });
                // enough mocking - actual test beings here !!!
                var projectId = 'appMetadataExistingMock';

                pageMetadataService.getPage(projectId, 'S0').then(
                    function (result) {
                        logger.info('checking the result with MockedData of createdPage.');

                        // valid appMetadata
                        expect(result).not.to.be.null;

                        done();
                    },
                    function (error) {
                        if (error) {
                            logger.error('something went wrong, getPage : test');
                        }
                        done(error);
                    });

            });


            it('getPage : non existant', function (done) {

                logger.info('beginning to test [getPage : non existant]');

                // enough mocking - actual test beings here !!!
                var projectId = 'appMetadataExistingMock';

                pageMetadataService.getPage(projectId, 'test').then(
                    function () {
                        logger.info('should not get here');
                        done('should not get here');
                    },
                    function (error) {
                        expect(error).not.to.be.null;
                        done();
                    });

            });

            it('updateDisplayNames', function (done) {

                logger.info('beginning to test processUpdateDisplayNames');


                // enough mocking - actual test beings here !!!
                var projectId = 'updateDisplayNames';
                var displayNames = [{
                    pageName: 'S0',
                    displayName: 'S0Page'
                }, {
                    pageName: 'S1',
                    displayName: 'S1Page'
                }];

                pageMetadataService.updateDisplayNames(projectId, displayNames).then(
                    function (result) {
                        expect(result.operations[0].model.pages[0].displayName).to.equal('S0Page');
                        expect(result.operations[0].model.pages[1].displayName).to.equal('S1Page');
                        done();
                    },
                    function (error) {
                        if (error) {
                            logger.error('something went wrong, getPage : test');
                        }
                        done(error);
                    });


            });

            it('updateDisplayNames - with Empty Array ', function (done) {

                logger.info('beginning to test updateDisplayNames with Empty Array');


                // enough mocking - actual test beings here !!!
                var projectId = 'updateDisplayNames';
                var displayNames = null;

                pageMetadataService.updateDisplayNames(projectId, displayNames).then(
                    function (result) {
                        expect(result.operations[0].model.pages[0].displayName).to.equal('Page 1');
                        expect(result.operations[0].model.pages[1].displayName).to.equal('Page 2');
                        done();
                    },
                    function (error) {
                        if (error) {
                            logger.error('something went wrong, getPage : test');
                        }
                        done(error);
                    });
            });

            it('updateCoordinates', function (done) {

                logger.info('beginning to test updateCoordinate');


                // enough mocking - actual test beings here !!!
                var projectId = 'updateCoordinate';

                pageMetadataService.updateCoordinates(projectId, 'test').then(
                    function (result) {
                        expect(result[0].model).to.equal(appMetadataExistingOnePageMock);
                        done();
                    },
                    function (error) {
                        if (error) {
                            logger.error('something went wrong, getPage : test');
                        }
                        done(error);
                    });


            });

            it('updateCoordinates - Error ', function (done) {

                logger.info('beginning to test updateCoordinate with Error');


                // enough mocking - actual test beings here !!!
                var projectId = 'updateCoordinateWithError';

                pageMetadataService.updateCoordinates(projectId, 'test').then(
                    function () {
                        logger.info('should not get here');
                        done('should not get here');
                    },
                    function (error) {
                        expect(error.message).to.equal('Coordinate Error');
                        done();
                    });
            });

            it('process Coordinate ', function (done) {

                logger.info('beginning to test process Coordinate');

                // enough mocking - actual test beings here !!!
                var projectId = 'processCoordinates';

                pageMetadataService.processUpdateCoordinates(projectId, [
                    {
                        name: 'S0',
                        x: 100,
                        y: 100
                    },
                    {
                        name: 'S1',
                        x: 100,
                        y: 100
                    }
                ]).then(
                    function (result) {
                        expect(result.operations[0].model.pages[0].coordinates.x).to.equal(100);
                        expect(result.operations[0].model.pages[1].coordinates.x).to.equal(100);
                        done();
                    },
                    function () {
                        logger.info('should not get here');
                        done('error');
                    });
            });
        });

        describe('updateNavigationInSmartAppMetadata check', function () {
            var process = require('norman-prototype-editors-server/UIComposer/lib/services/pageMetadata');
            var allPagesObjs = require('./material/allPagesObjs.json');
            var dataModel = require('./material/dataModel.json');
            var refAppMetadata = require('./material/appMetadata.json');
            refAppMetadata.navigations = _.sortByAll(refAppMetadata.navigations, ['pageFrom', 'pageTo']);

            function test(element) {
                var pageMetadata = allPagesObjs[element];
                var appMetadata = _.clone(refAppMetadata, true);

                process.updateNavigationInSmartAppMetadata(pageMetadata, allPagesObjs, appMetadata, dataModel);

                appMetadata.navigations = _.sortByAll(appMetadata.navigations, ['pageFrom', 'pageTo']);

                expect(appMetadata).to.deep.equal(refAppMetadata);
            }

            it('Update S0', function () {
                test('S0');
            });

            it('Update S1', function () {
                test('S1');
            });

            it('Update S2', function () {
                test('S2');
            });

            it('Update S3', function () {
                test('S3');
            });
        });
    });
})();

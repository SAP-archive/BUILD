(function () {
    'use strict';
    var expect = require('norman-testing-tp').chai.expect;
    var commonServer = require('norman-common-server');
    var sinon = require('sinon');
    var snapshotService;
    var Promise = require('norman-promise');
    var testSinon = sinon.sandbox.create();
    var registryStub;
    var projectId = '0397820d2eccf02f0999a074';
    var NormanError = commonServer.NormanError;
    var promiseRejectError = new NormanError('getting snapshots failed');

    var mockSnapshotUILang = 'UI5';
    var mockSnapshotUrl = '/public/' + projectId +'/1/index.html';
    var mockLatestSnapshotUrl = '/public/' + projectId +'/latest/index.html';
    var mockSnapshotDesc = 'test1';
   var  Logger = commonServer.logging,
        loggerStub;

    var serviceLoggerMock = {
        error: function (error) {
            return error;
        },
        info: function (info) {

        },
        debug: function (log) {

        }
    };


    var mockSnapshot = [{
        'snapshotUrl': mockSnapshotUrl,
        'snapshotDesc': mockSnapshotDesc,
        'snapshotUILang': mockSnapshotUILang,
        'version': '1',
        'stats': {
            'created_by': 'Test',
            'created_at': '2015-02-19T21:20:51.837Z'
        },
        'deepLinks': [
            {
                'pageName': 'S0',
                'thumbnail': '/resources/thumbnail/S0.png',
                'pageUrl': '/public/' + projectId + '/1/index.html#S0',
                '_id': '54e777f231b0eb082610292d'
            },
            {
                'pageName': 'S1',
                'thumbnail': '/resources/thumbnail/S1.png',
                'pageUrl': '/public/' + projectId + '/1/index.html#S1',
                '_id': '54e777f231b0eb082610292c'
            },
            {
                'pageName': 'S2',
                'thumbnail': '/resources/thumbnail/S2.png',
                'pageUrl': '/public/' + projectId + '/1/index.html#S2',
                '_id': '54e777f231b0eb082610292b'
            }
        ]
    }];
    var mockSnapshotVersion1 = {
        '_id': '54e653b35b5f0854042fc545',
        'version': 1,
        'appMetadata': '442291923a76da8e09a926c3',
        'stats': {
            'created_by': 'Test',
            'created_at': '2015-02-19T21:20:51.837Z'
        },
        'artifacts': [],
        'sampleMetadata': [],
        'dataModelMetadata': [],
        'pageMetadata': [
            'f73376f673db389909a926c2',
            'a37cb0abe33db8e109a926c2',
            '0bc776d6cb7a8adf09a926c2'
        ],
        'snapshot': {
            'snapshotUrl': mockSnapshotUrl,
            'snapshotDesc': mockSnapshotDesc,
            'snapshotUILang': mockSnapshotUILang,
            'version': '1',
            'stats': {
                'created_by': 'Test',
                'created_at': '2015-02-19T21:20:51.837Z'
            },
            'deepLinks': [
                {
                    'pageName': 'S0',
                    'thumbnail': '/resources/thumbnail/S0.png',
                    'pageUrl': '/public/' + projectId + '/1/index.html#S0',
                    '_id': '54e777f231b0eb082610292d'
                },
                {
                    'pageName': 'S1',
                    'thumbnail': '/resources/thumbnail/S1.png',
                    'pageUrl': '/public/' + projectId + '/1/index.html#S1',
                    '_id': '54e777f231b0eb082610292c'
                }
            ]
        },
        'isHistory': false,
        'isSnapshot': true
    };
    var mockSnapshotVersion2 = {
        '_id': '54e653b35b5f0854042fc545',
        'version': 2,
        'appMetadata': '442291923a76da8e09a926c3',
        'stats': {
            'created_by': 'Test',
            'created_at': '2015-02-19T21:20:51.837Z'
        },
        'artifacts': [],
        'sampleMetadata': [],
        'dataModelMetadata': [],
        'pageMetadata': [
            'f73376f673db389909a926c2',
            'a37cb0abe33db8e109a926c2',
            '0bc776d6cb7a8adf09a926c2'
        ],
        'snapshot': {
            'snapshotUrl': mockSnapshotUrl,
            'snapshotDesc': mockSnapshotDesc,
            'snapshotUILang': mockSnapshotUILang,
            'version': '2',
            'stats': {
                'created_by': 'Test',
                'created_at': '2015-02-19T21:20:51.837Z'
            },
            'deepLinks': [
                {
                    'pageName': 'S0',
                    'thumbnail': '/resources/thumbnail/S0.png',
                    'pageUrl': '/public/' + projectId + '/2/index.html#S0',
                    '_id': '54e78d0af98e4168302160d5'
                },
                {
                    'pageName': 'S1',
                    'thumbnail': '/resources/thumbnail/S1.png',
                    'pageUrl': '/public/' + projectId + '/2/index.html#S1',
                    '_id': '54e78d0af98e4168302160d4'
                }
            ]
        },
        'isHistory': false,
        'isSnapshot': true
    };
    var mockSnapshotVersions = [mockSnapshotVersion1, mockSnapshotVersion2];
    var mockArtifactsArray = [
        {
            filename: 'index-prod.html',
            id: '0397820d2eccf02f0999a079',
            metadata: {
                path: 'index-prod.html',
                projectId: projectId
            }
        },
        {
            filename: 'dummy.view.xml',
            id: '0397820d2eccf02f0999a080',
            metadata: {
                path: 'view/dummy.view.xml',
                projectId: projectId
            }
        },
        {
            filename: 'dummy2.view.xml',
            id: '0397820d2eccf02f0999a081',
            metadata: {
                path: 'view/dummy2.view.xml',
                projectId: projectId
            }
        },
        {
            filename: 'controller.js',
            id: '0397820d2eccf02f0999a082',
            metadata: {
                path: 'controllers/controller.js',
                projectId: projectId
            }
        }
    ];
    var mockPrototype = {};

    var mockRequest = {originalUrl: '/api/project/' + projectId + '/prototype/snapshot', query: {}, body: {}, user: {_id : 'test'}};
    var mockRequestFailure = {originalUrl: '/api/project/raiseError/prototype/snapshot/', query: {}, body: {}, user: {_id : 'test'},
        cookies:{buildSessionId:'sessionId1'},
        context: {
            session: {
                id: 'sessionId1'
        }
    }};

    var mockResponse = {
        header: function (key, value) {
            this[key] = value;
        },
        status: function (val) {
            this.statusCode = val;
        },
        json: function (val) {
            this.json = val;
        }
    };

    var SnapshotServiceMock = {
        getSnapshots: function(projectId){
            if (projectId === 'raiseError') {
                return Promise.reject(promiseRejectError);
            } else if (projectId === 'noData') {
                return Promise.resolve(null);
            }
            else {
                return Promise.resolve(mockSnapshot);
            }
        },
        createSnapshot: function(projectId){
            if (projectId === 'raiseError') {
                return Promise.reject(promiseRejectError);
            } else if (projectId === 'noData') {
                return Promise.resolve(null);
            }
            else {
                var result = {};
                result.snapshotMetadata = {
                    pageMetadata: [
                        {_id: 'f4bf4468f950f31c0a0e35d1'},
                        {_id: 'f4bf4468f950f31c0a0e35d2'}
                    ],
                    appMetadata: {}
                };
                result.snapshotVersion = mockSnapshot.snapshotVersion;
                return Promise.resolve(result);
            }
        },
        saveSnapshotUrl: function(){
            var resultJson = {};
            resultJson.deepLinks = mockSnapshot[0].deepLinks;
            resultJson.finalSnapshotUrl = mockLatestSnapshotUrl;
            resultJson.snapshotUILang = mockSnapshotUILang;
            return Promise.resolve(resultJson);

        }
    };

    var PrototypeServiceMock = {
        getPrototype: function(){
            return Promise.resolve(mockPrototype);
        },
        getAllArtifactsForDeployment: function(){
            return Promise.resolve(mockArtifactsArray);
        },
        getVersionsbyMatchingProperty: function () {
            if (projectId === 'raiseError') {
                return Promise.reject(promiseRejectError);
            }
            else {
                return Promise.resolve(mockSnapshotVersions);
            }
        }
    };

    var DeployServiceMock = {
        retrieveZippedSnapshotContent: function(){
            return Promise.resolve(new Buffer('Test', 'base64'));
        },
        deploySnapshot: function(){
            return Promise.resolve({url: mockLatestSnapshotUrl});
        }
    };

    var PrototypeBuilderMock = {
        generateSnapshot: function(){
            return Promise.resolve({});
        }
    };

    describe('SharedWorkspace.Snapshot.API.Unit.Test', function () {

        this.timeout(30000);

        beforeEach(function (done) {
            var registry = commonServer.registry;
            registryStub = testSinon.stub(registry, 'getModule');
            registryStub.withArgs('SnapshotService').returns(SnapshotServiceMock);
            registryStub.withArgs('PrototypeService').returns(PrototypeServiceMock);
            registryStub.withArgs('DeployService').returns(DeployServiceMock);
            registryStub.withArgs('PrototypeBuilder').returns(PrototypeBuilderMock);
            testSinon.stub(Logger, 'createLogger').returns(serviceLoggerMock);
            snapshotService = require('../../lib/api/snapshot/controller');
            done();
        });
        afterEach(function (done) {
            testSinon.restore();
            done();
        });

        it('SharedWorkspace.api.snapshot show()', function (done) {
            Promise.resolve(snapshotService.show(mockRequest, mockResponse))
                .then(function () {
                    expect(mockResponse.statusCode).to.be.equal(200);
                    done();
                });
        });

        /*it('SharedWorkspace.api.snapshot create()', function (done) {
         Promise.resolve(snapshotService.create(mockRequest, mockResponse))
         .then(function () {
         expect(mockResponse.statusCode).to.be.equal(200);
         done();
         });
         });*/

        /*it('SharedWorkspace.api.snapshot retrieveZippedSnapshot()', function (done) {
         Promise.resolve(snapshotService.retrieveZippedSnapshot(mockRequest, mockResponse))
         .then(function () {
         expect(mockResponse.header).to.be.equal(200);
         done();
         });
         });*/


        //it('SharedWorkspace.api.snapshot show() failure scenario', function (done) {
        //    Promise.resolve(snapshotService.show(mockRequestFailure, mockResponse))
        //        .then(function () {
        //            expect(mockResponse.statusCode).to.be.equal(500);
        //            done();
        //        });
        //});

        //it('SharedWorkspace.api.snapshot create() failure scenario', function (done) {
        //    Promise.resolve(snapshotService.create(mockRequestFailure, mockResponse))
        //        .then(function () {
        //            expect(mockResponse.statusCode).to.be.equal(500);
        //            done();
        //        });
        //});

        //it('SharedWorkspace.api.snapshot retrieveZippedSnapshot() failure scenario', function (done) {
        //    Promise.resolve(snapshotService.retrieveZippedSnapshot(mockRequestFailure, mockResponse))
        //        .then(function () {
        //            expect(mockResponse.statusCode).to.be.equal(500);
        //            done();
        //        });
        //});

    });
})();

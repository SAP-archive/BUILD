'use strict';

var chai = require('norman-testing-tp').chai;
var sinon = require('norman-testing-tp').sinon;
var Promise = require('norman-promise');
var PrototypeBuilderService = require('../../lib/services/builder/index.js');
var fs = require('fs');
var path = require('path');
var expect = chai.expect;
var commonServer = require('norman-common-server');
var mongoose = commonServer.db.mongoose;
var ObjectId = mongoose.Types.ObjectId;

describe('Builder Service', function () {

    var uiCatalogService;
    var sharedWorkspaceService;
    var artifactService;
    var protoBuilder;
    var assetService;
    var projectId = new ObjectId();
    var assetId = new ObjectId();
    var badProjectId = new ObjectId();
    var badAssetId = new ObjectId();

    var currentAppMetadata;
    var currentPageMetadata;
    var currentSampleDataMetadata;

    var retrieveTestData = function (testFileName) {
        var testData = {};
        testData.jsonSource = JSON.parse(fs.readFileSync(path.resolve(__dirname, testFileName + '.json')), 'utf-8');
        testData.jsonSource._id = testData.jsonSource.name;
        if (fs.existsSync(path.resolve(__dirname, testFileName + '.xml'))) {
            testData.xmlTarget = fs.readFileSync(path.resolve(__dirname, testFileName + '.xml')).toString().replace(/\r\n/g, '\n').replace(/\t/g, '    ');
        }
        if (fs.existsSync(path.resolve(__dirname, testFileName + '.controller'))) {
            testData.controllerTarget = fs.readFileSync(path.resolve(__dirname, testFileName + '.controller')).toString().replace(/\r\n/g, '\n').replace(/\t/g, '    ');
        }
        return testData;
    };

    before(function () {
        this.timeout(5000);
        var uiCatalogCustom = JSON.parse(fs.readFileSync(path.resolve(__dirname, './material/r1c1ui5.json')), 'utf-8');
        var uiCatalogRoot = JSON.parse(fs.readFileSync(path.resolve(__dirname, './material/r1ui5.json')), 'utf-8');
        var dataModel = {projectId: projectId, entities : []};
        uiCatalogService = {
            getCompatibleCatalogs: function () {
                return new Promise(function (resolve) {
                    resolve([uiCatalogCustom, uiCatalogRoot]);
                });
            }
        };
        sharedWorkspaceService = {
            getMetadata: function () {
                return new Promise(function (resolve) {
                    resolve({
                        appMetadata: {
                            toObject: function () {
                                return currentAppMetadata;
                            }
                        },
                        pageMetadata: {
                            toObject: function () {
                                return currentPageMetadata;
                            }
                        },
                        dataModelMetadata: [{
                            toObject: function () {
                                return dataModel;
                            }
                        }],
                        sampleMetadata: [{
                            toObject: function () {
                                return currentSampleDataMetadata;
                            }
                        }]
                    });
                });
            }
        };
        artifactService = {
            uploadArtifacts: function (uploadProjectId) {
                return new Promise(function (resolve, reject) {
                    if (uploadProjectId === badProjectId) {
                        reject('Bad Project ID');
                    }
                    else {
                        resolve('OK');
                    }
                });
            },
            removeArtifactByMetadata: function (metadata) {
                return new Promise(function (resolve, reject) {
                    if (metadata.projectId === badProjectId) {
                        reject('Bad Project ID');
                    }
                    else {
                        resolve('OK');
                    }
                });
            },
            copyAssetsToArtifacts: function () {

            }
        };
        assetService = {
            getAssets: function (assetsProjectId) {
                return new Promise(function (resolve, reject) {
                    if (assetsProjectId === badProjectId) {
                        reject('Bad Project ID');
                    }
                    else {
                        resolve([{_id: assetId, filename: 'asset1.png'}]);
                    }
                });
            },
            getAssetWithContent: function (requestAssetId) {
                return new Promise(function (resolve, reject) {
                    if (requestAssetId === badAssetId) {
                        reject('Bad Project ID');
                    }
                    else {
                        resolve({fileContent: 'AssetOK'});
                    }
                });
            }
        };
        protoBuilder = new PrototypeBuilderService(sharedWorkspaceService, uiCatalogService, artifactService, assetService);

    });

    describe('can be stubbed', function () {
        it('will not work if you don\'t pass all the parameters', function () {
            var proto1 = new PrototypeBuilderService(sharedWorkspaceService);
            expect(proto1.initialized).to.be.false;
            var proto2 = new PrototypeBuilderService(sharedWorkspaceService, uiCatalogService);
            expect(proto2.initialized).to.be.false;
        });

        it('will not allow to reinitialized an initialized builder service', function () {
            sinon.spy(commonServer.registry, 'getModule');
            expect(protoBuilder.initialized).to.be.true;
            protoBuilder.initialize();
            expect(commonServer.registry.getModule.callCount).to.equal(0);
        });
    });

    describe('knows how to generate multiple pages artifacts', function () {

        before(function () {
            sinon.spy(uiCatalogService, 'getCompatibleCatalogs');
            sinon.spy(sharedWorkspaceService, 'getMetadata');
            sinon.spy(artifactService, 'uploadArtifacts');
        });

        after(function () {
            uiCatalogService.getCompatibleCatalogs.restore();
            sharedWorkspaceService.getMetadata.restore();
            artifactService.uploadArtifacts.restore();
        });

        // TODO Why does this randomly fails ?
        xit('when you pass everything to it', function (done) {

            var testData = retrieveTestData('material/properties/simplePage');
            var testData2 = retrieveTestData('material/groups/pageWithChildren');
            var emptyEDMX = fs.readFileSync(path.resolve(__dirname, 'material/ui5/emptyModel.edmx')).toString().replace(/\r\n/g, '\n').replace(/\t/g, '    ').replace(/projectId/g, projectId.toString());
            currentPageMetadata = [testData.jsonSource, testData2.jsonSource];
            currentAppMetadata = {
                uiLang: 'ui5',
                catalogId: 'customCatalog',
                navigations: [
                    {
                        routeName: 'SimplePage',
                        targetPageId: 'SimplePage',
                        targetAggregation: 'pages'
                    },
                    {
                        routeName: 'PageWithChildren',
                        targetPageId: 'PageWithChildren',
                        targetAggregation: 'pages'
                    }
                ]
            };
            protoBuilder.generatePrototypePages(projectId).then(function (response) {
                expect(uiCatalogService.getCompatibleCatalogs.callCount).to.equal(1);
                expect(uiCatalogService.getCompatibleCatalogs.getCall(0).args[0]).to.equal('customCatalog');
                expect(sharedWorkspaceService.getMetadata.callCount).to.equal(1);
                expect(sharedWorkspaceService.getMetadata.getCall(0).args[0]).to.equal(projectId);
                expect(artifactService.uploadArtifacts.callCount).to.equal(1);
                expect(artifactService.uploadArtifacts.getCall(0).args[0]).to.equal(projectId);
                expect(artifactService.uploadArtifacts.getCall(0).args[1].length).to.equal(9);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][0].path).to.equal('view/SimplePage.view.xml');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][0].filecontent.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData.xmlTarget);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][1].path).to.equal('view/SimplePage.controller.js');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][1].filecontent.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData.controllerTarget);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][2].path).to.equal('view/PageWithChildren.view.xml');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][2].filecontent.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData2.xmlTarget);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][3].path).to.equal('view/PageWithChildren.controller.js');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][3].filecontent.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData2.controllerTarget);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][4].path).to.equal('index.html');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][5].path).to.equal('Component.js');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][6].path).to.equal('models/metadata.xml');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][6].filecontent.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(emptyEDMX);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][7].path).to.equal('models/formulaCalculation.js');
                expect(response).to.equal('OK');

                done();
            }).catch(done);
        });

        it('but can fail if you\'ve been bad', function (done) {

            var testData = retrieveTestData('material/properties/simplePage');
            var testData2 = retrieveTestData('material/groups/pageWithChildren');
            protoBuilder.generatePrototypePages(badProjectId, [testData.jsonSource, testData2.jsonSource], 'ui5').then(function () {
                done('Should fail');
            }).catch(function (error) {
                expect(error).to.be.not.null;
                done();
            });
        });
    });

    describe('knows how to delete a pages artifacts', function () {

        before(function () {
            sinon.spy(uiCatalogService, 'getCompatibleCatalogs');
            sinon.spy(sharedWorkspaceService, 'getMetadata');
            sinon.spy(artifactService, 'uploadArtifacts');
            sinon.spy(artifactService, 'removeArtifactByMetadata');
        });

        after(function () {
            uiCatalogService.getCompatibleCatalogs.restore();
            sharedWorkspaceService.getMetadata.restore();
            artifactService.uploadArtifacts.restore();
            artifactService.removeArtifactByMetadata.restore();
        });

        it('when you pass everything to it', function (done) {

            var testData = retrieveTestData('material/properties/simplePage');
            var testData2 = retrieveTestData('material/groups/pageWithChildren');
            protoBuilder.deletePrototypePage(projectId, testData.jsonSource.name, {
                pages: [testData.jsonSource, testData2.jsonSource],
                uiLang: 'ui5',
                catalogId: 'customCatalog'
            }).then(function (response) {
                expect(uiCatalogService.getCompatibleCatalogs.callCount).to.equal(0);
                expect(sharedWorkspaceService.getMetadata.callCount).to.equal(0);
                expect(artifactService.uploadArtifacts.callCount).to.equal(1);
                expect(artifactService.uploadArtifacts.getCall(0).args[0]).to.equal(projectId);
                expect(artifactService.uploadArtifacts.getCall(0).args[1].length).to.equal(1);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][0].path).to.equal('Component.js');
                expect(artifactService.removeArtifactByMetadata.callCount).to.equal(2);
                expect(artifactService.removeArtifactByMetadata.getCall(0).args[0]['metadata.path']).to.equal('view/SimplePage.view.xml');
                expect(artifactService.removeArtifactByMetadata.getCall(1).args[0]['metadata.path']).to.equal('view/SimplePage.controller.js');
                expect(response.length).to.equal(3);

                done();
            }).catch(done);
        });

        it('but can fail if you\'ve been bad', function (done) {

            var testData = retrieveTestData('material/properties/simplePage');
            var testData2 = retrieveTestData('material/groups/pageWithChildren');
            protoBuilder.deletePrototypePage(badProjectId, testData.jsonSource.name, {
                pages: [testData.jsonSource, testData2.jsonSource],
                uiLang: 'ui5'
            }).then(function () {
                done('Should fail');
            }).catch(function (error) {
                expect(error).to.be.not.null;
                done();
            });
        });
    });

    describe('knows how to generate a complete app', function () {

        before(function () {
            sinon.spy(uiCatalogService, 'getCompatibleCatalogs');
            sinon.spy(sharedWorkspaceService, 'getMetadata');
            sinon.spy(artifactService, 'uploadArtifacts');
        });

        after(function () {
            uiCatalogService.getCompatibleCatalogs.restore();
            sharedWorkspaceService.getMetadata.restore();
            artifactService.uploadArtifacts.restore();
        });

        it('when you pass everything to it', function (done) {

            var testData = retrieveTestData('material/properties/simplePage');
            var testData2 = retrieveTestData('material/groups/pageWithChildren');
            var emptyEDMX = fs.readFileSync(path.resolve(__dirname, 'material/ui5/emptyModel.edmx')).toString().replace(/\r\n/g, '\n').replace(/\t/g, '    ').replace(/projectId/g, projectId.toString());
            var sampleRouter = fs.readFileSync(path.resolve(__dirname, 'material/ui5/complexRouter.js.tmpl')).toString().replace(/\r\n/g, '\n').replace(/\t/g, '    ');
            currentPageMetadata = [testData.jsonSource, testData2.jsonSource];
            currentAppMetadata = {
                uiLang: 'ui5',
                appType: 'App',
                catalogId: 'customCatalog',
                navigations: [
                    {
                        routeName: 'SimplePage',
                        targetPageId: 'SimplePage',
                        targetAggregation: 'pages'
                    },
                    {
                        routeName: 'PageWithChildren',
                        targetPageId: 'PageWithChildren',
                        targetAggregation: 'pages'
                    }
                ]
            };
            protoBuilder.createPrototype(projectId).then(function (response) {
                expect(uiCatalogService.getCompatibleCatalogs.callCount).to.equal(1);
                expect(uiCatalogService.getCompatibleCatalogs.getCall(0).args[0]).to.equal('customCatalog');
                expect(sharedWorkspaceService.getMetadata.callCount).to.equal(1);
                expect(sharedWorkspaceService.getMetadata.getCall(0).args[0]).to.equal(projectId);
                expect(artifactService.uploadArtifacts.callCount).to.equal(1);
                expect(artifactService.uploadArtifacts.getCall(0).args[0]).to.equal(projectId);
                expect(artifactService.uploadArtifacts.getCall(0).args[1].length).to.equal(9);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][0].path).to.equal('view/SimplePage.view.xml');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][0].filecontent.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData.xmlTarget);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][1].path).to.equal('view/SimplePage.controller.js');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][1].filecontent.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData.controllerTarget);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][2].path).to.equal('view/PageWithChildren.view.xml');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][2].filecontent.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData2.xmlTarget);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][3].path).to.equal('view/PageWithChildren.controller.js');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][3].filecontent.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData2.controllerTarget);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][4].path).to.equal('index.html');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][5].path).to.equal('Component.js');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][5].filecontent.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(sampleRouter);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][6].path).to.equal('models/metadata.xml');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][6].filecontent.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(emptyEDMX);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][7].path).to.equal('models/formulaCalculation.js');
                expect(response).to.equal('OK');

                done();
            }).catch(done);
        });

        it('but can fail if you\'ve been bad', function (done) {

            var testData = retrieveTestData('material/properties/simplePage');
            var testData2 = retrieveTestData('material/groups/pageWithChildren');
            protoBuilder.createPrototype(badProjectId, [testData.jsonSource, testData2.jsonSource], 'ui5').then(function () {
                done('Should fail');
            }).catch(function (error) {
                expect(error).to.be.not.null;
                done();
            });
        });
    });

    describe('knows how to generate a snapshot', function () {

        before(function () {
            sinon.spy(uiCatalogService, 'getCompatibleCatalogs');
            sinon.spy(sharedWorkspaceService, 'getMetadata');
            sinon.spy(artifactService, 'uploadArtifacts');
            sinon.spy(artifactService, 'copyAssetsToArtifacts');
            sinon.spy(assetService, 'getAssetWithContent');
        });

        after(function () {
            uiCatalogService.getCompatibleCatalogs.restore();
            sharedWorkspaceService.getMetadata.restore();
            artifactService.uploadArtifacts.restore();
            artifactService.copyAssetsToArtifacts.restore();
            assetService.getAssetWithContent.restore();
        });

        it('when you pass everything to it', function (done) {

            var testData = retrieveTestData('material/properties/simplePage');
            var testData2 = retrieveTestData('material/groups/pageWithChildren');
            var testData3 = retrieveTestData('material/assets/pageWithAsset');
            var sampleRouter = fs.readFileSync(path.resolve(__dirname, 'material/ui5/tripleRouter.js.tmpl')).toString().replace(/\r\n/g, '\n').replace(/\t/g, '    ');
            currentPageMetadata = [testData.jsonSource, testData2.jsonSource, testData3.jsonSource];
            currentAppMetadata = {
                uiLang: 'ui5',
                appType: 'App',
                catalogId: 'customCatalog',
                navigations: [
                    {
                        routeName: 'SimplePage',
                        targetPageId: 'SimplePage',
                        targetAggregation: 'pages'
                    },
                    {
                        routeName: 'PageWithChildren',
                        targetPageId: 'PageWithChildren',
                        targetAggregation: 'pages'
                    },
                    {
                        routeName: 'PageWithAsset',
                        targetPageId: 'PageWithAsset',
                        targetAggregation: 'pages'
                    }
                ]
            };
            protoBuilder.generateSnapshot(projectId, 1).then(function (response) {
                expect(uiCatalogService.getCompatibleCatalogs.callCount).to.equal(1);
                expect(uiCatalogService.getCompatibleCatalogs.getCall(0).args[0]).to.equal('customCatalog');
                expect(sharedWorkspaceService.getMetadata.callCount).to.equal(1);
                expect(sharedWorkspaceService.getMetadata.getCall(0).args[0]).to.equal(projectId);
                expect(artifactService.uploadArtifacts.callCount).to.equal(1);
                expect(artifactService.uploadArtifacts.getCall(0).args[0]).to.equal(projectId);
                expect(artifactService.uploadArtifacts.getCall(0).args[1].length).to.equal(12);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][0].path).to.equal('view/SimplePage.view.xml');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][0].filecontent.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData.xmlTarget);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][1].path).to.equal('view/SimplePage.controller.js');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][1].filecontent.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData.controllerTarget);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][2].path).to.equal('view/PageWithChildren.view.xml');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][2].filecontent.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData2.xmlTarget);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][3].path).to.equal('view/PageWithChildren.controller.js');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][3].filecontent.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData2.controllerTarget);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][4].path).to.equal('view/PageWithAsset.view.xml');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][4].filecontent.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData3.xmlTarget);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][5].path).to.equal('view/PageWithAsset.controller.js');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][5].filecontent.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData3.controllerTarget);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][6].path).to.equal('index.html');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][7].path).to.equal('Component.js');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][7].filecontent.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(sampleRouter);
                expect(assetService.getAssetWithContent.callCount).to.equal(1);
                expect(assetService.getAssetWithContent.getCall(0).args[0]).to.equal('54eb4221df562d9aa035aef7');

                expect(response).to.equal('OK');

                done();
            }).catch(done);
        });

        it('but can fail if you\'ve been bad', function (done) {

            var testData = retrieveTestData('material/properties/simplePage');
            var testData2 = retrieveTestData('material/groups/pageWithChildren');
            protoBuilder.generateSnapshot(badProjectId, 1, [testData.jsonSource, testData2.jsonSource], {
                pages: [testData.jsonSource, testData2.jsonSource],
                uiLang: 'ui5'
            }).then(function () {
                done('Should fail');
            }).catch(function (error) {
                expect(error).to.be.not.null;
                done();
            });
        });
    });
});

'use strict';

var chai = require('norman-testing-tp').chai;
    var sinon = require('norman-testing-tp').sinon;
var AppServer = require('node-sap-app-server');
var mongoose = require('norman-common-server').db.mongoose;
var ObjectId = mongoose.Types.ObjectId;
var fs = require('fs');
var path = require('path');
var expect = chai.expect;
var NormanTestServer = require('norman-testing-server').server;

xdescribe('API Test', function () {
    var prototypeBuilderService;
    var composerPrototypeService;
    var uiCatalogService;
    var prototypeService;
    var artifactService;
    var assetService;
    var modelService;
    var config;
    var ui5CustomCatalog;
    var ui5RootCatalog;
    var swProcessService;

    var dropDB = function (done) {
        config = JSON.parse(fs.readFileSync(path.join(__dirname, '../../config-protobuilder.json')));
        if (!mongoose.connection.db) {
            mongoose.connect('mongodb://localhost/' + config.db.database);
            mongoose.connection.on('open', function () {
                mongoose.connection.db.dropDatabase(function () {
                    done();
                });
            });
        }
        else {
            mongoose.connection.db.dropDatabase(function () {
                done();
            });
        }
    };

    before(dropDB);

    before(function (done) {
        this.timeout(100000);
        var myServices = new AppServer.ServiceContainer({});
        myServices.addService('norman-mock-stuff', require('./mockIndex.js'), {});
        NormanTestServer.initialize(path.join(__dirname, '../../config.json'), myServices).then(function () {
            // normanServer = server;
            done();
        });
    });

    before(function (done) {
        this.timeout(100000);
        var registry = require('norman-common-server').registry;
        prototypeBuilderService = registry.getModule('PrototypeBuilder');
        uiCatalogService = registry.getModule('UICatalog');
        prototypeService = registry.getModule('PrototypeService');
        composerPrototypeService = registry.getModule('composerPrototypeService');
        artifactService = registry.getModule('ArtifactService');
        assetService = registry.getModule('AssetService');
        modelService = registry.getModule('Model');
        swProcessService = registry.getModule('SwProcessing');
        uiCatalogService.initializeDb(done);
    });

    before('Load Catalogs', function (done) {
        this.timeout(50000);
        uiCatalogService.getCatalogs().then(function (catalogs) {
            // console.log(catalogs);
            catalogs.forEach(function (catalog) {
                if (catalog.catalogName === 'r1c1ui5') {
                    ui5CustomCatalog = catalog;
                }
                if (catalog.catalogName === 'r4c1ui5') {
                    ui5RootCatalog = catalog;
                }
            });

            done();
        });
    });

    after(function (done) {
        this.timeout(50000);
        // console.log('Dropping DB');
        dropDB(function (result) {
            // console.log('DB Dropped');
            done(result);
        });
    });

    var retrieveTestData = function (testFileName) {
        var testData = {};
        testData.jsonSource = JSON.parse(fs.readFileSync(path.resolve(__dirname, testFileName + '.json')), 'utf-8');
        testData.jsonSource.catalogId = ui5CustomCatalog.catalogId;
        if (fs.existsSync(path.resolve(__dirname, testFileName + '.xml'))) {
            testData.xmlTarget = fs.readFileSync(path.resolve(__dirname, testFileName + '.xml')).toString().replace(/\r\n/g, '\n').replace(/\t/g, '    ');
        }
        if (fs.existsSync(path.resolve(__dirname, testFileName + '.controller'))) {
            testData.controllerTarget = fs.readFileSync(path.resolve(__dirname, testFileName + '.controller')).toString().replace(/\r\n/g, '\n').replace(/\t/g, '    ');
        }
        return testData;
    };
    var projectId;

    var createPrototype = function (projectId, numPages, createdBy) {
        var req = { body: { createPrototype : {
            numPages: numPages
        }}};

        return swProcessService.processMetadata(projectId, null, req, createdBy);
    };

    describe('generatePrototypePages', function () {
        var testData;
        var testData2;

        before('Setup Prototype', function (done) {

            projectId = new ObjectId().toString();
            modelService.getModel(projectId);
            createPrototype(projectId, 0, 'ProtoBuilder-Test').then(function () {
                sinon.spy(uiCatalogService, 'getCompatibleCatalogs');
                sinon.spy(prototypeService, 'getMetadata');
                sinon.spy(artifactService, 'uploadArtifacts');
                done();
            });
        });

        after(function () {
            uiCatalogService.getCompatibleCatalogs.restore();
            prototypeService.getMetadata.restore();
            artifactService.uploadArtifacts.restore();
        });

        it('will generate the prototype views and controllers and store them in SharedWorkspace', function (done) {
            testData = retrieveTestData('material/pages/simplePage');
            testData2 = retrieveTestData('material/pages/pageWithChildren');
            prototypeBuilderService.generatePrototypePages(projectId, [testData.jsonSource, testData2.jsonSource], {
                catalogId: ui5CustomCatalog.catalogId.toString(),
                pages: [testData.jsonSource, testData2.jsonSource],
                uiLang: 'ui5'
            }).then(function (response) {
                expect(uiCatalogService.getCompatibleCatalogs.callCount).to.equal(1);
                expect(uiCatalogService.getCompatibleCatalogs.getCall(0).args[0]).to.equal(ui5RootCatalog.catalogId.toString());
                expect(prototypeService.getMetadata.callCount).to.equal(1);
                expect(prototypeService.getMetadata.getCall(0).args[0].toString()).to.equal(projectId);
                expect(artifactService.uploadArtifacts.callCount).to.equal(1);
                expect(artifactService.uploadArtifacts.getCall(0).args[0]).to.equal(projectId);
                expect(artifactService.uploadArtifacts.getCall(0).args[1].length).to.equal(4);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][0].path).to.equal('view/SimplePage.view.xml');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][0].filecontent.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData.xmlTarget);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][1].path).to.equal('view/SimplePage.controller.js');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][1].filecontent.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData.controllerTarget);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][2].path).to.equal('view/PageWithChildren.view.xml');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][2].filecontent.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData2.xmlTarget);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][3].path).to.equal('view/PageWithChildren.controller.js');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][3].filecontent.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData2.controllerTarget);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][4].path).to.equal('Component.js');
                // Should have saved 2 files
                expect(response.length).to.equal(5);

                done();
            }).catch(done);
        });

        it('will have generated properly the XML View', function (done) {
            artifactService.getArtifactByPath(projectId, 'view/SimplePage.view.xml').then(function (artifact) {
                var readStream = artifact.readStream;
                var buffer = '';
                readStream.on('data', function (chunk) {
                    buffer += chunk;
                });

                // dump contents to console when complete
                readStream.on('end', function () {
                    expect(buffer.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData.xmlTarget);
                    done();
                });

            }).catch(done);
        });

        it('will have generated properly the JS Controller View', function (done) {
            artifactService.getArtifactByPath(projectId, 'view/SimplePage.controller.js').then(function (artifact) {
                var readStream = artifact.readStream;
                var buffer = '';
                readStream.on('data', function (chunk) {
                    buffer += chunk;
                });

                // dump contents to console when complete
                readStream.on('end', function () {
                    expect(buffer.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData.controllerTarget);
                    done();
                });

            }).catch(done);
        });
    });

    describe('deletePrototypePage', function () {
        var testData;
        var testData2;

        before(function (done) {
            projectId = new ObjectId().toString();
            modelService.getModel(projectId);
            createPrototype(projectId, 1, 'ProtoBuilder-Test').then(function () {
                done();
            });
        });

        before('will generate the prototype views and controllers and store them in SharedWorkspace', function (done) {
            testData = retrieveTestData('material/pages/simplePage');
            testData2 = retrieveTestData('material/pages/pageWithChildren');
            sinon.spy(uiCatalogService, 'getCompatibleCatalogs');
            sinon.spy(prototypeService, 'getMetadata');
            sinon.spy(artifactService, 'uploadArtifacts');
            sinon.spy(artifactService, 'removeArtifactByMetadata');
            prototypeBuilderService.generatePrototypePages(projectId, [testData.jsonSource, testData2.jsonSource], {
                catalogId: ui5CustomCatalog.catalogId.toString(),
                pages: [testData.jsonSource, testData2.jsonSource],
                uiLang: 'ui5'
            }).then(function (response) {
                expect(uiCatalogService.getCompatibleCatalogs.callCount).to.equal(1);
                expect(uiCatalogService.getCompatibleCatalogs.getCall(0).args[0]).to.equal(ui5CustomCatalog.catalogId.toString());
                expect(prototypeService.getMetadata.callCount).to.equal(1);
                expect(prototypeService.getMetadata.getCall(0).args[0].toString()).to.equal(projectId);
                expect(artifactService.uploadArtifacts.callCount).to.equal(1);
                expect(artifactService.uploadArtifacts.getCall(0).args[0]).to.equal(projectId);
                expect(artifactService.uploadArtifacts.getCall(0).args[1].length).to.equal(5);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][0].path).to.equal('view/SimplePage.view.xml');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][0].filecontent.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData.xmlTarget);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][1].path).to.equal('view/SimplePage.controller.js');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][1].filecontent.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData.controllerTarget);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][2].path).to.equal('view/PageWithChildren.view.xml');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][2].filecontent.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData2.xmlTarget);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][3].path).to.equal('view/PageWithChildren.controller.js');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][3].filecontent.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData2.controllerTarget);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][4].path).to.equal('Component.js');
                uiCatalogService.getCompatibleCatalogs.restore();
                prototypeService.getMetadata.restore();
                artifactService.uploadArtifacts.restore();
                artifactService.removeArtifactByMetadata.restore();
                // Should have saved 2 files
                expect(response.length).to.equal(5);

                done();
            }).catch(done);
        });

        before(function () {
            sinon.spy(uiCatalogService, 'getCompatibleCatalogs');
            sinon.spy(prototypeService, 'getMetadata');
            sinon.spy(artifactService, 'uploadArtifacts');
            sinon.spy(artifactService, 'removeArtifactByMetadata');
        });

        after(function () {
            uiCatalogService.getCompatibleCatalogs.restore();
            prototypeService.getMetadata.restore();
            artifactService.uploadArtifacts.restore();
            artifactService.removeArtifactByMetadata.restore();
        });


        it('will remove the prototype page based on it\'s name and update SharedWorkspace', function (done) {

            prototypeBuilderService.deletePrototypePage(projectId, testData.jsonSource.name, {
                catalogId: ui5CustomCatalog.catalogId.toString(),
                pages: [testData.jsonSource, testData2.jsonSource],
                uiLang: 'ui5'
            }).then(function (response) {
                expect(uiCatalogService.getCompatibleCatalogs.callCount).to.equal(0);
                expect(prototypeService.getMetadata.callCount).to.equal(0);
                expect(artifactService.uploadArtifacts.callCount).to.equal(1);
                expect(artifactService.uploadArtifacts.getCall(0).args[0]).to.equal(projectId);
                expect(artifactService.uploadArtifacts.getCall(0).args[1].length).to.equal(1);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][0].path).to.equal('Component.js');
                expect(artifactService.removeArtifactByMetadata.callCount).to.equal(2);
                // console.log(artifactService.removeArtifactByMetadata.getCall(0).args[0]);
                expect(artifactService.removeArtifactByMetadata.getCall(0).args[0]['metadata.path']).to.equal('view/SimplePage.view.xml');
                expect(artifactService.removeArtifactByMetadata.getCall(1).args[0]['metadata.path']).to.equal('view/SimplePage.controller.js');
                // Should have saved 2 files
                expect(response.length).to.equal(3);

                done();
            }).catch(done);
        });

        it('will have generated properly the XML View', function (done) {
            artifactService.getArtifactByPath(projectId, 'view/SimplePage.view.xml').then(function (artifact) {
                expect(artifact).to.be.null;
                done();
            }).catch(done);
        });

        it('will have generated properly the JS Controller View', function (done) {
            artifactService.getArtifactByPath(projectId, 'view/SimplePage.controller.js').then(function (artifact) {
                expect(artifact).to.be.null;
                done();
            }).catch(done);
        });
    });

    xdescribe('createPrototype', function () {
        var testData;
        var testData2;

        before(function (done) {

            projectId = new ObjectId().toString();
            modelService.getModel(projectId);
            createPrototype(projectId, 1, 'ProtoBuilder-Test').then(function () {
                sinon.spy(uiCatalogService, 'getCompatibleCatalogs');
                sinon.spy(prototypeService, 'getMetadata');
                sinon.spy(artifactService, 'uploadArtifacts');
                done();
            });
        });

        after(function () {
            uiCatalogService.getCompatibleCatalogs.restore();
            prototypeService.getMetadata.restore();
            artifactService.uploadArtifacts.restore();
        });

        it('will generate the prototype view and controller and store them in SharedWorkspace', function (done) {
            testData = retrieveTestData('material/pages/simplePage');
            testData2 = retrieveTestData('material/pages/pageWithChildren');
            prototypeBuilderService.createPrototype(projectId, [testData.jsonSource, testData2.jsonSource], {
                catalogId: ui5CustomCatalog.catalogId.toString(),
                pages: [testData.jsonSource, testData2.jsonSource]
            }).then(function (response) {
                expect(uiCatalogService.getCompatibleCatalogs.callCount).to.equal(1);
                expect(uiCatalogService.getCompatibleCatalogs.getCall(0).args[0]).to.equal(ui5CustomCatalog.catalogId.toString());
                expect(prototypeService.getMetadata.callCount).to.equal(1);
                expect(prototypeService.getMetadata.getCall(0).args[0].toString()).to.equal(projectId);
                expect(artifactService.uploadArtifacts.callCount).to.equal(1);
                expect(artifactService.uploadArtifacts.getCall(0).args[0]).to.equal(projectId);
                expect(artifactService.uploadArtifacts.getCall(0).args[1].length).to.equal(6);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][0].path).to.equal('view/SimplePage.view.xml');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][0].filecontent.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData.xmlTarget);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][1].path).to.equal('view/SimplePage.controller.js');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][1].filecontent.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData.controllerTarget);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][2].path).to.equal('view/PageWithChildren.view.xml');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][2].filecontent.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData2.xmlTarget);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][3].path).to.equal('view/PageWithChildren.controller.js');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][3].filecontent.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData2.controllerTarget);
                expect(artifactService.uploadArtifacts.getCall(0).args[1][4].path).to.equal('Component.js');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][5].path).to.equal('index.html');
                // Should have saved 2 files
                expect(response.length).to.equal(6);

                done();
            }).catch(done);
        });

        it('will have generated properly the XML View', function (done) {
            artifactService.getArtifactByPath(projectId, 'view/SimplePage.view.xml').then(function (artifact) {
                var readStream = artifact.readStream;
                var buffer = '';
                readStream.on('data', function (chunk) {
                    buffer += chunk;
                });

                // dump contents to console when complete
                readStream.on('end', function () {
                    expect(buffer.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData.xmlTarget);
                    done();
                });

            }).catch(done);
        });

        it('will have generated properly the JS Controller View', function (done) {
            artifactService.getArtifactByPath(projectId, 'view/SimplePage.controller.js').then(function (artifact) {
                var readStream = artifact.readStream;
                var buffer = '';
                readStream.on('data', function (chunk) {
                    buffer += chunk;
                });

                // dump contents to console when complete
                readStream.on('end', function () {
                    expect(buffer.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData.controllerTarget);
                    done();
                });

            }).catch(done);
        });
    });

    describe('generateSnapshot', function () {
        var testData;
        var testData2;
        var testData3;
        var assetId;
        before(function (done) {
            projectId = new ObjectId().toString();
            modelService.getModel(projectId);
            createPrototype(projectId, 0, 'ProtoBuilder-Test').then(function () {
                sinon.spy(uiCatalogService, 'getCompatibleCatalogs');
                sinon.spy(prototypeService, 'getMetadata');
                sinon.spy(artifactService, 'uploadArtifacts');
                sinon.spy(assetService, 'getAssetWithContent');
                done();
            });

        });

        before('store asset', function (done) {
            this.timeout(10000);
            var assetLarge = fs.readFileSync(path.join(__dirname, 'material/assets/Large.png'));
            assetLarge.originalname = 'Large.png';
            // console.log('Storing asset');
            assetService.handleFileUpload(new ObjectId(projectId), new ObjectId(), {}, [assetLarge], false).then(function (assetsData) {
                assetId = assetsData[0]._id.toString();
                done();
            }).catch(done);
        });

        after(function () {
            uiCatalogService.getCompatibleCatalogs.restore();
            prototypeService.getMetadata.restore();
            artifactService.uploadArtifacts.restore();
            assetService.getAssetWithContent.restore();
        });

        it('will generate the prototype view and controller and store them in SharedWorkspace', function (done) {
            testData = retrieveTestData('material/pages/simplePage');
            testData2 = retrieveTestData('material/pages/pageWithChildren');
            testData3 = retrieveTestData('material/pages/pageWithAsset');
            testData3.jsonSource.controls[2].properties[0].value = '/api/projects/' + projectId + '/document/' + assetId + '/render';
            testData3.xmlTarget = testData3.xmlTarget.replace(/54eb4221df562d9aa035aef7/gi, assetId);
            prototypeBuilderService.generateSnapshot(projectId, 1, [testData.jsonSource, testData2.jsonSource, testData3.jsonSource], {
                catalogId: ui5CustomCatalog.catalogId.toString(),
                pages: [testData.jsonSource, testData2.jsonSource, testData3.jsonSource]
            }).then(function (response) {
                expect(uiCatalogService.getCompatibleCatalogs.callCount).to.equal(1);
                expect(uiCatalogService.getCompatibleCatalogs.getCall(0).args[0]).to.equal(ui5CustomCatalog.catalogId.toString());
                expect(prototypeService.getMetadata.callCount).to.equal(1);
                expect(prototypeService.getMetadata.getCall(0).args[0].toString()).to.equal(projectId);
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
                expect(artifactService.uploadArtifacts.getCall(0).args[1][6].path).to.equal('Component.js');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][7].path).to.equal('index.html');
                expect(artifactService.uploadArtifacts.getCall(0).args[1][11].path).to.equal('assets/' + assetId);
                expect(assetService.getAssetWithContent.callCount).to.equal(1);
                expect(assetService.getAssetWithContent.getCall(0).args[0]).to.equal(assetId);
                // Should have saved 12 files
                expect(response.length).to.equal(12);

                done();
            }).catch(done);
        });

        it('will have generated properly the XML View', function (done) {
            artifactService.getArtifactByPath(projectId, 'view/SimplePage.view.xml').then(function (artifact) {
                var readStream = artifact.readStream;
                var buffer = '';
                readStream.on('data', function (chunk) {
                    buffer += chunk;
                });

                // dump contents to console when complete
                readStream.on('end', function () {
                    expect(buffer.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData.xmlTarget);
                    done();
                });

            }).catch(done);
        });

        it('will have generated properly the JS Controller View', function (done) {
            artifactService.getArtifactByPath(projectId, 'view/SimplePage.controller.js').then(function (artifact) {
                var readStream = artifact.readStream;
                var buffer = '';
                readStream.on('data', function (chunk) {
                    buffer += chunk;
                });

                // dump contents to console when complete
                readStream.on('end', function () {
                    expect(buffer.replace(/\r\n/g, '\n').replace(/\t/g, '    ')).to.equal(testData.controllerTarget);
                    done();
                });

            }).catch(done);
        });
    });

});


'use strict';

var chai = require('norman-testing-tp').chai;
var should = chai.should();
var expect = chai.expect;
var UICatalogAPI = require('../api/uiCatalogRestApi');


var admin = new UICatalogAPI();


var commonServer = require('norman-common-server');
var registry = commonServer.registry;

/*var catalogs = require('./sampleTemplate/r1c1ui5.zip');*/

var path = require('path');
var fs = require('fs');
var catId; /*catalog id*/
var catName;
var catVersion;
var catalogc;
var resultedFile;

describe('API Tests', function() {

    this.timeout(300000);
    before('Initialize API ', function (done) {
        admin.initialize('dbinit.datamodeler@test.com', 'Minitest!1')
            .then(admin.initializeAdmin('dbinit.datamodeler@test.com', 'Minitest!1'))
            .then(done);
    });
    describe('get API', function () {

        it('Call GET /api/uicatalogs/getSampleTemplates - should respond 200 with JSON array', function (done) {
            admin.getSampleTemplates(200, function (err, res) {
                if (err) return done(err);
                var result = res.body;
                result.should.not.be.empty;
                expect(result).to.be.an('array');
                for(var item in result){
                   expect(result[item]).to.be.an('object');
                }
                done();
            });
        });

        it('Call GET /api/uicatalogs/getcatalogs- should respond 200 with JSON array', function (done) {
            admin.getCatalogs(200, function (err, res) {
                if (err) return done(err);
                var result = res.body;
                res.body.should.not.be.empty;
                expect(result).to.be.an('array');
                expect(result).to.have.length.above(1);
                if (result.length > 4){
                    catId = result[4].catalogId;
                    catName = result[4].catalogName;
                    catVersion = result[4].catalogVersion;
                }
                else {
                    catId = result[1].catalogId;
                    catName = result[1].catalogName;
                    catVersion = result[1].catalogVersion;
                }
                done();
            });
        });

        it('Call GET /api/uicatalogs/getcatalogs/root- should respond 200 with JSON array', function (done) {
            admin.getUiCatalogsRoot(200, function (err, res) {
                if (err) return done(err);
                var result = res.body;
                expect(result).to.be.an('array');
                for (var item in result) {
                    expect(result[item].isRootCatalog).equal(true);
                }
                done();
            });
        });

        it('Call GET /api/uicatalogs/getcatalogs/custom- should respond 200 with JSON array', function (done) {
            admin.getUiCatalogsCustom(200, function (err, res) {
                if (err) return done(err);
                var result = res.body;
                expect(result).to.be.an('array');
                for (var item in result) {
                    expect(result[item].isRootCatalog).equal(false);
                }
                done();
            });
        });
        it('Call GET /api/uicatalogs/getCompatibleCatalogs/catalogId- should respond 200 with JSON array', function (done) {
            admin.getCompatibleCatalogs(200, catId, function (err, res) {
                if (err) return done(err);
                var result = res.body;
                expect(result).to.be.an('array');
                done();
            });
        it('Call GET /api/uicatalogs/getcatalogs/default- should respond 200 with JSON array', function (done) {
            admin.getUiCatalogsDefault(200, function (err, res) {
                if (err) return done(err);
                var result = res.body;
                expect(result).to.be.an('array');
                for (var item in result) {
                    expect(result[item].isRootCatalog).equal(false);
                }
                done();
            });
        });


        });

        it('Call GET /api/uicatalogs/downloadcatalog/libtype/openui5- should respond 200 with JSON array', function (done) {
            admin.downloadcatalog(200, function (err, res) {
                if (err) return done(err);
                var result = res.body;
                result.should.not.be.empty;
                result.should.be.instanceof(Object);
                expect(result.catalogLang).equal("openui5");
                done();
            });
        });

        it('Call GET /api/uicatalogs/catalog/name/openui5r4/catalogversion/1_0/actions- should respond 200 with JSON array', function (done) {
            admin.getActions(200,function (err, res) {
                if (err) return done(err);
                var result = res.body;
                expect(result).to.be.an('array');
                done();
            });
        });
        it('Call GET getCatalog- should respond 200 with JSON array', function (done) {
            admin.getCatalog(200,catName, catVersion, function (err, res) {
                if (err) return done(err);
                var result = res.body;
                result.should.be.an('object');
                result.should.not.be.empty;
                expect(result.catalogName).equal(catName);
                done();
            });
        });

        it('CallGET/api/uicatalogs/libtype/:libType/getuilibversions-shouldrespond200withJSONarray', function (done) {
            var libType = "openui5";
            admin.getAvailableVersions(200, libType, function (err, res) {
                if (err)return done(err);
                var result = res.body;
                should.exist([]);
                result.should.not.be.empty;
                done();
            });
        });
        it('Call GET /api/uicatalogs/getCatalogById/:catalogId - should respond 200 with JSON array', function (done) {

            admin.getCatalogById(200,catId, function (err, res) {
                if (err) return done(err);
                var result = res.body;
                result.should.be.an('object');
                result.should.not.be.empty;
                expect(result.catalogId).equal(catId);
                done();
            });
        });
        /*it('CallGET/api/uicatalogs/private/metadatagen/:libraryVersion/:isPrivate/:type/:version/:pathFileName([a-zA-Z0-9./]*)-shouldrespond200withJSONarray',function(done){
            var initializeFiles = require('../../../server/lib/api/catalog/controller');
            var initfile = new initializeFiles();
            initfile.storeOpenUI5Canvas;
            admin.getMetadataGeneratorFiles(200,function(err,res){
                if(err)return done(err);
                var result=res.body;
                done();
            });
        });*/
    });
        describe('post API- upload library public', function () {
            var libType = "openui5";
            var libVersion = "1.26.6";
            var isPrivate = false;
            it('Call POST /uilib/:libType/:libVersion/:isPrivate/uploaduilib - upload catalog ', function (done) {

                admin.uploadUICatalog(200, libType, libVersion, isPrivate, function (err, res) {
                    if(err)return done(err);
                    var result = res.body;
                    expect(result.status).equal("UI Library uploaded");
                    result.should.not.be.empty;
                    done();

                }, path.resolve(__dirname, './sampleTemplate/openui5-runtime-1.26.6.zip'));
                //});

            });

            it('Call GET /api/uicatalogs/public/uilib/:type/:version/:pathFileName([a-zA-Z0-9./]*) - should respond 200 with JSON array', function (done) {
                admin.getPath(200,function (err, res) {
                    if (err) return done(err);
                    var result = res.body;
                    expect(res.header).to.have.property('content-type', 'application/javascript');
                    expect(res.header).to.have.property('cache-control', 'public,max-age=2419200');
                    done();
                });
            });

        });


        describe('post API-upload library private', function () {
            var libType = "openui5";
            var libVersion = "1.26.6";
            var isPrivate = true;
            it('Call POST /uilib/:libType/:libVersion/:isPrivate/uploaduilib - upload catalog ', function (done) {

                admin.uploadUICatalog(200, libType, libVersion, isPrivate, function (err, res) {
                    if(err)return done(err);
                    var result = res.body;
                    expect(result.status).equal("UI Library uploaded");
                    result.should.not.be.empty;
                    done();
                }, path.resolve(__dirname, './sampleTemplate/openui5-runtime-1.26.6.zip'));
                //});

            });

            it('Call GET /api/uicatalogs/public/uilib/:type/:version/:pathFileName([a-zA-Z0-9./]*) - should respond 200 with JSON array', function (done) {
                admin.getPathPrivate(200,function (err, res) {
                    if (err) return done(err);
                    var result = res.body;
                    done();
                });
            });
        });

    });


    describe('post API', function () {
        var libType = "r1c1ui5";
        var libVersion = "1_0";
        var isPrivate = false;

        it('Call POST /uilib/:libType/:libVersion/:isPrivate/uploaduilib - upload uilib', function (done) {

            admin.uploadUICatalog(200, libType, libVersion, isPrivate, function (err, res) {
                if(err)return done(err);
                var result = res.body;
                expect(result.status).equal("UI Library uploaded");
                result.should.not.be.empty;
                done();
            }, path.resolve(__dirname, './sampleTemplate/r1c1ui5.zip'));
            //});

        });

        it('Call GET /api/uicatalogs/getCatalogById/:catalogId - should respond 200 with JSON array', function (done) {

            admin.getCatalogById(200,catId, function (err, res) {
                if (err) return done(err);
                resultedFile = res.body;
                delete resultedFile.__v;
                expect(resultedFile.catalogId).equal(catId);
                expect(res.header).to.have.property('content-type', 'application/json; charset=utf-8');
                done();
            });
        });
        it('Call POST /api/uicatalogs/updateCustomCatalog - update custom catalog ', function (done) {
            admin.updateCustomCatalog(200,  function (err, res) {

                if(err)return done(err);
                var result = res.body;
                result.should.not.be.empty;
                expect(result.libraryVersion).equal("1_26_6");
                expect(result.catalogLang).equal("openui5");
                expect(res.type).equal("application/json");
                done();
            },{data:JSON.stringify(resultedFile)});
        });

    });


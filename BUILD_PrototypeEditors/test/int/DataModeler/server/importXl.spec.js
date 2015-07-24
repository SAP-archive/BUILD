'use strict';

require('mocha-steps');

var chai = require('norman-testing-tp').chai;
var should = chai.should();
var expect = chai.expect;
var commonServer = require('norman-common-server');

var DataModelerAPI = require('../api/dataModelerRestApi');
var api = new DataModelerAPI();

var path = require('path');
var importXLexpect1 = require('./material/importXLExpect1.json');
var importXLexpect2 = require('./material/importXLExpect2.json');

var registry = commonServer.registry;

var projectId, projectId2, sampleDataId, sampleDataId2, modelName, getModel;

describe('Test REST API Import xl files - foreign key - test API', function () {
    this.timeout(15000);
    before('Intialize API', function (done) {
        api.initialize('importxl.datamodeler@test.com', 'Minitest!1').then(done);
    });
    describe('Create new model with sample data then update sample data', function () {
        describe('Create a model from xl file with projectId', function () {
            step('simple import one entity by sheet', function (done) {
                api.importModel(201, path.resolve(__dirname, 'material/Model01ERP.xlsx'), function (err, res) {
                    if (err) {
                        done(err);
                    } else {
                        var model = res.body.result;
                        projectId = model.projectId;
                        sampleDataId = model.sampleData;
                        var entitiesArray = model.entities;
                        var expectCounter = 0;
                        entitiesArray.forEach(function (val) {
                            val.name.should.equal(importXLexpect1[expectCounter].name);
                            var propertyArray = val.properties;
                            var propertyCounter = 0;
                            propertyArray.forEach(function (val2) {
                                if(val2.name.indexOf('___FK_') !== 0){
                                    val2.name.should.equal(importXLexpect1[expectCounter].properties[propertyCounter].name);
                                }
                                val2.propertyType.should.equal(importXLexpect1[expectCounter].properties[propertyCounter].propertyType);
                                propertyCounter++;
                            });
                            expectCounter++;
                        });
                        done();
                    }
                });
            });
            step('Call GET /api/models/:projectId - check model import', function (done) {
                api.getModel(200, projectId, function (err, res) {
                    if (err) return done(err);
                    var model = res.body;
                    model.projectId.should.equal(projectId);
                    var resEnt = model.entities;
                    var entityCounter = 0;
                    resEnt.forEach(function (valEnt) {
                        valEnt.name.should.equal(importXLexpect1[entityCounter].name);
                        var resProp = valEnt.properties;
                        var propNumber = 0;
                        resProp.forEach(function (valProp) {
                            if(valProp.name.indexOf('___FK_') !== 0){
                                valProp.name.should.equal(importXLexpect1[entityCounter].properties[propNumber].name);
                            }
                            valProp.propertyType.should.equal(importXLexpect1[entityCounter].properties[propNumber].propertyType);
                            valProp.isKey.should.equal(importXLexpect1[entityCounter].properties[propNumber].isKey);
                            propNumber++;
                        });
                        var resNav = valEnt.navigationProperties;
                        var navNumber = 0;
                        resNav.forEach(function (valNav) {
                            valNav.name.should.equal(importXLexpect1[entityCounter].navigationProperties[navNumber].name);
                            valNav.multiplicity.should.equal(importXLexpect1[entityCounter].navigationProperties[navNumber].multiplicity);
                            navNumber++;
                        });
                        entityCounter++;
                    });
                    done();
                });
            });
            importXLexpect1.forEach(function (entity) {
                xstep('Call GET /api/sampleDataMgr/:sampleDataId/:entityName - check sample data created for entity: ' + entity.name, function (done) {
                    api.getSampleData(200, sampleDataId, entity.name, function (err, res) {
                        if (err) return done(err);
                        var result = res.body;
                        if (entity.name == "Country") {
                            result[0].LTEXT.should.equal("Zambia");
                            result[218].INTCA.should.equal('RS');
                        } else if (entity.name == "Region") {
                            result[0].ID.should.equal('No Distinction');
                            result[3].RGION.should.equal('DUBAI');
                        }
                        done();
                    });
                });
            });
        });
        describe("update data sample update data whithout changing data type", function () {
            step('import updated data sample one entity by sheet', function (done) {
                api.updateModelByXL(201, projectId, path.resolve(__dirname, 'material/Model02ERP.xlsx'), function (err, res) {
                    if (err) return done(err);
                    var model = res.body.result;
                    done();
                });
            });
            step('Call GET /api/models/:projectId - check model import', function (done) {
                api.getModel(200, projectId, function (err, res) {
                    if (err) return done(err);
                    var model = res.body;
                    model.projectId.should.equal(projectId);
                    var resEnt = model.entities;
                    var entityCounter = 0;
                    resEnt.forEach(function (valEnt) {
                        valEnt.name.should.equal(importXLexpect1[entityCounter].name);
                        var resProp = valEnt.properties;
                        var propNumber = 0;
                        resProp.forEach(function (valProp) {
                            if(valProp.name.indexOf('___FK_') !== 0){
                                valProp.name.should.equal(importXLexpect1[entityCounter].properties[propNumber].name);
                            }
                            valProp.propertyType.should.equal(importXLexpect1[entityCounter].properties[propNumber].propertyType);
                            valProp.isKey.should.equal(importXLexpect1[entityCounter].properties[propNumber].isKey);
                            propNumber++;
                        });
                        var resNav = valEnt.navigationProperties;
                        var navNumber = 0;
                        resNav.forEach(function (valNav) {
                            valNav.name.should.equal(importXLexpect1[entityCounter].navigationProperties[navNumber].name);
                            valNav.multiplicity.should.equal(importXLexpect1[entityCounter].navigationProperties[navNumber].multiplicity);
                            navNumber++;
                        });
                        entityCounter++;
                    });
                    done();
                });
            });
            importXLexpect1.forEach(function (entity) {
                xstep('Call GET /api/sampleDataMgr/:sampleDataId/:entityName - check sample data created for entity: ' + entity.name, function (done) {
                    api.getSampleData(200, sampleDataId, entity.name, function (err, res) {
                        if (err) return done(err);
                        var result = res.body;
                        if (entity.name == "Country") {
                            result[0].LTEXT.should.equal('ZambiaUpdate');
                            result[0].INTCA.should.equal('ZM');
                            result[218].INTCA.should.equal('RS');
                        } else if (entity.name == "Region") {
                            expect(result[0].LAND1).to.not.exist;
                            result[3].ID.should.equal('UAE,Dubai');
                        }
                        done();
                    });
                });
            });
        });
    });

    describe('Update model with Import xl file ', function () {
        describe('Prerequisite', function () {
            step('Call POST /api/models - Get Model should 200 ', function (done) {
                api.createModel(200, function (err, res) {
                    if (err) return done(err);
                    var result = res.body;
                    projectId2 = result.projectId;
                    projectId2.should.not.be.empty;
                    done();
                });
            });
            step('import one entity by sheet, check one entity with one property created', function (done) {
                api.addModelByXl(201, projectId2, path.resolve(__dirname, 'material/ModelAERP.xlsx'), function (err, res) {
                    if (err) return done(err);
                    var model = res.body.result;
                    sampleDataId2 = model.sampleData;
                    var entitiesArrayA1 = model.entities;
                    entitiesArrayA1.should.be.instanceof(Array);
                    entitiesArrayA1.should.not.be.empty;
                    entitiesArrayA1.length.should.equal(1);

                    var expectCounter = 0;
                    entitiesArrayA1.forEach(function (val) {
                        val.name.should.equal(importXLexpect2[expectCounter].name);
                        var propertyArrayA1 = val.properties;
                        var propertyCounter = 0;
                        propertyArrayA1.forEach(function (val2) {
                            if(val2.name.indexOf('___FK_') !== 0){
                                val2.name.should.equal(importXLexpect2[expectCounter].properties[propertyCounter].name);
                            }
                            val2.propertyType.should.equal(importXLexpect2[expectCounter].properties[propertyCounter].propertyType);
                            propertyCounter++;
                        });
                        expectCounter++;
                    });
                    done();
                });
            });
        });
        describe('Add an other entity', function () {
            step('import one entity by sheet, check second entity with one property created', function (done) {
                api.addModelByXl(201, projectId2, path.resolve(__dirname, 'material/ModelBERP.xlsx'), function (err, res) {
                    if (err) return done(err);
                    var model = res.body.result;
                    modelName = model.name;
                    sampleDataId2 = model.sampleData;
                    var entitiesArrayB1 = model.entities;
                    entitiesArrayB1.should.be.instanceof(Array);
                    entitiesArrayB1.should.not.be.empty;
                    entitiesArrayB1.length.should.equal(2);

                    var expectCounter = 0;
                    entitiesArrayB1.forEach(function (val) {
                        val.name.should.equal(importXLexpect2[expectCounter].name);
                        var propertyArrayB1 = val.properties;
                        var propertyCounter = 0;
                        propertyArrayB1.forEach(function (val2) {
                            if(val2.name.indexOf('___FK_') !== 0){
                                val2.name.should.equal(importXLexpect2[expectCounter].properties[propertyCounter].name);
                            }
                            val2.propertyType.should.equal(importXLexpect2[expectCounter].properties[propertyCounter].propertyType);
                            propertyCounter++;
                        });
                        expectCounter++;
                    });
                    done();
                });
            });
            step('Call GET /api/models/:projectId - check model import', function (done) {
                api.getModel(200, projectId2, function (err, res) {
                    if (err) return done(err);
                    var model = res.body;
                    model.projectId.should.equal(projectId2);
                    var resEnt = model.entities;
                    var entityCounter = 0;
                    resEnt.forEach(function (valEnt) {
                        valEnt.name.should.equal(importXLexpect2[entityCounter].name);
                        var resProp = valEnt.properties;
                        var propNumber = 0;
                        resProp.forEach(function (valProp) {
                            if(valProp.name.indexOf('___FK_') !== 0){
                                valProp.name.should.equal(importXLexpect2[entityCounter].properties[propNumber].name);
                            }
                            valProp.propertyType.should.equal(importXLexpect2[entityCounter].properties[propNumber].propertyType);
                            propNumber++;
                        });
                        entityCounter++;
                    });
                    done();
                });
            });
        });
    });

});

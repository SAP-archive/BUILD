'use strict';

require('mocha-steps');

var chai = require('norman-testing-tp').chai;
var should = chai.should();
var expect = chai.expect;

var DataModelerAPI = require('../api/dataModelerRestApi');
var api = new DataModelerAPI();

var path = require('path');
var navPropertyExpect = require('./material/navPropertyExpect.json');

var projectId, entitiesArray = [], entitiesId = [], navPropId, sourcePropId = [], targetPropId = [], refConstraints, navPropId2, refConstraints2;

describe('Test REST API for navigation relations\r\n', function () {
    this.timeout(15000);
    before('Intialize API', function (done) {
        api.initialize('navproperty.datamodeler@test.com','Minitest!1').then(done);
    });
    describe('Prerequisite\r\n', function () {
        step('first import to prepare model', function (done) {
            api.importModel(201, path.resolve(__dirname, 'material/ModelNavProp.xlsx'), function (err, res) {
                if (err) return done(err);
                var model = res.body;
                projectId = model.result.projectId;
                entitiesArray = model.result.entities;
                entitiesArray.length.should.equal(2);
                var entityNumber = 0;
                entitiesArray.forEach(function (val) {
                    entitiesId[entityNumber] = val._id;
                    entityNumber++;
                });
                entitiesArray[0].navigationProperties.length.should.equal(0);
                entitiesArray[1].navigationProperties.length.should.equal(0);
                done();
            });
        });
    });
    describe('create navigation property\r\n', function () {
        step('/api/models/:projectId/entities/:entityId/navigationProperties - create navigation property should 201 ', function (done) {
            api.createNavigationProperty(201, projectId, entitiesId[0], {name: "RelationC", multiplicity: true, toEntityId: entitiesId[1]}, function (err, res) {
                if (err) return done(err);
                var result = res.body;
                navPropId = result._id;
                refConstraints = result.referentialConstraints;
                result.isReadOnly.should.equal(navPropertyExpect[0].navigationProperties[0].isReadOnly);
                result.multiplicity.should.equal(navPropertyExpect[0].navigationProperties[0].multiplicity);
                result.name.should.equal(navPropertyExpect[0].navigationProperties[0].name);
                result.toEntityId.should.equal(entitiesId[1]);
                result.referentialConstraints[0].entityId.should.equal(entitiesId[0]);
                result.referentialConstraints[1].entityId.should.equal(entitiesId[1]);
                done();
            });
        });
        step('/api/models/:projectId/entities/:entityId/navigationProperties - create navigation property should 201 ', function (done) {
            api.createNavigationProperty(201, projectId, entitiesId[0], {name: "RelationC2", multiplicity: false, toEntityId: entitiesId[1]}, function (err, res) {
                if (err) return done(err);
                var result = res.body;
                navPropId2 = result._id;
                refConstraints2 = result.referentialConstraints;
                result.isReadOnly.should.equal(navPropertyExpect[0].navigationProperties[1].isReadOnly);
                result.multiplicity.should.equal(navPropertyExpect[0].navigationProperties[1].multiplicity);
                result.name.should.equal(navPropertyExpect[0].navigationProperties[1].name);
                result.toEntityId.should.equal(entitiesId[1]);
                result.referentialConstraints[0].entityId.should.equal(entitiesId[1]);
                result.referentialConstraints[1].entityId.should.equal(entitiesId[0]);
                done();
    });
        });
        step('Call GET /api/models/:projectId - check navigation relation created', function (done) {
            api.getModel(200, projectId, function (err, res) {
                if (err) return done(err);

                try{
                    var model = res.body;
                    model.projectId.should.equal(projectId);
                    var resEnt = model.entities;
                    entitiesArray = model.entities;
                    sourcePropId[0] = entitiesArray[0].properties[0]._id;
                    targetPropId[0] = entitiesArray[1].properties[2]._id;
                    sourcePropId[1] = entitiesArray[1].properties[0]._id;
                    targetPropId[1] = entitiesArray[0].properties[3]._id;
                    var entityCounter = 0;
                    resEnt.forEach(function (valEnt) {
                        valEnt.name.should.equal(navPropertyExpect[entityCounter].name);
                        var resProp = valEnt.properties;
                        var propNumber = 0;
                        resProp.forEach(function (valProp) {
                            if(valProp.name.indexOf('___FK_') !== 0){
                                valProp.name.should.equal(navPropertyExpect[entityCounter].properties[propNumber].name);
                            }

                            valProp.propertyType.should.equal(navPropertyExpect[entityCounter].properties[propNumber].propertyType);
                            propNumber++;
                        });
                        var resNav = valEnt.navigationProperties;
                        var navNumber = 0;
                        resNav.forEach(function (valNav) {
                            valNav.name.should.equal(navPropertyExpect[entityCounter].navigationProperties[navNumber].name);
                            valNav.multiplicity.should.equal(navPropertyExpect[entityCounter].navigationProperties[navNumber].multiplicity);
                            valNav.isReadOnly.should.equal(navPropertyExpect[entityCounter].navigationProperties[navNumber].isReadOnly);
                            if (navPropertyExpect[entityCounter].navigationProperties[navNumber].multiplicity){
                                valNav.referentialConstraints[0].entityId.should.equal(entitiesId[0]);
                                valNav.referentialConstraints[0].propertyRef.should.equal(sourcePropId[navNumber]);
                                valNav.referentialConstraints[1].entityId.should.equal(entitiesId[1]);
                                valNav.referentialConstraints[1].propertyRef.should.equal(targetPropId[navNumber]);
                            } else {
                                valNav.referentialConstraints[0].entityId.should.equal(entitiesId[1]);
                                valNav.referentialConstraints[0].propertyRef.should.equal(sourcePropId[navNumber]);
                                valNav.referentialConstraints[1].entityId.should.equal(entitiesId[0]);
                                valNav.referentialConstraints[1].propertyRef.should.equal(targetPropId[navNumber]);

                            }

                            valNav.toEntityId.should.equal(entitiesId[1]);
                            navNumber++;
                        });
                        entityCounter++;
                    });
                    done();
                }catch(err){
                    done(err);
                }
            });
        });
    });

    describe('update navigation property\r\n', function () {
        step('/api/models/:projectId/entities/:entityId/navigationProperties/:navPropId - update navigation property should 200 ', function (done) {
            api.updateNavigationProperty(200, projectId, entitiesId[0], navPropId, {_id: "" + navPropId + "",multiplicity: false,name: "RelationCbis",referentialConstraints: refConstraints,toEntityId: "" + entitiesId[1] + "",isReadOnly: false}, function (err, res) {
                if (err) return done(err);
                var result = res.body;
                result.isReadOnly.should.equal(navPropertyExpect[2].navigationProperties[0].isReadOnly);
                result.multiplicity.should.equal(navPropertyExpect[2].navigationProperties[0].multiplicity);
                result.name.should.equal(navPropertyExpect[2].navigationProperties[0].name);
                result.toEntityId.should.equal(entitiesId[1]);
                result.referentialConstraints[0].entityId.should.equal(entitiesId[1]);
                result.referentialConstraints[1].entityId.should.equal(entitiesId[0]);
                done();
            });
        });
        step('/api/models/:projectId/entities/:entityId/navigationProperties/:navPropId - update navigation property should 200 ', function (done) {
            api.updateNavigationProperty(200, projectId, entitiesId[0], navPropId2, {_id: "" + navPropId2 + "",multiplicity: true,name: "RelationC2bis",referentialConstraints: refConstraints2,toEntityId: "" + entitiesId[1] + "",isReadOnly: false}, function (err, res) {
                if (err) return done(err);
                var result = res.body;
                result.isReadOnly.should.equal(navPropertyExpect[2].navigationProperties[1].isReadOnly);
                result.multiplicity.should.equal(navPropertyExpect[2].navigationProperties[1].multiplicity);
                result.name.should.equal(navPropertyExpect[2].navigationProperties[1].name);
                result.toEntityId.should.equal(entitiesId[1]);
                result.referentialConstraints[0].entityId.should.equal(entitiesId[0]);
                result.referentialConstraints[1].entityId.should.equal(entitiesId[1]);
                done();
            });
        });
        step('Call GET /api/models/:projectId - check navigation relation updated', function (done) {
            api.getModel(200, projectId, function (err, res) {
                if (err) return done(err);
                var model = res.body;
                model.projectId.should.equal(projectId);
                var resEnt = model.entities;
                entitiesArray = model.entities;
                sourcePropId[2] = entitiesArray[1].properties[0]._id;
                targetPropId[2] = entitiesArray[0].properties[3]._id;
                sourcePropId[3] = entitiesArray[0].properties[0]._id;
                targetPropId[3] = entitiesArray[1].properties[2]._id;
                var entityCounter = 2;
                resEnt.forEach(function (valEnt) {
                    valEnt.name.should.equal(navPropertyExpect[entityCounter].name);
                    var resProp = valEnt.properties;
                    var propNumber = 0;
                    resProp.forEach(function (valProp) {
                        if(valProp.name.indexOf('___FK_') !== 0){
                            valProp.name.should.equal(navPropertyExpect[entityCounter].properties[propNumber].name);
                        }

                        valProp.propertyType.should.equal(navPropertyExpect[entityCounter].properties[propNumber].propertyType);
                        propNumber++;
                    });
                    var resNav = valEnt.navigationProperties;
                    var navNumber = 0;
                    var entitiesIdNumber1 = 1;
                    var entitiesIdNumber2 = 0;
                    resNav.forEach(function (valNav) {
                        valNav.name.should.equal(navPropertyExpect[entityCounter].navigationProperties[navNumber].name);
                        valNav.multiplicity.should.equal(navPropertyExpect[entityCounter].navigationProperties[navNumber].multiplicity);
                        valNav.isReadOnly.should.equal(navPropertyExpect[entityCounter].navigationProperties[navNumber].isReadOnly);
                        valNav.referentialConstraints[0].entityId.should.equal(entitiesId[entitiesIdNumber1]);
                        valNav.referentialConstraints[0].propertyRef.should.equal(sourcePropId[navNumber + 2]);
                        valNav.referentialConstraints[1].entityId.should.equal(entitiesId[entitiesIdNumber2]);
                        valNav.referentialConstraints[1].propertyRef.should.equal(targetPropId[navNumber + 2]);
                        valNav.toEntityId.should.equal(entitiesId[1]);
                        entitiesIdNumber1 = 0;
                        entitiesIdNumber2 = 1;
                        navNumber++;
                    });
                    entityCounter++;
                });
                done();
            });
        });
    });
    describe('delete navigation property\r\n', function () {
        step('/api/models/:projectId/entities/:entityId/navigationProperties/:navPropId - delete navigation property should 204 ', function (done) {
            api.deleteNavigationProperty(204, projectId, entitiesId[0], navPropId, function (err, res) {
                if (err) return done(err);
                done();
            });
        });
        step('/api/models/:projectId/entities/:entityId/navigationProperties/:navPropId - delete navigation property should 204 ', function (done) {
            api.deleteNavigationProperty(204, projectId, entitiesId[0], navPropId2, function (err, res) {
                if (err) return done(err);
                done();
            });
        });
        step('Call GET /api/models/:projectId - check navigation relation updated', function (done) {
            api.getModel(200, projectId, function (err, res) {
                if (err) return done(err);
                var model = res.body;
                model.projectId.should.equal(projectId);
                var resEnt = model.entities;
                entitiesArray = model.entities;
                entitiesArray[0].navigationProperties.length.should.equal(0);
                entitiesArray[1].navigationProperties.length.should.equal(0);
                var entityCounter = 0;
                resEnt.forEach(function (valEnt) {
                    valEnt.name.should.equal(navPropertyExpect[entityCounter].name);
                    var resProp = valEnt.properties;
                    var propNumber = 0;
                    resProp.forEach(function (valProp) {
                        valProp.name.should.equal(navPropertyExpect[entityCounter].properties[propNumber].name);
                        valProp.propertyType.should.equal(navPropertyExpect[entityCounter].properties[propNumber].propertyType);
                        propNumber++;
                    });
                    entityCounter++;
                });
                done();
            });
        });
    });
});

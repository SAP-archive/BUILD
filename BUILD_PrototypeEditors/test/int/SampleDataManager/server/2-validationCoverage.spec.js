'use strict';

var chai = require('norman-testing-tp').chai;
chai.should();
var expect = chai.expect;
var SampleDataRestApi = require('../api/sampleDataRestApi');
var api = new SampleDataRestApi;
var registry = require('norman-common-server').registry;
var _ = require('norman-server-tp').lodash;

var dataAdapter = null;
var sampleDataService = null;
var dataModeler = null;

var sampleDataLocal;
var entity;
var property;
var projectId;

var addEntity = {
    name: 'entityName'
};
var addDuplicateEntity = {
    name: 'entityName',
    id: 'e_id1'
};
var addInvalidEntity = {
    name: 'entityNameInvalid',
    id: 'e_id123'
};

describe('Validation Tests', function () {
    var model;
    this.timeout(3000000);
    before('ok', function(done) {
        api.initialize('user2.sampleDataModeler@test.com', 'Minitest!1').then(done);
    });
    it('Prerequisite',function (done) {
        api.createProject('Validation Project', function (err, res) {
            if (err) {
                done(err);
            } else {
                projectId = res.body._id;
                api.createEntity(201, projectId, addEntity, function (err, res) {
                    if (err) {
                        done(err);
                    } else {
                        api.getSampleData(projectId, function (sampleData) {
                            sampleDataLocal = sampleData;
                            done();
                        });
                    }
                });
            }
        });
    });

    //1
    it('Add Duplicate Entity', function (done) {
        var sampleData = sampleDataLocal;
        sampleData.entities.push({
            entityName: addDuplicateEntity.name,
            entityId: addDuplicateEntity.id
        });
        api.saveSampleDataWithError(projectId, sampleData, function (err, sampleData) {
            if (sampleData) {
                done(new Error('Test Failed'));
            }
            expect(err.errorList).to.include({text:'Duplicate Entities found.'});
            done();
        });
    });

    //2
    it('Add Invalid Entity', function (done) {
        sampleDataLocal.entities.splice(1, 1);
        sampleDataLocal.entities.push({
            entityName: addInvalidEntity.name,
            entityId: addInvalidEntity.id
        });
        api.saveSampleDataWithError(projectId, sampleDataLocal, function (err, sampleData) {
            if (sampleData) {
                done(new Error('Test Failed'));
            }
            expect(err.errorList).to.include({text:'Entity "entityNameInvalid" not found'});
            done();
        });
    });


    //3
    it('Add NULL value to Primary Key', function (done) {
        sampleDataLocal.entities.splice(1, 1);
        sampleDataLocal.entities[0].properties.push({
            'ID': null
        });
        api.saveSampleDataWithError(projectId, sampleDataLocal, function (err, sampleData) {
            if (sampleData) {
                done(new Error('Test Failed'));
            }
            expect(err.errorList).to.include({colname:'ID',column:null,entityName:'entityName',isKey:true,primaryKey:null,text:'Key value missing'});
            done();
        });
    });

    //4
    it('Add Invalid Property', function (done) {
        sampleDataLocal.entities[0].properties.push({
            'invalidProp': null
        });
        api.saveSampleDataWithError(projectId, sampleDataLocal, function (err, sampleData) {
            if (sampleData) {
                done(new Error('Test Failed'));
            }
            expect(err.errorList).to.include({primaryKey:null,text:'Invalid property: invalidProp'});
            done();
        });
    });

    //5
    it('Add Duplicate Value for Primary Key', function (done) {
        sampleDataLocal.entities[0].properties.push({
            'ID': 'id-123'
        }, {
            'ID': 'id-123'
        });
        api.saveSampleDataWithError(projectId, sampleDataLocal, function (err, sampleData) {
            if (sampleData) {
                done(new Error('Test Failed'));
            }
            expect(err.errorList).to.include({colname:'ID',column:'id-123',entityName:'entityName',isKey:true,text:'Duplicate Key'});
            done();
        });
    });

    //5
    it('Validate Multiple Errors', function (done) {
        api.saveSampleDataWithError(projectId, sampleDataLocal, function (err, sampleData) {
            if (sampleData) {
                done(new Error('Test Failed'));
            }
            expect(err.errorList).to.include({colname:'ID',column:'id-123',entityName:'entityName',isKey:true,text:'Duplicate Key'});
            expect(err.errorList).to.include({colname:'ID',column:null,entityName:'entityName',isKey:true,primaryKey:'id-123',text:'Key value missing'});
            expect(err.errorList).to.include({primaryKey:'id-123',text:'Invalid property: invalidProp'});
            done();
        });
    });

    //6
    it('Convert String to Number', function (done) {
        var entityID = sampleDataLocal.entities[0].entityId;
        api.createProperty(201, projectId, entityID, {
            'name': 'NumericValue',
            'propertyType': 'number'
        }, function (err, res) {
            if (err) {
                done(err);
            } else {
                api.getSampleData(projectId, function (sampleData) {
                    sampleDataLocal = sampleData;
                    sampleData.entities[0].properties.push({
                        'ID': 'sd-123',
                        'NumericValue': '2500'
                    })
                    api.saveSampleData(200, projectId, sampleData, function (err, sdResult) {
                        if (err) {
                            done(new Error('Test Failed'));
                        }
                        expect(isNaN(sdResult.body.entities[0].properties[0].NumericValue)).equal(false);
                        done();
                    });
                });
            }
        });
    });

    //7
    it('Convert String to Date', function (done) {
        var entityID = sampleDataLocal.entities[0].entityId;
        api.createProperty(201, projectId, entityID, {
            'name': 'DateValue',
            'propertyType': 'datetime'
        }, function (err, res) {
            if (err) {
                done(err);
            } else {
                api.getSampleData(projectId, function (sampleData) {
                    sampleDataLocal = sampleData;
                    sampleData.entities[0].properties.push({
                        'ID': 'sd-1234',
                        'DateValue': '12/11/14'
                    })
                    api.saveSampleData(200, projectId, sampleData, function (err, sdResult) {
                        if (err) {
                            done(new Error('Test Failed'));
                        }
                        //check UTC date
                        if (sdResult.body.entities[0].properties[1].DateValue.indexOf('Z') !== -1) {
                            done();
                        } else {
                            done(new Error('Test Failed'));
                        }
                    });
                });
            }
        });
    });

    it('Foreign Key Validation', function (done) {
        this.timeout(30000);
        var newEntity = {
            name: 'parentEntity'
        };

        var newEntityChild = {
            name: 'childEntity',
            properties: [{
                name: 'ID',
                isKey: true
            },
            {
                name: 'foreignKey',
                isForeignKey: true
            }]
        };

        api.createProject('Foreign Key Validation', function (err, res) {
            if (err) {
                done(err);
            }
            else {
                var dataModel = res.body;
                projectId = dataModel._id;
                var entityIDParent;
                var entityIDChild;
                var parentProp;
                var childProp;
                api.createEntity(201, projectId, newEntity, function (err, res) {
                    if (err) {
                        done(err);
                    } else {
                        entityIDParent = res.body._id;
                        parentProp = res.body.properties[0]._id;
                        api.createEntity(201, projectId, newEntityChild, function (err, res) {
                            if (err) {
                                done(err);
                            } else {
                                entityIDChild = res.body._id;
                                childProp = res.body.properties[1]._id;
                                api.createNavigationProperty(201, projectId, entityIDParent, {
                                    toEntityId: entityIDChild,
                                    referentialConstraints: [{entityId: entityIDParent, propertyRef: parentProp},
                                        {entityId: entityIDChild, propertyRef: childProp}]
                                }, function (err, res) {
                                    if (err) {
                                        done(err);
                                    }
                                    api.getSampleData(projectId, function (sampleData) {
                                        if(!sampleData){
                                            done(err);
                                        }
                                        sampleData.entities[0].properties.push({
                                            'ID':'111'
                                        });
                                        sampleData.entities[1].properties.push({
                                            'ID':'id1',
                                            'foreignKey':'111'
                                        });
                                        sampleData.entities[1].properties.push({
                                            'ID':'id2',
                                            'foreignKey':'222'
                                        });
                                        api.saveSampleData(200, projectId, sampleData, function (err, sdResult) {
                                            if (err) {
                                                done(err);
                                            }
                                            expect(sdResult.body.entities[1].properties[0].foreignKey).equal('111');
                                            expect(sdResult.body.entities[1].properties[1].foreignKey).equal(null);
                                            done();
                                        });
                                    });
                                });
                            }
                        });
                    }
                });


            }
        });

    });
});

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

var dataModel = {
    entities: []
};
var sampleData = null;
var projectId = null;
var eventData = {
    excel: false
};

var createEntity = {
    operation: 'create',
    type: 'entity',
    current: {
        _id: 'entityId1',
        name: 'entityName1'
    },
    previous: {}
};

describe('Feature Tests', function() {
    this.timeout(3000000);
//    before('db initialize', function(done) {
//        api.dbInitialize(done);
//    });
    before('ok', function(done) {
        api.initialize('user.sampleDataModeler@test.com', 'Minitest!1').then(done);
    });

    var model;
    var buildSessionId;
    //1
    it('Create Project, get Sample Data', function(done) {
        api.createProject('Feature Project',function(err, res) {
            if (err) {
                done(err);
            } else {
                buildSessionId = res.buildSessionId;
                var result = res.body;
                projectId = result._id;
                projectId.should.not.be.empty;
                api.getSampleData(projectId, function(result) {
                    sampleData = result;
                    var sampleDataId = result._id.toString();
                    sampleDataId.should.not.be.empty;
                    sampleDataService = registry.getModule('SampleDataService');
                    dataModeler = registry.getModule('Model');
                    done();
                });
            }
        });
    });

    //2
    var entityId = null;
    it('Create Entity: capture event for create entity', function(done) {
        api.createEntity(201, sampleData.projectId, {}, function(err, res) {
            if (err) {
                return done(err);
            }
            var entity = res.body;
            entityId = entity._id;
            dataModel.entities.push(entity);
            api.getSampleData(projectId, function(result) {
                expect(result.entities[0].entityName).equal(entity.name);
                done();
            });
        });
    });

    //3
    it('Update Entity: capture event for update entity', function(done) {
        var updatedEntity = {
            name: 'EntityOne'
        }
        api.updateEntity(200, projectId, entityId, updatedEntity, function(err, res) {
            if (err) {
                return done(err);
            }
            var entity = res.body;
            entityId = entity._id;
            dataModel.entities[0] = entity;
            expect(entity.name).equal(updatedEntity.name);
            done();
        });
    });


    //4
    var propertyId = null;
    it('Add Property: capture event for update property', function(done) {
        var addProperty = {
            name: 'propertyName1'
        };
        var addProperty2 = {
            name: 'propertyName2'
        };
        api.createProperty(201, projectId, entityId, addProperty, function(err, res) {
            if (err) {
                return done(err);
            }
            var property = res.body;
            api.getSampleData(projectId, function(sampleData) {
                var toUpdateEntity = _.find(sampleData.entities, function(item) {
                    return item.entityId === entityId;
                });
                toUpdateEntity.properties.push({
                    'ID': '12345'
                });
                api.saveSampleData(200, projectId, sampleData, function(err, resultBody) {
                    if (err) {
                        return done(err);
                    }
                    var result = resultBody.body;
                    expect(result.entities[0].properties[0]).to.include.keys('ID');
                    api.createProperty(201, projectId, entityId, addProperty2, function(err, res) {
                        if (err) {
                            return done(err);
                        }
                        propertyId = res.body._id;
                        api.getSampleData(projectId, function(sampleData) {
                            expect(sampleData.entities[0].properties[0]).to.include.keys(addProperty2.name);
                            done();
                        });
                    });
                });
            });
        });
    });

    //5
    it('Update Property: capture event for update property', function(done) {
        var updateProperty = {
            name: 'propertyName2Updated'
        };
        api.updateProperty(200, projectId, entityId, propertyId, updateProperty, function(err, res) {
            if (err) {
                return done(err);
            }
            api.getSampleData(projectId, function(sampleData) {
                expect(sampleData.entities[0].properties[0]).to.include.keys(updateProperty.name);
                expect(sampleData.entities[0].properties[0]).to.not.include.keys('propertyName2');
                done();
            });
        });
    });

    //6
    it('Delete Property: capture event for delete property', function(done) {
        api.deleteProperty(204, projectId, entityId, propertyId, function(err, res) {
            if (err) {
                return done(err);
            }
            api.getSampleData(projectId, function(sampleData) {
                expect(sampleData.entities[0].properties[0]).to.not.include.keys('propertyName2Updated');
                done();
            });
        });
    });

    //7
    it('Delete Entity: capture event for delete entity', function(done) {
        api.deleteEntity(200, projectId, entityId, function(err, res) {
            if (err) {
                return done(err);
            }
            api.getSampleData(projectId, function(sampleData) {
                expect(sampleData.entities).to.be.empty;
                done();
            });
        });
    });

    //8
    it('Get Entity Data', function(done) {
        var newEntity1 = {
            name: 'e1'
        };
        var newEntity2 = {
            name: 'e2'
        };
        var newProp1 = {
            name: 'p1'
        };
        api.createEntity(201, projectId, newEntity1, function(err, res) {
            api.createEntity(201, projectId, newEntity2, function(err, res) {
                if (err) {
                    return done(err);
                }
                entityId = res.body._id;
                api.getSampleData(projectId, function(sampleData) {
                    var toUpdateEntity = _.find(sampleData.entities, function(item) {
                        return item.entityId === entityId;
                    });
                    toUpdateEntity.properties.push({
                        'ID': '12345'
                    });
                    api.saveSampleData(200, projectId, sampleData, function(err, result) {
                        if (err) {
                            return done(err);
                        }
                        api.createProperty(201, projectId, entityId, newProp1, function(err, res) {
                            if (err) {
                                return done(err);
                            }
                            api.getEntityData(projectId, 'e2', function(properties) {
                                expect(properties[0]).to.include.keys('ID');
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
});

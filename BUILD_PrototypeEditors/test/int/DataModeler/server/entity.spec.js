'use strict';

var chai = require('norman-testing-tp').chai;
var should = chai.should();
var expect = chai.expect;

//var api = require('../api/dataModelerRestApi');
var DataModelerAPI = require('../api/dataModelerRestApi');
var api = new DataModelerAPI();

var entities = require('./material/entities.json');
var badEntities = require('./material/badEntities.json');
var specialEntities = require('./material/specialEntities.json');

var entityID, projectId, model;

describe('Test REST API for Entities\r\n', function () {
    this.timeout(15000);
    before('Intialize API', function (done) {
        api.initialize('entity.datamodeler@test.com','Minitest!1').then(done);
    });
    describe('Prerequisite\r\n', function () {
        it('Call POST /api/models - Add Model should 201 ', function (done) {
            api.createModel(201, function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body;
                    projectId = result.projectId;
                    projectId.should.not.be.empty;
                    done();
                }
            });
        });
    });
    describe('Create a entity, modify it and delete it\r\n', function () {
        describe('Valid Test Case\r\n', function () {
            describe('Simple Flow\r\n', function () {
                it('Call GET /api/models/:projectId - should 200 and have a empty model', function (done) {
                    api.getModel(200, projectId, function (err, res) {
                        if (err) return done(err);
                        var result = res.body;
                        result.entities.should.be.instanceof(Array);
                        result.entities.should.be.empty;
                        done();
                    });
                });
                it('Call POST /api/models/:projectId/entities - Add Entities into model should 201 ', function (done) {
                    api.createEntity(201, projectId, entities[0], function (err, res) {
                        if (err) return done(err);
                        var result = res.body;
                        expect(result.name).equal(entities[0].name);
                        entityID = result._id;
                        entityID.should.not.be.empty;
                        done();
                    });
                });
                it('Call GET /api/models/:projectId - Get model', function (done) {
                    api.getModel(200, projectId, function (err, res) {
                        if (err) return done(err);
                        expect(res.body.entities[0].name).equal(entities[0].name);
                        done();
                    });
                });
                it('Call PUT /api/models/:projectId/entities/:entityid  - Update entity with another name Entities should 200', function (done) {
                    api.updateEntity(200, projectId, entityID, entities[1], function (err, res) {
                        if (err) return done(err);
                        var result = res.body;
                        expect(result.name).equal(entities[1].name);
                        expect(result._id).equal(entityID);
                        entityID.should.not.be.empty;
                        done();
                    });
                });
                it('Call DELETE /api/models/:projectId/entities/:entityid - Delete entity should have 204', function (done) {
                    console.log('projectId');
                    console.log(projectId);
                    console.log('entityID');
                    console.log(entityID);
                    api.deleteEntity(200, projectId, entityID, function (err, res) {
                        if (err) {
                            return done('should not have an error !!');
                        }
                        else {

                            done();
                        };
                    });
                });
            });
            describe('Advanced tests\r\n', function () {
                var newEntityID;
                describe('40 carac', function () {
                    it('Call POST /api/models/:projectId/entities - Create entity with param id value sent and 40 caracs in name should have 201', function (done) {
                        api.createEntity(201, projectId, entities[3], function (err, res) {
                            if (err) return done(err);
                            var result = res.body;
                            expect(result.name).equal(entities[3].name);
                            newEntityID = result._id;
                            newEntityID.should.not.be.empty;
                            expect(newEntityID).not.equal(entities[3].id);
                            done();
                        });
                    });
                });
                describe('special carac', function () {
                    it('Call PUT /api/models/:projectId/entities/:entityid  - Update entity with name start by "_" should 200', function (done) {
                        api.updateEntity(200, projectId, newEntityID,entities[2], function (err, res) {
                            if (err) return done(err);
                            var result = res.body;
                            expect(result.name).equal(entities[2].name);
                            expect(result._id).equal(newEntityID);
                            done();
                        });
                    });
                });
                describe('Clean entity for Advanced tests', function () {
                    it('Call Delete /api/models/:projectId/entities/:entityid - Delete entity to clean db should have 204', function (done) {
                        api.deleteEntity(200, projectId, newEntityID, function (err, res) {
                            if (err) {
                                return done('should not have an error !!');
                            }
                            else {
                                done();
                            };
                        });
                    });
                });
                describe('Special creation', function () {
                    specialEntities.forEach(function (val) {
                        it('Create entity ' + val.descTest, function (done) {
                            api.createEntity(201, projectId, val.sendValue, function (err, res) {
                                if (err) {
                                    return done('should not have an error !!');
                                }
                                else {
                                    done();
                                };
                            });

                        });
                    })
                });
                describe('Create 2 Entities with same name\r\n', function () {
                    it('Call POST /api/models/:projectId/entities/:entityid - Create First Entity should have 201', function (done) {
                        api.createEntity(201, projectId, entities[0], function (err, res) {
                            if (err) {
                                return done('should not have an error !!');
                            }
                            else {
                                done();
                            };
                        });
                    });
                    it('Call POST /api/models/:projectId/entities/:entityid - Create a Second Entity with same name should have 201', function (done) {
                        api.createEntity(201, projectId, entities[0], function (err, res) {
                            if (err) return done(err);
                            res.body.name.should.equal(entities[0].name + "2");
                            done();
                        });
                    });
                });

            });
        });
        //TODO: to activate after workspace correction. The mongoDB error message should be forwarded. currently the POST stay in pending...
        xdescribe('InValid Test Case\r\n', function () {
            describe('Play with Deleted entity\r\n', function () {
                it('Call PUT /api/models/:projectId/entities/:entityid - Modify a deleted entity should have 500', function (done) {
                    api.updateEntity(500, projectId, entityID, entities[0], function (err, res) {
                        if (err) {
                            return done();
                        }
                        else {
                            res.error.should.not.be.empty;
                            done();
                        };
                    });
                });
                it('Call DELETE /api/models/:projectId/entities/:entityid - Delete a Deleted entity should have 500', function (done) {
                    api.deleteEntity(500, projectId, entityID, function (err, res) {
                        if (err) {
                            return done();
                        }
                        else {
                            res.error.should.not.be.empty;
                            done();
                        };
                    });
                });
            });
            describe('Play with Create a bad entity\r\n', function () {
                badEntities.forEach(function (val) {
                    it('Call POST /api/models/:projectId - Create a new Entity ' + val.descTest, function (done) {
                        api.createEntity(201, projectId, val.sendValue, function (err, res) {
                            if (err) {
                                return done(err);
                            }
                            else {
                                res.body.success.should.equal(false);
                                done();
                            };
                        });
                    });
                });
            });
            describe('Play with Modify entity with a bad value\r\n', function () {
                it('Call POST /api/models/:projectId/entities - Add Entities into model should 201 ', function (done) {
                    api.createEntity(201, projectId, entities[1], function (err, res) {
                        if (err) return done(err);
                        var result = res.body;
                        expect(result.name).equal(entities[1].name);
                        entityID = result._id;
                        entityID.should.not.be.empty;
                        done();
                    });
                });
                badEntities.forEach(function (val) {
                    it('Call PUT /api/models/:projectId/entities/:entityid  - Update entity with an incorrect Entities name should 500 ' + val.descTest, function (done) {
                        api.updateEntity(500, projectId, entityID, val.sendValue, function (err, res) {
                            if (err) {
                                return done(err);
                            }
                            else {
                                expect(res.body.name).equal('ValidationError');
                                done();
                            };
                        });
                    });
                });
                it('Call DELETE /api/models/:projectId/entities/:entityid - Delete entity should have 204', function (done) {
                    api.deleteEntity(200, projectId, entityID, function (err, res) {
                        if (err) return done(err);
                        done();
                    });
                });
            });
        });
    });

    describe('After Test: clean model \r\n', function () {
        //TODO: need to clean db :)
    });

});

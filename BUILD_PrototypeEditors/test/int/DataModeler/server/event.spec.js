'use strict';

var chai = require('norman-testing-tp').chai;
chai.should();
var expect = chai.expect;

var DataModelerAPI = require('../api/dataModelerRestApi');
var api = new DataModelerAPI();

var commonServer = require('norman-common-server');
var registry = commonServer.registry;

var entities = require('./material/entities.json');
var properties = require('./material/properties.json');
var path = require('path');
var fs = require('fs');
var Promise = require('norman-promise');

function getXmlFile(fileName, callBack) {
    fs.readFile(path.resolve(__dirname, 'material/' + fileName + '.xml'), 'utf8', callBack);
}

function getModel(fileName, callBack) {
    fs.readFile(path.resolve(__dirname, 'material/' + fileName + '.json'), 'utf8', callBack);
}

function compare(source, de) {
    Object.keys(source).forEach(function (key) {
        if (typeof source[key] === 'object') {
            if (Array.isArray(source[key])) {
                source[key].forEach(function (element, index) {
                    compare(element, de[key][index]);
                });

            } else {
                compare(source[key], de[key]);

            }
        } else {
            //TODO: Error Expected :"DetailInvoice" Actual   :"DetailInvoices"
            expect(source[key]).equal(de[key], 'Key: ' + key + ', source: ' + source[key] + ', destination: ' + de[key]);
        }
    });
}

//-----------------------------------

function Observer(){

}

Observer.prototype.processData = function (projectId, event, req, createdBy) {

    if(req.body.ModelChange && this.handler) {

        try {
            this.handler(req.body.ModelChange);
        }
        catch (err) {
            console.log(err);
            this.error = err;
        }
        finally{
            this.handler = null;
        }
    }

    return Promise.resolve({files: [], metadataArray: []});
};

Observer.prototype.setHandler = function (handler) {
    this.handler = handler;
    this.error = null;
};

Observer.prototype.getError = function(){
    return this.error;
};

//-----------------------------------


var testObserver, swRegistry, projectId, entityID, propertyID, entityIDs = [], navigationPropertyID;
describe('Event Basic Test REST API for Model', function () {
    this.timeout(1500000);
    before('Intialize API', function (done) {

        try{
            testObserver = new Observer();
            registry.registerModule(testObserver, 'TEST_OBSERVER');
            swRegistry = registry.getModule('SwRegistryService');
            swRegistry.registerModule('TEST_OBSERVER', 'pre');

            api.initialize('entity.datamodeler@test.com', 'Minitest!1').then(done);
        }catch(err){
            done(err);
        }

    });

    // we dont send MODEL event any more
    // but this is a Prerequisite to create a model for other test case
    describe('Create a model', function () {
        it('Call POST /api/models', function (done) {

            api.createModel(201, function (err, res) {
                if (err) {
                    done(err);
                }
                var result = res.body;
                projectId = result.projectId;
                done();
            });
        });
    });

    describe('Create a entity, modify it', function () {
        describe('Valid Test Case\r\n', function () {
            describe('Simple Flow\r\n', function () {
                it('Call POST /api/models/:projectid', function (done) {

                    function eventHandler(eventData) {

                        eventData.projectId.should.be.equal(projectId);
                        eventData.excel.should.be.false;
                        eventData.operations.should.be.instanceof(Array);
                        eventData.operations.length.should.be.equal(2);
                        (eventData.operations[0].entity === undefined).should.be.true;
                        eventData.operations[0].type.should.be.equal('entity');
                        eventData.operations[0].operation.should.be.equal('create');
                        eventData.operations[0].previous.should.be.empty;
                        eventData.operations[0].current.should.be.not.empty;
                        eventData.operations[0].current.name.should.be.equal(entities[0].name);

                        eventData.operations[1].type.should.be.equal('property');
                        eventData.operations[1].operation.should.be.equal('create');
                        eventData.operations[1].previous.should.be.empty;
                        eventData.operations[1].current.should.be.not.empty;
                        eventData.operations[1].current.name.should.be.equal('ID');

                        entityID = eventData.operations[0].current._id;
                        entityID.should.not.be.empty;
                    };

                    testObserver.setHandler(eventHandler);

                    api.createEntity(201, projectId, entities[0], function (err) {
                        if (err) {
                            done(err);
                        }
                        done(testObserver.getError());
                    });
                });
                it('Call PUT /api/models/:projectid/entities/:entityid', function (done) {

                    function eventHandler(eventData) {

                        eventData.excel.should.be.false;
                        eventData.projectId.should.be.equal(projectId);
                        eventData.operations.should.be.instanceof(Array);
                        eventData.operations.length.should.be.equal(1);
                        (eventData.operations[0].entity === undefined).should.be.true;
                        eventData.operations[0].type.should.be.equal('entity');
                        eventData.operations[0].operation.should.be.equal('update');
                        eventData.operations[0].previous.should.be.not.empty;
                        eventData.operations[0].current.should.be.not.empty;
                        eventData.operations[0].current.name.should.be.equal(entities[1].name);
                        eventData.operations[0].current._id.should.be.equal(eventData.operations[0].previous._id);
                        eventData.operations[0].current._id.should.be.equal(entityID);
                    };

                    testObserver.setHandler(eventHandler);

                    api.updateEntity(200, projectId, entityID, entities[1], function (err) {
                        if (err) {
                            done(err);
                        }
                        done(testObserver.getError());
                    });
                });
                it('Call DELETE /api/models/:projectid/entities/:entityid', function (done) {

                    function eventHandler(eventData) {

                        eventData.excel.should.be.false;
                        eventData.projectId.should.be.equal(projectId);
                        eventData.operations.should.be.instanceof(Array);
                        eventData.operations.length.should.be.equal(1);
                        (eventData.operations[0].entity === undefined).should.be.true;
                        eventData.operations[0].type.should.be.equal('entity');
                        eventData.operations[0].operation.should.be.equal('delete');
                        eventData.operations[0].previous.should.be.not.empty;
                        eventData.operations[0].current.should.be.empty;
                        eventData.operations[0].previous.name.should.be.equal(entities[1].name);
                        eventData.operations[0].previous._id.should.be.equal(entityID);
                    };

                    testObserver.setHandler(eventHandler);

                    api.deleteEntity(200, projectId, entityID, function (err) {
                        if (err) {
                            done(err);
                        }
                        done(testObserver.getError());
                    });
                });
            });
        });
    });

    describe('Create a property, modify it and delete it', function () {
        describe('Valid Test Case', function () {
            describe('Simple Flow', function () {
                it('Create model for the tests', function (done) {
                    api.createModel(201, function (err, res) {
                        if (err) {
                            done(err);
                        } else {
                            var result = res.body;
                            projectId = result.projectId;
                            projectId.should.not.be.empty;
                            done();
                        }
                    });
                });
                it('Create entity for the tests', function (done) {
                    api.createEntity(201, projectId, {}, function (err, res) {
                        if (err) return done(err);
                        var result = res.body;
                        entityID = result._id;
                        entityID.should.not.be.empty;
                        done();
                    });
                });
                it('Call POST /api/models/:projectid/entities/:entityId/properties', function (done) {

                    function eventHandler(eventData) {

                        eventData.excel.should.be.false;
                        eventData.projectId.should.be.equal(projectId);
                        eventData.operations.should.be.instanceof(Array);
                        eventData.operations.length.should.be.equal(1);
                        eventData.operations[0].entity._id.should.be.equal(entityID);
                        eventData.operations[0].type.should.be.equal('property');
                        eventData.operations[0].operation.should.be.equal('create');
                        eventData.operations[0].previous.should.be.empty;
                        eventData.operations[0].current.should.be.not.empty;
                        eventData.operations[0].current.name.should.be.equal('Property');
                        eventData.operations[0].current.propertyType.should.be.equal('String');
                        eventData.operations[0].current._id.should.not.be.empty;
                        propertyID = eventData.operations[0].current._id;
                    };

                    testObserver.setHandler(eventHandler);
                    api.createProperty(201, projectId, entityID, properties[0], function (err) {
                        if (err) {
                            done(err);
                        }
                        done(testObserver.getError());
                    });
                });
                it('Call PUT /api/models/:projectid/entities/:entityid/properties/:propertyID', function (done) {

                    function eventHandler(eventData) {

                        eventData.excel.should.be.false;
                        eventData.projectId.should.be.equal(projectId);
                        eventData.operations.should.be.instanceof(Array);
                        eventData.operations.length.should.be.equal(1);
                        eventData.operations[0].entity._id.should.be.equal(entityID);
                        eventData.operations[0].type.should.be.equal('property');
                        eventData.operations[0].operation.should.be.equal('update');
                        eventData.operations[0].previous.should.be.not.empty;
                        eventData.operations[0].current.should.be.not.empty;

                        eventData.operations[0].current._id.should.be.equal(propertyID);

                        Object.keys(properties[1]).forEach(function (key) {
                            eventData.operations[0].current[key].should.be.equal(properties[1][key]);
                        });
                    };

                    testObserver.setHandler(eventHandler);
                    api.updateProperty(200, projectId, entityID, propertyID, properties[1], function (err) {
                        if (err) {
                            done(err);
                        }
                        done(testObserver.getError());
                    });
                });
                it('Call DELETE /api/models/:projectid/entities/:entityid/properties/:propertyID', function (done) {

                    function eventHandler(eventData) {

                        eventData.excel.should.be.false;
                        eventData.projectId.should.be.equal(projectId);
                        eventData.operations.should.be.instanceof(Array);
                        eventData.operations.length.should.be.equal(1);
                        eventData.operations[0].entity._id.should.be.equal(entityID);
                        eventData.operations[0].type.should.be.equal('property');
                        eventData.operations[0].operation.should.be.equal('delete');
                        eventData.operations[0].previous.should.be.not.empty;
                        eventData.operations[0].current.should.be.empty;

                        eventData.operations[0].previous._id.should.be.equal(propertyID);
                    };

                    testObserver.setHandler(eventHandler);
                    api.deleteProperty(204, projectId, entityID, propertyID, function (err) {
                        if (err) {
                            done(err);
                        }
                        done(testObserver.getError());
                    });
                });
            });
        });
    });

    describe('Create a navigation property, modify it and delete it', function () {
        describe('Valid Test Case', function () {
            describe('Simple Flow', function () {
                it('Create model for the tests', function (done) {
                    api.createModel(201, function (err, res) {
                        if (err) {
                            done(err);
                        } else {
                            var result = res.body;
                            projectId = result.projectId;
                            projectId.should.not.be.empty;
                            done();
                        }
                    });
                });
                it('Create entity for the tests', function (done) {
                    api.createEntity(201, projectId, {name: 'A'}, function (err, res) {
                        if (err) return done(err);
                        var result = res.body;
                        entityIDs = [];
                        entityIDs.push(result._id);
                        done();
                    });
                });
                it('Create entity for the tests', function (done) {
                    api.createEntity(201, projectId, {name: 'B'}, function (err, res) {
                        if (err) return done(err);
                        var result = res.body;
                        entityIDs.push(result._id);
                        done();
                    });
                });

                it('Call POST /api/models/:projectid/entities/:entityId/navigationProperties', function (done) {

                    function eventHandler(eventData) {

                        eventData.excel.should.be.false;
                        eventData.projectId.should.be.equal(projectId);
                        eventData.operations.should.be.instanceof(Array);
                        eventData.operations.length.should.be.equal(2);

                        eventData.operations[0].type.should.be.equal('property');
                        eventData.operations[0].operation.should.be.equal('create');
                        eventData.operations[0].entity._id.should.be.equal(entityIDs[1]);
                        eventData.operations[0].previous.should.be.empty;
                        eventData.operations[0].current.should.be.not.empty;
                        eventData.operations[0].current._id.should.be.not.empty;

                        eventData.operations[1].type.should.be.equal('navigation');
                        eventData.operations[1].operation.should.be.equal('create');
                        eventData.operations[1].entity._id.should.be.equal(entityIDs[0]);
                        eventData.operations[1].previous.should.be.empty;
                        eventData.operations[1].current.should.be.not.empty;
                        eventData.operations[1].current._id.should.be.not.empty;
                        navigationPropertyID = eventData.operations[1].current._id;
                    };

                    testObserver.setHandler(eventHandler);
                    api.createNavigationProperty(201, projectId, entityIDs[0], {toEntityId: entityIDs[1]}, function (err, res) {
                        if (err) {
                            done(err);
                        }
                        done(testObserver.getError());
                    });
                });
                it('Call PUT /api/models/:projectid/entities/:entityid/navigationProperties/:navPropertyID', function (done) {
                    function eventHandler(eventData) {
                        eventData.excel.should.be.false;
                        eventData.projectId.should.be.equal(projectId);
                        eventData.operations.should.be.instanceof(Array);
                        eventData.operations.length.should.be.equal(3);

                        //check foreign keys
                        eventData.operations[0].entity._id.should.be.equal(entityIDs[1]);
                        eventData.operations[0].type.should.be.equal('property');
                        eventData.operations[0].operation.should.be.equal('delete');
                        eventData.operations[0].current.should.be.empty;

                        eventData.operations[1].entity._id.should.be.equal(entityIDs[0]);
                        eventData.operations[1].type.should.be.equal('property');
                        eventData.operations[1].operation.should.be.equal('create');
                        eventData.operations[1].previous.should.be.empty;

                        eventData.operations[2].entity._id.should.be.equal(entityIDs[0]);
                        eventData.operations[2].type.should.be.equal('navigation');
                        eventData.operations[2].operation.should.be.equal('update');
                        eventData.operations[2].previous.should.be.not.empty;
                        eventData.operations[2].current.should.be.not.empty;
                        // check name and multiplicity
                        eventData.operations[2].current.name.should.be.equal('jlec');
                        eventData.operations[2].current.multiplicity.should.be.equal(false);
                    };

                    var navProp = {name: 'jlec', multiplicity: false};
                    testObserver.setHandler(eventHandler);
                    api.updateNavigationProperty(200, projectId, entityIDs[0], navigationPropertyID, navProp, function (err, res) {
                        if (err) {
                            done(err);
                        }
                        done(testObserver.getError());
                    });
                });
                it('Call DELETE /api/models/:projectid/entities/:entityid/navigationProperties/:navPropertyID', function (done) {

                    function eventHandler(eventData) {

                        eventData.excel.should.be.false;
                        eventData.projectId.should.be.equal(projectId);
                        eventData.operations.should.be.instanceof(Array);
                        eventData.operations.length.should.be.equal(2);

                        eventData.operations[0].entity._id.should.be.equal(entityIDs[0]);
                        eventData.operations[0].type.should.be.equal('navigation');
                        eventData.operations[0].operation.should.be.equal('delete');
                        eventData.operations[0].previous.should.be.not.empty;
                        eventData.operations[0].current.should.be.empty;

                        eventData.operations[1].entity._id.should.be.equal(entityIDs[0]);
                        eventData.operations[1].type.should.be.equal('property');
                        eventData.operations[1].operation.should.be.equal('delete');
                        eventData.operations[1].current.should.be.empty;
                    };

                    testObserver.setHandler(eventHandler);
                    api.deleteNavigationProperty(204, projectId, entityIDs[0], navigationPropertyID, function (err, res) {
                        if (err) {
                            done(err);
                        }
                        done(testObserver.getError());
                    });
                });
            });
        });
    });

    //FIXME Catalog issue
    xdescribe('Create a entity, modify it from catalog', function () {
        describe('Valid Test Case\r\n', function () {
            describe('Simple Flow\r\n', function () {
                var catalogId, originalEntity;
                it('Prerequisite', function (done) {
                    getXmlFile('SRA021_SRV', function (err, metadata) {
                        if (err) return done(err);

                        var businessCatalog = registry.getModule('BusinessCatalog');
                        businessCatalog.importMetadata(metadata)
                            .then(function (createdCatalog) {
                                catalogId = createdCatalog._id.toString();
                                originalEntity = createdCatalog.entities[0]._id;
                                done();
                            }).catch(done);
                    });
                });
                it('Call POST /api/models - Add Model with catalog id ', function (done) {

                    var dataModeler = registry.getModule('Model');
                    var secondTime = false;
                    this.timeout(2000);
                    function eventHandler(eventData) {

                        if(secondTime){
                            dataModeler.removeListener(dataModeler.EVENT.MODEL_CHANGE, eventHandler);

                            eventData.excel.should.be.false;
                            eventData.projectId.should.be.equal(projectId);
                            eventData.operations.should.be.instanceof(Array);
                            eventData.operations.length.should.be.equal(84);

                            done();
                        }else{
                            secondTime = true;

                            eventData.excel.should.be.false;
                            eventData.projectId.should.be.not.empty;
                            projectId = eventData.projectId;

                            eventData.operations.should.be.instanceof(Array);
                            eventData.operations[0].type.should.be.equal('model');
                            eventData.operations[0].operation.should.be.equal('create');
                            eventData.operations.length.should.be.equal(1);
                        }
                    };
                    dataModeler.on(dataModeler.EVENT.MODEL_CHANGE, eventHandler);

                    api.createModel2(201, {catalog: catalogId}, function (err, res) {
                        if (err) {
                            dataModeler.removeListener(dataModeler.EVENT.MODEL_CHANGE, eventHandler);
                            done(err);
                        }
                    });
                });

                // randomly fails with ECONNRESET
                it('Call POST /api/models/:projectid/catalog/:catalogId - add entities from catalog', function (done) {

                    var dataModeler = registry.getModule('Model');
                    this.timeout(2000);
                    function eventHandler(eventData) {

                        dataModeler.removeListener(dataModeler.EVENT.MODEL_CHANGE, eventHandler);

                        eventData.excel.should.be.false;
                        eventData.projectId.should.be.equal(projectId);
                        eventData.operations.should.be.instanceof(Array);
                        eventData.operations.length.should.be.equal(84);
                        eventData.operations.forEach(function(op){
                            op.operation.should.equal('create');
                            if(op.type === 'entity'){
                                op.current.name.indexOf('2').should.equal(op.current.name.length -1);
                            }
                        });

                        done();
                    };
                    dataModeler.on(dataModeler.EVENT.MODEL_CHANGE, eventHandler);

                    api.addEntitiesFromCatalog(200, projectId, catalogId, function (err, res) {
                        if (err) {
                            dataModeler.removeListener(dataModeler.EVENT.MODEL_CHANGE, eventHandler);
                            done(err);
                        }
                    });
                });
            });
        });
    });



    after('Unregister module', function(done){
        try{
            swRegistry.unregisterModule('TEST_OBSERVER');
            done();
        }catch(err){
            done(err);
        }
    });

});


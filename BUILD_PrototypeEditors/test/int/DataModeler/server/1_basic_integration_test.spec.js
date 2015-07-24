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

var util = require('../api/util');


var projectId, entityID, propertyID, entityIDs = [], navigationPropertyID;
describe('Basic REST API Test', function () {
    this.timeout(1500000);
    before('Intialize API', function (done) {
        api.initialize('basic.datamodeler@test.com','Minitest!1').then(done);
    });
    describe('Basic Test REST API for Model', function () {
        describe('Create a model, modify it', function () {
            describe('Valid Test Case\r\n', function () {
                describe('Simple Flow\r\n', function () {
                    var model;
                    it('Call POST /api/models - Add Model should 201 ', function (done) {
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
                    it('Call GET /api/models/:projectid - Get Model', function (done) {
                        api.getModel(200, projectId, function (err, res) {
                            if (err) return done(err);
                            var result = res.body;
                            result.entities.should.be.instanceof(Array);
                            result.entities.should.be.empty;
                            model = result;
                            done();
                        });
                    });
                    it('Call PUT /api/models/:projectid - Update Model with new layout', function (done) {
                        model.layout = model.layout + 'Changed';
                        api.updateModel2(204, projectId, model, function (err, res) {
                            if (err) return done(err);
                            done();
                        });
                    });
                });
            });
        });

        describe('Create a entity, modify it', function () {
            describe('Valid Test Case\r\n', function () {
                describe('Simple Flow\r\n', function () {
                    it('Call POST /api/models/:projectid - Add Entities into model should 201 ', function (done) {
                        api.createEntity(201, projectId, entities[0], function (err, res) {
                            if (err) return done(err);
                            var result = res.body;
                            expect(result.name).equal(entities[0].name);
                            entityID = result._id;
                            entityID.should.not.be.empty;
                            done();
                        });
                    });
                    it('Call GET /api/models/:projectid - Get Model', function (done) {
                        api.getModel(200, projectId, function (err, res) {
                            if (err) return done(err);
                            expect(res.body.entities[0].name).equal(entities[0].name);
                            res.body.entities[0].navigationProperties.should.be.instanceof(Array);
                            res.body.entities[0].properties.should.be.instanceof(Array);
                            done();
                        });
                    });
                    it('Call PUT /api/models/:projectid/entities/:entityid  - Update entity with another name Entities should 200', function (done) {
                        api.updateEntity(200, projectId, entityID, entities[1], function (err, res) {
                            if (err) return done(err);
                            var result = res.body;

                            console.log(JSON.stringify(result));
                            expect(result._id).equal(entityID);
                            expect(result.name).equal(entities[1].name);
                            entityID.should.not.be.empty;
                            done();
                        });
                    });
                    it('Call PUT /api/models/:projectid/entities/:entityid  - Update entity with name start by "_" should 200', function (done) {
                        api.updateEntity(200, projectId, entityID, entities[2], function (err, res) {
                            if (err) return done(err);
                            var result = res.body;
                            expect(result.name).equal(entities[2].name);
                            expect(result._id).equal(entityID);
                            entityID.should.not.be.empty;
                            done();
                        });
                    });
                });
            });
        });

        describe('Create a entity, modify it from catalog', function () {
            describe('Valid Test Case\r\n', function () {
                describe('Simple Flow\r\n', function () {
                    var catalogId, originalEntity;
                    it('Prerequisite', function (done) {
                        util.getXmlFile('SRA021_SRV', function (err, metadata) {
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
                    it('Call POST /api/models/:projectid/catalog/:catalogId - add entities from catalog', function (done) {
                        api.addEntitiesFromCatalog(200, projectId, catalogId, function (err, res) {
                            if (err) return done(err);
                            console.log(res.body);
                            var result = res.body;

                            util.getModel('SRA021_SRV', function (err, model) {
                                if (err) return done(err);
                                util.compare(JSON.parse(model), result);
                                done();
                            });
                        });
                    });
                    it('Call POST /api/models/:projectid/catalog/:catalogId - add entities from catalog', function (done) {
                        api.addEntityFromCatalog(200, projectId, catalogId, originalEntity, function (err, res) {
                            if (err) return done(err);
                            console.log(res.body);
                            done();
                        });
                    });
                });
                describe('Complex Type\r\n', function () {
                    var catalogId, originalEntity;
                    it('Prerequisite', function (done) {
                        util.getXmlFile('ZAREXT_CARTAPPROVAL_V2_SRV', function (err, metadata) {
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
                    it('Call POST /api/models/:projectid/catalog/:catalogId - add entities from catalog', function (done) {
                        api.addEntitiesFromCatalog(200, projectId, catalogId, function (err, res) {
                            if (err) return done(err);
                            console.log(res.body);
                            var result = res.body;

                            util.getModel('ZAREXT_CARTAPPROVAL_V2_SRV', function (err, model) {
                                if (err) return done(err);
                                util.compare(JSON.parse(model), result);
                                done();
                            });
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
                            var i;
                            for(i=0;i<result.properties.length;i++){
                                if(result.properties[i].isKey){
                                    propertyID=result.properties[i]._id;
                                }
                            }
                            propertyID.should.not.be.empty;
                            done();
                        });
                    });
                    it('Call DELETE /api/models/:projectid/entities/:entityid/properties/:propertyID - Delete the primary key property should have 400', function (done) {
                        api.deleteProperty(400, projectId, entityID, propertyID, function (err, res) {
                            if (err) return done(err);
                            done();
                        });
                    });
                    it('Call POST /api/models/:projectid/entities/:entityId/properties - Add Property with empty name into model should 201 ', function (done) {
                        api.createProperty(201, projectId, entityID, properties[0], function (err, res) {
                            if (err) return done(err);
                            var result = res.body;
                            expect(result.name).equal('Property');
                            expect(result.propertyType).equal('String');
                            propertyID = result._id;
                            propertyID.should.not.be.empty;
                            done();
                        });
                    });
                    it('Call POST /api/models/:projectid/entities/:entityId/properties - Add Property with empty name for 2 time into model', function (done) {
                        api.createProperty(201, projectId, entityID, properties[0], function (err, res) {
                            if (err) return done(err);
                            var result = res.body;
                            expect(result.name).equal('Property2');
                            expect(result.propertyType).equal('String');
                            propertyID = result._id;
                            propertyID.should.not.be.empty;
                            done();
                        });
                    });
                    it('Call PUT /api/models/:projectid/entities/:entityid/properties/:propertyID  - Update property with another name Property should 200', function (done) {
                        api.updateProperty(200, projectId, entityID, propertyID, properties[1], function (err, res) {
                            if (err) return done(err);
                            var result = res.body;
                            Object.keys(properties[1]).forEach(function (key) {
                                expect(result[key]).equal(properties[1][key]);
                            });
                            expect(result._id).equal(propertyID);
                            entityID.should.not.be.empty;
                            done();
                        });
                    });
                    it('Call DELETE /api/models/:projectid/entities/:entityid/properties/:propertyID - Delete property should have 204', function (done) {
                        api.deleteProperty(204, projectId, entityID, propertyID, function (err, res) {
                            if (err) return done(err);
                            done();
                        });
                    });
                });
            });
        });

        describe('Create a group, modify it and delete it', function () {
            describe('Valid Test Case', function () {
                describe('Simple Flow', function () {
                    var group;
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
                    it('Call GET /api/models/:projectId/entities/:entityId/standardgroups/ - get standard groups ', function (done) {
                        api.getStandardGroups(200, projectId, function (err, res) {
                            if (err) return done(err);

                            var result = res.body;
                            expect(result).to.deep.equal(['Person','Address','Overview','DataSeries','ValueWithUnit','RoleInOrganization','AmountWithCurrency']);
                            done();
                        });
                    });
                    it('Call POST /api/models/:projectId/entities/:entityId/groups/ - Add group', function (done) {
                        var newGroup = {type:'Person'};
                        api.createGroup(201, projectId, entityID, {type:'Person'}, function (err, res) {
                            if (err) return done(err);
                            var result = res.body;
                            expect(result.type).equal(newGroup.type);
                            expect(result.roles.length).equal(11);
                            group = result;
                            group.should.not.be.empty;
                            done();
                        });
                    });
                    it('Call PUT /api/models/:projectId/entities/:entityId/groups/:groupId - Update group', function (done) {
                        group.roles[0].path = 'jlec';
                        api.updateGroup(200, projectId, entityID, group._id, group, function (err, res) {
                            if (err) return done(err);
                            var result = res.body;
                            expect(result).to.deep.equal(group);
                            done();
                        });
                    });
                    it('Call DELETE /api/models/:projectid/entities/:entityid/groups/:groupId - Delete group', function (done) {
                        api.deleteGroup(204, projectId, entityID, group._id, function (err, res) {
                            if (err) return done(err);

                            done();
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

                    it('Call POST /api/models/:projectid/entities/:entityId/navigationProperties - Add Navigation Property into model should 201 ', function (done) {
                        api.createNavigationProperty(201, projectId, entityIDs[0], {toEntityId: entityIDs[1]}, function (err, res) {
                            if (err) return done(err);
                            var result = res.body;
                            expect(result.name).equal('BSet');
                            navigationPropertyID = result._id;
                            navigationPropertyID.should.not.be.empty;
                            done();
                        });
                    });
                    it('Call PUT /api/models/:projectid/entities/:entityid/navigationProperties/:navPropertyID - Update navigation property with another name navigation Property should 200', function (done) {
                        var navProp = {name: 'jlec', multiplicity: false};
                        api.updateNavigationProperty(200, projectId, entityIDs[0], navigationPropertyID, navProp, function (err, res) {
                            if (err) return done(err);
                            var result = res.body;
                            var result = res.body;
                            Object.keys(navProp).forEach(function (key) {
                                expect(result[key]).equal(navProp[key]);
                            });
                            expect(result._id).equal(navigationPropertyID);
                            done();
                        });
                    });
                    it('Call DELETE /api/models/:projectid/entities/:entityid/navigationProperties/:navPropertyID - Delete navigation property should have 204', function (done) {
                        api.deleteNavigationProperty(204, projectId, entityIDs[0], navigationPropertyID, function (err, res) {
                            if (err) return done(err);
                            done();
                        });
                    });
                });
            });
        });
    });
    describe('Basic Test REST API for Import xl', function () {
        describe('Create a model from xl file', function () {
            it('Scenario SP2: one entity by sheet', function (done) {
                api.importModel(201, path.resolve(__dirname, 'material/fileExcel.xlsx'), function (err, res) {
                    if (err) {
                        done(err);
                    } else {
                        var result = res.body.result;
                        util.getModel('fileExcel', function (err, model) {
                            if (err) return done(err);
                            util.compare(JSON.parse(model), result);
                            done();
                        });
                    }
                });
            });
            it('Scenario SP3: Add property via excel ', function (done) {
                api.importModel(201, path.resolve(__dirname, 'material/fileExcel2.xlsx'), function (err, res) {
                    if (err) {
                        done(err);
                    } else {
                        var result = res.body.result;
                        util.getModel('fileExcel2', function (err, model) {
                            if (err) return done(err);
                            util.compare(JSON.parse(model), result);
                            done();
                        });
                    }
                });
            });
            it('Import type', function (done) {
                api.importModel(201, path.resolve(__dirname, 'material/Type.xlsx'), function (err, res) {
                    if (err) {
                        done(err);
                    } else {
                        var result = res.body.result;
                        util.getModel('Type', function (err, model) {
                            if (err) return done(err);
                            util.compare(JSON.parse(model), result);
                            done();
                        });
                    }
                });
            });
        });
    });
    xdescribe('Basic Test REST API for Sample Data', function () {
        var dataProjectId, dataEntityId, dataEntityName;
        var data = [
            {ID: '1', Name: 'jlec1'},
            {ID: '2', Name: 'jlec2'}
        ];
        it('Prerequisite - create model', function (done) {
            api.createModel(201, function (err, res) {
                if (err) {
                    done(err);
                } else {
                    dataProjectId = res.body.projectId;
                    done();
                }
            });
        });
        it('Prerequisite - create entity', function (done) {
            api.createEntity(201, dataProjectId, {name: 'A'}, function (err, res) {
                if (err) {
                    done(err);
                } else {
                    dataEntityId = res.body._id.toString();
                    dataEntityName = res.body.name;
                    done();
                }
            });
        });
        it('Prerequisite - create property', function (done) {
            api.createProperty(201, dataProjectId, dataEntityId, {name: 'Name'}, function (err, res) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
        });
        it('add JSON sample Data', function (done) {
            api.addSampleData(201, dataProjectId, dataEntityName, data, function (err, res) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
        });
        it('get JSON sample Data', function (done) {
            api.getSampleDataXL(200, dataProjectId, dataEntityName, function (err, res) {
                if (err) {
                    done(err);
                } else {
                    util.compare(data, res.body.entities[0].properties);
                    done();
                }
            });
        });
    });
    describe('Basic Test REST API for ExportXL', function () {
        var newProjectId, entityId;
        it('Export Scenario : first import a model', function (done) {
            api.importModel(201, path.resolve(__dirname, 'material/fileExcel.xlsx'), function (err, res) {
                if (err) {
                    done(err);
                } else {
                    var result = res.body.result;
                    newProjectId = result.projectId;
                    entityId =  result.entities[0]._id;
                    util.getModel('fileExcel', function (err, model) {
                        if (err) return done(err);
                        util.compare(JSON.parse(model), result);
                        done();
                    });
                }
            });
        });
        it('Export Scenario : export to xl file', function (done) {
            api.exportXl(200, newProjectId, function (err, res) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
        });
        it('Export Scenario : export to xl file for one entity', function (done) {
            api.exportXlEntity(200, newProjectId, entityId, function (err, res) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
        });
    });
    describe('Basic Test REST API for oData', function () {
        var oDataProjectId, entityId, entityNameSet;
        it('Prerequisite - create model with data', function (done) {
            api.importModel(201, path.resolve(__dirname, 'material/SalesOrder.xlsx'), function (err, res) {
                if (err) {
                    done(err);
                } else {
                    var result = res.body.result;
                    oDataProjectId = result.projectId;
                    entityId = result.entities[0]._id;
                    entityNameSet = result.entities[0].nameSet;
                    done();
                }
            });
        });
        it('Prerequisite - create property', function (done) {
            api.createProperty(201, oDataProjectId, entityId, {maxLength: 10, precision: 15, scale: 15, default:'jlec'}, function (err, res) {
                if (err) {
                    done(err);
                } else {
                    done();
                }
            });
        });
        it('Call GET /api/models/:projectid/oData - get service description', function (done) {
            api.getServiceDescription(200, oDataProjectId, function (err, res) {
                if (err) {
                    done(err);
                } else {
                    util.getXmlFile('SalesOrder.desc', function (err, xml) {
                        if (err) return done(err);
                        expect(res.text).to.deep.equal(xml.replace('54d51d9cbc2c145c04723145', oDataProjectId));
                        done();
                    });
                }
            });
        });
        it('Call GET /api/models/:projectid/oData/metadata.xml - get Metadata', function (done) {
            api.getMetadata(200, oDataProjectId, function (err, res) {
                if (err) {
                    done(err);
                } else {
                    util.getXmlFile('SalesOrder', function (err, xml) {
                        if (err) return done(err);
                        var s = xml.replace('448baf1e9e64267a0997f74f', oDataProjectId);
                        while (s.indexOf('448baf1e9e64267a0997f74f') !== -1) {
                            s = s.replace('448baf1e9e64267a0997f74f', oDataProjectId);
                        }

                        expect(res.text).to.deep.equal(s);
                        done();
                    });
                }
            });
        });
        it('Call GET /api/models/:projectid/oData/:EntityName - get Metadata', function (done) {
            api.getEntityData(200, oDataProjectId, entityNameSet, function (err, res) {
                if (err) {
                    done(err);
                } else {

                    util.compare([{"Date":"/Date(1421971200000)/","Currency":"USD","Amount":697500,"Author":"Sophie Defin","Name":"Colgate toothpaste","ID":"SO0001"},{"Date":"/Date(1422057600000)/","Currency":"USD","Amount":600000,"Author":"Sophie Defin","Name":"Colgate toothpaste complement","ID":"SO0002"},{"Date":"/Date(1422144000000)/","Currency":"USD","Amount":380000,"Author":"Sophie Defin","Name":"Danone yogurt","ID":"SO0003"},{"Date":"/Date(1422230400000)/","Currency":"USD","Amount":106500,"Author":"Sophie Defin","Name":"Coca Cola drinks ","ID":"SO0004"}], JSON.parse(res.text));

                    done();
                }
            });
        });
    });
});


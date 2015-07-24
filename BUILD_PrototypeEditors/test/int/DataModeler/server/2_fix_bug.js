'use strict';

var chai = require('norman-testing-tp').chai;
chai.should();
var expect = chai.expect;

var DataModelerAPI = require('../api/dataModelerRestApi');
var api = new DataModelerAPI();

var util = require('../api/util');

var path = require('path');
describe('Fix bug', function () {

    this.timeout(15000000);
    before('Intialize API', function (done) {
        api.initialize('fixbug.datamodeler@test.com', 'Minitest!1').then(done);
    });

    describe('#1209 Delete Entity with 2 relations broke DataModeler', function () {
        var newProjectId, entityIDs = [];
        it('Create a project', function (done) {
            api.createModel(201, function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body;
                    newProjectId = result.projectId;
                    done();
                }
            });
        });
        it('create entity A', function (done) {
            api.createEntity(201, newProjectId, {name:'A'}, function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body;
                    entityIDs.push(result._id);
                    done();
                }
            });
        });
        it('and create entity B', function (done) {
            api.createEntity(201, newProjectId, {name:'B'}, function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body;
                    entityIDs.push(result._id);
                    done();
                }
            });
        });
        it('Create first relation between A to B', function (done) {
            api.createNavigationProperty(201, newProjectId, entityIDs[0], {toEntityId: entityIDs[1], multiplicity: true}, function (err) {
                if (err) {
                    done(err);
                }
                else {
                    done();
                }
            });
        });
        it('Create second relation between A to B', function (done) {
            api.createNavigationProperty(201, newProjectId, entityIDs[0], {toEntityId: entityIDs[1], multiplicity: true}, function (err) {
                if (err) {
                    done(err);
                }
                else {
                    done();
                }
            });
        });
        it('Delete entity B', function (done) {
            api.deleteEntity(200, newProjectId, entityIDs[1], function (err) {
                if (err) {
                    done(err);
                }
                else {
                    done();
                }
            });
        });
        it('Check - entity', function (done) {
            api.getModel(200, newProjectId, function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body;
                    expect(result.entities.length).equal(1);
                    expect(result.entities[0].navigationProperties.length).equal(0);

                    done();
                }
            });
        });

    });

    describe('#356 [Bug]Error message on export ( version DataModel v0.4.75 )', function () {
        var newProjectId, entityName;
        it('import file - file356.xlsx', function (done) {
            api.importModel(201, path.resolve(__dirname, 'material/file356.xlsx'), function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body.result;
                    newProjectId = result.projectId;
                    entityName = result.entities[0].nameSet;
                    expect(res.body.success).to.equal(true);
                    done();
                }
            });
        });
        it('get Entity Data', function (done) {
            api.getEntityData(200, newProjectId, entityName, function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body;
                    expect(result).to.deep.equal([
                        {Amount: 697500, Author: 'Sophie Defin', Currency: 'EUR', Date: '/Date(1422403200000)/', ID: 'SO0001', Name: 'Colgate toothpaste'},
                        {Amount: 600000, Author: 'Sophie Defin', Currency: 'EUR', Date: '/Date(1422489600000)/', ID: 'SO0002', Name: 'Colgate toothpaste complement'},
                        {Amount: 380000, Author: 'Sophie Defin', Currency: 'EUR', Date: '/Date(1422576000000)/', ID: 'SO0003', Name: 'Danone yogurt'},
                        {Amount: 106500, Author: 'Sophie Defin', Currency: 'EUR', Date: '/Date(1422662400000)/', ID: 'SO0004', Name: 'Coca Cola drinks '},
                        {Amount: 170000, Author: 'Hanie Melhem', Currency: 'EUR', Date: '/Date(1422662400000)/', ID: 'SO0005', Name: 'Coca Cola  '}
                    ]);
                    done();
                }
            });
        });
    });
    describe('#350 [Bug]The update of xls file shouldnt happen when the structure is not the same(has less properties in one object)', function () {
        var newProjectId;
        it('import file - file350-1.xlsx', function (done) {
            api.importModel(201, path.resolve(__dirname, 'material/file350-1.xlsx'), function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body.result;
                    newProjectId = result.projectId;
                    expect(res.body.success).to.equal(true);
                    done();
                }
            });
        });
        it('update file - file350-2.xlsx', function (done) {
            api.updateModelByXL(200, newProjectId, path.resolve(__dirname, 'material/file350-2.xlsx'), function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    expect(res.body.success).to.equal(false);
                    done();
                }
            });
        });
    });
    describe('#345 [BUG]import an Excel file with mapping table format with no Data : error', function () {
        it('import file - file345.xlsx', function (done) {
            api.importModel(201, path.resolve(__dirname, 'material/file345.xlsx'), function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    expect(res.body.success).to.equal(true);
                    done();
                }
            });
        });
    });
    describe('#331 [BUG]import file with FK with Rel 1 withtout Data: FK appears in the properties', function () {
        it('import file - file331.xlsx', function (done) {
            api.importModel(201, path.resolve(__dirname, 'material/file331.xlsx'), function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body.result;
                    var iProperties = 0;
                    result.entities[0].properties.forEach(function (oProperty) {
                        if (!oProperty.isForeignKey) {
                            iProperties++;
                        }
                    });
                    expect(iProperties).to.equal(6);
                    done();
                }
            });
        });
    });

    describe('#308 [BUG]We shouldnt be able to import Excel file with mapping table format with a relation N-N', function () {
        it('import file - File308.xlsx', function (done) {
            api.importModel(200, path.resolve(__dirname, 'material/File308.xlsx'), function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body;
                    expect(result).to.deep.equal({success: false, messages: [
                        {level: 'error', code: 'R13', description: 'Invalid N - N cardinality for relation ObjectA.ObjectA. A relation can either be 1 - N or 1 - 1.', sheet: 'sheet', table: 'ObjectA.ObjectA', cell: 'I1'}
                    ]});
                    done();
                }
            });
        });
    });
    describe('#306 [BUG]add Excel file with mapping table format : import one entity with auto pointeuse N: KO', function () {
        var newProjectId, entityName;
        it('import file - File306.xlsx', function (done) {
            api.importModel(201, path.resolve(__dirname, 'material/file306.xlsx'), function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body.result;
                    newProjectId = result.projectId;
                    entityName = result.entities[0].nameSet;
                    expect(result.entities[0].navigationProperties[0].multiplicity).equal(false);
                    done();
                }
            });
        });
        it('get Entity Data', function (done) {
            api.getEntityData(200, newProjectId, entityName, function (err, res) {
                if (err) {
                    done(err);
                }
                else {

                    var result = res.body;
                    util.getModel('bug_306', function (err, model) {
                        if (err) return done(err);
                        util.compare(JSON.parse(model), result);
                        done();
                    });
                }
            });
        });
    });

    describe('#285 [BUG]export an Entity only: New DM: import Excel file: error', function () {
        var newProjectId, entityIDs = [];
        it('Create a project Fill data model from blank', function (done) {
            api.createModel(201, function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body;
                    newProjectId = result.projectId;
                    done();
                }
            });
        });
        it('create entity', function (done) {
            api.createEntity(201, newProjectId, {}, function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body;
                    entityIDs.push(result._id);
                    done();
                }
            });
        });
        it('and create entity2', function (done) {
            api.createEntity(201, newProjectId, {}, function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body;
                    entityIDs.push(result._id);
                    done();
                }
            });
        });
        it('create a relation 1 beetwen entity and entity2', function (done) {
            api.createNavigationProperty(201, newProjectId, entityIDs[0], {toEntityId: entityIDs[1], multiplicity: false}, function (err) {
                if (err) {
                    done(err);
                }
                else {
                    done();
                }
            });
        });
        it('Export Scenario : export to xl file for one entity', function (done) {
            api.exportXlEntity(200, newProjectId, entityIDs[1], function (err) {
                if (err) {
                    done(err);
                }
                else {
                    done();
                }
            });
        });
    });
    describe('#284 [BUG]export an Entity only: New DM: import Excel file: error', function () {
        var newProjectId, entityIDs = [], entityName;
        it('Create a project Fill data model from blank', function (done) {
            api.createModel(201, function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body;
                    newProjectId = result.projectId;
                    done();
                }
            });
        });
        it('create entity', function (done) {
            api.createEntity(201, newProjectId, {}, function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body;
                    entityName = result.name;
                    entityIDs.push(result._id);
                    done();
                }
            });
        });
        it('update from xl', function (done) {
            api.updateModelByXL(201, newProjectId, path.resolve(__dirname, 'material/file284.xlsx'), function (err) {
                if (err) {
                    done(err);
                }
                else {
                    done();
                }
            });
        });
        xit('get Entity Data', function (done) {
            api.getEntityData(200, newProjectId, entityName, function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body;
                    expect(result).to.deep.equal([
                        {ID: '1'}
                    ]);

                    done();
                }
            });
        });
    });
    describe('#263 [BUG]we shouldnt be able to create 2 entities with same name with differente case', function () {
        var newProjectId;
        it('Create a project Fill data model from blank', function (done) {
            api.createModel(201, function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body;
                    newProjectId = result.projectId;
                    done();
                }
            });
        });
        it('create entity with Toto name', function (done) {
            api.createEntity(201, newProjectId, {name: 'Toto'}, function (err) {
                if (err) {
                    done(err);
                }
                else {
                    done();
                }
            });
        });
        it('and create entity with TOTO name', function (done) {
            api.createEntity(201, newProjectId, {name: 'TOTO'}, function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body;
                    expect(result.name).equal('TOTO2');
                    done();
                }
            });
        });
    });
    describe('#238', function () {
        var newProjectId, enityId;
        it('import file - File238.xlsx', function (done) {
            api.importModel(201, path.resolve(__dirname, 'material/File238.xlsx'), function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body.result;
                    newProjectId = result.projectId;

                    enityId = result.entities[2]._id;
                    done();
                }
            });
        });
        it('delete entity', function (done) {
            api.deleteEntity(200, newProjectId, enityId, function (err) {
                if (err) {
                    done(err);
                }
                else {
                    done();
                }
            });
        });
    });
    describe('#229', function () {
        var newProjectId;
        it('import file - File229.xlsx', function (done) {
            api.importModel(201, path.resolve(__dirname, 'material/File229.xlsx'), function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body.result;
                    newProjectId = result.projectId;
                    done();
                }
            });
        });
        //todo remove once R10b is removed
        xit('import file - File229.xlsx', function (done) {
            api.addModelByXl(201, newProjectId, path.resolve(__dirname, 'material/File229.xlsx'), function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body.result;
                    expect(result.entities[3].properties[2].name).equal('SalesOrderID');
                    done();
                }
            });
        });
    });
    describe('#226', function () {
        var newProjectId, entityID;
        it('import file - AddRelation.xlsx', function (done) {
            api.importModel(201, path.resolve(__dirname, 'material/AddRelation.xlsx'), function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body.result;
                    newProjectId = result.projectId;
                    entityID = result.entities[1]._id;
                    done();
                }
            });
        });
        it('create relation', function (done) {

            api.createNavigationProperty(201, newProjectId, entityID, {toEntityId: entityID}, function (err) {
                if (err) {
                    done(err);
                }
                done();
            });
        });
    });
    describe('#225', function () {
        var newProjectId;
        it('import file - File225 - 1.xlsx', function (done) {
            api.importModel(201, path.resolve(__dirname, 'material/File225-1.xlsx'), function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body.result;
                    newProjectId = result.projectId;
                    done();
                }
            });
        });
        it('import file - File225-2.xlsx', function (done) {
            api.updateModelByXL(200, newProjectId, path.resolve(__dirname, 'material/File225-2.xlsx'), function (err) {
                if (err) {
                    done(err);
                }
                else {
                    done();
                }
            });
        });
    });
    describe('#224', function () {
        var newProjectId, entityIDs = [], propertyb;
        it('Create a project Fill data model from blank', function (done) {
            api.createModel(201, function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body;
                    newProjectId = result.projectId;
                    done();
                }
            });
        });
        it('create entity', function (done) {
            api.createEntity(201, newProjectId, {}, function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body;
                    entityIDs.push(result._id);
                    done();
                }
            });
        });
        it('and create entity2', function (done) {
            api.createEntity(201, newProjectId, {}, function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body;
                    entityIDs.push(result._id);
                    done();
                }
            });
        });
        it('create a relation N beetwen entity and entity2', function (done) {
            api.createNavigationProperty(201, newProjectId, entityIDs[0], {toEntityId: entityIDs[1]}, function (err) {
                if (err) {
                    done(err);
                }
                else {
                    done();
                }
            });
        });
        //todo reactivate once R10b is removed
        xit('Import an excel file which adds properties to the 2 objects', function (done) {
            api.addModelByXl(201, newProjectId, path.resolve(__dirname, 'material/File224.xlsx'), function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body.result;
                    entityIDs = [];
                    entityIDs.push(result.entities[2]._id);
                    entityIDs.push(result.entities[3]._id);
                    propertyb = result.entities[2].properties[2];
                    done();
                }
            });
        });
        //todo reactivate once R10b is removed
        xit('Rename', function (done) {
            propertyb.name = propertyb.name + 'b';
            api.updateProperty(200, newProjectId, entityIDs[0], propertyb._id, propertyb, function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body;
                    expect(result.name).equal(propertyb.name);

                    done();
                }
            });
        });
    });
    describe('#220', function () {
        var newProjectId, entityIDs = [];
        it('create a data madol from new', function (done) {
            api.createModel(201, function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body;
                    newProjectId = result.projectId;
                    done();
                }
            });
        });
        it('create entity', function (done) {
            api.createEntity(201, newProjectId, {}, function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body;
                    entityIDs.push(result._id);
                    done();
                }
            });
        });
        it('and create entity2', function (done) {
            api.createEntity(201, newProjectId, {}, function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body;
                    entityIDs.push(result._id);
                    done();
                }
            });
        });
        it('create a relation N beetwen entity and entity2', function (done) {
            api.createNavigationProperty(201, newProjectId, entityIDs[0], {toEntityId: entityIDs[1]}, function (err) {
                if (err) {
                    done(err);
                }
                else {
                    done();
                }
            });
        });
        it('remove entity', function (done) {
            api.deleteEntity(200, newProjectId, entityIDs[0], function (err) {
                if (err) {
                    done(err);
                }
                else {
                    done();
                }
            });
        });
        it('Check - entity', function (done) {
            api.getModel(200, newProjectId, function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body;
                    expect(result.entities[0].properties.length).equal(1);

                    done();
                }
            });
        });
    });
    describe('#210 [BUG]Create a data model from search: with a relation 1: export, import: relation 1 is not displayed', function () {
        it('import file - File210.xlsx', function (done) {
            api.importModel(201, path.resolve(__dirname, 'material/File210.xlsx'), function (err) {
                if (err) {
                    done(err);
                }
                else {
                    done();
                }
            });
        });
    });
    describe('#195', function () {
        it('import file - File195.xlsx', function (done) {
            api.importModel(201, path.resolve(__dirname, 'material/File195.xlsx'), function (err, res) {
                if (err) {
                    done(err);
                }
                else {
                    var result = res.body.result;
                    expect(result.entities[0].navigationProperties[0].multiplicity).equal(true);
                    done();
                }
            });
        });
    });
});

'use strict';

require('mocha-steps');

var chai = require('norman-testing-tp').chai;
var should = chai.should();
var expect = chai.expect;
var commonServer = require('norman-common-server');

var DataModelerAPI = require('../api/dataModelerRestApi');
var api = new DataModelerAPI();

var path = require('path');

var registry = commonServer.registry;

var projectId, modelName, getModel;

function testError(fileName, errorCode, done) {
    api.importModel(200, path.resolve(__dirname, 'material/' + fileName + '.xlsx'), function (err, res) {
        if (err) return done(err);
        var model = res.body;
        model.success.should.equal(false);
        model.messages[0].code.should.equal(errorCode);
        expect(model.messages[1]).to.not.exist;
        done();
    });
}

describe('Test REST API Import xl files - foreign key - test API', function () {
    this.timeout(30000);
    before('Intialize API', function (done) {
        api.initialize('importxlError.datamodeler@test.com', 'Minitest!1').then(done);
    });

    describe('test Invalid cases', function () {
        describe('import invalid excel file, one entity by sheet', function () {
            it('import excel 2003 format  file', function (done) {
                api.importModel(200, path.resolve(__dirname, 'material/Model01ERP.xls'), function (err, res) {
                    if (err) return done(err);
                    var model = res.body;
                    model.messages[0].level.should.equal("error");
                    model.messages[0].description.should.equal("Corrupted zip : can't find end of central directory");
                    done();
                });
            });
            it('import non excel format file', function (done) {
                api.importModel(403, path.resolve(__dirname, 'material/importXLExpect1.json'), function (err, res) {
                    if (err) return done(err);
                    var model = res.body;
                    done();
                });
            });
        });

        describe('check error messages', function () {
            it('Rule 1', function (done) {
                testError('Rule1_1column_OBJECTAID', 'R1', done);
            });
            it('Rule 2', function (done) {
                testError('Rule2_2columnID', 'R2', done);
            });
            it('Rule 3', function (done) {
                testError('Rule3_ID_as_second_column', 'R3', done);
            });
            it('Rule 4', function (done) {
                testError('Rule4_MappingTableandForeignKey', 'R4', done);
            });
            it('Rule 5.1', function (done) {
                testError('Rule5_1_ForeignKeyBadFORMAT', 'R5a', done);
            });
            it('Rule 5.2', function (done) {
                testError('Rule5_2_ForeignKeyBadName', 'R5b', done);
            });
            it('Rule 5.3', function (done) {
                testError('Rule5_3_ForeignKeyBadName_notcurrentObject', 'R5c', done);
            });
            it('Rule 6.1', function (done) {
                testError('Rule6_1_MT_mappingTableBadName', 'R6a', done);
            });
            it('Rule 6.2', function (done) {
                testError('Rule6_2_MT_mappingTableBadName', 'R6b', done);
            });
            it('Rule 7', function (done) {
                testError('Rule7_MT_mappingTable3columns', 'R7d', done);
            });
            it('Rule 7.1', function (done) {
                testError('Rule7_1_MT_mappingTableBadColumnName', 'R7a', done);
            });
            it('Rule 7.2', function (done) {
                testError('Rule7_2_MT_mappingTableBadColumnName', 'R7b', done);
            });
            it('Rule 7.3', function (done) {
                testError('Rule7_3_MT_mappingTableBadColumnName', 'R7c', done);
            });
            it('Rule 8', function (done) {
                testError('Rule8_Comment_Outside_DataArea', 'R8', done);
            });
            it('Rule 9.1', function (done) {
                testError('Rule9_1_columnNameMore40chars', 'R9a', done);
            });
            it('Rule 9.2', function (done) {
                testError('Rule9_2_columnNamebeginby8s', 'R9b', done);
            });
            it('Rule 9.3', function (done) {
                testError('Rule9_3_badColumnName', 'R9c', done);
            });
            it('Rule 10 - duplicated property', function (done) {
                testError('Rule10_PropDuplicated', 'R10a', done);
            });
            it('Rule 10 - duplicated relation', function (done) {
                testError('Rule10_RelDuplicated', 'R10a', done);
            });
            it('Rule 13', function (done) {
                testError('Rule13_RelationNN', 'R13', done);
            });
            it('Rule 14 - Duplicated data in ID column', function (done) {
                testError('Rule14_DuplicatedID', 'R14', done);
            });
            it('Rule 14 - Empty data in ID column', function (done) {
                testError('Rule14_EmptyID', 'R14', done);
            });
            it('Rule 15', function (done) {
                testError('Rule15_NonExistingKey', 'R15', done);
            });
        });
        describe('check import sample data error messages', function () {
            step('Create data model', function (done) {
                api.importModel(201, path.resolve(__dirname, 'material/Rule11_NoSampleData.xlsx'), function (err, res) {
                    if (err) return done(err);
                    var model = res.body;
                    projectId = model.result.projectId;
                    done();
                });
            });
            step('Rule 11', function (done) {
                api.updateModelByXL(200, projectId, path.resolve(__dirname, 'material/Rule11_NoSampleData.xlsx'), function (err, res) {
                    if (err) return done(err);
                    var model = res.body;
                    model.success.should.equal(false);
                    model.messages[0].code.should.equal('R11');
                    done();
                });
            });
            step('Rule 10b', function (done) {
                api.addModelByXl(200, projectId, path.resolve(__dirname, 'material/Rule10b_ObjectAlreadyExists.xlsx'), function (err, res) {
                    if (err) return done(err);
                    var model = res.body;
                    model.success.should.equal(false);
                    model.messages[0].code.should.equal('R10b');
                    expect(model.messages[1]).to.not.exist;
                    done();
                });
            });
            step('Rule 12 - object structure modified', function (done) {
                api.updateModelByXL(200, projectId, path.resolve(__dirname, 'material/Rule12_ModifiedObjectStructure.xlsx'), function (err, res) {
                    if (err) return done(err);
                    var model = res.body;
                    model.success.should.equal(false);
                    model.messages[0].code.should.equal('R12');
                    done();
                });
            });
            step('Rule 12 - relation structure modified', function (done) {
                api.updateModelByXL(200, projectId, path.resolve(__dirname, 'material/Rule12_ModifiedRelationStructure.xlsx'), function (err, res) {
                    if (err) return done(err);
                    var model = res.body;
                    model.success.should.equal(false);
                    model.messages[0].code.should.equal('R12');
                    done();
                });
            });
        });
    });
});

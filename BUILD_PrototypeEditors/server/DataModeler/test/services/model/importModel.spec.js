'use strict';

var chai = require('norman-testing-tp').chai;
var expect = chai.expect;
var should = chai.should();

var importModel = require('../../../lib/services/model/xlHepler.js');
var fs = require('fs');
var path = require('path');
var helper = require('./modelHelper.js');

function test(fileName, done) {
    var json = helper.getSampleData(fileName);
    fs.readFile(path.resolve(__dirname, 'excelFiles/' + fileName + '.xlsx'), {encoding: 'binary'}, function (err, data) {
        if (err) {
            done(err);
        }
        else {
            var context = importModel.getModel({data: data});
            var model = {model: context.updatedModel, entityData: context.entityData};
            console.log(JSON.stringify(model));
            model.should.not.be.empty;

            //expect(model).to.deep.equal(json);

            compare(json, model);
            done();
        }
    });
}

function compare(source, de) {
    Object.keys(source).forEach(function (key) {
        if (typeof source[key] === 'object') {
            if (Array.isArray(source[key])) {
                source[key].forEach(function (element, index) {
                    compare(element, de[key][index]);
                });

            }
            else {
                compare(source[key], de[key]);

            }
        }
        //skip compare of foreign key names
        else if (key.indexOf('___') !== 0 && (!de[key].indexOf || de[key].indexOf('___') !== 0)) {
            expect(source[key]).equal(de[key], 'Key: ' + key + ', source: ' + source[key] + ', destination: ' + de[key] + ', for name:' + JSON.stringify(de));
        }
    });
}


describe('UT - importModel.spec.js - Create model from excel file', function () {
    it('Import SalesOrderCheckRange.xlsx file', function (done) {
        test('SalesOrder-CheckRange', done);
    });

    it('Import SalesOrder.xlsx file', function (done) {
        test('SalesOrder', done);
    });

    it('Import SalesOrderWithNavigationSheets.xlsx file', function (done) {
        test('SalesOrderWithNavigationSheets', done);
    });

    it('Import SalesOrder - mapping.xlsx file', function (done) {
        test('SalesOrder - mapping', done);
    });

    it('Import SalesOrder Table Version.xlsx file', function (done) {
        test('SalesOrder Table Version', done);
    });
});
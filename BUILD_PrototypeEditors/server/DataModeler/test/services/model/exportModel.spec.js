'use strict';

var chai = require('norman-testing-tp').chai;
var expect = chai.expect;
var should = chai.should();
var assert = chai.assert;
var exportModel = require('../../../lib/services/model/exportModel.js');
var fs = require('fs');
var path = require('path');

function test(fileName, resultFileName, useMappingTables, done) {
    if (JSON && !JSON.dateParser) {
        var reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
        var reMsAjax = /^\/Date\((d|-|.*)\)[\/|\\]$/;

        JSON.dateParser = function (key, value) {
            if (typeof value === 'string') {
                if (reISO.exec(value)) {
                    return new Date(value);
                }

                var a = reMsAjax.exec(value);
                if (a) {
                    var b = a[1].split(/[-+,.]/);
                    return new Date(b[0] ? +b[0] : 0 - +b[1]);
                }
            }
            return value;
        };
    }

    fs.readFile(path.resolve(__dirname, 'excelFiles/' + resultFileName + '.json'), function (err, data) {
        if (err) {
            done(err);
        } else {
            var json = require(path.resolve(__dirname, 'excelFiles/' + fileName + '.json'));
            json = JSON.parse(JSON.stringify(json), JSON.dateParser);

            var entityNames = [];

            json.entities.forEach(function(entity){
                entityNames.push(entity.name);
            });

            exportModel.exportToXLFormat(json, entityNames, json.sampleData, useMappingTables, !useMappingTables)
                .then(function (xlContent) {
                    var jsonWbContent = xlContent.xlsx_workbook.Sheets;
                    var jsonSavedContent = JSON.parse(data);
                    jsonWbContent.should.not.be.empty;
                    //console.log('\n\n' + JSON.stringify(jsonWbContent) + '\n\n');
                    expect(jsonWbContent).to.deep.equal(jsonSavedContent);
                    done();
                })
                .catch(done);
        }
    });
}

describe('UT - Create excel file from model', function () {
    it('Export ModelWithSampleData.xlsx file', function (done) {
        test('ModelWithSampleData', 'ModelWithSampleData_xlRepresentation', false, done);
    });
    it('Export ModelWithSampleData.xlsx file with mapping table', function (done) {
        test('ModelWithSampleData', 'ModelWithSampleData_xlRepresentationMappingTable', true, done);
    });
});
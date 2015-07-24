'use strict';

var chai = require('norman-testing-tp').chai;
var expect = chai.expect;

var converter = require('../../../lib/services/metadataConverter.js');
var helper = require('./catalogHelper.js');

function compare(source, de) {
    if (typeof source === 'object') {
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
        });
    }
    else {
        expect(source).equal(de, 'source: ' + source + ', destination: ' + de);
    }
}

function test(fileName, done) {
    var reference = helper.getCatalog(fileName);
    helper.getMetadata(fileName, function (err, data) {
        if (err) {
            done(err);
        }
        else {
            var catalog = converter.getCatalog(data);
            expect(catalog).to.be.a('object');
            compare(reference, catalog);
            done();
        }
    });
}

describe('UT - importMetadata.spec.js - Check V2 annotation', function () {

    it('semantics', function (done) {
        test('semantics', done);
    });
    it('tags', function (done) {
        test('tags', done);
    });
    it('units', function (done) {
        test('units', done);
    });
    it('dataseries', function (done) {
        test('dataseries', done);
    });
});

'use strict';

var businessCatalogHelper = require('../../../lib/services/model/businessCatalogHelper.js');
var q = require('q');
var chai = require('norman-testing-tp').chai;
var expect = chai.expect;

var catalog;
var context = {
    businessCatalog: {
        getCatalog: function (/*catalogId*/) {
            return q(catalog);
        }
    },
    logger: {
        debug: function (message) {
            console.log(message);
        }
    }
};

function compare(source, destination) {
    if (typeof source === 'object'){
        Object.keys(source).forEach(function (key) {
            if (typeof source[key] === 'object') {
                if (Array.isArray(source[key])) {
                    source[key].forEach(function (element, index) {
                        compare(element, destination[key][index]);
                    });

                } else {
                    compare(source[key], destination[key]);

                }
            } else {
                expect(source[key]).equal(destination[key], 'Key: ' + key + ', source: ' + source[key] + ', destination: ' + destination[key] + ', for name:' + JSON.stringify(destination));
            }
        });
    } else {
        expect(source).equal(destination, ', source: ' + source + ', destination: ' + destination);
    }
}

describe('UT - businessCatalogHelper.spec.js - Create model from business catalog', function () {
    describe('getEntityWithNavigation', function () {
        it('success - basic', function (done) {
            catalog = {entities: [{_id: 'jlec', properties: [], groups: [], navigationProperties: []}]};
            context.catalogEntityId = 'jlec';
            businessCatalogHelper.getEntityWithNavigation(context)
                .then(function (result) {
                    compare({
                        'entities': [{
                            'originalEntity': 'jlec',
                            'properties': [{
                                'name': 'ID',
                                'propertyType': 'String',
                                'isKey': true,
                                'isNullable': false
                            }],
                            'navigationProperties': [],
                            'isReadOnly': true
                        }]
                    }, result.model);
                    done();
                })
                .catch(done);
        });

        it('success - one properties with semantics', function (done) {
            catalog = {
                entities: [{
                    _id: 'jlec',
                    properties: [{propertyType: 'Edm.String', name: 'photo', semantics: 'photo'}],
                    groups: [],
                    navigationProperties: []
                }]
            };
            context.catalogEntityId = 'jlec';
            businessCatalogHelper.getEntityWithNavigation(context)
                .then(function (result) {
                    compare({
                        'entities': [{
                            'originalEntity': 'jlec',
                            'properties': [{
                                'name': 'ID',
                                'propertyType': 'String',
                                'isKey': true,
                                'isNullable': false
                            }, {
                                'isKey': false,
                                'propertyType': 'String',
                                'order': 2,
                                'name': 'photo',
                                'semantics': 'photo',
                                'tags': ['photo'],
                                'isReadOnly': true
                            }],
                            'navigationProperties': [],
                            'isReadOnly': true
                        }]
                    }, result.model);
                    done();
                })
                .catch(done);
        });

        it('error - not found', function (done) {
            catalog = {entities: []};
            businessCatalogHelper.getEntityWithNavigation(context)
                .catch(function (err) {
                    done();
                });
        });
    });
});

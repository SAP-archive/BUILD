'use strict';

var chai = require('norman-testing-tp').chai;
chai.should();
var expect = chai.expect;

var commonServer = require('norman-common-server');
var registry = commonServer.registry;

var API = require('../api/businessCatalogRestApi');
var user = new API();
var admin = new API();
var path = require('path');
var fs = require('fs');
var catalogId, originalEntity, newCatalog = {name: 'jlec'}, updateCatalog = {name: 'jlec2'};

function getXmlFile(fileName, callBack) {
    fs.readFile(path.resolve(__dirname, 'material/' + fileName + '.xml'), 'utf8', callBack);
}

describe('Basic REST API Test', function () {
    this.timeout(1500000);
    before('Intialize API', function (done) {
        user.initialize('bcm.user@test.com', 'Minitest!1')
            .then(admin.initializeAdmin('bcm.admin@test.com', 'Minitest!1'))
            .then(done);
    });
    describe('Basic Test REST API for BusinessCatalog', function () {
        describe('Prerequisite\r\n', function () {
            it('Prerequisite SRA021_SRV', function (done) {
                getXmlFile('SRA021_SRV', function (err, metadata) {
                    if (err) {
                        return done(err);
                    }

                    var businessCatalog = registry.getModule('BusinessCatalog');
                    businessCatalog.importMetadata(metadata)
                        .then(function (createdCatalog) {
                            catalogId = createdCatalog._id.toString();
                            originalEntity = createdCatalog.entities[0]._id;
                            done();
                        }).catch(done);
                });
            });
            it('Prerequisite ZAREXT_CARTAPPROVAL_V2_SRV', function (done) {
                getXmlFile('ZAREXT_CARTAPPROVAL_V2_SRV', function (err, metadata) {
                    if (err) {
                        return done(err);
                    }

                    var businessCatalog = registry.getModule('BusinessCatalog');
                    businessCatalog.importMetadata(metadata)
                        .then(function (createdCatalog) {
                            catalogId = createdCatalog._id.toString();
                            originalEntity = createdCatalog.entities[0]._id;
                            done();
                        }).catch(done);
                });
            });
            it('Prerequisite ZAREXT_CARTAPPROVAL_V2_SRV', function (done) {
                getXmlFile('ZAREXT_CARTAPPROVAL_V2_SRV', function (err, metadata) {
                    if (err) {
                        return done(err);
                    }

                    var businessCatalog = registry.getModule('BusinessCatalog');
                    businessCatalog.importMetadata(metadata)
                        .then(function (createdCatalog) {
                            catalogId = createdCatalog._id.toString();
                            originalEntity = createdCatalog.entities[0]._id;
                            done();
                        }).catch(done);
                });
            });
        });
        describe('test\r\n', function () {
            it('Call GET /user/catalogs - get catalogs should 200', function (done) {
                admin.getCatalogs(200, function (err/*, res*/) {
                    if (err) {
                        return done(err);
                    }

                    done();
                });
            });
            it('Call POST /api/catalogs/ - add catalog should 200 ', function (done) {
                admin.createCatalog(200, newCatalog, function (err, res) {
                    if (err) {
                        return done(err);
                    }

                    catalogId = res.body._id.toString();
                    expect(res.body.name).equal(newCatalog.name);
                    done();
                });
            });
            it('Call GET /api/catalogs/:catalogId - get catalog should 200 ', function (done) {
                admin.getCatalog(200, catalogId, function (err, res) {
                    if (err) {
                        return done(err);
                    }

                    expect(res.body._id).equal(catalogId);
                    expect(res.body.name).equal(newCatalog.name);
                    done();
                });
            });
            it('Call GET /api/catalogs/entities/:entityId - get entity should 200 ', function (done) {
                admin.getEntity(200, originalEntity, function (err/*, res*/) {
                    if (err) {
                        return done(err);
                    }

                    done();
                });
            });
            it('Call PUT /api/catalogs/ - update catalog should 200 ', function (done) {
                updateCatalog._id = catalogId;
                admin.updateCatalog(200, catalogId, updateCatalog, function (err/*, res*/) {
                    if (err) {
                        return done(err);
                    }

                    done();
                });
            });
            it('Call GET /api/catalogs/:catalogId - get catalog should 200 ', function (done) {
                admin.getCatalog(200, catalogId, function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    expect(res.body._id).equal(catalogId);
                    expect(res.body.name).equal(updateCatalog.name);
                    done();
                });
            });
            it('Call delete /api/catalogs/:catalogId - delete catalog should 200 ', function (done) {
                admin.deleteCatalog(204, catalogId, function (err/*, res*/) {
                    if (err) {
                        return done(err);
                    }
                    done();
                });
            });
            it('Call POST /api/catalogs/entitiesSearch entities search on catalog', function (done) {
                admin.entitySearch(200, {search: 'Descriptor'}, function (err/*, res*/) {
                    if (err) {
                        return done(err);
                    }

                    done();
                });
            });
        });
    });
});


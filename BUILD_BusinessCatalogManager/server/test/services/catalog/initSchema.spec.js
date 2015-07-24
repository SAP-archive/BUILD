'use strict';

var expect = require('norman-testing-tp').chai.expect;
var CatalogService = require('../../../lib/services/catalog');
var catalogService = new CatalogService();
var db = require('norman-server-tp')['node-sap-mongo'];
var _ = require('norman-server-tp').lodash;

var CONFIGDB = {
    hosts: 'localhost',
    database: 'norman-business-catalog-test-init-schema',
    options: {
        db: {
            safe: true
        },
        server: {
            poolSize: 20,
            socketOptions: {
                keepAlive: 1
            }
        }
    }
};

describe('Init schema', function () {
    this.timeout(30000000);

    it('Prerequisite - connection db', function (done) {
        db.connection.initialize(CONFIGDB, {strategy: 'single'})
            .then(function () {
                done();
            })
            .catch(done);

    });

    it('Prerequisite - initialize', function (done) {
        catalogService.initialize(done);
    });

    it('initializeSchema', function (done) {
        catalogService.initializeSchema()
            .then(function (result) {
                expect(result).to.equal(true);

                done();
            })
            .catch(done);
    });

    it('check', function (done) {
        catalogService.getCatalogs()
            .then(function (catalogs) {
                var fs = require('fs');
                var path = require('path');
                var modelPath = path.resolve(__dirname, '../../../lib/services/catalog/metadata');

                Promise.invoke(fs.readdir, modelPath)
                    .then(function (result) {
                        expect(catalogs.length).to.equal(result.length);

                        result.forEach(function (fileName) {
                            var serviceName = path.basename(fileName, path.extname(fileName));

                            expect(_.find(catalogs, {odataServiceName: serviceName})).to.exist;
                        });
                    })
                    .catch(done);


                done();
            })
            .catch(done);
    });
});

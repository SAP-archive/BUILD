'use strict';
require('node-sap-promise');
var expect = require('chai').expect;

var mongoConfig = require('../index.js');
var ConfigService = mongoConfig.ConfigService;
var DbHelper = require('./DbHelper.js');

function testPassed(done) {
    return function () {
        done();
    };
}
function testFailed(done) {
    return function (err) {
        done(err);
    };
}

var auditEvents = [];
function audit(auditData, context) {
    auditEvents.push({
        data: auditData,
        context: context
    });
}

describe('ConfigService', function () {
    var configDb;
    var testConfig = {
        foo: 'bar',
        inner: {
            answer: 42
        }
    };
    var testConfig2 = {
        foo: 'toto',
        inner: {
            answer: 666
        }
    };
    before(function (done) {
        DbHelper.connect('mongodb://localhost:27017/mongo-config-test')
            .then(function (dbHelper) {
                configDb = dbHelper;
                return configDb.dropDatabase();
            })
            .then(function () {
                return configDb.upsert('config', 'testConfig', testConfig);
            })
            .callback(done);
    });
    after(function (done) {
        configDb.dropDatabase()
            .always(function () {
                return configDb.close();
            })
            .callback(done);
        //configDb.close().callback(done);
    });

    beforeEach(function () {
        auditEvents = [];
    });

    describe('.create', function () {
        it('should require a db as first parameter', function () {
            expect(function () {
                return ConfigService.create();
            }).to.throw(TypeError);
            expect(function () {
                return ConfigService.create('foo');
            }).to.throw(TypeError);
        });
        it('should have an optional options.collection parameter', function () {
            var configService = ConfigService.create(configDb.db);
            expect(configService.name).to.equal(mongoConfig.options.configCollection);

            configService = ConfigService.create(configDb.db, { collection: 'test-config'});
            expect(configService.name).to.equal('test-config');

            configService = ConfigService.create(configDb.db, {});
            expect(configService.name).to.equal(mongoConfig.options.configCollection);
        });

    });

    describe('#getConfig', function () {
        it('should retrieve an existing config entry', function (done) {
            var configService = ConfigService.create(configDb.db);
            configService.getConfig('testConfig')
                .then(function (config) {
                    expect(config.value).to.deep.equal(testConfig);
                })
                .then(testPassed(done), testFailed(done));
        });
        it('should return null for a missing config entry', function (done) {
            var configService = ConfigService.create(configDb.db);
            configService.getConfig('unknown-key')
                .then(function (config) {
                    expect(config).to.be.null;
                })
                .then(testPassed(done), testFailed(done));
        });
    });

    describe('#get', function () {
        it('should retrieve an existing config value', function (done) {
            var configService = ConfigService.create(configDb.db);
            configService.get('testConfig')
                .then(function (value) {
                    expect(value).to.deep.equal(testConfig);
                })
                .then(testPassed(done), testFailed(done));
        });
        it('should return undefined for a missing config entry', function (done) {
            var configService = ConfigService.create(configDb.db);
            configService.get('unknown-key')
                .then(function (value) {
                    expect(value).to.be.undefined;
                })
                .then(testPassed(done), testFailed(done));
        });
    });

    describe('#set', function () {
        it('should create a new config value', function (done) {
            var configService = ConfigService.create(configDb.db);
            configService.set('test-set', testConfig)
                .then(function (oldConfig) {
                    expect(oldConfig).to.be.null;
                    return configService.get('test-set');
                })
                .then(function (value) {
                    expect(value).to.deep.equal(testConfig);
                })
                .then(testPassed(done), testFailed(done));
        });
        it('should update an existing config value', function (done) {
            var configService = ConfigService.create(configDb.db);
            configService.set('test-set2', testConfig)
                .then(function (oldConfig) {
                    expect(oldConfig).to.be.null;
                    return configService.set('test-set2', testConfig2);
                })
                .then(function (oldConfig) {
                    expect(oldConfig.value).to.deep.equal(testConfig);
                    return configService.get('test-set2');
                })
                .then(function (value) {
                    expect(value).to.deep.equal(testConfig2);
                })
                .then(testPassed(done), testFailed(done));
        });
        it('should call a provided audit service', function (done) {
            var context = { audit: audit };
            var configService = ConfigService.create(configDb.db);
            configService.set('test-audit-set', testConfig, context)
                .then(function () {
                    expect(auditEvents.length).to.equal(1);
                    var auditData = auditEvents[0].data;
                    expect(auditData.action).to.equal('insert');
                    expect(auditData.key).to.equal('test-audit-set');
                    expect(auditData.value).to.deep.equal(testConfig);
                    expect(auditData.oldValue).to.be.undefined;
                    return configService.set('test-audit-set', testConfig2, context);
                })
                .then(function () {
                    expect(auditEvents.length).to.equal(2);
                    var auditData = auditEvents[1].data;
                    expect(auditData.action).to.equal('update');
                    expect(auditData.key).to.equal('test-audit-set');
                    expect(auditData.value).to.deep.equal(testConfig2);
                    expect(auditData.oldValue).to.deep.equal(testConfig);
                })
                .then(testPassed(done), testFailed(done));
        });
    });

    describe('#delete', function () {
        it('should delete an exiting config value', function (done) {
            var configService = ConfigService.create(configDb.db);
            configService.set('test-delete', testConfig)
                .then(function () {
                    return configService.get('test-delete');
                })
                .then(function (value) {
                    expect(value).to.deep.equal(testConfig);
                    return configService.delete('test-delete');
                })
                .then(function () {
                    return configService.get('test-delete');
                })
                .then(function (value) {
                    expect(value).to.be.undefined;
                })
                .then(testPassed(done), testFailed(done));
        });
        it('should do nothing if the value is missing', function (done) {
            var configService = ConfigService.create(configDb.db);
            configService.get('test-delete')
                .then(function (value) {
                    expect(value).to.be.undefined;
                    return configService.delete('test-delete');
                })
                .then(function () {
                    return configService.get('test-delete');
                })
                .then(function (value) {
                    expect(value).to.be.undefined;
                })
                .then(testPassed(done), testFailed(done));
        });
        it('should call a provided audit service', function (done) {
            var context = { audit: audit };
            var configService = ConfigService.create(configDb.db);
            configService.set('test-audit-delete', testConfig)
                .then(function () {
                    return configService.delete('test-audit-delete', context);
                })
                .then(function () {
                    expect(auditEvents.length).to.equal(1);
                    var auditData = auditEvents[0].data;
                    expect(auditData.action).to.equal('delete');
                    expect(auditData.key).to.equal('test-audit-delete');
                    expect(auditData.value).to.be.undefined;
                    expect(auditData.oldValue).to.deep.equal(testConfig);
                })
                .then(function () {
                    return configService.delete('test-delete', context);
                })
                .then(function () {
                    expect(auditEvents.length).to.equal(1);
                })
                .then(testPassed(done), testFailed(done));
        });
    });
});

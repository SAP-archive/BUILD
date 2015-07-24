'use strict';
require('node-sap-promise');
var expect = require('chai').expect;
var logging = require('node-sap-logging');

var mongoConfig = require('../index.js');
var SecureConfigService = mongoConfig.SecureConfigService;
var DbHelper = require('./DbHelper.js');
var PASSWORD = 'It\'s a kind of magic...!';
var PASSWORD2 = 'Oops no magic today!';
var TEST_TIMEOUT = 30000;

var testLogger = new logging.Logger('test.system.config');
testLogger.addAppender({
    level: logging.LogLevel.DEBUG,
    output: new logging.output.Console()
});

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
function preventOnFulfilled() {
    throw new Error('Promise should not be fulfilled');
}
var auditEvents = [];
function audit(auditData, context) {
    auditEvents.push({
        data: auditData,
        context: context
    });
}


describe('SecureConfigService', function () {
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
    var testString = 'some simple string configuration';
    var testBuffer = new Buffer('some simple buffer configuration');

    if ((this.timeout() > 0) && (this.timeout() < TEST_TIMEOUT)) {
        // Do not override explicit timeout settings, e.g. through --timeout command line option when debugging
        this.timeout(TEST_TIMEOUT);
    }
    this.slow(500);

    before(function (done) {
        DbHelper.connect('mongodb://localhost:27017/mongo-config-test')
            .then(function (dbHelper) {
                configDb = dbHelper;
                return configDb.dropDatabase().catch(function () {
                });
            })
            .callback(done);
    });
    after(function (done) {
        /*
         configDb.dropDatabase()
         .always(function () {
         return configDb.close();
         })
         .callback(done);
         */
        configDb.close().callback(done);
    });

    beforeEach(function () {
        auditEvents = [];
    });

    describe('.create', function () {
        it('should require a db as first parameter', function () {
            expect(function () {
                return SecureConfigService.create();
            }).to.throw(TypeError);
            expect(function () {
                return SecureConfigService.create('foo');
            }).to.throw(TypeError);
        });
        it('should require options as second parameter', function () {
            expect(function () {
                return SecureConfigService.create(configDb.db);
            }).to.throw(TypeError);
            expect(function () {
                return SecureConfigService.create(configDb.db, 'foo');
            }).to.throw(TypeError);
        });
        it('should require a mandatory options.password', function () {
            expect(function () {
                return SecureConfigService.create(configDb.db, {});
            }).to.throw(TypeError);
            expect(function () {
                return SecureConfigService.create(configDb.db, { password: 1 });
            }).to.throw(TypeError);
        });

        it('should return an instance of SecureConfigService', function (done) {
            Promise.fnCall(
                function () {
                    return SecureConfigService.create(configDb.db, { password: PASSWORD });
                })
                .then(function (service) {
                    expect(service).to.be.instanceof(SecureConfigService);
                    expect(service.name).to.equal(SecureConfigService.defaultCollection);
                    return service.initializing; // wait for initialization to complete before moving onto next test
                })
                .then(testPassed(done), testFailed(done));
        });

        it('should have an optional collection parameter', function (done) {
            Promise.fnCall(
                function () {
                    var options = {
                        password: PASSWORD,
                        collection: 'test-secure-config'
                    };
                    return SecureConfigService.create(configDb.db, options);
                })
                .then(function (service) {
                    expect(service).to.be.instanceof(SecureConfigService);
                    expect(service.name).to.equal('test-secure-config');
                    return service.initializing; // wait for initialization to complete before moving onto next test
                })
                .then(testPassed(done), testFailed(done));
        });

        it('should fail if wrong password is provided', function (done) {
            var options = {
                password: PASSWORD,
                collection: 'test-badpwd'
            };
            var service = SecureConfigService.create(configDb.db, options);
            service.initializing.then(function () {
                options.password = 'bad password';
                var badService = SecureConfigService.create(configDb.db, options);
                return badService.initializing;
            })
                .then(preventOnFulfilled, function () {
                })
                .then(testPassed(done), testFailed(done));
        });
    });

    describe('#getConfig', function () {
        it('should retrieve an existing config entry', function (done) {
            var configService = SecureConfigService.create(configDb.db, { password: PASSWORD });
            configService.set('test-getConfig', testConfig)
                .then(function () {
                    return configService.getConfig('test-getConfig');
                })
                .then(function (config) {
                    expect(config.value).to.deep.equal(testConfig);
                })
                .then(testPassed(done), testFailed(done));
        });
        it('should return null for a missing config entry', function (done) {
            var configService = SecureConfigService.create(configDb.db, { password: PASSWORD });
            configService.getConfig('unknown-key')
                .then(function (config) {
                    expect(config).to.be.null;
                })
                .then(testPassed(done), testFailed(done));
        });
    });

    describe('#get', function () {
        it('should retrieve an existing config value', function (done) {
            var configService = SecureConfigService.create(configDb.db, { password: PASSWORD });
            configService.set('test-get', testConfig)
                .then(function () {
                    return configService.get('test-get');
                })
                .then(function (value) {
                    expect(value).to.deep.equal(testConfig);
                })
                .then(testPassed(done), testFailed(done));
        });
        it('should return undefined for a missing config entry', function (done) {
            var configService = SecureConfigService.create(configDb.db, { password: PASSWORD });
            configService.get('unknown-key')
                .then(function (value) {
                    expect(value).to.be.undefined;
                })
                .then(testPassed(done), testFailed(done));
        });
    });

    describe('#set', function () {
        it('should create a new config value', function (done) {
            var configService = SecureConfigService.create(configDb.db, { password: PASSWORD });
            configService.set('test-set', testConfig)
                .then(function (created) {
                    expect(created).to.be.true;
                    return configService.get('test-set');
                })
                .then(function (value) {
                    expect(value).to.deep.equal(testConfig);
                })
                .then(testPassed(done), testFailed(done));
        });
        it('should update an existing config value', function (done) {
            var configService = SecureConfigService.create(configDb.db, { password: PASSWORD });
            configService.set('test-set2', testConfig)
                .then(function (created) {
                    expect(created).to.be.true;
                    return configService.set('test-set2', testConfig2);
                })
                .then(function (created) {
                    expect(created).to.be.false;
                    return configService.get('test-set2');
                })
                .then(function (value) {
                    expect(value).to.deep.equal(testConfig2);
                })
                .then(testPassed(done), testFailed(done));
        });
        it('should support string value', function (done) {
            var configService = SecureConfigService.create(configDb.db, { password: PASSWORD });
            configService.set('test-set-string', testString)
                .then(function (created) {
                    expect(created).to.be.true;
                    return configService.get('test-set-string');
                })
                .then(function (value) {
                    expect(value).to.equal(testString);
                })
                .then(testPassed(done), testFailed(done));
        });
        it('should support buffer value', function (done) {
            var configService = SecureConfigService.create(configDb.db, { password: PASSWORD });
            configService.set('test-set-buffer', testBuffer)
                .then(function (created) {
                    expect(created).to.be.true;
                    return configService.get('test-set-buffer');
                })
                .then(function (value) {
                    expect(value.toString('base64')).to.equal(testBuffer.toString('base64'));
                })
                .then(testPassed(done), testFailed(done));
        });
        it('should not support value types other than object, string or Buffer', function (done) {
            var configService = SecureConfigService.create(configDb.db, { password: PASSWORD });
            configService.set('test-set-invalid', 42)
                .then(preventOnFulfilled, function (err) {
                    expect(err).to.be.instanceof(Error);
                    expect(err.inner).to.be.instanceof(TypeError);
                })
                .then(testPassed(done), testFailed(done));
        });
        it('should call a provided audit service', function (done) {
            var context = { audit: audit };
            var configService = SecureConfigService.create(configDb.db, { password: PASSWORD });
            configService.set('test-audit-set', testConfig, context)
                .then(function () {
                    expect(auditEvents.length).to.equal(1);
                    var auditData = auditEvents[0].data;
                    expect(auditData.action).to.equal('insert');
                    expect(auditData.key).to.equal('test-audit-set');
                    expect(auditData.value).to.be.undefined;
                    return configService.set('test-audit-set', testConfig2, context);
                })
                .then(function () {
                    expect(auditEvents.length).to.equal(2);
                    var auditData = auditEvents[1].data;
                    expect(auditData.action).to.equal('update');
                    expect(auditData.key).to.equal('test-audit-set');
                })
                .then(testPassed(done), testFailed(done));
        });
        it('should update a value if the service version is greater than the config version', function (done) {
            var configService = SecureConfigService.create(configDb.db, { password: PASSWORD });
            configService.set('test-v-greater', testConfig)
                .then(function (created) {
                    expect(created).to.be.true;
                    configService.v = 2;
                    return configService.set('test-v-greater', testConfig2);
                })
                .then(function (created) {
                    expect(created).to.be.false;
                    return configService.get('test-v-greater');
                })
                .then(function (value) {
                    expect(value).to.deep.equal(testConfig2);
                })
                .then(testPassed(done), testFailed(done));
        });
        it('should not update a value if the service version is lower than the config version', function (done) {
            var configService = SecureConfigService.create(configDb.db, { password: PASSWORD });
            configService.initializing
                .then(function () {
                    configService.v = 2;
                    return configService.set('test-v-lower', testConfig);
                })
                .then(function (created) {
                    expect(created).to.be.true;
                    configService.v = 1;
                    return configService.set('test-v-lower', testConfig2);
                })
                .then(preventOnFulfilled, function () {
                    testLogger.info('Update of config with higher version fails as expected');
                })
                .then(testPassed(done), testFailed(done));
        });
    });

    describe('#delete', function () {
        it('should delete an exiting config value', function (done) {
            var configService = SecureConfigService.create(configDb.db, { password: PASSWORD });
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
            var configService = SecureConfigService.create(configDb.db, { password: PASSWORD });
            configService.get('test-delete')
                .then(function (value) {
                    expect(value).to.be.undefined;
                    return configService.delete('test-delete');
                })
                .then(testPassed(done), testFailed(done));
        });
        it('should call a provided audit service', function (done) {
            var context = { audit: audit };
            var configService = SecureConfigService.create(configDb.db, { password: PASSWORD });
            configService.set('test-audit-delete', testConfig)
                .then(function () {
                    return configService.delete('test-audit-delete', context);
                })
                .then(function () {
                    expect(auditEvents.length).to.equal(1);
                    var auditData = auditEvents[0].data;
                    expect(auditData.action).to.equal('delete');
                    expect(auditData.key).to.equal('test-audit-delete');
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

    describe('#changePassword', function () {
        this.slow(5000);
        it('should change the master password', function (done) {
            var configService = SecureConfigService.create(configDb.db, { password: PASSWORD });
            var cipher;
            configService.set('test-changepwd', 'foo')
                .then(function () {
                    var k, p = [];
                    expect(configService.v).to.equal(1);
                    cipher = configService.cipher;
                    for (k = 0; k < 110; ++k) {
                        p.push(configService.set('test-changepwd-' + k, 'config #' + k));
                    }
                    return Promise.waitAll(p);
                })
                .then(function () {
                    return configService.changePassword(PASSWORD2);
                })
                .then(function () {
                    expect(configService.v).to.equal(2);
                    expect(configService.cipher.key.toString('base64')).to.not.equal(cipher.key.toString('base64'));
                    expect(configService.cipher.iv.toString('base64')).to.not.equal(cipher.iv.toString('base64'));
                    // read with old password
                    return configService.get('test-changepwd');
                })
                .then(function (value) {
                    expect(value).to.equal('foo');
                    // read with new password
                    return configService.get('test-changepwd');
                })
                .then(function (value) {
                    expect(value).to.equal('foo');
                })
                .delay(1000)
                .then(testPassed(done), testFailed(done));
        });
    });
});

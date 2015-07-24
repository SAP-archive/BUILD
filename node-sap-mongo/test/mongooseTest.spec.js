'use strict';

var commonDb = require('../index.js');
var mongoose = commonDb.mongoose;
var shardkey = require('node-sap-common').shardkey;

var testLogger = {
    info: console.log, // eslint-disable-line no-console
    debug: console.log, // eslint-disable-line no-console
    error: console.log, // eslint-disable-line no-console
    warn: console.log // eslint-disable-line no-console
};

var skipTests = true;
var mongoLogger = {
    error: function (message, object) {
        testLogger.error({mongo: object}, message);
    },
    log: function (message, object) {
        testLogger.info({mongo: object}, message);
    },
    info: function (message, object) {
        testLogger.info({mongo: object}, message);
    },
    debug: function (message, object) {
        testLogger.debug({mongo: object}, message);
    }
};

var connectionConfig = {
    hosts: 'localhost',
    database: 'common-server-test',
    options: {
        db: {
            w: 1,
            logger: mongoLogger
        },
        server: {
            logger: mongoLogger
        }
    }
};

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

var totoSchema = mongoose.createSchema('toto', {
    id: {type: String, index: true},
    name: String
}, {
    id: false,
    versionKey: false
});
var Toto;


describe('Mongoose', function () {
    this.timeout(3000000);
    before(function (done) {
        commonDb.ConnectionManager.setLogger(testLogger);
        commonDb.connection.initialize(connectionConfig)
            .then(function () {
                skipTests = false;
                Toto = mongoose.createModel('Toto', totoSchema);
                done();
            })
            .catch(function () {
                testLogger.info('Mongo not available, skipping tests');
                done();
            });
    });

    after(function (done) {
        commonDb.connection.disconnect(done);
    });

    describe('Reconnection', function () {
        it('should support disconnection and reconnection', function (done) {
            var toto = {
                id: shardkey(),
                name: 'toto #1'
            };
            if (skipTests) {
                return done();
            }
            return Promise.cast(Toto.create(toto))
                .then(function (createdToto) {
                    testLogger.info({toto: createdToto}, 'Toto #1 created');
                    return commonDb.connection.disconnect();
                })
                .then(function () {
                    return commonDb.connection.initialize(connectionConfig);
                })
                .then(function () {
                    Toto = mongoose.createModel('Toto', totoSchema);
                    toto = {
                        id: shardkey(),
                        name: 'toto #2'
                    };
                    return Promise.cast(Toto.create(toto));
                })
                .then(function (createdToto) {
                    testLogger.info({toto: createdToto}, 'Toto #2 created');
                    var db = commonDb.connection.getDb('toto');
                    var collection = db.collection('totos');
                    toto = {
                        id: shardkey(),
                        name: 'toto #3'
                    };
                    return Promise.objectInvoke(collection, 'insert', [toto]);
                })
                .then(function (result) {
                    testLogger.info({mongo: result}, 'Toto #3 created');
                })
                .then(testPassed(done), testFailed(done));
        });
    });
});

'use strict';

var expect = require('chai').expect;
var commonDb = require('../index.js');
var mongoose = commonDb.mongoose;
var singleton = require('node-sap-common').singleton;

var testLogger = {debug: console.log}; // eslint-disable-line no-console
var mongoAvailable = true;
var TEST_TIMEOUT = 30;

process.argv.forEach(function (arg) {
    if (arg === '--DEBUG') {
        TEST_TIMEOUT = 3600;
    }
});

var connectionConfig = {
    database: 'common-server-test'
};
var distributedDeployment = {
    strategy: 'distribute',
    prefix: 'common-server-distribute-'
};

var mappedDeployment = {
    strategy: 'map',
    prefix: 'common-server-map-',
    map: {
        foo2: 'common-server-map-foo'
    }
};

function preventOnFulfilled() {
    throw new Error('Promise should not be fulfilled');
}

function testPassed(done) {
    return function () {
        done();
    };
}

function testFailed(done) {
    return function (err) {
        if (mongoAvailable) {
            done(err);
        }
        else {
            done();
        }
    };
}

function resetConnection(done) {
    return commonDb.connection.disconnect(done);
}

function checkConnected(db) {
    db = db || commonDb.connection.main.db;
    return Promise.objectInvoke(db.admin(), 'serverStatus').then(function () {
        return true;
    });
}

describe('DB connectivity', function () {
    this.timeout(TEST_TIMEOUT * 1000);
    before(function (done) {
        commonDb.connection.initialize({database: 'admin'}).then(function () {
            mongoAvailable = true;
            return commonDb.connection.disconnect(done);
        }, function () {
            mongoAvailable = false;
            done();
        });
    });

    afterEach(function (done) {
        resetConnection(done);
    });

    describe('Common DB', function () {
        it('should define connection state constants', function () {
            expect(commonDb.DISCONNECTED).to.equal('disconnected');
            expect(commonDb.CONNECTING).to.equal('connecting');
            expect(commonDb.CONNECTED).to.equal('connected');
            expect(commonDb.DISCONNECTING).to.equal('disconnecting');
        });
        it('should be registered as a singleton', function () {
            var registeredDb = singleton.get('server.db');
            expect(registeredDb).to.equal(commonDb);
        });
        it('should connect to the database', function (done) {
            expect(commonDb.connection.connected).to.be.false; // eslint-disable-line no-unused-expressions
            expect(commonDb.connection.status).to.equal(commonDb.DISCONNECTED);

            var connecting = commonDb.connection.initialize(connectionConfig);
            expect(commonDb.connection.connected).to.be.false; // eslint-disable-line no-unused-expressions
            expect(commonDb.connection.status).to.equal(commonDb.CONNECTING);
            expect(commonDb.connection.connecting).to.be.an.instanceof(Promise);

            connecting.then(function () {
                expect(commonDb.connection.connected).to.be.true; // eslint-disable-line no-unused-expressions
                expect(commonDb.connection.status).to.equal(commonDb.CONNECTED);
                var db = commonDb.connection.main.db;
                db.admin().serverStatus(function (err, status) {
                    if (err) {
                        throw err;
                    }
                    else {
                        testLogger.debug('Connected to ' + status.host);
                        expect(status).to.exist();
                    }
                });
            }).then(testPassed(done), testFailed(done));
        });
        it('should disconnect from the database', function (done) {
            var main;
            commonDb.connection.initialize(connectionConfig)
                .then(function () {
                    expect(commonDb.connection.connected).to.be.true; // eslint-disable-line no-unused-expressions
                    main = commonDb.connection.main;
                    return checkConnected();
                })
                .then(function () {
                    var disconnecting = commonDb.connection.disconnect();
                    expect(commonDb.connection.connected).to.be.false; // eslint-disable-line no-unused-expressions
                    expect(commonDb.connection.status).to.equal(commonDb.DISCONNECTING);
                    expect(commonDb.connection.disconnecting).to.be.an('object');
                    expect(commonDb.connection.disconnecting.then).to.be.a('function');
                    return disconnecting;
                })
                .then(function () {
                    expect(commonDb.connection.status).to.equal(commonDb.DISCONNECTED);
                    return checkConnected(main.db)
                        .then(preventOnFulfilled, function (err) {
                            testLogger.debug(err, 'Request fails after disconnection as expected');
                            return commonDb.connection.initialize(connectionConfig);
                        });
                })
                .then(function () {
                    return checkConnected();
                })
                .then(function () {
                    testLogger.debug('Reconnection successful');
                })
                .then(testPassed(done), testFailed(done));
        });
        it('should return connection errors', function (done) {
            var badConfig = {
                database: 'norman',
                hosts: 'invalid.server.net'
            };
            commonDb.connection.initialize(badConfig)
                .then(preventOnFulfilled, function () {
                    testLogger.debug('Connection to invalid host fails as expected');
                })
                .then(testPassed(done), testFailed(done));
        });
        it('should handle disconnection request while connecting', function (done) {
            var connecting = commonDb.connection.initialize(connectionConfig);
            expect(commonDb.connection.status).to.equal(commonDb.CONNECTING);
            connecting
                .then(function () {
                    expect(disconnecting.statusText).to.equal('pending');
                    return disconnecting;
                })
                .then(function () {
                    expect(commonDb.connection.status).to.equal(commonDb.DISCONNECTED);
                })
                .then(testPassed(done), testFailed(done));
            var disconnecting = commonDb.connection.disconnect();
            expect(commonDb.connection.status).to.equal(commonDb.CONNECTING);
        });
        it('should handle multiple disconnection request', function (done) {
            commonDb.connection.initialize(connectionConfig)
                .then(function () {
                    commonDb.connection.disconnect();
                    return commonDb.connection.disconnect();
                })
                .then(function () {
                    expect(commonDb.connection.status).to.equal(commonDb.DISCONNECTED);
                })
                .then(testPassed(done), testFailed(done));
        });
    });
});

describe('Deployment strategy', function () {
    afterEach(function (done) {
        resetConnection(done);
    });
    it('single strategy should put everything in the same database', function (done) {
        commonDb.connection.initialize(connectionConfig).then(function () {
            var fooSchema = mongoose.createSchema('foo', {name: String});
            var barSchema = mongoose.createSchema('bar', {name: String});

            var Foo = mongoose.model('Foo', fooSchema);
            var Bar = mongoose.model('Bar', barSchema);

            var foo = new Foo({name: 'foo'});
            var bar = new Bar({name: 'bar'});

            foo.save();
            bar.save();
        }).then(testPassed(done), testFailed(done));
    });
    it('distribute strategy should put everything in different databases', function (done) {
        commonDb.connection.initialize(connectionConfig, distributedDeployment).then(function () {
            var fooSchema = mongoose.createSchema('foo', {name: String});
            var barSchema = mongoose.createSchema('bar', {name: String});

            var Foo = mongoose.model('DistributedFoo', fooSchema);
            var Bar = mongoose.model('DistributedBar', barSchema);

            var foo = new Foo({name: 'foo'});
            var bar = new Bar({name: 'bar'});

            foo.save();
            bar.save();
        }).then(testPassed(done), testFailed(done));
    });
    it('map strategy should give control over databases', function (done) {
        commonDb.connection.initialize(connectionConfig, mappedDeployment).then(function () {
            var fooSchema = mongoose.createSchema('foo', {name: String});
            var foo2Schema = mongoose.createSchema('foo2', {name: String});
            var barSchema = mongoose.createSchema('bar', {name: String});

            var Foo = mongoose.model('MappedFoo', fooSchema);
            var Foo2 = mongoose.model('MappedFoo2', foo2Schema);
            var Bar = mongoose.model('Mappedbar', barSchema);

            var foo = new Foo({name: 'foo'});
            var foo2 = new Foo2({name: 'foo2'});
            var bar = new Bar({name: 'bar'});

            foo.save();
            foo2.save();
            bar.save();
        }).then(testPassed(done), testFailed(done));
    });
});


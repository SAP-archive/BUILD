'use strict';
var path = require('path');
var expect = require('norman-testing-tp').chai.expect;
var commonServer = require('norman-common-server');
var NormanTestServer = require('norman-testing-server').server;

var TEST_TIMEOUT = 30000;
var EMAIL = 'test@test.com';
var standalone = true;
var dummyContext = {
    requestId: 10,
    ip: '10.176.26.228',
    user: {
        _id: '54e4aa5272d2cd74274e92d7',
        name: 'Smith'
    },
    request: {
        ip: '10.176.26.229',
        protocol: 'my.protocol',
        host: 'localhost',
        method: 'GET',
        url: '/api/optout'
    }
};

function testPassed(done) {
    return function () {
        done();
    };
}
function testFailed(done) {
    return function (err) {
        done(err || new Error('Test failed'));
    };
}

function dropOptOutCollection() {
    var db = commonServer.db.connection.getDb('optout');
    if (db.collection('optouts')) {
        return Promise.invoke(db, 'dropCollection', 'optouts')
            .catch(function () {
                // ignore errors
            });
    }
    else {
        return Promise.resolve(1);
    }
}


describe('OptOutService', function () {
    if ((this.timeout() > 0 ) && (this.timeout() < TEST_TIMEOUT)) {
        // Do not override explicit timeout settings, e.g. through --timeout command line option when debugging
        this.timeout(TEST_TIMEOUT);
    }

    before(function (done) {
        if (NormanTestServer.appServer && NormanTestServer.appServer.status === 'started') {
            standalone = false;
            return done();
        }

        standalone = true;
        NormanTestServer.initialize(path.resolve(__dirname, '../bin/config-test.json'))
            .callback(done);
    });

    after(function (done) {
        if (!standalone) {
            return done();
        }

        NormanTestServer.shutdown().callback(done);
    });

    beforeEach(function (done) {
        dropOptOutCollection()
            .then(function () {
                var optOutService = commonServer.registry.getModule('OptOutService');
                return Promise.invoke(optOutService, 'onInitialized');
            })
            .callback(done);
    });

    describe('registration', function () {
        it('should be exposed through Norman registry', function () {
            var optOutService = commonServer.registry.getModule('OptOutService');
            expect(optOutService).to.exist;
        });
    });

    describe('salt', function () {
        it ('should be retrieved from the database if it exists', function (done) {
            var optOutService = commonServer.registry.getModule('OptOutService');
            var salt = optOutService.salt;
            Promise.fnCall(
                function () {
                    expect(salt).to.exist;
                })
                .then(function () {
                    return Promise.invoke(optOutService, 'onInitialized');
                })
                .then(function () {
                    expect(optOutService.salt).to.equal(salt);
                })
                .then(testPassed(done), testFailed(done));
        });
        it ('should be initialized if it does not exist', function (done) {
            var optOutService = commonServer.registry.getModule('OptOutService');
            var salt = optOutService.salt;
            dropOptOutCollection()
                .then(function () {
                    return Promise.invoke(optOutService, 'onInitialized');
                })
                .then(function () {
                    expect(optOutService.salt).to.exist;
                    expect(optOutService.salt).to.not.equal(salt);
                })
                .then(testPassed(done), testFailed(done));
        });

    });

    describe('#add', function () {
        it('should add a simple email', function (done) {
            var optOutService = commonServer.registry.getModule('OptOutService');
            var email = 'test-add@test.com';
            optOutService.add(email, dummyContext)
                .then(function (added) {
                    expect(added).to.be.true;
                    return optOutService.isOptedOut(email);
                })
                .then(function (res) {
                    expect(res).to.be.true;
                })
                .then(testPassed(done), testFailed(done));
        });
        it('should support adding multiple times the same email', function (done) {
            var email = 'test-add2@test.com';
            var optOutService = commonServer.registry.getModule('OptOutService');
            optOutService.add(email, dummyContext)
                .then(function (added) {
                    expect(added).to.be.true;
                    return optOutService.add(email, dummyContext);
                })
                .then(function (added) {
                    expect(added).to.be.false;
                    return optOutService.isOptedOut(email);
                })
                .then(function (res) {
                    expect(res).to.be.true;
                })
                .then(testPassed(done), testFailed(done));
        });
    });

    describe('#isOptedOut', function () {
        it('should return true if the user opted out', function (done) {
            var email = 'test-isOptedOut@test.com';
            var optOutService = commonServer.registry.getModule('OptOutService');
            optOutService.add(email, dummyContext)
                .then(function () {
                    return optOutService.isOptedOut(email);
                })
                .then(function (res) {
                    expect(res).to.be.true;
                })
                .then(testPassed(done), testFailed(done));
        });
        it('should be case insensitive', function (done) {
            var emailUpper = 'TEST-CASING@test.COM';
            var emailLower = 'test-casing@test.com';
            var optOutService = commonServer.registry.getModule('OptOutService');
            optOutService.add(emailUpper, dummyContext)
                .then(function () {
                    return optOutService.isOptedOut(emailLower);
                })
                .then(function (res) {
                    expect(res).to.be.true;
                })
                .then(testPassed(done), testFailed(done));
        });
        it('should return false if the user is not in the list', function (done) {
            var optOutService = commonServer.registry.getModule('OptOutService');
            optOutService.isOptedOut('dummy@test.com')
                .then(function (res) {
                    expect(res).to.be.false;
                })
                .then(testPassed(done), testFailed(done));
        });
    });

    describe('#remove', function () {
        it('should remove a simple email', function (done) {
            var optOutService = commonServer.registry.getModule('OptOutService')
            var email = 'test-remove@test.com';
            optOutService.add(email, dummyContext)
                .then(function () {
                    return optOutService.isOptedOut(email);
                })
                .then(function (res) {
                    expect(res).to.be.true;
                    return optOutService.remove(email, dummyContext);
                })
                .then(function (removed) {
                    expect(removed).to.be.true;
                    return optOutService.isOptedOut(email);
                })
                .then(function (res) {
                    expect(res).to.be.false;
                })
                .then(testPassed(done), testFailed(done));
        });
        it('should support removing an entry which does not exist', function (done) {
            var email = 'dummy@test.com';
            var optOutService = commonServer.registry.getModule('OptOutService');
            optOutService.remove(email, dummyContext)
                .then(function (removed) {
                    expect(removed).to.be.false;
                })
                .then(testPassed(done), testFailed(done));
        });

    });
});

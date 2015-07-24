'use strict';
var path = require('path');
var NormanTestServer = require('norman-testing-server').server;
var expect = require('norman-testing-tp').chai.expect;
var commonServer = require('norman-common-server');
var TEST_TIMEOUT = 30000;

describe('AuthService', function () {
    if ((this.timeout() > 0 ) && (this.timeout() < TEST_TIMEOUT)) {
        // Do not override explicit timeout settings, e.g. through --timeout command line option when debugging
        this.timeout(TEST_TIMEOUT);
    }
    /*
    before(function (done) {
        NormanTestServer.initialize(path.resolve(__dirname, '../bin/config-test.json'))
            .callback(done);
    });

    after(function (done) {
        NormanTestServer.shutdown().callback(done);
    });
    */

    describe('service', function () {
        it('should be exposed through Norman registry', function () {
            var authService = commonServer.registry.lookupModule('AuthService');
            expect(authService).to.exist;
            expect(authService).to.be.an('object');
        });
    });

    describe('createSession', function () {
        it('should create a session', function () {
            var authService = commonServer.registry.getModule('AuthService');
            var session = authService.createSession('123');
            expect(session).to.exist;
            expect(session).to.be.an('object');
            expect(session.id).to.be.a('string');
            expect(session.user).to.equal('123');
        });
    });

    describe('createToken', function () {
        it('should serialize and sign a session', function () {
            var authService = commonServer.registry.getModule('AuthService');
            var session = authService.createSession('123');
            var token = authService.createToken(session);
            console.log('token: ' + token);
            expect(token).to.exist;
            expect(token).to.be.a('string');
        });
    });
});

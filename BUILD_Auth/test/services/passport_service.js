'use strict';
var path = require('path');
var NormanTestServer = require('norman-testing-server').server;
var expect = require('norman-testing-tp').chai.expect;

var Promise = require('norman-promise');
var commonServer = require('norman-common-server');
var TEST_TIMEOUT = 30000;

describe('Passport Service', function () {
    if ((this.timeout() > 0 ) && (this.timeout() < TEST_TIMEOUT)) {
        // Do not override explicit timeout settings, e.g. through --timeout command line option when debugging
        this.timeout(TEST_TIMEOUT);
    }
    /*
    before(function (done) {
        var self = this;
        NormanTestServer.initialize(path.resolve(__dirname, '../bin/config-test.json'))
            .callback(done);
    });
    after(function (done) {
        NormanTestServer.shutdown()
            .callback(done);
    });
    */

    it('should be exposed through Norman registry', function () {
        var passportService = commonServer.registry.lookupModule('PassportService');
        expect(passportService).to.exist;
        expect(passportService).to.be.an('object');
    });

});

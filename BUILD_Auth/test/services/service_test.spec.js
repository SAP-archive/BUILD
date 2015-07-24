'use strict';
var path = require('path');
var chai = require('norman-testing-tp').chai;
var expect = chai.expect;
var commonServer = require('norman-common-server');
var NormanTestServer = require('norman-testing-server').server;

var TEST_TIMEOUT = 30000;

describe('Auth Services', function () {
    if ((this.timeout() > 0 ) && (this.timeout() < TEST_TIMEOUT)) {
        this.timeout(TEST_TIMEOUT);
    }

    before(function (done) {
        NormanTestServer.initialize(path.resolve(__dirname, '../bin/config-test.json'))
            .callback(done);
    });

    after(function (done) {
        NormanTestServer.dropDB()
            .always(function () {
                return NormanTestServer.shutdown();
            })
            .callback(done);
    });

    // Load tests
    require('./user_service.js');
    require('./acl_service.js');
    require('./auth_service.js');
    require('./passport_service.js');

});


'use strict';

var util = require('util');
var expect = require('chai').expect;
var sapAppServer = require('../index.js');

var defaultConfig = require('./config.json');

describe('Nested service callbacks', function () {
    this.timeout(30000);
    it('should support nested service callbacks', function (done) {
        var complexService = require('./complex-service');
        var customLoader = {
            require: function (moduleName) {
                return (moduleName === 'complex-service' ? complexService : sapAppServer.Loader.require(moduleName));
            }
        };
        var config = util._extend({}, defaultConfig);
        config.services = { handlers: {} };
        config.services.handlers['complex-service'] = '';

        var server = new sapAppServer.Server(config);
        server.start(customLoader).then(function () {
            expect(server.appServer.status).to.equal('started');
            expect(complexService.fooService.callbackCount.initialize).to.equal(1);
            expect(complexService.barService.callbackCount.initialize).to.equal(1);
            expect(complexService.fooService.callbackCount.onInitialized).to.equal(1);
            expect(complexService.barService.callbackCount.onInitialized).to.equal(1);
            return server.appServer.shutdown(true);
        }).then(function () {
            expect(server.appServer.status).to.equal('stopped');
            done();
        }).catch(function (err) {
            done(err);
        });
    });
});

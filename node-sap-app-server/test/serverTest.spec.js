'use strict';

var path = require('path');
var util = require('util');
var expect = require('chai').expect;
var sapAppServer = require('../index.js');

var defaultConfig = require('./config.json');

describe('server: basic test', function () {
    this.timeout(30000);

    it('run', function () {
        expect(sapAppServer.Server).to.be.a('function');
    });

    it('start with empty config', function (done) {
        expect(sapAppServer.Server).to.be.a('function');
        var config = {};

        var server = new sapAppServer.Server(config);
        server.start().then(function () {
            expect(server.appServer.status).to.equal('started');
            return server.appServer.shutdown(true);
        }).then(function () {
            expect(server.appServer.status).to.equal('stopped');
            done();
        }).catch(function (err) {
            done(err);
        });
    });

    it('start with db config', function (done) {
        expect(sapAppServer.Server).to.be.a('function');
        var config = util._extend({}, defaultConfig);

        var server = new sapAppServer.Server(config);
        server.start().then(function () {
            expect(server.appServer.status).to.equal('started');
            return server.appServer.shutdown(true);
        }).then(function () {
            expect(server.appServer.status).to.equal('stopped');
            done();
        }).catch(function (err) {
            done(err);
        });
    });

    it('start with one service', function (done) {
        var config = util._extend({}, defaultConfig);
        config.services = {handlers: {}};
        config.services.handlers[path.resolve(__dirname, './service.js')] = '';

        var server = new sapAppServer.Server(config);
        server.start().then(function () {
            expect(server.appServer.status).to.equal('started');

            var service = global._nodeSapTestShared.service;
            expect(service.load).to.equal(true);
            expect(service.initialize).to.equal(1);
            expect(service.onInitialized).to.equal(1);
            expect(service.getHandlers).to.equal(1);

            return server.appServer.shutdown(true);
        }).then(function () {
            expect(server.appServer.status).to.equal('stopped');
            done();
        }).catch(function (err) {
            done(err);
        });
    });

    it('start with several workers', function (done) {
        expect(sapAppServer.Server).to.be.a('function');
        var config = defaultConfig;

        config.services = {handlers: {}};
        config.services.handlers[path.resolve(__dirname, './service.js')] = '';
        config.server = {workers: 4};

        var server = new sapAppServer.Server(config);
        server.start()
            .then(function () {
                return server.shutdown(true);
            })
            .then(function () {
                return server.start();
            })
            .then(function () {
                return server.shutdown(true);
            })
            .then(function () {
                done();
            })
            .catch(done);
    });
});

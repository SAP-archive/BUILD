'use strict';

var registry = require('norman-common-server').registry;

var services = {
    userAdmin: require('./users'),
    accessAdmin: require('./access')
};

module.exports = {
    initialize: function (done) {
        var k, n, keys;
        Object.keys(services).forEach(function (key) {
            var ServiceClass = services[key];
            registry.registerModule(new ServiceClass(), key);
        });
        keys = Object.keys(services);
        k = 0;
        n = keys.length;
        function next(err) {
            var key, service;
            if (err) {
                done(err);
            }
            if (k >= n) {
                done();
                return;
            }
            key = keys[k++];
            service = registry.getModule(key);
            service.initialize(next);
        }
        next();
    },

    onInitialized: function () {
        var k, n, keys, key, service;
        keys = Object.keys(services);
        k = 0;
        n = keys.length;
        function next() {
            if (k >= n) {
                return;
            }
            key = keys[k++];
            service = registry.getModule(key);
            service.onInitialized(next);
        }
        next();
    },

    shutdown: function (done) {
        var k, n, keys, key, service;
        keys = Object.keys(services);
        k = 0;
        n = keys.length;
        function next() {
            if (k >= n) {
                done();
                return;
            }
            key = keys[k++];
            service = registry.getModule(key);
            registry.unregisterModule(key);
            service.shutdown(next);
        }
        next();
    },
    services: services
};


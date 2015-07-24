'use strict';

/*global Promise:true*/
var Promise = require('norman-promise');
var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var serviceLogger = commonServer.logging.createLogger('auth-services');

// Services exposed from the Projects module
var serviceFactories = {
    PassportService: require('./passport'),
    AclService: require('./acl'),
    UserService: require('./user'),
    AuthService: require('./auth'),
    AccessService: require('./access'),
    OptOutService: require('./opt-out')
};

var serviceInstances = {
};

function runOnServices(services, fnName, done) {
    var k, n, keys;
    keys = Object.keys(services);
    k = 0;
    n = keys.length;
    function nextService() {
        var key, service;
        if (k >= n) {
            serviceLogger.debug('Auth services ' + fnName + ' completed');
            return Promise.resolve(true);
        }
        key = keys[k++];
        service = services[key];
        serviceLogger.debug('Running ' + fnName + ' process on ' + key);
        if (typeof service[fnName] === 'function') {
            return Promise.objectInvoke(service, fnName).then(nextService);
        }
        return nextService();
    }
    return nextService().callback(done);
}

module.exports = {
    initialize: function (done) {
        serviceLogger.debug('Initializing Auth services');
        Object.keys(serviceFactories).forEach(function (key) {
            serviceLogger.debug('Registering service ' + key);
            var service, ServiceClass = serviceFactories[key];
            service = new ServiceClass();
            serviceInstances[key] = service;
            registry.registerModule(service, key);
        });
        runOnServices(serviceInstances, 'initialize', done);
    },
    onInitialized: function (done) {
        serviceLogger.debug('Auth services onInitialized');
        runOnServices(serviceInstances, 'onInitialized', done);
    },
    checkSchema: function (done) {
        serviceLogger.debug('Auth services checkSchema');
        runOnServices(serviceInstances, 'checkSchema', done);
    },
    onSchemaChecked: function (done) {
        serviceLogger.debug('Auth services onSchemaChecked');
        runOnServices(serviceInstances, 'onSchemaChecked', done);
    },
    initializeSchema: function (done) {
        serviceLogger.debug('Auth services initializeSchema');
        runOnServices(serviceInstances, 'initializeSchema', done);
    },
    onSchemaInitialized: function (done) {
        serviceLogger.debug('Auth services onSchemaInitialized');
        runOnServices(serviceInstances, 'onSchemaInitialized', done);
    },
    prepareSchemaUpgrade: function (done) {
        serviceLogger.debug('Auth services prepareSchemaUpgrade');
        runOnServices(serviceInstances, 'prepareSchemaUpgrade', done);
    },
    upgradeSchema: function (done) {
        serviceLogger.debug('Auth services upgradeSchema');
        runOnServices(serviceInstances, 'upgradeSchema', done);
    },
    onSchemaUpgraded: function (done) {
        serviceLogger.debug('Auth services onSchemaUpgraded');
        runOnServices(serviceInstances, 'onSchemaUpgraded', done);
    },
    shutdown: function (done) {
        serviceLogger.info('Shutdown Auth services');
        runOnServices(serviceInstances, 'shutdown', done);
        serviceInstances = {};
    },

    services: serviceFactories
};

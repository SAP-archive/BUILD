'use strict';

var util = require('util');

var commonServer = require('norman-common-server');

require('./config/env');

var logger = commonServer.logging.createLogger('auth-server');

var services = require('./lib/services');
var api = require('./lib/api');
var internalApi = require('./lib/internal');
var filters = require('./lib/filters');

module.exports = {
    initialize: function (done) {
        logger.debug('initialize(), auth server');
        services.initialize(function (err) {
            if (err) {
                done(err);
            }
            else {
                api.initialize();
                internalApi.initialize();
                done();
            }
        });
    },
    onInitialized: function (done) {
        logger.debug('onInitialized(), post-initialization() auth server');
        services.onInitialized(done);
    },
    checkSchema: function (done) {
        services.checkSchema(done);
    },
    onSchemaChecked: function (done) {
        services.onSchemaChecked(done);
    },
    initializeSchema: function (done) {
        services.initializeSchema(done);
    },
    onSchemaInitialized: function (done) {
        services.onSchemaInitialized(done);
    },
    prepareSchemaUpgrade: function (done) {
        services.prepareSchemaUpgrade(done);
    },
    upgradeSchema: function (done) {
        services.upgradeSchema(done);
    },
    onSchemaUpgraded: function (done) {
        services.onSchemaUpgraded(done);
    },
    shutdown: function (done) {
        services.shutdown(done);
    },
    getHandlers: function () {
        logger.debug('getHandlers(), auth server');
        var result = api.getHandlers();
        var intResult = internalApi.getHandlers();
        util._extend(result,intResult);
        return result;
    },
    getFilter: function (filterName, options) {
        var filter = filters[filterName];
        var result = null;
        switch (typeof filter) {
            case 'function' :
                result = filter(options);
                break;
            case 'object' :
                if (typeof filter.getFilter === 'function') {
                    result = filter.getFilter(options);
                }
                break;
        }
        return result;
    }
};

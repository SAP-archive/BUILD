'use strict';

var commonServer = require('norman-common-server');
var services = require('./lib/services');
var api = require('./lib/api');

var logger = commonServer.logging.createLogger('uicatalog-service');
commonServer.logging.manager.on('configure', function () {
    logger = commonServer.logging.createLogger('uicatalog-service');
});

module.exports = {
    initialize: function (done) {
        logger.info('Initializing UICatalog service');
        services.initialize(function (err) {
            if (err) {
                done(err);
            }
            else {
                done();
            }
        });
    },
    onInitialized: function () {
        services.onInitialized();
    },
    checkSchema: function (done) {
        services.checkSchema(done);
    },
    onSchemaChecked: function () {
        services.onSchemaChecked();
    },
    initializeSchema: function (done) {
        services.initializeSchema(done);
    },
    onSchemaInitialized: function () {
        services.onSchemaInitialized();
    },
    prepareSchemaUpgrade: function (done) {
        services.prepareSchemaUpgrade(done);
    },
    upgradeSchema: function (done) {
        services.upgradeSchema(done);
    },
    onSchemaUpgraded: function () {
        services.onSchemaUpgraded();
    },
    shutdown: function (done) {
        logger.info('Stopping UICatalog service');
        api.shutdown();
        services.shutdown(done);
    },
    getHandlers: function () {
    	api.initialize();
        logger.debug('Get UICatalog handlers');
        return api.getHandlers();
    }
};

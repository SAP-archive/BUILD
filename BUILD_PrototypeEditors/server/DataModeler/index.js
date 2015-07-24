'use strict';

var commonServer = require('norman-common-server');
var services = require('./lib/services');
var api = require('./lib/api');

var logger = commonServer.logging.createLogger('model-service');
commonServer.logging.manager.on('configure', function () {
    logger = commonServer.logging.createLogger('model-service');
});

module.exports = {
    name: 'DataModeler',
    initialize: function (done) {
        logger.info('Initializing Data Modeler service');
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

        api.initialize();
    },
    checkSchema: function (done) {
        logger.info('Checking Schema on Data Modeler service');
        services.checkSchema(done);
    },
    onSchemaChecked: function () {
    },
    initializeSchema: function (done) {
        done();
    },
    onSchemaInitialized: function () {
    },
    prepareSchemaUpgrade: function (done) {
        done();
    },
    upgradeSchema: function (done) {
        done();
    },
    onSchemaUpgraded: function () {
    },
    shutdown: function (done) {
        logger.info('Stopping Data Modeler service');
        api.shutdown();
        services.shutdown(done);
    },
    getHandlers: function () {
        logger.debug('Get Data Modeler service handlers');
        return api.getHandlers();
    }
};

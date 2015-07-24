'use strict';
var commonServer = require('norman-common-server');
var services = require('./lib/services');
var api = require('./lib/api');

var logger = commonServer.logging.createLogger('norman-shared-workspace-server');

module.exports = {
    name: 'SharedWorkSpace',
    initialize: function (done) {
        logger.info('Initializing sample service');
        services.initialize(function (err) {
            if (err) {
                done(err);
            }
            else {
               // api.initialize();
                done();
            }
        });
    },
    onInitialized: function (done) {
        logger.info('Sample service post-initialization');
        services.onInitialized(done);
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
        logger.info('Stopping sample service');
        api.shutdown();
        services.shutdown(done);
    },
    getHandlers: function () {
        logger.debug('Get sample service handlers');
        api.initialize();
        return api.getHandlers();
    }
};

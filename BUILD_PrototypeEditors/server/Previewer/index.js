'use strict';
var commonServer = require('norman-common-server');
var services = require('./lib/services');

var logger = commonServer.logging.createLogger('norman-previewer-server');
commonServer.logging.manager.on('configure', function () {
    logger = commonServer.logging.createLogger('norman-previewer-server');
});
module.exports = {
    name: 'Previewer',
    initialize: function (done) {
        logger.info('Initializing norman-previewer-server service');
        services.initialize(function (err) {
            if (err) {
                done(err);
            }
            else {
                done();
            }
        });
    },
    shutdown: function (done) {
        logger.info('Stopping norman-previewer-server service');
        services.shutdown(done);
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
    getHandlers: function () {
        return {};
    }
};

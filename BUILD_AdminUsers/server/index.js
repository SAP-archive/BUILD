'use strict';

var commonServer = require('norman-common-server');
var services = require('./lib/services');
var api = require('./lib/api');

var logger = commonServer.logging.createLogger('admin-users');

module.exports = {
    initialize: function (done) {
        logger.info('Initializing Admin Users service');
        services.initialize(done);
    },

    onInitialized: function () {
        services.onInitialized();
    },

    shutdown: function (done) {
        logger.info('Stopping Admin Users service');
        api.shutdown();
        services.shutdown(done);
    },

    getHandlers: function () {
        logger.debug('Get Admin Users service handlers');
        api.initialize();
        return api.getHandlers();
    }
};

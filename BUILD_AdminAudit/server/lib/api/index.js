'use strict';
var commonServer = require('norman-common-server');
var logger = commonServer.logging.createLogger('admin-audit');

var handlerModules = {
    audit: './audit'
};

var handlers = {};

module.exports = {
    initialize: function () {

        Object.keys(handlerModules).forEach(function (key) {
            handlers[key] = require(handlerModules[key]);
        });
    },
    shutdown: function () {
        logger.info('Stopping Admin Audit API');
    },
    getHandlers: function () {
        logger.debug('Get Admin Audit API handlers');
        return handlers;
    }
};

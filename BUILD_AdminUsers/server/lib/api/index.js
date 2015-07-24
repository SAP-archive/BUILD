'use strict';
var commonServer = require('norman-common-server');
var logger = commonServer.logging.createLogger('admin-users');

var handlerModules = {
    access: './access',
    users: './users'
};

var handlers = {};

module.exports = {
    initialize: function () {

        Object.keys(handlerModules).forEach(function (key) {
            handlers[key] = require(handlerModules[key]);
        });
    },
    shutdown: function () {
        logger.info('Stopping Admin Users API');
    },
    getHandlers: function () {
        logger.debug('Get Admin Users API handlers');
        return handlers;
    }
};


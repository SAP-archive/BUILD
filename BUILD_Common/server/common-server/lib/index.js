'use strict';

var tp = require('norman-server-tp');
var utils = tp['node-sap-common'];

var serverId = utils.serverId;

var commonServer = {
    CommonError: utils.CommonError,
    config: require('./config'),
    context: utils.context,
    db: require('./db'),
    logging: require('./logging'),
    NormanError: require('./NormanError'),  // Keep legacy naming for compatibility
    registry: utils.registry,
    resource: require('./resource'),
    singleton: utils.singleton,
    tp: tp,
    utils: utils,
    Mailer: require('./mailer'),
    features: require('./features'),
    upload: require('./upload'),
    Promise: tp['node-sap-promise']
};

Object.defineProperty(commonServer, 'serverId', {
    get: function () {
        return serverId;
    }
});

module.exports = commonServer;

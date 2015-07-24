'use strict';

var common = require('norman-server-tp')['node-sap-common'];
var singleton = common.singleton;

var ConfigurationManager, config = singleton.get('config');

if (!config) {
    ConfigurationManager = common.ConfigurationManager;
    config = new ConfigurationManager();
    singleton.register('config', config);
}

module.exports = config;

'use strict';

var util = require('util');
var tp  = require('norman-server-tp');
var singleton = tp['node-sap-common'].singleton;

var manager, configWatcher, logging = singleton.get('logging'), logLib;
if (!logging) {
    logLib = tp['node-sap-logging'];
    logging = util._extend({}, logLib);

    // Adapt logging layer
    logging.Logger.serializers.err.ignore.details = true;

    manager = new logLib.LogManager();
    configWatcher = new logLib.ConfigWatcher(manager);
    logging.configure = function (options) {
        manager.configure(options);
    };
    logging.createLogger = function (name, options) {
        return manager.createLogger(name, options);
    };
    logging.addWatch = function (logger) {
        configWatcher.addWatch(logger);
    };
    logging.removeWatch = function (logger) {
        configWatcher.removeWatch(logger);
    };
    logging.manager = manager;
    singleton.register('logging', logging);
}

module.exports = logging;

'use strict';

var util = require('util');
var registry = require('node-sap-common').registry;

var manager, configWatcher, logging, logLib;
logging = registry.lookupModule('logging');

if (!logging) {
    logLib = require('node-sap-logging');
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
    logging.addWatch = function (currLogger) {
        configWatcher.addWatch(currLogger);
    };
    logging.removeWatch = function (currLogger) {
        configWatcher.removeWatch(currLogger);
    };
    logging.manager = manager;
    registry.registerModule(logging, 'logging');
}

module.exports = logging;

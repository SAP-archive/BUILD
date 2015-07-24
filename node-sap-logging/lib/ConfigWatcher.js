"use strict";
var Logger = require("./Logger");

function ConfigWatcher(logManager) {
    var self = this;
    this.manager = logManager;
    logManager.on("configure", function () {
        self.onConfigure();
    });
    this.loggers = {};
}

module.exports = ConfigWatcher;

function isLogger(logger) {
    return (logger && (logger instanceof Logger));
}
ConfigWatcher.prototype.onConfigure = function () {
    var k, n, logger, loggers, keys, manager;
    loggers = this.loggers;
    keys = Object.keys(loggers);
    manager = this.manager;
    for (k = 0, n = keys.length; k < n; ++k) {
        logger = loggers[keys[k]];
        logger.setAppenders(manager.getAppenders(logger.name));
    }
};

ConfigWatcher.prototype.addWatch = function (logger) {
    if (isLogger(logger)) {
        this.loggers[logger.id] = logger;
    }
};

ConfigWatcher.prototype.removeWatch = function (logger) {
    if (isLogger(logger)) {
        delete this.loggers[logger.id];
    }
};

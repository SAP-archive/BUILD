/**
 * Created by i055023 on 4/21/15.
 */
'use strict';

var commonServer = require('norman-common-server'),
    commonMessage = require('./../common/common.message.js'),
    NormanError = commonServer.NormanError,
    registry = commonServer.registry;

var serviceLogger = commonServer.logging.createLogger('swregistry-service');

function SwRegistryService() {
    this.preModules = {};
    this.postModules = {};
}

SwRegistryService.prototype.initialize = function (done) {
    done();
};

SwRegistryService.prototype.onInitialized = function (done) {
    done();
};

/**
 * Shutdown service
 * @param done
 */
SwRegistryService.prototype.shutdown = function (done) {
    done();
};

var logError = function (code, err) {
    var error;
    if (!err) {
        error = new NormanError(commonMessage.error[code], code);
    }
    else {
        error = new NormanError(commonMessage.error[code] + err, code);
    }
    serviceLogger.error(error);
    return error;
};


SwRegistryService.prototype.registerModule = function (moduleName, call) {
    if (!moduleName) {
        return logError(commonMessage.registry.error.SWRE001);
    }
    var model;
    var registered = false;
    if (call === 'post') {
        model = this.postModules[moduleName];
        if (!model) {
            this.postModules[moduleName] = registry.getModule(moduleName);
            registered = true;
            serviceLogger.info({moduleName: moduleName}, commonMessage.registry.success.SWRS001);
        }
    }
    else {
        model = this.preModules[moduleName];
        if (!model) {
            this.preModules[moduleName] = registry.getModule(moduleName);
            registered = true;
            serviceLogger.info({moduleName: moduleName}, commonMessage.registry.success.SWRS001);
        }
    }
    return registered;
};

SwRegistryService.prototype.unregisterModule = function (moduleName) {
    delete this.postModules[moduleName];
    delete this.preModules[moduleName];
    serviceLogger.info({moduleName: moduleName}, commonMessage.registry.success.SWRS002);
    return true;
};

SwRegistryService.prototype.getModules = function (call) {
    var modules;
    if (call === 'post') {
        modules = this.postModules;
    }
    else {
        modules = this.preModules;
    }
    return modules;
};

SwRegistryService.prototype.getModule = function (moduleName, call) {
    var module;
    if (call === 'post') {
        module = this.postModules[moduleName];
    }
    else {
        module = this.preModules[moduleName];
    }
    if (!module) {
        return logError(commonMessage.registry.error.SWRE002);
    }
    return module;
};

module.exports = SwRegistryService;

'use strict';

var singleton = require('./singleton.js');

function Registry() {
    this.modules = {};
}

Registry.prototype.getModule = function (moduleName) {
    var mod = this.modules[moduleName];
    if (!mod) {
        throw new Error('Unregistered module \"' + moduleName + '\"');
    }
    return mod;
};

Registry.prototype.lookupModule = function (moduleName) {
    return this.modules[moduleName];
};

Registry.prototype.registerModule = function (moduleExports, moduleName) {
    if (!moduleExports) {
        throw new Error('Invalid module "' + moduleName + '"');
    }
    moduleName = moduleName || moduleExports.name;
    if (!moduleName) {
        throw new Error('Missing module name');
    }
    this.modules[moduleName] = moduleExports;
};

Registry.prototype.unregisterModule = function (moduleName) {
    this.modules[moduleName] = undefined;
};

module.exports = singleton.declare('registry', Registry);

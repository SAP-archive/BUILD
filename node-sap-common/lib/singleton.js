'use strict';

// Global shared state
global._nodeSapShared = global._nodeSapShared || {};
var sharedState = global._nodeSapShared;

var singleton = {};

singleton.get = function (name) {
    return sharedState[name];
};

singleton.register = function (name, value) {
    if (sharedState.hasOwnProperty(name)) {
        throw new Error('Singleton "' + name + '" already registered');
    }
    sharedState[name] = value;
};

singleton.registerIfMissing = function (name, value) {
    if (sharedState.hasOwnProperty(name)) {
        return sharedState[name];
    }
    sharedState[name] = value;
    return value;
};

singleton.unregister = function (name) {
    delete sharedState[name];
};

singleton.declare = function (name, def) {
    var instance = sharedState[name];
    if (!instance) {
        if (typeof def === 'function') {
            instance = Object.create(def.prototype);
            def.call(instance);
        }
        else {
            instance = def;
        }
        sharedState[name] = instance;
    }
    return instance;
};

module.exports = singleton;

'use strict';
var util = require('util');
var commonServer = require('norman-common-server');
var serviceLogger = commonServer.logging.createLogger('UserResearch API');
var Promise = require('norman-promise');

var handlerModules = {
    studies: './study',
    questions: './question',
    participants: './participant',
    prototypes: './prototype',
    tracking: './tracking',
    studyprototypes: './studyPrototype',
	review: './review'
};

var handlers = {};
var apiModules = {};

function runOnModules(modules, fnName, done) {
    var k, n, keys;
    keys = Object.keys(modules);
    k = 0;
    n = keys.length;
    function nextModule() {
        var key, module;
        if (k >= n) {
            return Promise.resolve(true);
        }
        key = keys[k++];
        module = modules[key];
        serviceLogger.debug('Running ' + fnName + ' process on ' + key);
        if (typeof module[fnName] === 'function') {
            return Promise.objectInvoke(module, fnName).then(nextModule);
        }
        return nextModule();
    }
    return nextModule().callback(done);
}

module.exports = {
    initialize: function () {
        Object.keys(handlerModules).forEach(function (key) {
            apiModules[key] = require(handlerModules[key]);
            handlers[key] = apiModules[key].getHandler();
        });
    },
    checkSchema: function (done) {
        runOnModules(apiModules, 'checkSchema', done);
    },
    shutdown: function () {

    },
    getHandlers: function () {
        return util._extend({}, handlers);
    }
};

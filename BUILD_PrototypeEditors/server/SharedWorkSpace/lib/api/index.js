'use strict';
var util = require('util');

var handlerModules = {
    lock        : './prototypeLock',
    snapshot    : './snapshot',
    public      : './public',
    artifact    : './artifact'
};
var handlers = {};

module.exports = {
    initialize: function () {
        Object.keys(handlerModules).forEach(function (key) {
            handlers[key] = require(handlerModules[key]);
        });
    },
    shutdown: function () {

    },
    getHandlers: function () {
        return util._extend({}, handlers);
    }
};

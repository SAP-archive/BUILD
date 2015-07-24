'use strict';

var util = require('util');

var handlerModules = {
    projects: './project'
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

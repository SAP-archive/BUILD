'use strict';

var handlers = {};
module.exports = {
    initialize: function () {
        var modeAPI = require('./model');

        handlers.models = modeAPI;
    },
    shutdown: function () {

    },
    getHandlers: function () {
        return handlers;
    }
};

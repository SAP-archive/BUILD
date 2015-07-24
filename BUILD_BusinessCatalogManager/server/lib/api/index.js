'use strict';


var handlers = {};
module.exports = {
    initialize: function () {
        var catalogAPI = require('./catalog');

        handlers.catalogs = [ catalogAPI ];
    },
    shutdown: function () {

    },
    getHandlers: function () {
        return handlers;
    }
};

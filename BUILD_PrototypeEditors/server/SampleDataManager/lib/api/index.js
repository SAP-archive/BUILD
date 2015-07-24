'use strict';

var sampleDataHandlers = {};

module.exports = {
    initialize: function () {
        sampleDataHandlers.sampledata = require('./sampleData');
    },
    shutdown: function () {

    },
    getHandlers: function () {
        return sampleDataHandlers;
    }
};

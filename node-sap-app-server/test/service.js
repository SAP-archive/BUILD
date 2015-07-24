'use strict';

global._nodeSapTestShared = global._nodeSapTestShared || {};
global._nodeSapTestShared.service = global._nodeSapTestShared.service || {};
global._nodeSapTestShared.service.load = true;

module.exports = {
    initialize: function (done) {
        global._nodeSapTestShared.service.initialize = global._nodeSapTestShared.service.initialize || 0;
        global._nodeSapTestShared.service.initialize ++;
        done();
    },
    onInitialized: function (done) {
        global._nodeSapTestShared.service.onInitialized = global._nodeSapTestShared.service.onInitialized || 0;
        global._nodeSapTestShared.service.onInitialized ++;
        done();
    },
    checkSchema: function (done) {
        global._nodeSapTestShared.service.checkSchema = global._nodeSapTestShared.service.checkSchema || 0;
        global._nodeSapTestShared.service.checkSchema ++;
        done();
    },
    onSchemaChecked: function (done) {
        global._nodeSapTestShared.service.onSchemaChecked = global._nodeSapTestShared.service.onSchemaChecked || 0;
        global._nodeSapTestShared.service.onSchemaChecked ++;
        done();
    },
    initializeSchema: function (done) {
        global._nodeSapTestShared.service.initializeSchema = global._nodeSapTestShared.service.initializeSchema || 0;
        global._nodeSapTestShared.service.initializeSchema ++;
        done();
    },
    onSchemaInitialized: function (done) {
        global._nodeSapTestShared.service.onSchemaInitialized = global._nodeSapTestShared.service.onSchemaInitialized || 0;
        global._nodeSapTestShared.service.onSchemaInitialized ++;
        done();
    },
    prepareSchemaUpgrade: function (done) {
        global._nodeSapTestShared.service.prepareSchemaUpgrade = global._nodeSapTestShared.service.prepareSchemaUpgrade || 0;
        global._nodeSapTestShared.service.prepareSchemaUpgrade ++;
        done();
    },
    onSchemaUpgraded: function (done) {
        global._nodeSapTestShared.service.onSchemaUpgraded = global._nodeSapTestShared.service.onSchemaUpgraded || 0;
        global._nodeSapTestShared.service.onSchemaUpgraded ++;
        done();
    },
    getHandlers: function () {
        global._nodeSapTestShared.service.getHandlers = global._nodeSapTestShared.service.getHandlers || 0;
        global._nodeSapTestShared.service.getHandlers ++;
        return {};
    }
};

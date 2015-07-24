'use strict';

var registry = require('norman-common-server').registry;
var SampleDataService = require('./sampleData');
var SampleObserver = require('./sampleData/sampleObserver.js');
var constant = require('./common/constant.js');

registry.registerModule(new SampleDataService(), constant.SAMPLE_SERVICE);
registry.registerModule(new SampleObserver(), constant.SAMPLE_OBSERVER);

module.exports = {
    initialize: function (done) {
        var service = registry.getModule(constant.SAMPLE_SERVICE);
        service.initialize(done);
    },
    onInitialized: function () {
        var service = registry.getModule(constant.SAMPLE_SERVICE);
        service.onInitialized();
        service = registry.getModule(constant.SAMPLE_OBSERVER);
        service.onInitialized();
    },
    checkSchema: function (done) {
        var service = registry.getModule(constant.SAMPLE_SERVICE);
        service.checkSchema(done);
    },
    onSchemaChecked: function () {
    },
    initializeSchema: function (done) {
        done();
    },
    onSchemaInitialized: function () {
    },
    prepareSchemaUpgrade: function (done) {
        done();
    },
    upgradeSchema: function (done) {
        done();
    },
    onSchemaUpgraded: function () {
    },
    shutdown: function (done) {
        var service = registry.getModule(constant.SAMPLE_SERVICE);
        registry.unregisterModule(constant.SAMPLE_SERVICE);
        service.shutdown(done);
    }
};

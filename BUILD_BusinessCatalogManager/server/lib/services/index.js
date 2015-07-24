'use strict';

var registry = require('norman-common-server').registry;
var Catalog = require('./catalog');

var BUSINESS_CATALOG_SERVICE = 'BusinessCatalog';

registry.registerModule(new Catalog(), BUSINESS_CATALOG_SERVICE);

module.exports = {
    initialize: function (done) {
        var service = registry.getModule(BUSINESS_CATALOG_SERVICE);
        service.initialize(done);
    },
    onInitialized: function () {
        var service = registry.getModule(BUSINESS_CATALOG_SERVICE);
        service.onInitialized();
    },
    checkSchema: function (done) {
        var service = registry.getModule(BUSINESS_CATALOG_SERVICE);
        service.checkSchema(done);
    },
    onSchemaChecked: function () {
    },
    initializeSchema: function (done) {
        var service = registry.getModule(BUSINESS_CATALOG_SERVICE);
        service.initializeSchema(done);
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
        var service = registry.getModule(BUSINESS_CATALOG_SERVICE);
        registry.unregisterModule(BUSINESS_CATALOG_SERVICE);
        service.shutdown(done);
    }
};

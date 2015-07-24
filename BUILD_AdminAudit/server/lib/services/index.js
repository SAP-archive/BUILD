'use strict';

var registry = require('norman-common-server').registry;

var SERVICE_NAME = 'auditAdmin';

module.exports = {
    initialize: function (done) {
        var AdminAuditService = require('./audit');
        registry.registerModule(new AdminAuditService(), SERVICE_NAME);
        var service = registry.getModule(SERVICE_NAME);
        service.initialize(done);
    },

    onInitialized: function () {
        var service = registry.getModule(SERVICE_NAME);
        service.onInitialized();
    },

    shutdown: function (done) {
        var service = registry.getModule(SERVICE_NAME);
        service.shutdown(done);
    }
};

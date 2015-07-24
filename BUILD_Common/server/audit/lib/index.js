'use strict';
var commonServer = require('norman-common-server');
var AuditService = require('./audit');
var auditServiceInstance;

var serviceLogger = commonServer.logging.createLogger('audit-service');

module.exports = {
    initialize: function (done) {
      serviceLogger.info('Initializing audit service');
        // Initialize service
        auditServiceInstance = new AuditService();

        // Register service
        commonServer.registry.registerModule(auditServiceInstance, 'AuditService');

      // initializes audit
       auditServiceInstance.initialize(done);
    },
    checkSchema: function (done) {
        auditServiceInstance.checkSchema(done);
    },
    shutdown: function (done) {
        serviceLogger.info('Stopping audit service');
        commonServer.registry.unregisterModule('AuditService');
        auditServiceInstance.destroy(done);
    }
};

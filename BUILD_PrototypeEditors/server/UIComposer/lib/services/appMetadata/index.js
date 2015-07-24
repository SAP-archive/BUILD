'use strict';
var appMetadataModel = require('./model');
var appMetadata;
var commonServer = require('norman-common-server');
var serviceLogger = commonServer.logging.createLogger('norman-ui-composer-server:appMetadataService');


function appMetadataService() {

}

module.exports = appMetadataService;

appMetadataService.prototype.initialize = function (done) {
    var model = appMetadataModel.create();
    appMetadata = model.appMetadata;
    if (appMetadata) {
        serviceLogger.info({}, '>> appMetadataService.initialize()');
    }
    done();
};

appMetadataService.prototype.onInitialized = function (done) {
    serviceLogger.info('appMetadataService>>onInitialized>>');
    done();
};

appMetadataService.prototype.checkSchema = function (done) {
    appMetadataModel.createIndexes(done);
};

/**
 * Shutdown service
 * @param done
 */
appMetadataService.prototype.shutdown = function (done) {
    appMetadataModel.destroy(done);
};


/**
 * getAppMetadataModel service
 * @return appMetadataModel
 */
appMetadataService.prototype.getAppMetadaModel = function () {
    if (!appMetadata) {
        serviceLogger.error('appMetadataService >> AppMetadataModel not initialized');
    }
    return appMetadata;
};

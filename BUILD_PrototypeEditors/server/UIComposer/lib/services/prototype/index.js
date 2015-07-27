'use strict';
var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var constants = require('./../../../constants');
var serviceLogger = commonServer.logging.createLogger('norman-ui-composer-server:prototype.service');
var appMetadataModel = require('./../appMetadata/model');
var Promise = require('norman-promise');
var NormanError = commonServer.NormanError;
var tp = commonServer.tp,
    _ = tp.lodash;
var that;

function prototypeService() {

}
module.exports = prototypeService;

prototypeService.prototype.initialize = function (done) {
    appMetadataModel.create();
    done();
};

/**
 * initialize any re-usable services within this module
 *
 * @param done
 */
prototypeService.prototype.onInitialized = function (done) {
    serviceLogger.info('Composer PrototypeService >> onInitialized() called ');
    this.sharedWorkspaceService = registry.getModule('PrototypeService');
   // this.pageFlowService = registry.getModule('PageFlow');
    this.swProcessing = registry.getModule('SwProcessing');
    this.composerCommonService = registry.getModule('composerCommonService');
    this.messages = this.composerCommonService.messages;
    that = this;
    done();
};

/**
 * Shutdown service
 * @param done
 */
prototypeService.prototype.shutdown = function (done) {
    done();
};

/**
 * create a prototype which should be intiaited from DataDriven scenario
 *  -deletes all pages of existing prototype and creates new pages based on template of app selected
 *
 * @param projectId
 * @param numPages
 * @param createdBy
 * @param applicationType
 * @returns {*}
 */
prototypeService.prototype.createDataDrivenPrototype = function (projectId, numPages, createdBy, applicationType, req) {
    var deferred = Promise.defer();
    /*this.pageFlowService.createPrototype(projectId, applicationType)
        .then(function () {
            // TODO shared workspace - build operation: reinitializePrototype, body: applicationType
            // TODO sw retrieves object array, build response similar to createPage
            req.body.reinitializePrototype = {applicationType: applicationType};
            that.swProcessing.processMetadata(projectId, constants.operationReinitializePrototype, req, createdBy)
                .then(function (result) {
                    if (!_.isEmpty(result)) {
                        var metadataArray = result.metadataArray;
                        var appMetadata = _.filter(metadataArray, {type: 'appMetadata'})[0].model;
                        deferred.resolve(appMetadata);
                    }
                    else {
                        serviceLogger.error({}, '>> prototypeService calls sharedWorkspace.processMetadata( with operation reinitializePrototype ) resulted in no response');
                        deferred.reject(new NormanError(this.messages.error.SWE012));
                    }
                });
        })
        .catch(function (error) {
            serviceLogger.error({
                error: error
            }, '>> Composer.PrototypeService.createDataDrivenPrototype()');
            deferred.reject(error);
        });
*/

    return deferred.promise;
};

/**
 * Fetches the ApplicationMetadata of the Prototype of the given ProjectID
 *
 * @param projectId
 * @returns appMetadata MongooseModel
 */
prototypeService.prototype.getPrototype = function (projectId) {
    return this.sharedWorkspaceService.getMetadata(projectId, [constants.appMetadata]);
};


/**
 * updates the ApplicationMetadata of the Prototype of the given ProjectID
 *
 * @param projectId
 * @returns appMetadata MongooseModel
 */
prototypeService.prototype.updatePrototype = function (projectId, req, createdBy) {
    var deferred = Promise.defer();
    var swProcessing = registry.getModule('SwProcessing');
    swProcessing.processMetadata(projectId, constants.operationUpdatePage, req, createdBy).
        then(function (result) {
            var appMetadata = _.filter(result.metadataArray, {type: 'appMetadata'})[0].model;
            deferred.resolve(appMetadata);
        })
        .catch(function (error) {
            serviceLogger.error({params: error}, '>> prototypeBuilderService.generatePrototypePage() failed.');
            deferred.reject(error);
        });

    return deferred.promise;
};



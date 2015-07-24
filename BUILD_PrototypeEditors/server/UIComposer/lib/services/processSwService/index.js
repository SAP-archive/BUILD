'use strict';
var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var constants = require('./../../../constants');
var Promise = require('norman-promise');
var serviceLogger = commonServer.logging.createLogger('norman-ui-composer-server:processSw.service');
var tp = commonServer.tp,
    _ = tp.lodash;

function processSwService() {

}
module.exports = processSwService;

processSwService.prototype.initialize = function (done) {
    done();
};

/**
 * Initialize service
 * @param done
 */
processSwService.prototype.onInitialized = function (done) {
    serviceLogger.info('processSwService>>onInitialized>>');
    this.swRegistry = registry.getModule('SwRegistryService');
    this.swRegistry.registerModule('processSwService');
    this.pageMetadataService = registry.getModule('pageMetadataService');
    done();
};

/**
 * Shutdown service
 * @param done
 */
processSwService.prototype.shutdown = function (done) {
    done();
};

/**
 * Function will trigger the appropriate function in pageMetadataService to process data, then retrieve the response
 * @param projectId
 * @param event
 * @param req - req.body should contain the operation as key, for example: req.body.createPage = { floorplans: req.body.floorplans};
 * @param createdBy
 * @returns formatted response json containing metadataArray and thumbnails
 */
processSwService.prototype.processData = function (projectId, event, req, createdBy) {
    var deferred = Promise.defer();
    var waitForProcessing;
    var that = this;
    _.each(req.body, function (value, key) {
        switch (key) {
            case constants.operationCreatePrototype:
                waitForProcessing = that.pageMetadataService.createApp(projectId, value.numPages);
                break;
            case constants.operationCreatePage:
                waitForProcessing = that.pageMetadataService.createPages(projectId, value.floorplans, false, value.applicationType, value.pageType);
                break;
            case constants.operationUpdatePage:
                waitForProcessing = that.pageMetadataService.processUpdatePage(projectId, value.pages, createdBy.toString(), value.files);
                break;
            case constants.operationDeletePage:
                waitForProcessing = that.pageMetadataService.processDeletePage(projectId, value.pageName);
                break;
            case constants.operationReinitializePrototype:
                waitForProcessing = that.pageMetadataService.reinitializePrototype(projectId, value.applicationType);
                break;
            case constants.operationUpdateCoordinates:
                waitForProcessing = that.pageMetadataService.processUpdateCoordinates(projectId, value.coordinatesArray);
                break;
            case constants.operationUpdatePrototype:
                waitForProcessing = that.pageMetadataService.updateDisplayNames(projectId, value.displayNames);
                break;
            case constants.operationModelChange:
                var deletedEntityIds = _.chain(value.operations).filter({type:'entity', operation:'delete'}).pluck('previous').pluck('_id').value();
                var deletedProperties = _.chain(value.operations)
                    .filter(function (operation) {
                        // Get only deleted properties and navigation
                        return operation.operation === 'delete' && (operation.type === 'property' || operation.type === 'navigation');
                    })
                    .filter(function (operation) {
                        // That are not in a deleted entity
                        return !_.contains(deletedEntityIds, operation.entity._id);
                    })
                    .map(function (operation) {
                        // Return the property id and the entity id
                        return {propertyId: operation.previous._id, entityId: operation.entity._id};
                    })
                    .value();
                if (!_.isEmpty(deletedEntityIds) || !_.isEmpty(deletedProperties)) {
                    waitForProcessing = that.pageMetadataService.deleteEntitiesAndProperties(projectId, deletedEntityIds, deletedProperties);
                }
                break;
        }
    });
    if (waitForProcessing) {
        waitForProcessing.then(function (response) {
            var formattedResp = {};
            formattedResp.metadataArray = response.operations;
            formattedResp.files = response.thumbnails;
            deferred.resolve(formattedResp);
        }).catch(function (error) {
            serviceLogger.error({
                params: error
            }, '>> createPage -> doMetadata failed');
            deferred.reject(error);
        });
    }
    else {
        deferred.resolve({files: [], operations: []});
    }
    return deferred.promise;
};


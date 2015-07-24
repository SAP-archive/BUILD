/**
 * Created by i055023 on 4/21/15.
 */
'use strict';

var commonServer = require('norman-common-server'),
    commonMessage = require('./../common/common.message.js'),
    NormanError = commonServer.NormanError,
    registry = commonServer.registry,
    tp = commonServer.tp,
    _ = tp.lodash,
    Promise = require('norman-promise'),
    swRegistry;

var serviceLogger = commonServer.logging.createLogger('swContentProcessing-service');

function SwProcessing() {

}

module.exports = SwProcessing;

SwProcessing.prototype.initialize = function (done) {
    done();
};

/**
 * Shutdown service
 * @param done
 */
SwProcessing.prototype.shutdown = function (done) {
    done();
};

/**
 * onInitialized service
 * @param done
 */
SwProcessing.prototype.onInitialized = function (done) {
    done();
};

var logError = function (code, err) {
    var error;

    if (!err) {
        error = new NormanError(commonMessage.swProcessing.error[code], code);
    }
    else {
        error = new NormanError(commonMessage.swProcessing.error[code] + err, code);
    }
    serviceLogger.error(error);
    return error;
};

/**
 * Private function to processMetaData
 *
 * @param projectId
 * @param event
 * @param req
 * @param user
 * @returns {deferred.promise|*}
 */
var processMData = function (projectId, event, req, user) {
    var deferred = Promise.defer(),
        preProcessPromise = [], postProcessPromise = [],
        preModules, postModules, prototype;
    prototype = registry.getModule('PrototypeService');
    swRegistry = registry.getModule('SwRegistryService');
    preModules = swRegistry.getModules('pre');
    postModules = swRegistry.getModules('post');
    _.forEach(preModules, function (module) {
        preProcessPromise.push(module.processData(projectId, event, req, user));
    });
    Promise.all(preProcessPromise).then(function (responseArray) {
        var metadataArray = _.flatten(_.pluck(responseArray, 'metadataArray'));
        var filteredMetadataArray = _.filter(metadataArray, function (metadata) {
            if (!_.isEmpty(metadata)) {
                return metadata;
            }
        });
        var files = _.pluck(responseArray, 'files');
        var mergedfiles = {};
        _.forEach(files, function (file) {
            _.merge(mergedfiles, file);
        });
        prototype.processPrototype(projectId, filteredMetadataArray, user, mergedfiles).then(function (response) {
            response.metadataArray = metadataArray;
            if (!_.isEmpty(postModules)) {
                _.forEach(postModules, function (module) {
                    postProcessPromise.push(module.postProcessData(response));
                });
                Promise.all(postProcessPromise).then(function () {
                    deferred.resolve(response);
                }).catch(function (error) {
                    // case to handle invalidation of prototype version : //something went wrong during postProcessing of groupedOperation.save()
                    prototype.invalidatePrototypeVersion(projectId)
                        .then(function (resp) {
                            if (resp && (resp.status === 'OK')) {
                                serviceLogger.info({
                                    projectId: projectId
                                }, '>> prototype.invalidatePrototypeVersion was a success !');
                                // return a promise - it has to be a reject!!
                                deferred.reject(logError('SWPRE002', error));
                            }
                            else {
                                // return a promise - it has to be a reject!!
                                deferred.reject(logError('SWPRE003', error));
                            }
                        })
                        .catch(function (err) {
                            error.innerError = err;
                            // exception while invalidating the version
                            deferred.reject(logError('SWPRE003', error));
                        });
                });
            }
            else {
                deferred.resolve(response);
            }
        }, function (err) {
            deferred.reject(logError('SWPRE005', err));
        });

    });
    return deferred.promise;
};
/**
 * processMetadata function is the entry point in sharedWorkspace which ensures transactional save
 *
 * @param projectId
 * @param event
 * @param req
 * @param user
 * @returns {deferred.promise|*}
 */
SwProcessing.prototype.processMetadata = function (projectId, event, req, user) {
    /**
     1) all higherlevel modules(eg:UIComposer,DataModeler,etc) calls this method "processMetadata"
     2) we callback all registered modules an interface method "processData" in sharedWorksapce registry
     3) registeredModules does the processing and returns the response which contains metadataArray and files
     4) save the metadataArray and files as one transaction
     5) call registeredModules postProcessing method after save successful
     6) if postProcessing raises an exception/error, mark last saved version of prototype as inconsistent
     7) if postProcessing is a success, return to original caller
     */

    var deferred = Promise.defer(),
        prototype = registry.getModule('PrototypeService');
    if (!req) {
        deferred.reject(logError('SWPRE001'));
    } else {
        var bSessionId = req.buildSessionId || req.context.session.id;
        prototype.canProcessProject(projectId, bSessionId).then(function (allowProcessing) {
            if (allowProcessing) {
                processMData(projectId, event, req, user).then(function (response) {
                    deferred.resolve(response);
                }, function (err) {
                    deferred.reject(err);
                });
            }
            else {
                deferred.reject(logError('SWPRE004'));
            }
        }).catch(function (error) {
            deferred.reject(logError('SWPRE001', error));
        }).finally(function () {
            if (!!req.body && JSON.parse(req.body.deleteLock)) {
                prototype.deleteLock(projectId, bSessionId);
            }
        });
    }

    return deferred.promise;
};





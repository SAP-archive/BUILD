'use strict';

var commonServer = require('norman-common-server');
var serviceLogger = commonServer.logging.createLogger('norman-ui-composer-server:prototype.controller');
var registry = commonServer.registry;
var prototype = registry.getModule('composerPrototypeService');
var commonComposerService = registry.getModule('composerCommonService');
var NormanError = commonServer.NormanError;
var messages = commonComposerService.messages;
var tp = commonServer.tp,
    _ = tp.lodash;

/**
 * createPrototype - creates a prototype by deleting the contents of existing prototype and creating contents based
 *                   on DataModeler requirements
 *
 * @param req
 * @param res
 * @returns HTTP response
 */
module.exports.createPrototype = function (req, res) {
    var projectId = req.originalUrl.split('/')[3];
    var applicationType = req.body.applicationType;
    var createdBy = req.user._id.toString();

    serviceLogger.info({
        applicationType: applicationType,
        projectId: projectId,
        createdBy: createdBy
    }, 'Prototype REST API >> createPrototype()');

    // validate input!!
    if (_.isEmpty(projectId) || _.isEmpty(applicationType) || _.isEmpty(createdBy)) {
        return commonComposerService.sendError(res, 500, new NormanError(messages.error.SWE010));
    }

    prototype.createDataDrivenPrototype(projectId, 0, createdBy, applicationType, req)
        .then(
        function (data) {
            commonComposerService.sendResponse(res, 200, data);
        }, function (error) {
            serviceLogger.error({
                params: error
            }, '>> prototypeService.createDataDrivenPrototype()');
            commonComposerService.sendError(res, 500, error);
        });
};


/**
 * getPrototype - returns the appMetadata of the Prototype
 *
 * @param req
 * @param res
 * @returns HTTP response
 */
module.exports.getPrototype = function (req, res) {
    var projectId = req.originalUrl.split('/')[3];

    serviceLogger.info({
        projectId: projectId
    }, '>> prototypeService.getPrototype()');

    // validate input!!
    if (_.isEmpty(projectId)) {
        return commonComposerService.sendError(res, new NormanError(messages.error.SWE011));
    }

    prototype.getPrototype(projectId)
        .then(function (data) {
            commonComposerService.sendResponse(res, 200, data.appMetadata);
        }, function (error) {
            serviceLogger.error({
                error: error.message
            }, '>> prototypeService.getPrototype()');
            commonComposerService.sendError(res, 500, error);
        });
};

/**
 * updatePrototype - update the Prototype data of a given Project
 *
 * @param {http.IncomingMessage}  req - http request
 * @param {http.ServerResponse}   res - http response
 * @returns {http.ServerResponse} res - http response
 */
module.exports.updatePrototype = function (req, res) {
    var projectId = req.originalUrl.split('/')[3];

    serviceLogger.info({
        projectId: projectId
    }, '>> prototypeService.updatePrototype()');

    // validate input!!
    if (_.isEmpty(projectId)) {
        return commonComposerService.sendError(res, new NormanError(messages.error.SWE011));
    }

    serviceLogger.info({
        params: projectId
    }, '>> updateCoordinates()');

    var userId = req.user._id.toString();
    req.body.updatePrototype = {displayNames: req.body.displayNames};
    prototype.updatePrototype(projectId, req, userId)
        .then(function (data) {
            commonComposerService.sendResponse(res, 200, data);
        }, function (error) {
            serviceLogger.error({
                error: error.message
            }, '>> prototypeService.updatePrototype()');
            commonComposerService.sendError(res, 500, error);
        });
};

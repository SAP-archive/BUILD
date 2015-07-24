'use strict';

var commonServer = require('norman-common-server');
var serviceLogger = commonServer.logging.createLogger('composer-common-service');
var messages = require('./message');
var tp = commonServer.tp,
    _ = tp.lodash;

function ComposerCommonService() {
}

module.exports = ComposerCommonService;


ComposerCommonService.prototype.initialize = function (done) {
    serviceLogger.info('>> initialize()');
    done();
};

ComposerCommonService.prototype.shutdown = function (done) {
    serviceLogger.info('>> shutdown()');
    done();
};

ComposerCommonService.prototype.onInitialized = function (done) {
    serviceLogger.info('>> onInitialized()');
    this.messages = messages;
    done();
};

/**
 * common util method to dispatch response
 *
 *
 * @param res
 * @param statusCode
 * @param jsonBody
 */
ComposerCommonService.prototype.sendResponse = function (res, statusCode, jsonBody) {
    if (jsonBody) {
        res.status(statusCode || 200).json(jsonBody);
    }
    else {
        res.status(statusCode || 204).json();
    }
};

/**
 * common util method to dispatch errors !
 *
 * @param res
 * @param statusCode
 * @param err
 */
ComposerCommonService.prototype.sendError = function (res, statusCode, err) {

    if (err.stack) {
        serviceLogger.error(err.stack);
    }

    if (err instanceof Error) {
        if (_.isEmpty(statusCode)) {
            statusCode = 400;
        }
        this.sendResponse(res, statusCode, {
            error: err.message
        });
    }
    else {
        if (_.isEmpty(statusCode)) {
            statusCode = 500;
        }
        this.sendResponse(res, statusCode, err);
    }
};

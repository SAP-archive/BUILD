'use strict';

var commonServer = require('norman-common-server');
var serviceLogger = commonServer.logging.createLogger('norman-shared-workspace-server:prototypeLock.controller');

var registry = commonServer.registry;
var prototype = registry.getModule('PrototypeService');



module.exports.createPrototypeLock = function (req, res) {
    serviceLogger.info({params: req.params}, '>> createPrototypeLock()');

    prototype.createLock(_getProjectId(req), _getSessionId(req), _getUserId(req)).then(
        function (data) {
            res.status(200).json(data);
        }, function (error) {
            serviceLogger.error({params: error}, '>> PrototypeService.createLock()');
            res.status(500).json(error);

        });

};

module.exports.getPrototypeLock = function (req, res) {
    serviceLogger.info({params: req.params}, '>> getPrototypeLock()');

    prototype.checkLock(_getProjectId(req), _getSessionId(req)).then(
        function (result) {
                res.status(200).json(result);
        }, function (error) {
            serviceLogger.error({params: error}, '>> PrototypeService.checkLock()');
            res.status(500).json(error);

        });

};

module.exports.deletePrototypeLock = function (req, res) {
    serviceLogger.info({params: req.params}, '>> deletePrototypeLock()');

    prototype.deleteLock(_getProjectId(req), _getSessionId(req)).then(
        function (data) {
            res.status(200).json(data);
        }, function (error) {
            serviceLogger.error({params: error}, '>> PrototypeService.deleteLock()');
            res.status(500).json(error);

        });

};

function _getSessionId(req) {
    return (req && req.context && req.context.session) ? req.context.session.id : undefined;
}

function _getProjectId(req) {
    return (req && req.originalUrl) ? req.originalUrl.split('/')[3] : undefined;
}

function _getUserId(req) {
    return (req && req.user) ? req.user._id.toString() : undefined;
}

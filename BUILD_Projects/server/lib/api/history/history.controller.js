'use strict';

var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var historyService = registry.getModule('HistoryService');
var commonProjectService = registry.getModule('ProjectCommonService');

var serviceLogger = commonServer.logging.createLogger('history-ctrl');

module.exports.getHistory = function (req, res) {

    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> getHistory()');

    historyService.getHistory(req.params.projectId)
        .then(function (history) {
            serviceLogger.info('<< getHistory(), returning history');
            return commonProjectService.sendResponse(res, 200, history);
        }).catch(function (err) {
            serviceLogger.info('<< getHistory(), returning error');
            return commonProjectService.sendError(res, err);
        });
};

module.exports.logHistory = function (req, res) {

    serviceLogger.info({
        params: req.params,
        body: req.body,
        query: req.query,
        user: req.user._id
    }, '>> logHistory()');

    if (!req.body || !req.body.hasOwnProperty('project_id')) {
        serviceLogger.info('<< logHistory(), returning error, missing required fields');
        return commonProjectService.sendResponse(res, 400, {error: 'Missing required field(s)'});
    }

    historyService.logHistory(req.body)
        .then(function (history) {
            if (!history) {
                serviceLogger.info('<< logHistory(), returning error');
                return commonProjectService.sendResponse(res, 404, null);
            }
            serviceLogger.info('<< logHistory(), returning saved history');
            return commonProjectService.sendResponse(res, 201, history);
        })
        .catch(function (err) {
            serviceLogger.info('<< logHistory(), returning error');
            return commonProjectService.sendError(res, err);
        });
};

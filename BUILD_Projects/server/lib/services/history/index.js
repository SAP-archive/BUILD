'use strict';

var Promise = require('norman-promise');
var commonServer = require('norman-common-server');
var serviceLogger = commonServer.logging.createLogger('history-service');

var historyModel = require('./history.model');
var History;

function HistoryService() {
}

module.exports = HistoryService;

HistoryService.prototype.initialize = function (done) {
    History = historyModel.create();
    done();
};

HistoryService.prototype.checkSchema = function (done) {
    historyModel.createIndexes(done);
};

HistoryService.prototype.shutdown = function (done) {
    historyModel.destroy(done);
};

HistoryService.prototype.onInitialized = function (done) {
    serviceLogger.info('>> onInitialized()');
    done();
};

HistoryService.prototype.getModel = function () {
    if (!History) {
        History = historyModel.create();
    }

    return History;
};

HistoryService.prototype.logHistory = function (event) {
    serviceLogger.info({
        event: event
    }, '>> logHistory');

    var deferred = Promise.defer();

    event._id = commonServer.utils.shardkey();

    History.create(event, function (err, history) {
        if (err) {
            return deferred.reject(err);
        }
        return deferred.resolve(history);
    });

    return deferred.promise;
};

HistoryService.prototype.getHistory = function (projectId) {

    serviceLogger.info({
        projectId: projectId
    }, '>> getHistory');

    var deferred = Promise.defer();

    History.find({
        project_id: projectId
    })
        .lean().exec(function (err, history) {
            if (err) {
                return deferred.reject(err);
            }
            return deferred.resolve(history);
        });

    return deferred.promise;
};

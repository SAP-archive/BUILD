'use strict';

var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var service = registry.getModule('SampleDataService');

function handleSuccess(res, jsonBody) {
    if (jsonBody) {
        return res.status(200).json(jsonBody);
    }
    else {
        return res.status(204);
    }
}

function _getSessionId(req) {
    return (!!req && !!req.context && !!req.context.session) ? req.context.session.id : undefined;
}
exports.handleError = function (res, err) {
    return res.status(500).send(err);
};

exports.getSampleData = function (req, res) {
    // FIXME
    // This method is no more required
    service.getSDfromProjId(req.params.id, [], req.context).then(
        function (result) {
            return handleSuccess(res, result);
        },
        function (err) {
            exports.handleError(res, err);
        }
    );
};

exports.getEntityData = function (req, res) {
    service.getEntityData(req.params.id, req.params.entityName).then(
        function (result) {
            return handleSuccess(res, result);
        },
        function (err) {
            exports.handleError(res, err);
        }
    );
};

exports.getEntityNavDataForProj = function (req, res) {
    service.getEntityNavDataForProj(req.params.projId, req.params.entityName)
        .then(
            function (result) {
                return handleSuccess(res, result);
            },
            function (err) {
                exports.handleError(res, err);
            }
        );
};

exports.updateSampleData = function (req, res) {
    var data = req.body;
    var sampleDataUpdated = data.sampleData;
    var dataModelJson = data.dataModelJson;
    var user = req.user;
    service.updateEntitiesfromProjId(dataModelJson, sampleDataUpdated, true, user, _getSessionId(req))
        .then(function (result) {
            return handleSuccess(res, result);
        }).catch(function (err) {
            exports.handleError(res, err);
        });
};

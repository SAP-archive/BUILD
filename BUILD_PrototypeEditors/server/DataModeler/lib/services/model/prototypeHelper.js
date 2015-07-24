'use strict';

var commonServer = require('norman-common-server');
var NormanError = commonServer.NormanError;
var q = require('q');

var DATA_MODEL_METADATA = 'dataModelMetadata';
var SAMPLE_METADATA = 'sampleMetadata';
var UPDATE_ACTION = 'UPDATE';

var constant = require('../common/constant.js');

function _getModel(context, metadata) {
    var model = metadata.dataModelMetadata[metadata.dataModelMetadata.length - 1];
    if (!model) {
        throw new NormanError('Model not found! ProjectID: ' + context.projectId, 404);
    }

    context.logger.debug('Get model - ' + context.projectId + ' - model: ' + JSON.stringify(model));
    context.model = model;

    return context;
}

exports.getModel = function (context) {
    return context.prototypeService.getMetadata(context.projectId, [DATA_MODEL_METADATA])
        .then(function (metadata) {
            return _getModel(context, metadata);
        });
};

function _getSampleData(context, metadata) {
    var sampleData = metadata.sampleMetadata[metadata.sampleMetadata.length - 1];
    if (!sampleData) {
        throw new NormanError('Sample Metadata not found! ProjectID: ' + context.projectId, 404);
    }

    context.logger.debug('Get sample data - ' + context.projectId + ' - model: ' + JSON.stringify(sampleData));
    context.sampleData = sampleData;

    return context;
}

exports.getSampleData = function (context) {
    return context.prototypeService.getMetadata(context.projectId, [SAMPLE_METADATA])
        .then(function (metadata) {
            return _getSampleData(context, metadata);
        });
};

exports.getModelAndSampleData = function (context) {
    return context.prototypeService.getMetadata(context.projectId, [DATA_MODEL_METADATA, SAMPLE_METADATA])
        .then(function (metadata) {
            _getModel(context, metadata);

            return _getSampleData(context, metadata);
        });
};

exports.updateModelMetadata = function (context) {
    var metadata = {type: DATA_MODEL_METADATA, OP: UPDATE_ACTION, oldId: context.model._id},
        Model = context.mongooseModel;

    context.model._id = commonServer.utils.shardkey();
    context.model.version += 1;
    metadata.model = new Model(context.model);

    context.metadataArray = context.metadataArray || [];
    context.metadataArray.push(metadata);

    context.logger.debug(metadata, '>>save model - ' + context.projectId);

    return context;
};

function parceData(context) {
    var data = context.sampleData, entities = {};

    context.model.entities.forEach(function (entity) {
        entities[entity.name] = entity._id;
    });

    data.entities.forEach(function (entity) {
        entity.entityId = entities[entity.entityName];
    });

    return data;
}

exports.updateSampleMetadata = function (context) {
    var metadata = {type: SAMPLE_METADATA, OP: UPDATE_ACTION, oldId: context.sampleData._id},
        Model = context.sampleDataModel;

    context.sampleData._id = commonServer.utils.shardkey();
    context.sampleData.version += 1;
    metadata.model = new Model(parceData(context));

    context.metadataArray = context.metadataArray || [];
    context.metadataArray.push(metadata);

    context.logger.debug(metadata, '>>save sample - ' + context.projectId);

    return context;
};

exports.doMetadata = function (context) {
    var oResult;

    if (context.metadataArray) {
        context.eventData.metadataArray = context.metadataArray;

        var req = {
            body: {
                ModelChange: context.eventData
            },
            buildSessionId: context.buildSessionId
        };

        oResult = context.sharedWorkspaceProcessing.processMetadata(context.projectId, constant.MODEL_CHANGE, req, context.user)
            .then(function () {
                context.logger.debug('doMetadata - save : ' + context.projectId + ' - data: ' + JSON.stringify(context.metadataArray));
                return context;
            })
            .then(exports.getModelAndSampleData);
    }
    else {
        oResult = q(context);
    }

    return oResult;
};

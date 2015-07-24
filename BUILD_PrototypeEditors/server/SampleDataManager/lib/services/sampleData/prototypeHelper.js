'use strict';

var SAMPLE_METADATA = 'sampleMetadata';
var UPDATE_ACTION = 'UPDATE';
var CREATE_ACTION = 'CREATE';

var Promise = require('norman-promise');
var commonServer = require('norman-common-server');
var ServerError = commonServer.NormanError;
var mongooseModel = require('./model');
var constant = require('../common/constant.js');

var prototypeService = null;
var sharedWorkspaceProcessing = null;

exports.get = function (projectId) {
    return prototypeService.getMetadata(projectId, [SAMPLE_METADATA])
        .then(function (metadata) {
            // var sampleData = metadata.sampleMetadata[metadata.sampleMetadata.length - 1];
            var sampleData = metadata.sampleMetadata[0];
            if (!sampleData) {
                throw new ServerError('Sample Metadata not found! ProjectID: ' + projectId, 404);
            }
            return sampleData;
        });
};

exports.update = function (sampleData, user, apiCall, buildSessionId) {
    var Model = mongooseModel.getModel().SampleData;
    var metaData = {
        type: SAMPLE_METADATA,
        OP: UPDATE_ACTION,
        oldId: sampleData._id
    };

    sampleData._id = commonServer.utils.shardkey();
    sampleData.version++;
    metaData.model = new Model(sampleData);
    var metadataArray = [metaData];
    if (apiCall) {
        return exports.processMetadata(sampleData.projectId, metadataArray, user, buildSessionId);
    }
    else {
        return Promise.resolve(metadataArray);
    }
};

exports.create = function (projectId, sampleData, user) {
    var metadataArray = [{
        model: sampleData,
        type: SAMPLE_METADATA,
        OP: CREATE_ACTION
    }];
    return prototypeService.createPrototype(projectId, metadataArray, user)
        .then(exports.get);
};

exports.initialize = function () {
    var model = mongooseModel.getModel();
    return model.SampleData;
};

exports.checkSchema = function (done) {
    mongooseModel.createIndexes(done);
};

exports.onInitialize = function () {
    prototypeService = commonServer.registry.getModule('PrototypeService');
    sharedWorkspaceProcessing = commonServer.registry.getModule('SwProcessing');
};

exports.processMetadata = function (projectId, metadataArray, user, buildSessionId) {
    if (!projectId || !metadataArray) {
        Promise.reject('doMetadata: parameters mandatory');
    }
    var sampleData = metadataArray[0].model;
    sampleData.metadataArray = metadataArray;
    var req = {
        body: {
            SampleChange: sampleData
        },
        buildSessionId: buildSessionId
    };

    return sharedWorkspaceProcessing.processMetadata(projectId, constant.SAMPLE_CHANGE, req, user);
};

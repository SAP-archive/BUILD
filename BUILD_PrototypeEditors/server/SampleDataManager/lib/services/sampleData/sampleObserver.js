'use strict';

var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var Promise = require('norman-promise');
var logger = commonServer.logging.createLogger('SampleObserver');
var constant = require('../common/constant.js');
var sampleModel = require('./model.js');
var dataAdapter = require('./dataAdapter');

function SampleObserver() {

}

module.exports = SampleObserver;

SampleObserver.prototype.onInitialized = function () {
    if (!this.sampleService) {
        this.sampleService = registry.getModule(constant.SAMPLE_SERVICE);
    }
    try {
        var swRegistry = registry.getModule('SwRegistryService');
        swRegistry.registerModule(constant.SAMPLE_OBSERVER, 'pre');
    }
    catch (error) {
        logger.error(error);
    }
};

SampleObserver.prototype.processData = function (projectId, event, req, createdBy) {
    var that = this;
    return new Promise(function (resolve, reject) {
        var hasAction = false;
        if (req) {
            if (typeof req.body.createPrototype === 'object') {
                hasAction = true;
                that.createPrototype(resolve, reject, projectId);
            }
            else if (typeof req.body[constant.SAMPLE_CHANGE] === 'object') {
                hasAction = true;
                that.sampleChange(resolve, reject, projectId, req);
            }
            else if (typeof req.body[constant.MODEL_CHANGE] === 'object') {
                if (req.body[constant.MODEL_CHANGE].excel === false) {
                    hasAction = true;
                    that.modelChange(resolve, reject, projectId, req, createdBy);
                }
            }
        }
        if (!hasAction) {
            resolve({files: [], metadataArray: []});
        }
    });
};

SampleObserver.prototype.createPrototype = function (resolve, reject, projectId) {
    var result = {files: [], metadataArray: []}, SampleMetadata = sampleModel.getModel().SampleData;
    result.metadataArray.push({
        model: new SampleMetadata({projectId: projectId, version: 1}),
        type: constant.SAMPLE_MODEL_NAME,
        OP: 'CREATE'
    });
    resolve(result);
};

SampleObserver.prototype.sampleChange = function (resolve, reject, projectId, req) {
    var result = {files: [], metadataArray: req.body[constant.SAMPLE_CHANGE].metadataArray};
    resolve(result);
};


SampleObserver.prototype.modelChange = function (resolve, reject, projectId, req, createdBy) {
    var eventData = req.body[constant.MODEL_CHANGE];
    dataAdapter.adaptSampleDataForModelChange(eventData, createdBy).then(function (metadataArray) {
        var result = {files: [], metadataArray: metadataArray};
        resolve(result);
    });
};

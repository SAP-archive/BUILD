'use strict';

var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var Promise = require('norman-promise');
var logger = commonServer.logging.createLogger('ModelObserver');
var constant = require('../common/constant.js');
var modelModel = require('./model.js');

function ModelObserver() {

}

module.exports = ModelObserver;

ModelObserver.prototype.onInitialized = function () {
    if (!this.modelService) {
        this.modelService = registry.getModule(constant.MODEL_SERVICE);
    }

    try {
        var swRegistry = registry.getModule('SwRegistryService');
        swRegistry.registerModule(constant.MODEL_OBSERVER, 'pre');
    }
    catch (error) {
        logger.error(error);
    }

};

ModelObserver.prototype.processData = function (projectId, event, req /* , createdBy */) {
    var that = this;
    return new Promise(function (resolve, reject) {
        var hasAction = false;

        //logger.debug({projectId: projectId, req: req.body, createdBy: createdBy}, 'processData - begin');

        if (req) {
            if (typeof req.body.createPrototype === 'object') {
                hasAction = true;
                that.createPrototype(resolve, reject, projectId);
            }
            else if (typeof req.body[constant.MODEL_CHANGE] === 'object') {
                hasAction = true;
                that.modelChange(resolve, reject, projectId, req);
            }
        }

        if (!hasAction) {
            resolve({files: [], metadataArray: []});
        }
    });
};

ModelObserver.prototype.createPrototype = function (resolve, reject, projectId) {
    var result = {files: [], metadataArray: []}, DataModelMetadata = modelModel.getModel();

    result.metadataArray.push({
        model: new DataModelMetadata({projectId: projectId, version: 1}),
        type: constant.MODEL_NAME,
        OP: 'CREATE'
    });

    //logger.debug({result: result}, 'create prototype');

    resolve(result);
};

ModelObserver.prototype.modelChange = function (resolve, reject, projectId, req) {
    var result = {files: [], metadataArray: req.body[constant.MODEL_CHANGE].metadataArray};


    //logger.debug({result: result}, 'change model');

    resolve(result);
};

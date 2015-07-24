'use strict';
var lodash = require('norman-server-tp').lodash;
var registry = require('norman-common-server').registry;
var sampleDataManager = require('./dataManager');
var serviceLogger = require('norman-common-server').logging.createLogger('sampleDataService');

function triggerUpdate(sampleData, user) {
    if (sampleData._id) {
        return sampleDataManager.updateSDNoValidation(sampleData, user);
    }
}

function SampleDataMutator(initialSampleData, eventData) {
    var dataModeler = registry.getModule('Model');
    var dmOPR = dataModeler.OPERATION;
    var dmTYPE = dataModeler.TYPE;

    this.sampleData = initialSampleData;
    this.operations = eventData.operations;
    this.projectId = eventData.projectId;

    var sdModifier = this.sdModifier = {};

    // ENTITY
    sdModifier[dmTYPE.ENTITY] = {};
    sdModifier[dmTYPE.ENTITY][dmOPR.CREATE] = this.addEntityData;
    sdModifier[dmTYPE.ENTITY][dmOPR.UPDATE] = this.updateEntityData;
    sdModifier[dmTYPE.ENTITY][dmOPR.DELETE] = this.removeEntityData;
    // PROPERTY
    sdModifier[dmTYPE.PROPERTY] = {};
    sdModifier[dmTYPE.PROPERTY][dmOPR.CREATE] = this.addPropertyData;
    sdModifier[dmTYPE.PROPERTY][dmOPR.UPDATE] = this.updatePropertyData;
    sdModifier[dmTYPE.PROPERTY][dmOPR.DELETE] = this.removePropertyData;
}

function _isCalcProp(calc) {
    if (!(calc && calc.inputProperties)) {
        return false; // Not calculated property
    }
    return calc.inputProperties.length !== 0;
}

SampleDataMutator.prototype.processOperations = function () {
    for (var i = 0; i < this.operations.length; i++) {
        var metaType = this.operations[i].type;
        var operationType = this.operations[i].operation;
        if (this.sdModifier[metaType] && this.sdModifier[metaType][operationType]) {
            var operation = this.operations[i];
            this.sdModifier[metaType][operationType].call(this, operation);
        }
    }
    return this.sampleData;
};


SampleDataMutator.prototype.createEmptySampleData = function () {
    this.sampleData = {
        projectId: this.projectId,
        name: this.projectId,
        entities: []
    };
};

SampleDataMutator.prototype.addEntityData = function (operation) {
    var current = operation.current;
    var existingEntity = lodash.find(this.sampleData.entities, function (item) {
        return item.entityName.toLowerCase() === current.name.toLowerCase();
    });
    if (existingEntity) {
        // do not allow duplicate entityName
        return;
    }

    var entity = {
        entityName: current.name,
        entityId: current._id,
        properties: []
    };
    this.sampleData.entities.push(entity);
};

SampleDataMutator.prototype.updateEntityData = function (operation) {
    var current = operation.current;
    var entityId = current._id;
    var sdEntity = lodash.find(this.sampleData.entities, function (entity) {
        return entity.entityId === entityId;
    });
    sdEntity.entityName = current.name;
};

SampleDataMutator.prototype.removeEntityData = function (operation) {
    var entityId = operation.previous._id;
    lodash.remove(this.sampleData.entities, function (entity) {
        return entity.entityId === entityId;
    });
};

SampleDataMutator.prototype.addPropertyData = function (operation) {
    var current = operation.current;
    var isCalc = _isCalcProp(current.calculated);
    if (isCalc) {
        return;
    }
    var entityId = operation.entity._id;
    var sdEntity = lodash.find(this.sampleData.entities, function (entity) {
        return entity.entityId === entityId;
    });
    sdEntity.properties.forEach(function (property) {
        if (property) {
            // TODO: REPLACE WITH UNDEFINED
            property[current.name] = null;
        }
    });
};

SampleDataMutator.prototype.updatePropertyData = function (operation) {
    var entityId = operation.entity._id;
    var sdEntity = lodash.find(this.sampleData.entities, function (entity) {
        return entity.entityId === entityId;
    });
    var isCalc = _isCalcProp(operation.current.calculated);
    if (isCalc) {
        var isPrevCalc = _isCalcProp(operation.previous.calculated);
        if (!isPrevCalc) {
            // Drop the property
            this.removePropertyData(operation, this);
        }
        else {
            // Previously also calculated, so ignore
            return;
        }
    }
    sdEntity.properties.forEach(function (property) {
        var curName = operation.current.name;
        var oldName = operation.previous.name;
        var oldValue = property[oldName];
        delete property[oldName];
        property[curName] = sampleDataManager.checkAndConvertType(oldValue, operation.current.propertyType);
    });
};

SampleDataMutator.prototype.removePropertyData = function (operation) {
    var isCalc = _isCalcProp(operation.previous.calculated);
    if (isCalc) {
        return;
    }
    var entityId = operation.entity._id;
    var sdEntity = lodash.find(this.sampleData.entities, function (entity) {
        return entity.entityId === entityId;
    });
    sdEntity.properties.forEach(function (property) {
        delete property[operation.previous.name];
    });
};

exports.onInitialized = function () {
};

exports.adaptSampleDataForModelChange = function (eventData, user) {
    var projectId = eventData.projectId;
    return sampleDataManager.getSDfromProjIdNoWait(projectId)
        .then(function (sampleData) {
            var sdMutatorInstance = new SampleDataMutator(sampleData, eventData);
            sdMutatorInstance.processOperations();
            return triggerUpdate(sdMutatorInstance.sampleData, user);
        })
        .catch(function (err) {
            serviceLogger.error(err);
            throw err;
        });
};

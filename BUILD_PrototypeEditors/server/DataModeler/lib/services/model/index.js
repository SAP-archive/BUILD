'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');

var commonServer = require('norman-common-server');
var logger = commonServer.logging.createLogger('model-service');

commonServer.logging.manager.on('configure', function () {
    logger = commonServer.logging.createLogger('model-service');
});

var modelModel = require('./model');
var mongoose = commonServer.db.mongoose;


var q = require('q');
var modelHelper = require('./modelHelper.js');
var entityHelper = require('./entityHelper.js');
var propertyHelper = require('./propertyHelper.js');
var navigationPropertyHelper = require('./navigationPropertyHelper.js');
var registry = commonServer.registry;
var exportModel = require('./exportModel.js');
var xlHelper = require('./xlHepler.js');
var odataHelper = require('./odataHelper.js');
var dataHelper = require('./dataHelper.js');
var businessCatalogHelper = require('./businessCatalogHelper.js');
var eventHelper = require('./eventHelper.js');
var prototypeHelper = require('./prototypeHelper.js');
var groupHelper = require('./groupHelper.js');
var assetHelper = require('./assetHelper.js');
var dagreHelper = require('./dagreHelper.js');

function handleError(err) {
    if (err) {
        logger.error(err);
    }

    throw err;
}

function removeMongoseFields(model) {
    var result = model.toJSON();
    delete result._id;
    delete result.__v;
    return result;
}

function ModelService(model, businessCatalog, prototypeService, sharedWorkspaceProcessing) {
    if (!(this instanceof ModelService)) {
        return new ModelService(model, businessCatalog, prototypeService, sharedWorkspaceProcessing);
    }

    EventEmitter.call(this);
    this.model = model;
    this.businessCatalog = businessCatalog;
    this.prototypeService = prototypeService;
    this.sharedWorkspaceProcessing = sharedWorkspaceProcessing;
}

util.inherits(ModelService, EventEmitter);
module.exports = ModelService;

ModelService.prototype.initialize = function (done) {
    var model = modelModel.create();
    this.model = model.Model;
    done();
};

ModelService.prototype.checkSchema = function (done) {
    modelModel.createIndexes(done);
};

ModelService.prototype.onInitialized = function () {
    if (!this.prototypeService) {
        this.prototypeService = registry.getModule('PrototypeService');
    }

    if (!this.artifactService) {
        this.artifactService = registry.getModule('ArtifactService');
    }

    if (!this.assetService) {
        this.assetService = registry.getModule('AssetService');
    }

    if (!this.sampleDataModel) {
        this.sampleDataModel = mongoose.model('sampleMetadata');
    }

    if (!this.sharedWorkspaceProcessing) {
        this.sharedWorkspaceProcessing = registry.getModule('SwProcessing');
    }
};

ModelService.prototype.shutdown = function (done) {
    done();
};

ModelService.prototype.EVENT = eventHelper.EVENT;
ModelService.prototype.OPERATION = eventHelper.OPERATION;
ModelService.prototype.TYPE = eventHelper.TYPE;

/**
 * Retrieve model from project id.
 * @param {string} projectId - Mandatory project ID
 * @returns {Promise} The fulfilled promise contains the model
 */
ModelService.prototype.getModel = function (projectId) {
    return modelHelper.getModel(this._getContext(projectId))
        .then(function (context) {
            context.logger.debug('get model - project id: ' + context.projectId + ' - model :' + JSON.stringify(context.model));
            return removeMongoseFields(context.model);
        })
        .catch(handleError);
};

/**
 * Update model for UI. we update only layout of model and position of entity
 * @param {string} projectId - project ID
 * @param {object} updatedModel - the updated model
 * @param {object} user
 * @param {string} buildSessionId
 * @returns {Promise} The fulfilled promise contains the updated model
 */
ModelService.prototype.updateModel = function (projectId, updatedModel, user, buildSessionId) {
    logger.debug(user, 'Upate model - project id: ' + projectId + ' - model :' + JSON.stringify(updatedModel));
    var context = this._getContext(projectId, user, buildSessionId);
    context.updatedModel = updatedModel;

    return modelHelper.update(context)
        .then(prototypeHelper.doMetadata)
        .then(function (theContext) {
            theContext.logger.debug('Upate model - project id: ' + theContext.projectId + ' - model :' + JSON.stringify(theContext.model));
            return 'updated model';
        })
        .catch(handleError);
};

/**
 * Create model from excel file (OpenXml).
 * File must contains the entities in Tables
 *
 * @param {string} projectId - The project ID
 * @param {binary} data - Contains excel file
 * @param {object} user
 * @param {string} buildSessionId
 * @returns {Promise} The fulfilled promise contains the created model.
 */
ModelService.prototype.importXL = function (projectId, data, user, buildSessionId) {
    logger.debug(user, 'importXL : ' + projectId);

    var context = this._getContext(projectId, user, buildSessionId, true);
    context.data = data;

    return modelHelper.getModel(context)
        .then(xlHelper.getModel)
        .then(modelHelper.incrementModel)
        .then(dataHelper.incrementData)
        .then(dagreHelper.buildGraph)
        .then(prototypeHelper.doMetadata)
        .then(function (theContext) {
            if (theContext.parserXlResult.success) {
                theContext.logger.debug('importXL - project id: ' + theContext.projectId + ' - model :' + JSON.stringify(theContext.model));
                var resultInfo = {success: true, messages: []};
                resultInfo.result = removeMongoseFields(theContext.model);
                resultInfo.result.createdEntities = theContext.updatedModel.entities;
                return resultInfo;
            }
            else {
                theContext.logger.debug('importXL - project id: ' + theContext.projectId + ' - result :' + JSON.stringify(theContext.parserXlResult));
            }

            return theContext.parserXlResult;
        })
        .catch(handleError);
};

ModelService.prototype.updateXl = function (projectId, data, user, buildSessionId) {
    logger.debug(user, 'updateXl : ' + projectId);

    var context = this._getContext(projectId, user, buildSessionId, true);
    context.data = data;

    return modelHelper.getModel(context)
        .then(xlHelper.getData)
        .then(dataHelper.mergeData)
        .then(prototypeHelper.doMetadata)
        .then(function (theContext) {
            if (theContext.parserXlResult && theContext.parserXlResult.success) {
                theContext.logger.debug('updateXl - project id: ' + theContext.projectId + ' - model :' + JSON.stringify(theContext.model));
                theContext.parserXlResult.result = removeMongoseFields(theContext.model);
            }
            return theContext.parserXlResult;
        })
        .catch(handleError);
};

ModelService.prototype.exportXl = function (projectId, useTable) {
    var context = this._getContext(projectId, null, true);

    return modelHelper.getModel(context)
        .then(dataHelper.getData)
        .then(function (theContext) {
            var entities = [];

            theContext.model.entities.forEach(function (entity) {
                entities.push(entity.name);
            });

            return exportModel.exportToXLFormat(dataHelper.filterCalculatedProperty(theContext.model), entities, theContext.sampleData, useTable, true);
        })
        .catch(handleError);
};

ModelService.prototype.exportXlEntity = function (projectId, entityId, useTable) {
    var context = this._getContext(projectId, null, true);
    context.entityId = entityId;

    return entityHelper.getEntityName(context)
        .then(dataHelper.getData)
        .then(function (theContext) {
            return exportModel.exportToXLFormat(dataHelper.filterCalculatedProperty(theContext.model), theContext.entityNames, theContext.sampleData, useTable);
        })
        .catch(handleError);
};

/**
 * Add an entity from the catalog
 *
 * @param {string} projectId - The project ID
 * @param {string} catalogId - The catalog ID
 * @param {string} originalEntityId - The ID of the original entity
 * @param {object} user
 * @param {string} buildSessionId
 * @returns {Promise} The fulfilled promise contains the new entity
 */
ModelService.prototype.addEntityFromCatalog = function (projectId, catalogId, originalEntityId, user, buildSessionId) {
    var context = this._getContext(projectId, user, buildSessionId);
    context.catalog = catalogId;
    context.catalogEntityId = originalEntityId;

    return businessCatalogHelper.getEntity(context)
        .then(function (theContext) {
            theContext.updatedModel = theContext.model;
            delete context.model;

            return theContext;
        })
        .then(modelHelper.getModel)
        .then(modelHelper.incrementModel)
        .then(dagreHelper.buildGraph)
        .then(prototypeHelper.doMetadata)
        .then(function (theContext) {
            theContext.logger.debug('add Entity From Catalog - project id: ' + context.projectId + ' - originalEntityId: ' + context.catalogEntityId + ' - enity :' + JSON.stringify(context.entity));
            return context.entity;
        })
        .catch(handleError);
};

/**
 * Add an entity and recursively the target entities of its navigations
 *
 * @param {string} projectId - The project ID
 * @param {string} catalogId - The catalog ID
 * @param {string} originalEntityId - The ID of the original entity
 * @param {object} user
 * @param {string} buildSessionId
 * @returns {Promise} The fulfilled promise contains the updated model
 */
ModelService.prototype.addEntityFromCatalogWithNavigation = function (projectId, catalogId, originalEntityId, user, buildSessionId) {
    var context = this._getContext(projectId, user, buildSessionId);
    context.catalog = catalogId;
    context.catalogEntityId = originalEntityId;

    return businessCatalogHelper.getEntityWithNavigation(context)
        .then(function (theContext) {
            theContext.updatedModel = theContext.model;
            delete context.model;

            return theContext;
        })
        .then(modelHelper.getModel)
        .then(modelHelper.incrementModel)
        .then(dagreHelper.buildGraph)
        .then(prototypeHelper.doMetadata)
        .then(function (theContext) {
            theContext.logger.debug('add Entity From Catalog With Navigation - project id: ' + context.projectId + ' - catalogId: ' + context.catalog + ' - originalEntityId: '
            + context.catalogEntityId + ' - model :' + JSON.stringify(context.model));

            return removeMongoseFields(theContext.model);
        })
        .catch(handleError);
};

/**
 * Add all the entities of a catalog
 *
 * @param projectId
 * @param catalogId
 * @param {object} user
 * @param {string} buildSessionId
 * @returns {Promise} The fulfilled promise contains the new model
 */
ModelService.prototype.addEntitiesFromCatalog = function (projectId, catalogId, user, buildSessionId) {
    var context = this._getContext(projectId, user, buildSessionId);
    context.catalog = catalogId;

    return businessCatalogHelper.getCatalog(context)
        .then(function (theContext) {
            theContext.updatedModel = theContext.model;
            delete context.model;

            return theContext;
        })
        .then(modelHelper.getModel)
        .then(modelHelper.incrementModel)
        .then(dagreHelper.buildGraph)
        .then(prototypeHelper.doMetadata)
        .then(function (theContext) {
            theContext.logger.debug('add Entities From Catalog - project id: ' + context.projectId + ' - catalogId: ' + context.catalog + ' - model :' + JSON.stringify(theContext.model));

            return removeMongoseFields(theContext.model);
        })
        .catch(handleError);
};

/* -------------------------------------------------------------------------------------------------------------------
 Entity
 -------------------------------------------------------------------------------------------------------------------*/

/**
 * Create a new entity following these rules:
 * - If newEntityObject does not contain any property, then a property ID will be added as key.
 * - The name of the new entity will be unique in its model.
 *
 * @param {string} projectId - The project ID
 * @param {object} newEntityObject - The new entity
 * @param {object} user
 * @param {string} buildSessionId
 * @returns {Promise} The fulfilled promise contains the new entity
 */
ModelService.prototype.addEntity = function (projectId, newEntityObject, user, buildSessionId) {
    var context = this._getContext(projectId, user, buildSessionId);
    context.newEntity = newEntityObject;

    return modelHelper.getModel(context)
        .then(entityHelper.add)
        .then(dagreHelper.buildGraph)
        .then(modelHelper.save)
        .then(prototypeHelper.doMetadata)
        .then(function (theContext) {
            theContext.logger.debug('add Entity - project id: ' + context.projectId + ' - entity :' + JSON.stringify(theContext.entity));
            return theContext.entity;
        })
        .catch(handleError);
};

/**
 * Update an existing entity
 *
 * @param {string} projectId - The project id
 * @param {string} entityId - The entity id
 * @param {object} updatedEntity - The updated entity
 * @param {object} user
 * @param {string} buildSessionId
 * @returns {Promise} The fulfilled promise contains the updated entity
 */
ModelService.prototype.updateEntity = function (projectId, entityId, updatedEntity, user, buildSessionId) {
    var context = this._getContext(projectId, user, buildSessionId);
    context.entityId = entityId;
    context.updatedEntity = updatedEntity;

    return modelHelper.getModel(context)
        .then(entityHelper.update)
        .then(modelHelper.save)
        .then(prototypeHelper.doMetadata)
        .then(function (theContext) {
            theContext.logger.debug('update Entity - project id: ' + context.projectId + ' - entity :' + JSON.stringify(theContext.entity));
            return theContext.entity;
        })
        .catch(handleError);
};

/**
 * Remove an entity
 *
 * @param {string} projectId - The project ID
 * @param {string} entityId - The entity ID
 * @param {object} user
 * @param {string} buildSessionId
 * @returns {Promise} The fulfilled promise contains the model
 */
ModelService.prototype.removeEntity = function (projectId, entityId, user, buildSessionId) {
    var context = this._getContext(projectId, user, buildSessionId);
    context.entityId = entityId;

    return modelHelper.getModel(context)
        .then(entityHelper.remove)
        .then(modelHelper.save)
        .then(prototypeHelper.doMetadata)
        .then(function (theContext) {
            theContext.logger.debug('remove Entity - project id: ' + context.projectId + ' - model :' + JSON.stringify(theContext.model));
            return theContext.model;
        })
        .catch(handleError);
};

/* -------------------------------------------------------------------------------------------------------------------
 Property
 ------------------------------------------------------------------------------------------------------------------*/

/**
 * Add property to the entity with id entityId in the model of the project with id projectId
 * @param projectId - The project ID
 * @param entityId - The entity ID
 * @param property - The new property
 * @param {object} user
 * @param {string} buildSessionId
 * @returns {Promise} the fulfilled promise contains the created property
 */
ModelService.prototype.addProperty = function (projectId, entityId, property, user, buildSessionId) {
    var context = this._getContext(projectId, user, buildSessionId);
    context.entityId = entityId;
    context.newProperty = property;

    return entityHelper.getEntity(context)
        .then(propertyHelper.add)
        .then(modelHelper.save)
        .then(prototypeHelper.doMetadata)
        .then(function (theContext) {
            theContext.logger.debug('add property - project id: ' + context.projectId + ' - property :' + JSON.stringify(theContext.property));
            return theContext.property;
        })
        .catch(handleError);
};

/**
 * Update the property with id propertyId in the entity with id entityId in the model of the project with id projectId
 * @param projectId - The project ID
 * @param entityId - The entity ID
 * @param propertyId - The property ID
 * @param updatedProperty - The updated property
 * @param {object} user
 * @param {string} buildSessionId
 * @returns {Promise} - the fulfilled promise contains the updated property
 */
ModelService.prototype.updateProperty = function (projectId, entityId, propertyId, updatedProperty, user, buildSessionId) {
    var context = this._getContext(projectId, user, buildSessionId);
    context.entityId = entityId;
    context.propertyId = propertyId;
    context.updatedProperty = updatedProperty;

    return propertyHelper.getProperty(context)
        .then(propertyHelper.update)
        .then(modelHelper.save)
        .then(prototypeHelper.doMetadata)
        .then(function (theContext) {
            theContext.logger.debug('update property - project id: ' + context.projectId + ' - property :' + JSON.stringify(theContext.property));
            return theContext.property;
        })
        .catch(handleError);
};

/**
 * Remove a property
 *
 * @param projectId - The project ID
 * @param entityId - The entity ID
 * @param propertyId - The property ID
 * @param {object} user
 * @param {string} buildSessionId
 * @returns {Promise} Removal is a success if the promise is fulfilled
 */
ModelService.prototype.removeProperty = function (projectId, entityId, propertyId, user, buildSessionId) {
    var context = this._getContext(projectId, user, buildSessionId);
    context.entityId = entityId;
    context.propertyId = propertyId;

    return entityHelper.getEntity(context)
        .then(propertyHelper.remove)
        .then(modelHelper.save)
        .then(prototypeHelper.doMetadata)
        .then(function (theContext) {
            theContext.logger.debug('remove property - project id: ' + context.projectId + ' - model :' + JSON.stringify(theContext.model));
            return 'Property deleted';
        })
        .catch(handleError);
};

/* -------------------------------------------------------------------------------------------------------------------
 Navigation Property
 -----------------------------------------------------------------------------------------------------------------*/

/**
 * Add a navigation property navigationProperty in the model of the project with the id projectId in the entity with id entityId
 * @param projectId
 * @param entityId
 * @param {Object}navigationProperty - navigation property object that needs to have the following properties :
 *              - toEntityId : the id of the destination entity
 * @param {object} user
 * @param {string} buildSessionId
 * @returns  {Promise} - the fulfilled promise contains the navigation property
 */
ModelService.prototype.addNavigationProperty = function (projectId, entityId, navigationProperty, user, buildSessionId) {
    var context = this._getContext(projectId, user, buildSessionId);
    context.entityId = entityId;
    context.newNavigationProperty = navigationProperty;

    return entityHelper.getEntity(context)
        .then(navigationPropertyHelper.add)
        .then(modelHelper.save)
        .then(prototypeHelper.doMetadata)
        .then(function (theContext) {
            theContext.logger.debug('add navigation property - project id: ' + context.projectId + ' - model :' + JSON.stringify(theContext.navigationProperty));
            return theContext.navigationProperty;
        })
        .catch(handleError);
};

/**
 * Update the navigation property with id navPropId into navigationProperty in the model of the project with the id projectId in the entity with id entityId
 * @param projectId
 * @param entityId
 * @param navPropId
 * @param {Object}navigationProperty - navigation property object where the following properties are used for update :
 *              - name : the name of the navigation property
 *              - multiplicity : the navigation property multiplicity
 * @param {object} user
 * @param {string} buildSessionId
 * @returns {Promise} - the fulfilled promise contains the updated navigation property
 */
ModelService.prototype.updateNavigationProperty = function (projectId, entityId, navPropId, navigationProperty, user, buildSessionId) {
    var context = this._getContext(projectId, user, buildSessionId);
    context.entityId = entityId;
    context.navigationPropertyId = navPropId;
    context.updatedNavigationProperty = navigationProperty;

    return navigationPropertyHelper.getNavigationProperty(context)
        .then(navigationPropertyHelper.update)
        .then(modelHelper.save)
        .then(prototypeHelper.doMetadata)
        .then(function (theContext) {
            theContext.logger.debug('update navigation property - project id: ' + context.projectId + ' - model :' + JSON.stringify(theContext.navigationProperty));
            return theContext.navigationProperty;
        })
        .catch(handleError);
};

/**
 * Remove a navigation property
 *
 * @param projectId - The project ID
 * @param entityId - The entity ID
 * @param navigationPropertyId - The navigation property ID
 * @param {object} user
 * @param {string} buildSessionId
 * @returns {Promise} Removal is a success if the promise is fulfilled
 */
ModelService.prototype.removeNavigationProperty = function (projectId, entityId, navigationPropertyId, user, buildSessionId) {
    var context = this._getContext(projectId, user, buildSessionId);
    context.entityId = entityId;
    context.navigationPropertyId = navigationPropertyId;

    return navigationPropertyHelper.getNavigationProperty(context)
        .then(navigationPropertyHelper.remove)
        .then(modelHelper.save)
        .then(prototypeHelper.doMetadata)
        .then(function (theContext) {
            theContext.logger.debug('remove navigation - project id: ' + context.projectId + ' - model :' + JSON.stringify(theContext.model));
            return 'Navigation deleted';
        })
        .catch(handleError);
};

/* -------------------------------------------------------------------------------------------------------------------
 SAMPLEDATA
 -----------------------------------------------------------------------------------------------------------------*/

/**
 * Add sample data for the model of the project projectId for the entity entityId
 *  If the entity already has sample data it is added to the existing sample data
 * @param {string} projectId
 * @param {string} entityName
 * @param {string} sampleData - data sample for a specific entity in JSON format
 *          with the data structure [{property1: property1valueA, property2: porperty2valueA}, {property1: property1valueB, property2: porperty2valueB}]
 * @param {object} user
 * @param {string} buildSessionId
 * @returns {Promise} - The fulfilled promise contains the updated model
 */
ModelService.prototype.addSampleData = function (projectId, entityName, sampleData, user, buildSessionId) {
    var context = this._getContext(projectId, user, buildSessionId);
    context.entityName = entityName;
    context.data = sampleData;

    return entityHelper.getEntityFromName(context)
        .then(dataHelper.add)
        .then(prototypeHelper.doMetadata)
        .then(function (theContext) {
            return theContext.data;
        })
        .catch(handleError);
};

/**
 * get the sample data for a specific entity entityId in the project projectId or all the sample data for the project projectId if entityId is not filled
 * @param {string} projectId - Id of the requested project
 * @param {string} entityName - entity name
 *
 * @returns {Promise} - Promise.onFulfilled that contains the sampleData corresponding to the request
 */
ModelService.prototype.getSampleData = function (projectId, entityName) {
    var context = this._getContext(projectId);

    context.entityName = entityName;

    return entityHelper.getEntityFromName(context)
        .then(assetHelper.getAssets)
        .then(dataHelper.getEntityData)
        .then(function (dataContext) {
            return dataContext.data;
        })
        .catch(handleError);
};

/* -------------------------------------------------------------------------------------------------------------------
 Group
 --------------------------------------------------------------------------------------------------------------------*/

ModelService.prototype.getStandardGroups = function () {
    return q(groupHelper.getStandardGroups())
        .catch(handleError);
};

/**
 * Add group to the entity with id entityId in the model of the project with id projectId
 * @param projectId - The project ID
 * @param entityId - The entity ID
 * @param group - The new group
 * @param {object} user
 * @param {string} buildSessionId
 * @returns {Promise} the fulfilled promise contains the created group
 */
ModelService.prototype.addGroup = function (projectId, entityId, group, user, buildSessionId) {
    var context = this._getContext(projectId, user, buildSessionId);
    context.entityId = entityId;
    context.newGroup = group;

    return entityHelper.getEntity(context)
        .then(groupHelper.add)
        .then(modelHelper.save)
        .then(prototypeHelper.doMetadata)
        .then(function (theContext) {
            theContext.logger.debug('add property - project id: ' + context.projectId + ' - group :' + JSON.stringify(theContext.group));
            return theContext.group;
        })
        .catch(handleError);
};

/**
 * Update the group with id groupId in the entity with id entityId in the model of the project with id projectId
 * @param projectId - The project ID
 * @param entityId - The entity ID
 * @param groupId - The group ID
 * @param updatedGroup - The updated group
 * @param {object} user
 * @param {string} buildSessionId
 * @returns {Promise} - the fulfilled promise contains the updated group
 */
ModelService.prototype.updateGroup = function (projectId, entityId, groupId, updatedGroup, user, buildSessionId) {
    var context = this._getContext(projectId, user, buildSessionId);
    context.entityId = entityId;
    context.groupId = groupId;
    context.updatedGroup = updatedGroup;

    return groupHelper.getGroup(context)
        .then(groupHelper.update)
        .then(modelHelper.save)
        .then(prototypeHelper.doMetadata)
        .then(function (theContext) {
            theContext.logger.debug('update property - project id: ' + context.projectId + ' - group :' + JSON.stringify(theContext.group));
            return theContext.group;
        })
        .catch(handleError);
};

/**
 * Remove a group
 *
 * @param projectId - The project ID
 * @param entityId - The entity ID
 * @param groupId - The group ID
 * @param {object} user
 * @param {string} buildSessionId
 * @returns {Promise} Removal is a success if the promise is fulfilled
 */
ModelService.prototype.removeGroup = function (projectId, entityId, groupId, user, buildSessionId) {
    var context = this._getContext(projectId, user, buildSessionId);
    context.entityId = entityId;
    context.groupId = groupId;

    return groupHelper.getGroup(context)
        .then(groupHelper.remove)
        .then(modelHelper.save)
        .then(prototypeHelper.doMetadata)
        .then(function (theContext) {
            theContext.logger.debug('remove property - project id: ' + context.projectId + ' - model :' + JSON.stringify(theContext.model));
            return 'Property deleted';
        })
        .catch(handleError);
};

/* -------------------------------------------------------------------------------------------------------------------
 private methods for sample data
 ------------------------------------------------------------------------------------------------------------------*/


/***
 * get service description from project id
 * @param {string} projectId - The project ID
 * @returns {Promise} The fulfilled promise contains the service description
 */
ModelService.prototype.getServiceDescription = function (projectId) {
    return modelHelper.getModel(this._getContext(projectId))
        .then(odataHelper.getServiceDescription)
        .catch(handleError);
};

/***
 * Generate metadata for one model
 * @param {string} projectId - The project ID
 * @returns {Promise} The fulfilled promise contains the metadata
 */
ModelService.prototype.getMetadata = function (projectId) {
    return modelHelper.getModel(this._getContext(projectId))
        .then(odataHelper.generateMetadata)
        .catch(handleError);
};


/**
 * Generate and upload artifacts of sample data
 * @param projectId - The project ID
 * @param sampleData - The sample data
 * @returns {Promise} The fulfilled promise contains true if everything worked fine
 */
ModelService.prototype.generateSampleDataArtifacts = function (projectId, sampleData) {
    var context = this._getContext(projectId);
    context.sampleData = sampleData;

    return prototypeHelper.getModel(context)
        .then(assetHelper.getAssets)
        .then(prototypeHelper.updateData)
        .then(prototypeHelper.uploadArtifacts)
        .then(function () {
            context.logger.debug('generateDataArtifacts - project id: ' + context.projectId);
            return true;
        })
        .catch(handleError);
};


/***
 * get entity data for SAP UI5 mockserver
 * @param {string} projectId - The project ID
 * @param {string} entityName - the entity name
 * @param {boolean} [doGenerateData]
 * @returns {Promise} The fulfilled promise contains data
 */
ModelService.prototype.getEntityData = function (projectId, entityName, doGenerateData) {
    var context = this._getContext(projectId);

    context.entityNameSet = entityName;
    context.doGenerateData = doGenerateData || true;

    return prototypeHelper.getModelAndSampleData(context)
        .then(entityHelper.getEntityFromNameSet)
        .then(assetHelper.getAssets)
        .then(odataHelper.getEntityData)
        .then(function (theContext) {
            theContext.logger.debug('get Entity data - project id: ' + context.projectId + ' - data :' + JSON.stringify(theContext.data));
            return theContext.data;
        })
        .catch(handleError);
};

/***
 * Get all Types from the model
 * @returns {Promise} The fulfilled promise contains the array of types
 */
ModelService.prototype.getTypes = function () {
    return q(propertyHelper.getTypes());
};

// ------------------------ Private ------------------------

/**
 * @private
 */
ModelService.prototype._getContext = function (projectId, user, buildSessionId, bExcel) {
    // for beta
    if (!this.businessCatalog) {
        try {
            this.businessCatalog = registry.getModule('BusinessCatalog');
        }
        catch (err) {
            this.businessCatalog = null;
        }
    }

    return {
        user: user,
        buildSessionId: buildSessionId,
        projectId: projectId,
        prototypeService: this.prototypeService,
        sharedWorkspaceProcessing: this.sharedWorkspaceProcessing,
        assetService: this.assetService,
        mongooseModel: this.model,
        sampleDataModel: this.sampleDataModel,
        artifactService: this.artifactService,
        businessCatalog: this.businessCatalog,
        logger: logger,
        eventData: {
            projectId: projectId,
            excel: bExcel ? true : false,
            operations: []
        },
        modelService: this
    };
};

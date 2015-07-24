'use strict';

var modelHelper = require('./modelHelper.js');
var propertyHelper = require('./propertyHelper.js');
var navigationPropertyHelper = require('./navigationPropertyHelper.js');
var commonServer = require('norman-common-server');
var NormanError = commonServer.NormanError;
var lodash = require('norman-server-tp').lodash;
var commonMessage = require('./../common/common.message.js');
var eventHelper = require('./eventHelper.js');


var PROPERTY_ID = {name: 'ID', propertyType: 'String', isKey: true, isNullable: false};
var DEFAULT_NAME = 'Object';
var PROPERTIES = {
    isReadOnly: false,
    media: undefined,
    readable: undefined,
    pageable: undefined,
    addressable: undefined,
    originalEntity: undefined,
    semantics: undefined
};
var CLONE_PROPERTIES = Object.keys(PROPERTIES);
var CHECK_NAME = /^[a-z_]\w{0,39}$/i;
var FORBIDDEN_NAME = /^[cr]$/i;

exports.PROPERTY_ID = PROPERTY_ID;
exports.CHECK_NAME = CHECK_NAME;
exports.FORBIDDEN_NAME = FORBIDDEN_NAME;

exports.add = function (context) {
    var newEntity = {}, properties;

    newEntity._id = commonServer.utils.shardkey();
    context.newEntity._id = newEntity._id;

    if (!CHECK_NAME.test(newEntity.name) || FORBIDDEN_NAME.test(newEntity.name)) {
        context.logger.debug(newEntity, commonMessage.error.SWE100);
        throw new NormanError(commonMessage.error.SWE100, 400);
    }

    newEntity.name = modelHelper.forceUniquenessForName(context.model.entities, context.newEntity, DEFAULT_NAME);
    newEntity.nameSet = modelHelper.forceUniquenessForNameSet(context.model.entities, context.newEntity, newEntity.name + 'Set');
    newEntity.label = context.newEntity && context.newEntity.label ? context.newEntity.label : newEntity.name;

    CLONE_PROPERTIES.forEach(function (property) {
        newEntity[property] = context.newEntity[property] !== undefined ? context.newEntity[property] : PROPERTIES[property];
    });

    context.entity = context.model.entities.create(newEntity);

    if (context.newEntity && context.newEntity.properties && context.newEntity.properties.length > 0) {
        properties = context.newEntity.properties;
    }
    else {
        properties = [PROPERTY_ID];
    }

    // add entity creation in event queue
    eventHelper.queueCreateEntity(context, context.entity);

    properties.forEach(function (property) {
        context.newProperty = property;
        propertyHelper.add(context);
    });

    context.model.entities.push(context.entity);

    if (context.newEntity && context.newEntity.name) {
        context.entityNameMap = context.entityNameMap || {};
        context.entityNameMap[context.newEntity.name] = context.entity;
    }

    return context;
};


exports.update = function (context) {
    context.entity = lodash.find(context.model.entities, {_id: context.entityId});

    if (!context.entity) {
        throw new NormanError('No entity found with id: ' + context.entityId, 404);
    }

    context.oldEntityName = context.entity.name;

    var oldEntity = eventHelper.cloneAndCleanEntity(context.entity);

    if (context.entity.name !== context.updatedEntity.name) {

        if (!CHECK_NAME.test(context.updatedEntity.name) || FORBIDDEN_NAME.test(context.updatedEntity.name)) {
            context.logger.debug(context.updatedEntity, commonMessage.error.SWE100);
            throw new NormanError(commonMessage.error.SWE100, 400);
        }

        context.entity.name = modelHelper.forceUniquenessForName(context.model.entities, context.updatedEntity, DEFAULT_NAME);
        context.entity.nameSet = modelHelper.forceUniquenessForNameSet(context.model.entities, {_id: context.updatedEntity._id}, context.entity.name + 'Set');
        context.entity.label = context.entity.name;
    }

    CLONE_PROPERTIES.forEach(function (property) {
        context.entity[property] = context.updatedEntity[property];
    });

    eventHelper.queueUpdateEntity(context, oldEntity, context.entity);

    return context;
};

function checkEntityUsage(context) {
    var usedIn = [];
    context.model.entities.forEach(function (entity) {
        if (entity._id !== context.entityId) {
            entity.properties.forEach(function (prop) {
                var inputProps = prop.calculated.inputProperties;
                if (inputProps.length) {
                    for (var i = 0; i < inputProps.length; i++) {
                        if (inputProps[i].entityId === context.entityId) {
                            usedIn.push({
                                entity: entity.name,
                                property: prop.name
                            });
                            break;
                        }
                    }
                }
            });
        }
    });
    return usedIn;
}

exports.remove = function (context) {
    var entity = lodash.find(context.model.entities, {_id: context.entityId});


    var usage = checkEntityUsage(context);

    if (usage.length) {
        var message = (commonMessage.error.SWE1003).replace(/\{\{PROPERTY_NAME\}\}/, usage[0].property);
        message = message.replace(/\{\{OBJECT_NAME\}\}/, usage[0].entity);
        throw new NormanError(message, 400);
    }

    // in case of 2 simultaneous calls we may not have an entity to remove
    if (entity && !usage.length) {
        context.oldEntityName = entity.name;

        context.entity = entity;
        entity.navigationProperties.forEach(function (navigationProperty) {
            context.navigationProperty = navigationProperty;
            navigationPropertyHelper.remove(context);
        });

        // remove all navigation where the removed entity is the target
        context.model.entities.forEach(function (theEntity) {
            var navigationProperties = [];

            // copy collection because the navigationProperties collection of Entity is empty after first removing
            lodash.forEach(theEntity.navigationProperties, function (nav) {
                navigationProperties.push(nav);
            });

            lodash.forEach(navigationProperties, function (nav) {
                if (nav.toEntityId === context.entityId) {
                    context.entity = theEntity;
                    context.navigationProperty = nav;
                    navigationPropertyHelper.remove(context);
                }
            });
        });

        eventHelper.queueDeleteEntity(context, entity);

        entity.remove();
        // TODO: remove calculated property in futur
    }
    return context;
};

exports.getEntityFromName = function (context) {
    return modelHelper.getModel(context)
        .then(function (theContext) {
            theContext.entity = null;
            theContext.model.entities.forEach(function (entity) {
                if (entity.name.toLowerCase() === theContext.entityName.toLowerCase()) {
                    theContext.entity = entity;
                }
            });

            if (theContext.entity === null) {
                throw new NormanError('No entity found with name: ' + theContext.entityName, 404);
            }

            theContext.logger.debug('Get entity - ' + theContext.projectId + ' - ' + theContext.entityName + ' - ' + JSON.stringify(theContext.entity));
            return theContext;
        });
};

exports.getEntityFromNameSet = function (context) {
    context.entity = null;
    context.model.entities.forEach(function (entity) {
        if (entity.nameSet.toLowerCase() === context.entityNameSet.toLowerCase()) {
            context.entity = entity;
        }
    });

    if (context.entity === null) {
        throw new NormanError('No entity found with nameSet: ' + context.entityName, 404);
    }

    context.logger.debug(context.entity, 'Get entity - ' + context.projectId + ' - ' + context.entityName + ' - ');
    return context;
};

exports.getEntity = function (context) {
    return modelHelper.getModel(context)
        .then(function (theContext) {
            theContext.entity = null;
            theContext.model.entities.forEach(function (entity) {
                if (entity._id === theContext.entityId) {
                    theContext.entity = entity;
                }
            });

            if (theContext.entity === null) {
                throw new NormanError('No entity found with id: ' + theContext.entityId, 404);
            }

            theContext.logger.debug('Get entity - ' + theContext.projectId + ' - ' + theContext.entityId + ' - ' + JSON.stringify(theContext.entity));
            return context;
        });

};

exports.getEntityName = function (context) {
    return modelHelper.getModel(context)
        .then(function (theContext) {

            // in all cases we have the selected entity
            theContext.entity = theContext.model.entities.id(theContext.entityId);
            theContext.entityNames = [theContext.entity.name];

            if (theContext.entity === null) {
                throw new NormanError('No entity found with id: ' + theContext.entityId, 404);
            }

            theContext.logger.debug('Get entity - ' + theContext.projectId + ' - ' + theContext.entityId + ' - ' + JSON.stringify(theContext.entity));
            return context;
        });

};


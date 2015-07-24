'use strict';
var _ = require('norman-server-tp').lodash;

var EVENT = {
    MODEL_CHANGE: 'modelChange'
};

var OPERATION = {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete'
};

var TYPE = {
    MODEL: 'model',
    ENTITY: 'entity',
    PROPERTY: 'property',
    NAVIGATION: 'navigation'
};

exports.EVENT = EVENT;
exports.OPERATION = OPERATION;
exports.TYPE = TYPE;

function cloneAndCleanEntity(entity) {
    var e = entity.toJSON ? entity.toJSON() : _.clone(entity, true);
    delete e.properties;
    delete e.navigationProperties;
    return e;
}

function cloneAndCleanProperty(property) {
    return property.toJSON ? property.toJSON() : _.clone(property, true);
}

function cloneAndCleanNavigation(navigation) {
    return navigation.toJSON ? navigation.toJSON() : _.clone(navigation, true);
}

exports.cloneAndCleanEntity = cloneAndCleanEntity;
exports.cloneAndCleanProperty = cloneAndCleanProperty;
exports.cloneAndCleanNavigation = cloneAndCleanNavigation;

//-------------- Property -------------------

exports.queueCreateProperty = function (context, parentEntity, newProperty) {

    context.eventData.operations.push({
        type: TYPE.PROPERTY,
        operation: OPERATION.CREATE,
        entity: cloneAndCleanEntity(parentEntity),
        previous: {},
        current: cloneAndCleanProperty(newProperty)
    });
};

exports.queueUpdateProperty = function (context, parentEntity, previousProperty, currentProperty) {

    context.eventData.operations.push({
        type: TYPE.PROPERTY,
        operation: OPERATION.UPDATE,
        entity: cloneAndCleanEntity(parentEntity),
        previous: cloneAndCleanProperty(previousProperty),
        current: cloneAndCleanProperty(currentProperty)
    });
};

exports.queueDeleteProperty = function (context, parentEntity, previousProperty) {

    context.eventData.operations.push({
        type: TYPE.PROPERTY,
        operation: OPERATION.DELETE,
        entity: cloneAndCleanEntity(parentEntity),
        previous: cloneAndCleanProperty(previousProperty),
        current: {}
    });
};

//-------------- Entity -------------------

exports.queueCreateEntity = function (context, newEntity) {

    context.eventData.operations.push({
        type: TYPE.ENTITY,
        operation: OPERATION.CREATE,
        previous: {},
        current: cloneAndCleanEntity(newEntity)
    });
};

exports.queueUpdateEntity = function (context, previousEntity, currentEntity) {

    context.eventData.operations.push({
        type: TYPE.ENTITY,
        operation: OPERATION.UPDATE,
        previous: cloneAndCleanEntity(previousEntity),
        current: cloneAndCleanEntity(currentEntity)
    });
};

exports.queueDeleteEntity = function (context, previousEntity) {

    context.eventData.operations.push({
        type: TYPE.ENTITY,
        operation: OPERATION.DELETE,
        previous: cloneAndCleanEntity(previousEntity),
        current: {}
    });
};

//-------------- Navigation -------------------

exports.queueCreateNavigation = function (context, parentEntity, newNavigation) {

    context.eventData.operations.push({
        type: TYPE.NAVIGATION,
        operation: OPERATION.CREATE,
        entity: cloneAndCleanEntity(parentEntity),
        previous: {},
        current: cloneAndCleanNavigation(newNavigation)
    });
};

exports.queueUpdateNavigation = function (context, parentEntity, previousNavigation, currentNavigation) {

    context.eventData.operations.push({
        type: TYPE.NAVIGATION,
        operation: OPERATION.UPDATE,
        entity: cloneAndCleanEntity(parentEntity),
        previous: cloneAndCleanNavigation(previousNavigation),
        current: cloneAndCleanNavigation(currentNavigation)
    });
};

exports.queueDeleteNavigation = function (context, parentEntity, previousNavigation) {

    context.eventData.operations.push({
        type: TYPE.NAVIGATION,
        operation: OPERATION.DELETE,
        entity: cloneAndCleanEntity(parentEntity),
        previous: cloneAndCleanNavigation(previousNavigation),
        current: {}
    });
};

//--------------------------------------------


/**
 * Each time a DB operation is commited, this function must be called to emit an event
 *
 * @param context
 */
exports.sendModelChangeEvent = function (context) {

    if (context.eventData.operations && context.eventData.operations.length > 0) {
        context.modelService.emit(EVENT.MODEL_CHANGE, context.eventData);
    }

    context.eventData.operations = [];
};

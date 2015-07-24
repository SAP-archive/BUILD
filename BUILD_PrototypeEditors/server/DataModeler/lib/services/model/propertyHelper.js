'use strict';

var modelHelper = require('./modelHelper.js');
var entityHelper = require('./entityHelper.js');
var commonServer = require('norman-common-server');
var NormanError = commonServer.NormanError;
var eventHelper = require('./eventHelper.js');
var commonMessage = require('./../common/common.message.js');
var ODATA_IDENTIFIER = require('./model.js').ODATA_IDENTIFIER;

var TYPES = ['String', 'Decimal', 'Boolean', 'DateTime', 'Binary', 'Byte', 'Double', 'Single', 'Guid', 'Int16', 'Int32', 'Int64', 'SByte', 'Time', 'DateTimeOffset'];
var DEFAULT_NAME = 'Property';
var PROPERTIES = {
    isReadOnly: false,
    isKey: false,
    isNullable: true,
    calculated: undefined,
    isETag: undefined,
    maxLength: undefined,
    precision: undefined,
    scale: undefined,
    readable: undefined,
    sortable: undefined,
    filterable: undefined,
    semantic: undefined,
    unit: undefined,
    'field-control': undefined,
    'default': undefined,
    isForeignKey: false,
    isAsset: false,
    tags: undefined,
    semantics: undefined
};
var CLONE_PROPERTIES = Object.keys(PROPERTIES);

exports.clone = function (source) {
    var clonedProp = {name: source.name, propertyType: source.propertyType};

    CLONE_PROPERTIES.forEach(function (property) {
        if (source[property] !== undefined) {
            clonedProp[property] = source[property];
        }
    });

    return clonedProp;
};

function checkName(isForeignKey, name, logger) {
    if (isForeignKey === true) {
        if (!ODATA_IDENTIFIER.test(name)) {
            logger.debug({name: name}, commonMessage.error.SWE101);
            throw new NormanError(commonMessage.error.SWE101, 400);
        }
    }
    else {
        if (!entityHelper.CHECK_NAME.test(name)) {
            logger.debug(name, commonMessage.error.SWE100);
            throw new NormanError(commonMessage.error.SWE100, 400);
        }
    }
}


/**
 * Add a new property
 *
 * @param {object} context - context.entity and context.newProperty need to be defined
 * @returns {object} context - context.property added and context.model updated
 */
exports.add = function (context) {
    var newProperty = {};

    newProperty._id = commonServer.utils.shardkey();
    newProperty.name = modelHelper.forceUniquenessForName(context.entity.properties, context.newProperty, DEFAULT_NAME);

    checkName(context.newProperty.isForeignKey, newProperty.name, context.logger);

    newProperty.label = context.newProperty.label || newProperty.name;
    newProperty.order = context.entity.properties.length + 1;

    newProperty.propertyType = context.newProperty.propertyType || 'String';

    CLONE_PROPERTIES.forEach(function (property) {
        newProperty[property] = context.newProperty[property] !== undefined ? context.newProperty[property] : PROPERTIES[property];
    });

    context.property = context.entity.properties.create(newProperty);

    context.entity.properties.push(context.property);

    eventHelper.queueCreateProperty(context, context.entity, context.property);

    return context;
};

exports.getProperty = function (context) {
    return entityHelper.getEntity(context)
        .then(function (theContext) {
            context.property = context.entity.properties.id(context.propertyId);

            if (!context.property) {
                throw new NormanError('No property found with id: ' + context.propertyId);
            }

            return theContext;
        });
};

exports.update = function (context) {
    var entity = context.model.entities.id(context.entityId);
    var oldProperty = eventHelper.cloneAndCleanProperty(context.property);

    if (context.property.name !== context.updatedProperty.name) {
        context.property.name = modelHelper.forceUniquenessForName(context.entity.properties, context.updatedProperty, DEFAULT_NAME);
        checkName(context.property.isForeignKey, context.property.name, context.logger);
    }

    if (context.property.propertyType !== context.updatedProperty.propertyType && TYPES.indexOf(context.updatedProperty.propertyType) !== -1) {
        context.property.propertyType = context.updatedProperty.propertyType;
    }

    CLONE_PROPERTIES.forEach(function (property) {
        context.property[property] = context.updatedProperty[property];
    });

    eventHelper.queueUpdateProperty(context, entity, oldProperty, context.property);

    return context;
};

/**
 * Remove a property
 *
 * @param {object} context -    context.entityId or context.entity need to be defined;
 *                              context.propertyId or context.property need to be defined
 * @returns {object} context - context.model updated
 */

function checkPropertyUsage(context) {
    var usedIn = [];
    context.model.entities.forEach(function (entity) {
        entity.properties.forEach(function (prop) {
            var inputProps = prop.calculated.inputProperties;
            if (inputProps.length) {
                for (var i = 0; i < inputProps.length; i++) {
                    if (inputProps[i].propertyId === context.propertyId) {
                        usedIn.push({
                            entity: entity.name,
                            property: prop.name
                        });
                        break;
                    }
                }
            }
        });
    });
    return usedIn;
}

exports.remove = function (context) {

    var entity = context.entity || context.model.entities.id(context.entityId);
    var property = context.property || entity.properties.id(context.propertyId);

    if (property.isKey) {
        throw new NormanError('Cannot delete a property that is a primary key ', 400);
    }

    var usage = checkPropertyUsage(context);

    if (usage.length) {
        var message = (commonMessage.error.SWE1001).replace(/\{\{PROPERTY_NAME\}\}/, usage[0].property);
        message = message.replace(/\{\{OBJECT_NAME\}\}/, usage[0].entity);
        throw new NormanError(message, 400);
    }

    // delete the propertyId if it is present as a role inside a group
    context.model.entities.id(context.entityId).groups.forEach(function (group) {
        group.roles.forEach(function (role) {
            if (role.propertyId === context.propertyId) {
                role.propertyId = null;
            }
        });
    });

    eventHelper.queueDeleteProperty(context, entity, property);

    property.remove();

    return context;
};

exports.getTypes = function () {
    return TYPES;
};

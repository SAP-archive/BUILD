'use strict';

var modelHelper = require('./modelHelper.js');
var entityHelper = require('./entityHelper.js');
var propertyHelper = require('./propertyHelper.js');
var commonServer = require('norman-common-server');
var NormanError = commonServer.NormanError;
var commonMessage = require('./../common/common.message.js');
var eventHelper = require('./eventHelper.js');

var DEFAULT_NAME = 'NavigationProperty';
var PROPERTIES = {isReadOnly: false};
var CLONE_PROPERTIES = Object.keys(PROPERTIES);

exports.isForeignKey = function (propertyName) {
    return (propertyName.indexOf && propertyName.indexOf('___FK_') === 0);
};

exports.generateFKName = function () {
    return '___FK_' + commonServer.utils.shardkey();
};

exports.addForeignKeys = function (context, navigationProperty) {
    var source, destination,
        oldContextEntity = context.entity;

    if (navigationProperty.multiplicity) {
        source = context.entity;
        destination = context.model.entities.id(navigationProperty.toEntityId);
    }
    else {
        source = context.model.entities.id(navigationProperty.toEntityId);
        destination = context.entity;
    }

    navigationProperty.referentialConstraints = [];
    context.newForeignKeys = [];

    source.properties.forEach(function (property) {
        if (property.isKey) {
            var newProperty = {
                name: exports.generateFKName(),
                isKey: false,
                isNullable: false,
                maxLength: property.maxLength,
                precision: property.precision,
                scale: property.scale,
                propertyType: property.propertyType,
                isForeignKey: true,
                isReadOnly: navigationProperty.isReadOnly
            };

            context.entity = destination;
            context.newProperty = newProperty;

            propertyHelper.add(context);
            context.newForeignKeys.push({entity: destination, property: context.property});

            navigationProperty.referentialConstraints.push({
                entityId: source._id,
                propertyRef: property._id
            });

            navigationProperty.referentialConstraints.push({
                entityId: context.entity._id,
                propertyRef: context.property._id
            });
        }
    });

    // restore previous value
    context.entity = oldContextEntity;

    return context;
};

function removeForeignKeys(context) {
    var entities = {},
        oldContextEntity = context.entity;

    entities[context.entity._id] = context.entity;
    entities[context.navigationProperty.toEntityId] = context.model.entities.id(context.navigationProperty.toEntityId);

    // remove corresponding foreign key
    context.removeForeignKeys = context.removeForeignKeys || [];
    context.navigationProperty.referentialConstraints.forEach(function (refConstraint) {
        var property = entities[refConstraint.entityId].properties.id(refConstraint.propertyRef);

        if (property && property.isForeignKey === true && property.isKey === false) {
            context.removeForeignKeys.push({
                entity: entities[refConstraint.entityId],
                property: property,
                propertyName: property.name
            });
        }
    });

    if (context.removeForeignKeys.length === 0) {
        throw new NormanError('Failed to retrieve foreign key');
    }

    context.removeForeignKeys.forEach(function (removeForeignKey) {
        context.entity = removeForeignKey.entity;
        context.property = removeForeignKey.property;
        propertyHelper.remove(context);
    });

    // restore previous value
    context.entity = oldContextEntity;

    return context;
}

exports.add = function (context) {
    var newNavigationProperty = {}, toEntity = null;

    if (context.newNavigationProperty && context.newNavigationProperty.toEntityId) {
        context.model.entities.forEach(function (entity) {
            if (entity._id === context.newNavigationProperty.toEntityId) {
                toEntity = entity;
            }
        });
    }

    if (toEntity === null) {
        throw new NormanError('No entity found with entity id: ' + context.newNavigationProperty.toEntityId, 400);
    }

    // create a blank new newNavigationProperty from user data + default values
    newNavigationProperty._id = commonServer.utils.shardkey();
    newNavigationProperty.toEntityId = toEntity._id;
    newNavigationProperty.name = modelHelper.forceUniquenessForName(context.entity.navigationProperties, context.newNavigationProperty, toEntity.nameSet || DEFAULT_NAME);
    newNavigationProperty.referentialConstraints = context.newNavigationProperty.referentialConstraints || [];

    if (context.newNavigationProperty.multiplicity === undefined) {
        context.newNavigationProperty.multiplicity = true;
    }

    newNavigationProperty.multiplicity = context.newNavigationProperty.multiplicity;

    CLONE_PROPERTIES.forEach(function (property) {
        newNavigationProperty[property] = context.newNavigationProperty[property] !== undefined ? context.newNavigationProperty[property] : PROPERTIES[property];
    });

    if (!entityHelper.CHECK_NAME.test(newNavigationProperty.name)) {
        context.logger.debug(newNavigationProperty, commonMessage.error.SWE100);
        throw new NormanError(commonMessage.error.SWE100, 400);
    }

    // update the model properties with foreign keys
    if (newNavigationProperty.referentialConstraints.length === 0) {
        exports.addForeignKeys(context, newNavigationProperty);
    }


    context.navigationProperty = context.entity.navigationProperties.create(newNavigationProperty);
    context.entity.navigationProperties.push(context.navigationProperty);

    eventHelper.queueCreateNavigation(context, context.entity, context.navigationProperty);

    return context;
};

exports.getNavigationProperty = function (context) {
    return entityHelper.getEntity(context)
        .then(function (theContext) {
            context.navigationProperty = context.entity.navigationProperties.id(context.navigationPropertyId);

            if (!context.navigationProperty) {
                throw new NormanError('No navigation property found with id: ' + context.navigationPropertyId, 404);
            }

            return theContext;
        });
};

exports.update = function (context) {
    var entity = context.model.entities.id(context.entityId);
    var oldNav = eventHelper.cloneAndCleanNavigation(context.navigationProperty);

    if (context.navigationProperty.name !== context.updatedNavigationProperty.name) {
        context.navigationProperty.name = modelHelper.forceUniquenessForName(context.entity.navigationProperties, context.updatedNavigationProperty, DEFAULT_NAME);
        if (!entityHelper.CHECK_NAME.test(context.navigationProperty.name)) {
            context.logger.debug(context.navigationProperty, commonMessage.error.SWE100);
            throw new NormanError(commonMessage.error.SWE100, 400);
        }
    }

    if (context.navigationProperty.multiplicity !== context.updatedNavigationProperty.multiplicity) {
        context.navigationProperty.multiplicity = context.updatedNavigationProperty.multiplicity;
        removeForeignKeys(context);
        exports.addForeignKeys(context, context.navigationProperty);
    }

    CLONE_PROPERTIES.forEach(function (property) {
        context.navigationProperty[property] = context.updatedNavigationProperty[property];
    });

    eventHelper.queueUpdateNavigation(context, entity, oldNav, context.navigationProperty);

    return context;
};

function checkNavigationUsage(context) {
    var usedIn = [];
    context.model.entities.forEach(function (entity) {
        entity.properties.forEach(function (prop) {
            var inputProps = prop.calculated.inputProperties;
            if (inputProps.length) {
                for (var i = 0; i < inputProps.length; i++) {
                    if (inputProps[i].navPropId === context.navigationPropertyId) {
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

    var usage = checkNavigationUsage(context);

    if (usage.length) {
        var message = (commonMessage.error.SWE1002).replace(/\{\{PROPERTY_NAME\}\}/, usage[0].property);
        message = message.replace(/\{\{OBJECT_NAME\}\}/, usage[0].entity);
        throw new NormanError(message, 400);
    }

    var entity = context.model.entities.id(context.entityId);
    eventHelper.queueDeleteNavigation(context, entity, context.navigationProperty);

    removeForeignKeys(context);

    context.navigationProperty.remove();

    return context;
};

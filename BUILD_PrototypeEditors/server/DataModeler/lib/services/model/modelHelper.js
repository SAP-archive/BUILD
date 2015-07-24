'use strict';
var q = require('q');
var lodash = require('norman-server-tp').lodash;
var entityHelper = require('./entityHelper.js');
var propertyHelper = require('./propertyHelper.js');
var navigationPropertyHelper = require('./navigationPropertyHelper.js');
var groupHelper = require('./groupHelper.js');
var prototypeHelper = require('./prototypeHelper.js');

function forceUniquenessForProperty(array, property, value, defaultValue, id) {
    value = value || defaultValue || 'new';

    if (array && array.length > 0) {
        var regExpPattern = new RegExp('^' + value + '[0-9]*$', 'i'), max = 0, lowerCaseValue = value && value.toLowerCase ? value.toLowerCase() : value;

        var unique = array.every(function (element) {
			var bUnique = false;
			if (element[property]) {
                bUnique = element._id === id || element[property].toLowerCase() !== lowerCaseValue;

			}
            return bUnique;
        });

        if (!unique) {
            array.forEach(function (element) {
                if (regExpPattern.test(element[property])) {
                    if (element[property].length > value.length) {
                        var index = element[property].substr(value.length);
                        max = Math.max(max, index);
                    }
                    else {
                        max = Math.max(max, 1);
                    }
                }
            });

            if (max > 0) {
                value = value + (max + 1);
            }
        }
    }

    return value;
}

exports.forceUniquenessForName = function (array, object, defaultName) {
    var name = object && object.name ? object.name : defaultName;
    return forceUniquenessForProperty(array, 'name', name, defaultName, object._id);
};

exports.forceUniquenessForNameSet = function (array, object, defaultNameSet) {
    var nameSet = object && object.nameSet ? object.nameSet : defaultNameSet;
    return forceUniquenessForProperty(array, 'nameSet', nameSet, defaultNameSet, object._id);
};

function incrementNavigationProperty(context) {
    context.updatedModel.entities.forEach(function (entity) {
        context.entity = context.entityNameMap[entity.name];
        entity.navigationProperties.forEach(function (navigationProperty) {
            if (context.entityNameMap[navigationProperty.toEntityId]) {
                context.newNavigationProperty = {
                    name: navigationProperty.name,
                    isReadOnly: navigationProperty.isReadOnly,
                    multiplicity: navigationProperty.multiplicity,
                    toEntityId: context.entityNameMap[navigationProperty.toEntityId]._id,
                    referentialConstraints: []
                };

                if (navigationProperty.referentialConstraints.length === 0) {
                    navigationPropertyHelper.addForeignKeys(context, context.newNavigationProperty);
                }
                else {
                    var changedName = {};
                    navigationProperty.referentialConstraints.forEach(function (referentialConstraint) {
                        var entityRef = context.entityNameMap[referentialConstraint.entityId];
                        if (entityRef.name !== referentialConstraint.entityId) {
                            changedName[referentialConstraint.entityId] = entityRef;
                        }
                    });

                    var propertyRef = {}, propertyRefs = [];
                    navigationProperty.referentialConstraints.forEach(function (referentialConstraint) {
                        var entityRef = context.entityNameMap[referentialConstraint.entityId],
                            property = entityRef.properties[lodash.findIndex(entityRef.properties, {name: referentialConstraint.propertyRef})];

                        if (entityRef === undefined) {
                            throw new Error('no entity found: ' + referentialConstraint.entityId);
                        }

                        if (property !== undefined) {
                            propertyRef[referentialConstraint.propertyRef] = property;
                            propertyRefs.push(property);
                        }
                    });

                    navigationProperty.referentialConstraints.forEach(function (referentialConstraint) {
                        var entityRef = context.entityNameMap[referentialConstraint.entityId],
                            property = propertyRef[referentialConstraint.propertyRef];

                        if (property === undefined) {
                            property = {
                                name: referentialConstraint.propertyRef,
                                isKey: false,
                                isNullable: false,
                                maxLength: propertyRefs[0].maxLength,
                                precision: propertyRefs[0].precision,
                                scale: propertyRefs[0].scale,
                                propertyType: propertyRefs[0].propertyType,
                                isForeignKey: true
                            };

                            var backupEntity = context.entity;
                            var backupNewProperty = context.newProperty;
                            context.entity = entityRef;
                            context.newProperty = property;

                            propertyHelper.add(context);
                            property = context.property;

                            context.entity = backupEntity;
                            context.newProperty = backupNewProperty;
                        }

                        Object.keys(changedName).some(function (key) {
                            if (property.name.indexOf(key) === 0) {
                                var propertyName = property.name;
                                property.name = property.name.replace(key, changedName[key].name);
                                context.propertyNameMap = context.propertyNameMap || [];
                                context.propertyNameMap[referentialConstraint.entityId] = context.propertyNameMap[referentialConstraint.entityId] || {};
                                context.propertyNameMap[referentialConstraint.entityId][propertyName] = property.name;

                                return true;
                            }
                        });

                        context.newNavigationProperty.referentialConstraints.push({
                            entityId: entityRef._id,
                            propertyRef: property._id
                        });

                        if (!property.isKey) {
                            property.isForeignKey = true;
                        }
                    });
                }


                navigationPropertyHelper.add(context);
            }
            else {
                context.logger.debug('Entity not found - enity id: ' + navigationProperty.toEntityId + ' entityMap: ' + JSON.stringify(context.entityNameMap));
            }
        });
    });
}

function getGroup(entity, group) {
    var newGroup = { type: group.type, roles: []};
    group.roles.forEach(function (role) {
        var prop = lodash.find(entity.properties, {name: role.path});
        if (prop) {
             newGroup.roles.push({id: role.id, path: role.path, propertyId: prop._id.toString()});
        }
        else {
            newGroup.roles.push({id: role.id, path: role.path});
        }
    });

    return newGroup;
}

exports.incrementModel = function (context) {

    var oResult;

    if (context.updatedModel) {
        context.logger.debug('increment Model - updateModel: ' + JSON.stringify(context.updatedModel));

        context.updatedModel.entities.forEach(function (entity) {
            context.newEntity = entity;
            entityHelper.add(context);

            if (entity.groups) {
                entity.groups.forEach(function (group) {
                    context.newGroup = getGroup(context.entity, group);
                    groupHelper.add(context);
                });
            }
        });

        incrementNavigationProperty(context);

        oResult = exports.save(context);
    }
    else {
        oResult = q(context);
    }

    return oResult;
};

exports.update = function (context) {
    if (!context.updatedModel) {
        throw new Error('updatedModel is a mandatory parameter');
    }

    return exports.getModel(context)
        .then(function (theContext) {
            if (theContext.updatedModel.layout !== theContext.model.layout) {
                theContext.model.layout = theContext.updatedModel.layout;
            }

            theContext.updatedModel.entities.forEach(function (entity) {
                var source = theContext.model.entities[lodash.findIndex(theContext.model.entities, {_id: entity._id})];
                if (source) {
                    source.position = entity.position;
                }
            });

            theContext.logger.debug('Update model - new Model: ' + JSON.stringify(theContext.updatedModel));

            return prototypeHelper.updateModelMetadata(theContext);
        });
};

exports.getModel = function (context) {
    return prototypeHelper.getModel(context);
};

exports.save = function (context) {
    return prototypeHelper.updateModelMetadata(context);
};



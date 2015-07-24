'use strict';
var entityHelper = require('./entityHelper.js');
var lodash = require('norman-server-tp').lodash;
var commonServer = require('norman-common-server');
var NormanError = commonServer.NormanError;

var CLONE_ENTITY = ['name', 'nameSet', 'media', 'readable', 'pageable', 'addressable', 'semantics', 'label', 'tags'];
var CLONE_PROPERTY = ['isNullable', 'isETag', 'default', 'maxLength', 'precision', 'scale', 'readable', 'sortable', 'filterable', 'semantics', 'unit', 'field-control', 'label', 'tags'];
var CLONE_NAVIGATION = ['name', 'multiplicity'];

function createProperty(catalog, catalogProperty, entity, name) {
    if (catalogProperty.propertyType.indexOf('Edm.') === 0) {
        var newProperty = {
            isKey: false,
            propertyType: catalogProperty.propertyType.replace('Edm.', ''),
            order: entity.properties.length + 1
        };

        newProperty.name = name ? name + catalogProperty.name : catalogProperty.name;

        CLONE_PROPERTY.forEach(function (key) {
            newProperty[key] = catalogProperty[key];
        });
        // calculate isReadOnly
        newProperty.isReadOnly = !(catalogProperty.creatable || catalogProperty.updatable);

        if (newProperty.semantics && (!newProperty.tags || newProperty.tags.length === 0)) {
            newProperty.tags = [newProperty.semantics];
        }

        if (newProperty.name.toLowerCase() !== entityHelper.PROPERTY_ID.name.toLowerCase()) {
            entity.properties.push(newProperty);
        }
    }
    else {
        var complexType = lodash.find(catalog.complexTypes, {name: catalogProperty.propertyType.substr(catalogProperty.propertyType.indexOf('.') + 1)});
        complexType.properties.forEach(function (complexTypeProperty) {
            createProperty(catalog, complexTypeProperty, entity, catalogProperty.name);
        });
    }
}

function createGroup(catalogGroup, entity) {
    var group = {type: catalogGroup.type, roles: []};

    catalogGroup.roles.forEach(function (catalogRole) {
        group.roles.push({id: catalogRole.id, path: catalogRole.path});
    });

    entity.groups = entity.groups || [];
    entity.groups.push(group);
}

function createEntityFromCatalogEntity(catalog, catalogEntity, bAddNavigationProperties) {
    var entity = {
        originalEntity: catalogEntity._id,
        properties: [entityHelper.PROPERTY_ID],
        navigationProperties: []
    };

    CLONE_ENTITY.forEach(function (key) {
        entity[key] = catalogEntity[key];
    });
    // calculate the isReadOnly property
    entity.isReadOnly = !(catalogEntity.creatable || catalogEntity.deletable || catalogEntity.updatable);

    catalogEntity.properties.forEach(function (catalogProperty) {
        createProperty(catalog, catalogProperty, entity);
    });

    catalogEntity.groups.forEach(function (catalogGroup) {
        createGroup(catalogGroup, entity);
    });

    if (bAddNavigationProperties) {
        catalogEntity.navigationProperties.forEach(function (catalogNavigationProperty) {
            var newNavigationProperty = {
                toEntityId: catalogNavigationProperty.toEntity,
                referentialConstraints: []
            };

            CLONE_NAVIGATION.forEach(function (key) {
                newNavigationProperty[key] = catalogNavigationProperty[key];
            });
            newNavigationProperty.isReadOnly = !(catalogNavigationProperty.creatable || catalogNavigationProperty.deletable || catalogNavigationProperty.updatable);

            entity.navigationProperties.push(newNavigationProperty);
        });
    }

    return entity;
}

function createModelFromCatalog(catalog, bAddNavigationProperties) {
    var model = {
        catalog: catalog._id.toString(),
        entities: []
    };

    if (catalog.entities) {
        catalog.entities.forEach(function (catalogEntity) {
            model.entities.push(createEntityFromCatalogEntity(catalog, catalogEntity, bAddNavigationProperties));
        });
    }

    return model;
}

exports.getCatalog = function (context) {
    return context.businessCatalog.getCatalog(context.catalog)
        .then(function (catalog) {
            context.model = createModelFromCatalog(catalog, true);
            context.model.projectId = context.projectId;

            return context;
        });
};

exports.getEntity = function (context) {
    return context.businessCatalog.getCatalog(context.catalog)
        .then(function (catalog) {
            var entity = lodash.find(catalog.entities, function (ent) {
                return ent._id.toString() === context.catalogEntityId;
            });

            context.model = {entities: []};
            context.model.entities.push(createEntityFromCatalogEntity(catalog, entity));

            return context;
        });
};

function createEntityAndNearByEntitiesFromCatalog(catalog, originalEntity) {
    var newEntity = createEntityFromCatalogEntity(catalog, originalEntity, true),
        resultEntities = [],
        resultEntitiesByName = {},
        entitiesToInspect = [];

    entitiesToInspect.push(newEntity);
    resultEntities.push(newEntity);
    resultEntitiesByName[newEntity.name] = newEntity;

    var process = function (nav) {

        // if the target entity is not already added to resultEntities
        if (nav.toEntityId && !resultEntitiesByName[nav.toEntityId]) {
            // let's retrieve this entity
            var targetEntity;
            catalog.entities.some(function (entity) {
                if (entity.name === nav.toEntityId) {
                    targetEntity = entity;
                    return true;
                }
            });

            if (targetEntity) {
                newEntity = createEntityFromCatalogEntity(catalog, targetEntity, true);
                resultEntities.push(newEntity);
                resultEntitiesByName[newEntity.name] = newEntity;
                entitiesToInspect.push(newEntity);
            }
        }
    };

    while (entitiesToInspect.length !== 0) {

        // for every navigation properties of the inspected entity
        entitiesToInspect[0].navigationProperties.forEach(process);

        // we are done inspecting current entity so let's remove it
        entitiesToInspect.splice(0, 1);
    }

    return resultEntities;
}

exports.getEntityWithNavigation = function (context) {
    return context.businessCatalog.getCatalog(context.catalog)
        .then(function (catalog) {
            var theEntity;
            context.logger.debug('get entity with navgation - catalog: ' + JSON.stringify(catalog));
            catalog.entities.forEach(function (entity) {
                if (entity._id.toString() === context.catalogEntityId) {
                    theEntity = entity;
                }
            });

            if (!theEntity) {
                throw new NormanError('Original Entity ( ' + context.catalogEntityId + ' ) not found', 404);
            }

            context.model = {};
            context.model.entities = createEntityAndNearByEntitiesFromCatalog(catalog, theEntity);

            return context;
        });
};

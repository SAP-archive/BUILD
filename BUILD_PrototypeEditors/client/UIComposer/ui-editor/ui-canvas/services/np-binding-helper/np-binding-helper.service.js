'use strict';
var _ = require('norman-client-tp').lodash;

/**
 * The npBindingHelper service provides helpers on data binding.
 * @module npBindingHelper
 */

var npBindingHelper = ['$rootScope', '$resource', '$q', '$timeout', 'dm.Model', 'npConstants', 'npPageMetadataHelper', 'npUiCatalog',
    function ($rootScope, $resource, $q, $timeout, dataModelService, npConstants, pageMdHelper, npUiCatalog) {

        var that = {};

        var _modelTypesMap = {
            String: 'string',
            Decimal: 'float',
            Boolean: 'boolean',
            DateTime: 'object',
            Binary: undefined,
            Byte: 'int',
            Double: 'float',
            Single: 'float',
            Guid: 'string',
            Int16: 'int',
            Int32: 'int',
            Int64: 'int',
            SByte: 'int',
            Time: 'object',
            DateTimeOffset: 'object'
        };

        var _typeExtraCompatibilityMap = {
            string: {float: true, int: true, object: true},
            float: {int: true}
        };

        var oDataUrl = '/api/projects/',
            defaultParams = {},
            option = {},
            actions = {
                getData: {
                    method: 'GET',
                    url: oDataUrl + ':projectId/prototype/artifact/models/:nameSet.json',
                    params: {
                        projectId: '@projectId',
                        nameSet: '@nameSet'
                    },
                    isArray: true
                }
            };
        var mockDataAPI = $resource(oDataUrl, defaultParams, actions, option);

        var onSuccessModelLoaded = function (model) {
            that.dataModel = model;
            // TODO: use promises instead of broadcast
            $rootScope.$broadcast('bindinghelper-model-loaded', model);
        };

        var getModel = function (projectId, errorCallback) {
            if (!projectId || (that.dataModel && that.dataModel.projectId === projectId)) {
                return that.dataModel;
            }
            that.projectId = projectId;
            if (dataModelService && npConstants.localFeatureToggle.dataModeler) {
                var params = {
                    id: projectId
                };
                dataModelService.get(params, onSuccessModelLoaded, errorCallback);
            }
        };

        var queryModel = function (projectId) {
            return dataModelService.get({id: projectId}).$promise;
        };

        var initEntities = function (projectId) {
            that.dataModel = undefined;
            that.entityNameSetMap = undefined;
            that.entityNameMap = undefined;
            that.entityIdMap = undefined;
            that.propertyIdMap = undefined;
            that.mockDataCache = {};
            that.groupPathsCache = {};
            that.contextPropertyPathsCache = {};
            that.entityContextCache = {};
            that.propertyPathsCache = {};
            getModel(projectId);
            that.entityContextCache = undefined;
            that.propertyPathsCache = undefined;
            that.groupPathsCache = undefined;
        };

        var getAllSubPaths = function (entity, entityName, currentPath, takeAll, levelCount, pathArray) {

            var result = [];
            var takeAllNext;

            if (!levelCount) {
                levelCount = 1;
            }
            if (!pathArray) {
                pathArray = [];
            }

            if (levelCount <= 2 && entity && entity.navigationProperties) {
                entity.navigationProperties.forEach(function (navProp) {
                    var nextEnt = _getEntityFromId(navProp.toEntityId);

                    var path;

                    if (currentPath) {
                        path = currentPath + '/' + navProp.name;
                    }
                    else {
                        path = navProp.name;
                    }

                    if (nextEnt.name === entityName || takeAll) {
                        takeAllNext = true;

                        if (navProp.multiplicity) {
                            result.push({
                                path: path,
                                name: path,
                                binding: {
                                    isRelative: true,
                                    paths: pathArray.concat([
                                        {
                                            entityId: entity._id,
                                            propertyId: navProp._id
                                        }
                                    ])
                                }
                            });
                        }

                    }

                    if (!navProp.multiplicity) {
                        var newPathArray = pathArray.concat([
                            {
                                entityId: entity._id,
                                propertyId: navProp._id
                            }
                        ]);
                        result = result.concat(getAllSubPaths(nextEnt, entityName, path, takeAllNext || takeAll, levelCount + 1, newPathArray));
                    }
                });
            }

            return result;
        };

        var getPathsCompatibleWithControlProperty = function (controlMd, contextEntityId, editableProperty, entityId, propertyId) {
            var result;
            if (propertyId && editableProperty) {
                var propType = npUiCatalog.getPropertyType(editableProperty.name, controlMd.catalogControlName, controlMd.catalogId);
                var pathsToProperty = getPathsCompatibleWithProperty(contextEntityId, entityId, propertyId);
                if (isTypeCompatibleWithProperty(entityId, propertyId, propType) && !_.isEmpty(pathsToProperty)) {
                    result = pathsToProperty;
                }
            }
            return result;
        };

        /**
         * Get possible paths to reach a property from a given context entity
         * @param contextEntity: the context entity from which we are starting
         * @param entityId: id of the wanted property's entity
         * @param propertyId: id of the wanted property
         * @param currentPath: Only used for recursion
         * @param pathArray: Only used for recursion
         * @param levelCount: Only used for recursion
         * @returns All compatible paths that can reach the given entity
         */
        var getPathsCompatibleWithProperty = function (contextEntityId, entityId, propertyId, isSmartApp, currentPath, pathArray, levelCount) {
            if (!currentPath) {
                currentPath = '';
            }
            if (!levelCount) {
                levelCount = 1;
            }
            if (!pathArray) {
                pathArray = [];
            }
            isSmartApp = !!isSmartApp;

            var result = [];
            var contextEntity = _getEntityFromId(contextEntityId);

            if (contextEntity && levelCount <= 2) {
                if (entityId === contextEntity._id) {
                    contextEntity.properties.forEach(function (property) {
                        if (property._id === propertyId) {
                            result.push({
                                path: currentPath + property.name,
                                name: currentPath + property.name,
                                binding: {
                                    isRelative: true,
                                    paths: pathArray.concat([
                                        {
                                            entityId: contextEntity._id,
                                            propertyId: property._id
                                        }
                                    ])
                                }
                            });
                        }
                    });
                }

                if (!isSmartApp) {
                    contextEntity.navigationProperties.forEach(function (navProp) {
                        if (!navProp.multiplicity) {
                            var toEntity = navProp.toEntityId;
                            var newPath = currentPath + navProp.name + '/';
                            var newPathArray = pathArray.concat([
                                {
                                    entityId: contextEntity._id,
                                    propertyId: navProp._id
                                }
                            ]);
                            result = result.concat(getPathsCompatibleWithProperty(toEntity, entityId, propertyId, isSmartApp, newPath, newPathArray, levelCount + 1));
                        }
                    });
                }
            }

            return result;
        };

        /**
         * Get possible paths to reach an entity from a given context
         * @param binding: the binding context that will allow to deduce on which entity we are
         * @param entityName: name of the entity to be reached
         * @returns All compatible paths that can reach the given entity
         */
        var getPathsCompatibleWithEntity = function (binding, entityName) {

            var entity;

            if (binding) {
                entity = _getEntityFromId(binding.paths[0].entityId);

                return getAllSubPaths(entity, entityName, '');
            }
            else {
                entity = _getEntityFromName(entityName);
                if (entity) {
                    return [{
                        path: '/' + entity.nameSet,
                        name: '/' + entity.nameSet,
                        binding: {
                            isRelative: false,
                            paths: [
                                {
                                    entityId: entity._id,
                                    propertyId: undefined
                                }
                            ]
                        }
                    }];
                }
                return [];
            }
        };

        var getPathsCompatibleWithParentGroup = function (controlMd, entityName, mainEntity) {
            var compatiblePaths;
            var parentCtrl = controlMd.getParentMd();
            if (parentCtrl) {
                var parentGroup = pageMdHelper.getContainingGroupMd(controlMd);
                if (parentGroup && npUiCatalog.isMultipleAggregation(parentGroup.groupId, parentCtrl.catalogControlName, parentCtrl.catalogId)) {
                    var binding = getBindingContextFromMd(parentCtrl, mainEntity);
                    compatiblePaths = getPathsCompatibleWithEntity(binding, entityName);
                }
            }
            return compatiblePaths;
        };

        var hasEntities = function () {
            // Indicate if we have some entities in the data model
            return (that.dataModel && that.dataModel.entities && that.dataModel.entities.length > 0);
        };

        var getAllEntities = function () {
            var entities;
            if (hasEntities()) {
                entities = _.map(that.dataModel.entities, function (entity) {
                    return {
                        _id: entity._id,
                        name: entity.name
                    };
                });
            }

            return entities || [];
        };

        var getEntitiesFromIds = function (entityIds) {
            return _.filter(getAllEntities(), function (entity) {
                return _.contains(entityIds, entity._id);
            });
        };

        var _getEntityFromNameSet = function (nameSet) {
            var result;
            if (!that.entityNameSetMap) {
                that.entityNameSetMap = [];
                _.forEach(that.dataModel.entities, function (entity) {
                    that.entityNameSetMap[entity.nameSet] = entity;
                });
            }
            result = that.entityNameSetMap[nameSet];
            return result;
        };

        var _getEntityFromName = function (name) {
            var result;
            if (!that.entityNameMap) {
                that.entityNameMap = [];
                _.forEach(that.dataModel.entities, function (entity) {
                    that.entityNameMap[entity.name] = entity;
                });
            }
            result = that.entityNameMap[name];
            return result;
        };

        var _getEntityFromId = function (id) {
            var result;
            if (_.isEmpty(that.entityIdMap)) {
                that.entityIdMap = [];
                _.forEach(that.dataModel.entities, function (entity) {
                    that.entityIdMap[entity._id] = entity;
                });
            }
            result = that.entityIdMap[id];
            return result;
        };

        var _getEntityPropertyMap = function (entityId) {
            that.propertyIdMap = that.propertyIdMap || {};
            var entityPropertyMap = that.propertyIdMap[entityId];
            if (!entityPropertyMap) {
                var entity = _getEntityFromId(entityId);
                entityPropertyMap = {};
                _.forEach(entity.navigationProperties, function (navProperty) {
                    entityPropertyMap[navProperty._id] = {property: navProperty, isNavProperty: true};
                });
                _.forEach(entity.properties, function (property) {
                    entityPropertyMap[property._id] = {property: property, isNavProperty: false};
                });
                that.propertyIdMap[entityId] = entityPropertyMap;
            }
            return entityPropertyMap;
        };

        var _getPropertyFromId = function (entityId, propertyId) {
            var entityPropertyMap = _getEntityPropertyMap(entityId);
            var propertyCache = entityPropertyMap[propertyId];
            return propertyCache ? propertyCache.property : null;
        };

        var _isNavigationProperty = function (entityId, propertyId) {
            var entityPropertyMap = _getEntityPropertyMap(entityId);
            var propertyCache = entityPropertyMap[propertyId];
            return propertyCache ? propertyCache.isNavProperty : null;
        };

        var _getNavigationPropertyFromName = function (entity, navPropName) {
            if (!entity.navPropertyMap) {
                entity.navPropertyMap = [];
                _.forEach(entity.navigationProperties, function (navProperty) {
                    entity.navPropertyMap[navProperty.name] = navProperty;
                });
            }
            return entity.navPropertyMap[navPropName];
        };

        var _getEntityFromContext = function (contextPath) {

            if (that.entityContextCache && that.entityContextCache[contextPath]) {
                return that.entityContextCache[contextPath];
            }
            var path = contextPath.split('/');
            var entitySetPath = path[1];
            var index = entitySetPath.indexOf('(');
            if (index > -1) {
                entitySetPath = entitySetPath.substring(0, index);
            }
            var entity = _getEntityFromNameSet(entitySetPath);
            var met;

            if (entity) {
                for (var i = 2; i < path.length; i++) {
                    met = null;
                    entitySetPath = path[i];
                    if (entity.navigationProperties) {
                        met = _getNavigationPropertyFromName(entity, entitySetPath);
                    }
                    if (met) {
                        entity = _getEntityFromId(met.toEntityId);
                    }
                    if (!met || !entity) {
                        entity = undefined;
                        break;
                    }
                }
            }

            if (!that.entityContextCache) {
                that.entityContextCache = {};
            }

            that.entityContextCache[contextPath] = entity;
            return entity;
        };

        var _normalizeContextPath = function (contextPath) {
            if (contextPath) {
                contextPath = contextPath.replace(/\(.*\)/g, '');
            }
            return contextPath;
        };

        // FIXME this is never used in this file, can we delete it?
        // var getEntity = function (entityId) {
        //     return _getEntityFromId(entityId);
        // };

        // Get group possible paths

        var getPath = function (bindingMd) {
            if (!hasEntities() || _.isEmpty(bindingMd) || _.isEmpty(bindingMd.paths)) {
                return undefined;
            }

            var bindingPaths = [], bindingPath, entityId;
            entityId = bindingMd.paths[0].entityId;
            var entity = _getEntityFromId(entityId);
            bindingMd.paths.forEach(function (bindingSubPath, index) {
                if (index !== 0 || bindingSubPath.propertyId) {
                    var property = _getPropertyFromId(bindingSubPath.entityId, bindingSubPath.propertyId);
                    bindingPaths.push(property.name);
                }
            });
            bindingPath = bindingPaths.join('/');

            if (bindingMd.isRelative === false) {
                bindingPath = '/' + entity.nameSet + (bindingPath ? ('/' + bindingPath) : (''));
            }

            return bindingPath;
        };

        /**
         * Get possible paths for a group binding
         * @param bindingContext: the bindingContext deduced from the parents bindings that will allow to deduce on which entity we are
         * @returns {*}
         */
        var getGroupPaths = function (bindingContext) {
            // Cannot bind single aggregations
            if (!hasEntities()) {
                return undefined;
            }
            // Default value = true
            var pathsInfo, isMultiple = true;

            if (!that.groupPathsCache) {
                that.groupPathsCache = {};
            }

            var entity = bindingContext ? getEntityFromBinding(bindingContext) : null;
            var cacheKey = entity ? entity._id : '__noContext__';
            if (that.groupPathsCache[cacheKey] && that.groupPathsCache[cacheKey][isMultiple]) {
                pathsInfo = that.groupPathsCache[cacheKey][isMultiple];
            }
            else {
                if (entity) {
                    var navProps = [];

                    if (entity.navigationProperties) {
                        for (var i = 0; i < entity.navigationProperties.length; i++) {
                            if (entity.navigationProperties[i].multiplicity) {
                                // Add only multiple navigation properties
                                // TODO: add any non multiple navigation properties but must end with a multiple navigation property
                                navProps.push(entity.navigationProperties[i]);
                            }
                        }
                    }

                    pathsInfo = _.map(navProps, function (navProp) {
                        var path = navProp.name;
                        var pathInfo = {
                            path: path,
                            name: path,
                            binding: {
                                isRelative: true,
                                paths: [
                                    {
                                        entityId: entity._id,
                                        propertyId: navProp._id
                                    }
                                ]
                            }
                        };
                        return pathInfo;
                    });
                }
                else if (!entity && that.dataModel && that.dataModel.entities) {
                    // No context. Propose absolute bindings on entity sets.
                    pathsInfo = _.map(that.dataModel.entities, function (dmEntity) {
                        var path = '/' + dmEntity.nameSet;
                        var pathInfo = {
                            path: path,
                            name: path,
                            binding: {
                                isRelative: false,
                                paths: [
                                    {
                                        entityId: dmEntity._id,
                                        propertyId: undefined
                                    }
                                ]
                            }
                        };
                        return pathInfo;
                    });
                }
                if (!that.groupPathsCache[cacheKey]) {
                    that.groupPathsCache[cacheKey] = {};
                }

                that.groupPathsCache[cacheKey][isMultiple] = pathsInfo;
            }
            return pathsInfo;
        };

        /**
         * Get possible paths for a context property binding
         * The possible values are the multiple navigation properties of the entity deduced from the path
         * @param contextPath: the context path that will allow to deduce on which entity we are
         * @param multiplicity: multiplicity of the required properties
         * @returns {*}
         */
        var getContextPropertyPaths = function (bindingContext, multiplicity) {
            var pathsInfo;

            if (!hasEntities()) {
                return undefined;
            }

            var entity = bindingContext ? getEntityFromBinding(bindingContext) : null;
            var cacheKey = entity ? entity._id : '__noContext__';
            multiplicity = !!multiplicity;

            if (that.contextPropertyPathsCache && that.contextPropertyPathsCache[cacheKey] && that.contextPropertyPathsCache[cacheKey][multiplicity]) {
                pathsInfo = that.contextPropertyPathsCache[cacheKey][multiplicity];
            }
            else {
                if (entity) {
                    pathsInfo = _.chain(entity.navigationProperties)
                        .filter(function (navProp) {
                            return navProp.multiplicity === multiplicity;
                        })
                        .map(function (navProp) {
                            var path = navProp.name;
                            var pathInfo = {
                                path: path,
                                name: path,
                                isEntity: true,
                                binding: {
                                    isRelative: true,
                                    paths: [
                                        {
                                            entityId: entity._id,
                                            propertyId: navProp._id
                                        }
                                    ]
                                }
                            };
                            return pathInfo;
                        })
                        .value();
                }
                that.contextPropertyPathsCache = that.contextPropertyPathsCache || {};
                that.contextPropertyPathsCache[cacheKey] = that.contextPropertyPathsCache[cacheKey] || {};
                that.contextPropertyPathsCache[cacheKey][multiplicity] = that.contextPropertyPathsCache[cacheKey][multiplicity] || {};

                that.contextPropertyPathsCache[cacheKey][multiplicity] = pathsInfo;
            }
            return pathsInfo;
        };

        // Get property possible paths

        var _areTypesCompatible = function (ctrlPropertyType, modelType) {
            var typesAreCompatible = false;
            var modelAbstractType = _modelTypesMap[modelType];
            if (modelAbstractType) {
                if (ctrlPropertyType === modelAbstractType) {
                    typesAreCompatible = true;
                }
                else {
                    var extraCompatibleTypes = _typeExtraCompatibilityMap[ctrlPropertyType];
                    if (extraCompatibleTypes) {
                        typesAreCompatible = extraCompatibleTypes[modelAbstractType];
                    }
                }
            }
            return typesAreCompatible;
        };

        var _filterPropertyFn = function (ctrlPropertyType) {
            return function (property) {
                var keep = false;
                if (!property.isForeignKey) {
                    keep = _areTypesCompatible(ctrlPropertyType, property.propertyType);
                }
                return keep;
            };
        };

        var _propertyToPathInfoFn = function (entityId) {
            return function (property) {
                var path = property.name;
                var entityName = _getEntityFromId(entityId).name;
                return {
                    path: path,
                    name: path,
                    group: entityName,
                    entityName: entityName,
                    isCurrentEntity: true,
                    binding: {
                        isRelative: true,
                        paths: [
                            {
                                entityId: entityId,
                                propertyId: property ? property._id : undefined
                            }
                        ]
                    }
                };
            };
        };

        var _navPropPropertyToPathInfoFn = function (fromEntityId, navProp) {
            return function (property) {
                var path = navProp.name + '/' + property.name;
                var entityName = _getEntityFromId(navProp.toEntityId).name;
                return {
                    path: path,
                    name: property.name,
                    group: entityName + ' (' + navProp.name + ')',
                    entityName: entityName,
                    binding: {
                        isRelative: true,
                        paths: [
                            {
                                entityId: fromEntityId,
                                propertyId: navProp ? navProp._id : undefined
                            },
                            {
                                entityId: navProp.toEntityId,
                                propertyId: property ? property._id : undefined
                            }
                        ]
                    }
                };
            };
        };

        var isTypeCompatibleWithProperty = function (entityId, propertyId, controlPropertyType) {
            var entity = _getEntityFromId(entityId);
            if (entity) {
                var property = _.find(entity.properties, {
                    _id: propertyId
                });
                if (property) {
                    return _areTypesCompatible(controlPropertyType, property.propertyType);
                }
            }
            return false;
        };

        /**
         * Get possible paths to bind a control property
         * @param ctrlProperty: the control property to bind
         * @param bindingContext: the context path that allows to deduce the contextual entity
         * @returns {*}
         */
        var getPropertyPaths = function (ctrlProperty, bindingContext, isSmartApp) {
            var pathsInfo;

            if (!hasEntities()) {
                return undefined;
            }

            var entity = bindingContext ? getEntityFromBinding(bindingContext) : null;
            if (entity) {
                var cacheKey = entity._id;
                if (that.propertyPathsCache && that.propertyPathsCache[cacheKey] && that.propertyPathsCache[cacheKey][ctrlProperty.type]) {
                    pathsInfo = that.propertyPathsCache[cacheKey][ctrlProperty.type];
                }
                else {
                    pathsInfo = _(entity.properties).filter(_filterPropertyFn(ctrlProperty.type)).map(_propertyToPathInfoFn(entity._id)).value();

                    var toEntity;
                    if (entity.navigationProperties && !isSmartApp) {
                        entity.navigationProperties.forEach(function (navProp) {
                            if (!navProp.multiplicity) {
                                toEntity = _getEntityFromId(navProp.toEntityId);
                                if (toEntity) {
                                    // Lazy evaluation
                                    var navPropPathsInfo = _(toEntity.properties).filter(_filterPropertyFn(ctrlProperty.type)).map(_navPropPropertyToPathInfoFn(entity._id, navProp)).value();
                                    pathsInfo = pathsInfo.concat(navPropPathsInfo);
                                }
                            }
                        });
                    }
                    if (!that.propertyPathsCache) {
                        that.propertyPathsCache = {};
                    }
                    if (!that.propertyPathsCache[cacheKey]) {
                        that.propertyPathsCache[cacheKey] = {};
                    }
                    that.propertyPathsCache[cacheKey][ctrlProperty.type] = pathsInfo;
                }
            }
            return pathsInfo;
        };

        var concatenatePaths = function (contextPath, path) {
            var concatenatedPath = contextPath;
            if (path && path.length > 0) {
                if (path[0] === '/') {
                    concatenatedPath = path;
                }
                else {
                    concatenatedPath = contextPath ? contextPath + '/' + path : path;
                }
            }
            return concatenatedPath;
        };

        var isAbsolutePath = function (path) {
            return (path && path.length > 0) ? (path[0] === '/') : false;
        };

        /**
         * Get all the expand paths from a binding context path and a list of paths relative to this context
         * This can be used to expand a list binding (load some sub entities of the main entity of the list threw navigation properties)
         * @param bindingContextPath
         * @param paths paths relative to bindingContextPath
         * @returns an array of the expand paths
         */
        var getExpandPaths = function (bindingContextPath, paths) {
            var expandPaths = [];
            var expandPathsMap = {};

            if (hasEntities()) {
                bindingContextPath = _normalizeContextPath(bindingContextPath);
                var entity = _getEntityFromContext(bindingContextPath);
                var propName, navProperty, i;
                if (entity) {
                    _.forEach(paths, function (path) {
                        var expandPath = null;
                        var currentEntity = entity;
                        var pathParts = path.split('/');
                        for (i = 0; i < pathParts.length; i++) {
                            navProperty = null;
                            propName = pathParts[i];
                            if (currentEntity.navigationProperties) {
                                navProperty = _getNavigationPropertyFromName(currentEntity, propName);
                            }
                            if (navProperty) {
                                expandPath = expandPath ? expandPath + '/' + propName : propName;
                                currentEntity = _getEntityFromId(navProperty.toEntityId);
                            }
                            if (!navProperty || !currentEntity) {
                                currentEntity = undefined;
                                break;
                            }
                        }

                        if (expandPath) {
                            expandPathsMap[expandPath] = expandPath;
                        }
                    });
                }

                expandPaths = _.keys(expandPathsMap);
            }
            return expandPaths;

        };

        var getEntitiesAndProperties = function () {
            return that.dataModel ? that.dataModel.entities : undefined;
        };

        // Expand Paths

        var _getExpandPath = function (parentPath, binding) {
            var bindingPaths = [], bindingPath;
            // Take only relative paths (sub paths of the ancestor path)
            if (binding && binding.isRelative) {
                if (binding.paths) {
                    _.forEach(binding.paths, function (bindingSubPath) {
                        if (_isNavigationProperty(bindingSubPath.entityId, bindingSubPath.propertyId)) {
                            var navProperty = _getPropertyFromId(bindingSubPath.entityId, bindingSubPath.propertyId);
                            bindingPaths.push(navProperty.name);
                        }
                        else {
                            // break;
                            return false;
                        }
                    });
                    bindingPath = bindingPaths.join('/');
                }
            }

            if (parentPath && bindingPath) {
                bindingPath = parentPath + '/' + bindingPath;
            }

            return bindingPath;
        };

        var _fillExpandPathsFromMd = function (controlMd, pageMd, parentPath, expandPathsMap) {
            _.forEach(controlMd.properties, function (property) {
                var expandPath = _getExpandPath(parentPath, property.binding);
                if (expandPath) {
                    expandPathsMap[expandPath] = expandPath;
                }
            });
            _.forEach(controlMd.groups, function (group) {
                var expandPath = _getExpandPath(parentPath, group.binding);
                if (expandPath) {
                    expandPathsMap[expandPath] = expandPath;
                }
                var groupParentPath = expandPath || parentPath;
                _.forEach(group.children, function (controlId) {
                    var childMd = _.find(pageMd.controls, {
                        controlId: controlId
                    });

                    _fillExpandPathsFromMd(childMd, pageMd, groupParentPath, expandPathsMap);
                });
            });
        };

        /**
         * Get a string containing all the expand paths from the metadata of a list binding's template and a page metadata
         * This can be used to expand a list binding (load some sub entities of the main entity of the list through navigation properties)
         * @param controlMd: the metadata of the template to
         * @param pageMd
         * @returns a string with the expand paths separated by a comma (that is needed by an OData model)
         */
        var getExpandPathsFromMd = function (controlMd, pageMd) {
            var expandPaths;
            var expandPathsMap = {};
            _fillExpandPathsFromMd(controlMd, pageMd, '', expandPathsMap);
            expandPaths = _.keys(expandPathsMap).sort();
            expandPaths = expandPaths.length > 0 ? expandPaths.join(',') : undefined;
            return expandPaths;
        };

        var _getMockDataForEntity = function (entityId) {
            var mockDataPromise = that.mockDataCache[entityId];
            if (!mockDataPromise) {
                var currentEntity = _getEntityFromId(entityId),
                    keyProperties = _.filter(currentEntity.properties, {isKey: true}),
                    payload = {projectId: that.projectId, nameSet: currentEntity.nameSet};
                mockDataPromise = mockDataAPI.getData(payload).$promise
                    .then(function (entityData) {
                        _.forEach(entityData, function (entity) {
                            var paths = _.map(keyProperties, function (keyProperty) {
                                return entity[keyProperty.name];
                            });
                            entity.path = '/' + currentEntity.nameSet + '(\'' + paths.join('') + '\')';
                        });
                        return entityData;
                    });
                that.mockDataCache[entityId] = mockDataPromise;
            }
            return mockDataPromise;
        };

        var getEntityDefaultPath = function (entityId) {
            if (!hasEntities() || _.isEmpty(entityId)) {
                return $q.reject('no entity id or no entities loaded yet');
            }
            return _getMockDataForEntity(entityId)
                .then(function (mockEntityData) {
                    return _.isEmpty(mockEntityData) ? null : mockEntityData[0].path;
                });
        };

        var _calculateGroupBinding = function (groupMd, parentControlMd) {
            var binding = null;
            if (parentControlMd) {
                // Check if the group have a context property (property for smart templates that have the binding for the group)
                var contextPropertyName = npUiCatalog.getAggregationContextProperty(groupMd.groupId, parentControlMd.catalogControlName, parentControlMd.catalogId);
                if (contextPropertyName) {
                    // Find the context property in the parentControlMd properties
                    var contextProperty = _.find(parentControlMd.properties, {name: contextPropertyName});
                    if (contextProperty) {
                        binding = contextProperty.binding;
                    }
                }
                else {
                    binding = groupMd.binding;
                }
            }
            return binding;
        };

        var _isBindingFilled = function (binding) {
            return !_.isEmpty(binding) && !_.isEmpty(binding.paths);
        };

        var getBindingContextFromMd = function (controlMd, mainEntityId) {
            var binding = {isRelative: true, paths: []},
                controlTargetMd = controlMd,
                parentControlMd,
                containingGroupMd,
                containingGroupBinding,
                isParentGroupBound,
                nextStep = function () {
                    parentControlMd = (controlTargetMd && controlTargetMd.getParentMd) ? controlTargetMd.getParentMd() : undefined;
                    containingGroupMd = controlTargetMd ? pageMdHelper.getContainingGroupMd(controlTargetMd) : undefined;
                    containingGroupBinding = _calculateGroupBinding(containingGroupMd, parentControlMd);
                    isParentGroupBound = _isBindingFilled(containingGroupBinding);
                };

            nextStep();
            // build binding object until absolute one (stop if we reach the root or if we find an absolute binding
            while (controlTargetMd && ((isParentGroupBound && binding.isRelative) || !isParentGroupBound)) {
                if (isParentGroupBound) {
                    binding.isRelative = containingGroupBinding.isRelative;
                    binding.paths = containingGroupBinding.paths.concat(binding.paths);
                }
                controlTargetMd = controlTargetMd.getParentMd();
                nextStep();
            }

            // adjust binding object
            if (mainEntityId) {
                if (binding.isRelative) {
                    // Add the absolute part of the path for the main entity
                    // - The binding is now absolute
                    binding.isRelative = false;
                    // - Add the main entity as the first path part
                    binding.paths.unshift({entityId: mainEntityId});
                }
                else {
                    binding = undefined;
                }
            }

            if (_.isEmpty(binding) || _.isEmpty(binding.paths)) {
                binding = undefined;
            }
            return binding;
        };

        var getGroupPathsFromMd = function (controlMd, mainEntityId) {
            var binding = controlMd ? getBindingContextFromMd(controlMd, mainEntityId) : undefined;
            return getGroupPaths(binding);
        };

        var getPropertyPathsFromMd = function (propertyMd, controlMd, mainEntityId, isSmartApp) {
            var possiblePaths, bindingContext;
            if (!isSmartApp || npUiCatalog.isDataDriven(propertyMd.name, controlMd.catalogControlName, controlMd.catalogId)) {
                bindingContext = getBindingContextFromMd(controlMd, mainEntityId);
                if (npUiCatalog.isContextProperty(propertyMd.name, controlMd.catalogControlName, controlMd.catalogId)) {
                    possiblePaths = getContextPropertyPaths(bindingContext, true);
                }
                else if (npUiCatalog.isLinkProperty(propertyMd.name, controlMd.catalogControlName, controlMd.catalogId)) {
                    possiblePaths = getContextPropertyPaths(bindingContext, false);
                }
                else {
                    possiblePaths = getPropertyPaths(propertyMd, bindingContext, isSmartApp);
                }
            }
            return possiblePaths;
        };

        var getEntityFromBinding = function (binding) {

            var entity, property;
            var last = binding.paths.length - 1;
            var lastPropertyId;

            if (last >= 0) {
                lastPropertyId = binding.paths[last].propertyId;
                entity = _getEntityFromId(binding.paths[last].entityId);
                property = null;
            }

            if (entity && _isNavigationProperty(entity._id, lastPropertyId)) {
                property = _getPropertyFromId(entity._id, lastPropertyId);
                if (property) {
                    entity = _getEntityFromId(property.toEntityId);
                }
                if ((lastPropertyId && !property) || !entity) {
                    entity = undefined;
                }
            }

            return entity;
        };

        var getContextEntity = function (controlMd, mainEntity) {
            var binding = getBindingContextFromMd(controlMd, mainEntity);
            if (binding) {
                return getEntityFromBinding(binding);
            }
        };

        var getNameSetFromId = function (entityId) {
            var entityNameSet = null;
            if (hasEntities() && !_.isEmpty(entityId)) {
                var entity = _getEntityFromId(entityId);
                entityNameSet = entity.nameSet;
            }
            return entityNameSet;
        };

        return {
            initEntities: initEntities,
            queryModel: queryModel,
            getAllEntities: getAllEntities,
            getEntitiesFromIds: getEntitiesFromIds,
            getPath: getPath,
            getGroupPathsFromMd: getGroupPathsFromMd,
            getPropertyPathsFromMd: getPropertyPathsFromMd,
            hasEntities: hasEntities,
            concatenatePaths: concatenatePaths,
            getExpandPaths: getExpandPaths,
            isAbsolutePath: isAbsolutePath,
            getExpandPathsFromMd: getExpandPathsFromMd,
            getEntityDefaultPath: getEntityDefaultPath,
            getPathsCompatibleWithEntity: getPathsCompatibleWithEntity,
            getEntitiesAndProperties: getEntitiesAndProperties,
            isTypeCompatibleWithProperty: isTypeCompatibleWithProperty,
            getEntityFromBinding: getEntityFromBinding,
            getPathsCompatibleWithProperty: getPathsCompatibleWithProperty,
            getPathsCompatibleWithParentGroup: getPathsCompatibleWithParentGroup,
            getContextEntity: getContextEntity,
            getPathsCompatibleWithControlProperty: getPathsCompatibleWithControlProperty,
            getNameSetFromId: getNameSetFromId
        };
    }
];

module.exports = npBindingHelper;

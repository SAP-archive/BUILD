'use strict';

var _ = require('norman-server-tp').lodash;

var assetUrlRegexp = /\/api\/projects\/[a-f0-9]{24}\/document\/([a-f0-9]{24})\/([0-9])/i;
var ASSET_BASE_PATH = 'assets/';

/**
 * Retrieve an appropriate language helper depending on the ui language
 * @param uiLang the ui language to use
 * @returns {Function} a language specific helper
 * @private
 */
function _getUILangHelper(uiLang) {
    if (uiLang === 'openui5' || uiLang === 'sapui5' || uiLang === undefined) { // Default to UI5
        uiLang = 'ui5';
    }
    return require('./technology/' + uiLang + 'Helper.js');
}

exports.setContext = function (uiCatalogs, dataModel, appMetadata) {
    this.uiCatalogs = uiCatalogs;
    this.dataModel = dataModel;
    this.appMetadata = appMetadata;
    this.appCatalogId = appMetadata.catalogId;
    this.uiLang = this.getUiLang(this.appCatalogId);
    this.runtimeUrls = this.getRuntimeUrls(this.appCatalogId);
    this.langHelper = _getUILangHelper(this.uiLang).reset();
    this.controlCache = {};
    this.actionCache = {};
    this.propertyCache = {};
    this.isNavPropertyCache = {};
    this.entityCache = {};
    this.navPropTargetCache = {};
};


exports.generateIndex = function (pageMetadataArray, isSnapshot) {
    var runtimeUrl = (isSnapshot) ? this.runtimeUrls.external : this.runtimeUrls.internal;
    return this.langHelper.generateIndex(pageMetadataArray, runtimeUrl, isSnapshot);
};

exports.generateRouter = function () {
    return this.langHelper.generateRouter();
};

exports.generateFormulaHelper = function (projectId) {
    return this.langHelper.generateFormulaHelper(projectId);
};

exports.createSmartConfig = function (smartConfig) {
    return this.langHelper.createSmartConfig(smartConfig);
};

exports.getProjectId = function () {
    return this.dataModel.projectId;
};

/**
 * Generate the language specific bundle file.
 *
 * The bundle file helps to improve performance by bundling multiple resources into one file.
 *
 * In case of UI5 a Component-preload file is generated.
 *
 * @param {object[]} bundleArtifacts - array of files which belong to a project.
 *
 * @returns {string} - the bundle content
 */
exports.generateBundle = function (bundleArtifacts) {
    if (this.langHelper.generateBundle) {
        return this.langHelper.generateBundle(bundleArtifacts);
    }
};

exports.retrieveEntity = function (entityId) {
    var entity;
    if (this.dataModel) {
        entity = _.find(this.dataModel.entities, function (entity) {
            return entity._id === entityId;
        });
    }
    return entity;
};

exports.retrieveEntityName = function (entityId, returnNameset) {
    if (returnNameset === undefined) {
        returnNameset = false;
    }
    var entityUniqueName = entityId + ':' + returnNameset.toString();
    var entityName = this.entityCache[entityUniqueName] || null;
    var propToRetrieve = (returnNameset) ? 'nameSet' : 'name';
    if (!entityName && this.dataModel) {
        var targetEntity = _.find(this.dataModel.entities, function (entity) {
            return entity._id === entityId;
        });
        entityName = (targetEntity) ? targetEntity[propToRetrieve] : null;
        this.entityCache[entityUniqueName] = entityName;
    }
    return entityName;
};

exports.getEntityByName = function (entityName) {
    var entityMatch = null;
    if (entityName && this.dataModel) {
        entityMatch = _.find(this.dataModel.entities, function (entity) {
            return entity.name === entityName;
        });
    }

    return entityMatch;
};

exports.getEntityByNameSet = function (nameSet) {
    var entityMatch = null;
    if (nameSet && this.dataModel) {
        entityMatch = _.find(this.dataModel.entities, {nameSet: nameSet});
    }

    return entityMatch;
};

exports.isNavigationProperty = function (entityId, propertyId) {
    var propertyUniqueName = entityId + ':' + propertyId;
    var isNavigationProperty = this.isNavPropertyCache[propertyUniqueName] || null;
    if (isNavigationProperty == null) {
        if (this.dataModel) {
            var targetEntity = _.find(this.dataModel.entities, function (entity) {
                return entity._id === entityId;
            });
            if (targetEntity) {
                var targetProperty = _.find(targetEntity.navigationProperties, function (property) {
                    return property._id === propertyId;
                });
                isNavigationProperty = !!targetProperty;
            }
        }
    }
    else {
        isNavigationProperty = false;
    }
    return isNavigationProperty;
};

exports.retrievePropertyName = function (entityId, propertyId) {
    var propertyUniqueName = entityId + ':' + propertyId;
    var propertyName = this.propertyCache[propertyUniqueName] || null;
    if (!propertyName && this.dataModel) {
        var targetEntity = _.find(this.dataModel.entities, function (entity) {
            return entity._id === entityId;
        });
        if (targetEntity) {
            var targetProperty = _.find(targetEntity.properties, function (property) {
                return property._id === propertyId;
            });
            if (!targetProperty) {
                targetProperty = _.find(targetEntity.navigationProperties, function (property) {
                    return property._id === propertyId;
                });
            }
            propertyName = (targetProperty) ? targetProperty.name : null;
            this.propertyCache[propertyUniqueName] = propertyName;
        }
    }
    return propertyName;
};

exports.retrievePropertyType = function (entityId, propertyId) {
    var propertyUniqueName = entityId + ':' + propertyId + ':Type';
    var propertyType = this.propertyCache[propertyUniqueName] || null;
    if (!propertyType && this.dataModel) {
        var targetEntity = _.find(this.dataModel.entities, function (entity) {
            return entity._id === entityId;
        });
        if (targetEntity) {
            var targetProperty = _.find(targetEntity.properties, function (property) {
                return property._id === propertyId;
            });
            propertyType = (targetProperty) ? targetProperty.propertyType : null;
            this.propertyCache[propertyUniqueName] = propertyType;
        }
    }
    return propertyType;
};

exports.retrievePropertyTarget = function (entityId, propertyId) {
    var propertyUniqueName = entityId + ':' + propertyId + ':TargetEntity';
    var toEntity = this.propertyCache[propertyUniqueName] || null;
    if (!toEntity && this.dataModel) {
        var targetEntity = _.find(this.dataModel.entities, function (entity) {
            return entity._id === entityId;
        });
        if (targetEntity) {
            var targetProperty = _.find(targetEntity.navigationProperties, function (property) {
                return property._id === propertyId;
            });
            toEntity = (targetProperty) ? targetProperty.toEntityId : null;
            this.propertyCache[propertyUniqueName] = toEntity;
        }
    }
    return toEntity;
};

exports.hasPropertyName = function (entityName, propertyName) {
    var result = false;
    var entity = this.getEntityByName(entityName);
    if (entity && propertyName && this.dataModel) {
        var targetProperty = _.find(entity.properties, function (property) {
            return property.name === propertyName;
        });
        result = (targetProperty !== undefined);
    }

    return result;
};

exports.hasBinding = function (property) {
    var result = false;
    // check that a binding path exists
    if (property && property.binding && property.binding.paths) {
        result = property.binding.paths.length > 0;
    }
    return result;
};

exports.storeNavPropTarget = function (bindingPath, entityId) {
    this.navPropTargetCache[bindingPath] = entityId;
};

exports.getNavPropTarget = function (bindingPath) {
    return this.navPropTargetCache[bindingPath];
};

/** UI Catalog utilities **/

exports.findControlInCatalog = function (controlData) {
    // see if we have the control in cache
    var foundControl = this.controlCache[controlData.catalogControlName] || undefined;
    if (!foundControl) {
        // if the if have a catalogId use it, otherwise use the one from the appMetadata
        var uiCatalogId = controlData.catalogId || this.appCatalogId;
        // find the control in the catalogs
        foundControl = this.findControl(controlData.catalogControlName, uiCatalogId);
    }
    return foundControl;
};

exports.extendControl = function (control, controlParentId, catalog) {
    var foundControl = _.find(catalog.controls, function (catalogControl) {
        return catalogControl.name === controlParentId;
    });
    if (foundControl) {
        control.additionalMetadata.properties = _.assign(control.additionalMetadata.properties, foundControl.additionalMetadata.properties);
        control.additionalMetadata.aggregations = _.assign(control.additionalMetadata.aggregations, foundControl.additionalMetadata.aggregations);
        control.additionalMetadata.events = _.assign(control.additionalMetadata.events, foundControl.additionalMetadata.events);
        if (foundControl.additionalMetadata.parent) {
            this.extendControl(control, foundControl.additionalMetadata.parent, catalog);
        }
    }
};

exports.findControl = function (catalogControlName, catalogId) {
    // get the catalog via the id
    var catalog = this.getCatalog(catalogId) || {};
    var foundControl = _.find(catalog.controls, function (control) {
        return control.name === catalogControlName;
    });
    // parent is always on the root
    if (foundControl && foundControl.additionalMetadata.parent && !catalog.isRootCatalog) {
        var controlName = foundControl.additionalMetadata.parent;
        var rootCatalogId = foundControl.additionalMetadata.parentCatalogId || catalog.rootCatalogId;
        var rootCatalog = this.getCatalog(rootCatalogId) || {};
        foundControl = _.find(rootCatalog.controls, function (control) {
            return control.name === controlName;
        });
        // We need to extend the control with the parent controls
        if (foundControl && foundControl.additionalMetadata.parent) {
            this.extendControl(foundControl, foundControl.additionalMetadata.parent, rootCatalog);
        }
    }
    if (foundControl) {
        // store the original name even if control might come from root
        this.controlCache[catalogControlName] = foundControl;
    }

    return foundControl;
};

exports.retrieveFloorplan = function (floorplanName) {
    var catalog = this.getRootCatalog(this.appCatalogId) || {};
    var foundFloorplan = null;
    if (catalog) {
        foundFloorplan = _.find(catalog.floorPlans, function (floorplan) {
            return floorplan.name === floorplanName;
        });
    }
    return foundFloorplan;
};

exports.retrieveDesignTemplate = function (floorplanName) {
    var designTemplate = null;
    var foundFloorplan = this.retrieveFloorplan(floorplanName);
    if (foundFloorplan) {
        designTemplate = foundFloorplan.designTemplate;
    }
    return designTemplate;
};

exports.retrieveDesignTemplateName = function (floorplanName) {
    var designTemplateName = null;
    var foundFloorplan = this.retrieveFloorplan(floorplanName);
    if (foundFloorplan) {
        designTemplateName = foundFloorplan.templateName;
    }
    return designTemplateName;
};

exports.getCatalog = function (catalogId) {
    catalogId = catalogId || '';
    return _.find(this.uiCatalogs, function (controlCatalog) {
        return controlCatalog.catalogId.toString() === catalogId.toString();
    });
};

exports.getRootCatalog = function (catalogId) {
    var catalog = this.getCatalog(catalogId);
    if (catalog && !catalog.isRootCatalog && catalog.rootCatalogId) {
        var rootCatalogId = catalog.rootCatalogId.toString();
        catalog = this.getCatalog(rootCatalogId);
    }
    return catalog;
};

exports.getUiLang = function (catalogId) {
    var uiLang;
    var rootCatalog = this.getRootCatalog(catalogId);
    if (rootCatalog) {
        uiLang = rootCatalog.catalogLang;
    }
    return uiLang;
};

exports.getRuntimeUrls = function (catalogId) {
    var urls = {internal: 'unavailable', external: 'unavailable'};
    var rootCatalog = this.getRootCatalog(catalogId);
    if (rootCatalog) {
        urls.internal = rootCatalog.libraryURL;
        urls.external = rootCatalog.libraryPublicURL;
    }

    return urls;
};

exports.isControlValid = function (controlData) {
    // If there is no default catalog default to true
    return !this.uiCatalogs || this.findControlInCatalog(controlData) !== undefined;
};

exports.isPropertyValid = function (property, controlData, assetsToCopy) {
    // If there is no default catalog default to true
    var isValid = !this.uiCatalogs;

    var control = this.findControlInCatalog(controlData),
        foundControlProperty;
    if (control && control.additionalMetadata) {
        foundControlProperty = _.find(control.additionalMetadata.properties, function (controlProperty) {
            return controlProperty.name === property.name;
        });
        isValid = (foundControlProperty !== undefined);
        if (isValid && this.langHelper.isURIType(foundControlProperty.type)) {
            property.value = this.replaceAssetUrl(property.value, assetsToCopy);
        }
    }
    return isValid;
};

exports.isGroupValid = function (groupId, controlData) {
    // If there is no default catalog default to true
    var isValid = !this.uiCatalogs;
    var control = this.findControlInCatalog(controlData);

    if (control && control.additionalMetadata) {
        isValid = _.some(control.additionalMetadata.aggregations, function (controlAggregation) {
            return controlAggregation.name === groupId;
        });
    }
    return isValid;
};

exports.isEventValid = function (eventId, controlData) {
    // If there is no default catalog default to true
    var isValid = !this.uiCatalogs;
    var control = this.findControlInCatalog(controlData);

    if (control && control.additionalMetadata) {
        isValid = _.some(control.additionalMetadata.events, function (event) {
            return event.name === eventId;
        });
    }
    return isValid;
};

exports.findActionInCatalog = function (actionId) {
    var foundAction = this.actionCache[actionId] || undefined;
    if (!foundAction) {
        var rootCatalog = this.getRootCatalog(this.appCatalogId);
        if (rootCatalog) {
            foundAction = _.find(rootCatalog.actions, function (catalogAction) {
                return catalogAction.actionId === actionId;
            });

            if (foundAction) {
                this.actionCache[actionId] = foundAction;
            }
        }
    }
    return foundAction;
};

exports.getActionInfo = function (actionId, uiCatalogName, parameters) {
    var actionInfo = null;
    var action = this.findActionInCatalog(actionId);
    if (action !== undefined) {
        actionInfo = {};
        actionInfo.actionFn = action.actionFn;
        actionInfo.params = {};
        _.each(action.actionParam, function (paramDetails) {
            if (parameters[paramDetails.paramName]) {
                actionInfo.params[paramDetails.paramName] = parameters[paramDetails.paramName].value;
            }
        });
    }
    return actionInfo;
};

exports.replaceAssetUrl = function (assetUrl, assetsToCopy) {
    var outAssetUrl = assetUrl;
    if (assetsToCopy !== null) {
        var assetUrlMatches = assetUrlRegexp.exec(assetUrl);
        if (assetUrlMatches !== null) {
            var assetData = {
                workspacePath: ASSET_BASE_PATH + assetUrlMatches[1],
                id: assetUrlMatches[1],
                version: assetUrlMatches[2]
            };
            assetsToCopy.push(assetData);
            outAssetUrl = assetData.workspacePath;
        }
    }
    return outAssetUrl;
};

exports.getDefaultProperties = function (catalogName, catalogId) {
    // get default properties from catalog
    var catalog = this.getCatalog(catalogId),
        catalogDef = _.find(catalog.controls, function (control) {
            return control.name === catalogName;
        });
    return _.map(catalogDef.additionalMetadata.properties, function (property) {
        return {name: property.name, value: property.defaultValue};
    });
};

// page metadata helper functions
// TODO use shared service with UIComposer (pageMetadataHelper)
function getGroupMd(controlMd, groupId) {
    return _.find(controlMd.groups, {groupId: groupId});
}
function getControlMd(controlId, pageMd) {
    return _.find(pageMd.controls, {controlId: controlId});
}
function getGroupChildrenMd(controlId, groupId, pageMd) {
    return _.chain(pageMd.controls)
        .filter(function (controlMd) {
            return controlMd.parentControlId === controlId && controlMd.parentGroupId === groupId;
        })
        .sortBy('parentGroupIndex')
        .value();
}
// end page metadata helper functions

exports.insertFloorplanControls = function (pageMetadata) {
    if (!this.appCatalogId || !pageMetadata.floorplan) {
        return;
    }
    var catalogId = this.appCatalogId.toString(),
        catalog = this.getCatalog(catalogId),
        floorplanMd = catalog.floorPlans[pageMetadata.floorplan] || {};
    if (!floorplanMd) {
        return;
    }
    if (pageMetadata.floorplan === 'ABSOLUTE') {
        var floorplanControls = floorplanMd.controls;
        var rootMd = getControlMd(pageMetadata.rootControlId, pageMetadata),
            rootChildren = getGroupChildrenMd(pageMetadata.rootControlId, 'content', pageMetadata);

        // generate metadata
        var absLayoutMd = {
            catalogControlName: floorplanControls.AbsoluteLayout,
            catalogId: catalogId,
            controlId: 'ABSOLUTE-al',
            properties: this.getDefaultProperties(floorplanControls.AbsoluteLayout, catalogId),
            groups: [
                {groupId: 'positions', children: []}
            ]
        };
        var positionContainersMd = _.map(rootChildren, function (controlMd, i) {
            return {
                catalogControlName: floorplanControls.PositionContainer,
                catalogId: catalogId,
                controlId: 'ABSOLUTE-pc' + i,
                properties: controlMd.floorplanProperties || [],
                groups: [
                    {groupId: 'control', children: []}
                ]
            };
        });

        // move controls to new parents
        getGroupMd(rootMd, 'content').children = [absLayoutMd.controlId];
        absLayoutMd.parentControlId = rootMd.controlId;
        absLayoutMd.parentGroupId = 'content';
        absLayoutMd.parentGroupIndex = 0;
        getGroupMd(absLayoutMd, 'positions').children = _.pluck(positionContainersMd, 'controlId');
        _.forEach(rootChildren, function (controlMd, i) {
            var posContMd = positionContainersMd[i];
            getGroupMd(posContMd, 'control').children = [controlMd.controlId];
            posContMd.parentControlId = absLayoutMd.controlId;
            posContMd.parentGroupId = 'positions';
            posContMd.parentGroupIndex = i;
            controlMd.parentControlId = posContMd.controlId;
            controlMd.parentGroupId = 'control';
            controlMd.parentGroupIndex = 0;
        });


        // add controls to page metadata
        var controlsToAdd = [absLayoutMd].concat(positionContainersMd);
        pageMetadata.controls = pageMetadata.controls.concat(controlsToAdd);
    }
};


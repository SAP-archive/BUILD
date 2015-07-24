'use strict';

var commonBuilder = require('../builderUtils.js');
var fs = require('fs');
var path = require('path');
var _ = require('norman-server-tp').lodash;
var Promise = require('norman-promise');

/**
 Provides UI5 Specific View Rendering Logic
 This includes :
 - How to render bindings
 - What's the main object in the page
 - How to extract and process namespaces
 **/

var NORMAN_PROTOTYPE_NAMESPACE = 'generated.app';
var NORMAN_PROTOTYPE_PATH = 'generated/app/';
var VIEW_FOLDER_PREFIX = 'view';
var XMLNS_PREFIX = 'xmlns:';
var UI5_MVC = 'sap.ui.core.mvc';
var EVENT_HANDLER_PREFIX = '_on';
var LIBRARIES = 'sap.m, sap.ui.unified, sap.ui.commons';
var SMART_LIBRARIES = 'sap.ui.generic.app, sap.ui.generic.template, sap.suite.ui.generic.template';
var UI5_URITYPE = 'sap_ui_core_URI';
var ROUTER_MATCHED_METHOD = 'handleRouteMatched';
var EVENT_PARAM = 'oEvent';
var compiledControllerTemplate;

var compiledComponentTemplate;
var compiledComponentPreloadTemplate;
var compiledSmartComponentTemplate;
var compiledIndexTemplate;
var compiledSmartIndexTemplate;
var handleRouteMatchedTemplate;
var formulaCalculationTemplate;
var manifestJSONTemplate;

var namespaceMap = {};
var namespacePrefix = {};

/** Load the template file once at the start of the server **/
exports.initialize = function (done) {
    _.templateSettings.interpolate = /<%=([\s\S]+?)%>/g;
    var templatePromises = [];
    var readFileAsPromised = function (fileName) {
        return Promise.invoke(fs.readFile, path.join(__dirname, fileName));
    };
    templatePromises.push(readFileAsPromised('ui5/Controller.js.tmpl').then(function (fileData) {
        compiledControllerTemplate = _.template(fileData);
    }));
    templatePromises.push(readFileAsPromised('ui5/handleRouteMatched.js.tmpl').then(function (fileData) {
        handleRouteMatchedTemplate = _.template(fileData);
    }));
    templatePromises.push(readFileAsPromised('ui5/Component.js.tmpl').then(function (fileData) {
        compiledComponentTemplate = _.template(fileData);
    }));
    templatePromises.push(readFileAsPromised('ui5/Component-preload.js.tmpl').then(function (fileData) {
        compiledComponentPreloadTemplate = _.template(fileData);
    }));
    templatePromises.push(readFileAsPromised('ui5/SmartComponent.js.tmpl').then(function (fileData) {
        compiledSmartComponentTemplate = _.template(fileData);
    }));
    templatePromises.push(readFileAsPromised('ui5/index.html.tmpl').then(function (fileData) {
        compiledIndexTemplate = _.template(fileData);
    }));
    templatePromises.push(readFileAsPromised('ui5/smartIndex.html.tmpl').then(function (fileData) {
        compiledSmartIndexTemplate = _.template(fileData);
    }));
    templatePromises.push(readFileAsPromised('ui5/formulaCalculation.js.tmpl').then(function (fileData) {
        formulaCalculationTemplate = fileData;
    }));
    templatePromises.push(readFileAsPromised('ui5/manifest.json.tmpl').then(function (fileData) {
        manifestJSONTemplate = _.template(fileData);
    }));

    Promise.all(templatePromises).then(function () {
        _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
    }).callback(done);
};

exports.reset = function () {
    namespaceMap = {};
    namespacePrefix = {};
    return this;
};

exports.getControllerName = function (viewName) {
    return NORMAN_PROTOTYPE_NAMESPACE + '.' + VIEW_FOLDER_PREFIX + '.' + viewName;
};

exports.getRootElement = function (viewMetadata) {
    return {
        'mvc:View': {
            '@xmlns:mvc': UI5_MVC,
            '@controllerName': this.getControllerName(viewMetadata.name)
        }
    };
};

exports.getAvailablePrefix = function (prefix) {
    var prefixToUse = prefix;
    var existingPrefix = namespacePrefix[prefix];
    if (existingPrefix !== undefined) {
        prefixToUse = prefix + (existingPrefix++);
    }
    namespacePrefix[prefixToUse] = 1;
    return prefixToUse;
};

exports.extractControlInformation = function (controlType) {
    var lastDotIndex = controlType.lastIndexOf('_');
    var controlName = controlType.substr(lastDotIndex + 1);
    var namespaceValue = controlType.substr(0, lastDotIndex);
    var namespaceObject = namespaceMap[namespaceValue] || null;
    if (namespaceObject === null) {
        namespaceObject = {};
        var lastNamespaceDotIndex = namespaceValue.lastIndexOf('_');
        namespaceObject.namespaceValue = namespaceValue.replace(/_/g, '.');
        var prefix = namespaceObject.namespaceValue.substr(lastNamespaceDotIndex + 1);
        // Check if prefix is available
        namespaceObject.prefix = this.getAvailablePrefix(prefix);
        namespaceObject.qualifiedNamespace = XMLNS_PREFIX + namespaceObject.prefix;
        namespaceMap[namespaceValue] = namespaceObject;
    }
    return {
        namespaceObject: namespaceObject,
        controlName: controlName,
        prefixedControlName: namespaceObject.prefix + ':' + controlName
    };
};

exports.getEventHandlerName = function (eventInfo, controlId) {
    var capitalize = function (nameToCapitalize) {
        return nameToCapitalize.charAt(0).toUpperCase() + nameToCapitalize.substring(1).replace(/\W/g, '_');
    };
    return EVENT_HANDLER_PREFIX + capitalize(eventInfo.eventId) + capitalize(controlId);
};

exports.getExpandPath = function (parentPath, binding) {
    var bindingPaths = [], bindingPath;
    // Take only relative paths (sub paths of the ancestor path)
    if (binding.isRelative) {
        if (binding.paths) {
            _.forEach(binding.paths, function (bindingSubPath) {
                if (commonBuilder.isNavigationProperty(bindingSubPath.entityId, bindingSubPath.propertyId)) {
                    bindingPaths.push(commonBuilder.retrievePropertyName(bindingSubPath.entityId, bindingSubPath.propertyId));
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

exports.retrieveBindingPath = function (binding, storeNavPropTarget) {
    var bindingPaths = [], bindingPath, entityId, propertyType, propertyTargetEntity;
    if (binding.paths && binding.paths.length > 0) {
        binding.paths.forEach(function (bindingSubPath) {
            bindingPaths.push(commonBuilder.retrievePropertyName(bindingSubPath.entityId, bindingSubPath.propertyId));
            entityId = binding.paths[0].entityId;
        });
        bindingPath = bindingPaths.join('/');

        // use the last sub path information to get the property type
        var importantPath = binding.paths[binding.paths.length - 1];
        propertyType = commonBuilder.retrievePropertyType(importantPath.entityId, importantPath.propertyId);
        propertyTargetEntity = commonBuilder.retrievePropertyTarget(importantPath.entityId, importantPath.propertyId);
    }

    if (bindingPath && binding.isRelative === false) {
        bindingPath = '/' + commonBuilder.retrieveEntityName(entityId, true) + '/' + bindingPath;
    }

    // add extra information based on the property type
    if (propertyType) {
        bindingPath = this.enrichBindingPath(bindingPath, propertyType);
    }
    else if (storeNavPropTarget && propertyTargetEntity) {
        commonBuilder.storeNavPropTarget(bindingPath, propertyTargetEntity);
    }

    return bindingPath;
};


exports.retrieveBindingInfo = function (binding, storeNavPropTarget) {
    var bindingPaths = [], bindingPath, entityId, propertyTargetEntity, bindingProperty;
    if (binding.paths && binding.paths.length > 0) {
        binding.paths.forEach(function (bindingSubPath) {
            bindingPaths.push(commonBuilder.retrievePropertyName(bindingSubPath.entityId, bindingSubPath.propertyId));
            entityId = binding.paths[0].entityId;
            bindingProperty = binding.paths[0].propertyId;
        });
        bindingPath = bindingPaths.join('/');

        // use the last sub path information to get the property type
        var importantPath = binding.paths[binding.paths.length - 1];
        propertyTargetEntity = commonBuilder.retrievePropertyTarget(importantPath.entityId, importantPath.propertyId);
    }

    if (bindingPath && binding.isRelative === false) {
        bindingPath = '/' + commonBuilder.retrieveEntityName(entityId, true) + '/' + bindingPath;
    }

    if (storeNavPropTarget && propertyTargetEntity) {
        commonBuilder.storeNavPropTarget(bindingPath, propertyTargetEntity);
    }

    return {bindingPath: bindingPath, entityId: entityId, bindingProperty: bindingProperty};
};

exports.preparePropertyBindingPath = function (binding) {
    var bindingPath = exports.retrieveBindingPath(binding);
    return (bindingPath) ? '{' + bindingPath + '}' : null;
};

exports.prepareListBindingPath = function (binding, expandPaths) {
    var bindingPath, entityId, propertyId, result;
    if (binding.paths && binding.paths.length > 0) {
        entityId = binding.paths[0].entityId;
        propertyId = binding.paths[0].propertyId;
    }

    if (propertyId === undefined || propertyId === '') {
        if (binding.isRelative === false) {
            bindingPath = '/' + commonBuilder.retrieveEntityName(entityId, true);
        }
    }
    else {
        bindingPath = commonBuilder.retrievePropertyName(entityId, propertyId);
        if (bindingPath && binding.isRelative === false) {
            bindingPath = '/' + commonBuilder.retrieveEntityName(entityId, true) + '/' + bindingPath;
        }
    }
    if (bindingPath) {
        if (expandPaths && expandPaths.length > 0) {
            result = '{path:\'' + bindingPath + '\', parameters:{expand:\'' + expandPaths.join(',') + '\'}}';
        }
        else {
            result = '{' + bindingPath + '}';
        }
    }
    else {
        result = null;
    }
    return result;

};

function generateFunction(functionName, functionParams, functionContent) {
    functionParams = functionParams || '';
    return '\t' + functionName + ': function(' + functionParams + ') {\r\n\t\t' + functionContent + '\r\n\t}';
}

exports.generateEventHandlerCode = function (eventHandlerName, actionInfo) {
    var actionCode = (actionInfo !== null) ? _.template(actionInfo.actionFn)(actionInfo.params) : '';
    return generateFunction(eventHandlerName, EVENT_PARAM, actionCode);
};

exports.generateRouterCode = function (navigationTargets, expandParameters) {
    _.each(navigationTargets, function (navigationTarget) {
        if (expandParameters == null) {
            navigationTarget.params = '{}';
        }
        else {
            var joinedExpandParams = _.keys(expandParameters).join(',');
            if (joinedExpandParams !== '') {
                navigationTarget.params = '{expand:\'' + joinedExpandParams + '\'}';
            }
            else {
                navigationTarget.params = '{}';
            }

        }
    });
    var initContent = handleRouteMatchedTemplate({navigationTargets: navigationTargets});
    return {
        methodName: ROUTER_MATCHED_METHOD,
        content: generateFunction(ROUTER_MATCHED_METHOD, EVENT_PARAM, initContent)
    };
};

exports.generateController = function (pageName, eventHandlerCollection, sourceNavigations) {
    return compiledControllerTemplate({
        controllerName: this.getControllerName(pageName),
        sourceNavigations: sourceNavigations,
        eventHandlers: _.reduce(eventHandlerCollection, function (resultString, eventHandlerCode) {
            resultString += ',';
            return resultString + '\r\n' + eventHandlerCode;
        })
    });
};

exports.generateIndex = function (pageMetadatas, ui5Url, isSnapshot) {
    var libraryList = [];
    _.each(pageMetadatas, function (pageMetadata) {
        _.each(pageMetadata.controls, function (control) {
            if (libraryList.indexOf(control.controlCatalog) === -1) {
                libraryList.push(control.controlCatalog);
            }
        });
    });
    var params = {ui5Url: ui5Url, ui5Libraries: LIBRARIES, localNormanAngular: '', isSnapshot: isSnapshot};
    if (commonBuilder.appMetadata.isSmartApp) {
        params.ui5Libraries += ', ' + SMART_LIBRARIES;
    }
    var compiledIndex;
    if (commonBuilder.appMetadata.isSmartApp) {
        compiledIndex = compiledSmartIndexTemplate(params);
    }
    else {
        compiledIndex = compiledIndexTemplate(params);
    }
    return compiledIndex;
};

exports.generateRouter = function () {
    var appMetadata = commonBuilder.appMetadata;
    var pageMetadatas = appMetadata.pages;
    var appTypeControl, config;

    // create application control
    if (appMetadata.appType === 'masterDetail') {
        appTypeControl = 'sap.m.SplitApp';
        config = '\t\t\t\ttargetAggregation: "detailPages"';
    }
    else {
        appTypeControl = 'sap.m.App';
        config = '\t\t\t\ttargetAggregation: "pages"';
    }

    // create page routing
    var appType = appMetadata.appType || 'App';
    var pages = _.map(pageMetadatas, function (pageMetadata) {
        var name = pageMetadata.name;
        var target = (appType === 'masterDetail' && pageMetadata.name === 'S0') ? 'targetAggregation: "masterPages", ' : '';
        return '\t\t\t\t{' + target + ' pattern: "' + name + '",name: "' + name + '", view: "' + name + '"}';
    });

    // create default pattern
    if (pageMetadatas && pageMetadatas.length > 0) {
        var sDefaultPage = pageMetadatas[0].name;
        var master = (appType === 'masterDetail' && sDefaultPage === 'S0') ? 'targetAggregation: "masterPages", ' : '';
        pages.push('\t\t\t\t{' + master + ' pattern: "",name: "default", view: "' + sDefaultPage + '"}');
    }

    // create context page routing
    var aNavigation = appMetadata.navigations;
    var routes = _.map(aNavigation, function (navigation) {
        var pattern = navigation.routeName + '/:context:';
        var targetPage = _.find(appMetadata.pages, function (page) {
            return navigation.targetPageId === page.id.toString();
        });

        var targetPageName = (targetPage) ? targetPage.name : '';
        return '\t\t\t\t{ pattern: "' + pattern + '",name: "' + navigation.routeName + '", view: "' + targetPageName + '"}';
    });

    routes = routes.concat(pages);
    var compiledComponent;
    if (appMetadata.isSmartApp) {
        compiledComponent = compiledSmartComponentTemplate({
            config: config,
            routes: routes.join(',\n'),
            appTypeControl: appTypeControl,
            appType: appType,
            appBackgroundColor: '#FFFFFF'
        });
    }
    else {
        compiledComponent = compiledComponentTemplate({
            config: config,
            routes: routes.join(',\n'),
            appTypeControl: appTypeControl,
            appType: appType,
            appBackgroundColor: '#FFFFFF'
        });
    }
    return compiledComponent;

};

exports.generateBundle = function (bundleArtifacts) {
    var bundleContent = null;
    if (bundleArtifacts) {
        var preloadModules = {};
        _.each(bundleArtifacts, function (artifact) {
            preloadModules[NORMAN_PROTOTYPE_PATH + artifact.path] = artifact.filecontent;
        });
        bundleContent = compiledComponentPreloadTemplate({
            preloadModules: JSON.stringify(preloadModules)
        });
    }
    return bundleContent;
};

exports.generateFormulaHelper = function () {
    return formulaCalculationTemplate;
};

exports.isURIType = function (propertyType) {
    return propertyType === UI5_URITYPE;
};

exports.escapePropertyValue = function (propertyValue) {
    if (propertyValue) {
        propertyValue = propertyValue.replace(/^{([^}]+)}$/, function (nop, foundMatch) {
            return '\\{' + foundMatch + '\\}';
        });
    }
    else {
        propertyValue = '';
    }
    return propertyValue;
};

exports.enrichBindingPath = function (bindingPath, propertyType) {

    if (propertyType === 'Date') {
        bindingPath = 'path: \'' + bindingPath + '\', type: \'sap.ui.model.type.Date\', formatOptions: { UTC: true, style: \'short\' }';
    }
    else if (propertyType === 'DateTime') {
        bindingPath = 'path: \'' + bindingPath + '\', type: \'sap.ui.model.type.DateTime\', formatOptions: { UTC: true, style: \'short\' }';
    }
    else if (propertyType === 'Time') {
        bindingPath = 'path: \'' + bindingPath + '\', type: \'sap.ui.model.type.DateTime\', formatOptions: { UTC: true, pattern: \'HH:mm\' }';
    }
    return bindingPath;
};

exports.createSmartConfig = function (configValue) {
    return manifestJSONTemplate({smartAppConfig: configValue});
};

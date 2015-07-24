'use strict';
var builder = require('xmlbuilder');
var _ = require('norman-server-tp').lodash;
var builderUtils = require('./builderUtils');

/**
 * Generate the view from the Metadata
 * The assumption is that *any uiLang* can be represented as XML or HTML in worst case.
 *
 * @param pageMetadata the view Metadata coming from the UI Composer
 * @param uiLang the uiLanguage to use ('ui5', 'angular', ...)
 * @param assetsToCopy the array of all assets to copy
 * @param appMetadata the app Metadata coming from the UI Composer
 * @returns {*} the XML / HTML string representing the view
 */
exports.generatePageFromMetadata = function (pageMetadata, assetsToCopy, pageExpandParameters) {
    if (assetsToCopy === undefined) {
        assetsToCopy = null;
    }
    if (pageExpandParameters === undefined) {
        pageExpandParameters = {};
    }
    builderUtils.insertFloorplanControls(pageMetadata);
    var langHelper = builderUtils.langHelper;
    var controlMap = _.indexBy(pageMetadata.controls, 'controlId');
    var namespaceMap = {};
    var outputXML = builder.create(langHelper.getRootElement(pageMetadata));


    function _generateExpandPaths(controlId, parentPath, expandPathsMap) {
        var controlData = controlMap[controlId];
        if (controlData && builderUtils.isControlValid(controlData)) {
            _.each(controlData.properties, function (property) {
                if (property.binding != null && builderUtils.isPropertyValid(property, controlData, assetsToCopy)) {
                    // Get expand path from the property binding (can have a single nav property in the binding)
                    var expandPath = langHelper.getExpandPath(parentPath, property.binding);
                    if (expandPath) {
                        expandPathsMap[expandPath] = expandPath;
                    }
                }
            });

            _.each(controlData.groups, function (currentGroup) {
                var currentParentPath = parentPath;
                var exploreChildren = true;
                if (builderUtils.isGroupValid(currentGroup.groupId, controlData)) {
                    if (currentGroup.binding != null && (currentGroup.binding.paths && currentGroup.binding.paths.length !== 0)) {
                        if (currentGroup.binding.isRelative) {
                            var expandPath = langHelper.getExpandPath(parentPath, currentGroup.binding);
                            if (expandPath) {
                                // New parent path for the group children
                                currentParentPath = expandPath;
                                expandPathsMap[expandPath] = expandPath;
                            }
                        }
                        else {
                            // Do not explore groups bound with an absolute path (will not be used for the expand of the root template)
                            exploreChildren = false;
                        }
                    }
                    if (exploreChildren) {
                        _.each(currentGroup.children, function (child) {
                            _generateExpandPaths(child, currentParentPath, expandPathsMap);
                        });
                    }
                }
            });
        }
        else {
            // Throw Error because we couldn't find the designated child control
            var controlName = (controlData) ? controlData.catalogControlName : 'Unknown Control';
            throw new Error(controlId + ' is invalid or couldn\'t be found in the metadata ' + controlName);
        }
    }

    function _addControlToGroup(controlId, parentNode, expandPathGenerated) {
        var controlData = controlMap[controlId];
        if (controlData && builderUtils.isControlValid(controlData)) {
            // FIXME isPattern is not available anymore, consume new definition (see wiki)
            var controlCatalogData = builderUtils.findControlInCatalog(controlData);
            var controlInformation = langHelper.extractControlInformation(controlCatalogData.name);
            var controlNamespace = controlInformation.namespaceObject;
            namespaceMap[controlNamespace.prefix] = controlNamespace;

            var controlNode = parentNode.ele(controlInformation.prefixedControlName);
            controlNode.att('id', controlData.controlId);

            _.each(controlData.properties, function (property) {
                if (property.value !== null && builderUtils.isPropertyValid(property, controlData, assetsToCopy)) {
                    var propertyValue = langHelper.escapePropertyValue(property.value);
                    if (property.binding != null) {
                        propertyValue = langHelper.preparePropertyBindingPath(property.binding) || propertyValue;
                    }
                    controlNode.att(property.name, propertyValue);
                }
            });

            _.each(controlData.groups, function (currentGroup) {
                if (builderUtils.isGroupValid(currentGroup.groupId, controlData)) {
                    var groupNode = controlNode.ele(controlNamespace.prefix + ':' + currentGroup.groupId);
                    var currentExpandPathGenerated = expandPathGenerated;
                    if (currentGroup.binding != null) {
                        var expandPaths;
                        if (!expandPathGenerated && ((currentGroup.binding.paths && currentGroup.binding.paths.length > 0)
                            || currentGroup.binding.entityId)) { // TODO for backwards compatibility
                            // The group is bound, we were not in an aggregation template, so the child is the root template
                            if (currentGroup.children.length > 0) {
                                var child = currentGroup.children[0];
                                var expandPathsMap = {};
                                _generateExpandPaths(child, '', expandPathsMap);
                                if (expandPathsMap) {
                                    expandPaths = _.keys(expandPathsMap);
                                }
                                currentExpandPathGenerated = true;
                            }
                        }
                        var bindingPath = langHelper.prepareListBindingPath(currentGroup.binding, expandPaths);
                        if (bindingPath) {
                            controlNode.att(currentGroup.groupId, bindingPath);
                        }
                    }
                    _.each(currentGroup.children, function (groupChild) {
                        _addControlToGroup(groupChild, groupNode, currentExpandPathGenerated);
                    });
                }
            });

            _.each(controlData.events, function (event) {
                if (builderUtils.isEventValid(event.eventId, controlData)) {
                    controlNode.att(event.eventId, langHelper.getEventHandlerName(event, controlId));
                }
            });
        }
        else {
            // Throw Error because we couldn't find the designated child control
            var controlName = (controlData) ? controlData.catalogControlName : 'Unknown Control';
            throw new Error(controlId + ' is invalid or couldn\'t be found in the metadata ' + controlName);
        }
    }

    _generateExpandPaths(pageMetadata.rootControlId, '', pageExpandParameters);
    _addControlToGroup(pageMetadata.rootControlId, outputXML);

    _.forIn(namespaceMap, function (namespaceObject) {
        outputXML.att(namespaceObject.qualifiedNamespace, namespaceObject.namespaceValue);
    });

    return outputXML.toString({pretty: true, indent: '    '});
};

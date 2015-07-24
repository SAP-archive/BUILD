'use strict';

var _ = require('norman-client-tp').lodash;

/**
 * The npUiCatalog service provides functions to load and access ui catalogs
 * from the backend. It keeps references to all loaded ui catalogs.
 * @module npUiCatalog
 */
var npUiCatalog = ['$resource', '$q', 'npPrototype', function ($resource, $q, npPrototype) {

    var oDataUrl = '/api/uicatalogs/',
        defaultParams = {},
        option = {},
        loadedCatalogs = {},
        protoTypeCustomCatalogId,
        protoTypeCustomCatalog,
        mainRootCatalog,
        actions = {
            getCompatibleCatalogs: {
                method: 'GET',
                url: oDataUrl + 'getCompatibleCatalogs/:catalogId',
                params: {
                    catalogId: 'catalogId'
                },
                isArray: true
            },
            getFloorplans: {
                method: 'GET',
                url: oDataUrl + 'catalog/libraryType/:libraryType/getFloorPlans',
                params: {
                    libraryType: 'libraryType'
                },
                isArray: true
            }
        },
        catalogAPI = $resource(oDataUrl, defaultParams, actions, option);

    var getFloorplans = function () {
        var deferred = $q.defer();

        // get all compatible catalogs from API
        var response = catalogAPI.getFloorplans({libraryType: 'ui5'}); // "ui5"  will get both "openui5" and "sapui5"

        response.$promise.then(function (catalogs) {
            var floorplans = {};
            var pageTypes = [];
            _.forEach(catalogs, function (catalog) {
                _.each(catalog.floorPlans, function (floorplanContent, floorplanName) {
                    floorplans[floorplanName] = {
                        text: floorplanContent.description,
                        floorplan: floorplanName,
                        isSmart: floorplanContent.hasOwnProperty('designTemplate'),
                        catalogName: catalog.catalogName,
                        thumbnail: floorplanContent.thumbnail,
                        catalogId: catalog._id
                    };
                });
            });

            _.forEach(floorplans, function (floorplan) {
                pageTypes.push(floorplan);
            });

            deferred.resolve(pageTypes);

        }).catch(function (error) {
            deferred.reject(error);
        });

        return deferred.promise;
    };

    var _convertControlNameToType = function (controlName) {
        if (controlName) {
            return controlName.replace(/_/g, '.');
        }
    };

    var _shouldIncludeControl = function (control, floorplan) {
        // SmartTemplates: exclude controls using the floorplan if set
        var exclude = (!floorplan) ? false : control.name.indexOf(floorplan) !== 0;
        return (control.displayToUser && !exclude);
    };

    var _getGroupedControlsOfCatalog = function (catalog, floorplan) {
        var groupedControls = {};
        var controls = catalog.controls;
        _.forEach(controls, function (control) {
            if (_shouldIncludeControl(control, floorplan)) {
                if (!_.has(groupedControls, control.groupName)) {
                    groupedControls[control.groupName] = [];
                }
                var newCtrl = _getReturnObj(control, catalog.catalogId);
                var insertIndex = _.sortedIndex(groupedControls[control.groupName], newCtrl, 'displayName');
                groupedControls[control.groupName].splice(insertIndex, 0, newCtrl);
            }
        });
        return groupedControls;
    };

    var _extends = function (control, rootParentName, rootCatalogId) {
        var rootParent = getControlByName(control.additionalMetadata.parent, rootCatalogId);
        while (rootParent) {
            if (rootParent.name === rootParentName) {
                return true;
            }
            if (rootParent.additionalMetadata && rootParent.additionalMetadata.parent) {
                rootParent = getControlByName(rootParent.additionalMetadata.parent, rootCatalogId);
            }
            else {
                break;
            }
        }
        return false;
    };

    var _getControlsThatExtend = function (parentName, customCatalogId) {
        var customCatalog = loadedCatalogs[customCatalogId];
        var rootCatalogId = customCatalog.rootCatalogId;
        var parentControl = getControlByName(parentName, rootCatalogId);
        if (_.isEmpty(parentControl)) {
            return {};
        }
        return _.chain(customCatalog.controls)
            .filter(function (control) {
                return control.displayToUser && _extends(control, parentName, rootCatalogId);
            })
            .map(function (control) {
                return _getReturnObj(control, customCatalogId);
            })
            .indexBy('name')
            .value();
    };

    var _getReturnObj = function (control, catalogId) {
        return {
            name: control.name,
            displayName: control.displayName,
            catalogId: catalogId,
            iconSrc: control.additionalMetadata.icon
        };
    };

    /**
     * @name getCatalogs
     * @description Retrieve promise that will be resolved with an array of catalogs
     * @returns {Promise} Returns a promise, when resolved contains an array of custom catalogs valid for this prototype
     */
    var getCatalogs = function () {

        var deferred = $q.defer();

        npPrototype.getPrototype().then(function (prototype) {

            protoTypeCustomCatalogId = prototype.catalogId;

            var catalogInfo = [];
            // get all compatible catalogs from API
            var response = catalogAPI.getCompatibleCatalogs({catalogId: protoTypeCustomCatalogId});

            response.$promise.then(function (catalogs) {
                _.forEach(catalogs, function (catalog) {

                    loadedCatalogs[catalog.catalogId] = catalog;

                    if (catalog.catalogId === protoTypeCustomCatalogId) {
                        protoTypeCustomCatalog = catalog;
                        return;
                    }

                    if (!catalog.isRootCatalog) {
                        catalogInfo.push({
                            catalogId: catalog.catalogId,
                            displayName: catalog.displayName
                        });
                    }
                });
                // add default custom catalog at the beginning
                catalogInfo.splice(0, 0, {
                    catalogId: protoTypeCustomCatalog.catalogId,
                    displayName: protoTypeCustomCatalog.displayName
                });

                mainRootCatalog = loadedCatalogs[protoTypeCustomCatalog.rootCatalogId];
                deferred.resolve(catalogInfo);
            });

        });

        return deferred.promise;
    };

    /**
     * @name getPrototypeCustomCatalogId
     * @description Retrieve id of the custom catalog that is associated with the prototype
     * @returns {string} Returns protoTypeCustomCatalogId
     */
    var getPrototypeCustomCatalogId = function () {
        return protoTypeCustomCatalogId;
    };

    /**
     * @name getControlsByCatalogId
     * @description Retrieve controls for a given catalogId
     * @param {string} catalogId id identifying the ui catalog
     * @param {string} floorplan floorplan used by page
     * @returns {Object} Returns groups of controls for the given catalog
     */
    var getControlsByCatalogId = function (catalogId, floorplan) {
        var catalog = loadedCatalogs[catalogId];
        return _getGroupedControlsOfCatalog(catalog, floorplan);
    };

    /**
     * @name getControlByName
     * @description Retrieve a control by its name
     * @param {string} controlName name of control
     * @param {string} catalogId id of catalog of control
     * @returns {Control|undefined} Controls object or undefined if not found
     */
    var getControlByName = function (controlName, catalogId) {
        if (_.isEmpty(controlName) || _.isEmpty(catalogId)) {
            throw Error('cannot return control: controlName or catalogId not defined');
        }
        if (!loadedCatalogs) {
            return undefined;
        }
        var catalog = loadedCatalogs[catalogId];
        if (catalog && catalog.controls) {
            return catalog.controls[controlName];
        }
    };

    /**
     * @name getActions
     * @description Retrieve all actions of the main root catalog
     * @returns {Actions[]|undefined} Array of actions or undefined if catalog is not loaded
     */
    var getActions = function () {
        return mainRootCatalog.actions;
    };

    /**
     * @name isControlValidInAggregation
     * @description Determines if newControl can be put in aggregation of receiverControl
     * @param {string} receiverControlName Name of the receiver control
     * @param {string} newControlName Name of the control to be added to the receiver control
     * @param {string} aggregationName Name of the aggregation
     * @returns {boolean} is control valid
     */
    var isControlValidInAggregation = function (newControlName, newControlCatalogId, receiverControlName, receiverCatalogId, aggregationName) {
        var validControls = getValidControlsForAggregation(aggregationName, receiverControlName, receiverCatalogId);
        return validControls && !_.isEmpty(validControls[newControlName]);
    };

    /**
     * @name getValidControlsForAggregation
     * @description Retrieve all valid controls for a given control aggregation
     * @param {string} aggregationName Name of the aggregation or the aggregation object itself
     * @param {string} catalogControlName
     * @param {string} catalogId
     * @returns {Object} object {controlName: CatalogControlDef }
     */
    var getValidControlsForAggregation = function (aggregationName, catalogControlName, catalogId) {
        var aggregations = getControlAggregations(catalogControlName, catalogId),
            aggregation = _.find(aggregations, {name: aggregationName}) || {};
        var validControls = {};
        _.forEach(aggregation.types, function (controlName) {
            var ctrl = getControlByName(controlName, catalogId);
            if (ctrl && ctrl.displayToUser) {
                validControls[controlName] = _getReturnObj(ctrl, catalogId);
            }
            else {
                var children = _getControlsThatExtend(controlName, catalogId);
                _.assign(validControls, children);
            }
        });
        return _.pick(validControls, function (control) {
            return isValidControlContainer(control.name, control.catalogId, catalogControlName);
        });
    };

    /**
     * @name getValidAggregationsForControl
     * @description Retrieve all valid aggregations of a parent control compatible with a given control
     * @param {string} parentCatalogControlName
     * @param {string} parentCatalogId
     * @param {string} catalogControlName
     * @param {string} catalogId
     * @returns {Aggregations[]} Array of aggregations
     */
    var getValidAggregationsForControl = function (parentCatalogControlName, parentCatalogId, catalogControlName, catalogId) {
        var aggregations = getControlAggregations(parentCatalogControlName, parentCatalogId);
        var validAggregations = [];
        _.forEach(aggregations, function (aggregation) {
            var aggregationName = (typeof aggregation === 'string') ? aggregation : aggregation.name;
            if (isControlValidInAggregation(catalogControlName, catalogId, parentCatalogControlName, parentCatalogId, aggregationName)) {
                validAggregations.push(aggregation);
            }
        });
        return validAggregations;
    };

    /**
     * @name getControlProperties
     * @description Retrieve all properties of the given control
     * @param {string} controlName Name of the control
     * @param {string} catalogId id of catalog of control
     * @param {boolean} [onlyDisplayable] if to filter out the ones with displayToUser = false
     * @returns {Properties[]} Array of properties
     */
    var getControlProperties = function (controlName, catalogId, onlyDisplayable) {
        var control = getControlByName(controlName, catalogId) || {};
        if (!_.isEmpty(control.additionalMetadata)) {
            var properties = control.additionalMetadata.properties;
            if (onlyDisplayable === true) {
                properties = _.filter(properties, 'displayToUser');
            }
            return properties;
        }
    };


    /**
     * @name getControlDesignProperties
     * @description Retrieve all design properties of the given control
     * @param {string} controlName Name of the control
     * @param {string} catalogId id of catalog of control
     * @returns {Properties[]} Array of properties
     */
    var getControlDesignProperties = function (controlName, catalogId) {
        var control = getControlByName(controlName, catalogId) || {};
        if (!_.isEmpty(control.additionalMetadata)) {
            return control.additionalMetadata.designProperties;
        }
    };

    /**
     * @name getControlEvents
     * @description Retrieve all events of the given control
     * @param {string} controlName Name of the control
     * @param {string} catalogId id of catalog of control
     * @param {boolean} [onlyDisplayable]
     * @returns {Events[]|undefined} Array of events
     */
    var getControlEvents = function (controlName, catalogId, onlyDisplayable) {
        if (_.isEmpty(controlName) && _.isEmpty(catalogId)) {
            return undefined;
        }
        var control = getControlByName(controlName, catalogId);
        if (!_.isEmpty(control)) {
            var events = control.additionalMetadata.events;
            if (onlyDisplayable === true) {
                events = _.filter(events, 'displayToUser');
            }
            return events;
        }
    };

    /**
     * @name getControlAggregations
     * @description Retrieve all aggregations of the given control. Default aggregation is returned first (if there is one)
     * @param {string} controlName Name of the control
     * @param {string} catalogId id of catalog of control
     * @param {boolean} [onlyDisplayable] if to filter out the ones with displayToUser = false
     * @returns {Aggregations[]|undefined} Array of aggregations
     */
    var getControlAggregations = function (controlName, catalogId, onlyDisplayable) {
        if (_.isEmpty(controlName) && _.isEmpty(catalogId)) {
            return undefined;
        }
        var control = getControlByName(controlName, catalogId);
        if (!_.isEmpty(control)) {
            var aggregations = control.additionalMetadata.aggregations;
            if (onlyDisplayable === true) {
                aggregations = _.filter(aggregations, 'displayToUser');
            }
            return aggregations;
        }
    };

    /**
     * @name getControlDefaultAggregation
     * @description Retrieve all aggregations of the given control. Default aggregation is returned first (if there is one)
     * @param {string} controlName Name of the control
     * @param {string} catalogId id of catalog of control
     * @returns {Aggregations[]} Array of aggregations
     */
    var getControlDefaultAggregation = function (controlName, catalogId) {
        if (!_.isEmpty(controlName) && !_.isEmpty(catalogId)) {
            var control = getControlByName(controlName, catalogId);
            if (!_.isEmpty(control)) {
                return control.additionalMetadata.defaultAggregation;
            }
        }
        return undefined;
    };


    /**
     * @name getControlDisplayName
     * @description Retrieve the displayName for the given control
     * @param {string} controlName Name of the control
     * @param {string} catalogId id of catalog of control
     * @returns {string} Control displayName
     */
    var getControlDisplayName = function (controlName, catalogId) {
        var control = getControlByName(controlName, catalogId);
        if (control) {
            return control.displayName;
        }
        return controlName;
    };

    /**
     * @name getAggregationDisplayName
     * @description Retrieve the displayName for the given aggregation of the given control
     * @param {string} aggregationName Name of the aggregation
     * @param {string} controlName Name of the control
     * @param {string} catalogId id of catalog of control
     * @returns {string} Aggregation displayName
     */
    var getAggregationDisplayName = function (aggregationName, controlName, catalogId) {
        var aggregations = getControlAggregations(controlName, catalogId);
        if (aggregations[aggregationName]) {
            return aggregations[aggregationName].displayName;
        }
        return aggregationName;
    };

    /**
     * @name isMultipleAggregation
     * @description Retrieve the multiplicity for the given aggregation of the given control
     * @param {string} aggregationName Name of the aggregation
     * @param {string} controlName Name of the control
     * @param {string} catalogId id of catalog of control
     * @returns {string} Aggregation multiplicity
     */
    var isMultipleAggregation = function (aggregationName, controlName, catalogId) {
        var aggregations = getControlAggregations(controlName, catalogId);
        if (aggregations[aggregationName]) {
            return aggregations[aggregationName].multiple;
        }
    };

    /**
     * @name getAggregationContextProperty
     * @description Retrieve the context property for the given aggregation of the given control
     * @param {string} aggregationName Name of the aggregation
     * @param {string} controlName Name of the control
     * @param {string} catalogId id of catalog of control
     * @returns {string} Aggregation context property
     */
    var getAggregationContextProperty = function (aggregationName, controlName, catalogId) {
        var aggregations = getControlAggregations(controlName, catalogId);
        if (aggregations[aggregationName]) {
            return aggregations[aggregationName].contextProperty;
        }
        return null;
    };

    /**
     * @name getPropertyDisplayName
     * @description Retrieve the displayName for the given property of the given control
     * @param {string} propertyName name of property for which displayName is needed
     * @param {string} controlName Name of the control
     * @param {string} catalogId id of catalog of control
     * @returns {string} Property displayName
     */
    var getPropertyDisplayName = function (propertyName, controlName, catalogId) {
        var properties = getControlProperties(controlName, catalogId);
        if (properties[propertyName]) {
            return properties[propertyName].displayName;
        }
        return propertyName;
    };

    /**
     * @name getPropertyDisplayName
     * @description Retrieve the type for the given property of the given control
     * @param {string} propertyName name of property for which type is needed
     * @param {string} controlName Name of the control
     * @param {string} catalogId id of catalog of control
     * @returns {string} Property type
     */
    var getPropertyType = function (propertyName, controlName, catalogId) {
        var properties = getControlProperties(controlName, catalogId);
        if (properties[propertyName]) {
            return properties[propertyName].type;
        }
    };

    /**
     * @name isDataDriven
     * @description Retrieve the property isDataDriven for the given property of the given control
     * @param {string} propertyName name of property for which type is needed
     * @param {string} controlName Name of the control
     * @param {string} catalogId id of catalog of control
     * @returns {boolean} Property isDataDriven
     */
    var isDataDriven = function (propertyName, controlName, catalogId) {
        var properties = getControlProperties(controlName, catalogId);
        if (properties[propertyName]) {
            return properties[propertyName].isDataDriven;
        }
    };


    /**
     * @name getPropertyPossibleValues
     * @description Retrieve the possible values for the given property of the given control
     * @param {string} propertyName name of property for which displayName is needed
     * @param {string} controlName Name of the control
     * @param {string} catalogId id of catalog of control
     * @returns {array} Property possible values
     */
    var getPropertyPossibleValues = function (propertyName, controlName, catalogId) {
        var properties = getControlProperties(controlName, catalogId);
        if (properties[propertyName]) {
            return properties[propertyName].possibleValues;
        }
        return null;
    };

    /**
     * @name isContextProperty
     * @description Checks if given control property is a context property. Such a property can be bound with a multiple navigation property.
     * This property must be refered by an aggregation of the control.
     * @param {string} propertyName name of property
     * @param {string} controlName name of the control
     * @param {string} catalogId id of catalog of control
     * @returns {boolean} is a context property
     */
    var isContextProperty = function (propertyName, controlName, catalogId) {
        var properties = getControlProperties(controlName, catalogId);
        if (properties[propertyName]) {
            return properties[propertyName].isContextProperty;
        }
    };

    /**
     * @name isLinkProperty
     * @description Checks if given control property is a link property. Such a property can be bound with a 1-1 navigation property.
     * This property must be referred by a property of the control.
     * @param {string} propertyName name of property
     * @param {string} controlName name of the control
     * @param {string} catalogId id of catalog of control
     * @returns {boolean} is a link property
     */
    var isLinkProperty = function (propertyName, controlName, catalogId) {
        var properties = getControlProperties(controlName, catalogId);
        if (properties[propertyName]) {
            return properties[propertyName].isLinkProperty;
        }
    };

    /**
     * @name getEventDisplayName
     * @description Retrieve the displayName for the given event of the given control
     * @param {string} eventName name of event for which displayName is needed
     * @param {string} controlName Name of the control
     * @param {string} catalogId id of catalog of control
     * @returns {string} Event displayName
     */
    var getEventDisplayName = function (eventName, controlName, catalogId) {
        var events = getControlEvents(controlName, catalogId);
        if (events[eventName]) {
            return events[eventName].displayName;
        }
        return eventName;
    };

    /**
     * @name getDefaultProperty
     * @description Retrieve the default property of a given control.
     * @param {string} controlName Name of the control
     * @param {string} catalogId id of catalog of control
     * @returns {Property} defaultProperty if found
     */
    var getDefaultProperty = function (controlName, catalogId) {
        var ctrl = getControlByName(controlName, catalogId);
        if (ctrl && ctrl.additionalMetadata && ctrl.additionalMetadata.defaultProperty) {
            return ctrl.additionalMetadata.defaultProperty;
        }
    };

    /**
     * @name getControlType
     * @description Retrieve the type the given control.
     * @param {string} controlName Name of the control
     * @param {string} catalogId id of catalog of control
     * @returns {string} Type of control
     */
    var getControlType = function (controlName, catalogId) {
        var ctrl = getControlByName(controlName, catalogId);
        if (ctrl) {
            var catalog = loadedCatalogs[catalogId];
            if (catalog.isRootCatalog) {
                return _convertControlNameToType(ctrl.name);
            }
            else if (ctrl.additionalMetadata.parentCatalogId) {
                // relevant control is defined in parent catalog
                var parentCatalog = loadedCatalogs[ctrl.additionalMetadata.parentCatalogId];
                // no mashup control
                if (parentCatalog.catalogLang === mainRootCatalog.catalogLang) {
                    var parentControl = getControlByName(ctrl.additionalMetadata.parent, parentCatalog.catalogId);
                    return _convertControlNameToType(parentControl.name);
                }
                // mashup
                var mashupControl = getControlByName(mainRootCatalog.mashupControls[parentCatalog.catalogId], mainRootCatalog.catalogId);
                return _convertControlNameToType(mashupControl.name);
            }
            // when control parent catalog id is not defined
            return _convertControlNameToType(ctrl.additionalMetadata.parent);
        }
    };

    /**
     * @name getTagName
     * @description Retrieve the control tag name
     * @param {string} controlName Name of the control
     * @param {string} catalogId id of catalog of control
     * @returns {string} tag name
     */
    var getTagName = function (controlName, catalogId) {
        var control = getControlByName(controlName, catalogId);
        if (control && control.additionalMetadata) {
            return control.additionalMetadata.tagname;
        }
    };


    /**
     * @name getHotspotName
     * @description Retrieve the control name for hotspot.
     * @returns {string} hotspot control name
     */
    // TODO read from catalog when available
    var getHotspotName = function () {
        return 'sap_norman_Hotspot';
    };

    /**
     * @name getImageName
     * @description Retrieve the control name for image control.
     * @returns {string} image control name
     */
    // TODO read from catalog when available!
    var getImageName = function () {
        return 'sap_m_Image';
    };

    /**
     * @name isValidControlContainer
     * @description Determines if a control can be hosted in the target container
     * @param {string} controlName
     * @param {string} catalogId
     * @param {string} targetContainerName
     * @returns {boolean} canBeContained
     */
    var isValidControlContainer = function (controlName, catalogId, targetContainerName) {
        var control = getControlByName(controlName, catalogId);
        var isValid = false;
        // ensure additional metadata is defined
        if (control && control.additionalMetadata) {
            // either container is not defined/not a string, or it is equal to the target
            isValid = typeof control.additionalMetadata.container !== 'string' || control.additionalMetadata.container === targetContainerName;
        }
        return isValid;
    };

    /**
     * @name getControlDiffName
     * @description Retrieve the differentiating displayName for the given control
     * @param {string} controlName Name of the control
     * @param {string} catalogId id of catalog of control
     * @returns {string} Control displayName
     */
    var getControlDiffName = function (controlName, catalogId) {
        var control = getControlByName(controlName, catalogId);
        if (control) {
            return control.diffName;
        }
        return '';
    };


    return {
        getControlsByCatalogId: getControlsByCatalogId,
        getControlByName: getControlByName,
        getControlType: getControlType,
        getControlDisplayName: getControlDisplayName,
        getAggregationDisplayName: getAggregationDisplayName,
        getPropertyDisplayName: getPropertyDisplayName,
        getEventDisplayName: getEventDisplayName,
        getControlAggregations: getControlAggregations,
        getControlProperties: getControlProperties,
        getControlDesignProperties: getControlDesignProperties,
        getControlEvents: getControlEvents,
        getControlDefaultAggregation: getControlDefaultAggregation,
        getDefaultProperty: getDefaultProperty,
        getValidControlsForAggregation: getValidControlsForAggregation,
        getValidAggregationsForControl: getValidAggregationsForControl,
        isControlValidInAggregation: isControlValidInAggregation,
        getCatalogs: getCatalogs,
        getActions: getActions,
        getTagName: getTagName,
        getHotspotName: getHotspotName,
        getImageName: getImageName,
        getPropertyPossibleValues: getPropertyPossibleValues,
        isContextProperty: isContextProperty,
        isLinkProperty: isLinkProperty,
        getAggregationContextProperty: getAggregationContextProperty,
        getFloorplans: getFloorplans,
        getPrototypeCustomCatalogId: getPrototypeCustomCatalogId,
        isMultipleAggregation: isMultipleAggregation,
        getPropertyType: getPropertyType,
        isDataDriven: isDataDriven,
        getControlDiffName: getControlDiffName
    };
}];

module.exports = npUiCatalog;

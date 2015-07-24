'use strict';

var _ = require('norman-client-tp').lodash;

/**
 * @ngdoc factory
 * @name npPageMetadataAddControl
 * @namespace uiComposer:services:npPageMetadata:addControl
 */

var npPageMetadataAddControl = ['$q', '$log', 'npPageMetadataHelper', 'npPageMetadataEvents', 'npUiCatalog', 'npLayoutHelper', 'uiUtil',
    function ($q, $log, pageMdHelper, pageMdEvents, npUiCatalog, npLayoutHelper, uiUtil) {

        var getNextId = function (prefix) {
            prefix = prefix || 'control';
            return 'np-' + prefix + '-' + new Date().getTime() + '-' + uiUtil.nextUid();
        };

        /**
         * @private
         * @returns {GroupMdMd[]} Array of default property metadata objects for a certain control.
         */
        var getDefaultGroups = function (catalogControlName, catalogId) {
            var catalogAggregations = npUiCatalog.getControlAggregations(catalogControlName, catalogId);
            return _.map(catalogAggregations, function (aggregation) {
                return {
                    groupId: aggregation.name,
                    children: []
                };
            });
        };

        /**
         * @private
         * @returns {PropertyMd[]} Array of default property metadata objects for a certain control.
         */
        var getDefaultProperties = function (catalogControlName, catalogId) {
            var catalogProperties = npUiCatalog.getControlProperties(catalogControlName, catalogId);
            return _.map(catalogProperties, function (property) {
                return {
                    name: property.name,
                    value: property.defaultValue,
                    type: property.type
                };
            });
        };

        /**
         * @private
         * @returns {PropertyMd[]} Array of default design property metadata objects for a certain control.
         */
        var getDefaultDesignProperties = function (catalogControlName, catalogId) {
            var catalogDesignProperties = npUiCatalog.getControlDesignProperties(catalogControlName, catalogId);
            return _.map(catalogDesignProperties, function (property) {
                return {
                    name: property.name,
                    value: property.defaultValue,
                    type: property.type
                };
            });
        };

        /**
         * @private
         * @returns {PropertyMd[]} Property metadata objects for x and y position.
         */
        var getFloorplanProperties = function (x, y) {
            var floorplanProperties = [];

            if (x) {
                floorplanProperties.push({
                    name: 'left',
                    value: x + 'px'
                });
            }
            if (y) {
                floorplanProperties.push({
                    name: 'top',
                    value: y + 'px'
                });
            }

            return floorplanProperties;
        };

        /**
         * @private
         * @description Sets some initial values for a control's properties.
         */
        var setDefaultPropertyValues = function (ctrlProperties, defaultValues) {
            _.forEach(defaultValues, function (value, name) {
                var property = _.find(ctrlProperties, {
                        name: name
                    }) || {};
                property.value = value;
            });
        };

        /**
         * @private
         * @description Create a new control metadata object from a control definition object.
         *
         * @param {ControlDef} controlDef
         * @returns {ControlMd}
         */
        var controlDefToControlMd = function (controlDef) {
            var controlMd = {
                catalogControlName: controlDef.newCtrlCatalogName,
                catalogId: controlDef.catalogId,
                controlId: controlDef.controlId,
                parentControlId: controlDef.parentId,
                parentGroupId: controlDef.groupId,
                parentGroupIndex: controlDef.index,
                groups: [],
                properties: [],
                designProperties: [],
                floorplanProperties: [],
                events: []
            };

            if (_.isEmpty(controlMd.catalogId) || _.isEmpty(controlMd.catalogControlName)) {
                throw new Error('controlMd must have catalogId and catalogControlName');
            }
            return controlMd;
        };

        /**
         * @private
         * @description Factory function that creates a new control metadata object and adds children/default properties according to the catalog definition.
         * @param {ControlDef} controlDef
         * @returns {ControlMd}
         */
        var createControlMdObject = function (controlDef) {
            var controlMd = controlDefToControlMd(controlDef);
            controlMd.controlId = controlMd.controlId || getNextId(controlMd.catalogControlName);
            controlMd.properties = controlDef.properties || getDefaultProperties(controlMd.catalogControlName, controlMd.catalogId);
            controlMd.designProperties = getDefaultDesignProperties(controlMd.catalogControlName, controlMd.catalogId);
            controlMd.floorplanProperties = getFloorplanProperties(controlDef.x, controlDef.y);
            controlMd.groups = getDefaultGroups(controlMd.catalogControlName, controlMd.catalogId);
            setDefaultPropertyValues(controlMd.properties, controlDef.defaultPropertyValues);
            return controlMd;
        };

        /**
         * @name getControlMdObjects
         * @memberof uiComposer:services:npPageMetadata:addControl
         * @description Validates the control definition object and uses the createControlMdObject factory function to create new control metadata objects.
         * If a control definition has a parent definition it will create control metadata objects for all parents as well.
         *
         * @param {ControlDefinition} controlDef
         * @returns {ControlMd[]}
         */
        var getControlMdObjects = function (controlDef, pageMd) {
            var returnMd = [],
                controlMd = createControlMdObject(controlDef);
            returnMd.push(controlMd);
            returnMd = returnMd.concat(getChildMdObjects(controlMd, pageMd));
            return returnMd;
        };

        /**
         * @private
         * @description Returns all child metadata objects for a control according to ui-catalog definition
         * @returns {ControlMd[]}
         */
        var getChildMdObjects = function (controlMd, pageMd) {
            var childMdObjects = [],
                catalogAggregations = npUiCatalog.getControlAggregations(controlMd.catalogControlName, controlMd.catalogId);
            _.forEach(catalogAggregations, function (aggregation) {
                _.forEach(aggregation.defaultValue, function (defaultValue) {
                    var childrenMd = getControlMdObjects({
                        newCtrlCatalogName: defaultValue.name,
                        catalogId: controlMd.catalogId,
                        parentId: controlMd.controlId,
                        groupId: aggregation.name,
                        defaultPropertyValues: defaultValue.properties
                    }, pageMd);
                    childMdObjects = childMdObjects.concat(childrenMd);
                });
            });
            return childMdObjects;
        };

        /**
         * @private
         * @param {string} controlName Catalog name of control to check.
         * @returns {boolean} True if provided control is a hotspot.
         */
        var isHotspot = function (controlName) {
            return controlName === npUiCatalog.getHotspotName();
        };

        /**
         * @private
         * @description Absolute layout specific index manipulation. Hotspots that are inserted into the page's content
         * aggregation should always stay on top of everything else.
         */
        var adjustIndexForHotspots = function (controlMd, pageMd) {
            if (npLayoutHelper.isAbsoluteLayout()) {
                var rootControl = _.find(pageMd.controls, {
                        controlId: pageMd.rootControlId
                    }),
                    defaultAggregation = npUiCatalog.getControlDefaultAggregation(rootControl.catalogControlName, rootControl.catalogId);

                if (controlMd.parentControlId === pageMd.rootControlId && controlMd.parentGroupId === defaultAggregation) {
                    if (isHotspot(controlMd.catalogControlName)) {
                        return;
                    }
                    var pageContentChildren = rootControl.getChildrenMd(defaultAggregation),
                        iFirstHotspot = _.findLastIndex(pageContentChildren, function (child) {
                                return !isHotspot(child.catalogControlName);
                            }) + 1;
                    controlMd.parentGroupIndex = _.min([controlMd.parentGroupIndex, iFirstHotspot]);
                }
                else if (isHotspot(controlMd.catalogControlName)) {
                    throw new Error('Hotspots can be added only in root control default aggregation');
                }
            }
        };

        /**
         * @private
         * @description Inserts the control metadata object into the page by adding it into its parent's child group and the page's control list.
         */
        var addControlToPage = function (controlMd, pageMd) {
            if (pageMdHelper.getControlMd(controlMd.controlId, pageMd)) {
                throw Error('addControlToPage: control ' + controlMd.controlId + ' already exists in pageMd');
            }

            var parentMd = pageMdHelper.getControlMd(controlMd.parentControlId, pageMd),
                parentGroup = pageMdHelper.getGroupMd(controlMd.parentGroupId, parentMd);
            if (!parentGroup) {
                parentGroup = {groupId: controlMd.parentGroupId, children: []};
                if (!parentMd.groups) {
                    parentMd.groups = [parentGroup];
                }
                else {
                    parentMd.groups.push(parentGroup);
                }
            }
            if (_.contains(parentGroup.children, controlMd.controlId)) {
                throw Error('addControlToPage: control with this id already in the group', controlMd, parentGroup);
            }

            if (typeof controlMd.parentGroupIndex !== 'number') {
                controlMd.parentGroupIndex = parentGroup.children.length;
            }
            adjustIndexForHotspots(controlMd, pageMd);
            parentGroup.children.splice(controlMd.parentGroupIndex, 0, controlMd.controlId);
            pageMd.controls.push(controlMd);

            pageMdHelper.setControlMdPrototype(controlMd, pageMd);
            pageMdHelper.adjustChildIndexes(parentMd, parentGroup.groupId);
        };

        /**
         * @private
         * @description Inserts control metadata objects into page metadata and adds them to the canvas.
         * All control metadata objects need to have a parent-child relationship and have to be sorted in that order.
         *
         * @param {ControlMd[]} controlMdObjs Array of control metadata objects to insert.
         * @param {PageMd} pageMd The page metadata object to insert into.
         */
        var performAdd = function (controlMdObjs, pageMd) {
            _.forEach(controlMdObjs, function (controlMd) {
                addControlToPage(controlMd, pageMd);
            });
        };

        /**
         * @name performAdditions
         * @memberof uiComposer:services:npPageMetadata:addControl
         * @description Iterates over controlAdditions and uses performAdd to add each control to the prototype. The npPageMetadata service uses this function to add controls. This function is only public to the npPageMetadata service.
         *
         * @param {ControlMd[][]} controlAdditions
         * @param {PageMd} pageMd
         * @param {object} [options]
         * @returns {Promise} Promise that is resolved once all controls have been added to page metadata and canvas.
         */
        var performAdditions = function (controlAdditions, pageMd, options) {
            options = options || {};
            var returnObjs = [];

            _.forEach(controlAdditions, function (controlMdObjs) {
                returnObjs.push(controlMdObjs[0]);
                performAdd(controlMdObjs, pageMd);
            });

            pageMdEvents.broadcast(pageMdEvents.events.controlsAdded, pageMd, returnObjs, {
                selectNewElements: _.isBoolean(options.selectAddedControls) ? options.selectAddedControls : true
            });

            return returnObjs;
        };

        return {
            getNextId: getNextId,
            getFloorplanProperties: getFloorplanProperties,
            getControlMdObjects: getControlMdObjects,
            addControlToPage: addControlToPage,
            performAdd: performAdd,
            performAdditions: performAdditions
        };
    }
];

module.exports = npPageMetadataAddControl;

'use strict';
var _ = require('norman-client-tp').lodash;

/**
 * @ngdoc factory
 * @name npPageMetadataHelper
 * @namespace uiComposer:services:npPageMetadataHelper
 */

var npPageMetadataHelper = ['$q', '$log', 'npUiCatalog',
    function ($q, $log, npUiCatalog) {


        // TODO consider having getParentGroup and parentGroupIndex as proto functions
        var ControlMdPrototype = function (pageMd) {
            return {
                getParentMd: function () {
                    return getControlMd(this.parentControlId, pageMd);
                },
                getChildrenMd: function (groupId) {
                    var groupMd = getGroupMd(groupId, this) || {};
                    return _.map(groupMd.children, function (childId) {
                        return getControlMd(childId, pageMd);
                    });
                },
                isRootChild: function () {
                    return (this.parentControlId === pageMd.rootControlId);
                }
            };
        };

        /**
         * @name setControlMdPrototype
         * @memberof uiComposer:services:npPageMetadata
         * @private
         * @description sets helper methods for each control. E.g. getParentMd
         * returns pageMd for chaining
         * @param {Object|Object[]} controlsMd
         * @param {Object} pageMd
         */
        var setControlMdPrototype = function (controlsMd, pageMd) {
            controlsMd = _.makeArray(controlsMd);
            var prototype = new ControlMdPrototype(pageMd);
            _.forEach(controlsMd, function (controlMd) {
                Object.setPrototypeOf(controlMd, prototype);
            });
        };

        /**
         * @name getControlMd
         * @memberof uiComposer:services:npPageMetadataHelper
         * @param {string} controlId
         * @param {object} pageMd
         * @returns {ControlMd} The control metadata object for a certain control.
         */
        var getControlMd = function (controlId, pageMd) {
            return _.find(pageMd.controls, {
                controlId: controlId
            });
        };


        /**
         * @name getControlAndChildMd
         * @memberof uiComposer:services:npPageMetadataHelper
         * @param {string} controlId
         * @param {object} pageMd
         * @returns {ControlMd[]} Array of control md objects in parent-child order (parent, 1st level children, 2nd level children, ...)
         */
        var getControlAndChildMd = function (controlId, pageMd) {
            var controlMd = getControlMd(controlId, pageMd);
            if (!controlMd) {
                return [];
            }
            var childrenMd = _.chain(controlMd.groups)
                .map(function (group) {
                    return _.chain(group.children)
                        .map(function (childId) {
                            return getControlAndChildMd(childId, pageMd);
                        })
                        .flatten().value();
                })
                .flatten()
                .uniq('controlId').value();
            return [controlMd].concat(childrenMd);
        };
        /**
         * @name getControlsMd
         * @memberof uiComposer:services:npPageMetadataHelper
         * @param {string[]} controlIds
         * @param {object} pageMd
         * @returns {ControlMd[]} The array of control metadata.
         */
        var getControlsMd = function (controlIds, pageMd) {
            return _.map(controlIds, function (controlId) {
                return getControlMd(controlId, pageMd);
            });
        };

        /**
         * @name getControlsAndChildMd
         * @memberof uiComposer:services:npPageMetadataHelper
         * @param {string[]} controlIds
         * @param {object} pageMd
         * @returns {ControlMd[]} Array of control md objects in parent-child order (parent, 1st level children, 2nd level children, ...)
         */
        var getControlsAndChildMd = function (controlIds, pageMd) {
            var mdObjects = _.chain(controlIds).map(function (controlId) {
                return getControlAndChildMd(controlId, pageMd);
            }).flatten().value();
            mdObjects = _.uniq(mdObjects, 'controlId');
            return mdObjects;
        };

        /**
         * @name canEditProperty
         * @memberof uiComposer:services:npPageMetadataHelper
         * @param {ControlMd} controlMd
         * @param {string} propertyName
         * @returns {boolean} canEdit
         */
        var canEditProperty = function (controlMd, propertyName) {
            var editableProperties = npUiCatalog.getControlProperties(controlMd.catalogControlName, controlMd.catalogId) || {};
            return propertyName in editableProperties;
        };

        /**
         * @name canEditGroup
         * @memberof uiComposer:services:npPageMetadataHelper
         * @param {ControlMd} controlMd
         * @param {string} groupId
         * @returns {boolean} canEdit
         */
        var canEditGroup = function (controlMd, groupId) {
            var editableGroups = npUiCatalog.getControlAggregations(controlMd.catalogControlName, controlMd.catalogId) || {};
            return groupId in editableGroups;
        };

        var isControlDef = function (obj) {
            return !!obj.newCtrlCatalogName;
        };
        var isControlMd = function (obj) {
            return !!obj.catalogControlName && !!obj.catalogId;
        };

        var isBound = function (groupMd) {
            return !_.isEmpty(groupMd) && !_.isEmpty(groupMd.binding) && !_.isEmpty(groupMd.binding.paths);
        };

        var isTemplate = function (controlMd) {
            var groupMd = getContainingGroupMd(controlMd);
            return isBound(groupMd);
        };

        var getTopMostTemplate = function (controlMd) {
            var topMostTemplate = null;
            while (controlMd) {
                if (isTemplate(controlMd)) {
                    topMostTemplate = controlMd;
                }
                controlMd = controlMd.getParentMd();
            }
            return topMostTemplate;
        };

        /**
         * @description finds a particular event from the control
         * @param eventID takes a string event ID of the event obj to be returned
         * @param controlMD takes a controlMetaData object
         * @returns {eventMD} returns the eventMetadata object
         */
        var getEventMd = function (eventId, controlMd) {
            return _.find(controlMd.events, {eventId: eventId});

        };

        /**
         * @name getControlProperty
         * @memberof uiComposer:services:npPageMetadataHelper
         * @param {string} propertyName
         * @param {Object} controlMd
         * @returns {PropertyMd} The property metadata for a certain property.
         */
        var getControlProperty = function (propertyName, controlMd) {
            return _.find(controlMd.properties, {name: propertyName});
        };

        /**
         * @name getControlDesignProperty
         * @memberof uiComposer:services:npPageMetadataHelper
         * @param {string} designPropertyName
         * @param {Object} controlMd
         * @returns {DesignPropertyMd} The design property metadata for a certain property.
         */
        var getControlDesignProperty = function (designPropertyName, controlMd) {
            return _.find(controlMd.designProperties, {name: designPropertyName});
        };

        /**
         * @name getGroupMd
         * @memberof uiComposer:services:npPageMetadataHelper
         * @param {string} groupId
         * @param {Object} controlMd
         * @returns {groupMD} The group metadata for a given group.
         */
        var getGroupMd = function (groupId, controlMd) {
            return _.find(controlMd.groups, {groupId: groupId});
        };
        /**
         * @name getContainingGroupMd
         * @memberof uiComposer:services:npPageMetadataHelper
         * @param {Object} controlMd
         * @returns {groupMD} The group metadata where the control is contained.
         */
        var getContainingGroupMd = function (controlMd) {
            var parentMd = controlMd.getParentMd(),
                groupMd = parentMd ? getGroupMd(controlMd.parentGroupId, parentMd) : null;
            return groupMd;
        };


        /**
         * @name canHaveSiblings
         * @memberof uiComposer:services:npPageMetadataHelper
         * @description if a control is inside an group that allows having multiple children
         * @param {Object} controlMd
         * @returns {boolean}
         */
        var canHaveSiblings = function (controlMd) {
            if (controlMd && !_.isEmpty(controlMd.parentControlId) && !_.isEmpty(controlMd.parentGroupId)) {
                var parentMd = controlMd.getParentMd();
                return npUiCatalog.isMultipleAggregation(controlMd.parentGroupId, parentMd.catalogControlName, parentMd.catalogId);
            }
            return false;
        };

        /**
         * @name adjustChildIndexes
         * @memberof uiComposer:services:npPageMetadataHelper
         * @description Iterates over group's children and assigns new values for the children's parentGroupIndex property.
         * @description if a control is inside an group that allows having multiple children
         * @param {Object} controlMd
         * @param {string} groupId
         */
        var adjustChildIndexes = function (controlMd, groupId) {
            _.forEach(controlMd.getChildrenMd(groupId), function (childMd, i) {
                childMd.parentGroupIndex = i;
            });
        };

        /**
         * @name canMoveControl
         * @memberof uiComposer:services:npPageMetadataHelper
         * @description Returns true if this controlMd can be moved, false otherwise.
         * Will allow move for controls that are not templates, that have a parent.
         * @param {Object} controlMd
         * @returns {boolean}
         */
        var canMoveControl = function (controlMd) {
            return !isTemplate(controlMd) && !!controlMd.getParentMd();
        };


        /**
         * @name getDisplayableProperties
         * @memberof uiComposer:services:npPageMetadataHelper
         * @description returns the properties that can be edited by the user. Will check through the catalog to see which property is editable
         * @param controlMd
         * @returns {PropertyMd[]}
         */
        var getDisplayableProperties = function (controlMd) {
            var properties = npUiCatalog.getControlProperties(controlMd.catalogControlName, controlMd.catalogId, true);
            if (_.isEmpty(properties)) {
                return [];
            }
            return _.filter(controlMd.properties, function (propertyMd) {
                return _.some(properties, {name: propertyMd.name});
            });
        };


        /**
         * @name getDisplayableGroups
         * @memberof uiComposer:services:npPageMetadataHelper
         * @description returns the groups that can be edited by the user. Will check through the catalog to see which group is editable
         * @param controlMd
         * @returns {GroupMd[]}
         */
        var getDisplayableGroups = function (controlMd) {
            var aggregations = npUiCatalog.getControlAggregations(controlMd.catalogControlName, controlMd.catalogId, true);
            if (_.isEmpty(aggregations)) {
                return [];
            }
            return _.filter(controlMd.groups, function (groupMd) {
                return _.some(aggregations, {name: groupMd.groupId});
            });
        };

        return {
            setControlMdPrototype: setControlMdPrototype,
            getControlMd: getControlMd,
            getControlAndChildMd: getControlAndChildMd,
            getControlsMd: getControlsMd,
            getControlsAndChildMd: getControlsAndChildMd,
            canEditProperty: canEditProperty,
            canEditGroup: canEditGroup,
            isBound: isBound,
            getGroupMd: getGroupMd,
            getContainingGroupMd: getContainingGroupMd,
            getControlProperty: getControlProperty,
            getControlDesignProperty: getControlDesignProperty,
            isControlDef: isControlDef,
            isControlMd: isControlMd,
            isTemplate: isTemplate,
            getTopMostTemplate: getTopMostTemplate,
            getEventMd: getEventMd,
            canHaveSiblings: canHaveSiblings,
            adjustChildIndexes: adjustChildIndexes,
            canMoveControl: canMoveControl,
            getDisplayableProperties: getDisplayableProperties,
            getDisplayableGroups: getDisplayableGroups
        };
    }
];

module.exports = npPageMetadataHelper;

'use strict';

var _ = require('norman-client-tp').lodash;

/**
 * The npCanvasElementDrop service is used to handle the drop of new controls in to the canvas or existing controls
 * within the canvas based on the drop position.
 * @module npCanvasElementDrop
 */

/**
 * @typedef {Object} DropData
 * @memberof npCanvasElementDrop
 * @description contains parentId, groupId, index
 * @param {string} parentId
 * @param {string} groupId
 * @param {int} [index]
 */
var npCanvasElementDrop = ['$rootScope', '$q', '$log', 'npGrid', 'npBindingHelper', 'npPageMetadata', 'npPageMetadataHelper', 'npUiCatalog', 'npFormFactor', 'npPageMetadataEvents', 'npLayoutHelper', 'npUiCanvasAPI',
    function ($rootScope, $q, $log, npGrid, npBindingHelper, npPageMetadata, npPageMetadataHelper, npUiCatalog, npFormFactor, pageMdEvents, npLayoutHelper, npUiCanvasAPI) {

        var self = this;

        /**
         * @name getDropData
         * @description Returns the parentId, groupId, index where the controlMd can be dropped.
         * If targetMd accepts controlMd into his default aggregation, it will be the parentId.
         * Otherwise, it is assumed that the targetMd parent accepts controlMd.
         * Will return undefined if no group is found
         * @param {object} controlMd
         * @param {object} targetMd
         * @returns {DropData|undefined}
         */
        self.getDropData = function (controlMd, targetMd) {
            if (!targetMd) {
                return undefined;
            }
            var parentId = targetMd.controlId,
                groupId = npUiCatalog.getControlDefaultAggregation(targetMd.catalogControlName, targetMd.catalogId),
                index;

            // if it cannot be put into the default aggregation, try to put as sibling of the target
            if (_.isEmpty(groupId) || !npUiCatalog.isControlValidInAggregation(controlMd.catalogControlName, controlMd.catalogId, targetMd.catalogControlName, targetMd.catalogId, groupId)) {
                // TODO check if parent accepts controlMd
                parentId = targetMd.parentControlId;
                groupId = targetMd.parentGroupId;
                if (!npLayoutHelper.isAbsoluteLayout() || !targetMd.isRootChild()) {
                    index = targetMd.parentGroupIndex;
                }
            }
            // null means the control cannot be dropped anywhere
            if (_.isEmpty(groupId) || _.isEmpty(parentId)) {
                return undefined;
            }
            return {
                parentId: parentId,
                groupId: groupId,
                index: index
            };
        };

        var getMd = function (controlMd, targetMd, positionData) {
            positionData = positionData || {};
            var dropData = self.getDropData(controlMd, targetMd);
            // null means the control cannot be dropped anywhere
            if (_.isEmpty(dropData)) {
                $log.error('npCanvasElementDrop: cannot insert control into target', controlMd, targetMd, positionData);
                return undefined;
            }

            // case where the control should maintain its old index
            if (dropData.index === undefined && controlMd.parentControlId === dropData.parentId && controlMd.parentGroupId === dropData.groupId) {
                dropData.index = controlMd.parentGroupIndex;
            }
            return {
                controlId: controlMd.controlId,
                newCtrlCatalogName: controlMd.catalogControlName,
                catalogId: controlMd.catalogId,
                parentId: dropData.parentId,
                groupId: dropData.groupId,
                index: dropData.index,
                x: positionData.x,
                y: positionData.y,
                // TODO check if this can be done in 2 separate udpates. Currently needed for image drop only
                properties: controlMd.properties
            };
        };

        /**
         * @private
         * @description Moves the element completely into canvas in case part of it is out of canvas bounds after dropping it
         */
        var adjustPositionIfNecessary = function (addedControls) {
            var gridElement = npGrid.getElementForControlId(addedControls[0].controlId);
            if (_.isEmpty(gridElement)) {
                return $q.reject('grid element not found for control', addedControls[0].controlId);
            }
            var currentFormFactor = npFormFactor.getCurrentFormFactor(),
                canvasWidth = _.parseInt(currentFormFactor.width),
                canvasHeight = _.parseInt(currentFormFactor.height),
                elemRect = {},
                newPos = {};

            _.forEach(['width', 'height', 'left', 'top'], function (prop) {
                elemRect[prop] = _.parseInt(gridElement.style[prop]);
            });

            if (elemRect.left + elemRect.width > canvasWidth) {
                newPos.x = Math.max(canvasWidth - elemRect.width, 0);
            }
            if (elemRect.top + elemRect.height > canvasHeight) {
                newPos.y = Math.max(canvasHeight - elemRect.height, 0);
            }

            if (!_.isEmpty(newPos)) {
                return npPageMetadata.moveControl({
                    controlId: gridElement.controlMd.controlId,
                    parentId: gridElement.controlMd.parentControlId,
                    groupId: gridElement.controlMd.parentGroupId,
                    index: gridElement.controlMd.parentGroupIndex,
                    x: newPos.x || elemRect.left,
                    y: newPos.y || elemRect.top
                }, {
                    combineWithPreviousOperation: true
                });
            }
            return $q.when(addedControls);
        };

        var _bindProperty = function (controlMd, propertyDef) {
            return npPageMetadata.changeProperty({
                controlId: controlMd.controlId,
                properties: [propertyDef]
            });
        };

        var _bindEntity = function (controlMd, parentControlMd, groupMd, compatiblePaths, propertyDef) {
            var changeBindingData = {
                controlId: parentControlMd.controlId,
                groupId: groupMd.groupId,
                binding: compatiblePaths[0].binding,
                properties: propertyDef ? [propertyDef] : undefined,
                autoBind: propertyDef ? false : true
            };

            var currentPage = npPageMetadata.getCurrentPageName();
            return npPageMetadata.getPageMetadata(currentPage)
                .then(function (pageMd) {
                    var currentTemplate = npPageMetadataHelper.getControlMd(groupMd.children[0], pageMd);
                    var didChangeTemplate = !npPageMetadataHelper.isBound(groupMd) || currentTemplate.catalogControlName !== parentControlMd.catalogControlName;

                    if (didChangeTemplate) {
                        changeBindingData.template = {
                            newCtrlCatalogName: controlMd.catalogControlName,
                            catalogId: controlMd.catalogId
                        };
                    }

                    return npPageMetadata.changeBinding(changeBindingData);
                });
        };

        var getPropertyDef = function (editableProperty, compatiblePropertyPaths) {
            var result;
            if (!_.isEmpty(compatiblePropertyPaths) && !_.isEmpty(editableProperty)) {
                result = {
                    name: editableProperty.name,
                    value: compatiblePropertyPaths[0].path,
                    binding: compatiblePropertyPaths[0].binding
                };
            }
            return result;
        };

        /**
         * @name dropBindingAtControl
         * @description Handles the dropping of model entities or properties on the canvas based on provided drag data.
         * @param {object} dragData Object that can contain the following properties
         * @param {Object} targetMd
         */
        var dropBindingAtTarget = function (dragData, targetMd, positionData) {
            if (_.isEmpty(targetMd)) {
                return $q.reject('Control cannot be dropped here.');
            }
            return npPageMetadata.getMainEntity().then(function (mainEntity) {
                var editableProperty = npUiCanvasAPI.getEditablePropertyAtPosition(targetMd, positionData.x, positionData.y);
                var contextEntity = npBindingHelper.getContextEntity(targetMd, mainEntity);
                var compatiblePaths = npBindingHelper.getPathsCompatibleWithParentGroup(targetMd, dragData.entityName, mainEntity);
                var parentControlMd = targetMd.getParentMd();
                var groupMd = parentControlMd ? npPageMetadataHelper.getGroupMd(targetMd.parentGroupId, parentControlMd) : undefined;
                var compatiblePropertyPaths, propertyDef;

                if (contextEntity) {
                    compatiblePropertyPaths = npBindingHelper.getPathsCompatibleWithControlProperty(targetMd, contextEntity._id, editableProperty, dragData.entityId, dragData.propertyId);
                }

                if (!_.isEmpty(compatiblePropertyPaths)) {
                    propertyDef = getPropertyDef(editableProperty, compatiblePropertyPaths);
                    return _bindProperty(targetMd, propertyDef);
                }
                else if (!_.isEmpty(compatiblePaths)) {
                    if (dragData.propertyId && editableProperty) {
                        compatiblePropertyPaths = npBindingHelper.getPathsCompatibleWithControlProperty(targetMd, dragData.entityId, editableProperty, dragData.entityId, dragData.propertyId);
                    }
                    if (!dragData.propertyId || (!_.isEmpty(compatiblePropertyPaths) && !npPageMetadataHelper.isBound(groupMd))) {
                        if (!_.isEmpty(compatiblePropertyPaths) && !npPageMetadataHelper.isBound(groupMd)) {
                            propertyDef = getPropertyDef(editableProperty, compatiblePropertyPaths);
                        }
                        return _bindEntity(targetMd, parentControlMd, groupMd, compatiblePaths, propertyDef);
                    }
                }
            });
        };

        var dropControlAtTarget = function (controlData, targetMd, position) {
            var md = getMd(controlData, targetMd, position);
            if (!md) {
                return $q.reject('Control cannot be dropped here.');
            }
            return npPageMetadata.addControl(md)
                .then(function (addedControls) {
                    var layoutReadyListener = $rootScope.$on('npGrid/layoutUpdated', function () {
                        layoutReadyListener();
                        adjustPositionIfNecessary(addedControls);
                    });
                });
        };

        /**
         * @name dropAtTarget
         * @description Handles the dropping of elements on the canvas based on provided drag data.
         * @param {object} dragData Object that can contain the following properties
         * @param {Object} targetMd
         * @param {Object} positionData
         * ie. x: x mouse position, y: y mouse position
         */
        self.dropAtTarget = function (dragData, targetMd, positionData) {
            if (_.isEmpty(targetMd)) {
                return $q.reject('Control cannot be dropped here.');
            }
            if (dragData.isBinding) {
                return dropBindingAtTarget(dragData, targetMd, positionData);
            }
            return dropControlAtTarget(dragData, targetMd, positionData);
        };

        self.moveAtTarget = function (controlMd, targetMd, positionData) {
            if (_.isEmpty(targetMd)) {
                return $q.reject('Control cannot be moved here.');
            }
            var md = getMd(controlMd, targetMd, positionData);
            if (!md) {
                return $q.reject('Control cannot be moved here.');
            }
            return npPageMetadata.moveControl(md);
        };

        return self;
    }
];

module.exports = npCanvasElementDrop;

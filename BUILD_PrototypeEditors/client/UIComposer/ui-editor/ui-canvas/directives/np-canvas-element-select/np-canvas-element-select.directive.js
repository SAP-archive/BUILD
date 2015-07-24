'use strict';

var _ = require('norman-client-tp').lodash;

/**
 * The npCanvasElementSelect directive handles element selection for the entire canvas.
 * It relies primarily on the npGrid service to get elements at click position and select/unselect them.
 */

var npCanvasElementSelect = ['npGrid', 'npGridPosition', 'npLayoutHelper', 'npUiCatalog', 'npCanvasInteractionHelper', 'npCanvasInlineEditHelper',
    function (npGrid, npGridPosition, npLayoutHelper, npUiCatalog, npCanvasInteractionHelper, inlineEditHelper) {
        return {
            restrict: 'A',
            link: function (scope) {
                /************************/
                /* Common functionality */
                /************************/

                /**
                 * @private
                 * @description Select an element if it is not already selected. Checks if event has happened to the canvas
                 * @param {GridElement} elem
                 * @param {Object} [event]
                 */
                var selectElement = function (elem, event) {
                    var notClickedOnPropPanel = !event || event.metaKey || !_.findParentByClass(angular.element(event.target), 'js-prop-box');
                    if (notClickedOnPropPanel) {
                        var elems = elem ? [elem] : null;
                        npGrid.setSelectedElements(elems);
                    }
                };

                /***********************/
                /* Left click handling */
                /***********************/


                /**
                 * @private
                 * @description Handles selection using double clicks and sends property edit request.
                 */
                var handleDoubleClick = function (event) {
                    var x = event.canvasX,
                        y = event.canvasY;

                    var gridElements = npGridPosition.getClosestElementsAtPosition(x, y);
                    if (gridElements && gridElements.length > 0) {
                        inlineEditHelper.startInlineEdit(gridElements, x, y);
                    }
                };


                /**
                 * @private
                 * @description Handles selection using single clicks. Single click behaviour can be devided in three cases:
                 * - If there is only 1 element at click position select it.
                 * - If there are multiple elements at click position and any of them is selected keep it selected, otherwise select the top level element.
                 * - If there are multiple elements at click position, none of them is selected but a sibling is selected then find the common ancestor of
                 *   the deepest element at that position and the selected sibling and select the element that is one level below the common ancestor at click position
                 * Sends property edit request in case the click happens on the already selected control
                 */
                var handleSingleClick = function (event) {
                    var selectedElements = npGrid.getSelectedElements(),
                        x = event.canvasX,
                        y = event.canvasY,
                        elementToSelect;

                    // leverage current selection to move to children or parents
                    if (selectedElements.length) {
                        // find the element at the position (either child or parent)
                        var elementAtPosition = getElementAtPosition(selectedElements, x, y) || getParentAtPosition(selectedElements[0], x, y);
                        if (elementAtPosition) {
                            // search in its children or the same selected element
                            elementToSelect = getElementAtPosition(elementAtPosition.children, x, y) || elementAtPosition;
                        }
                    }
                    // if element
                    var elementsAtPosition = npGridPosition.getElementsAtPosition(x, y),
                        index = _.findIndex(elementsAtPosition, elementToSelect);
                    elementToSelect = npGrid.getTopElement(elementsAtPosition, index);
                    if (elementToSelect) {
                        // only send the edit property request if click is on the already selected element
                        if (_.contains(selectedElements, elementToSelect)) {
                            inlineEditHelper.startInlineEdit([elementToSelect], x, y);
                        }
                    }
                    selectElement(elementToSelect, event);
                };

                /**
                 * @private
                 * @description returns the element that contains the point in the array.
                 * @param {object[]} elements
                 * @param {number} x coordinate
                 * @param {number} y coordinate
                 */
                var getElementAtPosition = function (elements, x, y) {
                    // search into the elements
                    var result = _.findLast(elements, function (element) {
                        return npGridPosition.containsPoint(element, x, y);
                    });
                    if (!result) {
                        // use find so it will stop as soon as result is found
                        _.findLast(elements, function (element) {
                            result = getElementAtPosition(element.children, x, y);
                            return !!result;
                        });
                    }
                    return result;
                };

                /**
                 * @private
                 * @description returns the parent at a specific position
                 * @param {object} element
                 * @param {number} x coordinate
                 * @param {number} y coordinate
                 */
                var getParentAtPosition = function (element, x, y) {
                    var result;
                    var parentId = element.parentId;
                    while (!result && parentId !== -1) {
                        var parent = npGrid.getElement(parentId);
                        if (npGridPosition.containsPoint(parent, x, y)) {
                            result = parent;
                        }
                        else {
                            parentId = parent.parentId;
                        }
                    }
                    return result;
                };


                var ml1 = npCanvasInteractionHelper.on(npCanvasInteractionHelper.supportedEvents.click, handleSingleClick, true);
                var ml2 = npCanvasInteractionHelper.on(npCanvasInteractionHelper.supportedEvents.dblclick, handleDoubleClick, true);

                /************************/
                /* Right click handling */
                /************************/
                scope.uieditor.rightclickMenu.selectElement = function (elem) {
                    selectElement(elem.gridElement);
                };

                var ml3;
                var showSelectionMenu = function (event) {
                    event.preventDefault();
                    var elementsAtPosition = npGridPosition.getElementsAtPosition(event.canvasX, event.canvasY, npLayoutHelper.isAbsoluteLayout()),
                        rightclickMenu = scope.uieditor.rightclickMenu;

                    if (elementsAtPosition.length) {
                        rightclickMenu.elements = [];
                        _.forEach(elementsAtPosition, function (elem) {
                            var controlMd = elem.controlMd,
                                ctrlName = npUiCatalog.getControlDisplayName(controlMd.catalogControlName, controlMd.catalogId);
                            rightclickMenu.elements.push({
                                name: ctrlName,
                                gridElement: elem
                            });
                        });
                        rightclickMenu.styles.top = event.pageY + 'px';
                        rightclickMenu.styles.left = event.pageX + 'px';
                        rightclickMenu.show = true;
                        ml3 = npCanvasInteractionHelper.on(npCanvasInteractionHelper.supportedEvents.click, dismissSelectionMenu);
                        angular.element(document.querySelector('.np-e-canvas-container-js')).on('scroll', dismissSelectionMenu);
                        scope.$apply();
                    }
                };

                var dismissSelectionMenu = function () {
                    scope.uieditor.rightclickMenu.show = false;
                    if (_.isFunction(ml3)) {
                        ml3();
                    }
                    angular.element(document.querySelector('.np-e-canvas-container-js')).off('scroll', dismissSelectionMenu);
                    scope.$apply();
                };

                var ml4 = npCanvasInteractionHelper.on(npCanvasInteractionHelper.supportedEvents.contextmenu, showSelectionMenu, true);

                /***********/
                /* Cleanup */
                /***********/
                scope.$on('$destroy', function cleanup() {
                    _.forEach([ml1, ml2, ml3, ml4], function (listener) {
                        if (_.isFunction(listener)) {
                            listener();
                        }
                    });
                });
            }
        };
    }
];

module.exports = npCanvasElementSelect;

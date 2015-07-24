'use strict';

var _ = require('norman-client-tp').lodash;

var npCanvasElementResizable = ['$rootScope', '$document', '$log', 'npGrid', 'npSnapGuide', 'npImageHelper', 'npCanvasInteractionHelper', 'npConstants', 'npPageMetadataHelper', 'npPropertyChangeObserver', 'npPageMetadata', 'npUiCanvasAPI',
    function ($rootScope, $document, $log, npGrid, npSnapGuide, npImageHelper, npCanvasInteractionHelper, npConstants, pageMdHelper, npPropertyChangeObserver, npPageMetadata, npUiCanvasAPI) {
        return {
            restrict: 'A',
            link: function (scope, element) {

                var selectedElement, isLockedAspectRatio, isWidthHandler, isHeightHandler, isWidthAndHeightHandler, _dragstartListener, _dragmoveListener, _dragendListener, aspectRatio;

                var mx = 0, my = 0,
                    parent = document.getElementById('canvas-runtime'),
                    parentElement = angular.element(parent);

                // enable resize handlers
                var getLockedAspectRatio = function (gridElement) {
                    var lockPropertyMd = pageMdHelper.getControlDesignProperty(npConstants.designProperties.LOCKASPECT, gridElement.controlMd) || {};
                    // value is still string need to convert string to boolean
                    return gridElement.resizableWidth && gridElement.resizableHeight && lockPropertyMd.value;
                };

                var getDimensionValue = function (position, parentBounds, elementBounds) {
                    var result = (position > parentBounds) ? parentBounds - elementBounds : position - elementBounds;
                    return Math.round(result);
                };
                var getElementBounds = function (gridElement) {
                    return {
                        left: _.parseInt(gridElement.style.left),
                        top: _.parseInt(gridElement.style.top),
                        height: _.parseInt(gridElement.style.height),
                        width: _.parseInt(gridElement.style.width)
                    };
                };

                var getProperties = function (gridElement) {
                    var properties = [];
                    if (gridElement.resizableWidth) {
                        properties.push({
                            name: npConstants.sizeProperties.WIDTH,
                            value: gridElement.style.width
                        });
                    }
                    if (gridElement.resizableHeight) {
                        properties.push({
                            name: npConstants.sizeProperties.HEIGHT,
                            value: gridElement.style.height
                        });
                    }
                    return properties;
                };

                // Function to manage resize right event
                var resizeRight = function () {
                    var elementBounds = getElementBounds(selectedElement);
                    var width = getDimensionValue(mx, parentElement[0].offsetWidth, elementBounds.left);
                    var x = elementBounds.left + width,
                        y = elementBounds.top + elementBounds.height,
                        snapPosition = npSnapGuide.updateSnapPosition(x, y, '<div></div>');
                    if (snapPosition && snapPosition.x) {
                        width = snapPosition.x - elementBounds.left;
                    }
                    selectedElement.style.width = Math.max(0, width) + 'px';

                    if (isLockedAspectRatio) {
                        var height = npImageHelper.getHeightForFixedWidth(aspectRatio, width);
                        selectedElement.style.height = height + 'px';
                    }
                };

                // Function to manage resize down event
                var resizeDown = function () {
                    var elementBounds = getElementBounds(selectedElement);
                    var height = getDimensionValue(my, parentElement[0].offsetHeight, elementBounds.top);
                    var x = elementBounds.left + elementBounds.width,
                        y = elementBounds.top + height,
                        snapPosition = npSnapGuide.updateSnapPosition(x, y, '<div></div>');
                    if (snapPosition && snapPosition.y) {
                        height = snapPosition.y - elementBounds.top;
                    }
                    selectedElement.style.height = Math.max(0, height) + 'px';

                    if (isLockedAspectRatio) {
                        var width = npImageHelper.getWidthForFixedHeight(aspectRatio, height);
                        selectedElement.style.width = width + 'px';
                    }
                };

                var updateCanvas = _.throttle(function () {
                    var controlMd = selectedElement.controlMd,
                        properties = getProperties(selectedElement);
                    npUiCanvasAPI.setControlPropertiesByMd(controlMd, properties);
                    npPropertyChangeObserver.doPropertyChange(controlMd, properties);
                    // todo find better way to do this
                    $rootScope.$digest();
                }, 10);

                var getGridElementId = function (target) {
                    var elementId = null;
                    while (target && target !== element[0]) {
                        elementId = target.getAttribute('data-element-id');
                        if (elementId) {
                            break;
                        }
                        target = target.parentNode;
                    }
                    return elementId;
                };

                var onDragstart = function (event) {
                    isWidthHandler = event.target.classList.contains('np-c-e-resize');
                    isHeightHandler = event.target.classList.contains('np-c-s-resize');
                    isWidthAndHeightHandler = event.target.classList.contains('np-c-se-resize');
                    if (!isWidthHandler && !isHeightHandler && !isWidthAndHeightHandler) {
                        return;
                    }
                    var elementId = getGridElementId(event.target);
                    if (!elementId) {
                        return;
                    }

                    mx = my = 0;
                    selectedElement = npGrid.getElement(elementId);

                    isLockedAspectRatio = getLockedAspectRatio(selectedElement);

                    if (isLockedAspectRatio) {
                        var currentWidth = _.parseInt(selectedElement.style.width);
                        var currentHeight = _.parseInt(selectedElement.style.height);
                        aspectRatio = npImageHelper.calcAspectRatio(currentWidth, currentHeight);
                    }


                    _dragmoveListener = npCanvasInteractionHelper.on(npCanvasInteractionHelper.supportedEvents.dragmove, onDragmove, true);
                    _dragendListener = npCanvasInteractionHelper.on(npCanvasInteractionHelper.supportedEvents.dragend, onDragend);

                    npSnapGuide.updateElementsPositions(selectedElement);

                    return false;
                };

                var onDragmove = function (event) {
                    if (!selectedElement) {
                        $log.warn('mousemoveresize called without selectedElement');
                        return;
                    }
                    npSnapGuide.clearGuideLines();
                    my = event.canvasY;
                    mx = event.canvasX;
                    if (isWidthHandler || isWidthAndHeightHandler) {
                        resizeRight(event);
                    }
                    if (isHeightHandler || isWidthAndHeightHandler) {
                        resizeDown(event);
                    }
                    updateCanvas();
                };

                var onDragend = function () {
                    if (!selectedElement) {
                        $log.warn('mousemoveresize called without selectedElement');
                        return;
                    }
                    npPageMetadata.changeProperty({
                        controlId: selectedElement.controlMd.controlId,
                        properties: getProperties(selectedElement)
                    });

                    npSnapGuide.clearGuideLines();
                    typeof _dragmoveListener === 'function' && _dragmoveListener();
                    typeof _dragendListener === 'function' && _dragendListener();

                    selectedElement = undefined;
                };

                _dragstartListener = npCanvasInteractionHelper.on(npCanvasInteractionHelper.supportedEvents.dragstart, onDragstart, true);

                scope.$on('$destroy', function () {
                    typeof _dragstartListener === 'function' && _dragstartListener();
                    typeof _dragmoveListener === 'function' && _dragmoveListener();
                    typeof _dragendListener === 'function' && _dragendListener();
                });
            }
        };
    }];

module.exports = npCanvasElementResizable;

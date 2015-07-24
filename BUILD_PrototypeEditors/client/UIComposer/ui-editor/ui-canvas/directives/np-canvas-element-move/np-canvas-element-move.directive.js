'use strict';

var _ = require('norman-client-tp').lodash;

var npCanvasElementMove = ['$rootScope', '$timeout', '$log', '$document', 'npGrid', 'npGridPosition', 'npSnapGuide', 'npCanvasElementHighlight', 'npCanvasElementDrop', 'npCanvasInteractionHelper', 'npCanvasInlineEditHelper', 'npUiCanvasAPI', 'npPageMetadataHelper', 'npMessaging',
    function ($rootScope, $timeout, $log, $document, npGrid, npGridPosition, npSnapGuide, npCanvasElementHighlight, npCanvasElementDrop, npCanvasInteractionHelper, inlineEditHelper, npUiCanvasAPI, npPageMetadataHelper, npMessaging) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                var DISABLE_USER_SELECT_CLASS = 'np-e-disable-user-select',
                    _dragstartListener, _dragmoveListener, _dragendListener,
                    _elemToMove, // the element that is moved in canvas
                    _gridElemDomRef, // dom reference of element to move
                    _originalStyles, // element original styles
                    _originalPosition = {}, // element start position
                    _mousePosition = {},
                    _elementOrigin = {},// the top left corner of the element being moved
                    _elementAnchor = {},// x,y point with values [0,1]
                    body,
                    wrapper;

                var init = function () {
                    body = $document.find('body');
                    wrapper = generateDragWrapper();
                    _dragstartListener = npCanvasInteractionHelper.on(npCanvasInteractionHelper.supportedEvents.dragstart, onDragstart, true);
                };

                var generateDragWrapper = function () {
                    var elementWrapper = document.createElement('div');
                    elementWrapper.setAttribute('id', 'dragWrapper');

                    applyStyles(elementWrapper, {
                        position: 'absolute',
                        'z-index': '9999',
                        'pointer-events': 'none',
                        opacity: 0.7
                    });
                    return elementWrapper;
                };

                var reset = function () {
                    _elemToMove = _gridElemDomRef = undefined;
                    _elementOrigin = _originalStyles = _elementAnchor = _originalPosition = _mousePosition = {};
                };

                // Method to create clone of the control to be dragged
                var prepareDragWrapper = function (ctrlDom) {

                    if (removeDragWrapper()) {
                        $log.warn('wrapper was not removed from body');
                    }

                    var rect = ctrlDom.getBoundingClientRect();
                    applyStyles(wrapper, {
                        width: rect.width + 'px',
                        height: rect.height + 'px',
                        left: rect.left + 'px',
                        top: rect.top + 'px'
                    });

                    var clone = ctrlDom.cloneNode(true);
                    clone.setAttribute('id', '');

                    wrapper.appendChild(clone);

                    npUiCanvasAPI.getWindow().document.querySelector('body').appendChild(wrapper);
                };

                var removeDragWrapper = function () {
                    var wrapperElement = npUiCanvasAPI.getWindow().document.getElementById('dragWrapper');
                    if (wrapperElement) {
                        while (wrapperElement.firstChild) {
                            wrapperElement.removeChild(wrapperElement.firstChild);
                        }
                        wrapperElement.parentNode.removeChild(wrapperElement);
                        return true;
                    }
                    return false;
                };

                var applyStyles = function (elementObj, styles) {
                    if (!elementObj || _.isEmpty(styles)) {
                        return;
                    }
                    _.forEach(styles, function (value, key) {
                        elementObj.style[key] = value;
                    });
                };

                var getAnchor = function (elementObj, touchPosition) {
                    var ctrlTop = _.parseInt(elementObj.style.top),
                        ctrlLeft = _.parseInt(elementObj.style.left),
                        ctrlWidth = _.parseInt(elementObj.style.width),
                        ctrlHeight = _.parseInt(elementObj.style.height),
                        x = (touchPosition.x - ctrlLeft) / ctrlWidth,
                        y = (touchPosition.y - ctrlTop) / ctrlHeight;
                    // normalize x,y between 0,1
                    return {
                        x: Math.min(Math.max(x, 0), 1),
                        y: Math.min(Math.max(y, 0), 1)
                    };
                };

                /**
                 * @private
                 * @description returns the new position for the event
                 */
                var getPosition = function (gridElement, anchor, event) {
                    var position = getOriginPoint({left: event.canvasX, top: event.canvasY}, gridElement, anchor);
                    var point = getPoint(position.left, position.top, event.canvasWidth, event.canvasHeight, gridElement);
                    return {
                        left: point.left + 'px',
                        top: point.top + 'px'
                    };
                };

                /**
                 * @private
                 * @description returns a shifted point according to the element origin
                 */
                var getOriginPoint = function (point, elementObj, anchor) {
                    var width = _.parseInt(elementObj.style.width);
                    var height = _.parseInt(elementObj.style.height);
                    return {
                        left: point.left - width * anchor.x,
                        top: point.top - height * anchor.y
                    };
                };

                /**
                 * @private
                 * @description updates the snap position and returns a normalized point (within the canvas boundaries)
                 */
                var getPoint = function (left, top, canvasWidth, canvasHeight, elementObj) {
                    npSnapGuide.clearGuideLines();
                    var snapPosition = npSnapGuide.updateSnapPosition(left, top, elementObj.domRef()) || {};
                    top = snapPosition.y ? snapPosition.y : top;
                    left = snapPosition.x ? snapPosition.x : left;

                    // Check canvas border conditions and keep dragging element within canvas border
                    left = normalizeValue(left, canvasWidth, elementObj.style.width);
                    top = normalizeValue(top, canvasHeight, elementObj.style.height);

                    return {
                        left: left,
                        top: top
                    };
                };

                /**
                 * @private
                 * @description given a value, ensures it stays within boundaries of the canvas
                 */
                var normalizeValue = function (value, canvasSize, elementSize) {
                    elementSize = _.parseInt(elementSize);
                    var minValue = 0;
                    var maxValue = Math.max(minValue, canvasSize - elementSize);
                    return Math.min(maxValue, Math.max(value, minValue));
                };

                /**
                 * @private
                 * @description Finds the appropriate element to move on dragstart
                 */
                var findElementToMove = function (event) {
                    if (inlineEditHelper.isInlineEditing()) {
                        return;
                    }
                    var elementsAtPos = npGridPosition.getElementsAtPosition(event.canvasX, event.canvasY),
                        movableElements = _.filter(elementsAtPos, function (elem) {
                            return npPageMetadataHelper.canMoveControl(elem.controlMd);
                        }),
                        index = _.findLastIndex(movableElements, function (elem) {
                            return elem.isSelected();
                        });

                    return npGrid.getTopElement(movableElements, index);
                };

                var onDragstart = function (event) {
                    if (!event.target.classList.contains('np-c-grid-element')) {
                        return;
                    }
                    reset();
                    _elemToMove = findElementToMove(event);
                    if (!_elemToMove) {
                        return;
                    }
                    _elemToMove.startDrag();
                    var querySelector = '[data-element-id="' + _elemToMove.elementId + '"]';
                    _gridElemDomRef = element[0].querySelector(querySelector);

                    // now that we are actually dragging an element bind missing listeners
                    body.addClass(DISABLE_USER_SELECT_CLASS);
                    _dragmoveListener = npCanvasInteractionHelper.on(npCanvasInteractionHelper.supportedEvents.dragmove, onDragmove, true);
                    _dragendListener = npCanvasInteractionHelper.on(npCanvasInteractionHelper.supportedEvents.dragend, onDragend);
                    var domRef = _elemToMove.domRef()[0];
                    prepareDragWrapper(domRef);
                    // store original values for the styles we want to override
                    _originalStyles = {
                        visibility: domRef.style.visibility
                    };
                    _originalPosition = {
                        left: _elemToMove.style.left,
                        top: _elemToMove.style.top
                    };
                    applyStyles(domRef, {
                        visibility: 'hidden'
                    });

                    _mousePosition = {
                        x: event.canvasX,
                        y: event.canvasY
                    };
                    // calculate anchor point
                    _elementAnchor = getAnchor(_elemToMove, _mousePosition);


                    npGrid.setSelectedElements([_elemToMove]);
                    // TODO: snap guide should rely on grid abstraction
                    npSnapGuide.updateElementsPositions(_elemToMove);

                    // TODO remove this when resizable directive watches for elem.isDragged
                    $rootScope.$broadcast('canvasElement/dragStart', _elemToMove);
                };

                var onDragmove = function (event) {
                    if (!_elemToMove) {
                        $log.warn('canvas-element-move: onDragmove called but element to move is not defined. This should not have happened.');
                        return;
                    }

                    npCanvasElementHighlight.highlightElementAtPosition(_elemToMove.controlMd, event.canvasX, event.canvasY);
                    _mousePosition = {
                        x: event.canvasX,
                        y: event.canvasY
                    };
                    _elementOrigin = getPosition(_elemToMove, _elementAnchor, event);
                    applyStyles(wrapper, _elementOrigin);
                    applyStyles(_gridElemDomRef, _elementOrigin);
                    applyStyles(_elemToMove, _elementOrigin);
                };

                var onDragend = function (event) {
                    body.removeClass(DISABLE_USER_SELECT_CLASS);
                    typeof _dragmoveListener === 'function' && _dragmoveListener();
                    typeof _dragendListener === 'function' && _dragendListener();

                    if (!_elemToMove) {
                        $log.warn('canvas-element-move: onDragend called but element to move is not defined. This should not have happened.');
                        return;
                    }
                    if (typeof event.canvasX === 'number' && typeof event.canvasY === 'number') {
                        _mousePosition = {
                            x: event.canvasX,
                            y: event.canvasY
                        };
                        _elementOrigin = getPosition(_elemToMove, _elementAnchor, event);
                    }

                    var targetElement = npGridPosition.getSiblingAtPosition(_elemToMove.controlMd, _mousePosition.x, _mousePosition.y) || {},
                        positionData = {
                            x: _elementOrigin.left,
                            y: _elementOrigin.top
                        };

                    npCanvasElementDrop.moveAtTarget(_elemToMove.controlMd, targetElement.controlMd, positionData)
                        .catch(function () {
                            _elementOrigin = _originalPosition;
                            npMessaging.showError('Control cannot be moved at that position');
                        })
                        .finally(function () {
                            _elemToMove.stopDrag();
                            removeDragWrapper();
                            // set old styles
                            applyStyles(_elemToMove.domRef()[0], _originalStyles);
                            applyStyles(_elemToMove, _elementOrigin);

                            npCanvasElementHighlight.clearElementHighlights();

                            reset();
                        });

                    // Make the grid lines stay for some time before disappearing to improve user experience
                    $timeout(npSnapGuide.clearGuideLines, 500);
                };

                scope.$on('$destroy', function () {
                    typeof _dragstartListener === 'function' && _dragstartListener();
                    typeof _dragmoveListener === 'function' && _dragmoveListener();
                    typeof _dragendListener === 'function' && _dragendListener();
                });

                init();
            }
        };
    }
];

module.exports = npCanvasElementMove;

'use strict';

var _ = require('norman-client-tp').lodash;

/**
 * The npCanvasInteractionHandler works closely together with the npCanvasInteractionHelper to handle canvas mouse events.
 * @namespace npCanvasInteractionHandler
 */
var npCanvasInteractionHandler = ['$document', '$log', 'npCanvasInteractionHelper', 'npZoomHelper', 'npFormFactor',
    function ($document, $log, npCanvasInteractionHelper, npZoomHelper, npFormFactor) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                var _didTouchMove = false,
                    _mouseDownTriggered = false;

                var CANVAS_TRIGGER_CLASS = 'np-c-canvas-overlay-js';

                /**
                 * @private
                 * @description Get the canvas height, width and offset.
                 */
                var getCanvas = function () {
                    var boundingRect = element[0].getBoundingClientRect();
                    return {
                        height: _.parseInt(npFormFactor.getCurrentFormFactor().height),
                        width: _.parseInt(npFormFactor.getCurrentFormFactor().width),
                        offset: _.pick(boundingRect, ['left', 'top'])
                    };
                };

                /**
                 * @private
                 * @description Keep axis values within canvas
                 */
                var getAxisValueWithinCanvas = function (value, max) {
                    return Math.min(Math.max(0, value / npZoomHelper.getZoomLevel()), max);
                };

                /**
                 * @private
                 * @description Get the mouse position relative to the canvas element.
                 */
                var positionRelativeToCanvas = function (event, canvas) {
                    return {
                        x: getAxisValueWithinCanvas(event.pageX - canvas.offset.left, canvas.width),
                        y: getAxisValueWithinCanvas(event.pageY - canvas.offset.top, canvas.height)
                    };
                };

                /**
                 * @private
                 * @description Extend the original mouse event with mouse position relative to canvas (canvasX and canvasY).
                 */
                var extendWithCanvasInfo = function (event, canvas, adjustedMousePosition) {
                    _.extend(event, {
                        canvasHeight: canvas.height,
                        canvasWidth: canvas.width
                    });

                    if (adjustedMousePosition) {
                        _.extend(event, {
                            canvasX: adjustedMousePosition.x,
                            canvasY: adjustedMousePosition.y
                        });
                    }
                };

                /**
                 * @private
                 * @description Enahnce the mouse event with required canvas information.
                 * @param {object} event The event to modify.
                 * @returns {boolean} Wether the event happened within the canvas.
                 */
                var prepareCanvasEvent = function (event) {
                    var inCanvas = !!_.findParentByClass(angular.element(event.target), CANVAS_TRIGGER_CLASS),
                        canvas = getCanvas(),
                        adjustedMousePosition;
                    if (inCanvas) {
                        adjustedMousePosition = positionRelativeToCanvas(event, canvas);
                    }
                    extendWithCanvasInfo(event, canvas, adjustedMousePosition);
                    return inCanvas;
                };

                var onMousedown = function (event) {
                    $document.off('mousemove', onMousemove);
                    if (event.button !== 0) {
                        return;
                    }
                    _didTouchMove = false;
                    _mouseDownTriggered = true;
                    $document.on('mousemove', onMousemove);
                };

                var onMousemove = function (event) {
                    if (event.button !== 0) {
                        return;
                    }
                    var isCanvasEvent = prepareCanvasEvent(event);
                    if (!_didTouchMove) {
                        _didTouchMove = true;
                        npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragstart, isCanvasEvent, event);
                    }
                    else {
                        npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragmove, isCanvasEvent, event);
                    }
                };

                var onMouseup = function (event) {
                    $document.off('mousemove', onMousemove);
                    if (event.button !== 0 || !_mouseDownTriggered) {
                        return;
                    }
                    var isCanvasEvent = prepareCanvasEvent(event);
                    if (_didTouchMove) {
                        npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.dragend, isCanvasEvent, event);
                    }
                    else {
                        npCanvasInteractionHelper.triggerHandler(npCanvasInteractionHelper.supportedEvents.click, isCanvasEvent, event);
                    }
                    _didTouchMove = false;
                    _mouseDownTriggered = false;
                };

                var triggerSimpleEvent = function (eventType, event) {
                    var isCanvasEvent = prepareCanvasEvent(event);
                    npCanvasInteractionHelper.triggerHandler(eventType, isCanvasEvent, event);
                };

                var onDblclick = function (event) {
                    triggerSimpleEvent(npCanvasInteractionHelper.supportedEvents.dblclick, event);
                };

                var onContextMenu = function (event) {
                    triggerSimpleEvent(npCanvasInteractionHelper.supportedEvents.contextmenu, event);
                };

                var onDragenter = function (event) {
                    triggerSimpleEvent(npCanvasInteractionHelper.supportedEvents.dragenter, event);
                };

                var onDragover = function (event) {
                    triggerSimpleEvent(npCanvasInteractionHelper.supportedEvents.dragover, event);
                };

                var onDragleave = function (event) {
                    triggerSimpleEvent(npCanvasInteractionHelper.supportedEvents.dragleave, event);
                };

                var onDrop = function (event) {
                    triggerSimpleEvent(npCanvasInteractionHelper.supportedEvents.drop, event);
                };

                $document.on('mousedown', onMousedown);
                $document.on('mouseup', onMouseup);
                $document.on('dblclick', onDblclick);
                $document.on('contextmenu', onContextMenu);
                $document.on('dragenter', onDragenter);
                $document.on('dragover', onDragover);
                $document.on('dragleave', onDragleave);
                $document.on('drop', onDrop);

                scope.$on('$destroy', function cleanup() {
                    $document.off('mousedown', onMousedown);
                    $document.off('mousemove', onMousemove);
                    $document.off('mouseup', onMouseup);
                    $document.off('dblclick', onDblclick);
                    $document.off('contextmenu', onContextMenu);
                    $document.off('dragenter', onDragenter);
                    $document.off('dragover', onDragover);
                    $document.off('dragleave', onDragleave);
                    $document.off('drop', onDrop);
                });
            }
        };
    }
];

module.exports = npCanvasInteractionHandler;

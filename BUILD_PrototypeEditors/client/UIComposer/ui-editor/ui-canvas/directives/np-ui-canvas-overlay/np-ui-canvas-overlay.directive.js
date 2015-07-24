'use strict';

var _ = require('norman-client-tp').lodash;

var npUiCanvasOverlay = ['$document', 'jQuery', 'npCanvasElementDrop', 'npCanvasElementHighlight', 'npDragHelper', 'npZoomHelper', 'npMessaging', 'npCanvasInteractionHelper', 'npGridPosition',
    function ($document, jQuery, npCanvasElementDrop, npCanvasElementHighlight, npDragHelper, npZoomHelper, npMessaging, npCanvasInteractionHelper, npGridPosition) {
        return {
            restrict: 'A',
            link: function (scope) {
                var _dragData, _dragenterListener, _dragoverListener, _dragleaveListener, _dropListener,
                    _dragEnterCount = 0; // we need to keep a counter since enter is called again whenever we hover over a child element of the drop target

                var initDropEvent = function (event) {
                    var evt = $document[0].createEvent('HTMLEvents');
                    evt.initEvent('drop', true, true);
                    delete evt.dataTransfer;
                    evt.dataTransfer = event.dataTransfer;
                    return evt;
                };

                var addCopyEffect = function (event) {
                    event.dataTransfer.dropEffect = 'copy';
                };

                var onEnter = function (event) {
                    _dragEnterCount++;
                    addCopyEffect(event);
                    _dragData = npDragHelper.getDragData();
                };

                var onLeave = function () {
                    _dragEnterCount--;
                    if (_dragEnterCount === 0) {
                        npCanvasElementHighlight.clearElementHighlights();
                        _dragData = undefined;
                    }
                };

                var onOver = function (event) {
                    addCopyEffect(event);
                    if (_dragData) {
                        npCanvasElementHighlight.highlightElementAtPosition(_dragData, event.canvasX, event.canvasY);
                    }
                };

                var addDropPosition = function (dragData, event) {
                    dragData.x = event.canvasX;
                    dragData.y = event.canvasY;
                    // images should be dropped at cursor center
                    if (npDragHelper.isImageDrag()) {
                        var imgWidth = _.parseInt(_.result(_.find(dragData.properties, {
                                name: 'width'
                            }), 'value')),
                            imgHeight = _.parseInt(_.result(_.find(dragData.properties, {
                                name: 'height'
                            }), 'value'));
                        dragData.x = Math.max(dragData.x - (imgWidth / 2), 0);
                        dragData.y = Math.max(dragData.y - (imgHeight / 2), 0);
                    }
                };

                var onDrop = function (event) {
                    _dragEnterCount = 0;
                    _dragData = npDragHelper.getDragData();
                    if (_dragData) {
                        addDropPosition(_dragData, event);
                        var targetElement = npGridPosition.getSiblingAtPosition(_dragData, _dragData.x, _dragData.y) || {};

                        npCanvasElementDrop.dropAtTarget(_dragData, targetElement.controlMd, {
                            x: _dragData.x,
                            y: _dragData.y
                        }).catch(npMessaging.showError);
                        npCanvasElementHighlight.clearElementHighlights();
                        npDragHelper.endDrag();
                        _dragData = undefined;
                    }
                    else {
                        scope.$emit('imagePositionCoordinates', event.canvasX, event.canvasY);
                        var evt = initDropEvent(event);
                        $document[0].querySelector('#imageDropZone').dispatchEvent(evt);
                    }
                };


                _dragenterListener = npCanvasInteractionHelper.on(npCanvasInteractionHelper.supportedEvents.dragenter, onEnter, true);
                _dragoverListener = npCanvasInteractionHelper.on(npCanvasInteractionHelper.supportedEvents.dragover, onOver, true);
                _dragleaveListener = npCanvasInteractionHelper.on(npCanvasInteractionHelper.supportedEvents.dragleave, onLeave, true);
                _dropListener = npCanvasInteractionHelper.on(npCanvasInteractionHelper.supportedEvents.drop, onDrop, true);

                scope.$on('$destroy', function () {
                    typeof _dragenterListener === 'function' && _dragenterListener();
                    typeof _dragoverListener === 'function' && _dragoverListener();
                    typeof _dragleaveListener === 'function' && _dragleaveListener();
                    typeof _dropListener === 'function' && _dropListener();
                });
            }
        };
    }
];

module.exports = npUiCanvasOverlay;

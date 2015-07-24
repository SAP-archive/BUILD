'use strict';

var npCanvasScroll = ['$timeout', 'jQuery', 'npGrid', 'npZoomHelper',
    function ($timeout, jQuery, npGrid, npZoomHelper) {
        return {
            restrict: 'A',
            link: function (scope) {
                scope.$on('selectionChanged', function () {
                    $timeout(function () {
                        var firstSelectedElement = npGrid.getSelectedElements()[0];
                        if (firstSelectedElement) {
                            scrollOnCanvas(firstSelectedElement);
                        }
                    }, 100);
                });

                // Scroll to the element on canvas if not visible
                var scrollOnCanvas = function (scrollElement) {
                    var container = jQuery(document.getElementsByClassName('np-e-canvas-container-js'));
                    if (((scrollElement !== undefined) && (scrollElement.isPageElement())) || (scrollElement === null) || (scrollElement === undefined)) {
                        return;
                    }
                    scrollElement = scrollElement.domRef();
                    var scrollTo = jQuery(scrollElement);
                    if (_checkElementInViewport(scrollTo, container)) {
                        // If the element is visible
                        return;
                    }
                    // If the element is not visible, scroll to the element
                    var curTop = (scrollTo.offset().top * npZoomHelper.getZoomLevel()) - container.offset().top + (scrollTo.height() / 2);
                    var curLeft = (scrollTo.offset().left * npZoomHelper.getZoomLevel()) - container.offset().left + (scrollTo.width() / 2);
                    _scrollXY(container, curTop, curLeft, container.scrollTop(), container.scrollLeft(), 15);
                };

                // Scroll element both horizontally and vertically
                var _scrollXY = function (elem, top, left, prevTop, prevLeft, duration) {
                    if (duration < 0) {
                        return;
                    }
                    var differenceX = left - prevLeft;
                    var perTickX = differenceX / duration;
                    var differenceY = top - prevTop;
                    var perTickY = differenceY / duration;
                    duration = duration - 1;

                    $timeout(function () {
                        elem.scrollTop(perTickY + prevTop);
                        elem.scrollLeft(perTickX + prevLeft);
                        prevTop = prevTop + perTickY;
                        prevLeft = prevLeft + perTickX;
                        if ((prevTop === top) && (prevLeft === left)) {
                            return;
                        }
                        _scrollXY(elem, top, left, prevTop, prevLeft, duration);
                    }, 20);
                };

                // Check if the element in the canvas is visible on the window/viewport
                var _checkElementInViewport = function (elem, canvas) {
                    var canvasFrame = jQuery(document.getElementById('canvas-runtime'));
                    var sideBar = jQuery(document.getElementsByClassName('np-e-sidebar-js')[0]);
                    var scrollArea = jQuery(document.getElementsByClassName('np-e-canvas-container-inner-js'));

                    var offsetCanvasX = (scrollArea.innerWidth() - canvasFrame.width()) / 2;
                    var offsetCanvasY = (scrollArea.innerHeight() - canvasFrame.height()) / 2;

                    var curPos = elem.offset();
                    if (curPos === undefined || curPos === null) {
                        return true;
                    }
                    var curTop = (curPos.top * npZoomHelper.getZoomLevel()) + offsetCanvasY + (elem.height() / 2);
                    var curLeft = (curPos.left * npZoomHelper.getZoomLevel()) + offsetCanvasX + (elem.width() / 2);

                    var screenHeight = jQuery(document).height() - (scrollArea.offset().top);
                    var screenWidth = jQuery(document).width() - (scrollArea.offset().left) - sideBar.width();
                    if (((elem.width() >= canvasFrame.width() / 2) && (elem.height() >= canvasFrame.height() / 2))) {
                        return true;
                    }
                    var insideX = ((curLeft < screenWidth) && (curLeft > canvas.scrollLeft()));
                    var insideY = ((curTop < screenHeight) && (curTop > canvas.scrollTop()));
                    return (insideX && insideY) ? true : false;
                };
            }
        };
    }
];

module.exports = npCanvasScroll;

'use strict';
/**
 * Scrolls an element in to view when it has been selected.
 *
 * @param {boolean} autoScroll - invokes the scrolling mechanism
 * @param {string} scrollContainer - the selector for the container who's viewport will be used to determine if the
 * selected element is visible.  Assumes parent if not defined.
 *
 */
// @ngInject
module.exports = function ($timeout, $rootScope) {
    return function (scope, elem, attrs) {

        // define amount of offset to add to the scroll. Looks better than having the item right on edge of screen
        var scrollOffset = -10;

        /**
         * function to check if the item is within the viewport of the container.
         * i.e. is the comment visible inside the comment list
         */
        function isItemInsideContainer(item, container) {
            var itemRect = item.getBoundingClientRect();
            var containerRect = container.getBoundingClientRect();

            return (itemRect.top < containerRect.top || itemRect.bottom > containerRect.bottom || itemRect.right > containerRect.right || itemRect.left < containerRect.left);
        }

        scope.$on('fire-scroll', function () {
            if (scope.annotation && scope.currentSelected && scope.annotation._id === scope.currentSelected._id) {
                scope.fireScroll();
            }
        });

        scope.$watch(attrs.autoScroll, function (newVal, oldVal) {

            // scroll to element if it has been newly selected and it's out of view.
            if (newVal === true && oldVal === false) {
                if (attrs.iframeScroll === 'true') {
                    scope.fireScrolliFrame();
                }
                else {
                    scope.fireScroll();
                }
            }
        });

        scope.fireScroll = function () {
            // get the container specified or use the parent container of the element.
            var scrollContainer = attrs.scrollContainer ? document.querySelector(attrs.scrollContainer) : elem.parent()[0];

            if (isItemInsideContainer(elem[0], scrollContainer)) {
                $timeout(function () {
                    scrollContainer.scrollTop = elem[0].offsetTop + scrollOffset;
                    scrollContainer.scrollLeft = elem[0].offsetLeft + scrollOffset;
                });
            }
        };

        // function that will set up iFrameScrolling
        scope.fireScrolliFrame = function () {
            if (!scope.currentSelected.isVisible) {
                $rootScope.$broadcast('send-iframe-message', {
                        iframeId: 'prototype-iframe',
                        iframeMessage: {
                            type: 'scrollIFrame',
                            value: {
                                scrollTop: scope.currentSelected.scrollTop,
                                scrollLeft: scope.currentSelected.scrollLeft
                            }
                        }
                });
            }
        };
    };
};

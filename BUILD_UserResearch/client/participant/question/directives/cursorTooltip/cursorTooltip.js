'use strict';

/**
 * Adds floating cursor tooltip to the supplied element when the mouse is over the element.
 */
// @ngInject
module.exports = function () {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            cursor: '@',
            cursorId: '@'
        },
        template: '<div ng-transclude></div>',
        link: function (scope, elem) {

            var el = elem[0],
                wrap = el.parentNode,
                wrapEl = angular.element(wrap);

            scope.$watch('cursor', function (cursor) {
                if (cursor) wrap.style.cursor = cursor;
            });

            scope.$on('showCursorTooltip', function (event, details) {
                if (details.id === scope.cursorId) {
                    scope.showCursor(details.clientX, details.clientY);
                }
            });

            scope.showCursor = function (x, y) {
                el.style.top = (y - 45) + 'px';
                el.style.left = (x + 10) + 'px';
                el.classList.add('hover');
            };


            wrapEl.on('click', function () {
                elem.removeClass('hover');
            });

            wrapEl.on('mousemove', function (e) {
                if (e.target.classList.contains('dragging')) {
                    el.classList.remove('hover');
                    return;
                }
                scope.showCursor(e.clientX, e.clientY);
            });

            wrapEl.on('mouseout', function () {
                el.classList.remove('hover');
            });

            scope.$on('$destroy', function () {
                wrap.style.cursor = 'auto';
            });
        }
    };
};

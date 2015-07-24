'use strict';

// @ngInject
module.exports = function ($timeout) {
    return {
        restrict: 'E',
        scope: {
            sourceId: '@',
            destId: '@',
            sourceOffsetLeft: '@',
            sourceOffsetTop: '@',
            destOffsetLeft: '@',
            destOffsetTop: '@',
            containers: '@'
        },
        templateUrl: 'resources/norman-user-research-client/review/directives/laserPointer/template.html',
        link: function (scope) {
            scope.show = false;
            var sourceElem, destElem, sourcePos, destPos, elements;
            scope.sourceTop = scope.sourceLeft = scope.destTop = scope.destLeft = 0;

            // Re-render the laser pointer if this event is fired.
            scope.$on('laser-render', function () {
                render();
            });

            function render() {
                $timeout(function () {
                    sourceElem = document.getElementById(scope.sourceId);
                    destElem = document.getElementById(scope.destId);
                    if (!sourceElem || !destElem || sourceElem.getClientRects().length === 0 || destElem.getClientRects().length === 0) {
                        scope.show = false;
                    }
                    else {
                        sourcePos = sourceElem.getBoundingClientRect();
                        destPos = destElem.getBoundingClientRect();
                        scope.sourceTop = sourcePos.top + (scope.sourceOffsetTop * 1 || 0);
                        scope.sourceLeft = sourcePos.left + (scope.sourceOffsetLeft * 1 || 0);
                        scope.destTop = destPos.top + (scope.destOffsetTop * 1 || 0);
                        scope.destLeft = destPos.left + (scope.destOffsetLeft * 1 || 0);
                        scope.show = true;
                    }
                }, 150);
            }

            scope.$watch('sourceId', render);
            scope.$watch('destId', render);

            window.addEventListener('resize', render);
            window.addEventListener('scroll', render);
            $timeout(function () {
                elements = document.querySelectorAll(scope.containers);
                for (var elem in elements) {
                    if (elements[elem].addEventListener) {
                        elements[elem].addEventListener('scroll', render);
                    }
                }
            });

            scope.$on('$destroy', function () {
                window.removeEventListener('resize', render);
                window.removeEventListener('scroll', render);
                for (var elem in elements) {
                    if (elements[elem].removeEventListener) {
                        elements[elem].removeEventListener('scroll', render);
                    }
                }
            });

            render();
        }
    };
};

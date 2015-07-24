'use strict';
/**
 * Directive that calcs the height of an element based off the element above
 */
// @ngInject
module.exports = function ($timeout, $window) {
    return {
        restrict: 'A',
        link: function (scope, elem) {
            function calculateHeight(el) {
                $timeout(function () {
                    var itemRect = el[0].getBoundingClientRect();
                    if (itemRect.height === 0) {
                        return;
                    }
                    var viewPortHeight = $window.innerHeight;

                    el.css('height', (viewPortHeight - itemRect.top) + 'px');
                });
            }
            calculateHeight(elem);

            angular.element($window).on('resize', function () {
                calculateHeight(elem);
            });
        }
    };
};

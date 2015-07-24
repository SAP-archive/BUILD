'use strict';
/**
 * Directive that resizes an image to it's full (natural) size regardless of the parent container.
 */
// @ngInject
module.exports = function () {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            angular.element(elem).css('display', 'none');
            angular.element(elem).on('load', function (img) {
                img = new Image();
                img.onload = function () {
                    // Determine the image size.
                    angular.element(elem).css('min-width', img.width + 'px');
                    angular.element(elem).css('min-height', img.height + 'px');
                    angular.element(elem).css('display', 'block');
                };
                img.src = attrs.ngSrc;
            });
        }
    };
};

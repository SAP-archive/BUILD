'use strict';
/**
 * Directive that absolutely positions an element in the body.
 */
// @ngInject
module.exports = function () {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            var styleParameters = angular.fromJson(attrs.screenPlacement);
            angular.element(elem).addClass('screen-placement');
            for (var key in styleParameters) {
                if (styleParameters.hasOwnProperty(key)) {
                    angular.element(elem).css(key, styleParameters[key]);
                }
            }
            document.getElementsByTagName('body')[0].appendChild(elem[0]);
            scope.$on('$destroy', function () {
               elem[0].remove();
            });
        }
    };
};

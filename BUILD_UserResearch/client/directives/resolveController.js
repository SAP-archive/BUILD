'use strict';
// @ngInject
module.exports = function ($controller) {
    return {
        scope: true,
        link: function (scope, elem, attrs) {
            var resolve = scope.$eval(attrs.resolve);
            angular.extend(resolve, {
                $scope: scope
            });
            $controller(attrs.resolveController, resolve);
        }
    };
};

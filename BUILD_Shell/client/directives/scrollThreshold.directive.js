'use strict';
// @ngInject
module.exports = function () {
    return {
        restrict: 'A',

        scope: {
            threshold: '@',
            hasPassedThreshold: '='
        },

        link: function (scope, element) {
            element.on('scroll', function () {
                if (element[0].scrollTop >= scope.threshold) {
                    scope.hasPassedThreshold = true;
                }
                else {
                    scope.hasPassedThreshold = false;
                }
                scope.$apply();
            });
        }

    };
};


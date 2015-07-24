'use strict';
// @ngInject
module.exports = function ($compile, $timeout) {
    return {
        restrict: 'E',
        scope: {
            tipText: '='
        },
        link: function (scope, elem) {
            scope.animate = false;

            // Add the handy tip to the end of the body if not already present.
            var handyTip = document.getElementById('handy-tip');
            if (!handyTip) {
                var template = '<div ng-class="{\'animated bounceIn\': animate}" ng-if="tipText && tipText.length > 0" id="handy-tip" class="handy-tip-wrapper"><div class="handy-tip"><span ng-bind="tipText"></span></div></div>';
                scope.template = $compile(template);
                angular.element(document.getElementsByTagName('body')[0]).append(scope.template(scope));
            }

            scope.$on('$destroy', function () {
                elem.remove();
                var oldHandyTip = document.getElementById('handy-tip');
                if (oldHandyTip) {
                    oldHandyTip.remove();
                }
            });

            scope.$watch('tipText', function (newVal, oldVal) {
                if (oldVal && newVal && oldVal.length > 0 && newVal.length > 0 && oldVal !== newVal) {
                    scope.animate = true;
                    $timeout(function () {
                        scope.animate = false;
                    }, 1000);
                }
            });
        }
    };
};

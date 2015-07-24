'use strict';

// @ngInject
module.exports = function (accessLevelProvider) {
    return {
        restrict: 'A',
        scope: {
            securityPolicies: '='
        },
        require: '?ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            if (!ngModelCtrl) return;

            function isRestrictedLevel(viewValue) {
                var accessLevelItems = scope.$eval(attrs.accessLevelItems);
                var policies = scope.securityPolicies;
                var invalid = false;
                if (policies && policies.length > 0) {
                    for (var k = 0; k < policies.length; k++) {
                        if (accessLevelProvider.assertLevelValidity(accessLevelItems, policies[k], viewValue) === false) {
                            invalid = true;
                        }
                    }
                }
                return invalid;
            }

            ngModelCtrl.$validators.accessLevelRestricted = function (modelValue, viewValue) {
                return isRestrictedLevel(viewValue) === false;
            };

            attrs.$observe('accessLevelRestricted', function () {
                ngModelCtrl.$validate();
            });
        }
    };
};

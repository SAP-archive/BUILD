'use strict';

// @ngInject
module.exports = function () {
    return {
        restrict: 'A',
        scope: {
            securityPolicies: '='
        },
        require: '?ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            if (!ngModelCtrl) return;

            function isDuplicatedDomain(value) {
                var securityPolicies = scope.securityPolicies;
                if (securityPolicies && securityPolicies.length > 0) {
                    var domain = value.indexOf('@') === -1 ? '@' + value : value;
                    for (var k = 0; k < securityPolicies.length; k++) {
                        if (securityPolicies[k].Domain === domain) {
                            return true;
                        }
                    }
                }
                return false;
            }

            ngModelCtrl.$validators.accessDuplicated = function (modelValue, viewValue) {
                return ngModelCtrl.$isEmpty(viewValue) || isDuplicatedDomain(viewValue) === false;
            };

            attrs.$observe('accessDuplicated', function () {
                ngModelCtrl.$validate();
            });
        }
    };
};

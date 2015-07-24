'use strict';

// @ngInject
module.exports = function () {

    this.$get = ['$rootScope', function () {
        return {
            assertLevelValidity: function (accessLevelItems, policy, viewValue) {
                var viewValueIndex = accessLevelItems.indexOf(viewValue);
                var policyIndex = accessLevelItems.indexOf(policy.accessLevel);
                var result;
                if (viewValueIndex > policyIndex) {
                    policy.invalidAccessLevel = true;
                    result = false;
                }
                else {
                    if (policy.invalidAccessLevel === true) {
                        delete policy.invalidAccessLevel;
                    }
                    result = true;
                }
                return result;
            }

        };
    }]
    ;
};


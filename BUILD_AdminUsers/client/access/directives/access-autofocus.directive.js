'use strict';

// @ngInject
module.exports = function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            attrs.$observe('accessAutoFocus', function (value) {
                if (value === 'true') {
                    element[0].focus();
                }
            });
        }
    };
};

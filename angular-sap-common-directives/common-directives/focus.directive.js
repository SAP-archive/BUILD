'use strict';

// @ngInject
module.exports = function ($timeout) {
    return function (scope, element, attrs) {
        attrs.$observe('nnFocus', function (newValue) {
            if (newValue === 'true')
                $timeout(function () {
                    element[0].focus();
                });
        });
    };
};

'use strict';

// @ngInject
module.exports = function ($rootScope) {
    return {
        restrict: 'A',
        replace: true,
        link: function (scope, elem) {
            elem.bind('click', function () {
                $rootScope.$broadcast('dialog-open', 'auth-settings-modal');
            });
        }
    };
};

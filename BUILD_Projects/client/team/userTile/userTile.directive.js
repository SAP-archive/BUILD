'use strict';

// @ngInject
module.exports = function () {
    return {
        templateUrl: 'resources/norman-projects-client/team/userTile/userTile.html',
        restrict: 'E',
        transclude: true,
        scope: {
            user: '=',
            isCurrentUser: '=',
            setAsOwner: '&'
        },
        link: function (scope) {
            scope.onDrop = function () {
                if (scope.user.role !== 'owner') {
                    scope.setAsOwner(scope.user);
                }
            };

        }
    };
};

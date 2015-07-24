'use strict';
/**
 * Admin Section controller
 */

// @ngInject
module.exports = function ($scope, $state, AdminService) {

    $scope.items = AdminService.items;

    /**
     * Redirect to the first settings section if no section is selected
     * @param   {object}  state  - current state active state
     */
    $scope.onStateChange = function (state) {
        if ($scope.items.length && state.name === 'shell.admin') {
            return $state.go($scope.items[0].state);
        }
        return true;
    };

    $scope.$on('$stateChangeStart', function (ev, toState) {
        if ($scope.onStateChange(toState) !== true) ev.preventDefault();
    });

    $scope.onStateChange($state.current);
};

/*eslint no-cond-assign: 0 */
'use strict';
/**
 *
 * @param $state
 * @param $scope
 * @param $rootScope
 * @param $timeout
 * @param $log
 * @param HomeDashboardFactory
 * @param globals
 */
// @ngInject
module.exports = function ($state, $scope, HomeDashboardFactory, globals, AsideFactory) {
    $scope.asideService = AsideFactory;
    $scope.homeDashboardFactory = HomeDashboardFactory;
    $scope.globals = globals;
    $scope.isCollapsed = false;
    $scope.loadDashboard = $state.current.name === 'shell';
};

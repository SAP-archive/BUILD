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
module.exports = function ($state, $scope, $rootScope, $timeout, $log, projectLandingPageService, globals) {
    $scope.projectLandingPageService = projectLandingPageService;
    $scope.globals = globals;
};

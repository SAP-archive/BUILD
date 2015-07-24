'use strict';
/**
 * Controller:  Participant Invitation
 * Usage:  To expose variables and functionality to expressions, view and directives.
 */
// @ngInject
module.exports = function ($scope, currentStudy) {
    $scope.inviteList = currentStudy.invite_list;
    $scope.study_status = currentStudy.status;
};

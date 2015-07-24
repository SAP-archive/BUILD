'use strict';
/**
 * Controller:  Participant Overview
 * Usage:  To expose variables and functionality to expressions, view and directives.
 * @returns {{restrict: string, scope: object, template: string,  link: Function}}
 */
// @ngInject
module.exports = function ($scope, currentReview) {

    $scope.loading = true;

    $scope.init = function (result) {
        $scope.overview = result;
        $scope.participantBreakdown = result.breakdown;
    };

    if (currentReview.$promise) {
        currentReview.$promise.then(function () {
            $scope.init(currentReview);
        });
    }
    else {
        $scope.init(currentReview);
    }
};

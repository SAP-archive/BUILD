'use strict';

// @ngInject
module.exports = function ($window, urUtil, $location, $log, $state, $stateParams, $scope, $timeout, currentReview) {

    $scope.loading = true;

    $scope.init = function (result) {
        $scope.overview = result.overview;
        $scope.tasks = result.tasks;
        $scope.questions = result.questions;
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

'use strict';

// @ngInject
module.exports = function ($window, urUtil, $location, $log, $state, $stateParams, $scope, $timeout, currentReview) {

    $scope.loading = true;
    $scope.tasksChartColor = [
        '#2ECC71',
        '#E74C3C',
        '#677279'
    ];

    $scope.sentimentChartColor = [
        '#2ECC71',
        '#677279',
        '#E74C3C'
    ];

    $scope.init = function (result) {
        $scope.overview = result.overview;
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

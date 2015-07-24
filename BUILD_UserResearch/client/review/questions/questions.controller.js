'use strict';

var _ = require('norman-client-tp').lodash;

// @ngInject
module.exports = function ($window, urUtil, $location, $log, $state, $stateParams, $scope, $timeout,
                           currentReview, NavBarService, AsideFactory) {

    $scope.loading = true;
    $scope.filterValue = '';

    $scope.sentimentChartColor = [
        '#2ECC71',
        '#677279',
        '#E74C3C'
    ];
    $scope.tasksChartColor = [
        '#2ECC71',
        '#E74C3C',
        '#677279'
    ];

    $scope.init = function (result) {
        $scope.questions = _.sortByAll(result.questions, ['ordinal', 'subOrdinal'], [true, true]);

        $scope.nb_tasks = _.filter($scope.questions, function (value) {
            return value.type === 'Task';
        }).length;
        $scope.nb_questions = $scope.questions.length - $scope.nb_tasks;

        NavBarService.show();
        AsideFactory.show();
    };

    $scope.goToQuestions = function (id) {
        $state.go('shell.project.UserResearch.detail', {
            studyId: $scope.study._id,
            questionId: id
        });
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

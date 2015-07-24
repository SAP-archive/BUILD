'use strict';

var _ = require('norman-client-tp').lodash;

// @ngInject
module.exports = function ($window, urUtil, $location, $log, $state, $stateParams, $scope, $timeout, currentStudy) {

    $scope.loading = true;
    $scope.baseUrl = $location.protocol() + '://' + $location.host();

    if ($location.port()) {
        $scope.baseUrl = $scope.baseUrl + ':' + $location.port();
    }
    $scope.projectId = currentStudy.projectId;
    $scope.studyURL = $scope.baseUrl + '/norman/projects/' + $scope.projectId + '/research/participant/' + currentStudy._id;

    $scope.preview = function () {
        var url = $state.href('shell.project.UserResearch.preview.list', {
            studyId: currentStudy._id
        });
        $window.open(url);
    };

    $scope.selectLink = function () {
        $timeout(function () {
            var input = document.getElementById('study-link-input');
            if (input && input.select) {
                input.select();
            }
        }, 100);
    };

    $scope.isEmpty = function (object) {
        return _.isEmpty(object);
    };

    $scope.initReview = function (result) {
        $scope.overview = result.overview;
        $scope.tasks = result.tasks;
        $scope.questions = result.questions;
    };

    $scope.initStudy = function (study) {
        $scope.study = study;
    };

    if (currentStudy.$promise) {
        currentStudy.$promise.then(function () {
            $scope.initStudy(currentStudy);
        });
    }
    else {
        $scope.initStudy(currentStudy);
    }

};

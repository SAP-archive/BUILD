'use strict';

// @ngInject
module.exports = function ($scope, $state, $location, $timeout, currentStudy) {

	$scope.studyURL = $location.absUrl().replace('published', 'participant');
    $scope.studyName = currentStudy.name;
    $scope.inviteList = currentStudy.invite_list;
    $scope.study_status = currentStudy.status;

	$scope.done = function () {
		$state.go('shell.project.UserResearch.list');
	};

    // Auto-select the study link
    $timeout(function () {
        var input = document.getElementById('published-study-url');
        if (input && input.select) {
            input.select();
        }
    }, 500);
};

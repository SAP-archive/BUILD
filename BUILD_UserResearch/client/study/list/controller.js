'use strict';

// @ngInject
module.exports = function ($scope, $state, $stateParams, Studies, $location, uiError) {

    $scope.baseUrl = $location.protocol() + '://' + $location.host();

    if ($location.port()) {
        $scope.baseUrl = $scope.baseUrl + ':' + $location.port();
    }

    $scope.showAllStudies = false;
    $scope.numOfHidden = 0;
    $scope.studies = [];


    Studies.query({
        projectId: $stateParams.currentProject
    }).$promise.then(function (studies) {
        $scope.studies = studies;
        $scope.addDocIdForTasks();
        $scope.getParticipantSum();
        $scope.statusFilter = $scope.getDefaultStatus();
        return studies;
    }).catch(function error(res) {
        uiError.create({
            content: res.data.error,
            dismissOnTimeout: false
        });
    });


    $scope.addDocIdForTasks = function () {
        $scope.studies.forEach(function (study) {
            study.questions.forEach(function (question) {
                if (question.type === 'Task') {
                    question.documentId = question._id;
                }
            });
        });
    };

    $scope.getDefaultStatus = function () {
        if ($scope.studies.length === 0) {
            return 'active';
        }
        var status = 'archived';
        for (var i = 0; i < $scope.studies.length; i++) {
            if ($scope.studies[i].status === 'published' || $scope.studies[i].status === 'paused') {
                return 'active';
            }
            if ($scope.studies[i].status === 'draft') {
                status = 'draft';
            }
        }
        return status;
    };

    $scope.getParticipantSum = function () {
        $scope.participantSum = $scope.studies.reduce(function (sum, s) {
            return sum + s.participants;
        }, 0);
    };

    $scope.createStudy = function () {
        $state.go('shell.project.UserResearch.create.screens');
    };

    $scope.goToUserResearch = function () {
        $state.go('shell.project.UserResearch.list');
    };

    $scope.studyClick = function (study) {
        var status = $scope.getStatus(study);
        var action = {};

        action.draft = {
            url: 'shell.project.UserResearch.edit.screens',
            params: {
                studyId: study._id,
                study: study
            }
        };
        action.active = action.archived = {
            url: 'shell.project.UserResearch.review.overview',
            params: {
                studyId: study._id,
                study: study
            }
        };

        if (action[status]) {
            $state.go(action[status].url, action[status].params);
        }
    };

    /**
     * returns the status for the study for filtering on the ui.
     * Both published and paused map to active, the rest remain the same.
     * @param study
     */
    $scope.getStatus = function (study) {
        if (study.status === 'published' || study.status === 'paused') return 'active';
        return study.status;
    };

    /**
     *
     * Function to match the study's status with the selected status filter
     * @param study
     */
    $scope.filterByStatus = function (study) {
        return $scope.statusFilter === $scope.getStatus(study);
    };

    /**
     * Function to figure out the active study's
     * @returns {number}
     */
    $scope.activeStudiesSum = function () {
        var sum = 0;
        if ($scope.studies && $scope.studies.length > 0) {
            $scope.studies.forEach(function (study) {
                if ($scope.isActive(study)) {
                    sum += 1;
                }
            });
        }
        return sum;
    };

    /**
     *
     * Function to check out if the study is archived or published
     * @param study
     */
    $scope.isActive = function (study) {
        return (study.status === 'published' || study.status === 'paused');
    };
};

'use strict';
var _ = require('norman-client-tp').lodash;
var answers = require('../answers.js');

// @ngInject
module.exports = function ($scope, $state, $stateParams, currentStudy, NavBarService, UserService, AnonymousService) {
    NavBarService.setLogoState($state.current.name, $stateParams);
    $scope.study = currentStudy;
    // Need to sort the questions by ordinal and then subOrdinal
    // Dev-note: user uploads two images and creates two questions per image then the sorted list will q0-0,q0-1,q1-0,q1-1
    $scope.study.questions = _.sortByAll($scope.study.questions, ['ordinal', 'subOrdinal'], [true, true]);

    // Track if a user enables the anonymous button
    // Dev-note: result will only return the details of the user making the request
    $scope.isAnonymous = function () {
        AnonymousService.toggle().$promise
            .then(function (data) {
                $scope.isUserAnonymous = data.participants[0].isAnonymous;
                $scope.study.participants[0].isAnonymous = $scope.isUserAnonymous;
            });
    };


    if (!currentStudy.$promise) initParticipant();
    else currentStudy.$promise.then(initParticipant);

    /**
     * The answered questions and tasks must be found by checking 'question's, 'annotation's and 'answer's
     */
    function initAnsweredQuestions() {
        var qIds = [];
        $scope.qs = [];
        $scope.tasks = [];
        for (var i in $scope.study.questions) {
            var curQ = $scope.study.questions[i];
            if (curQ.type === 'Task') {
                $scope.tasks.push(curQ);
            }
            else {
                $scope.qs.push(curQ);
                qIds.push(curQ._id);
            }
        }
        $scope.numOfTasks = $scope.tasks.length;
        $scope.numOfQs = $scope.qs.length;

        // Generates item number text
        if ($scope.numOfTasks > 0 && $scope.numOfQs > 0) {
            $scope.quesString = $scope.study.questions.length + ' Item' +
                ($scope.study.questions.length > 1 ? 's' : '') + ' (' +
                $scope.numOfTasks + ' Task' + ($scope.numOfTasks > 1 ? 's' : '') + ', ' +
                $scope.numOfQs + ' Question' + ($scope.numOfQs > 1 ? 's' : '') + ')';
        }
        else if ($scope.numOfTasks > 0) {
            $scope.quesString = $scope.numOfTasks + ' Task' + ($scope.numOfTasks > 1 ? 's' : '');
        }
        else {
            $scope.quesString = $scope.numOfQs + ' Question' + ($scope.numOfQs > 1 ? 's' : '');
        }

        var ans = answers(currentStudy);
        $scope.answered = ans.answered;
        $scope.progress = ans.progress;
    }

    function initParticipant() {
        if (currentStudy.studyStatus === 'closed') {
            $scope.showStudy = false;
            return;
        }
        $scope.showStudy = true;

        // Will always return the user object unless the status is closed OR the user is in preview mode
        // HTTP status 404/500 will not get this far
        if ($scope.study && $scope.study.participants && $scope.study.participants.length === 1) {
            $scope.isUserAnonymous = $scope.study.participants[0].isAnonymous;
        }

        initAnsweredQuestions();
        updateFooterPosition();
        getUserName($scope.study.createBy);
    }

    // update footer position depending on the content height
    var scrollThrottle = null;

    function updateFooterPosition() {
        if (scrollThrottle) window.clearTimeout(scrollThrottle);
        scrollThrottle = window.setTimeout(function () {
            var par = document.querySelector('#norman-user-research .participant'),
                pl = document.getElementById('participant-list');

            if (pl) {
                pl.querySelector('.login-foot')
                    .classList
                    .toggle('static', pl.offsetHeight + 40 > par.offsetHeight);
            }
        }, 400);
    }

    window.addEventListener('resize', updateFooterPosition);

    // navigate to the root (localhost:9000), reloading the page
    // to reset (show) the aside
    $scope.goToNorman = function () {
        window.location.href = location.origin;
    };

    $scope.goToQuestion = function (id) {
        $state.go('^.question', {
            questionId: id,
            study: currentStudy
        });
    };

    $scope.findNextUnansweredQ = function () {
        for (var i = 0; i < $scope.study.questions.length; i++) {
            if ($scope.answered.indexOf($scope.study.questions[i]._id) === -1) {
                return $scope.study.questions[i]._id;
            }
        }
        return $scope.study.questions[0]._id;
    };

    function getUserName(userId) {
        UserService.getUserById({
                id: userId
            }).$promise
            .then(function (data) {
                $scope.creator = data;
            })
            .catch(function () {
                $scope.creator.name = '';
            });
    }
};

/*eslint no-unused-expressions: 0 */
'use strict';
var _ = require('norman-client-tp').lodash;

// @ngInject
module.exports = function ($scope, $state, $filter, $stateParams, $timeout,
                           Questions, Snapshots, Tasks, uiError, QuestionValidator, urUtil) {

    // Load screens for tasks
    $scope.$watch('currentQuestion._id', function (ver) {
        if (ver && $scope.currentQuestion.type === 'Task') {
            if ($scope.currentQuestion.pages) {
                $scope.pages = $scope.currentQuestion.pages;
            } else {
                Tasks.getTaskPages({
                    version: $scope.currentQuestion.snapshotVersion,
                    uiLang: $scope.currentQuestion.snapshotUILang,
                    snapshotId: $scope.currentQuestion.snapshotId
                }).$promise
                    .then(function (resp) {
                        if (!resp || !resp.length || !resp[0].deepLinks) {
                            return;
                        }
                        $scope.pages = resp[0].deepLinks;
                        $scope.pages.forEach(function (page) {
                            page.name = page.pageName.replace(/\.html$/, '');
                        });
                        $scope.currentQuestion.pages = $scope.pages;
                    });
            }
            $scope.updateTextCount();
        }
    });

    $scope.setQuestion = function () {
        $scope.currentQuestion = $scope.$parent.currentQuestion;
    };

    $scope.isStart = function (page) {
        return (page.pageUrl === $scope.currentQuestion.url);
    };

    $scope.isTarget = function (page) {
        $scope.currentQuestion.targetURL = $scope.currentQuestion.targetURL || [];
        return $scope.currentQuestion.targetURL.indexOf(page.pageUrl) > -1;
    };

    $scope.setStart = function (page) {
        $scope.currentQuestion.url = page.pageUrl;
        $scope.currentQuestion.thumbnail = page.thumbnail;
    };

    $scope.setTarget = function (page) {
        $scope.currentQuestion.targetURL = $scope.currentQuestion.targetURL || [];
        var idx = $scope.currentQuestion.targetURL.indexOf(page.pageUrl);
        if (idx > -1) $scope.currentQuestion.targetURL.splice(idx, 1);
        else $scope.currentQuestion.targetURL.push(page.pageUrl);
    };

    $scope.saveTask = function () {
            if ($scope.currentQuestion) {
                delete $scope.currentQuestion.changed;
                Tasks.update($scope.currentQuestion);
            }
    };

    $scope.questionChange = function () {
        $scope.currentQuestion.changed = true;
    };

    $scope.done = function () {
        if (!QuestionValidator.isValid($scope.currentQuestion)) {
            return;
        }
        $scope.$parent.questionId = null;
        $scope.close();
    };

    $scope.close = function () {
        $scope.$broadcast('dialog-close', 'editQuestionModal');
        $scope.$parent.currentUrl = '//:0';     // remove the deleted img so it's not visible when a new image is loading
    };

    $scope.showNavButton = function () {
        return $filter('QuestionsListFilter')($scope.study.questions).length > 1;
    };

    /**
     * Move through the question list
     *
     * @param step
     */
    $scope.moveTo = function (step) {
        if (!QuestionValidator.isValid($scope.currentQuestion)) {
            return;
        }

        // Step 1. Create unique sorted list of ordinals i.e. 0 -> n
        var uniqueSortedList = $filter('QuestionsListFilter')($scope.study.questions);

        // Step 2. List will always be sorted by ordinal so use that as the chosen index
        var index = $scope.currentQuestion.ordinal;
        var lastIdx = uniqueSortedList.length - 1;

        // Step 3. Update index to reflect users choice next|prev
        var stepIndx = ({next: 1, prev: -1})[step] || 0;
        index += stepIndx;
        if (index > lastIdx) {
            index = 0;
        }
        if (index < 0) {
            index = lastIdx;
        }
        // Step 4. Update modal to reflect chosen question
        $scope.updateModalContent(uniqueSortedList[index]);
    };

    /**
     * Update the UI with the new question details
     *
     * @param question
     */
    $scope.updateModalContent = function (question) {
        $scope.$parent.questionId = question._id;
        $scope.$parent.ordinal = question.ordinal;
        $scope.$parent.subOrdinal = 0;
        $scope.$parent.documentId = question.documentId;
        $scope.$parent.documentVersion = question.documentVersion;
        $scope.$parent.currentQuestion = question;
        $scope.$parent.currentUrl = '//:0';     // remove the previous img so it's not visible while the new one loads
        $scope.$parent.currentUrl = question.url;
        $scope.currentQuestion = question;
        $scope.$broadcast('dialog-next', 'editQuestionModal');
    };

    /**
     * Updates the current question from a tab change.
     */
    $scope.$on('current-question', function (event, details) {
        $scope.currentQuestion = details;
    });

    /**
     *  Deletes current image, including all questions associated with it
     */
    $scope.deleteAll = function () {
        if ($scope.currentQuestion.type === 'Task') {
            Tasks.delete({
                id: $scope.currentQuestion._id
            }).$promise
                .then(function () {
                    $scope.$parent.updateOrder();
                });
            $scope.study.questions.splice($scope.study.questions.indexOf($scope.currentQuestion), 1);
        }
        else if ($scope.currentQuestion.type !== 'Task') {
            // Bulk remove questions i.e. screen can have many questions attached to it
            // Dev-note: this will remove all questions with the ordinal of the current question
            Questions.bulkDelete({
                id: $scope.currentQuestion._id
            }).$promise
                .then(function () {
                    // Update questions on UI
                    _.remove($scope.study.questions, function (question) {
                        return question.ordinal === $scope.currentQuestion.ordinal;
                    });
                    $scope.$parent.updateOrder();
                });
        }
        $scope.close();
    };

    $scope.updateTextCount = function () {
        if ($scope.currentQuestion.text) {
            var comment = $scope.currentQuestion.text;
            var text = urUtil.textCountValidation(comment, 500);
            $scope.remainingCharacters = text.remaining;
            $scope.maxlength = text.max;

            if ($scope.limitString === true) {
                $scope.limitedString = urUtil.shortenText(comment, $scope.limitStringTo);
            }
        }
        else $scope.remainingCharacters = 500;
    };

    /**
     * Select the text inside input on focus with a delay to overcome chrome bug
     * @param   {object}  ev  event object
     */
    $scope.selectInput = function (ev) {
        $timeout(function () {
            ev.target && ev.target.select && ev.target.select();
        });
    };
};

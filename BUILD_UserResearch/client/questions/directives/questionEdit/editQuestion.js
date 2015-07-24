'use strict';
var _ = require('norman-client-tp').lodash;

// @ngInject
module.exports = function ($timeout, $state, $stateParams, Questions, QuestionValidator, uiError, urUtil) {
    return {
        restrict: 'E',
        scope: {
            study: '=',
            questionId: '=',
            questionDocumentId: '=',
            questionDocumentVersion: '=',
            questionOrdinal: '='
        },
        templateUrl: 'resources/norman-user-research-client/questions/directives/questionEdit/template.html',
        link: function (scope) {
            scope.maxQuestion = 6;
            scope.isMaxQuestion = false;
            scope.warningLevel = 30;

            // Triggered whenever the question ID changes
            scope.$watch('questionId', function () {
                if (scope.questionId) {
                    initQuestions();
                }
            });

            scope.updateTextCount = function (question) {
                var comment = question.text || '';
                var text = urUtil.textCountValidation(comment, 500);
                scope.remainingCharacters = text.remaining;
                scope.maxlength = text.max;
            };

            scope.$watch('tabSelected', function (newVal, oldVal) {
                // on tab switch, check if the old tab has a valid question before switching.
                if (oldVal) {
                    var questionToValidate = getQuestionForTab(oldVal);
                    if (!QuestionValidator.isValid(questionToValidate)) {
                        // Don't switch tabs if the current question isn't valid.
                        scope.tabSelected = oldVal;
                        scope.updateTextCount(questionToValidate);
                    }
                    else {
                        var newQuestion = getQuestionForTab(newVal);
                        scope.$emit('current-question', newQuestion);
                        scope.updateTextCount(newQuestion);
                    }
                }
            });

            if (!scope.study.$promise) {
                initQuestions();
            }
            else {
                scope.study.$promise.then(initQuestions);
            }

            /**
             * Update the scope with the question group, filtered by ordinal and sorted by subOrdinal 0-1-2-3-n
             */
            function initQuestions(selected) {
                selected = (typeof selected !== 'number') ? selected = 0 : --selected;

                // Step 1.  Filter existing questions for study
                scope.questions = _.sortBy(_.filter(scope.study.questions, function (question) {
                    return question.ordinal === scope.questionOrdinal;
                }), 'subOrdinal');

                if (scope.questions && !_.isEmpty(scope.questions)) {
                    // Step 2. Set current question, these settings will be shared for all questions in the group
                    scope.currentQuestion = scope.questions[selected];
                    scope.currentUrl = scope.currentQuestion.url;
                    scope.currentDocumentId = scope.questionDocumentId;
                    scope.currentDocumentVersion = scope.questionDocumentVersion;
                    scope.currentOrdinal = scope.questionOrdinal;

                    // Step 3. Set text count
                    scope.updateTextCount(scope.currentQuestion);

                    $timeout(function () {
                        if (!selected) scope.tabSelected = 'tab-0';
                    });

                    var questionListLength = scope.questions.length;
                    scope.isDeleteQuestion = (questionListLength > 1 ? true : false);
                    scope.isMaxQuestion = (questionListLength === scope.maxQuestion ? true : false);
                }
            }

            /**
             * Retrieves the question that is associated with the specified tab, for the current document.
             * @param tab the id of the tab whose question is to be retrieved.
             * @returns {*} the question associated with the supplied tab.
             */
            function getQuestionForTab(tab) {
                return scope.questions[parseFloat(tab.substring(tab.indexOf('tab-') + 4))];
            }

            scope.nb_annotations = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

            scope.change = function (question) {
                question.changed = true;
                scope.updateTextCount(question);
            };

            scope.update = function (question) {
                if (question.changed) {
                    if (question.type !== 'MultipleChoice' || (question.answerOptions.length > 1 && question.answerOptions[0] !== '' && question.answerOptions[1] !== '')) {
                        delete question.changed;
                        if (question.type !== 'MultipleChoice') {
                            question.answerOptions = [];
                        }
                        if (question.$promise) {
                            question.$promise.then(function () {
                                question.$update();
                            });
                        }
                        else {
                            question = Questions.update(question);
                        }
                    }
                }
            };

            scope.add = function () {
                var questionToValidate = getQuestionForTab(scope.tabSelected);
                if (!QuestionValidator.isValid(questionToValidate)) {
                    // don't create new tab if current question isn't valid.
                    return;
                }
                // Get length of question group
                var questionGroupLength = scope.questions.length;

                // Validate if maxQuestion count is breached?
                if (questionGroupLength < scope.maxQuestion) {
                    scope.tabSelected = 'tab-' + questionGroupLength;
                    // Use the default|first question to populate values of new question
                    scope.currentQuestion = scope.questions[0];

                    // Setup new question object to save to DB
                    var newQuestion = {
                        text: '',
                        url: scope.currentQuestion.url,
                        interactive: scope.currentQuestion.interactive,
                        thumbnail: scope.currentQuestion.thumbnail,
                        name: scope.currentQuestion.name,
                        ordinal: scope.currentQuestion.ordinal,
                        subOrdinal: scope.questions.length,
                        documentId: scope.questionDocumentId,
                        documentVersion: scope.questionDocumentVersion
                    };

                    newQuestion = Questions.save(newQuestion);
                    scope.$emit('current-question', newQuestion);
                    // Update existing modal
                    scope.questions.splice(newQuestion.subOrdinal, 0, newQuestion);
                    // Update parent ctrl which has a two-way bind on study.questions
                    scope.study.questions = scope.study.questions.concat([newQuestion]);

                    if ((questionGroupLength + 1) === scope.maxQuestion) {
                        scope.isMaxQuestion = true;
                    }
                    if ((questionGroupLength + 1) > 1) {
                        scope.isDeleteQuestion = true;
                    }

                    newQuestion.$promise.then(function () {
                        scope.$emit('update-order');
                        initQuestions(scope.questions.length);
                    });
                }
            };

            scope.delete = function (question) {
                if (question.$promise) {
                    question.$promise.then(function () {
                        question.$delete().then(function () {
                            scope.$emit('update-order');
                        });
                    });
                }
                else if (question._id) {
                    // ensure question has id i.e. it has been saved before
                    Questions.delete({
                        id: question._id
                    }).$promise.then(function () {
                            scope.$emit('update-order');
                        });
                }

                var nIdx = _.findIndex(scope.questions, {
                    _id: question._id
                });
                var isLast = false;
                var isFirst = (nIdx === 0 ? true : false);
                if (!isFirst) {
                    isLast = (nIdx === scope.questions.length - 1 ? true : false);
                }

                // Remove question from local list
                scope.questions.splice(nIdx, 1);
                // Remove question from global list, has a two way bind on it
                scope.study.questions.splice(_.findIndex(scope.study.questions, {
                    _id: question._id
                }), 1);

                var questionListCount = scope.questions.length;
                if (questionListCount < scope.maxQuestion) {
                    scope.isMaxQuestion = false;
                }

                if (questionListCount === 1) {
                    scope.isDeleteQuestion = false;
                    scope.tabSelected = 'tab-0';
                }
                else {
                    if (nIdx) {
                        scope.tabSelected = 'tab-0';
                    }
                    else if (isLast) {
                        scope.tabSelected = 'tab-' + (questionListCount - 1);
                    }
                }

                if (nIdx) {
                    scope.$emit('current-question', scope.questions[nIdx]);
                }
                else {
                    scope.$emit('current-question', scope.questions[nIdx - 1]);
                }
            };

            // multiple choice
            scope.addChoice = function (question) {
                if (question.answerOptions.length < 9) {
                    question.answerOptions.push('');
                    question.changed = true;
                    scope.update(question);
                }
                else {
                    uiError.create({
                        content: 'Multiple choice questions have a maximum of 9 options.',
                        dismissOnTimeout: true,
                        timeout: 3000,
                        dismissButton: true
                    });
                }
            };

            scope.deleteChoice = function (question, index) {
                question.answerOptions.splice(index, 1);
                question.changed = true;
                scope.update(question);
            };

        }
    };
};

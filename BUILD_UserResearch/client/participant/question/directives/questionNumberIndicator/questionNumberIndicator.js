'use strict';

// @ngInject
module.exports = function () {
    return {
        restrict: 'E',
        scope: {
            study: '=',
            currentQuestionIndex: '='
        },
        templateUrl: 'resources/norman-user-research-client/participant/question/directives/questionNumberIndicator/template.html',
        link: function (scope) {

            scope.hasMultipleQuestions = function () {
                if (scope.study.questions[scope.currentQuestionIndex].type === 'Task') {
                    return false;
                }
                var questionsForCurrentUrl = scope.study.questions.filter(function (q) {
                    return q.url === scope.study.questions[scope.currentQuestionIndex].url;
                });
                return questionsForCurrentUrl.length > 1;
            };

            scope.onNumberClick = function (index) {
                scope.$emit('goToQuestionIndex', {index: index});
            };
        }


    };
};

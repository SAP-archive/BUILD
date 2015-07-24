'use strict';
/**
 * Directive that render participant breakdown for question review.
 * @returns {{restrict: string, scope: object, template: string,  link: Function}}
 */
// @ngInject
module.exports = function ParticipantQuestionBreakdownDirective() {
    return {
        templateUrl: 'resources/norman-user-research-client/review/directives/participant-question-breakdown/participant-question-breakdown.html',
        restrict: 'E',
        scope: {
            bindModel: '=ngModel',
            questionType: '=ngType'
        }
    };
};

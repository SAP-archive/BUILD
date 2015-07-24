'use strict';
/**
 * Directive that render participant breakdown for study review.
 * @returns {{restrict: string, scope: object, template: string,  link: Function}}
 */
// @ngInject
module.exports = function ParticipantStudyBreakdownDirective() {
    return {
        templateUrl: 'resources/norman-user-research-client/review/directives/participant-study-breakdown/participant-study-breakdown.html',
        restrict: 'E',
        scope: {
            bindModel: '=ngModel'
        },
        link: function (scope) {
            scope.isSelectedIndex = '';
            scope.setSelected = function (index) {
                if (scope.isSelectedIndex !== index) {
                    scope.isSelectedIndex = index;
                }
                else {
                    scope.isSelectedIndex = '';
                }
            };
        }
    };
};

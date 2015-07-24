'use strict';
/**
 * Directive that render participant breakdown for task review.
 * @returns {{restrict: string, scope: object, template: string,  link: Function}}
 */
// @ngInject
module.exports = function ParticipantTaskBreakdownDirective() {
    return {
        templateUrl: 'resources/norman-user-research-client/review/directives/participant-task-breakdown/participant-task-breakdown.html',
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

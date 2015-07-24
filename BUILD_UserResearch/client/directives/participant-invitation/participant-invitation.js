'use strict';
angular.module('UserResearch')
.controller('ParticipantInvitationDirectiveCtrl', require('./participant-invitation-directive.controller.js'));
/**
 * Directive that render participant invitation UX for study.
 * @returns {{restrict: string, scope: object, template: string,  link: Function}}
 */
// @ngInject
module.exports = function ParticipantInvitationDirective() {
    return {
        templateUrl: 'resources/norman-user-research-client/directives/participant-invitation/participant-invitation.html',
        restrict: 'E',
        replace: true,
        scope: {
            invite_list: '=inviteList',
            study_status: '=studyStatus',
            study_url: '=studyUrl'
        },
        controller: 'ParticipantInvitationDirectiveCtrl'
    };
};





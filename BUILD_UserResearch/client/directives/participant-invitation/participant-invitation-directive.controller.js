'use strict';
var _ = require('norman-client-tp').lodash;
/**
 * Controller:  Participant Invitation Controller for Directive
 */
// @ngInject
module.exports = function ($scope, uiError, Studies, $stateParams) {
        $scope.inviteList = [];
        $scope.countNewInvite = 0;
        if ($scope.invite_list) {
              $scope.inviteList = $scope.invite_list;
        }

        $scope.addInvitee = function (inviteEmail) {
            inviteEmail = inviteEmail.toLowerCase();
            var isExistIninviteList = _.findIndex($scope.inviteList, function (invitee) {
                return invitee.email === inviteEmail;
            });
            if (isExistIninviteList !== -1) {
                 uiError.create({
                    content: 'You’ve already added this email!'
                 });
            }
            else {
               $scope.countNewInvite ++;
               $scope.inviteList.unshift({email: inviteEmail, status: 'new'});

            }

            $scope.inviteEmail = null; //   clear inviteEmail to clear input
        };

        $scope.removeInvite = function (email) {
            var index = _.findIndex($scope.inviteList, function (invitee) {
                return invitee.email === email;
            });

             $scope.inviteList.splice(index, 1);//    remove
             $scope.countNewInvite = _.filter($scope.inviteList, { status: 'new'}).length;
        };

        $scope.sendInvitee = function () {

             var newInviteList = _.filter($scope.inviteList, { status: 'new'});
             Studies.sendInvitee({_id: $stateParams.studyId, projectId: $stateParams.currentProject, inviteList: newInviteList, studyUrl: $scope.study_url})
                 .$promise.then(function (data) {
                     $scope.countNewInvite = 0;
                     var rejectedEmails = [];
                     var optOutEmails = [];
                     //    update status on UI
                     _.forEach(data.newInvitee, function (invitee) {
                         if (invitee.status === 'rejected') rejectedEmails.push({name: 'Email', value: invitee.email, message: invitee.email});
                         if (invitee.status === 'opt-out') optOutEmails.push({name: 'Email', value: invitee.email, message: invitee.email});

                         var index = _.indexOf($scope.inviteList, _.find($scope.inviteList, {email: invitee.email}));
                         $scope.inviteList.splice(index, 1, {email: invitee.email, status: invitee.status});
                     });

                    if (rejectedEmails.length > 0) {
                        uiError.create({
                            title: 'These email addresses below can’t currently be added. If you’re sure they are valid, contact the Build Administrator.',
                            content: rejectedEmails
                        });
                    }
                    if (optOutEmails.length > 0) {
                        uiError.create({
                            title: 'The owners of the following email addresses have told the Build team they don’t want ' +
                            'to receive e-mail notifications, so they have not been invited to participate in your study:',
                            content: optOutEmails
                        });
                    }

             }, function (error) {

                if (error && error.data && error.data.message) {
                        uiError.create({
                        content: error.data.message
                    });
                        return;
                }

                if (error && error.statusText) {
                     uiError.create({
                     content: error.statusText
                    });
                }
                else {
                    uiError.create({
                     content: 'Cannot process your request, please try again.'
                    });
                }
             });

        };
    };



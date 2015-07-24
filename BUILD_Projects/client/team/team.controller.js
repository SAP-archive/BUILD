'use strict';
var _ = require('norman-client-tp').lodash;

// Controller for page showing users invited to a project
// @ngInject
module.exports = function ($rootScope, $scope, $state, $log, AsideFactory, Auth, ProjectFactory, ActiveProjectService, uiError) {

    var that = this;
    that.errorStatus = '';
    that.newInvite = {};
    that.userList = []; // Users assigned to the project who have accepted their invites
    that.pendingInviteList = []; // Users assigned to the project who have accepted their invites
    that.rejectInviteList = []; // Users who have rejected their invite to the project
    that.addUserInviteList = []; // This is used to populate the list of invitees in the popover (should just be a list of email strings)
    that.newUserEmail = ''; // The model object used in the email field
    that.popoverIsOpen = false; // Flag used to check if popover is already open
    that.user = Auth.getCurrentUser();
    that.showAllTeamMembers = false;
    that.numOfHidden = 0;

    $scope.$on('ANGULAR_DRAG_START', function ($event, channel) {
        if (channel === 'owner') {
            var container = document.getElementsByClassName('team-container')[0];
            var containerElement = angular.element(container);
            containerElement.addClass('team-owner-dragging');
        }

    });
    $scope.$on('ANGULAR_DRAG_END', function ($event, channel) {
        if (channel === 'owner') {
            var container = document.getElementsByClassName('team-container')[0];
            var containerElement = angular.element(container);
            containerElement.removeClass('team-owner-dragging');
        }
    });
    this.isCurrentUser = function (user) {
        return user._id === that.user._id;
    };

    /**
     * Takes the user object and compares against the project's userList to determine if they are the owner
     *
     * @param {object} user The user object to be compared against the userList
     * @returns {boolean} Returns true or false to show if the user is the project owner
     */
    this.isOwner = function (user) {
        for (var i = 0; i < that.userList.length; i++) {
            if (that.userList[i]._id === user._id && that.userList[i].role === 'owner') {
                return true;
            }
        }
        return false;

    };

    ProjectFactory.getTeam({
        id: ActiveProjectService.id
    }).$promise
        .then(function (data) {
            that.teamResponse(data);
        }).catch(function (error) {
            uiError.create({
                content: error.data.error,
                dismissOnTimeout: false
            });
        });

    /**
     * This is triggered when a user hits add, which adds an email to the invite list,
     * and then resets the email field to make it ready for a new entry
     *
     * @param {String} sEmail The email being added to the project
     **/
    this.addEmailToInviteList = function (sEmail) {
        for (var i = 0; i < that.pendingInviteList.length; i++) {
            if (sEmail === that.pendingInviteList[i].email) {
                uiError.create({
                    content: 'An invitation has already been sent to this address',
                    dismissOnTimeout: true,
                    timeout: 3000,
                    dismissButton: true
                });
                return;
            }
        }
        for (var n = 0; n < that.userList.length; n++) {
            if (sEmail === that.userList[n].email) {
                uiError.create({
                    content: 'This user is already on your team',
                    dismissOnTimeout: true,
                    timeout: 3000,
                    dismissButton: true
                });
                return;
            }
        }
        for (var m = 0; m < that.addUserInviteList.length; m++) {
            if (sEmail === that.addUserInviteList[m].email) {
                uiError.create({
                    content: 'This email has already been added',
                    dismissOnTimeout: true,
                    timeout: 3000,
                    dismissButton: true
                });
                return;
            }
        }
        if (!sEmail) {
            // show invalid email error on UI
            return;
        }
        that.addUserInviteList.push({
            email: sEmail
        });
        that.newUserEmail = '';
    };

    this.refreshTeam = function () {
        ProjectFactory.getTeam({
            id: ActiveProjectService.id
        }).$promise
            .then(function (data) {
                that.teamResponse(data);
            }).catch(function (error) {
                uiError.create({
                    content: error.data.error,
                    dismissOnTimeout: false
                });
            });
    };

    /**
     * Updates the owner of the project to be a new user.
     *
     * @param {object} user The user which is going to be set as the project's new owner
     */
    this.setOwner = function (user) {
        if (that.isOwner(that.user)) {
            that.newOwnerUser = user;
            $rootScope.$broadcast('dialog-open', {
                elementId: 'npTeamOwnerChangeDialog',
                payload: user
            });
        }
    };

    this.confirmOwner = function (ownerId) {
        ProjectFactory.setOwner({
            id: ActiveProjectService.id
        }, {userId: ownerId}).$promise
            .then(function () {
                that.refreshTeam();
                if (that.user._id !== ownerId) {
                    AsideFactory.pop('settings');
                }
            }).catch(function (error) {
                uiError.create({
                    content: error.data.message,
                    dismissOnTimeout: false
                });
            });
    };

    /**
     * When a user hits send invites,
     * send an invite to all of the users in the list before resetting the list and the user field
     **/
    this.sendInvites = function () {

        if (that.addUserInviteList.length) {
            // make call to send invites here
            ProjectFactory.createInvite({
                id: ActiveProjectService.id
            }, {
                email_list: that.addUserInviteList
            }).$promise
                .then(function (data) {
                that.refreshTeam();

                 var rejectedEmails = [];
                 var optOutEmails = [];
                  _.forEach(data.newInvitee, function (n) {
                     if (n.status === 'rejected') rejectedEmails.push({name: 'Email', value: n.email, message: n.email});
                     if (n.status === 'opt-out') optOutEmails.push({name: 'Email', value: n.email, message: n.email});
                  });

                  if (rejectedEmails.length > 0) {
                      uiError.create({
                        title: 'These email addresses below can’t currently be added. If you’re sure they are valid, contact the Build Administrator.',
                        content: rejectedEmails
                     });
                  }

                   if (optOutEmails.length > 0) {
                      uiError.create({
                        title: 'The owners of the following email addresses have told the Build team they don’t want to received e-mail notifications, so they will be invited via their Build Home page:',
                        content: optOutEmails
                     });
                  }
                }
            ).catch(function (error) {
                    uiError.create({
                        content: error.data.error,
                        dismissOnTimeout: false
                    });

                });
        }

        that.addUserInviteList = [];
        that.newUserEmail = '';
        that.popoverIsOpen = false;
    };

    this.handleOpenPopover = function () {
        that.popoverIsOpen = true;
    };

    /**
     * When a user hits cancel invites, reset the invite list and the new email field
     **/
    this.cancelInvites = function () {
        that.addUserInviteList = [];
        that.newUserEmail = '';
        that.popoverIsOpen = false;
    };

    /**
     * Removes an email from the new set to emails that the invites will be sent to
     *
     * @param {integer} index The index of the email in the new user list
     */
    this.removeInvite = function (index) {
        that.addUserInviteList.splice(index, 1);
    };

    this.teamResponse = function (response) {
        that.pendingInviteList = response.invite_list;
        that.rejectInviteList = response.reject_list;
        that.userList = response.user_list;
    };

};

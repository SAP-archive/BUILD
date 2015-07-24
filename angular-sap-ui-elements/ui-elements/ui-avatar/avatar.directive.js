'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiAvatar
 *
 * @description
 * Displays the user avatar (or initials) and whether they are online or offline
 *
 * @restrict E
 * @element ANY
 *
 * @param {string} avatarImage the url to the user avatar to be displayed
 * @param {string} avatarName the string the avatar initials are based on when no image has been provided
 * @param {string} avatarState the state of the user, whether they are active/inactive
 *
 * @example

 <doc:example>
 <doc:source>
 <ui-avatar avatar-image="url(../resources/angular-sap-ui-elements/assets/sample_user.png)" avatar-state="active"></ui-avatar>
 </doc:source>
 </doc:example>
 *
 */

// @ngInject
module.exports = function () {
    return {
        scope: {
            avatarOrigImage: '@avatarImage',
            avatarName: '@',
            avatarState: '@'
        },
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-avatar/avatar.template.html',
        restrict: 'E',
        link: function (scope) {
            scope.avatarImage = scope.avatarOrigImage;
            scope.$on('userAvatarUpdated', function(evt, data) {
                if( data && data.hash ) {
                    scope.avatarImage = data.userUrl + '?' + data.hash;
                } else {
                    scope.avatarImage = null;
                }
            });
            scope.$watch('avatarOrigImage', function(newVal) {
                scope.avatarImage = newVal;
            });
        }
    };
};

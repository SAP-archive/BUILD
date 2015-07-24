'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiProjectTile
 *
 * @description
 * Creates a tile representation for a project with name, users and project image displayed.
 *
 * @restrict E
 * @element ANY
 *
 * @param {string} projectName The name that has been entered for the project
 * @param {string} projectImage The image reference that will be used for the project
 * @param {array} projectUsers The list of users who have been assigned to the project which can then be displayed on the tile
 *                eg. [{name: 'Jimi Hendrix', picture:'url(../resources/angular-sap-ui-elements/assets/sample_user.png)', state: 'active'}]
 * @param {string} newProject The flag which decides if it is a new project tile or an existing project tile
 * @param {object} projectModel The project model being bound to the tile
 * @param {string} inputField The object to be used as the model for the new project input field
 * @param {string} focusInput A true/false string which indicates whether the new project input field should be focused on
 * @param {string} showFooter Indicates whether or not the accept/reject footer should be shown
 * @param {string} acceptAction The function to be executed when the user clicks on the accept button
 * @param {string} rejectAction The function to be executed when the user hits the reject button
 *
 * @example

 <doc:example>
 <doc:source>
 <ui-project-tile project-name="Test project" project-image="url(../resources/angular-sap-ui-elements/assets/sample_project.png)" project-users="users"></ui-project-tile>
 </doc:source>
 </doc:example>
 *
 */

// @ngInject
module.exports = function() {
    return {
        scope: {
            projectName: '@',
            projectImage: '@',
            projectUsers: '=',
            projectUserFilter: '=',
            newProject: '@',
            projectModel: '=',
            inputField: '@',
            focusInput: '@',
	        showFooter: '@',
            acceptAction: '&',
            rejectAction: '&',
            hoverClass: '@',
            showOwner:'@',
            cancelAction: '&',
            showCancel:'@'
        },
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-project-tile/projectTile.template.html',
        restrict: 'AE',
        replace: true,
        link: function(scope, element) {
            scope.remainingUsers = scope.projectUsers ? '+' + (scope.projectUsers.length - 5) : '';
            scope.filterBy = scope.projectUserFilter || false; // if there is no filter defined, set it to be false

            scope.rejectProject = function() {
                if (scope.rejectAction) {
                    scope.rejectAction();
                }
            };

            scope.acceptProject = function() {
                if (scope.acceptAction) {
                    scope.acceptAction();
                }
            };

            scope.cancelProject = function() {
                if (scope.cancelAction) {
                    scope.cancelAction();
                }
            };

            element.on('mouseenter', function() {
                element.addClass(scope.hoverClass);
            });

            element.on('mouseleave', function() {
                element.removeClass(scope.hoverClass);
            });
        }
    };
};

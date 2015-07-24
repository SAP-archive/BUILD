'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiMainMenu
 *
 * @description
 * Wrapper for a main menu that monitors the currently selected menu option.
 *
 * @restrict E
 * @element ANY
 *
 * @param {string} selectedOption the currently selected menu option
 *
 * @example

 <doc:example>
    <doc:source>
        <ui-main-menu selected-option="assets">
            <ui-main-menu-option type="projects" text="Projects" badge="21"></ui-main-menu-option>
        </ui-main-menu>
    </doc:source>
 </doc:example>
 *
 */

// @ngInject
module.exports = function() {
    return {
        restrict: 'E',
        scope: {
            selectedOption: '@'
        },
        controller: ['$scope', function($scope) {
            $scope.selectedOption = '';
            this.getSelectedOption = function() {
                return $scope.selectedOption;
            };
            this.setSelectedOption = function(selectedOption) {
                $scope.selectedOption = selectedOption;
            };
        }]
    };
};

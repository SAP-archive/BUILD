'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiMainMenuOption
 *
 * @description
 * Renders a main menu option within a main menu
 *
 * @restrict E
 * @element ANY
 *
 * @param {string} type the type of the menu option.
 * @param {string} text the text to be displayed in the menu option underneath its associated icon.
 * @param {string} badge the text for a badge, if present, that gets rendered alongside the menu option.
 *
 * @example

 <doc:example>
 <doc:source>
 <ui-main-menu-option type="projects" text="Projects" badge="21"></ui-main-menu-option>
 </doc:source>
 </doc:example>
 *
 */

// @ngInject
module.exports = function() {
    return {
        restrict: 'E',
        scope: {
            type: '@',
            text: '@',
            badge: '@',
            show: '@'
        },
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-main-menu/main.menu.option.template.html',
        require: '^uiMainMenu',
        link: function(scope, element, attrs, mainMenuController) {
            scope.menuClass = '';
            scope.selectOption = function() {
                mainMenuController.setSelectedOption(scope.type);
            };

			scope.className = function() {
				var className = 'ui-menu-option';
				if (scope.type) {
					className += ' ' + scope.type;
				}
				if (mainMenuController.getSelectedOption() === scope.type) {
					className += ' on';
				}
				if (scope.show === 'false') {
					className += ' hidden';
				}
 				return className;
			};

        },
        transclude: true,
        replace: true
    };
};

'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiScreenTile
 *
 * @description
 * Creates a tile representation for a screen with name, image displayed.
 *
 * @restrict E
 * @element ANY
 *
 * @param {string} screenName The name that has been entered for the screen
 * @param {string} screenImage The image reference that will be used for the screen
 * @param {string} newScreen The flag which decides if it is a new screen tile or an existing screen tile
 * @param {object} screenModel The screen model being bound to the tile
 * @param {string} inputField The object to be used as the model for the new screen input field
 * @param {string} focusInput A true/false string which indicates whether the new screen input field should be focused on
 * @param {string} hoverClass
 * @param {function} removeAction Action to trigger when user clicks on remove button
 * @param {string} showRemove A true/false string which indicates whether the remove button is displayed
 *
 * @example

 <doc:example>
 <doc:source>
 <ui-screen-tile screen-name="Test screen" screen-image="url(../resources/angular-sap-ui-elements/assets/sample_screen.png)" screen-users="users"></ui-screen-tile>
 </doc:source>
 </doc:example>
 *
 */

// @ngInject
module.exports = function() {
    return {
        scope: {
            screenName: '@',
            screenImage: '@',
            newScreen: '@',
            screenModel: '=',
            inputField: '@',
            focusInput: '@',
            hoverClass: '@',
            removeAction: '&',
            showRemove: '@'
        },
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-screen-tile/screen.tile.template.html',
        restrict: 'AE',
        replace: true,
        link: function(scope, element) {
            element.on('mouseenter', function() {
                element.addClass(scope.hoverClass);
            });

            element.on('mouseleave', function() {
                element.removeClass(scope.hoverClass);
            });

            scope.remove = function (event) {
                if (event && event.stopPropagation) {
                    event.stopPropagation();
                }

                if (scope.removeAction) {
                    scope.removeAction();
                }
            };
        }
    };
};

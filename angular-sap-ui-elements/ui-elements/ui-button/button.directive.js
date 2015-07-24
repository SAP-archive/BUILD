'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiButton
 *
 * @description
 * Creates a HTML button element with relevant styling applied.
 *
 * @restrict E
 * @element ANY
 *
 * @param {string} size the size of the button to be displayed. Currently supports 'small' and 'large'. Default value is 'small'
 * @param {any} green is the color used for the button.
 * @param {any} red is the color used for the button.
 *
 * @example

 <doc:example>
    <doc:source>
        <ui-button size="small" ng-click="doSomething()">Button text</ui-button>
    </doc:source>
 </doc:example>
 *
 */

// @ngInject
module.exports = function() {
    return {
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-button/button.template.html',
        restrict: 'E',
        replace: true,
        transclude: true,
        link: function(scope, element, attrs) {
            if (typeof attrs.isIcon !== 'undefined') {
                angular.element(element).addClass('ui-button-icon');
            } else {
                if (!attrs.size) attrs.size = 'small';
                angular.element(element).addClass('ui-button ui-button-' + attrs.size);
            }
        }
    };
};

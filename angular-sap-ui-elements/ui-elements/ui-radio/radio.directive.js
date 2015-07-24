'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiRadio
 *
 * @description
 * Creates a HTML input radio element with relevant styling applied.
 *
 * @restrict E
 * @element ANY
 *
 * @param {} dark if present, the rendered element will be applied with a dark styling theme.
 *
 * @example

 <doc:example>
    <doc:source>
        <ui-radio ng-model="selectedOption" value="Option1" id="Option1"></ui-radio>
        <label for="Option1">First Item</label>
    </doc:source>
 </doc:example>
 *
 */

// @ngInject
module.exports = function () {
    return {
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-radio/radio.template.html',
        restrict: 'E',
        replace: true,
        transclude: true,
        link: function(scope, element, attrs) {
            if (attrs.dark !== undefined) {
                angular.element(element).addClass('dark');
            } else {
                angular.element(element).addClass('light');
            }
        }
    };
};

'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiInput
 *
 * @description
 * Creates a HTML input text element with relevant styling applied.
 *
 * @restrict E
 * @element ANY
 *
 * @param {} dark if present, the rendered element will be applied with a dark styling theme.
 * @param {} clickHighlight if present, the rendered element input box will highlight it's text on click.
 *
 * @example

 <doc:example>
 <doc:source>
 <ui-input dark click-highlight></ui-input>
 </doc:source>
 </doc:example>
 *
 */

// @ngInject
module.exports = function() {
    return {
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-input/input.template.html',
        restrict: 'E',
        replace: true,
        require: ['?ngModel'],
        link: function(scope, element, attrs) {

            if (attrs.dark !== undefined) {
                angular.element(element).addClass('dark');
            } else {
                angular.element(element).addClass('light');
            }

            if (attrs.clickHighlight !== undefined) {
                angular.element(element).on('click', function() {
                    this.select();
                });
            }
        }
    };
};

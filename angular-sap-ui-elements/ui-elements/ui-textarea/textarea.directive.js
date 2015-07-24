'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiTextarea
 *
 * @description
 * Creates a HTML textarea element with same styling as per ui-input.
 *
 * @restrict E
 * @element ANY
 *
 * @param {} dark if present, the rendered element will be applied with the dark ui-input theme.
 * @param {string} resize A CSS resize property value to specify how the textarea can be resized.
 *
 * @example

 <doc:example>
    <doc:source>
        <ui-textarea dark></ui-textarea>
    </doc:source>
 </doc:example>
 *
 */

// @ngInject
module.exports = function () {
    return {
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-textarea/textarea.template.html',
        restrict: 'E',
        replace: true,
        scope: {
            resize: '@'
        },
        link: function (scope, element, attrs) {
            if (attrs.dark !== undefined) {
                angular.element(element).addClass('dark');
            } else {
                angular.element(element).addClass('light');
            }

            if(attrs.resize !== undefined){
                angular.element(element).css('resize', scope.resize);
            }
        }
    };
};

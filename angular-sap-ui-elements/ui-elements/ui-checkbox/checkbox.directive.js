'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiCheckbox
 *
 * @description
 * Creates a HTML input checkbox element with relevant styling applied.
 *
 * @restrict E
 * @element ANY
 *
 * @param {} dark if present, the rendered element will be applied with a dark styling theme.
 *
 * @example

 <doc:example>
    <doc:source>
        <ui-checkbox ng-model="selectedOption" id="check1"></ui-checkbox>
        <label for="check1">First Item</label>
    </doc:source>
 </doc:example>
 *
 */

// @ngInject
module.exports = function () {
    return {
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-checkbox/checkbox.template.html',
        link: function(scope, element, attrs) {
            if (attrs.dark !== undefined) {
                angular.element(element).addClass('dark');
            } else {
                angular.element(element).addClass('light');
            }

            var label = document.querySelector('label[for="' + attrs.id + '"]');
            if (label) {
                angular.element(label).on('keyup', function (ev) {
                    // (un)check on enter & space (label must have tabindex attribute to be focusable)
                    if (ev.keyCode === 32 || ev.keyCode === 13) {
                        element[0].checked = !element[0].checked;
                    }
                });
            }
        },
        restrict: 'E',
        replace: true,
        transclude: true
    };
};

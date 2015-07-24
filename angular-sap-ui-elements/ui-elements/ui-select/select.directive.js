'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiSelect
 *
 * @description
 * Creates a HTML select element with relevant styling applied.
 *
 * @restrict E
 * @element ANY
 *
 * @param {} dark if present, the rendered element will be applied with a dark styling theme.
 *
 * @example

 <doc:example>
 <doc:source>
 <ui-select ng-model="selectedItem" ng-options="item.name for item in items">
 </ui-select>
 </doc:source>
 </doc:example>
 *
 */

// @ngInject
module.exports = function () {
    return {
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-select/select.template.html',
        restrict: 'E',
        replace: true,
        transclude: true,
        link: function (scope, element, attrs) {
            if (attrs.dark !== undefined) {
                angular.element(element).addClass('dark');
            } else {
                angular.element(element).addClass('light');
            }
        }
    };
};

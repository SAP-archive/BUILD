'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiPill
 *
 * @description
 * Creates a HTML pill element with relevant styling applied.
 *
 * @restrict E
 * @element ANY
 *
 * @param {string} style the css style to apply to the pill
 *
 * @example

 <doc:example>
    <doc:source>
        <ui-pill color="red" ng-click="doSomething()">pdf</ui-pill>
    </doc:source>
 </doc:example>
 *
 */

// @ngInject
module.exports = function($compile, $timeout) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
            color: '@',
            txt: '@'
        },
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-pill/pill.template.html',
        controllerAs: 'uiPillCtrl',
        controller: ['$scope', '$element', 'uiPillProvider', uiPillController]
    };

    function uiPillController(scope, $element, uiPillProvider) {
        if (typeof scope.color === 'undefined' || scope.color === '') {
            scope.color = uiPillProvider.getColor(scope.txt);
        }

        $timeout(function() {
            scope.$apply();
        });

        scope.$on('$destroy', function() {
            $element.detach();
        });
    }
};

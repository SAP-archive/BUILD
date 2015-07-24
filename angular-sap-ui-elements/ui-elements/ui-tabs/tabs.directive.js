'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiTabs
 *
 * @description
 * Wrapper for a list of tab option elements.
 *
 * @restrict E
 * @element ANY
 *
 * @param {string} selectedTab the currently selected tab.
 *
 * @example
 *
 * Note: Currently the tab container needs to explicitly identify it's own width and height.


 <doc:example>
 <doc:source>
 <ui-tabs selected-tab="tab1" style="width: 300px; height: 200px;">
 <ui-tab-option id="tab1" title="TAB1"></ui-tab-option>
 <ui-tab-option id="tab2" title="TAB2"></ui-tab-option>
 </ui-tabs>
 </doc:source>
 </doc:example>
 *
 */

// @ngInject
module.exports = function () {
    return {
        restrict: 'E',
        scope: {
            selectedTab: '@',
            tabOn: '=?'
        },
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-tabs/tabs.template.html',
        transclude: true,
        replace: true,
        link: function (scope, element, attrs, ctrl) {
            if (attrs.light === undefined) {
                angular.element(element).addClass('dark');
            } else {
                angular.element(element).addClass('light');
            }
            if (scope.selectedTab) {
                scope.tabOn = scope.selectedTab;
            }
            scope.$watch('selectedTab', function (oldVal, newVal) {
                scope.tabOn = scope.selectedTab;
            });
        },
        controller: ['$scope', function ($scope) {
            this.getSelectedTab = function () {
                return $scope.tabOn;
            };
            this.setSelectedTab = function (selectedTab) {
                $scope.tabOn = selectedTab;
            };
        }]
    };
};

'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiTabOption
 *
 * @description
 * A tab option and associated content for use in a tab container.
 *
 * @restrict E
 * @element ANY
 *
 * @param {title} the title of the tab.
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
module.exports = function ($timeout) {
    return {
        restrict: 'E',
        scope: {
            title: '@'
        },
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-tabs/tab.option.template.html',
        transclude: true,
        require: '^uiTabs',
        link: function (scope, element, attrs, tabController) {

            $timeout(function () {
                // Ensure the title is not on the DOM as a tooltip.
                angular.element(element).removeAttr('title');
            });

            scope.selectTab = function () {
                tabController.setSelectedTab(attrs.id);
            };
            scope.isSelectedTab = function () {
                return tabController.getSelectedTab() === attrs.id;
            };
        },
        replace: true
    };
};

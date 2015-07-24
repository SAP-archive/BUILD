'use strict';

// @ngInject
module.exports = function () {
    return {
        restrict: 'EA',
        require: '^uiAccordionPane',
        transclude: true,
        replace: true,
        template: '<div><div ng-click="uiAccordionPaneCtrl.toggle()" class="ui-accordion-paneHeader-arrow"></div><div ng-transclude ng-click="uiAccordionPaneCtrl.toggle()" class="ui-accordion-paneHeader-txt"></div></div>',
        scope: {},
        compile: function (element) {
            element.addClass('ui-accordion-paneHeader');

            return function postLink(scope, element, attrs, uiAccordionPaneCtrl) {
                scope.uiAccordionPaneCtrl = uiAccordionPaneCtrl;
            };
        }
    };
};

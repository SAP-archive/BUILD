'use strict';

// @ngInject
module.exports = function() {
  return {
    restrict: 'EA',
    require: '^uiAccordionPane',
    transclude: true,
    replace: true,
    template: '<div><div ng-transclude></div></div>',
    scope: {},
    compile: function(element) {
      element.addClass('ui-accordion-paneContent');

      return function postLink(scope, element, attrs, uiAccordionPaneCtrl) {
        scope.uiAccordionPaneCtrl = uiAccordionPaneCtrl;
      };
    }
  };
};

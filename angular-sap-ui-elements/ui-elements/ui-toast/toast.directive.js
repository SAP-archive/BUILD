'use strict';

// @ngInject
module.exports = function(uiToast, $templateCache, $log) {
  return {
    replace: true,
    restrict: 'E',
    templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-toast/toast.template.html',
    compile: function(elem, attrs) {
      if (attrs.template) {
        var template = $templateCache.get(attrs.template);
        if (template) {
          elem.replaceWith(template);
        } else {
          $log.warn('uiToast: Provided template could not be loaded. ' +
            'Please be sure that it is populated before the <ui-toast> element is represented.');
        }
      }

      return function(scope) {
        scope.hPos = uiToast.settings.horizontalPosition;
        scope.vPos = uiToast.settings.verticalPosition;
        scope.messages = uiToast.messages;
      };
    }
  };
};

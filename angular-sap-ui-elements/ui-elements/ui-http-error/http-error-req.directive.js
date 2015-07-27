'use strict';

// @ngInject
module.exports = function (httpToast, $templateCache, $log) {
    return {
        replace: true,
        restrict: 'E',
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-http-error/http-error-req.template.html',
        compile: function (elem, attrs) {
            if (attrs.template) {
                var template = $templateCache.get(attrs.template);
                if (template) {
                    elem.replaceWith(template);
                } else {
                    $log.warn('httpToast: Provided template could not be loaded. ' +
                            'Please be sure that it is populated before the <http-toast> element is represented.');
                }
            }

            return function (scope) {
                scope.hPos = httpToast.settings.horizontalPosition;
                scope.vPos = httpToast.settings.verticalPosition;
                scope.httpMessages = httpToast.httpMessages;
            };
        }
    };
};

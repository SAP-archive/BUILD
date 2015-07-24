'use strict';

module.exports = function ($rootScope) {
    return {
        restrict: 'E',
        scope: {
            showBusyIndicator: '=',
            fullScreen: '='
        },
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-busy-indicator/busy.indicator.template.html'
    };
};

'use strict';

var npBusyIndicator = [
    function () {
        return {
            restrict: 'E',
            scope: {
                showBusyIndicator: '='
            },
            template: '<div class="np-busy-indicator" ng-show="showBusyIndicator"><div class="np-busy-indicator-ball np-busy-indicator-ball-1"></div><div class="np-busy-indicator-ball np-busy-indicator-ball-2"></div><div class="np-busy-indicator-ball np-busy-indicator-ball-3"></div></div>'
        };
    }
];

module.exports = npBusyIndicator;

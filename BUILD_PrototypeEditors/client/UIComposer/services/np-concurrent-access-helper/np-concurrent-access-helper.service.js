'use strict';

var npConcurrentAccessHelper = ['$window', '$rootScope', 'npPrototype',
    function ($window, $rootScope, npPrototype) {
        var self = {},
            unlockMonitoringEnabled = false,
            disableUnlockOnce = false;

        self.disableUnlockOnce = function () {
            disableUnlockOnce = true;
        };

        self.handleUnlock = function () {
            if (!disableUnlockOnce) {
                npPrototype.unlockPrototype();
                self.disableUnlockMonitoring();
            }
            disableUnlockOnce = false;
        };

        /**
         * @description
         * Ensure prototype is unlocked on close of window. $rootScope.$apply ensures that the pending request is actually flushed.
         */
        var onBeforeUnload = function () {
            npPrototype.unlockPrototype();
            $rootScope.$apply();
        };

        self.disableUnlockMonitoring = function () {
            if (unlockMonitoringEnabled) {
                $window.removeEventListener('beforeunload', onBeforeUnload);
                unlockMonitoringEnabled = false;
            }
        };

        self.enableUnlockMonitoring = function () {
            if (!unlockMonitoringEnabled) {
                $window.addEventListener('beforeunload', onBeforeUnload);
                unlockMonitoringEnabled = true;
            }
        };

        return self;
    }
];

module.exports = npConcurrentAccessHelper;

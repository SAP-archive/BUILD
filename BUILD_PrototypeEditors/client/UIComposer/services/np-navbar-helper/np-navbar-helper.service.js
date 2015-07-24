'use strict';

/**
 * The npNavBarHelper service provides helper functions to update the navbar with status information.
 *
 * @namespace npNavBarHelper
 */
var npNavBarHelper = ['$rootScope', '$filter', '$interval', 'npPageMetadata', 'NavBarService', 'npMessaging',
    function ($rootScope, $filter, $interval, npPageMetadata, NavBarService, npMessaging) {
        var unregisterWatchSaveStatus;

        /**
         * @name enableUpdateSaveStatus
         * @memberof npNavBarHelper
         */
        var enableUpdateSaveStatus = function () {
            var saveStatusPromise;
            unregisterWatchSaveStatus = $rootScope.$watch(function () {
                return npPageMetadata.getSaveStatus();
            }, function (newVal) {
                switch (newVal) {
                    case npPageMetadata.saveStatuses.SAVE_SUCCESSFUL:
                        //var currentDate = new Date();
                        var changesSavedMessage = 'All Changes Saved';
                        NavBarService.updateSaveMessage(changesSavedMessage + '.');
                        $interval.cancel(saveStatusPromise);
                        saveStatusPromise = $interval(function () {
                            //TODO use $filter again when localization is addressed globally
                            //NavBarService.updateSaveMessage(changesSavedMessage + ' at ' + $filter('date')(currentDate, 'shortTime') + '.');
                            NavBarService.updateSaveMessage(changesSavedMessage + ' at ' + new Date().toLocaleString() + '.');
                        }, 420000, 1);
                        break;
                    case npPageMetadata.saveStatuses.SAVE_FAILED:
                        NavBarService.updateSaveMessage('Failed to save changes.');
                        npMessaging.showError('Project not saved. Something went wrong');
                        break;
                    case npPageMetadata.saveStatuses.SAVE_PENDING:
                        NavBarService.updateSaveMessage('Saving...');
                        break;
                    case npPageMetadata.saveStatuses.SAVE_IDLE:
                        NavBarService.updateSaveMessage('');
                }
            });
        };

        /**
         * @name disableUpdateSaveStatus
         * @memberof npNavBarHelper
         */
        var disableUpdateSaveStatus = function () {
            if (unregisterWatchSaveStatus) {
                unregisterWatchSaveStatus();
                NavBarService.updateSaveMessage('');
            }
        };

        return {
            enableUpdateSaveStatus: enableUpdateSaveStatus,
            disableUpdateSaveStatus: disableUpdateSaveStatus
        };
    }
];

module.exports = npNavBarHelper;

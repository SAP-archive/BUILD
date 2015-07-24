'use strict';

/**
 * @ngdoc factory
 * @name ui.elements:uiTabHelper
 *
 * @description
 * Factory helper methods for the uiTab control.
 *
 */

// @ngInject
module.exports = function($timeout) {
    return {
        /**
         * Opens a tab with the specified id.  This utility function is generally required for situations where there
         * are tabs within tabs.  Otherwise please use the selected-tab attribute on the ui-tab directive.
         *
         * @param tabOptionId the id of the tab to be opened.
         */
        openTab: function(tabOptionId){
            $timeout(function() {
                var tabOption = document.getElementById(tabOptionId);
                if (tabOption) {
                    tabOption.click();
                }
            });
        }
    };
};


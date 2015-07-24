'use strict';

/**
 * @ngdoc factory
 * @name ui.elements:uiPopupHelper
 *
 * @description
 * Factory helper methods for the uiPopup control.
 *
 */

// @ngInject
module.exports = function($rootScope) {
    return {
        /**
         * Indicates if the current event target relates to an element contained with a popup control
         * @param event the event whose target is to be examined.
         * @param popupClass optional class in the popup to be inspected to determine if the element is related to a popup.
         * @returns {boolean} true if the current event target relates to an element contained within a popup control,
         * false otherwise.
         */
        isPopupEvent: function(event, popupClass) {
            if (!event && !event.target) {
                return false;
            }
            var targetElement = event.target;
            var isPopup = false;
            while (targetElement && !isPopup) {
                if (angular.element(targetElement).hasClass('ui-popup')) {
                    isPopup = true;
                    break;
                } else if (popupClass && angular.element(targetElement).hasClass(popupClass)) {
                    isPopup = true;
                    break;
                }
                targetElement = targetElement.parentNode;
            }
            return isPopup;
        },

        recalculate: function(popupId){
            $rootScope.$broadcast('popup-calculate-placement', { id: popupId});
        }
    };
};


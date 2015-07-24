'use strict';

/**
 * @ngdoc factory
 * @name common.utils:uiFocusHelper
 *
 * @description
 * Factory helper methods for focusing on input form elements.
 *
 */
// @ngInject
module.exports = function ($timeout) {
    return {
        /**
         * Applies focus to the first blank input or textarea element in the supplied DOM element.  If no blank element is found, the first input element is focused.
         * @param containerElement the container DOM element whose first blank input or textarea element is to be focused.
         */
        focusInput: function (containerElement) {
            $timeout(function () {
                var elements = containerElement.querySelectorAll('input.ui-input:not([readonly=readonly]):not([disabled=disabled]), textarea');
                if (elements.length > 0) {
                    for (var i = 0; i < elements.length; i++) {
                        if (elements[i].value.length === 0) {
                            elements[i].focus();
                            return;
                        }
                    }
                    // haven't found an element that has a blank value, just focus on the first.
                    elements[0].focus();
                }
            }, 300);
        }
    };
};

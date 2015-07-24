'use strict';

/**
 * @ngdoc factory
 * @name ui.elements:uiDialogHelper
 *
 * @description
 * Factory helper methods for the uiDialog control.
 *
 */

// @ngInject
module.exports = function ($rootScope) {
    return {
        /**
         * Fires the dialog open event for the specified dialog id whilst optionally providing a payload as parameter to
         * the on-open callback method.
         * @param elementId the id of the dialog to be opened
         * @param payload the optional callback payload to be used when invoking the on-open callback when the dialog opens.
         */
        open: function (elementId, payload) {
            $rootScope.$broadcast('dialog-open', {
                elementId: elementId,
                payload: payload
            });
        },
        /**
         * Indicates if the current element is related to a modal dialog backdrop.
         *
         * @param element the element being inspected.
         * @returns {boolean} true if the element is a modal dialog backdrop, false otherwise.
         */
        isDialogBackdrop: function (element) {
            return (element && element.id === 'ui-dialog-modal-backdrop');
        }
    };
};

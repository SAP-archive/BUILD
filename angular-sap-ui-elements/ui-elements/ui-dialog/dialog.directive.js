'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiDialog
 *
 * @description
 * Creates a dialog box that is displayed in the center of the screen.
 *
 * @restrict E
 * @element ANY
 *
 * @param {string} cancelText the text to be displayed in the cancel button of the dialog.
 * @param {string} closeText the text to be displayed in the close button of the dialog.
 * @param {string} title the title of the dialog window.
 * @param {string} content the content of the dialog window.  This is an optional parameter, as the dialog contents can
 * also be rendered from the dialog child element.
 * @param {boolean} modal indicates if the dialog should be displayed as a modal dialog. Default to false.
 * @param {function} closeAction the controller function to be invoked when closing the dialog.
 * @param {function} cancelAction the controller function to be invoked when cancelling the dialog.
 * @param {function} onOpen the controller function to be invoked when the dialog is being opened.  This controller
 * function must be invoked with a parameter entitled 'payload', which takes the value supplied from the associated
 * uiDialogHelper.open() input parameters.
 * @param {boolean} disableClose indicates if the close button should be disabled. Default to false.
 * @param {int} enableTimeout optional number of seconds before which the enable button will become enabled.
 * @param {string} id the id of the dialog.
 * @param {} focusInput If supplied, the first blank input element  (text or textarea) will be focused when the dialog is opened.
 * If no input elements have blank values, the first element will then be focused.
 * @example

 <doc:example>
 <doc:source>
 <ui-dialog id="some-id" cancel-text="Cancel" close-text="Delete" enable-timeout="5" close-action="clicked()" content="Are you sure you want to delete this project?" focus-input>
 </ui-dialog>
 </doc:source>
 </doc:example>
 *
 */

// @ngInject
module.exports = function ($timeout, $window, uiFocusHelper) {
    return {
        scope: {
            cancelText: '@',
            closeText: '@',
            content: '@',
            title: '@',
            modal: '@',
            closeAction: '&',
            cancelAction: '&',
            disableClose: '=',
            onOpen: '&',
            enableTimeout: '@',
            id: '@',
            closeActionType: '@'
        },
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-dialog/dialog.template.html',
        restrict: 'E',
        replace: true,
        transclude: true,
        link: function (scope, elem, attrs) {
            scope.dialogTimeout = 0;
            scope.currentTimeout = 0;
            scope.closeActionType = 'button';
            if (scope.enableTimeout && !isNaN(parseFloat(scope.enableTimeout))) {
                scope.dialogTimeout = parseFloat(scope.enableTimeout);
            }

            $timeout(function () {
            // Ensure the title is not on the DOM as a tooltip.
            angular.element(elem).removeAttr('title');
            });

            scope.open = false;

            scope.isDisabled = function() {
                if (scope.disableClose || scope.currentTimeout > 0) {
                    return true;
                }
                return '';
            }

            scope.focusInput = false;
            if (attrs.focusInput !== undefined) {
                scope.focusInput = true;
            }
            var uiDialogModalBackdrop;
            var body = document.getElementsByTagName('body')[0];
            if (scope.modal === 'true') {
                uiDialogModalBackdrop = document.getElementById('ui-dialog-modal-backdrop');
                if (!uiDialogModalBackdrop) {
                    angular.element(body).append('<div id="ui-dialog-modal-backdrop"></div>');
                }
            }
            $timeout(function() {
                angular.element(body).append(elem);
                angular.element(body).on('keyup', scope.keyPress);
            });

            scope.keyPress = function(event) {
                if (!scope.open) {
                    return;
                }
                if (event.keyCode === 27) {
                    // escape was pressed, close the window by calling cancel.
                    scope.cancelDialog();
                }
            };

            scope.dialogClean = function() {
                if (scope.modal === 'true') {
                    uiDialogModalBackdrop = document.getElementById('ui-dialog-modal-backdrop');
                    angular.element(uiDialogModalBackdrop).removeClass('open');
                }
                scope.open = false;
                angular.element(elem).removeClass('open');
                $timeout(function() {
                    angular.element(elem).css('display', 'none');
                }, 500);
            };
            scope.cancelDialog = function () {
                if (scope.cancelAction) {
                    scope.cancelAction();
                }
                scope.dialogClean();

            };
            scope.closeDialog = function () {
                if (typeof scope.closeAction === 'function') {
                    if (scope.closeAction() !== false) scope.dialogClean();
                }
                else scope.dialogClean();
            };

            scope.calcSize = function(){
                var height = elem[0].offsetHeight;
                var width = elem[0].offsetWidth;

                // center the dialog on open.
                angular.element(elem).css('margin-top', '-' + (height / 2) + 'px');
                angular.element(elem).css('margin-left', '-' + (width / 2) + 'px');
            }

            scope.$on('dialog-close', function (event, elementId){
                if (elementId !== null && attrs.id !== null && elementId === attrs.id) {
                    scope.closeDialog();
                }
            });

            scope.$on('dialog-open', function (event, payloadObject) {
                var payload = null;
                var elementId = '';
                if (typeof payloadObject === 'string') {
                    elementId = payloadObject;
                } else {
                    elementId = payloadObject.elementId;
                    payload = payloadObject.payload;
                }
                // Ensure that the dialog being open relates to this dialog.
                if (elementId !== null && attrs.id !== null && elementId === attrs.id) {
                    if (scope.onOpen) {
                        scope.onOpen({
                            payload: payload
                        });
                    }

                    angular.element(elem).css('display', 'block');

                    scope.open = true;
                    // ensure the current digest cycle is completed by wrapping in a timeout.
                    $timeout(function() {
                        scope.$apply();
                    });
                    scope.calcSize();
                    // If this dialog is modal, display the modal backdrop.
                    if (scope.modal === 'true') {
                        uiDialogModalBackdrop = document.getElementById('ui-dialog-modal-backdrop');
                        angular.element(uiDialogModalBackdrop).addClass('open');
                    }
                    if (scope.focusInput) {
                        uiFocusHelper.focusInput(elem[0]);
                    }
                    if (scope.dialogTimeout > 0) {
                        scope.countdownTimer(scope.dialogTimeout);
                    }
                }
            });

            scope.countdownTimer = function(currentTime) {
                if (!scope.open) {
                    return;
                }
                scope.currentTimeout = currentTime;
                if (scope.currentTimeout > 0) {
                    $timeout(function() {
                        scope.countdownTimer(currentTime - 1);
                    }, 1000);
                }
            }

            scope.$on('$destroy', function() {
                elem.remove();
                if (scope.modal === 'true') {
                    uiDialogModalBackdrop = document.getElementById('ui-dialog-modal-backdrop');
                    angular.element(uiDialogModalBackdrop).removeClass('open');
                }
            });

            angular.element($window).bind('resize', function () {
                if (scope.open) {
                    scope.calcSize();
                }
            });
        }
    };
};

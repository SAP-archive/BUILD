'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiPopup
 *
 * @description
 * Creates a popup dialog that is displayed relative to the calling element.
 *
 * @restrict E
 * @element ANY
 *
 * @param {string} placement where to place the popup relative to the calling element.
 * @param {integer} offsetX Any custom offset on the x-axis from the calling element that is to be applied for the popup.
 * @param {integer} offsetY Any custom offset on the y-axis from the calling element that is to be applied for the popup.
 * @param {boolean} modal indicates if the popup should be displayed as a modal.  In this case, clicking outside the
 * popup will not dismiss it.  It must be explictly closed from within the popup using the ui-popup-close directive.
 * @param {string} arrowColor If present, indicates the color of the popup arrow.
 * @param {string} containerId The DOM identifier of the container in which the popup is to be displayed.  If not
 * provided, the document body is used as the container.  This container is then used to calculate the placement of the
 * popup.
 * @param {boolean} passThrough Indicates if the mouse events should pass through whilst the popup is open.
 * In this case, clicking outside the popup still closes it, but the click event (and all other mouse events) get
 * propagated to the underlying application.
 * @param {function} onOpen optional callback function to be invoked when the popup opens.
 * @param {function} onClose optional callback function to be invoked when the popup closes.
 * @param {function} onFullyOpen optional callback function to be invoked when the popup is really opened and set to its correct position on the DOM.
 * @param {} focusInput If supplied, the first blank input element  (text or textarea) will be focused when the popup is opened.
 * If no input elements have blank values, the first element will then be focused.
 * @example

 <doc:example>
 <doc:source>
 <ui-popup id="some-id" placement="left" offset-x="0" offset-y="0" style="width: 240px; height: 161px;" focus-input>
 <div>
 The contents of my popup.
 </div>
 </ui-popup>
 </doc:source>
 </doc:example>
 *
 */

// @ngInject
module.exports = function ($compile, $timeout, $window, $rootScope, uiPopupHelper, uiFocusHelper, uiDialogHelper, uiUtil) {
    return {
        scope: {
            placement: '@',
            offsetX: '@',
            offsetY: '@',
            arrowColor: '@',
            passThrough: '@',
            containerId: '@',
            modal: '=',
            onOpen: '&',
            onFullyOpen: '&',
            onClose: '&'
        },
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-popup/popup.template.html',
        restrict: 'E',
        replace: true,
        transclude: true,
        link: function (scope, elem, attrs) {

            $timeout(function() {
                angular.element(document.getElementsByTagName('body')[0]).on('keyup', scope.keyPress);
            });

            scope.center = false;

            scope.focusInput = false;
            if (attrs.focusInput !== undefined) {
                scope.focusInput = true;
            }
            scope.openCallback = false;
            scope.closeCallback = false;
            if (attrs.onOpen) {
                scope.openCallback = true;
            }
            if (attrs.onClose) {
                scope.closeCallback = true;
            }
            if (attrs.onFullyOpen) {
                scope.fullyOpenCallback = true;
            }
            scope.container = null;
            if (!scope.containerId) {
                // If no container for the popup supplied, use the document body.
                scope.container = document.getElementsByTagName('body')[0];
            } else {
                scope.container = document.getElementById(scope.containerId);
            }

            scope.$watch('containerId', function (oldVal, newVal) {
                if (!scope.containerId) {
                    scope.container = document.getElementsByTagName('body')[0];
                } else {
                    scope.container = document.getElementById(scope.containerId);
                }

                var backdropId = '#backdrop-' + scope.popupBackdropId;
                var backdropElt = angular.element(scope.container.querySelector(backdropId));

                if (!backdropElt.length && !scope.passThrough) {
                    // Add a backdrop to disable the popup if we are not passing through mouse events.
                    scope.popupBackdrop = $compile('<div style="display: none" id="backdrop-' + scope.popupBackdropId + '" class="ui-popup-backdrop" ng-class="{open: open, popupModal: modal}" ng-click="hidePopup(true)"></div>');
                    angular.element(document.getElementsByTagName('body')[0]).append(scope.popupBackdrop(scope));
                } else if (scope.passThrough) {
                    window.addEventListener('click', scope.closePopupPassThrough);
                }
            });

            /**
             * Detect if the escape key was pressed, and close this popup if open.
             * @param event the event containing the key press.
             */
            scope.keyPress = function(event) {
                if (!scope.open) {
                    return;
                }
                if (event.keyCode === 27) {
                    // escape was pressed, close the window by calling cancel.
                    scope.hidePopup();
                }
            }

            /**
             * Calculates the placement variable of the popup from the supplied placement value.  The center attribute,
             * if present, is removed and added as its own variable.
             */
            scope.calculatePlacement = function () {
                scope.calculatedPlacement = scope.placement;
                if (scope.placement === 'right-center') {
                    scope.calculatedPlacement = 'right';
                    scope.center = true;
                } else if (scope.placement === 'left-center') {
                    scope.calculatedPlacement = 'left';
                    scope.center = true;
                } else if (scope.placement === 'top-center') {
                    scope.calculatedPlacement = 'top';
                    scope.center = true;
                } else if (scope.placement === 'bottom-center') {
                    scope.calculatedPlacement = 'bottom';
                    scope.center = true;
                }
            };
            scope.calculatePlacement();
            if (attrs.dark !== undefined) {
                scope.colorClass = 'dark';
            } else {
                scope.colorClass = 'light';
            }
            scope.containingElement = null;

            scope.open = false;
            scope.arrowStyle = '';
            if (!scope.passThrough) {
                scope.popupBackdropId = uiUtil.nextUid();

                var backdropId = '#backdrop-' + scope.popupBackdropId;
                var backdropElt = angular.element(scope.container.querySelector(backdropId));

                if (!backdropElt.length) {
                    // Add a backdrop to disable the popup if we are not passing through mouse events.
                    scope.popupBackdrop = $compile('<div id="backdrop-' + scope.popupBackdropId + '" class="ui-popup-backdrop" ng-class="{open: open, popupModal: modal}" ng-click="hidePopup(true)"></div>');
                    angular.element(document.getElementsByTagName('body')[0]).append(scope.popupBackdrop(scope));
                }
            } else {
                window.addEventListener('click', scope.closePopupPassThrough);
            }

            /**
             * If pass-through has been enabled, inspect all window clicks to determine if
             * this popup needs to be closed.
             *
             * @param event the event containing the click.
             */
            scope.closePopupPassThrough = function(event) {
                if (!scope.open || uiPopupHelper.isPopupEvent(event, 'editMode') || uiDialogHelper.isDialogBackdrop(event.srcElement)) {
                    return;
                }
                scope.hidePopup();
            }

            scope.hidePopup = function (fromBackdrop) {
                if (scope.open) {
                    if (scope.modal && fromBackdrop) {
                        // if the popup is modal, don't hide it if the user clicked on the back drop.
                        return;
                    }
                    $timeout(function() {
                        // takes 300 ms to close due to animation.
                        scope.open = false;
                    }, 300);
                    // Explicitly removing the classes from the associated popup dialog elements, as if the user is
                    // browsing back/forward, the angular digest cycle may not have a chance to be applied.
                    angular.element(document.getElementsByClassName('ui-popup')).removeClass('open');
                    angular.element(document.getElementsByClassName('ui-popup-backdrop')).removeClass('open');

                    // allow styling the caller
                    scope.containingElement.classList.remove('popup-active');

                    if (scope.closeCallback) {
                        scope.onClose();
                    }
                }
            };

            /**
             * Determine where the popup should be relative to the viewport.  If the popup is displayed outside the
             * viewport, then it's position is modified accordingly.
             *
             * @param elementLeftPosition the current left position of the popup element.
             * @param elementTopPosition the current top position of the popup element.
             * @param elementWidth the width of the popup element.
             * @param elementHeight the height of the popup element.
             */
            scope.determinePopupOffset = function (elementLeftPosition, elementTopPosition, elementWidth, elementHeight) {
                // The padding to be applied if the popover is at the very edge of the viewport.
                var sidePadding = 5;

                var viewportWidth;
                var viewportHeight;

                if (!scope.containerId) {
                    viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
                    viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
                } else {
                    viewportWidth = scope.container.offsetWidth;
                    viewportHeight = scope.container.offsetHeight;
                }
                if (scope.calculatedPlacement === 'left' || scope.calculatedPlacement === 'right') {
                    // Ensure the popup does not extend beyond the top and bottom of the viewport.
                    var elementBottomPosition = elementTopPosition + elementHeight;
                    if (elementBottomPosition > viewportHeight) {
                        // the popup extends beyond the bottom of the viewport.
                        var difference = elementBottomPosition - viewportHeight;
                        var newElementTopPosition = elementTopPosition - difference - sidePadding;
                        angular.element(elem[0]).css('top', newElementTopPosition + 'px');
                        scope.arrowStyle = 'margin-top: ' + difference + 'px;';
                        // Ensure the arrow is still alongside the popover.
                        var newElementBottomPosition = newElementTopPosition + elementHeight;
                        var arrow = elem[0].getElementsByClassName('ui-popup-arrow')[0];
                        var arrowPosition = arrow.getBoundingClientRect();
                        var arrowBottomPosition = arrowPosition.top + arrow.offsetHeight;
                        if (arrowBottomPosition > newElementBottomPosition) {
                            var arrowPositionDifference = arrowBottomPosition - newElementBottomPosition;
                            scope.arrowStyle = 'margin-top: ' + (difference - arrowPositionDifference) + 'px;';
                        } else {
                            scope.arrowStyle = 'margin-top: ' + (difference + sidePadding) + 'px;';
                        }
                    } else if (elementTopPosition < 0) {
                        // the popup extends beyond the top of the viewport.
                        angular.element(elem[0]).css('top', sidePadding + 'px');
                        scope.arrowStyle = 'margin-top: ' + elementTopPosition + 'px;';
                        // Ensure the arrow is still alongside the popover.
                        var arrow = elem[0].getElementsByClassName('ui-popup-arrow')[0];
                        var arrowPosition = arrow.getBoundingClientRect();
                        if (arrowPosition.top < 0) {
                            scope.arrowStyle = 'margin-top: ' + (elementTopPosition - arrowPosition.top) + 'px;';
                        }
                    }
                } else if (scope.calculatedPlacement === 'top' || scope.calculatedPlacement === 'bottom') {
                    // Ensure the popup does not extend beyond the left and right of the viewport.
                    var elementRightPosition = elementLeftPosition + elementWidth;
                    if (elementLeftPosition < 0) {
                        // the popup extends outside the left of the viewport.
                        angular.element(elem[0]).css('left', sidePadding + 'px');
                        scope.arrowStyle = 'margin-left: ' + elementLeftPosition + 'px;';
                        // Ensure the arrow is still alongside the popover.
                        var arrow = elem[0].getElementsByClassName('ui-popup-arrow')[0];
                        var arrowPosition = arrow.getBoundingClientRect();
                        if (arrowPosition.left < 0) {
                            scope.arrowStyle = 'margin-left: ' + (elementLeftPosition - arrowPosition.left) + 'px;';
                        }
                    } else if (elementRightPosition > viewportWidth) {
                        // the popup extends outside the right of the viewport.
                        var difference = elementRightPosition - viewportWidth;
                        var newElementLeftPosition = elementLeftPosition - difference - sidePadding;
                        angular.element(elem[0]).css('left', newElementLeftPosition + 'px');
                        scope.arrowStyle = 'margin-left: ' + difference + 'px;';
                        // Ensure the arrow is still alongside the popover.
                        var newElementRightPosition = newElementLeftPosition + elementWidth;
                        var arrow = elem[0].getElementsByClassName('ui-popup-arrow')[0];
                        var arrowPosition = arrow.getBoundingClientRect();
                        var arrowRightPosition = arrowPosition.left + arrow.offsetWidth;
                        if (arrowRightPosition > newElementRightPosition) {
                            var arrowPositionDifference = arrowRightPosition - newElementRightPosition;
                            scope.arrowStyle = 'margin-left: ' + (difference - arrowPositionDifference) + 'px;';
                        } else {
                            scope.arrowStyle = 'margin-left: ' + (difference + sidePadding) + 'px;';
                        }
                    }
                }
                if (scope.arrowColor !== undefined) {
                    scope.arrowStyle += ' background-color: ' + scope.arrowColor;
                }
            };

            scope.$on('$stateChangeStart', function () {
                scope.hidePopup();
            });

            scope.$on('$locationChangeStart', function () {
                scope.hidePopup();
            });

            scope.$on('popup-close', function () {
                scope.hidePopup();
                $timeout(function () {
                    scope.$apply();
                });
            });

            angular.element($window).bind('resize', function () {
                if (scope.open) {
                    scope.positionPopup();
                }
            });

            scope.$on('$destroy', function () {
                if (elem[0].parentNode) {
                    elem[0].parentNode.removeChild(elem[0]);
                }
                if (scope.modal) {
                    var backdropElement = document.getElementById('backdrop-' + scope.popupBackdropId);
                    if (backdropElement) {
                        backdropElement.parentNode.removeChild(backdropElement);
                    }
                }
            });

            /**
             * Position the popup relative to the element that it is linked to.
             */
            scope.positionPopup = function () {
                scope.arrowStyle = '';

                var containingElementBounding = scope.containingElement.getBoundingClientRect();

                var popupElementWidth = elem[0].offsetWidth;
                var popupElementHeight = elem[0].offsetHeight;

                var elementLeftPosition = 0;
                var elementTopPosition = 0;

                if (scope.calculatedPlacement === 'bottom') {
                    // Place the popup underneath the element and center it.
                    elementTopPosition = containingElementBounding.top + containingElementBounding.height;
                    elementLeftPosition = containingElementBounding.left + (containingElementBounding.width / 2) - (popupElementWidth / 2);
                } else if (scope.calculatedPlacement === 'top') {
                    // Place the popup on top of the element and center it.
                    elementTopPosition = containingElementBounding.top - popupElementHeight;
                    elementLeftPosition = containingElementBounding.left + (containingElementBounding.width / 2) - (popupElementWidth / 2);
                } else if (scope.calculatedPlacement === 'left') {
                    // Place the popup to the left of the element and center it.
                    elementLeftPosition = containingElementBounding.left - popupElementWidth;
                    elementTopPosition = containingElementBounding.top + (containingElementBounding.height / 2) - (popupElementHeight / 2);
                } else if (scope.calculatedPlacement === 'right') {
                    // Place the popup to the right of the element and center it.
                    elementLeftPosition = containingElementBounding.left + containingElementBounding.width;
                    elementTopPosition = containingElementBounding.top + (containingElementBounding.height / 2) - (popupElementHeight / 2);
                }

                if (scope.offsetX) {
                    elementLeftPosition += parseFloat(scope.offsetX);
                }
                if (scope.offsetY) {
                    elementTopPosition += parseFloat(scope.offsetY);
                }

                angular.element(elem[0]).css('left', elementLeftPosition + 'px');
                angular.element(elem[0]).css('top', elementTopPosition + 'px');

                scope.determinePopupOffset(elementLeftPosition, elementTopPosition, popupElementWidth, popupElementHeight);


                if (scope.center) {
                    if (scope.calculatedPlacement === 'left') {
                        elementLeftPosition = elementLeftPosition + (containingElementBounding.width / 2);
                        angular.element(elem[0]).css('left', elementLeftPosition + 'px');
                    } else if (scope.calculatedPlacement === 'right') {
                        elementLeftPosition = elementLeftPosition - (containingElementBounding.width / 2);
                        angular.element(elem[0]).css('left', elementLeftPosition + 'px');
                    } else if (scope.calculatedPlacement === 'top') {
                        elementTopPosition = elementTopPosition + (containingElementBounding.height / 2);
                        angular.element(elem[0]).css('top', elementTopPosition + 'px');
                    } else if (scope.calculatedPlacement === 'bottom') {
                        elementTopPosition = elementTopPosition - (containingElementBounding.height / 2);
                        angular.element(elem[0]).css('top', elementTopPosition + 'px');
                    }
                }

                if (!scope.open) {
                    $timeout(function () {
                        scope.open = true;
                        scope.$apply();

                        // allow styling the caller
                        scope.containingElement.classList.add('popup-active');
                    });
                }
            };

            scope.doOpenPopup = function (elementDetails) {
                if (scope.open) {
                    scope.hidePopup();
                    // If we are opening a popup, with one already open (due to pass through)
                    // close this popup before enabling the new one.
                    $timeout(function() {
                        scope.doOpenPopup(elementDetails);
                    }, 300);
                    return;
                }

                // Retrieve the element associated with the popup, and determine where to place the popup relative
                // to it.
                if (!elementDetails.elem) {
                    elementDetails.elem = document.querySelectorAll('[ui-popup-open="' + elementDetails.id + '"]');
                }
                scope.containingElement = elementDetails.elem[0];
                // If the containing element has no dimensions, get the first child and use that instead.
                if (scope.containingElement.offsetWidth === 0 || scope.containingElement.offsetHeight === 0) {
                    scope.containingElement = elementDetails.elem[0].firstChild;
                }

                scope.container.appendChild(elem[0]);

                // allow placement bindings to be updated after the popup has been invoked.
                $timeout(function () {
                    scope.calculatePlacement();
                    elem[0].classList.remove('left');
                    elem[0].classList.remove('right');
                    elem[0].classList.remove('top');
                    elem[0].classList.remove('bottom');
                    elem[0].classList.add(scope.calculatedPlacement);
                    scope.positionPopup();

                    if (scope.focusInput) {
                        uiFocusHelper.focusInput(elem[0]);
                    }

                    if (scope.fullyOpenCallback) {
                        scope.$apply(scope.onFullyOpen());
                    }

                }, 50);
            };

            scope.$on('popup-calculate-placement', function(event, elementDetails) {
                if (elementDetails.id !== null && attrs.id !== null && elementDetails.id === attrs.id) {
                    scope.positionPopup();
                    scope.$apply();
                }
            });

            scope.$on('popup-open', function (event, elementDetails) {
                if (elementDetails.id !== null && attrs.id !== null && elementDetails.id === attrs.id) {
                    if (scope.openCallback) {
                        scope.$apply(scope.onOpen());
                    }
                    $timeout(function () {
                        // Check if we are already closing a popup, and if so, wait until that has completed.
                        if (!$rootScope.closing) {
                            scope.doOpenPopup(elementDetails);
                        } else {
                            $timeout(function () {
                                scope.doOpenPopup(elementDetails);
                            }, 300);
                        }
                    }, 50);
                }
            });

            scope.$on('$destroy', function () {
                elem.remove();
                var backddrop = angular.element(document.querySelector('#backdrop-' + scope.popupBackdropId));
                backddrop.remove();
                window.removeEventListener('click', scope.closePopupPassThrough);
            });
        }
    };
};

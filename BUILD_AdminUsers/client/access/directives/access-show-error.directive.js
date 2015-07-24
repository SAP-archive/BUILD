'use strict';

// @ngInject
module.exports = function ($rootScope, $timeout, $animate, uiPopupHelper, uiError) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            function getToastMessage() {
                 return attrs.accessToastMessage;
            }

            function closeErrorPopup() {
                var elementPopup = angular.element(document.querySelector('#' + attrs.accessErrorPopup));
                if (elementPopup.hasClass('open')) {
                    $rootScope.$broadcast('popup-close', {id: attrs.accessErrorPopup});
                }
            }

            function openErrorPopup() {
                var elementPopup = angular.element(document.querySelector('#' + attrs.accessErrorPopup));
                if (elementPopup.hasClass('open')) {
                    $timeout(function () {
                        uiPopupHelper.recalculate(attrs.accessErrorPopup);
                    });
                }
                else {
                    $timeout(function () {
                        $rootScope.$broadcast('popup-open', {id: attrs.accessErrorPopup, elem: element});
                    });
                }
            }

            attrs.$observe('accessShowError', function (value) {
                if (value === 'true') {
                    if (getToastMessage()) {
                        uiError.create({
                            content: getToastMessage(),
                            dismissOnTimeout: true,
                            dismissButton: true
                        });
                    }
                    else {
                        if (!element.hasClass('error')) {
                            $animate.addClass(element, 'error');
                        }
                        openErrorPopup();
                    }

                }
                else {
                    if (!getToastMessage()) {
                        if (element.hasClass('error')) {
                            $animate.removeClass(element, 'error');
                        }
                        closeErrorPopup();
                    }
                }
            });
        }
    };
};

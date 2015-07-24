'use strict';

var _ = require('lodash');

// @ngInject
module.exports = function ($window, $timeout, uiUtil) {
    return {
        restrict: "E",
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-carousel/carousel.template.html',
        scope: {
            items: "=",
            currentItem: "="
        },
        link: function (scope, tElement, tAttrs) {
            var aItems = scope.items || [];
            var nbTile = aItems.length;
            var tileWidth = 190;
            var arrowWidth = 20;
            var nbTitleToScroll = 2;

            scope.ocarouselNative = tElement[0].querySelector('.ui-carousel');
            scope.buttonLeftClassDisabled = true;
            scope.currentScroll = 0;


            var getClientWidth = function () {
                return Math.floor(scope.ocarouselNative['clientWidth']);
            };
            var getScrollWidth = function () {
                return Math.floor(scope.ocarouselNative['scrollWidth']);
            };
            var getScrollLeft = function () {
                return Math.floor(scope.ocarouselNative['scrollLeft']);
            };

            if (tAttrs.class !== undefined) {
                scope.customizedCalssContainer = tAttrs.class;
            }
            scope.buttonRightClassDisabled = false;
            scope.buttonLeftClassDisabled = true;

            var update = function () {
                nbTile = aItems.length;
            };

            var updateCarouselScroll = function (oItem) {
                var iNbElementDisplayed = Math.floor(getScrollWidth() / tileWidth);
                var iIndex = aItems.indexOf(oItem);
                var currentScroll = -(iIndex * tileWidth);

                if ((Math.abs(currentScroll) + getClientWidth()) >= getScrollWidth()) {
                    currentScroll = -((Math.abs(currentScroll) - ((Math.abs(currentScroll) + getClientWidth()) - getScrollWidth())));
                }
                scope.currentScroll = currentScroll;
                updateCarouselBtn();
            };

            var updateCarouselBtn = function () {
                $timeout(function () {
                    if ((Math.abs(scope.currentScroll) + getClientWidth()) >= getScrollWidth()) {
                        scope.buttonRightClassDisabled = true;
                    } else {
                        scope.buttonRightClassDisabled = false;
                    }

                    if (getClientWidth() > getScrollWidth()) {
                        scope.buttonLeftClassDisabled = true;
                    } else {
                        if (scope.currentScroll === 0 || scope.currentScroll === 1) {
                            scope.buttonLeftClassDisabled = true;
                        } else {
                            scope.buttonLeftClassDisabled = false;
                        }
                    }
                }, 200);
            };

            var updateCarousel = function () {
                var currentScroll = 0;
                if ((Math.abs(scope.currentScroll) + getClientWidth()) >= getScrollWidth()) {
                    currentScroll = -((Math.abs(scope.currentScroll) - ((Math.abs(scope.currentScroll) + getClientWidth()) - getScrollWidth())));
                }
                scope.currentScroll = currentScroll;
                updateCarouselBtn();
            };


            // Handle the model update
            scope.$watch("items", function (newValue, oldValue) {
                aItems = newValue || [];
                update();
                updateCarousel();
            });

            // Handle the broadcast even from the user custom control
            scope.$on("updateCarouselScroll", function (oEvent, oItem) {
                updateCarouselScroll(oItem);
            });

            // Handle the click on the Right Arrow Button
            scope.onRightClick = function () {
                var currentScroll = scope.currentScroll - (tileWidth * nbTitleToScroll);
                scope.buttonLeftClassDisabled = false;
                if ((Math.abs(currentScroll) + getClientWidth()) >= getScrollWidth()) {
                    currentScroll = -((Math.abs(currentScroll) - ((Math.abs(currentScroll) + getClientWidth()) - getScrollWidth())));
                    scope.buttonRightClassDisabled = true;
                }
                scope.currentScroll = currentScroll;
            };

            // Handle the click on the Left Arrow Button
            scope.onLeftClick = function () {
                var currentScroll = scope.currentScroll + (tileWidth * nbTitleToScroll);
                scope.buttonRightClassDisabled = false;
                if (currentScroll > 0) {
                    currentScroll = 0;
                    scope.buttonLeftClassDisabled = true;
                }
                scope.currentScroll = currentScroll;
            };

            // Update the status of the ui-thumbnail directive
            scope.isSelected = function (iIndex) {
                return iIndex === aItems.indexOf(scope.currentItem);
            };

            // send an event to update showed item
            scope.onItemClick = function (oItem) {
                //updateCarouselScroll(oItem);
                scope.$emit("updateScreen", oItem);
            };

            // Handle the window resize event
            angular.element($window).bind('resize', _.debounce(updateCarousel, 200));
        }
    }
};

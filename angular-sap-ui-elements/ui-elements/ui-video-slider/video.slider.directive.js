'use strict';

var _ = require('lodash');

// @ngInject
module.exports = function ($window, $timeout, $sce) {
    return {
        restrict: 'E',
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-video-slider/video.slider.template.html',
        scope: {
            items: '=',
            slideTile: '@',
            onVideoClicked: '&'
        },
        link: function (scope, tElement) {
            var aItems = scope.items || [];
            var nbTile = aItems.length;
            var tileWidth = 430;
            var tileAdjuster = 60;

            if (!scope.slideTile) {
                scope.slideTile = 1;
            }

            scope.oVideoNative = tElement[0].querySelector('.ui-video-slider');
            scope.buttonLeftClassDisabled = true;
            scope.currentScroll = 0;


            var getClientWidth = function () {
                return Math.floor(scope.oVideoNative['clientWidth']);
            };
            var getScrollWidth = function () {
                return Math.floor(scope.oVideoNative['scrollWidth']);
            };

            scope.buttonRightClassDisabled = false;
            scope.buttonLeftClassDisabled = true;

            var update = function () {
                nbTile = aItems.length;
            };

            var updateVideoScroll = function (oItem) {
                var iNbElementDisplayed = Math.floor(getScrollWidth() / tileWidth);
                var iIndex = aItems.indexOf(oItem);
                var currentScroll = -(iIndex * tileWidth);

                if ((Math.abs(currentScroll) + getClientWidth()) >= getScrollWidth()) {
                    currentScroll = -((Math.abs(currentScroll) - ((Math.abs(currentScroll) + getClientWidth()) - getScrollWidth())));
                }
                scope.currentScroll = currentScroll;
                updateVideoBtn();
            };

            var updateVideoBtn = function () {
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

            var updateVideo = function () {
                var currentScroll = 0;
                if ((Math.abs(scope.currentScroll) + getClientWidth()) >= getScrollWidth()) {
                    currentScroll = -((Math.abs(scope.currentScroll) - ((Math.abs(scope.currentScroll) + getClientWidth()) - getScrollWidth())));
                }
                scope.currentScroll = currentScroll;
                updateVideoBtn();
                var sliderTiles = document.getElementsByClassName('ui-video-slider-each');
                for (var i = 0; i < sliderTiles.length; i++) {
                    if (document.getElementsByClassName('ui-video-slider')[0]) {
                        var calcHeight = document.getElementsByClassName('ui-video-slider')[0].clientHeight - tileAdjuster + 'px';
                        if (sliderTiles[i].children[0]) {
                            var child = angular.element(sliderTiles[i].children[0]);
                            angular.element(sliderTiles[i].children[0]).css('height', calcHeight);
                        }
                    }
                }
            };


            // Handle the model update
            scope.$watch("items", function (newValue, oldValue) {
                aItems = newValue || [];
                update();
                updateVideo();
            });

            // Handle the broadcast even from the user custom control
            scope.$on("updateVideoScroll", function (oEvent, oItem) {
                updateVideoScroll(oItem);
            });

            scope.trustSrc = function (src) {
                return $sce.trustAsResourceUrl(src);
            };

            // Handle the click on the Right Arrow Button
            scope.onRightClick = function () {
                var currentScroll = scope.currentScroll - (tileWidth * scope.slideTile);
                scope.buttonLeftClassDisabled = false;
                if ((Math.abs(currentScroll) + getClientWidth()) >= getScrollWidth()) {
                    currentScroll = -((Math.abs(currentScroll) - ((Math.abs(currentScroll) + getClientWidth()) - getScrollWidth())));
                    scope.buttonRightClassDisabled = true;
                }
                scope.currentScroll = currentScroll;
            };

            // Handle the click on the Left Arrow Button
            scope.onLeftClick = function () {
                var currentScroll = scope.currentScroll + (tileWidth * scope.slideTile);
                scope.buttonRightClassDisabled = false;
                if (currentScroll > 0) {
                    currentScroll = 0;
                    scope.buttonLeftClassDisabled = true;
                }
                scope.currentScroll = currentScroll;
            };

            scope.videoTileClicked = function (item) {
                if (scope.onVideoClicked) {
                    scope.onVideoClicked({video: item});
                }
            };

            // Handle the window resize event
            var onResize = function () {
                updateVideo();
            };

            angular.element($window).bind('resize', onResize);

            scope.$on("$destroy", function () {
                angular.element($window).unbind('resize', onResize);
            });

            $timeout(function () {
                updateVideo();
            });
        }
    }
};

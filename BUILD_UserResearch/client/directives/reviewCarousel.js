'use strict';

// @ngInject
module.exports = function ($rootScope, $window, $timeout) {
    return {
        restrict: 'A',
        link: function (scope, element) {

            var thisElement = angular.element(element[0]);
            var topPadding = 60;
            var mainPadding = 92;

            scope.image_original_size = {
                h: 0,
                w: 0
            };
            scope.image_container_size = {
                h: 0,
                w: 0
            };
            scope.screen_container = angular.element(thisElement[0].querySelector('.screen-container'));

            /**
             * Calculate the new document review conatiner size
             * @param  {string} url The url of the image to display
             */
            function updateQuestionImage(url) {
                // Resize the image after the image is loaded
                var questionImage = angular.element(new Image());
                questionImage[0].src = url;
                questionImage.on('load', function () {

                    scope.image_original_size.h = this.height;
                    scope.image_original_size.w = this.width;

                    scope.imageLoaded = true;
                    scope.$apply();

                    var bResize = resizeImageWrapper();
                    updateAnnotationsPosition(bResize);

                    $timeout(function () {
                        scope.$broadcast('updateCarouselScroll', scope.oCarouselCurrentItem);
                    }, 0);
                });
            }

            /**
             * Resize the image when resizing the viewport
             */
            function imageResize() {
                var bResize = resizeImageWrapper();
                updateAnnotationsPosition(bResize);
            }

            /**
             * Calculate the dimension available in the viewport to display the review document
             * @return {object} a dimension object
             */
            function getImgContainerSize() {
                var dimension = {
                    h: 0,
                    w: 0
                };
                var main_container_height = thisElement[0].clientHeight;
                var main_container_width = thisElement[0].clientWidth - topPadding;

                var carousel_container_height = angular.element(thisElement[0].querySelector('.question-review-carousel'))[0].clientHeight;
                var header_container = angular.element(thisElement[0].querySelector('.nav-header'))[0];
                var header_container_height = header_container.offsetHeight;
                var button_container = angular.element(thisElement[0].querySelector('.nav-buttons'))[0];
                var button_container_height = button_container.offsetHeight;
                var separator_container = angular.element(thisElement[0].querySelector('.nav-separator'))[0];
                var separator_container_height = separator_container.offsetHeight;

                dimension.h = main_container_height - (header_container_height + button_container_height + separator_container_height + carousel_container_height) - mainPadding;
                dimension.w = main_container_width;

                return dimension;
            }

            /**
             * Resize the review document container
             * @return {boolean} true/false if a resize has been done.
             */
            function resizeImageWrapper() {
                var bResize = false;
                var newH;
                var newW;

                scope.image_container_size = getImgContainerSize();
                newH = Math.floor((scope.image_container_size.w * scope.image_original_size.h) / scope.image_original_size.w);
                if (newH < scope.image_container_size.h) {
                    scope.image_container_size.h = newH;
                }
                else {
                    newW = Math.floor((scope.image_container_size.h * scope.image_original_size.w) / scope.image_original_size.h);
                    scope.image_container_size.w = newW;
                }

                if (scope.image_original_size.w > scope.image_container_size.h) {
                    scope.screen_container[0].style.height = scope.image_container_size.h + 'px';
                    scope.screen_container[0].style.width = scope.image_container_size.w + 'px';
                    bResize = true;
                }
                else {
                    scope.screen_container[0].style.height = scope.image_original_size.h + 'px';
                    scope.screen_container[0].style.width = scope.image_original_size.w + 'px';
                }
                return bResize;
            }

            /**
             * Recalculate the annotations position
             * @param  {boolean} true/false if a resize has been done.
             */
            function updateAnnotationsPosition(bResize) {
                angular.forEach(scope.qAnnotations, function (value) {
                    if (bResize) {
                        value.newAbsoluteX = Math.floor((scope.image_container_size.w * value.absoluteX) / scope.image_original_size.w);
                        value.newAbsoluteY = Math.floor((scope.image_container_size.h * value.absoluteY) / scope.image_original_size.h);
                    }
                    else {
                        value.newAbsoluteX = value.absoluteX;
                        value.newAbsoluteY = value.absoluteY;
                    }
                });
                scope.$apply();
            }

            // Handle the broadcast even from the user custom control
            scope.$on('updateQuestionImage', function (event, sUrl) {
                updateQuestionImage(sUrl);
            });

            /**
             * Scroll to popup if needed
             */
            scope.$on('popup-has-been-opened', function (event, data) {
                var popupId = '#' + data.id;
                var popup = angular.element(scope.screen_container[0].querySelector(popupId));
                popup[0].scrollIntoView();
            });

            /**
             * Handle a window resize
             * Recalaculate the document review container size
             */
            angular.element($window).bind('resize', function onResize() {
                imageResize();
            });

        }
    };
};

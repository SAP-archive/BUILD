'use strict';

// @ngInject
module.exports = function ($compile) {

    var tpl = '<div id="imagesize-box" class="imgsize-box" ng-if="imageBiggerThanContainer">' +
        '<div class="imgsize-btn imgsize-full" ng-click="toggleFull()" ' +
        'ng-class="{active:!scaleImage}" title="Original Size"></div>' +
        '<div class="imgsize-btn imgsize-scaled" ng-click="toggleScaled()" ' +
        'ng-class="{active:scaleImage}" title="Scaled"></div>' +
        '</div>';

    return {
        restrict: 'A',
        scope: {
            imageSrc: '@toggleImageSize',
            resizeCallback: '=onImageResize'
        },
        link: function (scope, elem) {

            if (!scope.imageSrc || scope.imageSrc.length === 0) return;
            var img = new Image();
            scope.scaleImage = true;

            var imageMargin = {
                top: 25,
                left: 25,
                bottom: 50, // this prevent the toggle buttons to overlap with the image
                right: 25
            };

            img.onload = function () {
                scope.imageDimensions = {
                    width: img.width,
                    height: img.height
                };
                scope.resizeImage();
            };

            img.src = scope.imageSrc;
            scope.imageContainer = elem.parent();
            elem.css({
                'background-image': 'url("' + scope.imageSrc + '")'
            });
            scope.imageContainer.append($compile(tpl)(scope));


            scope.toggleFull = function () {
                scope.scaleImage = false;
                scope.resizeImage();
            };

            scope.toggleScaled = function () {
                scope.scaleImage = true;
                scope.resizeImage();
            };

            scope.resizeImage = function () {
                scope.containerDimensions = scope.imageContainer[0].getBoundingClientRect();
                scope.scale = scope.getScale();
                scope.imageBiggerThanContainer = scope.scale < 1;

                if (!scope.scaleImage) scope.scale = 1;

                // resize image
                elem.css({
                    width: scope.imageDimensions.width * scope.scale + 'px',
                    height: scope.imageDimensions.height * scope.scale + 'px'
                });

                scope.centerImage();
                scope.resizeCallback(scope.scale);
            };

            scope.centerImage = function () {
                var verticalMargin = (scope.containerDimensions.height - scope.imageDimensions.height * scope.scale) / 2,
                    horizontalMargin = (scope.containerDimensions.width - scope.imageDimensions.width * scope.scale) / 2;

                elem.css({ // apply the maximum margin between the calculated vertical/horizontal and the one defined in imageMargin
                    marginTop: (verticalMargin < imageMargin.top ? imageMargin.top : verticalMargin) + 'px',
                    marginLeft: (horizontalMargin < imageMargin.left ? imageMargin.left : horizontalMargin) + 'px'
                });

                if (scope.imageBiggerThanContainer && !scope.scaleImage) {
                    // showing the full image, so I need to add margin right and bottom
                    elem.css({
                        marginBottom: (verticalMargin < imageMargin.bottom ? imageMargin.bottom : verticalMargin) + 'px',
                        marginRight: (horizontalMargin < imageMargin.right ? imageMargin.right : horizontalMargin) + 'px'
                    });
                }

                // reset right & bottom margins for the full image
                else elem.css({ marginBottom: 0, marginRight: 0 });

            };

            scope.getScale = function () {
                var maxWidth = scope.containerDimensions.width - imageMargin.left - imageMargin.right;
                var maxHeight = scope.containerDimensions.height - imageMargin.top - imageMargin.bottom;

                // determine the scale of the new image to see if it's the height or width scale being used.
                var scale = Math.min(maxWidth / scope.imageDimensions.width, maxHeight / scope.imageDimensions.height);

                // do not zoom the image
                if (scale > 1) scale = 1;

                return scale;
            };

            window.addEventListener('resize', scope.resizeImage);

            scope.$on('$destroy', function () {
                window.removeEventListener('resize', scope.resizeImage);
                var imgBox = document.getElementById('imagesize-box');
                if (imgBox) {
                    imgBox.remove();
                }
            });

        }
    };
};

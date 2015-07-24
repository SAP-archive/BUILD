'use strict';
/**
 * The npImageHelper service is used for getting image sizing information
 * @module npImageHelper
 */
var _ = require('norman-client-tp').lodash;

var npImageHelper = ['$q', 'npFormFactor', 'npUiCatalog',
    function ($q, npFormFactor, npUiCatalog) {

        /**
         * @imgWidth {number} imgWidth width of the image, numerical value expected, 0
         * @imgHeight{number} imgHeight height of the image numerical value expected, 0
         * @returns aspectRatio {number} returns the aspect ratio of image
         **/
        var calcAspectRatio = function (imgWidth, imgHeight) {
            if (_isUnusableNum(imgWidth) || _isUnusableNum(imgHeight)) {
                return 0;
            }
            return imgWidth / imgHeight;
        };

        /*
         * @private to check if  number is +ve, greater than zero number
         */
        var _isUnusableNum = function (numToBeTested) {
            if (!numToBeTested || numToBeTested < 0) {
                return true;
            }
            return false;
        };

        // @private
        var _scaleForFitOrFill = function (imgWidth, imgHeight, isFill) {
            var newImgHeight, newImgWidth, ratio, canvasWidth, canvasHeight, widthRatio, heightRatio;
            canvasWidth = _.parseInt(npFormFactor.getCurrentFormFactor().width);
            canvasHeight = _.parseInt(npFormFactor.getCurrentFormFactor().height);

            if (_isUnusableNum(imgHeight) || _isUnusableNum(imgWidth)) {
                newImgHeight = imgHeight;
                newImgWidth = imgWidth;
            }
            else {
                widthRatio = canvasWidth / imgWidth;
                heightRatio = canvasHeight / imgHeight;
                if (isFill) {
                    ratio = Math.max(widthRatio, heightRatio);
                }
                else {
                    ratio = Math.min(widthRatio, heightRatio);
                }
                newImgWidth = ratio * imgWidth;
                newImgHeight = ratio * imgHeight;
            }
            return {
                imageHeight: Math.round(newImgHeight),
                imageWidth: Math.round(newImgWidth)
            };
        };

        /**
         * @name getFillDimensions
         * @currentWidth {number}width of the image, numerical value expected, 0 or undefined will result in same imgWidth value being returned
         * @currentHeight {number}height of the image, numerical value expected, 0 or undefined will result in same imgHeight value being returned
         * @returns {object} return provides the new image height and width numbers [returns current w and h if input numbers are not proper - +ve, above 0, numbers]
         **/
        var getFillDimensions = function (currentWidth, currentHeight) {
            return _scaleForFitOrFill(currentWidth, currentHeight, true);
        };

        /**
         * @name getFitDimensions
         * @currentWidth {number}width of the image, numerical value expected, 0 or undefined will result in same imgWidth value being returned
         * @currentHeight {number}height of the image, numerical value expected, 0 or undefined will result in same imgHeight value being returned
         * @returns {object} return provides the new image height and width numbers [returns current w and h if input numbers are not proper - +ve, above 0, numbers]
         **/
        var getFitDimensions = function (currentWidth, currentHeight) {
            return _scaleForFitOrFill(currentWidth, currentHeight, false);
        };
        /**
         * @name getWidthForFixedHeight
         * @aspectRatio{number}aspect ratio of the image, numerical value expected
         * @newHeight{number} specifies the new height, numerical value expected
         * @returns {number} returns the new width [returns current w  if new h is not proper - +ve, above 0, numbers]
         **/
        var getWidthForFixedHeight = function (aspectRatio, newHeight) {
            if (_isUnusableNum(aspectRatio) || _isUnusableNum(newHeight)) {
                return newHeight;
            }
            return Math.round(newHeight * aspectRatio);
        };

        /**
         * @name getHeightForFixedWidth
         * @aspectRatio {number} aspect ratio of the image, numerical value expected, 0 or undefined will result in same imgWidth value being returned
         * @newWidth{number} specifies the new width, numerical value expected, 0 or undefined will result in same imgHeight value being returned
         * @returns {number} returns the new height [returns current h  if new w is not proper - +ve, above 0, numbers]
         **/
        var getHeightForFixedWidth = function (aspectRatio, newWidth) {
            if (_isUnusableNum(aspectRatio) || _isUnusableNum(newWidth)) {
                return newWidth;
            }
            return Math.round(newWidth / aspectRatio);
        };

        /**
         * @private
         * @description Scales image dimensions down to fit maxHeight and maxWidth (retains aspect ratio)
         */
        var getScaledImageDimensions = function (image, maxHeight, maxWidth) {
            var scaledDimensions = {
                    height: image.height,
                    width: image.width
                },
                max = {
                    height: maxHeight || Number.MAX_VALUE,
                    width: maxWidth || Number.MAX_VALUE
                };

            _.forEach(['height', 'width'], function (dim) {
                if (scaledDimensions[dim] > max[dim]) {
                    var scaleFactor = max[dim] / scaledDimensions[dim];
                    scaledDimensions.height = scaledDimensions.height * scaleFactor;
                    scaledDimensions.width = scaledDimensions.width * scaleFactor;
                }
            });

            return scaledDimensions;
        };

        /**
         * @name getHotspotImageData
         * @description returns ControlData for a hotspot image
         * @param {string} assetSrc
         * @returns {object} promise that will be resolved with the control data
         */
        var getHotspotImageData = function (assetSrc) {
            return loadImages(assetSrc).then(function (images) {
                var canvasWidth = _.parseInt(npFormFactor.getCurrentFormFactor().width),
                    canvasHeight = _.parseInt(npFormFactor.getCurrentFormFactor().height),
                    scaledDimensions = getScaledImageDimensions(images[0], canvasHeight, canvasWidth);
                return {
                    catalogControlName: npUiCatalog.getImageName(),
                    catalogId: npUiCatalog.getPrototypeCustomCatalogId(),
                    properties: [{
                        name: 'src',
                        value: assetSrc,
                        type: 'URI'
                    }, {
                        name: 'width',
                        value: Math.round(scaledDimensions.width) + 'px',
                        type: 'CSSSize'
                    }, {
                        name: 'height',
                        value: Math.round(scaledDimensions.height) + 'px',
                        type: 'CSSSize'
                    }, {
                        name: 'densityAware',
                        value: false,
                        type: 'boolean'
                    }]
                };
            });
        };
        /**
         * @name loadImages
         * @memberof npImageHelper
         * @description will load all the images and return which ones have been loaded
         * @param {string[]} images
         * @returns {Promise} resolved when all images have been loaded. contains images array, or undefined for not loaded images
         */
        var loadImages = function (images) {
            images = _.makeArray(images);
            var promises = _.map(images, function (imageUrl) {
                var deferred = $q.defer();
                var image = new Image();
                image.addEventListener('load', function () {
                    deferred.resolve(image);
                    image = undefined;
                });
                image.addEventListener('error', function () {
                    deferred.resolve();
                });
                image.setAttribute('src', imageUrl);
                return deferred.promise;
            });
            return $q.all(promises);
        };

        return {
            getFitDimensions: getFitDimensions,
            getFillDimensions: getFillDimensions,
            getWidthForFixedHeight: getWidthForFixedHeight,
            getHeightForFixedWidth: getHeightForFixedWidth,
            getHotspotImageData: getHotspotImageData,
            loadImages: loadImages,
            calcAspectRatio: calcAspectRatio

        };
    }
];


module.exports = npImageHelper;
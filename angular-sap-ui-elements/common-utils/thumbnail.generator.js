'use strict';

/**
 * @ngdoc factory
 * @name common.utils:uiThumbnailGenerator
 *
 * @description
 * Factory helper methods for generating thumbnails.
 *
 */
var libHtml2canvas = require('angular-sap-html2canvas');
var pica = require('pica');

// @ngInject
module.exports = function($window, $q) {
    /**
     * Generates a high quality thumbnail image version of the supplied full size canvas by applying interpolation
     * algorithms.
     *
     * @param fullSizeCanvas the canvas to be thumbnail-ed.
     * @param thumbnailHeight the height of the image thumbnail to be generated.
     * @param thumbnailWidth the width of the image thumbnail to be generated.
     * @param quality of the image: 0 - Box filter, 1 - Hamming filter, 2 - Lanczos filter (window 2.0px) 3 - Lanczos filter (window 3.0px)
     * @param generateBlob boolean whether generate the blob version of the image or not
     * @param callback the callback function to be applied upon successful generation.  This callback function will
     * be supplied with a blob representation of the image as well as an image url object.
     */
    var generateHighQuality = function(fullSizeCanvas, thumbnailHeight, thumbnailWidth, quality, generateBlob, callback) {

        // Generate a canvas for the thumbnail.
        var thumbnailCanvas = document.createElement('canvas');
        thumbnailCanvas.height = thumbnailHeight;
        thumbnailCanvas.width = thumbnailWidth;

        if (fullSizeCanvas.width === 0 || fullSizeCanvas.height === 0) {
            var err = new Error('thumbnail size is zero');
            console.error(err);
            callback(null, null, err);
        } else {
            pica.resizeCanvas(fullSizeCanvas, thumbnailCanvas, {
                quality: quality,
                unsharpAmount: 0,
                unsharpThreshold: 0
            }, function(err) {
                if (!err) {
                    if (callback) {
                        var thumbnailImage = thumbnailCanvas.toDataURL('image/png');
                        var thumbnailImageBlob = null;
                        if (generateBlob) {
                            thumbnailImageBlob = generateImageBlob(thumbnailImage);
                        }
                        callback(thumbnailImageBlob, thumbnailImage);
                    }
                }
            });
        }
    };
    /**
     * Generates a a blob representation of the image
     * @param thumbnailImage the canvas to use as source.
     */
    var generateImageBlob = function(thumbnailImage) {
        var binaryThumbnail = atob(thumbnailImage.split(',')[1]);
        var arrayThumbnail = [];
        for (var i = 0; i < binaryThumbnail.length; i++) {
            arrayThumbnail.push(binaryThumbnail.charCodeAt(i));
        }
        return new Blob([new Uint8Array(arrayThumbnail)], {type: 'image/png'});
    };

    /**
     * Generates a fast, low quality thumbnail image version of the supplied full size canvas
     *
     * @param fullSizeCanvas the canvas to be thumbnail-ed.
     * @param thumbnailHeight the height of the image thumbnail to be generated.
     * @param thumbnailWidth the width of the image thumbnail to be generated.
     * @param generateBlob boolean whether generate the blob version of the image or not
     * @param callback the callback function to be applied upon successful generation.
     */
    var generateLowQuality = function(fullSizeCanvas, thumbnailHeight, thumbnailWidth, generateBlob, callback) {

        // Generate a canvas for the thumbnail.
        var thumbnailCanvas = document.createElement('canvas');
        var ctx = thumbnailCanvas.getContext('2d');
        thumbnailCanvas.width=thumbnailWidth;
        thumbnailCanvas.height=thumbnailHeight;
        ctx.fillStyle="#FFFFFF";
        ctx.fillRect(0,0,thumbnailWidth,thumbnailHeight);
        ctx.drawImage(fullSizeCanvas, 0, 0, thumbnailWidth, thumbnailHeight);

        var thumbnailImage = thumbnailCanvas.toDataURL('image/png');
        var thumbnailImageBlob = null;
        if (generateBlob) {
            thumbnailImageBlob = generateImageBlob(thumbnailImage);
        }
        callback(thumbnailImageBlob, thumbnailImage);
    };

    /* Generates a thumbnail . Using the quality decides whether to generate high quality or low quality image.
     * @param fullSizeCanvas the canvas to be thumbnail-ed.
     * @param the height and width of the image thumbnail to be generated.
     * @param quality of the image: 0 - Box filter, 1 - Hamming filter, 2 - Lanczos filter (window 2.0px) 3 - Lanczos filter (window 3.0px)
     * @param generateBlob boolean whether generate the blob version of the image or not
     * @param callback the callback function to be applied upon successful generation.  This callback function will
     * be supplied with a blob representation of the image as well as an image url object.
     */
    var generate = function(fullSizeCanvas, thumbnailDimensions, quality, generateBlob, callback) {
        if (generateBlob === undefined) generateBlob = true;
        if (quality === undefined || quality > 4) quality = 4;
        if (quality < 1) {
            generateLowQuality(fullSizeCanvas, thumbnailDimensions.height, thumbnailDimensions.width, generateBlob, callback)
        } else {
            quality--;
            generateHighQuality(fullSizeCanvas, thumbnailDimensions.height, thumbnailDimensions.width, quality, generateBlob, callback);
        }
    };


    /**
     * Generates a canvas object representing the supplied html element.
     * @param htmlElem the html element to be represented in the canvas.
     * @returns {deferred.promise|*} the deferred promise containing the associated canvas object.
     */
    var getCanvas = function (htmlElem, callback) {

        libHtml2canvas.html2canvas(htmlElem, {
            onrendered: function (canvas) {
                callback(canvas);
            },
            useCORS: true
        });

    };
    /**
     * Calculates the correct scaled height and width of the thumbnail to be generated based on the size of the original
     * image and the maximum height and width of the thumbnail.
     *
     * @param height the height of the original image.
     * @param width the width of the original image.
     * @param maxHeight the maximum permitted height of the thumbnail.
     * @param maxWidth the maximum permitted width of the thumbnail.
     * @returns {{height: (number|*), width: (*|number)}} the height and width of the thumbnail to be generated.
     */
    var getThumbnailDimensions = function(height, width, maxHeight, maxWidth) {
        if (width > height) {
            var thumbWidth = maxWidth || width / height * maxHeight;
            var thumbHeight = (height / width) * maxWidth;
        } else {
            var thumbHeight = maxHeight || height / width * maxWidth;
            var thumbWidth = width / height * maxHeight;
        }
        // Check that the dimension for the thumbnail are within the bounds of the parameters.
        if (height > maxHeight) {
            var ratioDiff = maxHeight / thumbHeight;
            thumbHeight = maxHeight;
            thumbWidth = thumbWidth * ratioDiff;
        } else if (thumbWidth > maxWidth) {
            var ratioDiff = maxWidth / thumbWidth;
            thumbWidth = maxWidth;
            thumbHeight = thumbHeight * ratioDiff;
        }
        return {
            height: thumbHeight,
            width: thumbWidth
        };
    };
    return {
        support: !!($window.FileReader && $window.CanvasRenderingContext2D),
        /**
         * Indicates if the item supplied is a file.
         * @param item the item to be examined.
         * @returns {*|boolean} true if the item is a file, false otherwise.
         */
        isFile: function (item) {
            return angular.isObject(item) && item instanceof $window.File;
        },
        /**
         * Determines if the file supplied is of an image type that can be thumbnail-ed.
         * @param file the file to be examined
         * @returns {boolean} true if the file is of a suitable image type for thumbnailing, false otherwise.
         */
        isImage: function (file) {
            var type = '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        },

        /**
         * Generates a thumbnail image from the supplied image object with the required width and height.
         * @param imageObject the object containing the image to be thumbnail-ed.  Can be either an image file or a data url.
         * @param maxHeight the maximum height of the generated thumbnail.
         * @param maxWidth the maximum width of the generated thumbnail.
         * @param callback the callback function to be applied upon successful generation.  This callback function will
         * be supplied with a blob representation of the image as well as an image url object.
         * @param quality of the image: 0 - basic, 1 - Box filter, 2 - Hamming filter, 3 - Lanczos filter (window 2.0px) 4 - Lanczos filter (window 3.0px)
         * @param generateBlob boolean whether generate the blob version of the image or not
         * @param backgroundColor set the background color of the thumbnail, default is black*
         */
        generateFromImage: function(imageObject, maxHeight, maxWidth, callback, quality, generateBlob, backgroundColor) {
            var fullSizeCanvas = document.createElement('canvas');

            var img = new Image();

            img.onload = function () {
                var thumbnailDimensions = getThumbnailDimensions(this.height, this.width, maxHeight, maxWidth);
                fullSizeCanvas.width = this.width;
                fullSizeCanvas.height = this.height;
                var ctx = fullSizeCanvas.getContext('2d');
                if (backgroundColor) {
                    ctx.fillStyle = backgroundColor;
                    ctx.fillRect(0, 0, this.width, this.height);
                }
                ctx.drawImage(this, 0, 0, this.width, this.height);
                generate(fullSizeCanvas, thumbnailDimensions, quality, generateBlob, callback);
            };

            img.onerror = function () {
                callback();
            };

            if (imageObject instanceof File) {
                var reader = new FileReader();
                reader.onloadend = function () {
                    if (reader.result) img.src = reader.result;
                    else callback();
                };
                reader.readAsDataURL(imageObject);
            }
            else img.src = imageObject;
        },

        /**
         * Generates a thumbnail image from the supplied html element with the required width and height.  The html
         * element is converted into a canvas object before then being converted to a thumbnail.
         * @param htmlElement the html element to be thumbnail-ed
         * @param maxHeight the maximum height of the generated thumbnail.
         * @param maxWidth the maximum width of the generated thumbnail.
         * @param callback the callback function to be applied upon successful generation.  This callback function will
         * be supplied with a blob representation of the image as well as an image url object.
         * @param quality of the image: 0 - basic, 1 - Box filter, 2 - Hamming filter, 3 - Lanczos filter (window 2.0px) 4 - Lanczos filter (window 3.0px)
         * @param generateBlob boolean whether generate the blob version of the image or not
         */
        generateFromHtml: function(htmlElement, maxHeight, maxWidth, callback, quality, generateBlob) {
            getCanvas(htmlElement, function(fullSizeCanvas) {
                var thumbnailDimensions = getThumbnailDimensions(fullSizeCanvas.height, fullSizeCanvas.width, maxHeight, maxWidth);
                generate(fullSizeCanvas, thumbnailDimensions, quality, generateBlob, callback);
            })
        }
    };
};

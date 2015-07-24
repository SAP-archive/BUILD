'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiFileUploadImageThumbnail
 *
 * @description
 * Generates an image thumbnail for the supplied file, if the file is of an image type.
 * @restrict A
 * @element ANY
 *
 * @param {File} file the file that the thumbnail is to be generated for.
 * @param {string} width the required max width of the image thumbnail.
 * @param {string} height the required max height of the image thumbnail.
 *
 * @example

 <doc:example>
 <doc:source>
 <div class='ui-file-upload-item" ui-file-upload-image-thumbnail="{ file: item.file, width: width, height: height }">
 </div>
 </doc:source>
 </doc:example>
 *
 */

// @ngInject
module.exports = function ($window, uiThumbnailGenerator) {

    /** The maximum height of the image thumbnail to be created as part of a file upload. */
    var MAX_THUMBNAIL_HEIGHT = 180;

    /** The maximum width of the image thumbnail to be created as part of a file upload. */
    var MAX_THUMBNAIL_WIDTH = 240;

    return {
        restrict: 'A',
        scope: false,
        require: '^uiFileUpload',
        link: function (scope, element, attributes, uiFileUpload) {

            scope.noThumbnail = function () {
                uiFileUpload.startSelectedUpload(params.item);
            };

            var elt = angular.element(element[0].firstElementChild);

            if (!uiThumbnailGenerator.support) return scope.noThumbnail();

            var params = scope.$eval(attributes.uiFileUploadImageThumbnail);
            var file = params.item.file;

            if (!uiThumbnailGenerator.isFile(file)) return scope.noThumbnail();
            if (!uiThumbnailGenerator.isImage(file)) return scope.noThumbnail();

            uiThumbnailGenerator
                .generateFromImage(file, MAX_THUMBNAIL_HEIGHT, MAX_THUMBNAIL_WIDTH, function(blob, image) {
                    if (!blob && !image) {
                        elt.remove();
                        uiFileUpload.cancelSelectedUpload(params.item);
                    }
                    else {
                        // Callback function, start the selected upload now with the associated thumbnail image.
                        elt.css({'background-image': 'url(' + image + ')' });
                        uiFileUpload.startSelectedUpload(params.item, blob);
                    }
                });
        }
    };
};

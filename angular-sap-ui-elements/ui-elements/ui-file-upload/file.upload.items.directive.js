'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiFileUploadItems
 *
 * @description
 * Must be used within a uiFileUpload directive, and generates a progress bar in a containing div element for each item
 * that is being uploaded.  If an item that is being uploaded is an image, a thumbnail of that image is displayed
 * behind the progress bar during upload.
 *
 * @restrict E
 * @element ANY
 *
 * @param {string} styleClass the CSS class to be used for rendering the containing div for each of the elements currently
 * being uploaded.  Note: The styleClass must have position: relative set so that the progress bar displays correctly.
 * @param {string} thumbnailSize the required size of the thumnbnail to be generated.  Current options available are small, medium
 * and large and represent the sizing of the ui-thumbnail directive.
 *
 * @example

 <doc:example>
 <doc:source>
 <ui-file-upload project-id="projectId" success="addImageToStudy(imageId)" failure="displayErrorUploading(response)" is-dialog=false accept="image/*">
 <ui-file-upload-items style-class="someClass" thumbnail-size="medium"></ui-file-upload-items>
 </ui-file-upload>
 </ui-dialog>
 </doc:source>
 </doc:example>
 *
 */

var _ = require('lodash');

// @ngInject
module.exports = function ($timeout) {
    return {
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-file-upload/file.upload.items.template.html',
        restrict: 'E',
        scope: false,
        transclude: false,
        require: '^?uiFileUpload',
        link: function (scope, elem, attrs, uiFileUpload) {

            $timeout(function() {
                if (uiFileUpload) uiFileUpload.setThumbnailsCreating(true);
            });

            // Don't isolate the scope by using scope variables.
            scope.styleClass = attrs.styleClass;
            scope.size = attrs.thumbnailSize;
            $timeout(function(){
                scope.uploadQueue = scope.$parent.uploadQueue;
            });

            // Generate an array from the upload queue so they display in the correct order in the thumbnails.
            scope.uploadQueueArray = function() {
                return _.values(scope.uploadQueue);
            }
        }
    };
};

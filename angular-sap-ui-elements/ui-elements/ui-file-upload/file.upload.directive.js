'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiFileUpload
 *
 * @description
 * Generates a file upload component that allows for drag and drop of files being uploaded.  The files are stored in
 * the asserts store for the supplied project.  There is currently no support for file folders within the asset store.
 *
 * @restrict E
 * @element ANY
 *
 * @param {string} projectId the unique identifier of the project into whose document store the files will be saved.
 * @param {function} success the callback function to be invoked when the associated file was successfully uploaded.
 * This callback function will pass back the response object returned from the upload service.  If an optional 'sequence'
 * parameter is defined in the callback, it will be populated with the sequence of that file within the entire file
 * upload operation.
 * @param {function} failure the callback function to be invoked when the associated file was not successfully uploaded.
 * This callback function will pass back the response from the document upload.
 * @param {function} fileStart the callback function to be invoked when the associated file was starting to upload.  This
 * callback will pass back the file object of the file being uploaded.
 * @param {function} invalidFiles the callback function to be invoked when files of an invalid type have been attempted
 * to be uploaded.  The callback method will be invoked with a list of files that were rejected.
 * @param {function} uploadStart the callback function to be invoked when files are started upload.  This
 * callback takes no parameters.
 * @param {string} dropzoneId an optional parameter that identifies the DOM element that is to be used as a dropzone for
 * file drag and drop.  If no dropzone id is provided, the complete body of the document is used as the dropzone.
 * @param {boolean} isDialog indicates if the file upload component is contained with in a dialog window.
 * @param {string} accept specifies the types of files that the upload component can accept.
 * @param {string} acceptFileExtensions specifies the file extensions that the upload component can accept.  Can be used
 * * in conjunction with the "accept" parameter, where the mime type fails to be retrieved, or can also be used in isolation.
 * @param {string} uploadButtonId the unique identifier of a DOM element that, when clicked, will display the file
 * upload dialog. There is a limitation that prevents this from working when placed on Anchor (<a>) tags. Also
 * due to the nature of how an input field is injected into the DOM when using uploadButtonId, be aware that the input
 * will take on the id and classes of the element it's placed within.
 * @param {string} uploadUrl the optional url that may be provided to determine the upload service to be used for
 * the uploading of the files.  If supplied, this parameter will override the projectId parameter otherwise used to
 * determine the back end service.
 * @param {function} completed the optional callback function to be invoked when the entire file upload has finished.
 * @param {boolean} keepUploadedItemsOnComplete indicates if the progress thumbnail should be removed immediately after
 * the associated file has been uploaded.  It may be useful to keep this progress on screen and remove all of them at
 * the same time when the entire file upload completes.
 *
 * @example

 <doc:example>
 <doc:source>
 <ui-file-upload project-id="projectId" success="addImageToStudy(imageId, sequence)" failure="displayErrorUploading(response)" invalid-files="displayInvalidFilesError(files)" upload-start="doStartUpload()" file-start="startFileUploading(file)" is-dialog=false accept="image/*">
 </ui-file-upload>
 </ui-dialog>
 </doc:source>
 </doc:example>
 *
 */


var _ = require('lodash');
require('ng-file-upload/dist/angular-file-upload');
require('ng-file-upload/dist/angular-file-upload-shim');

// @ngInject
module.exports = function ($compile, $upload, $log, $timeout, $interval, $parse, $rootScope, uiError) {
    return {
        restrict: 'E',
        scope: {
            projectId: '=',
            uploadUrl: '@',
            success: '&success',
            failure: '&failure',
            fileStart: '&fileStart',
            uploadStart: '&uploadStart',
            invalidFiles: '&invalidFiles',
            completed: '&completed',
            keepUploadItemsOnComplete: '@'
        },
        transclude: true,
        template: '<div ng-transclude></div>',
        link: function (scope, elem, attrs) {
            scope.uploadButtonId = attrs.uploadButtonId;
            scope.dropzoneId = attrs.dropzoneId;
            scope.thumbnailsCreating = false;
            scope.uploadQueue = {};	// associative array which contains the current uploads, referenced by sequenceNum
            var sequenceNum = 0;

            scope.isDialog = scope.$eval(attrs.isDialog) || false;
            scope.overdropzone = {
                display: false,
                valid: false
            };
            scope.elem = elem;

            scope.getUploadUrl = function () {
                if (!scope.uploadUrl) {
                    return '/api/projects/' + scope.projectId + '/document';
                } else {
                    return scope.uploadUrl;
                }
            };

            scope.uploader = {};

            scope.uploading = false;

            /**
             * Fires when files have been dropped or selected for upload.  The list of files to be uploaded is filtered
             * to ensure only the valid file types are then uploaded.
             *
             * @param $files the list of files to be uploaded.
             */
            scope.onFileSelect = function ($files, $event) {

                scope.filesUploaded = 0;

                // Ensure that multiple uploads of the same files do not happen by disabling file uploads
                // for a small period of time after it has started.   This check should be removed when the
                // underlying npm module is updated to resolve this issue.
                if (scope.uploading) {
                    return;
                }
                scope.uploading = true;
                $timeout(function () {
                    // Allow uploads again after 100ms.
                    scope.uploading = false;
                }, 100);

                scope.invalidFilesList = [];
                scope.selectedFiles = [];

                scope.uploadResult = [];
                scope.selectedFiles = scope.filterValidFileTypes($files);

                // invoke the upload start callback function if present.
                if (scope.selectedFiles.length && scope.uploadStart) {
                    scope.uploadStart();
                }

                // Invoke the invalid files callback if present.
                if (scope.invalidFilesList.length > 0 && scope.invalidFiles) {
                    var invalidFilesParams = {};
                    var callbackParameter = scope.getCallbackParameter(attrs.invalidFiles);
                    if (callbackParameter.length > 0) {
                        invalidFilesParams[callbackParameter] = scope.invalidFilesList;
                    }
                    scope.invalidFiles(invalidFilesParams);
                    scope.invalidFilesList = [];
                }

                scope.totalFilesToUpload = scope.selectedFiles.length;

                for (var i = 0; i < scope.selectedFiles.length; i++) {

                    scope.addUpload(scope.selectedFiles[i]);
                    // The thumbnail generator will call doUpload() when it is done.  Don't start while it's in prog.
                    if (!scope.thumbnailsCreating) {
                        scope.doUpload(scope.selectedFiles[i].sequenceNum);
                    } else {
                        // add the thumbnail file to the list to be uploaded.
                        scope.totalFilesToUpload++;
                    }
                }

                // Ensure the input value is reset so that the same file can be uploaded in the next upload request.
                if ($event && $event.srcElement.value) $event.srcElement.value = null;
            };

            scope.updateProgress = function (sequenceNum, progress) {
                scope.uploadQueue[sequenceNum].progress = progress;
            };

            /**
             * Filters the files that have been supplied for upload to only include those that match the defined accept
             * types.
             * Valid files are assigned a sequence number for the upload queue.
             * Invalid files are added to invalidFilesList.
             *
             * @param items the list of items requested to be uploaded.
             * @returns list of valid files
             */
            scope.filterValidFileTypes = function (items) {
                var accept = $parse(attrs.ngAccept)(scope) || attrs.accept;
                var acceptFileExtensions = attrs.acceptfileextensions;
                var fileTypeRegexp = accept ? new RegExp(scope.globStringToRegex(accept)) : null;
                var fileExtensions = acceptFileExtensions ? acceptFileExtensions.toLowerCase().split(',') : null;
                if (fileTypeRegexp) {
                    scope.invalidFilesList = [];
                    var validItems = [];
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].type.length > 0) {
                            var isValidFileType = items[i].type.match(fileTypeRegexp);
                            validateAndAddToList(items[i], isValidFileType, validItems, scope.invalidFilesList);
                        }
                        else if (fileExtensions) {
                            // If the mime type could not be ascertained from the file, default to the file extension
                            // if a list of file extensions was supplied.
                            var isValidExt = _.include(fileExtensions, items[i].name.toLowerCase().split('.').pop());
                            validateAndAddToList(items[i], isValidExt, validItems, scope.invalidFilesList);
                        }
                    }
                    return validItems;
                } else {
                    // no accept attribute provided, just return existing files.
                    return items;
                }
            };


            /**
             * Valid item are pushed into aValidList.
             * Invalid item are pushed in to aInvalidList.
             *
             * @param item the item to be validated
             * @param bIsValid test which used to decide whether item is valid
             * @param aValidList array for the valid items
             * @param aInvalidList array for the invalid items
             */
            var validateAndAddToList = function (item, bCondition, aValidList, aInvalidList) {

                if (bCondition) {
                    aValidList.push(item);
                } else {
                    aInvalidList.push(item);
                }
            };

            /**
             *  Generates a regex express for use when determining if a file type is valid for upload.
             */
            scope.globStringToRegex = function (str) {
                if (str.length > 2 && str[0] === '/' && str[str.length - 1] === '/') {
                    return str.substring(1, str.length - 1);
                }
                var split = str.split(','),
                    result = '';
                if (split.length > 1) {
                    for (var i = 0; i < split.length; i++) {
                        result += '(' + scope.globStringToRegex(split[i]) + ')';
                        if (i < split.length - 1) {
                            result += '|';
                        }
                    }
                } else {
                    result = '^' + str.replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + '-]', 'g'), '\\$&') + '$';
                    result = result.replace(/\\\*/g, '.*').replace(/\\\?/g, '.');
                }
                return result;
            };

            /**
             * Retrieves the named parameter to be used in the callback function for this directive.  The callback
             * function, including arguments, is examined, and the first argument is returned as the callback
             * parameter.
             * @param callbackFunction the callback function, including arguments, whose first parameter is to be
             * * retrieved.
             * @returns {string} the name of the first argument in the callback function, if present, or an empty
             * string otherwise.
             */
            scope.getCallbackParameter = function (callbackFunction) {
                var callbackParameter = '';
                if (callbackFunction !== undefined && callbackFunction.indexOf('(') !== -1) {
                    callbackParameter = callbackFunction.substring(callbackFunction.indexOf('(') + 1,
                        callbackFunction.indexOf(')'));
                    if (callbackParameter.indexOf(',') !== -1) {
                        callbackParameter = callbackParameter.substring(0, callbackParameter.indexOf(','));
                    }
                    if (callbackParameter.indexOf(' ') !== -1) {
                        callbackParameter = callbackParameter.substring(0, callbackParameter.indexOf(' '));
                    }
                }
                return callbackParameter;
            };

            /**
             * Adds a file to the upload queue and assigns a sequence number
             *
             * @param file the file to be uploaded from the list of selected files.
             */
            scope.addUpload = function (file) {

                file.sequenceNum = sequenceNum++;
                scope.uploadQueue[file.sequenceNum] =
                {
                    progress: 0,
                    file: file,
                    sequence: sequenceNum
                };
            };

            /**
             * Uploads a file.
             * *
             * @param sequenceNum the sequenceNum of the file to be uploaded from the list of selected files.
             * @param thumbnailImage an optional associated blob representing an image thumbnail of the file.
             */
            scope.doUpload = function (sequenceNum, thumbnailImage) {
                // invoke the file start callback function if present.
                if (scope.fileStart) {
                    var fileStartParams = {};
                    var callbackParameter = scope.getCallbackParameter(attrs.fileStart);
                    if (callbackParameter.length > 0) {
                        fileStartParams[callbackParameter] = scope.uploadQueue[sequenceNum].file;
                    }
                    scope.fileStart(fileStartParams);
                }

                var url = scope.getUploadUrl();
                var filesToUpload = [];
                filesToUpload.push(scope.uploadQueue[sequenceNum].file);

                if (thumbnailImage) {
                    // Link the thumbnail image to the main image in the service call.
                    url += '/?linkImage=true';
                    var thumbnailFile = new window.File([thumbnailImage],
                        'thumb_' + scope.uploadQueue[sequenceNum].file.name);
                    filesToUpload.push(thumbnailFile);
                }
                $upload.upload({url: url, file: filesToUpload})
                    .progress(function (evt) {
                        // update progress for this upload
                        var currentProgress = parseInt(100.0 * evt.loaded / evt.total);
                        scope.uploadQueue[sequenceNum].progress = currentProgress;
                    })
                    .success(function (response) {
                        $timeout(function () {
                            var responseDetails;
                            try {
                                responseDetails = angular.fromJson(response);
                            } catch (e) {
                                responseDetails = response;
                            }
                            if (scope.success) {
                                var successParams = {};
                                callbackParameter = scope.getCallbackParameter(attrs.success);
                                if (callbackParameter.length > 0) {
                                    successParams[callbackParameter] = responseDetails;
                                    // Add a sequence to the callback so it knows the order of the uploaded files.
                                    successParams['sequence'] = filesToUpload[0].sequenceNum;
                                }
                                scope.success(successParams);
                                scope.filesUploaded += filesToUpload.length;
                                if (scope.filesUploaded === scope.totalFilesToUpload) {
                                    // If we have completed the file upload, check if there is a completed callback function defined
                                    // and invoke it.
                                    if (typeof scope.completed === 'function') {
                                        var completedParams = {};
                                        var completedCallbackParameter = scope.getCallbackParameter(attrs.completed);
                                        if (completedCallbackParameter.length > 0) {
                                            completedParams[completedCallbackParameter] = completedParams;
                                        }
                                        $timeout(function() {
                                            scope.completed(completedParams);
                                        }, 500);
                                    }
                                }
                            }
                        }, 500);
                    })
                    // on error, invoke failure callback
                    .error(function (response) {
                        if (scope.failure) {
                            scope.failure({response: response});
                        }
                    })
                    // when finished, do cleanup
                    .finally(function () {
                        // Delete the thumbnail once uploaded, unless the optional flag is set.
                        if (scope.keepUploadItemsOnComplete !== 'true') {
                            delete scope.uploadQueue[sequenceNum];
                        }
                    });
            };

            var body = document.getElementsByTagName('body')[0];

            var acceptAttribute = '';
            if (scope.accept) acceptAttribute = ' accept="' + scope.accept + '" ';

            scope.$watch('projectId', function (newValue) {
                if (newValue !== undefined) scope.uploader.url = scope.getUploadUrl();
            });

            scope.$on('hide-dropzone', function () {
                if (scope.overdropzone.display) {
                    scope.overdropzone.display = false;
                    scope.$apply();
                }
            });

            scope.$on('clear-file-upload-progress', function () {
                for (var key in scope.uploadQueue) {
                    delete scope.uploadQueue[key]
                }
            });

            var dropzone;
            // If no dropzone id has been supplied, use the body as the dropzone.
            if (!scope.dropzoneId) {
                scope.dropzone = $compile('<div ' + acceptAttribute + ' id="body_dropzone" class="ui-dropzone" ng-multiple="true" ng-file-drop ng-file-change="onFileSelect($files, $event)" drag-over-class="file-upload-over-class" ng-class="{overdropzone: overdropzone.display, validdropzone: overdropzone.valid}"></div>');
                dropzone = scope.dropzone(scope);
                angular.element(body).append(dropzone);

                angular.element(dropzone).on('drop', function () {
                    $rootScope.$broadcast('hide-dropzone');
                    scope.overdropzone.display = false;
                    scope.$apply();
                });


                angular.element(dropzone).on('dragleave', function () {
                    $rootScope.$broadcast('hide-dropzone');
                    scope.overdropzone.display = false;
                    scope.$apply();
                });

                angular.element(body).on('dragover', function (evt) {
                    if (scope.isDialog && !scope.checkDialogOpen()) {
                        return;
                    }

                    if (evt.dataTransfer.items.length > 0) {
                        if (evt.dataTransfer.items[0].kind === 'file') {
                            if (scope.filterValidFileTypes(evt.dataTransfer.items).length > 0) {
                                scope.overdropzone.valid = true;
                            } else {
                                scope.overdropzone.valid = false;
                            }
                            scope.overdropzone.display = true;
                            scope.$apply();
                        }
                    }
                });
            } else {
                // otherwise set the dropzone with the relevant directives.
                dropzone = document.getElementById(scope.dropzoneId);
                if (dropzone) {
                    dropzone.setAttribute('ng-file-drop', '');
                    dropzone.setAttribute('ng-file-change', 'onFileSelect($files, $event)');
                    dropzone.setAttribute('ng-multiple', 'true');
                    dropzone.className = dropzone.className + ' file-upload-dropzone-class';
                    dropzone.setAttribute('ng-file-drag-over-class', 'file-upload-dropzone-over-class');
                    $compile(dropzone)(scope);
                }
                angular.element(body).on('dragover drop', function (evt) {
                    evt.preventDefault();
                });
            }

            scope.$on('$destroy', function () {
                if (!scope.dropzoneId) {
                    var dropz = document.getElementById('body_dropzone');
                    if (dropz != null && dropz.parentNode) {
                        dropz.parentNode.removeChild(dropz);
                    }
                }
                angular.element(body).off('dragover');
                angular.element(body).off('drop');
                angular.element(dropz).off('dragleave');
                angular.element(dropz).off('drop');
            });

            if (scope.uploadButtonId) {
                var uploadButtonArray = scope.uploadButtonId.split(' ');

                uploadButtonArray.forEach(function (uploadButtonId) {
                    var uploadButton = document.getElementById(uploadButtonId);
                    if (uploadButton) {
                        angular.element(uploadButton).attr('ng-file-select', '').attr('ng-file-change', 'onFileSelect($files, $event)').attr('multiple', 'multiple');
                        $compile(uploadButton)(scope);
                        // ensure the upload button only has 1 click handler defined.
                        angular.element(uploadButton).off('click').on('click', function () {
                            angular.element(uploadButton.previousSibling).attr('accept', attrs.accept);
                            uploadButton.previousSibling.click();
                        });
                    } else {
                        // DOM not ready yet
                        var interval = $interval(function () {
                            uploadButton = document.getElementById(uploadButtonId);
                            if (uploadButton === null) {
                                return;
                            }
                            angular.element(uploadButton).attr('ng-file-select', '').attr('ng-file-change', 'onFileSelect($files, $event)').attr('multiple', 'multiple');
                            $compile(uploadButton)(scope);
                            // ensure the upload button only has 1 click handler defined.
                            angular.element(uploadButton).off('click').on('click', function () {
                                angular.element(uploadButton.previousSibling).attr('accept', attrs.accept);
                                uploadButton.previousSibling.click();
                            });
                            $interval.cancel(interval);
                        }, 0, 5);
                    }
                });

            }

            /*
             * Function to check if the parent dialog is open
             * Traverses the dom tree to find the element directly bellow the dialog as that has the scope
             */
            scope.checkDialogOpen = function () {
                var currentElement = scope.elem;

                // iterate till we find the parent dialog
                while (currentElement
                    .parent().length > 0 && !currentElement.parent().hasClass('ui-dialog')) {
                    currentElement = currentElement.parent();
                }
                // couldn't find the parent dialog
                if (currentElement.parent().length === 0) {
                    return false;
                }
                return currentElement.scope().open;

            };

            scope.cancelUpload = function (file) {
                uiError.create({
                    content: 'This is not an image file. Please try again.',
                    dismissOnTimeout: true,
                    dismissButton: true
                });
                delete scope.uploadQueue[file.sequenceNum];
            };

        },
        controller: ['$scope', function ($scope) {
            // Start the selected upload after the thumbnail image is generated.
            this.startSelectedUpload = function (item, thumbnailImage) {
                $scope.doUpload(item.file.sequenceNum, thumbnailImage);
            };
            // Start the selected upload after the thumbnail image is generated.
            this.cancelSelectedUpload = function (item) {
                $scope.cancelUpload(item.file);
            };
            // Sets a boolean to ensure uploading doesn't start until the thumbnail is created.
            this.setThumbnailsCreating = function (thumbnailsCreating) {
                $scope.thumbnailsCreating = thumbnailsCreating;
            };
        }]
    };
};

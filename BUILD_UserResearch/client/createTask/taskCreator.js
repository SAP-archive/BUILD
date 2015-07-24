/**
 * Service which provides the logic for creating a task for a study/
 */
'use strict';

var path = require('path');
var util = require('./util');

// @ngInject
module.exports = function (Tasks, $document, zip, $timeout, $log, $window, $q, $stateParams, uiThumbnailGenerator, $http, uiError) {

    // constructor
    var TaskCreator = function () {

        var serviceUrl = 'api/projects/' + $stateParams.currentProject + '/research/uploadFiles/';
        var iframe = null;
        var assets, styles, scripts, taskPages, prototypePages, thumbnailCount, progress, cancelled,
            zipUploaded, thumbnailCreated = $q.defer(), studyProto, metadata, task = {};

        /**
         * Saves task to backend and returns promise when this is completed.
         *
         * @param prototypeData - the data returned after uploading the zip to /htmlprototype
         * @param taskName - Name of the Task
         * @param taskDesc - Description for the task
         * @param oridinal - Ordinal for the task
         * @param subOrdinal - subOrdinal for the task
         *
         * @returns {{object}} : { thumbnails: a promise which will be fulfilled when the thumbnails are created.  also sends progress.,
         *              task: promise which will be fulfilled when a task is created }
         */
        function createTask(prototypeData, taskName, taskDesc, ordinal, subOrdinal) {

            task.name = taskName;
            task.text = taskDesc;
            task.snapshotVersion = 1;
            task.snapshotId = prototypeData._id;
            // Set ordinal on task
            task.ordinal = ordinal;
            task.subOrdinal = subOrdinal;

            var thumbnailUpload = uploadSuccess(prototypeData);
            setPrototype(prototypeData.snapshot);
            task = Tasks.save(task).$promise;

            return {thumbnails: thumbnailUpload, task: task};
        }


        /**
         * Set up prep for uploading a prototype. Inits/resets variables and sets up iframe which is used to load the html
         * pages of the prototype (so they can be thumbnailed using html2canavs).
         *
         * TODO: Make directive which handles the iframe & thumbnail generation and messages the data to the controller.
         *
         * @param createIframe boolean - set whether or not to create the iframe
         * @param iframeId id of the iframe - must be included if createIframe is supplied
         */
        function init(createIframe, iframeId) {
            if (iframe) {
                $document[0].body.removeChild(iframe);
                iframe = null;
            }
            if (createIframe) {
                iframe = $document[0].createElement('iframe');
                iframe.style.display = 'none';
                iframe.setAttribute('sandbox', 'allow-scripts');
                iframe.id = iframeId;
                $document[0].body.appendChild(iframe);
            }
            progress = 0;
            taskPages = [];
            cancelled = false;
            zipUploaded = false;
            thumbnailCreated = $q.defer();
            task = {
                name: '',
                snapshotVersion: '',
                thumbnail: '',
                url: ''
            };
            thumbnailCount = 0;
            assets = [];
            styles = [];
            scripts = [];
            prototypePages = [];
        }


        /**
         * Callback for when the upload of the zip has started.
         *
         * The task will be created using the zip file which is being uploaded.  When this function is called, the
         * TaskCreator service is intialized that the processing of the zip wil begin.
         * is initial
         * @param file the prototype (zip file) being used to create this task
         */
        function onUploadStart(file) {
            init(true, 'taskCreator-' + file.sequenceNum);   // use file.sequence num as identifier for the iframe
            util.getEntries(zip, file, parseEntries, handleError); // starts the processing
        }


        /**
         * Error handler which shows when there is an error during the create task process
         */
        function handleError(err) {
            uiError.create({
                content: 'Error uploading the zip file' + (err ? ': ' + err.toString() : ''),
                dismissOnTimeout: true,
                dismissButton: true
            });
        }

        /**
         * This function should be called if the uploading of the zip file fails. Resets the service - removes iframe from
         * DOM.
         */
        function onUploadError(err) {
            handleError(err);
            cleanUp();
        }


        /**
         * sets the prototype to be used for this task
         * @param prototype that was created after uploading the zip
         */
        function setPrototype(prototype) {

            // handle the way studyPrototype objects are build version SW snapshot objects
            if (prototype && prototype.snapshot) {
                prototype = prototype.snapshot;
            }

            task.snapshotVersion = prototype.version;
            if (prototype.snapshotUILang) {
                task.snapshotUILang = prototype.snapshotUILang;
            }
            taskPages = prototype.deepLinks;

            var page = {};
            if (taskPages && taskPages.length) {
                page = taskPages[0];
                task.thumbnail = page.thumbnail;
                task.url = page.pageUrl;
            }

            taskPages.forEach(function (p) {
                p.selected = true;
            });
        }


        /**
         * Parses the files inside the zip.  Separates text and images into buckets which are sorted by the file extension.
         * Handles conversion of images, and updates the src urls in the html pages to their new location.  Page is then
         * loaded in to the iframe so that a thumbnail can be generated.
         *
         * @param entries
         * @param index
         */
        function parseEntries(entries, index) {
            if (cancelled) {
                cancelled = false;
                return;
            }
            index = (typeof index === 'undefined' ? 0 : index + 1);

            progress += 30 / entries.length;
            thumbnailCreated.notify({task: task, progress: progress});

            if (index === entries.length) {

                if (prototypePages.length === 0) {
                    uiError.create({
                        content: 'This is not a valid file: The ZIP must contain at least one html page',
                        dismissOnTimeout: true,
                        dismissButton: true
                    });
                    cancelled = true;
                    return;
                }
                styles.forEach(function (style) {
                    assets.push(util.replaceAssetsURLsInText(style, 'text/css', null, assets));
                });
                if (iframe) {
                    util.replaceAssetsURLsInPage(prototypePages[thumbnailCount], assets, scripts, iframe, iframe.id);
                }

                return;
            }

            // Arrays to store lists of files.  Each file type has it's own bucket so each can be parsed according to the file type.
            var entry = entries[index],
                txtFiles = {
                    htm: prototypePages,
                    html: prototypePages,
                    css: styles,
                    js: scripts
                },
                imgFiles = {
                    png: 1,
                    gif: 1,
                    jpg: 1,
                    jpeg: 1,
                    bmp: 1
                };

            if (!entry.directory && entry.filename.indexOf('__MACOSX') === -1) {
                getEntryFile(entry, function (blob) {
                    var ext = path.extname(entry.filename).substr(1),
                        reader = new FileReader();

                    // add the file to the correct bucket for it's file type
                    if (ext in txtFiles) {
                        reader.addEventListener('loadend', function () {
                            txtFiles[ext].push({
                                path: entry.filename,
                                html: reader.result
                            });
                            parseEntries(entries, index);
                        });
                        reader.readAsText(blob);
                    }

                    else if (ext in imgFiles) {
                        util.convertImgToBase64URL(blob, function (image) {
                            assets.push({
                                path: entry.filename,
                                url: image
                            });
                            parseEntries(entries, index);
                        });
                    }

                    else parseEntries(entries, index);

                });
            }
            else parseEntries(entries, index);
        }


        /**
         * Read the entry data from a file  in the zip
         *
         * @param entry the entry (eg file) to get get the data for
         * @param onend callback to handle the data returned
         */
        function getEntryFile(entry, onend) {
            var writer = new zip.BlobWriter(zip.getMimeType(entry.filename));
            entry.getData(writer, onend);
        }

        /**
         * callback for when the zip is uploaded
         * starts thumbnail upload when they have been created
         * @param resp
         */
        function uploadSuccess(resp) {
            studyProto = resp;
            metadata = resp.appMetadata;
            if (metadata.model && metadata.model.uiLang) {
                task.snapshotUILang = metadata.model.uiLang;
            }
            zipUploaded = true;
            return thumbnailCreated.promise.then(function () {
                uploadThumbnails().finally(cleanUp);
                return task;
            });
        }


        /**
         * Add listener for postMessage which is sent when a page is loaded in the iframe. Callback is executed if the
         * message is from the iframe for this task.
         */
        $window.addEventListener('message', function (event) {
            if (iframe && event.data && event.data.id === iframe.id) {
                messageCallback(event);
            }
        });

        /**
         * Function to handle the message from the iframe when a page is loaded.  Creates a thumbnail of the page loaded if
         * there is no error.
         * @param event - the event sent from the iframe.  event.data shoulc contain an image of the page loaded.
         */
        function messageCallback(event) {
            if (event.data.type && event.data.id === iframe.id && event.data.type === 'iframeCreateError') {
                $log.info('Error in iframe: ', event.data.errorMsg);
            }
            else {
                createThumbnail(event.data.screen);
            }
        }

        /**
         * Uses uiThumbnailGenerator to create a thumbnail. Added page and it's thumbnail to list of pages for the task.
         *
         * @param data image file to be thumbnailed
         */
        function createThumbnail(data) {
            if (data.length > 6) {
                // image not empty
                uiThumbnailGenerator.generateFromImage(data, 180, 288, function (blob, image) {

                    var currentPage = prototypePages[thumbnailCount];
                    if (typeof currentPage !== 'undefined') {
                        taskPages.push({
                            url: currentPage.path,
                            thumbnail: currentPage.path + '.png',
                            thumbnailImage: image,
                            interactive: true,
                            selected: true,
                            blob: blob
                        });
                    }
                    else {
                        $log.info('Error: Thumbnail generation, page not found');
                    }
                    createNextThumbnail();
                }, 4, true, '#FFFFFF');
            }
            else createNextThumbnail();
        }

        /**
         * Updates the progress for the thumbnail generation.  Starts upload of thumbnails if the upload of zip has
         * completed.
         */
        function createNextThumbnail() {
            if (cancelled) {
                cancelled = false;
                return;
            }

            // update num of thumbnails and progress
            thumbnailCount++;
            progress += 65 / prototypePages.length;
            thumbnailCreated.notify({task: task, progress: progress});

            // fulfill promise when thumbnails have been created for every page in the prototype.
            if (thumbnailCount >= prototypePages.length) {
                thumbnailCreated.resolve({task: task, progress: progress});
                if (zipUploaded) uploadThumbnails().finally(cleanUp);
            }
            else util.replaceAssetsURLsInPage(prototypePages[thumbnailCount], assets, scripts, iframe, iframe.id);
        }


        /**
         * Upload thumbnails, returns a promise
         */
        function uploadThumbnails() {
            var fd = new FormData();
            taskPages.forEach(function (page) {
                var fileName = page.url + '.png';
                fd.append(fileName, page.blob, fileName);
            });
            fd.append('metadata', JSON.stringify(studyProto));

            return $http.post(serviceUrl + 'thumbnail/', fd, {
                headers: {
                    'Content-Type': undefined
                },
                transformRequest: angular.identity
            });
        }

        /**
         * Clean-up, ensure iframe, data is cleaned up when ii's no longer required.
         */
        function cleanUp() {
            init(false);
        }

        // public functions
        this.uploadSuccess = uploadSuccess;
        this.setPrototype = setPrototype;
        this.onUploadError = onUploadError;
        this.onUploadStart = onUploadStart;
        this.init = init;
        this.createTask = createTask;
    };

    return TaskCreator;
};

/*eslint no-cond-assign: 0 */
'use strict';

var path = require('path');
var util = require('./util');

// @ngInject
module.exports = function ($scope, $state, $stateParams, $window, $document, $timeout, $http, $log,
                           zip, uiThumbnailGenerator, uiError, Snapshots, Tasks) {

    $scope.snapshots = null;
    $scope.selected = {
        snapshot: null
    };
    $scope.cancelled = false;
    $scope.serviceUrl = 'api/projects/' + $stateParams.currentProject + '/research/htmlPrototypes/';
    $scope.aserviceUrl = 'api/projects/' + $stateParams.currentProject + '/studyprototypes/';

    // flag to determine if a file upload was cancelled
    $scope.uploadCancelled = false;

    $scope.$on('dialog-open', function (event, id) {
        if (id === 'task-dialog') {
            Tasks.getStudyPrototypes().$promise
                .then(function (resp) {
                    $scope.snapshots = resp;
                });
        }
    });

    $scope.$watch('selected.snapshot', function (prototype) {
        if (prototype) {
            $scope.onSnapshotSelect(prototype);
        }
    });

    function messageCallback(event) {
        if (event.data && event.data.id === iframe.id &&
                event.data.type && event.data.type === 'iframeCreateError') {
            $log.info('Error in iframe: ', event.data.errorMsg);
        }
        else {
            createThumbnail(event.data.screen);
        }
    }

    $window.addEventListener('message', function (event) {
        if (iframe && event.data && event.data.id === iframe.id) {
            messageCallback(event);
        }
    });

    $scope.$on('$destroy', function () {
        $window.removeEventListener('message', messageCallback);
    });

    var assets, styles, scripts, pages, iframe, thumbnailCount;

    $scope.init = function (createIframe) {
        if (iframe) {
            $document[0].body.removeChild(iframe);
            iframe = null;
        }
        if (createIframe) {
            iframe = $document[0].createElement('iframe');
            iframe.style.display = 'none';
            iframe.setAttribute('sandbox', 'allow-scripts');
            iframe.id = 'create-task-iframe';
            $document[0].body.appendChild(iframe);
        }
        $scope.progress = 0;
        $scope.processing = false;
        $scope.pages = [];
        $scope.cancelled = false;
        $scope.select = false;
        $scope.zipUploaded = false;
        $scope.thumbnailCreated = false;
        $scope.task = {
            name: '',
            snapshotVersion: '',
            thumbnail: '',
            url: ''
        };
        thumbnailCount = 0;
        assets = [];
        styles = [];
        scripts = [];
        pages = [];
    };

    $scope.fileInputChange = function (file) {
        $scope.init(true);
        $scope.processing = true;
        util.getEntries(zip, file, parseEntries, $scope.handleError);
    };

    $scope.invalidFilesSelected = function () {
        uiError.create({
            content: 'This is not a valid file: The ZIP must contain at least one html page',
            dismissOnTimeout: true,
            dismissButton: true
        });
    };

    function createThumbnail(data) {
        if (data.length > 6) {
            // image not empty
            uiThumbnailGenerator.generateFromImage(data, 180, 288, function (blob, image) {

                var currentPage = pages[thumbnailCount];
                if (typeof currentPage !== 'undefined') {
                    $scope.pages.push({
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

    function createNextThumbnail() {
        if ($scope.cancelled) {
            $scope.cancelled = false;
            return;
        }
        thumbnailCount++;
        $scope.progress += 65 / pages.length;
        $scope.$apply();
        if (thumbnailCount >= pages.length) {
            $scope.thumbnailCreated = true;
            if ($scope.zipUploaded) uploadThumbnails();
        }
        else util.replaceAssetsURLsInPage(pages[thumbnailCount], assets, scripts, iframe, iframe.id);
    }

    $scope.createTask = function () {
        // Set ordinal on task
        $scope.task.ordinal = $scope.study.questions.length;
        $scope.task.subOrdinal = 0;

        return Tasks.save($scope.task).$promise.then(function (task) {
            $scope.study.questions = $scope.study.questions.concat([task]);
            $scope.init();
        });
    };

    function uploadThumbnails() {
        var fd = new FormData();
        $scope.pages.forEach(function (page) {
            var fileName = page.url + '.png';
            fd.append(fileName, page.blob, fileName);
        });
        fd.append('metadata', JSON.stringify($scope.studyProto));

        $http.post($scope.serviceUrl + 'thumbnail/', fd, {
            headers: {
                'Content-Type': undefined
            },
            transformRequest: angular.identity
        })
        .success($scope.goToSnapshotPreview)
        .error($scope.handleError);
    }

    function parseEntries(entries, index) {
        if ($scope.cancelled) {
            $scope.cancelled = false;
            return;
        }
        index = (typeof index === 'undefined' ? 0 : index + 1);

        $scope.progress += 30 / entries.length;
        $scope.$apply();


        if (index === entries.length) {

            if (pages.length === 0) {
                $scope.invalidFilesSelected();
                $scope.cancelled = true;
                $timeout(function () {
                    $scope.init();
                });
                return;
            }

            styles.forEach(function (style) {
                assets.push(util.replaceAssetsURLsInText(style, 'text/css', null, assets));
            });
            if (iframe) {
                util.replaceAssetsURLsInPage(pages[thumbnailCount], assets, scripts, iframe, iframe.id);
            }
            return;
        }

        var entry = entries[index],
            txtFiles = {
                htm: pages,
                html: pages,
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

    $scope.handleError = function (err) {
        uiError.create({
            content: 'Error uploading the zip file' + (err ? ': ' + err.toString() : ''),
            dismissOnTimeout: true,
            dismissButton: true
        });
    };

    function getEntryFile(entry, onend, onprogress) {
        var writer = new zip.BlobWriter(zip.getMimeType(entry.filename));
        entry.getData(writer, onend, onprogress);
    }

    $scope.defaultNameAndText = function () {
        if (!$scope.task.name) {
            var taskLen = $scope.study.questions.filter(function (n) {
                return n.type === 'Task';
            });

            $scope.task.name = $scope.task.name || 'Task ' + (taskLen.length + 1);
        }
        if (!$scope.task.text) {
            $scope.task.text = 'Here is a prototype that we want you to explore ' +
            'and provide feedback on.';
        }
    };

    $scope.onSnapshotSelect = function (prototype) {
        var snapshot;
        // handle the way studyPrototype objects are build version SW snapshot objects
        if (prototype && prototype.snapshot) {
            snapshot = prototype.snapshot;
        }
        else {
            snapshot = prototype;
        }

        $scope.defaultNameAndText();
        $scope.task.snapshotVersion = snapshot.version;
        $scope.task.snapshotId = snapshot.snapshotId;
        if (snapshot.isSmartApp) {
            $scope.task.isTargetable = false;
        }
        if (snapshot.snapshotUILang) {
            $scope.task.snapshotUILang = snapshot.snapshotUILang;
        }
        $scope.pages = snapshot.deepLinks;

        var page = {};
        if ($scope.pages && $scope.pages.length) {
            page = $scope.pages[0];
        }
        $scope.task.thumbnail = page.thumbnail;
        $scope.task.url = page.pageUrl;
        $scope.pages.forEach(function (page) {
            page.selected = true;
        });
    };

    $scope.goToSnapshotPreview = function (res) {
        if (res) {
            $scope.defaultNameAndText();
            $scope.task.snapshotVersion = res.snapshotVersion || res.snapshot.version; // if there is no snapshot version then it is a new studyPrototype, therefore just default to 1

            var meta;
            var url;
            var page;

            // Old way of handling prototypes
            if (res.snapshotMetadata && res.snapshotMetadata.appMetadata) {
                meta = res.snapshotMetadata.appMetadata;
                // e.g. deploy/public/e1fc7db8ab7c8fe809d85871/10/GLLineItems/gl_items_results.html.png
                url = '/deploy/public/' + $stateParams.currentProject + '/' + $scope.task.snapshotVersion + '/';
            }
            else if (res.appMetadata && res.appMetadata.model) {
                // New way of handling prototypes which is fetched from the project assets store
                meta = res.appMetadata.model;
                // e.g. api/participant/prototype/:studyPrototypeId/render/TestingDriveHeader/task_2.html.png
                url = '/api/participant/prototype/' + res._id + '/render';
            }
            if (meta && meta.pages && meta.pages.length) {
                page = meta.pages[0];
            }
            if (url) {
                $scope.task.thumbnail = url + page.thumbnailUrl;
                $scope.task.url = url + page.pageUrl;
                $scope.task.snapshotId = res._id;
            }
        }
        $scope.processing = false;
        $scope.select = true;
        $scope.toggleSelect();
        $timeout(function () {
            $document[0].getElementById('taskName').select();
        }, 300);
        return false;
    };

    $scope.toggleSelect = function (page) {
        if (page) page.selected = !page.selected;
        $scope.selectedCount = $scope.pages.filter(function (p) {
            return p.selected;
        }).length;
    };

    $scope.onDialogCancel = function () {
        $scope.cancelled = true;
        if ($scope.processing) {
            // make sure the cancelled upload is always indicated by the flag
            $scope.uploadCancelled = true;
            // if the upload was already successfull, delete prototype
            if ($scope.studyProto) {
                Tasks.deleteStudyPrototype({
                    id: $scope.studyProto._id
                });
            }
        }
        $scope.init();
    };

    $scope.onDialogClose = function () {
        if ($scope.select) {
            $scope.createTask();
        }
        else {
            // return false to keep dialog open
            return $scope.goToSnapshotPreview();
        }
    };

    $scope.uploadSuccess = function (resp) {
        // check if the upload was cancelled and this callback was called afterwards
        if (!$scope.uploadCancelled) {
            $scope.studyProto = resp;
            $scope.metadata = resp.appMetadata;
            if ($scope.metadata.model && $scope.metadata.model.uiLang) {
                $scope.task.snapshotUILang = $scope.metadata.model.uiLang;
            }
            $scope.zipUploaded = true;
            if ($scope.thumbnailCreated) {
                uploadThumbnails();
            }
        }
        else {
            // reset upload cancelled flag
            $scope.uploadCancelled = false;
            // if prototype was successfully uploaded after upload was cancelled
            // check if it is marked as deleted; if not delete it here
            if (!resp.deleted) {
                Tasks.deleteStudyPrototype({
                    id: resp._id
                });
            }
        }
    };

    $scope.uploadFailure = function (err) {
        $scope.handleError(err);
        $timeout(function () {
            $scope.init();
        });
    };

    $scope.init();
};

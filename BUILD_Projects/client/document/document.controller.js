'use strict';

var tp = require('norman-client-tp');
var _ = tp.lodash;

// Controller for page showing documents for a project
// @ngInject
module.exports = function ($state, $rootScope, $scope, $timeout, $log, Auth, User, ProjectFactory, ActiveProjectService, uiError) {

    var that = this;

    // List of sorting options
    that.sortedItems = [{
        name: 'Date New→Old',
        value: 'date',
        reverse: true
    }, {
        name: 'Date Old→New',
        value: 'date',
        reverse: false
    }, {
        name: 'Name A→Z',
        value: 'name',
        reverse: false
    }, {
        name: 'Name Z→A',
        value: '-name',
        reverse: false
    }, {
        name: 'Size Big→Small',
        value: 'size',
        reverse: true
    }, {
        name: 'Size Small→Big',
        value: 'size',
        reverse: false
    }];

    that.fileType = {
        image: 'image',
        video: 'media',
        audio: 'media',
        text: 'document',
        application: 'document'
    };

    that.selectedSortItem = that.sortedItems[2];
    that.projectId = ActiveProjectService.id;
    that.docs = [];
    that.nbDocs = 0;
    that.loading = true;
    that.anyFileUpload = false;
    that.user = Auth.getCurrentUser();

    // Default sorting option
    that.typeFilter = '';
    that.sortOptionValue = 'name';
    that.sortOptionReverse = false;
    that.anyDocSelected = 0;

    // Get the list of all document
    ProjectFactory.getDocument({
        id: ActiveProjectService.id
    }).$promise.then(function (response) {
        that.loading = false;
        var url = '';
        var fileType = '';

        // Iterate over images
        for (var i = 0; i < response.length; i++) {
            fileType = that.getFileType(response[i].metadata.contentType, response[i].metadata.extension);
            url = '';
            that.nbDocs++;

            // Is the item in the supported image list?
            if (fileType === 'image') {
                // Yes, in some cases i.e. prototypes dont have thumbnails attached so dont append thumbnail to URL
                url = '/api/projects/' + ActiveProjectService.id + '/document/' + response[i]._id + '/render/';
            }

            that.docs.unshift({
                id: response[i]._id,
                projectId: ActiveProjectService.id,
                name: response[i].filename,
                size: response[i].length,
                date: response[i].metadata.created_at,
                ext: response[i].metadata.extension.toLowerCase(),
                contentType: response[i].metadata.contentType,
                type: fileType,
                selected: false,
                url: url,
                createdBy: response[i].metadata.created_by,
                createdAt: response[i].metadata.created_at,
                fileUrl: '/api/projects/' + ActiveProjectService.id + '/document/' + response[i]._id + '/render?download=true'
            });
        }
    }).catch(function error(response) {
        that.loading = false;
        uiError.create({
            content: response.data.error,
            dismissOnTimeout: false
        });
    });


    that.uploadFileStarted = function () {
        $log.log('a file upload has started');
        that.anyFileUpload = true;
    };

    that.saveDocToDocument = function (responseDetails) {
        var fileType = that.getFileType(responseDetails[0].metadata.contentType, responseDetails[0].metadata.extension);
        var url = '';

        if (fileType === 'image') {
            url = '/api/projects/' + that.projectId + '/document/' + responseDetails[0]._id + '/render/?thumbOnly=true';
        }

        that.docs.unshift({
            id: responseDetails[0]._id,
            projectId: that.projectId,
            name: responseDetails[0].filename,
            size: responseDetails[0].length,
            date: responseDetails[0].uploadDate,
            ext: responseDetails[0].metadata.extension.toLowerCase(),
            contentType: responseDetails[0].metadata.contentType,
            type: fileType,
            selected: false,
            url: url,
            createdBy: responseDetails[0].metadata.created_by,
            createdAt: responseDetails[0].metadata.created_at,
            fileUrl: '/api/projects/' + that.projectId + '/document/' + responseDetails[0]._id + '/render'
        });
        that.anyFileUpload = false;
        that.nbDocs++;
    };

    that.importError = function (error) {
        uiError.create({
            content: error.code === 413 ? 'Sorry! We can’t upload files that big! Please reduce the file size or try another file.' : error.message,
            dismissOnTimeout: false
        });
    };

    that.deleteDoc = function (doc) {
        if (doc.selected) {
            that.anyDocSelected -= 1;
        }

        ProjectFactory.deleteDocument({
                id: that.projectId,
                assetId: doc.id
            }).$promise
            .then(function () {
                that.loading = false;
                that.docs = _.without(that.docs, _.findWhere(that.docs, {
                    id: doc.id
                }));
                that.nbDocs--;
            })
            .catch(function error(response) {
                that.loading = false;
                uiError.create({
                    content: response.data.error,
                    dismissOnTimeout: false
                });
            });
    };

    that.deleteSelected = function () {
        $log.log('delete selected');
    };

    that.viewDoc = function (id, event) {
        event.stopImmediatePropagation();
    };

    /**
     * Function to check the content-type and return the file type
     * @param  {string} content_type The mime-type of the file
     * @return {string}              The file type of the file
     */
    that.getFileType = function (content_type, file_ext) {
        var type = 'document';
        var content = content_type.split('/');
        if (!_.isUndefined(content[0]) && !_.isUndefined(content[1])) {
            type = that.fileType[content[0]];
            if (content[1].match(/(zip|rar)/)) {
                type = 'archives';
            }
            // Fix issue for windows as the mime-type of a zip file is returned as octet-stream
            if (content[1].match(/octet-stream/)) {
                if (file_ext === 'zip' || file_ext === 'rar') {
                    type = 'archives';
                }
            }
            return type;
        }
    };

    $scope.$on('previewDocumentDelete', function (evt, data) {
        that.deleteDoc(data);
    });
};

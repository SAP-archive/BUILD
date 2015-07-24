'use strict';


var Cropper = require('./avatar.cropper');

// @ngInject
module.exports = function ($rootScope, $scope, $timeout, $document, Auth, httpError, uiError) {

    $scope.picture = '';
    $scope.errors = {};
    $scope.type = '';
    $scope.currentUser = Auth.getCurrentUser();
    $scope.oldUrl = Auth.getCurrentUser().avatar_url;
    $rootScope.avatar_url = Auth.getCurrentUser().avatar_url;
    $scope.zoomObject = { value: 50, el: null };

    $scope.$watch('zoomObject.value', function (v) {
        if ($scope.cropper) $scope.cropper.setZoom(v);
    });

    $scope.UploadImage = function () {
        $scope.picture = $scope.cropper.getImage();
        $scope.avatarBroadcastObj = {
            hash: new Date().valueOf(),
            userUrl: $scope.cropper.getDataURI()
        };

        $rootScope.avatar_url = $scope.avatarBroadcastObj.userUrl;
        $rootScope.$broadcast('userAvatarChanged');
        $scope.showCropScreen = false;
        $scope.saveActions = 'Upload';
    };

    $scope.cancelUpload = function () {
        $scope.errors = {};
        $scope.type = '';
        $scope.zoomObject.value = '50';
        $rootScope.avatar_url = $scope.oldUrl;
        $scope.showCropScreen = false;
    };

    $scope.succesfullMessage = function () {
        uiError.create({
            content: 'Profile successfully updated.',
            dismissOnTimeout: true,
            dismissButton: true,
            timeout: 5000,
            className: 'success'
        });
    };

    $scope.errorMessage = function (err) {
        httpError.create({
            req: err,
            content: 'Can not update at the moment please try again later.',
            dismissOnTimeout: false
        });
    };

    $scope.saveUpload = function () {
        if ($scope.saveActions === 'Upload') {
            Auth.changeAvatar($scope.type, $scope.picture)
                .then(function () {
                    $scope.currentUser.avatar_url = $scope.avatarBroadcastObj.userUrl;
                    $scope.succesfullMessage();
                })
                .catch(function (err) {
                    $scope.cancelUpload(); // used to reset
                    $scope.errorMessage(err);
                });
        }
        else {
            Auth.deleteAvatar()
            .then(function () {
                $rootScope.avatar_url = null;
                $scope.currentUser.avatar_url = null;
                $scope.succesfullMessage();
            })
            .catch(function (err) {
                $scope.cancelUpload(); // used to reset
                $scope.errorMessage(err);
            });
        }
    };

    $scope.$on('settings-cancel-action', function () {
        $scope.cancelUpload();
        $rootScope.$broadcast('userAvatarCanceled');
    });

    $scope.$on('settings-save-action', function () {
        $scope.saveUpload();
    });

    $scope.deleteUserAvatar = function () {
        $scope.oldUrl = $scope.currentUser.avatar_url;
        $rootScope.avatar_url = null;
        $rootScope.$broadcast('userAvatarChanged');
        $scope.saveActions = 'Delete';
    };

    $scope.performFileInputClick = function () {
        $document[0].getElementById('fileInput').click();
    };

    // Clear the file input selection when clicked.
    // This allows the user to select the same image again after deleting it
    var clearFileSelect = function () {
        this.value = null;
    };

    // opens the file explorer for selecting an image to upload and adding it to the canvas
    var handleFileSelect = function (evt) {
        var file = evt.currentTarget.files[0], reader = new FileReader();
        if (file) reader.readAsDataURL(file);
        reader.onload = function (ev) {
            $scope.type = file.type;

            $scope.zoomObject.el = $document[0].querySelector('.zoomSlider');

            $scope.showCropScreen = true;
            $scope.cropper = new Cropper({
                target: $document[0].querySelector('.cropper'),
                imgData: ev.target.result,
                onUpdate: function (res, cropper) {
                    $timeout(function () {
                        $scope.zoomObject.value = cropper.getZoom();
                        $scope.zoomObject.el.classList.toggle('hidden', res.stretch);
                    });
                }
            });
        };
    };

    angular.element($document[0].querySelector('#fileInput')).on('change', handleFileSelect);
    angular.element($document[0].querySelector('#fileInput')).on('click', clearFileSelect);
};

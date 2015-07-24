'use strict';
// @ngInject
module.exports = function ($scope, Auth) {
    $scope.errors = {};
    $scope.formHasErrors = false;

    $scope.requestPwd = function (form) {
        $scope.submitted = true;

        if (form.$valid) {
            Auth.requestPwd($scope.user.email)
                .then(function (data) {
                    $scope.message = data.message;
                })
                .catch(function (err) {
                    console.dir(err);
                    $scope.errors.message = err.data.error.message;
                    $scope.formHasErrors = true;
                });
        }
    };
};

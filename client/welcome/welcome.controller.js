'use strict';
// @ngInject
module.exports = function ($scope, $rootScope, $location, Auth) {
    
    $scope.isLoggedIn = Auth.isLoggedIn;
    Auth.getCurrentUser();

    $scope.logout = function () {
        Auth.logout();
        $location.path('/login');
    };

    $scope.isActive = function (route) {
        return route === $location.path();
    };
};

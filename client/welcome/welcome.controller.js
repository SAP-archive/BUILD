'use strict';
// @ngInject
module.exports = function ($scope, $rootScope, $location, Auth) {

    // $scope.menu = [{
    //     'title': 'Home',
    //     'link': '/'
    // }];
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    Auth.getCurrentUser();

    $scope.logout = function () {
        Auth.logout();
        $location.path('/login');
    };

    $scope.isActive = function (route) {
        return route === $location.path();
    };
};

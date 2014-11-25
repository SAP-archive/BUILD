/**
 * Created by i311181 on 11/25/14.
 */
'use strict';
module.exports = function ($scope, $location, Auth) {
    $scope.menu = [{
        'title': 'Home',
        'link': '/'
    }];

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function() {
        Auth.logout();
        $location.path('/login');
    };

    $scope.isActive = function(route) {
        return route === $location.path();
    };
};

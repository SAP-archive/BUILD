'use strict';
// @ngInject
module.exports = function ($scope, $rootScope, $location, Auth) {



	Auth.getSecurityConfig()
        .then(function(d){
            var settings = d.settings;
            $scope.hideSignup = settings && settings.registration && settings.registration.self === false ? function(){return true;} : Auth.isLoggedIn;
            if (settings && settings.provider && settings.provider.local === false){

				//Force redirect
				Auth.initCurrentUser();
				$location.path('/norman');

				$scope.showLogout = function() {
                    return false;
                };
                $scope.login = function () {
					Auth.initCurrentUser();
                    $location.path('/norman');
                };
                $scope.logout = function () {
                };
            } else {
                $scope.showLogout = Auth.isLoggedIn;
                $scope.login = function () {
                    $location.path('/login');
                };
                $scope.logout = function () {
                    Auth.logout();
                    $location.path('/login');
                };
            }
     });

    $scope.isLoggedIn = Auth.isLoggedIn;
    Auth.getCurrentUser();

    $scope.isActive = function (route) {
        return route === $location.path();
    };
};

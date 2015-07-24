'use strict';


// @ngInject
module.exports = function ($scope, $rootScope, Auth, $location, $http, httpError, tosService) {

    tosService.getTermOfUse().then(function (data) {
        $scope.termOfUse = data;
    });

    $scope.showPrivacyStmt = false;
    tosService.getPrivacyStatement().then(function (data) {
        $scope.showPrivacyStmt = true;
        $scope.privacystatement = data;
    });

    $scope.displayTosAgree = false;
    if ($rootScope.tosRedirect) {
        $scope.displayTosAgree = true;
    }

    $scope.accept = function () {
        Auth.signupSSO().then(function () {
            Auth.getSecurityConfig()
                .then(function (d) {
                    var redirect = $rootScope.tosRedirect;
                    if ($rootScope.tosRedirect) {
                        delete $rootScope.tosRedirect;
                    }
                    if (d.settings.application && d.settings.application.admin === true) {
                        $location.path('/console/users');
                    }
                    else {
                        if (redirect) {
                            $location.path(redirect);
                        }
                        else {
                            $location.path('/norman');
                        }
                    }
                });
        })
        .catch(function (err) {
            httpError.create({
                req: err,
                content: 'Failed to provision user',
                dismissOnTimeout: false,
                dismissButton: true
            });
        });
    };

    $scope.deny = function () {
        window.location = 'https://experience.sap.com/';
    };
    $scope.back = function () {
        if ($rootScope.tosRedirect) {
            $location.path('/tos');
        }
        else {
            window.history.back();
        }

    };
};

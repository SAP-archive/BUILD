'use strict';
// @ngInject
module.exports = function ($scope, Auth, $location, $window, OAUTH, uiError) {
	$scope.OAUTH = OAUTH;
	$scope.user = {};
	$scope.errors = {};
	$scope.formHasErrors = false;
	if ($location.search().pstatus) {
		if ($location.search().pstatus === '202') {
			$scope.info = 'An Email has been sent with password reset instructions';
		}
		else if ($location.search().pstatus === '204') {
			$scope.info = 'Successfully updated';
		}
	}

	$scope.login = function (form) {
		$scope.submitted = true;
		if (form.$valid) {
			Auth.login({
				email: $scope.user.principal,
				password: $scope.user.password
			})
				.then(function () {
                    // When coming from deep links, some queries could have been triggered before the redirect to login and thus rejected.
                    // once logged-in, these errors are displayed after the redirect because there are still in the stack : clear them on successful login
                    uiError.dismiss();

					// Logged in, redirect to shell or home page
					if ($scope.isAdminConsole) {
                        $location.path('/console/users');
                    }
                    else {
                        $location.path('/norman');
                    }
					$scope.formHasErrors = false;
				})
				.catch(function (err) {
					if (err) {
						$scope.errors.other = err.message;
					}

					$scope.formHasErrors = true;
				});
		}
	};

	$scope.loginOauth = function (provider) {
		$window.location.href = '/auth/' + provider;
	};

    Auth.getSecurityConfig()
        .then(function (d) {
            var settings = d.settings;
            $scope.hideSocialButtons = settings && settings.registration && settings.registration.social === false;
            $scope.hideSignup = settings && settings.registration && settings.registration.self === false;
            $scope.isAdminConsole = settings && settings.application && settings.application.admin === true;
        });
};

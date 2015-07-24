'use strict';
// @ngInject
module.exports = function ($scope, Auth, ResetPasswordTokenValidation, $stateParams, $window, httpError) {
	$scope.errors = {};
	$scope.formHasErrors = false;
	$scope.expired = false;
	$scope.policy = null;
	Auth.getPasswordPolicy()
		.then(function (d) {
			$scope.policy = d.policy;
		});

	if (ResetPasswordTokenValidation && ResetPasswordTokenValidation.status === 'verified') {
		$scope.message = ResetPasswordTokenValidation.message;
	}
    else if (ResetPasswordTokenValidation && ResetPasswordTokenValidation.status === 'expired') {
		$scope.message = ResetPasswordTokenValidation.message;
		$scope.expired = true;

	}

	$scope.resetPassword = function (form) {
		$scope.submitted = true;
		if ($scope.user.newPassword !== $scope.user.confirmNewPassword) {
			form.confirmNewPassword.$setValidity('notMatch', false);
		}
        else {
			Auth.resetPassword($stateParams.id, $scope.user.newPassword)
				.then(function () {
					$scope.message = 'Password successfully changed.';
					$scope.errors.other = '';
					$window.location.href = '/norman';
				})
				.catch(function (err) {
                    if (form.oldPassword) {
                        form.oldPassword.$setValidity('mongoose', false);
                    }
                    $scope.user.newPassword = '';
                    $scope.user.confirmNewPassword = '';
					$scope.errors.other = 'Unable to reset password';
                    $scope.message = 'Unable to reset password';
                    httpError.create({
                        req: err,
                        content: 'Unable to reset password',
                        dismissOnTimeout: false,
                        dismissButton: true
                    });
				});
		}
	};
};

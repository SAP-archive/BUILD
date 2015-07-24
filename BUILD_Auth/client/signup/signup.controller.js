'use strict';
// @ngInject
module.exports = function ($scope, Auth, $location, $window, OAUTH, uiError) {
    $scope.policyObeyed = false;

    $scope.OAUTH = OAUTH;
    $scope.user = {};
    $scope.errors = {};
    $scope.submitted = false;
    // This will be set to true once the user blurs (unfocuses) the email input
    $scope.userWasInEmailBox = false;
    $scope.userWasInNameBox = false;

    /**
     * This method is used to add a class or show/hide an element depending on whether the email entered is valid.
     * @returns {boolean} true If the email seems invalid.
     */
    $scope.emailIsInvalid = function () {
        var emailError = $scope.form.email.$error;
        return (emailError.email || emailError.additionalEmailValidationFailed) && ($scope.submitted || $scope.userWasInEmailBox);
    };

    $scope.register = function (form) {
        $scope.submitted = true;
        $scope.formHasErrors = false;

        if (form.$valid) {
            Auth.signup({
                name: $scope.user.name,
                email: $scope.user.email,
                password: $scope.user.password
            })
                .then(function () {
                    // When coming from deep links, some queries could have been triggered before the redirect to login and thus rejected.
                    // once logged-in, these errors are displayed after the redirect because there are still in the stack : clear them on successful login
                    uiError.dismiss();

                    $scope.formHasErrors = false;
                    $location.path('/norman');
                })
                .catch(function (err) {
                    $scope.errors = {};
                    if (err.message) {
                        $scope.errors.other = err.message;
                        $scope.formHasErrors = true;
                    }
                    else {
                        if (err.data) {
                            err = err.data;
                        }
                        if (err.error) {
                            err = err.error;
                        }
                        if (err.errors) {
                            err = err.errors;
                        }

                        // Update validity of form fields that match the mongoose errors
                        angular.forEach(err, function (error, field) {
                            if (form[field]) {
                                form[field].$setValidity('mongoose', false);
                            }
                            $scope.errors[field] = err.message;
                        });
                    }
                });
        }
    };

    $scope.policy = null;
    Auth.getPasswordPolicy()
        .then(function (d) {
            $scope.policy = d.policy;
        });

    $scope.clearFieldErrors = function (form, field) {
        if (form[field]) {
            form[field].$setValidity('mongoose', true);
        }
    };

    $scope.loginOauth = function (provider) {
        $window.location.href = '/auth/' + provider;
    };

    Auth.getSecurityConfig()
        .then(function (d) {
            var settings = d.settings;
            $scope.hideSocialButtons = settings.registration && settings.registration.social === false;
        });
};

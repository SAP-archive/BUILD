/**
 * Created by i311181 on 16 Jan 2015.
 */
'use strict';
// @ngInject
module.exports = function (passwordPolicyService) {
    return {
        restrict: 'AE',
        scope: {
            password: '=reference',
            policy: '=',
            valid: '='
        },
        templateUrl: '/resources/norman-auth-client/passwordPolicy/password-policy.html',
        link: function (scope) {
            var minLength, maxLength;

            function setUp() {
                if (scope.policy) {
                    minLength = scope.policy.minLength || 6;
                    maxLength = scope.policy.maxLength || 40;

                    if (minLength > 0 && maxLength === null) {
                        scope.requiredLengthMessage = 'At Least ' + minLength + ' characters';
                    }
                    else if (minLength > 0 && maxLength > 0) {
                        scope.requiredLengthMessage = ' ' + minLength + ' to ' + maxLength + ' characters';
                    }

                    if (scope.policy.digits && scope.policy.digits.required) {
                        if (scope.policy.digits.minOccurrence > 1) {
                            scope.requiredNumbersMessage = 'At Least ' + scope.policy.digits.minOccurrence + ' Numbers';
                        }
                        else {
                            scope.requiredNumbersMessage = 'At Least 1 Number';
                        }
                    }

                    if (scope.policy.upperCase && scope.policy.upperCase.required) {
                        if (scope.policy.upperCase.minOccurrence > 1) {
                            scope.requiredUpperCaseMessage = 'At Least ' + scope.policy.upperCase.minOccurrence + ' Upper case character';
                        }
                        else {
                            scope.requiredUpperCaseMessage = 'At Least 1 upper case character';
                        }
                    }

                    if (scope.policy.lowerCase && scope.policy.lowerCase.required) {
                        if (scope.policy.lowerCase.minOccurrence > 1) {
                            scope.requiredLowerCaseMessage = 'At Least ' + scope.policy.lowerCase.minOccurrence + ' lower case characters';
                        }
                        else {
                            scope.requiredLowerCaseMessage = 'At Least 1 lower case character';
                        }
                    }

                    if (scope.policy.specialCharacters && scope.policy.specialCharacters.required) {
                        if (scope.policy.specialCharacters.minOccurrence > 1) {
                            scope.requiredSpecialCharactersMessage = 'At Least ' + scope.policy.specialCharacters.minOccurrence + ' special characters characters';
                        }
                        else {
                            scope.requiredSpecialCharactersMessage = 'At Least 1 special characters character';
                        }
                    }
                }
                else {
                    minLength = 6;
                    maxLength = null;
                    scope.policy = {};
                    scope.policy.minLength = minLength;
                    scope.policy.maxLength = maxLength;
                }
            }

            scope.$watch('policy', function () {
                setUp();
            });

            scope.$watch('password', function () {
                if (scope.policy) {
                    // Checking Length
                    if (minLength > 0 && maxLength) {
                        scope.requiredLengthMessage = ' ' + minLength + ' to ' + maxLength + ' characters';
                        if (passwordPolicyService.passwordLength(scope.password) <= maxLength && passwordPolicyService.passwordLength(scope.password) >= minLength) {
                            scope.isRequiredLength = true;
                        }
                        else {
                            scope.isRequiredLength = false;
                        }
                    }
                    else if (minLength > 0) {
                        scope.requiredLengthMessage = 'At Least ' + minLength + ' characters';
                        if (passwordPolicyService.passwordLength(scope.password) >= minLength) {
                            scope.isRequiredLength = true;
                        }
                        else {
                            scope.isRequiredLength = false;
                        }
                    }
                    else {
                        scope.requiredLengthMessage = null;
                        scope.isRequiredLength = false;
                    }
                    // End of Length check

                    // Has number
                    if (scope.policy.digits && scope.policy.digits.required) {
                        scope.hasRequiredNumbers = passwordPolicyService.hasNumber(scope.password, scope.policy.digits.minOccurrence);
                    }

                    if (scope.policy.upperCase && scope.policy.upperCase.required) {
                        scope.hasRequiredUpperCase = passwordPolicyService.hasUpperCase(scope.password, scope.policy.upperCase.minOccurrence);
                    }
                    if (scope.policy.lowerCase && scope.policy.lowerCase.required) {
                        scope.hasRequiredLowerCase = passwordPolicyService.hasLowerCase(scope.password, scope.policy.lowerCase.minOccurrence);
                    }

                    if (scope.policy.specialCharacters && scope.policy.specialCharacters.required) {
                        scope.hasRequiredSpecialCharacters = passwordPolicyService.hasSpecialCharacters(scope.password, scope.policy.specialCharacters.allowedCharacters, scope.policy.specialCharacters.minOccurrence);
                    }
                }
            });
        }
    };
};

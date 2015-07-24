'use strict';
/**
 *
 * @returns {Object} The angular directive that performs some additional checks on the email addresses.
 */
// @ngInject
module.exports = function () {
    // Regexps to detect invalid emails.
    // The regexps below apply to both the name and the domain.
    // The 'at' (@) sign is not in the string anymore.
    var REGEXPS_FOR_INVALID_EMAILS = {
        // Either the name or the domain starts with a dot
        STARTING_DOT: /^\s*\./,
        // It contains more than 1 dot in a row
        MORE_THAN_ONE_DOT: /\.{2,}/,
        // The name or the domain cannot end with a period
        DOT_AT: /\.$/
    };

    return {
        restrict: 'A',
        require: 'ngModel',
        /**
         * @param {Object} scope An Angular scope object.
         * @param {Object} element The jqLite-wrapped element that this directive matches.
         * @param {Object} attrs A hash object with key-value pairs of normalized attribute names and their corresponding attribute values.
         * @param {Object} ngModel The ngModel injected thanks to the require property above.
         */
        link: function (scope, element, attrs, ngModel) {
            /**
             * The function that performs additional checks on the email address.
             *
             * Only email addresses containing a single @ characters are checked, the others are
             * supposed valid (we rely on the flawed 'html5 input type=email' checks).
             *
             * @param {string} emailAddressInModel Unused. The email address in the model.
             * @param {string} emailAddress The email address in the view, as it was just typed.
             * @returns {boolean} true if the email address seems valid.
             */
            function additionalEmailCheck(emailAddressInModel, emailAddress) {
                var isValidEmail = true;
                var strEmail = emailAddress || '';
                var nameDomain = strEmail.split('@');
                var name, domain;
                // We check only email addresses containing a single @ character.
                if (nameDomain.length === 2) {
                    name = nameDomain[0];
                    domain = nameDomain[1];
                    angular.forEach(REGEXPS_FOR_INVALID_EMAILS, function (regexp) {
                        isValidEmail = isValidEmail && !regexp.test(name) && !regexp.test(domain);
                    });
                }
                return isValidEmail;
            }

            // Store the result in the $errors, under the 'additionalEmailValidationFailed' boolean property.
            ngModel.$validators.additionalEmailValidationFailed = additionalEmailCheck;
        }
    };
};

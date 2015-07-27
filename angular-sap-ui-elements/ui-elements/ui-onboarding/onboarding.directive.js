'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiOnBoarding
 *
 * @description
 * Creates Onboarding message
 *
 * @restrict E
 * @element ANY
 *
 * @param {string} greeting is the message to be displayed.
 * @param {string} message is the content to be displayed.
 *
 * @example
<doc:example>
    <doc:source>
       <ui-onboarding greeting="Hola,"
		message="new to project"
    </doc:source>
 </doc:example>
 *
 */
// @ngInject
module.exports = function() {
    return {
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-onboarding/onboarding.template.html',
        scope: {
            greeting: '@',
            message: '@',
            arrowDirection:'@',
            elementId:'@'
        },
        restrict: 'E',
        replace: true,
        transclude: false
    };
};

'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiBlankState
 *
 * @description
 * Creates a HTML message box for detailing blank states within Norman landing pages.
 *
 * @restrict E
 * @element ANY
 *
 * @param {string} message-width The width of the message box to be generated.  Defaults to 650px if not supplied.
 * @param {string} background-color The background color of the message box rendered.  Defaults to @Porcelain-500 if not supplied.
 *
 * @example

 <doc:example>
 <doc:source>
 <ui-blank-state>
 You do not have any projects in which you participate.<br/>
 <span class="ui-blank-state-action">Create</span> your first one!
 </ui-blank-state>
 </doc:source>
 </doc:example>
 *
 */

// @ngInject
module.exports = function() {
    return {
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-blank-state/blank.state.template.html',
        restrict: 'E',
        replace: true,
        scope: {
            messageWidth: '@',
            backgroundColor: '@'
        },
        transclude: true,
        link: function(scope, element, attrs) {}
    };
};

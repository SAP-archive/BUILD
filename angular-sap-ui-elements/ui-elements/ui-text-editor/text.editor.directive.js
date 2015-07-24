'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiTextEditor
 *
 * @description
 * A rich text editor that allows the user style text input using HTML.
 *
 * @restrict E
 * @element ANY
 *
 * @param {htmlVariable} the controller variable to store the HTML styled text.
 *
 * @example
 *
 <doc:example>
 <doc:source>
 <ui-text-editor html-variable="someHtmlVariable"></ui-text-editor>
 </doc:source>
 </doc:example>
 *
 */
require('textangular/dist/textAngular-rangy.min');
require('textangular/dist/textAngular-sanitize.min');
require('textangular/dist/textAngular.min');

// @ngInject
module.exports = function () {
    return {
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-text-editor/text.editor.template.html',
        restrict: 'E',
        replace: true,
        scope: {
          htmlVariable: '='
        },
        link: function (scope, element, attrs) {
            /**
             * Strip HTML tags from text that is pasted into the rich text editor box.
             * @param $html the html pasted.
             * @returns {string} the string representing the pasted text without html.
             */
            scope.stripFormat = function ($html) {
                return String($html).replace(/<[^>]+>/gm, '');
            };
        }
    };
};


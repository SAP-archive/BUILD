'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiDialogOpen
 *
 * @description
 * Applies to any attribute to signify that clicking on this element will display the associated dialog.
 *
 * @restrict A
 * @element ANY
 *
 * @param {string} uiDialogOpen the identifier of the dialog to be opened when clicking on this element.
 *
 * @example

 <doc:example>
    <doc:source>
        <ui-button size="large" ui-dialog-open="some-id">Click me</ui-button>
        <ui-dialog id="some-id" cancel-text="Cancel" close-text="Delete" close-action="clicked()" content="Are you sure you want to delete this project?">
 </ui-dialog>
    </doc:source>
 </doc:example>
 *
 */

// @ngInject
module.exports = function() {
    return {
        restrict: 'A',
        replace: true,
        link: function (scope, elem, attrs) {
            elem.bind('click', function() {
                scope.$broadcast('dialog-open', attrs.uiDialogOpen);
            });
        }
    };
};

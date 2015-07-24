'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiPopupClose
 *
 * @description
 * Applies to any attribute to signify that clicking on this element will close any open popups.  Should usually be used
 * within the body of a popup in order to close it.
 *
 * @restrict A
 * @element ANY
 *
 * @example

 <doc:example>
 <doc:source>
 <ui-button size="large" ui-popup-open="some-id">Click me</ui-button>
 <ui-popup id="some-id" placement="left">
 the text of my popup.
 <a href="somelink" ui-popup-close>clicking this link will close the popup</a>
 </ui-popup>
 </doc:source>
 </doc:example>
 *
 */

// @ngInject
module.exports = function () {
    return {
        restrict: 'A',
        replace: true,
        link: function (scope, elem) {
            elem.bind('click', function() {
                scope.$emit('popup-close');
            });
        }
    };
};

'use strict';

/**
 * @ngdoc directive
 * @name ui.elements:uiPopupOpen
 *
 * @description
 * Applies to any attribute to signify that clicking on this element will display the associated popup.
 *
 * @restrict A
 * @element ANY
 *
 * @param {string} uiPopupOpen the identifier of the popup to be opened when clicking on this element.
 *
 * @example

 <doc:example>
 <doc:source>
 <ui-button size="large" ui-popup-open="some-id">Click me</ui-button>
 <ui-popup id="some-id" placement="left">
 the text of my popup.
 </ui-popup>
 </doc:source>
 </doc:example>
 *
 */

// @ngInject
module.exports = function ($rootScope) {
    return {
        restrict: 'A',
        replace: true,
        link: function (scope, elem, attrs) {
            elem.bind('click', function () {
                $rootScope.$broadcast('popup-open', {
                    id: attrs.uiPopupOpen,
                    elem: elem
                });
            });
        }
    };
};

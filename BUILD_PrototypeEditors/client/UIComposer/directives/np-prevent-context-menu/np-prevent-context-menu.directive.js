'use strict';

var npPreventContextMenu = [function () {
    return {
        restrict: 'A',
        link: function (scope, element) {
            element.on('contextmenu', function (event) {
                event.preventDefault();
            });
        }
    };
}];

module.exports = npPreventContextMenu;

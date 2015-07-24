'use strict';

module.exports = angular.module('uiComposer.directives', [])
    .directive('npSvgIcon', require('./np-svg-icon/np-svg-icon.directive.js'))
    .directive('npPreventContextMenu', require('./np-prevent-context-menu/np-prevent-context-menu.directive.js'))
    .directive('npSelectDropdown', require('./np-select-dropdown/np-select-dropdown.directive.js'));

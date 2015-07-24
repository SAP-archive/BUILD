'use strict';

module.exports = angular.module('uiComposer.uiEditor.propertyPanel', [])
    .controller('PropertyPanelCtrl', require('./property-panel.controller.js'))
    .directive('npCanDropBinding', require('./directives/np-can-drop-binding/np-can-drop-binding.directive.js'))
    .directive('npBindingDropdown', require('./directives/np-binding-dropdown/np-binding-dropdown.directive.js'));



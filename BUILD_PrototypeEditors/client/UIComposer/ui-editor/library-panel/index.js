'use strict';

module.exports = angular.module('uiComposer.uiEditor.libraryPanel', [])
    .controller('LibraryPanelCtrl', require('./library-panel.controller.js'))
    .directive('npComponentLibraryItem', require('./directives/np-component-library-item/np-component-library-item.directive.js'))
    .directive('npPreviewImageOnHover', require('./directives/np-preview-image-on-hover/np-preview-image-on-hover.directive.js'))
    .factory('npAsset', require('./services/np-asset/np-asset.service.js'));

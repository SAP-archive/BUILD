'use strict';

require('norman-angular-ui-tree');

module.exports = angular.module('uiComposer.uiEditor.outlinePanel', ['ui.tree'])
    .controller('OutlinePanelCtrl', require('./outline-panel.controller.js'))
    .directive('npOutlineDropSupport', require('./directives/np-outline-drop-support/np-outline-drop-support.directive.js'))
    .directive('npDragOverHighlight', require('./directives/np-drag-over-highlight/np-drag-over-highlight.directive.js'));

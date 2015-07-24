'use strict';

require('norman-angular-ui-tree');

module.exports = angular.module('uiComposer.uiEditor.treePanel', ['ui.tree'])
    .controller('TreePanelCtrl', require('./tree-panel.controller.js'))
    .directive('npUiTreeHelper', require('./directives/np-ui-tree-helper/np-ui-tree-helper.directive.js'))
    .directive('npUiTreeModify', require('./directives/np-ui-tree-modify/np-ui-tree-modify.directive.js'))
    .factory('npTreeModel', require('./services/np-tree-model/np-tree-model.service.js'))
    .factory('npTreeNodeFactory', require('./services/np-tree-model/np-tree-node-factory.service.js'))
    .factory('npTreeSelect', require('./services/np-tree-select/np-tree-select.service.js'));

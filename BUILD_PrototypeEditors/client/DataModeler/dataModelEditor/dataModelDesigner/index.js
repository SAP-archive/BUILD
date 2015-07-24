'use strict';

module.exports = angular.module('dataModeler.designer', ['model'])
    .factory('jsPlumbService', require('./services/jsPlumbService.factory.js'))
    .controller('DataModelDesignerCtrl', require('./dataModelDesigner.controller.js'))

    .directive('dmdItem', require('./directives/dmdItem.directive.js'))
    .directive('dmdDraggable', require('./directives/dmdDraggable.directive.js'))
    .directive('dmdDesignerLayout', require('./directives/dmdDesignerLayout.directive.js'));

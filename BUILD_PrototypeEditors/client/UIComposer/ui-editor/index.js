'use strict';

require('./library-panel');
require('./tree-panel');
require('./outline-panel');
require('./property-panel');
require('./ui-canvas');

module.exports = angular.module('uiComposer.uiEditor', [
        'ui.router',
        'uiComposer.uiEditor.libraryPanel',
        'uiComposer.uiEditor.treePanel',
        'uiComposer.uiEditor.outlinePanel',
        'uiComposer.uiEditor.propertyPanel'
    ])
    .config(['$stateProvider',
        function uiEditorConfig($stateProvider) {
            // TODO: Add resolve to load the backend data automatically when the screen loads, within the state.
            $stateProvider
                .state('ui-composer-scaffolding', {
                    parent: 'prototype-editor',
                    abstract: true,
                    url: '/ui-composer/{currentScreen}',
                    templateUrl: 'resources/norman-prototype-editors-client/UIComposer/ui-editor/ui-editor.html',
                    controller: 'UiEditorCtrl',
                    controllerAs: 'uieditor',
                    authenticate: true,
                    resolve: require('./ui-editor.resolve.js')
                })
                .state('ui-composer', {
                    parent: 'ui-composer-scaffolding',
                    authenticate: true,
                    views: {
                        'tree-panel': {
                            templateUrl: 'resources/norman-prototype-editors-client/UIComposer/ui-editor/tree-panel/tree-panel.html',
                            controller: 'TreePanelCtrl',
                            controllerAs: 'tree'
                        },
                        'outline-panel': {
                            templateUrl: 'resources/norman-prototype-editors-client/UIComposer/ui-editor/outline-panel/outline-panel.html',
                            controller: 'OutlinePanelCtrl',
                            controllerAs: 'tree'
                        },
                        'library-panel': {
                            templateUrl: 'resources/norman-prototype-editors-client/UIComposer/ui-editor/library-panel/library-panel.html',
                            controller: 'LibraryPanelCtrl',
                            controllerAs: 'library'
                        },
                        'property-panel': {
                            templateUrl: 'resources/norman-prototype-editors-client/UIComposer/ui-editor/property-panel/property-panel.html',
                            controller: 'PropertyPanelCtrl',
                            controllerAs: 'propertyPanel'
                        },
                        'ui-canvas': {
                            templateUrl: 'resources/norman-prototype-editors-client/UIComposer/ui-editor/ui-canvas/ui-canvas.html',
                            controller: 'CanvasCtrl',
                            controllerAs: 'canvas'
                        }
                    }
                });
        }
    ])
    .controller('UiEditorCtrl', require('./ui-editor.controller.js'))
    .constant('npConstants', require('./ui-editor.constants.js'))
    .directive('npScale', require('./directives/np-scale/np-scale.directive.js'))
    .directive('npZoomHandler', require('./directives/np-zoom-handler/np-zoom-handler.directive.js'))
    .directive('npScrollableScale', require('./directives/np-scrollable-scale/np-scrollable-scale.directive.js'))
    .directive('npBusyIndicator', require('./directives/np-busy-indicator/np-busy-indicator.directive.js'))
    .factory('npScaleHelperService', require('./services/np-scale-helper-service/np-scale-helper-service.service.js'))
    .factory('npPropertyChangeHelper', require('./services/np-property-change-helper/np-property-change-helper.service.js'))
    .factory('npUiCatalog', require('./services/np-ui-catalog/np-ui-catalog.service.js'))
    .factory('npFormFactor', require('./services/np-form-factor/np-form-factor.service.js'))
    .factory('npZoomHelper', require('./services/np-zoom-helper/np-zoom-helper.service.js'))
    .factory('npDragHelper', require('./services/np-drag-helper/np-drag-helper.service.js'));

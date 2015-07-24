'use strict';

module.exports = angular.module('pageMapView', [
        'ui.router'
    ])
    .config(['$stateProvider',
        function pageMapConfig($stateProvider) {
            $stateProvider
                .state('page-map-view', {
                    parent: 'prototype-editor',
                    url: '/page-map-view',
                templateUrl: 'resources/norman-prototype-editors-client/UIComposer/page-map-view/page-map-view.html',
                    controller: 'PageMapCtrl',
                    controllerAs: 'map',
                    authenticate: true
                });
        }
    ])
    .controller('PageMapCtrl', require('./page-map-view.controller.js'))
    .directive('npPageItem', require('./directives/np-page-item/np-page-item.directive.js'))
    .directive('npPageEdge', require('./directives/np-page-edge/np-page-edge.directive.js'))
    .directive('npAddPageTile', require('./directives/np-add-page-tile/np-add-page-tile.directive.js'))
    .factory('npJsPlumb', require('./services/np-js-plumb/np-js-plumb.service.js'))
    .factory('npPageMapLayout', require('./services/np-page-map-layout/np-page-map-layout.service.js'));

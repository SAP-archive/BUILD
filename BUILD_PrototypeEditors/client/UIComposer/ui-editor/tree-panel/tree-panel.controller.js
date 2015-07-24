'use strict';

var _ = require('norman-client-tp').lodash;

module.exports = ['$scope', 'npPrototype', 'npUiCanvasAPI', 'npTreeModel', 'npTreeSelect', 'npPageMetadata', 'npMessaging', 'npConstants', 'npKeyboarder',
    function ($scope, npPrototype, npUiCanvasAPI, npTreeModel, npTreeSelect, npPageMetadata, npMessaging, npConstants, npKeyboarder) {
        var that = this;

        that.nodes = [];

        var refreshTree = function () {
            npTreeModel.refreshModel()
                .then(function (nodes) {
                    that.nodes = nodes;
                    $scope.$broadcast('expandSelectedNodes');
                });
        };
        refreshTree();

        $scope.$on('gridRefreshed', refreshTree);
        $scope.$on('npGrid/elementsMoved', $scope.$broadcast.bind($scope, 'expandSelectedNodes'));

        var keyboardListeners = [],
            selectNode = function (which, event) {
                event.preventDefault();
                if (which === 'next') {
                    npTreeSelect.selectNextNode();
                }
                else {
                    npTreeSelect.selectPreviousNode();
                }
            };
        keyboardListeners.push(npKeyboarder.on(npConstants.keymap.ArrowUp, selectNode.bind(this, 'previous')));
        keyboardListeners.push(npKeyboarder.on(npConstants.keymap.ArrowLeft, selectNode.bind(this, 'previous')));
        keyboardListeners.push(npKeyboarder.on(npConstants.keymap.ArrowDown, selectNode.bind(this, 'next')));
        keyboardListeners.push(npKeyboarder.on(npConstants.keymap.ArrowRight, selectNode.bind(this, 'next')));

        that.createPage = function () {
            npMessaging.showBusyIndicator();
            return npPageMetadata.flushUpdates()
                .then(function () {
                    return npPrototype.createPages(1);
                })
                .then(npUiCanvasAPI.reload)
                .then(npPrototype.getPages)
                .then(function (pages) {
                    npPageMetadata.setCurrentPageName(_.last(pages).name);
                })
                .catch(function (error) {
                    npMessaging.showError('Error: failed to create new page', error);
                });
        };

        $scope.$on('$destroy', function cleanup() {
            _.forEach(keyboardListeners, function (listener) {
                npKeyboarder.off(listener);
            });
        });
    }
];

'use strict';

var _ = require('norman-client-tp').lodash;

module.exports = ['$scope', 'npPrototype', 'npUiCanvasAPI', 'npTreeModel', 'npTreeSelect', 'npPageMetadata', 'npMessaging', 'npConstants', 'npKeyboarder',
    function ($scope, npPrototype, npUiCanvasAPI, npTreeModel, npTreeSelect, npPageMetadata, npMessaging, npConstants, npKeyboarder) {
        var that = this;

        that.nodes = [];

        that.removeControl = function (node) {
            npPageMetadata.deleteControl(node.data.controlMd.controlId);
        };

        $scope.isDraggingOver = false;

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

        $scope.$on('$destroy', function cleanup() {
            _.forEach(keyboardListeners, function (listener) {
                npKeyboarder.off(listener);
            });
        });

        var hasChild = function (node) {
            var noChild = true;
            if (node && node.children && node.children.length > 0) {
                _.forEach(node.children, function (descendant) {
                    if (descendant.type !== 'group') {
                        noChild = false;
                    }
                    else {
                        noChild = !hasChild(descendant);
                    }
                    return noChild;
                });
            }
            return !noChild;
        };

        that.hasChild = hasChild;
    }
];

'use strict';

var _ = require('norman-client-tp').lodash;

/**
 * @namespace npTreeSelect
 */
var npTreeSelect = ['npTreeModel', 'npGrid',
    function (npTreeModel, npGrid) {

        /**
         * @private
         * @description Select the next or previous node relative to the currently selected one. If multiple nodes are selected this will not do anything.
         * @param {string} which
         */
        var selectNode = function (which) {
            var treeNodes = npTreeModel.getNodes(),
                selectedElements = npGrid.getSelectedElements();
            if (selectedElements.length === 1) {
                var selectedNode = npTreeModel.findNodesByData(treeNodes, selectedElements)[0],
                    flattenedNodes = flattenDepthFirst(treeNodes, selectedNode),
                    iSelectedNode = _.findIndex(flattenedNodes, selectedNode),
                    nodeToSelect = which === 'next' ? flattenedNodes[iSelectedNode + 1] : flattenedNodes[iSelectedNode - 1];
                if (nodeToSelect) {
                    nodeToSelect.select();
                }
            }
        };

        /**
         * @name selectPreviousNode
         * @memberof npTreeSelect
         * @description Select the previous selectable node.
         */
        var selectPreviousNode = selectNode.bind(this, 'previous');

        /**
         * @name selectNextNode
         * @memberof npTreeSelect
         * @description Select the next selectable node.
         */
        var selectNextNode = selectNode.bind(this, 'next');

        /**
         * @private
         * @param {TreeNode[]} nodes
         * @param {TreeNode} expandedRootChild
         * @description Flatten tree nodes depth first. Will flatten the tree in its current expanded state.
         */
        var flattenDepthFirst = function (nodes, currentlySelectedNode) {
            var expandedRootChild = findExpandedRootChildNode(currentlySelectedNode) || {};
            return flattenRecursive(nodes, expandedRootChild);
        };

        /**
         * @private
         * @param {TreeNode} currentlySelectedNode
         * @returns {TreeNode} The root child node that currentlySelectedNode is a child of. Undefined if a page node is selected.
         */
        var findExpandedRootChildNode = function (currentlySelectedNode) {
            var parentNode = currentlySelectedNode;

            while (parentNode) {
                if (parentNode.type === 'gridElement' && parentNode.data.isRootChild()) {
                    return parentNode;
                }
                parentNode = npTreeModel.getNode(parentNode.parentNodeId);
            }
        };

        /**
         * @private
         * @param {TreeNode[]} nodes
         * @param {TreeNode} expandedRootChild
         * @returns {TreeNode[]} Nodes flattened into array with all non-selectable nodes removed. Will only explore children of currently expanded nodes.
         */
        var flattenRecursive = function (nodes, expandedRootChild) {
            var flattened = [];
            _.forEach(nodes, function (node) {
                if (node.type === 'page' || node.type === 'gridElement') {
                    flattened.push(node);
                }
                if (_.size(node.children)) {
                    if (!(node.type === 'gridElement' && node.data.isRootChild() && node.data !== expandedRootChild.data)) {
                        flattened = flattened.concat(flattenRecursive(node.children, expandedRootChild));
                    }
                }

            });
            return flattened;
        };


        return {
            selectPreviousNode: selectPreviousNode,
            selectNextNode: selectNextNode
        };
    }
];

module.exports = npTreeSelect;

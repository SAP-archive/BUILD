'use strict';

var _ = require('norman-client-tp').lodash;

var npUiTreeHelper = ['$document', 'npTreeModel', 'npGrid',
    function ($document, npTreeModel, npGrid) {
        return {
            restrict: 'A',
            link: function (scope, element) {
                var treeScrollTransition = 'all .5s ease';

                /**
                 * @description Expand nodes according to new selection and close all others, then scroll to last selected node if necessary.
                 */
                var expandSelectedNodes = _.debounce(function () {
                    var expandedNodeScopes = findExpandedNodeScopes(),
                        selectedGridElements = npGrid.getSelectedElements(),
                        nodesToExpand = npTreeModel.findNodesByData(scope.tree.nodes, selectedGridElements);

                    var newExpandedNodeScopes = [];
                    _.forEach(nodesToExpand, function (node) {
                        newExpandedNodeScopes = newExpandedNodeScopes.concat(expandNode(node));
                    });

                    var nodeScopesToCollapse = _.difference(expandedNodeScopes, newExpandedNodeScopes);
                    _.forEach(nodeScopesToCollapse, function (nodeScope) {
                        nodeScope.collapse();
                    });

                    // defer scroll to let expands/collapses finish first
                    if (_.size(nodesToExpand)) {
                        _.defer(scrollToNode, _.last(nodesToExpand));
                    }
                }, 20);

                /**
                 * @description Traverse the tree and find the scopes of all currently open nodes.
                 * @returns {NodeScope[]} Node scopes of all expanded nodes.
                 */
                var findExpandedNodeScopes = function () {
                    var treeScope = element.scope();
                    if (treeScope) {
                        var traverseDeep = function (nodeScopes, expandedScopes) {
                            _.forEach(nodeScopes, function (nodeScope) {
                                if (!nodeScope.collapsed) {
                                    expandedScopes.push(nodeScope);
                                    traverseDeep(nodeScope.childNodes(), expandedScopes);
                                }
                            });
                        };
                        var expandedNodeScopes = [],
                            rootNodeScopes = treeScope.$nodesScope.childNodes();
                        traverseDeep(rootNodeScopes, expandedNodeScopes);
                        return expandedNodeScopes;
                    }
                };

                /**
                 * @param {TreeNode} node
                 * @returns {object} The DOM node associated with node if found, else undefined.
                 */
                var getDomNode = function (node) {
                    var querySelector = '[tree-node-id = \'' + node.nodeId + '\']';
                    return element[0].querySelector(querySelector);
                };

                /**
                 * @description Expand a node and all its parent nodes. Since ng-if is used to hide childnodes we need to digest the scope of each node
                 * after expanding it before we can continue expanding that node's child nodes.
                 * This function is relatively slow for controls with nested aggregations since the DOM nodes of the tree are created on the fly.
                 * E.g. rightclick selecting attribute in a list.
                 * TODO: see if this can be optimized (without introducing a large amount of new bindings, ng-hide is not an option for tree).
                 *
                 * @param {TreeNode} node The node to expand.
                 * @returns {NodeScope[]} Node scopes of all nodes that were expanded in the process.
                 */
                var expandNode = function (node) {
                    var expandedNodes = [];
                    var nodesToExpand = [node],
                        itr = node;
                    while (npTreeModel.getNode(itr.parentNodeId)) {
                        itr = npTreeModel.getNode(itr.parentNodeId);
                        nodesToExpand.unshift(itr);
                    }
                    _.forEach(nodesToExpand, function (n) {
                        var domNode = getDomNode(n),
                            nodeScope = angular.element(domNode).scope();
                        if (nodeScope) {
                            nodeScope.expand();
                            expandedNodes.push(nodeScope);
                            nodeScope.$digest();
                            _.forEach(nodeScope.childNodes(), function (child) {
                                if (child.$modelValue.type === 'group') {
                                    child.expand();
                                    expandedNodes.push(child);
                                }
                            });
                        }
                    });
                    return expandedNodes;
                };

                /**
                 * @description Scroll a certain node into view. If the node is already completely visible this will not do anything.
                 * @param {TreeNode} node
                 */
                var scrollToNode = function (node) {
                    var scrollContainer = element[0],
                        $rootNodes = angular.element($document[0].getElementById('np-e-tree-root-nodes')),
                        domNode = getDomNode(node);

                    if (!domNode) {
                        return;
                    }

                    var maxScrollTop = scrollContainer.scrollHeight - scrollContainer.clientHeight,
                        nodeOffset = domNode.offsetTop,
                        currentScrollTop = scrollContainer.scrollTop;

                    var newScrollTop;
                    if (nodeOffset + domNode.clientHeight - currentScrollTop > scrollContainer.clientHeight) {
                        newScrollTop = domNode.offsetTop;
                    }
                    if (newScrollTop > domNode.offsetTop || currentScrollTop > domNode.offsetTop) {
                        newScrollTop = domNode.offsetTop;
                    }

                    if (newScrollTop) {
                        if (newScrollTop > maxScrollTop) {
                            newScrollTop = maxScrollTop;
                        }
                        performScroll(scrollContainer, $rootNodes, newScrollTop);
                    }
                };

                /**
                 * @description Perform the scroll action by setting the new scroll top values and using the css translateY property to animate the scroll.
                 */
                var performScroll = function (scrollContainer, $rootNodes, newScrollTop) {
                    var scrollDiff = newScrollTop - scrollContainer.scrollTop;
                    scrollContainer.scrollTop = newScrollTop;
                    $rootNodes.css('transform', 'translateY(' + scrollDiff + 'px)');

                    // give the browser time to render previous state
                    _.delay(function () {
                        $rootNodes.css({
                            transition: treeScrollTransition,
                            transform: 'translateY(0px)'
                        });
                    }, 1);

                    _.delay(function () {
                        $rootNodes.css({
                            transition: '',
                            transform: ''
                        });
                    }, 600);
                };

                scope.$on('expandSelectedNodes', expandSelectedNodes);
                scope.$on('selectionChanged', expandSelectedNodes);
            }
        };
    }
];

module.exports = npUiTreeHelper;

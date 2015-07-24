'use strict';

var _ = require('norman-client-tp').lodash;

/**
 * @namespace npTreeModel
 */
var npTreeModel = ['$rootScope', '$log', 'npUiCatalog', 'npLayoutHelper', 'npGrid', 'npPrototype', 'npPageMetadata', 'npTreeNodeFactory',
    function ($rootScope, $log, npUiCatalog, npLayoutHelper, npGrid, npPrototype, npPageMetadata, nodeFactory) {
        var _nodes = [],
            _nodeLookup = {};

        /**
         * @name getNodes
         * @memberof npTreeModel
         *
         * @returns {TreeNode[]} Root tree nodes (pages).
         */
        var getNodes = function () {
            return _nodes;
        };

        /**
         * @name getNode
         * @memberof npTreeModel
         *
         * @param {string} nodeId
         * @returns {TreeNode}
         */
        var getNode = function (nodeId) {
            return _nodeLookup[nodeId];
        };

        /**
         * @name findNodesByData
         * @memberof npTreeModel
         * @description Find tree nodes by data.
         *
         * @param {TreeNode[]} nodes The nodes to start searching on. Will search nodes and all their child nodes.
         * @param {object[]} data The data for which nodes should be returned.
         * @returns {TreeNode[]}
         */
        var findNodesByData = function (nodes, data) {
            var foundNodes = [];
            _.forEach(nodes, function (node) {
                if (_.contains(data, node.data)) {
                    foundNodes.push(node);
                }
                if (node.children.length) {
                    var foundChildren = findNodesByData(node.children, data);
                    foundNodes = foundNodes.concat(foundChildren);
                }
            });
            return foundNodes;
        };

        /**
         * @name refreshModel
         * @memberof npTreeModel
         * @description Refresh the tree model by retrieving all pages and the current grid elements and creating tree nodes for them.
         *
         * @returns {Promise} Promise that is resolved with the root tree nodes when refresh is done.
         */
        var refreshModel = function () {
            return npPrototype.getPages()
                .then(function (pages) {
                    var currentPageName = npPageMetadata.getCurrentPageName(),
                        gridRoot = npGrid.getRootElement();

                    if (currentPageName && gridRoot) {
                        var currentPageIndex = _.findIndex(pages, {
                            name: currentPageName
                        });
                        _nodes = generateNodes(pages, currentPageIndex, gridRoot);
                        updateNodeLookup(_nodes);
                    }
                    return _nodes;
                });
        };

        /**
         * @private
         * @description Generate the tree's nodes based on the prototype's pages and the current grid elements for the selected page.
         *
         * @param {object[]} pages
         * @param {number} currentPageIndex
         * @returns {TreeNode[]}
         */
        var generateNodes = function (pages, currentPageIndex, gridRoot) {
            var nextPageIndexToBeSelected = 0,
                pageNodes = _.map(pages, function (page) {
                    return nodeFactory.createNode({
                        type: 'page',
                        data: page,
                        level: 0
                    });
                }),
                gridRootNode = nodeFactory.createNode({
                    type: 'gridElement',
                    data: gridRoot,
                    level: 0
                });
            addChildInformation(gridRootNode);

            if (pages.length > 1 && currentPageIndex > 0) {
                nextPageIndexToBeSelected = currentPageIndex - 1;
            }
            else if (pages.length > 1 && currentPageIndex === 0) {
                nextPageIndexToBeSelected = currentPageIndex + 1;
            }

            var currentPageNode = pageNodes.splice(currentPageIndex, 1, gridRootNode)[0];
            pageNodes[currentPageIndex].nextPageToBeSelected = pageNodes[nextPageIndexToBeSelected].data.name;
            pageNodes[currentPageIndex].displayName = currentPageNode.displayName;
            pageNodes[currentPageIndex].pageName = currentPageNode.data.name;
            pageNodes[currentPageIndex].pageIncomingNavigations = currentPageNode.data.incomingNavigations;

            return pageNodes;
        };

        /**
         * @private
         * @description Add child information to a tree node of type 'gridElement'. Will retrieve the elements groups from the catalog,
         * create nodes for all available groups and insert the node's children into the correct groups.
         *
         * @param {TreeNode} gridElementNode
         */
        var addChildInformation = function (gridElementNode) {
            if (_.isUndefined(gridElementNode) || gridElementNode.type !== 'gridElement') {
                $log.error(
                    'npTreeModel: addChildInformation called with incorrect node type. Supported node type is \'gridElement\'. Called with: ',
                    gridElementNode.type);
                return;
            }

            var gridElement = gridElementNode.data,
                groupNodes = createGroupNodes(gridElementNode);

            _.forEach(gridElement.children, function (childElem) {
                var parentGroupNode = groupNodes[childElem.controlMd.parentGroupId];
                createGridElementNode(childElem, parentGroupNode);
            });
        };

        /**
         * @private
         * @description
         * Create all group nodes for a control's aggregations that should be shown to the user.
         *
         * @param {TreeNode} gridElementNode
         * @returns {object} Object hash with group name - group node mapping.
         */
        var createGroupNodes = function (gridElementNode) {
            var controlMd = gridElementNode.data.controlMd,
                groups = npUiCatalog.getControlAggregations(controlMd.catalogControlName, controlMd.catalogId, true),
                groupNodes = {};

            _.forEach(groups, function (group) {
                groupNodes[group.name] = nodeFactory.createNode({
                    type: 'group',
                    data: group,
                    level: gridElementNode.level + 1
                }, gridElementNode);
            });

            return groupNodes;
        };

        /**
         * @private
         * @description
         * Create a new grid element node by creating the node itself, inserting it into its parent group node,
         * adjusting its index for the current layout and adding all its child information
         *
         * @param {GridElement} gridElement
         * @param {TreeNode} parentGroupNode
         */
        var createGridElementNode = function (gridElement, parentGroupNode) {
            if (_.isUndefined(gridElement) || _.isUndefined(parentGroupNode)) {
                $log.error('createGridElementNode failed - necessary arguments not supplied');
                return;
            }
            var index = adjustIndexForLayout(parentGroupNode, gridElement.controlMd.parentGroupIndex).index,
                childNode = nodeFactory.createNode({
                    type: 'gridElement',
                    data: gridElement,
                    level: parentGroupNode.level
                }, parentGroupNode, index);
            addChildInformation(childNode);
        };

        /**
         * @private
         * @description Recursively traverse nodes and index them by id. Will update _nodeLookup.
         *
         * @param {TreeNode[]} newNodes The nodes to traverse.
         */
        var updateNodeLookup = function (newNodes) {
            var createNodeIndex = function (nodes, index) {
                _.forEach(nodes, function (node) {
                    index[node.nodeId] = node;
                    createNodeIndex(node.children, index);
                });
            };
            _nodeLookup = {};
            createNodeIndex(newNodes, _nodeLookup);
        };

        /**
         * @private
         * @description Adjusts the index according to the layout. In case of the absolute layout the content group's children should be reversed.
         * Angular-ui-tree does not support the orderBy filter so the tree nodes itself need to be rearranged.
         *
         * @param {TreeNode} parentNode
         * @param {number} index
         * @returns {object}
         */
        var adjustIndexForLayout = function (parentNode, index) {
            var adjusted = false;
            if (npLayoutHelper.isAbsoluteLayout()) {
                if (parentNode.type === 'group' && parentNode.data.name === 'content') {
                    index = parentNode.children.length - index;
                    adjusted = true;
                }
            }
            return {
                index: index,
                adjusted: adjusted
            };
        };

        /**
         * @private
         * @param {GridElement} gridElement
         * @returns {TreeNode} The group node in which gridElement's node should be inserted.
         */
        var getParentGroupNode = function (gridElement) {
            var parentGridElemNode = _.find(_nodeLookup, function (node) {
                    return node.type === 'gridElement' && node.data.elementId === gridElement.parentId;
                }),
                parentGroupNode = _.find(parentGridElemNode.children, function (groupNode) {
                    return groupNode.data.name === gridElement.controlMd.parentGroupId;
                });
            return parentGroupNode;
        };

        /**
         * @private
         * @description Add new tree elements for newly created grid elements.
         */
        var addNodesByGridElements = function (event, addedGridElements) {
            _.forEach(addedGridElements, function (gridElement) {
                var parentGroupNode = getParentGroupNode(gridElement);
                createGridElementNode(gridElement, parentGroupNode);
            });
            updateNodeLookup(_nodes);
        };

        /**
         * @private
         * @description Remove tree elements for all removed grid elements.
         */
        var removeNodesByGridElements = function (event, removedGridElements) {
            var nodesToRemove = findNodesByData(getNodes(), removedGridElements);
            _.forEach(nodesToRemove, function (node) {
                var parentNode = _nodeLookup[node.parentNodeId],
                    parentIndex = _.findIndex(parentNode.children, node);
                parentNode.children.splice(parentIndex, 1);
            });
            updateNodeLookup(_nodes);
        };

        /**
         * @private
         * @description Rearrange tree elements whenever grid elements are moved. We may have to change element's parent nodes or index.
         */
        var moveNodesByGridElements = function (event, movedGridElements) {
            var associatedNodes = findNodesByData(getNodes(), movedGridElements);

            _.forEach(associatedNodes, function (node) {
                var oldParent = getNode(node.parentNodeId),
                    newParent = getParentGroupNode(node.data);
                if (oldParent === newParent) {
                    var oldIndex = _.findIndex(oldParent.children, node),
                        adjustedIndex = adjustIndexForLayout(newParent, node.data.controlMd.parentGroupIndex),
                        newIndex = adjustedIndex.adjusted ? adjustedIndex.index - 1 : adjustedIndex.index;
                    if (oldIndex === newIndex) {
                        return;
                    }
                }
                removeNodesByGridElements(event, movedGridElements);
                addNodesByGridElements(event, movedGridElements);
            });
        };

        /**
         * @private
         * @description Update the controlNotVisible property for all updated grid element nodes.
         */
        var updateCanvasVisibility = function (event, updatedElements) {
            var nodesToUpdate = findNodesByData(getNodes(), updatedElements);
            _.forEach(nodesToUpdate, function (node) {
                node.controlNotVisible = node.data.domRef().length < 1;
            });
        };

        $rootScope.$on('npGrid/elementsAdded', addNodesByGridElements);
        $rootScope.$on('npGrid/elementsRemoved', removeNodesByGridElements);
        $rootScope.$on('npGrid/elementsMoved', moveNodesByGridElements);
        $rootScope.$on('npGrid/layoutUpdated', updateCanvasVisibility);

        return {
            getNodes: getNodes,
            getNode: getNode,
            findNodesByData: findNodesByData,
            refreshModel: refreshModel
        };
    }
];

module.exports = npTreeModel;

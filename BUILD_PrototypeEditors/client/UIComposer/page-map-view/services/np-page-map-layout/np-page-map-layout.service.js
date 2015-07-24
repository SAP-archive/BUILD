'use strict';

var _ = require('norman-client-tp').lodash;
var d3 = require('norman-client-tp').d3;

var npPageMapLayout = ['npPrototype', '$location', '$anchorScroll', '$rootScope', '$document',
    function (npPrototype, $location, $anchorScroll, $rootScope, $document) {
        var self = {},
            elementHeight = 180, elementWidth = 220, gridTop = -1, gridLeft = -1;
        /**
         * @private
         * @description Prototype of each page
         */
        var pageNode = {
            id: '-1',
            displayName: '',
            name: null,
            thumbnailUrl: '',
            isConnected: false
        };

        /**
         * @private
         * @description Prototype of each edge
         */
        var links = {
            id: '-1',
            pageFrom: null,
            pageTo: null
        };

        var _createEdges = function (edges) {
            return _.map(edges, function (edge) {
                var node = Object.create(links);
                _.extend(node, {
                    pageFrom: edge.pageFrom,
                    pageTo: edge.pageTo,
                    id: edge._id
                });
                return node;
            });
        };

        var _createPageNodes = function (pages) {
            return _.map(pages, function (page, index) {
                var node = Object.create(pageNode);
                _.extend(node, {
                    displayName: page.displayName,
                    name: page.name,
                    id: page.id,
                    thumbnailUrl: page.thumbnailUrl,
                    position: {}
                });
                if (index === 0) {
                    node.isHome = true;
                }
                return node;
            });
        };

        var getContainerWidth = function () {
            var pageMap = $document[0].querySelector('.np-p-page-map-container');
            if (pageMap) {
                return angular.element(pageMap)[0].offsetWidth;
            }
        };

        /**
         * @name getGridLayout
         * @memberof npPageMapLayout
         * @description Sets the initial position of pages in a grid layout.
         * @param {Array} returns array of pages with position object having top left properties
         */

        self.getGridLayout = function (pageNodes) {
            if (_.isEmpty(pageNodes)) {
                return;
            }
            var grid = $document[0].getElementById('np-p-page-map-grid');
            gridTop = -1;
            gridLeft = -1;
            var positions = {
                top: '0px',
                left: '0px'
            };
            _.forEach(pageNodes, function (page) {
                positions = _getPositionsForNewPage();
                page.position = {
                    top: positions.top + 'px',
                    left: positions.left + 'px'
                };
            });
            if (grid) {
                grid.style.height = positions.top + elementHeight + 'px';
            }
            return pageNodes;
        };

        /**
         * @private
         * @name getPositionsForNewPage
         * @memberof npPageMapLayout
         * @description gets the position for the new page
         * @param {Array} pages array
         * @returns {Object} position object having top left properties of the new page
         */
        var _getPositionsForNewPage = function () {
            var containerWidth = getContainerWidth();
            if (gridLeft < 0 && gridTop < 0) {
                gridTop = 20;
                gridLeft = 20;
            }
            else {
                if (gridLeft + (2 * elementWidth) < containerWidth) {
                    gridLeft = gridLeft + elementWidth;
                }
                else {
                    gridLeft = 20;
                    gridTop = gridTop + elementHeight;
                }
            }
            return {
                left: gridLeft,
                top: gridTop
            };
        };


        /**
         * @name applyFirstOccurenceRuleOnLinks
         * @memberof npPageMapLayout
         * @description filters the links according to the first pages
         * @param {Array} prototypes pages array
         * @param {Array} edges array
         * @param {Boolean} is smart app
         * @returns {Object} Object of filtered first occurence links, connected pages array, unconnected pages array
         **/
        self.applyFirstOccurenceRuleOnLinks = function (prototypes, edges, isSmartApp) {
            var newEdges = [], newPages = [], pagesWithOutgoingLinks = [], connectedPageTo, connectedPages = [];
            var pages = _createPageNodes(prototypes);

            _.forEach(pages, function (page) {
                var edgesFromCurrentPage = _.filter(edges, {pageFrom: page.name});
                if (edgesFromCurrentPage.length) {
                    if (page.depth === undefined) {
                        page.depth = 0;
                    }
                    pagesWithOutgoingLinks.push(page);

                    _.forEach(edgesFromCurrentPage, function (edge) {
                        var edgeToPageName = edge.pageTo;
                        var indexOfEdgeTo = _.indexOf(newPages, edgeToPageName);
                        if (isSmartApp) {
                            connectedPageTo = _.filter(pages, {name: edgeToPageName})[0];
                            connectedPageTo.isConnected = true;
                            connectedPageTo.depth = page.depth + 1;
                            newEdges.push(edge);
                            newPages.push(edgeToPageName);
                            connectedPages.push(connectedPageTo);
                        }
                        else {
                            if (indexOfEdgeTo < 0) {
                                connectedPageTo = _.filter(pages, {name: edgeToPageName})[0];
                                connectedPageTo.isConnected = true;
                                if (connectedPageTo.depth === undefined) {
                                    if (page.depth !== undefined) {
                                        connectedPageTo.depth = page.depth + 1;
                                        // only add links to pages which are not root nodes
                                        newEdges.push(edge);
                                    }
                                    else {
                                        connectedPageTo.depth = 0;
                                    }
                                }
                                newPages.push(edgeToPageName);
                                connectedPages.push(connectedPageTo);
                            }
                        }
                    });
                }

            });

            // pagesWithOutgoingLinks gets all the pages even if the page only has outgoing links, where as connectedPages
            // at this point only has pages which have incoming links
            connectedPages = _.union(pagesWithOutgoingLinks, connectedPages);

            return {
                edges: newEdges,
                connectedPages: connectedPages,
                unConnectedPages: _.difference(pages, connectedPages)
            };
        };


        /**
         * @name _getGroupedData
         * @memberof npPageMapLayout
         * @description groups the data in a hierarchical order
         * @param {Array} rootNodes pages array with highest parents
         *  @param {Array} edges first occurence edges array
         * @returns {Array} treeData array which is hierarchical
         **/
        var _getGroupedData = function (rootNodes, edges) {
            var nodeName = null;
            var treeData = [];

            _.forEach(rootNodes, function (root) {
                // Add links connecting null to the parent nodes
                edges.push({
                    id: 'page' + root.name,
                    pageFrom: nodeName,
                    pageTo: root.name,
                    target: 'pages'
                });
            });

            var dataMap = edges.reduce(function (map, node) {
                map[node.pageTo] = node;
                return map;
            }, {});

            _.forEach(edges, function (node) {
                var parent = dataMap[node.pageFrom];
                if (parent) {
                    (parent.children || (parent.children = [])).push(node);
                }
                else {
                    treeData.push(node);
                }
            });
            return treeData;
        };

        /**
         * @name createLayout
         * @memberof npPageMapLayout
         * @description creates d3 tree layout for all the connected nodes
         * @param {Array} nodes connected pages array
         *  @param {Array} edges first occurence edges array
         * @returns {Array} nodes connected pages with layout information as positions
         **/
        self.createLayout = function (nodes, edges) {
            var layout = $document[0].getElementById('np-p-page-map-layout');

            var rootNodes = _.filter(nodes, {depth: 0});
            var newEdges = _createEdges(edges);
            var groupedData = _getGroupedData(rootNodes, newEdges);
            var prevHeight = 0;
            _.forEach(groupedData, function (data) {
                var tree = d3.layout.tree().nodeSize([elementHeight, elementWidth]);
                var treeNodes = tree.nodes(data);
                var HeightValues = _findHeight(treeNodes);
                var height = HeightValues.height;

                _.forEach(treeNodes, function (treeNode) {
                    var currentNode = _.filter(nodes, {name: treeNode.pageTo});
                    var position = currentNode[0].position;
                    if (!position.top && !position.left) {
                        var topX = height + prevHeight + treeNode.x;
                        if (topX > 0) {
                            position.top = topX + 'px';
                        }
                        else {
                            position.top = '0px';
                        }
                        position.left = treeNode.y + 'px';
                    }

                });
                prevHeight = prevHeight + elementHeight + height + HeightValues.offset;
            });

            if (layout) {
                layout.style.height = prevHeight + 'px';
            }
            return nodes;
        };

        /**
         * @name _findHeight
         * @memberof npPageMapLayout
         * @description finds the height of the layout and also offset between layouts
         * @param {Array} nodes connected pages array
         * @returns {Object} height of the layout and also offset between layouts
         **/
        var _findHeight = function (nodes) {
            var height = 0, offset = 0;
            if (nodes) {
                _.forEach(nodes, function (node) {
                    var nodeX = Math.abs(node.x), nodeXOffset = node.x;
                    if (nodeX > height) {
                        height = nodeX;
                    }
                    if (nodeXOffset > offset) {
                        offset = nodeXOffset;
                    }
                });
            }
            return {
                height: height,
                offset: offset
            };
        };

        return self;
    }
];
module.exports = npPageMapLayout;

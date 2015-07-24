'use strict';
(function () {

    var expect = chai.expect,
        _ = window._;

    /*
     * Mocked base structure used for all tests:
     * page1 - page node
     *   content - group node
     *     list1 - gridElement node
     *       items - group node
     *         listItem1 - gridElement node
     *           attributes - group node
     *             attribute1 - gridElement node
     *         listItem2 - gridElement node
     *     button1 - gridElement node
     * page2 - page node
     *
     *
     *
     */
    describe('Service: np-tree-model', function () {
        var $rootScope, $q, treeModel,
            npUiCatalogMock, npLayoutHelperMock, npGridMock, npPageMetadataMock, npPrototypeMock, npTreeNodeFactoryMock,
            createGridElement;

        beforeEach(module('uiComposer.uiEditor.treePanel'));

        beforeEach(function () {
            npPrototypeMock = {
                _pages: [{
                    name: 'S0',
                    displayName: 'Page 1'
                }, {
                    name: 'S1',
                    displayName: 'Page 2'
                }],
                getPages: function () {
                    return $q.when(this._pages);
                }
            };

            npPageMetadataMock = {
                _currentPageName: 'S0',
                getCurrentPageName: function () {
                    return this._currentPageName;
                }
            };

            createGridElement = function (elementId, parent, parentGroupId, parentGroupIndex) {
                var elem = {
                    elementId: elementId,
                    controlMd: {
                        catalogControlName: elementId.replace(/\d/g, ''), // strip any number chars
                        parentGroupId: parentGroupId,
                        parentGroupIndex: parentGroupIndex
                    },
                    children: []
                };
                if (parent) {
                    elem.parentId = parent.elementId;
                    parent.children.push(elem);
                }
                return elem;
            };

            var gridRoot = createGridElement('page1'),
                list1 = createGridElement('list1', gridRoot, 'content', 0),
                listItem1 = createGridElement('listItem1', list1, 'items', 0),
                attribute1 = createGridElement('attribute1', listItem1, 'attributes', 0),
                listItem2 = createGridElement('listItem2', list1, 'items', 1),
                button1 = createGridElement('button1', gridRoot, 'content', 1);

            npGridMock = {
                _gridRoot: gridRoot,
                _list1: list1,
                _listItem1: listItem1,
                _attribute1: attribute1,
                _listItem2: listItem2,
                _button1: button1,
                getRootElement: function () {
                    return this._gridRoot;
                }
            };

            npUiCatalogMock = {
                getControlAggregations: function (controlName) {
                    switch (controlName) {
                        case 'page':
                            return [{
                                name: 'content',
                                displayToUser: true
                            }];
                        case 'list':
                            return [{
                                name: 'items',
                                displayToUser: true
                            }];
                        case 'listItem':
                            return [{
                                name: 'attributes',
                                displayToUser: true
                            }];
                    }
                    return [];
                }
            };

            npTreeNodeFactoryMock = {
                _nextId: 0,
                createNode: function (options, parent, parentIndex) {
                    var node = {};
                    _.extend(node, options);
                    node.nodeId = this._nextId++;
                    node.displayName = options.data.displayName;
                    node.children = [];
                    if (parent) {
                        node.parentNodeId = parent.nodeId;
                        parentIndex = _.isNumber(parentIndex) ? parentIndex : parent.children.length;
                        parent.children.splice(parentIndex, 0, node);
                    }
                    return node;
                }
            };

            npLayoutHelperMock = {
                isAbsoluteLayout: function () {
                    return false;
                }
            };

            module(function ($provide) {
                $provide.value('npUiCatalog', npUiCatalogMock);
                $provide.value('npLayoutHelper', npLayoutHelperMock);
                $provide.value('npGrid', npGridMock);
                $provide.value('npPageMetadata', npPageMetadataMock);
                $provide.value('npPrototype', npPrototypeMock);
                $provide.value('npTreeNodeFactory', npTreeNodeFactoryMock);
            });

            inject(function ($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                treeModel = $injector.get('npTreeModel');
            });
        });

        describe('retrieving nodes:', function () {
            it('should return the current root nodes', function () {
                var refreshPromise = treeModel.refreshModel();
                refreshPromise.then(function (nodes) {
                    var nodesByGet = treeModel.getNodes();
                    expect(nodes).to.be.equal(nodesByGet);
                });
                $rootScope.$apply();
            });

            it('should return nodes by id', function () {
                var refreshPromise = treeModel.refreshModel();
                refreshPromise.then(function (nodes) {
                    var node1 = treeModel.getNode(nodes[0].nodeId);
                    expect(node1).to.be.equal(nodes[0]);
                });
                $rootScope.$apply();
            });

            it('should find nodes by their data references (check for multiple nodes)', function () {
                var refreshPromise = treeModel.refreshModel();
                refreshPromise.then(function (nodes) {
                    var gridElementsToFind = [npGridMock._list1, npGridMock._listItem1, npGridMock._button1];
                    var foundNodes = treeModel.findNodesByData(nodes, gridElementsToFind);
                    expect(foundNodes.length).to.be.equal(3);
                    _.forEach(foundNodes, function (node) {
                        expect(node.type).to.be.equal('gridElement');
                        expect(gridElementsToFind.indexOf(node.data)).to.not.be.equal(-1);
                    });
                });
                $rootScope.$apply();
            });
        });

        describe('model refresh:', function () {
            it('should return a promise on refresh that is resolved with the newly created nodes', function () {
                var refreshPromise = treeModel.refreshModel();
                refreshPromise.then(function (nodes) {
                    expect(nodes).to.be.an('array');
                    expect(nodes.length).to.be.equal(npPrototypeMock._pages.length);
                });
                $rootScope.$apply();
            });

            it('should replace the current page node with the root grid node but keep the page node\'s display name', function () {
                var refreshPromise = treeModel.refreshModel();
                refreshPromise.then(function (nodes) {
                    expect(nodes[0].type).to.be.equal('gridElement');
                    expect(nodes[0].data).to.be.equal(npGridMock.getRootElement());
                    expect(nodes[0].displayName).to.be.equal(npPrototypeMock._pages[0].displayName);

                    expect(nodes[1].type).to.be.equal('page');
                    expect(nodes[1].data).to.be.equal(npPrototypeMock._pages[1]);
                });
                $rootScope.$apply();
            });

            describe('validate child structure:', function () {
                it('should have inserted the content group node as the current page\'s only child', function () {
                    var refreshPromise = treeModel.refreshModel();
                    refreshPromise.then(function (nodes) {
                        var pageNode = treeModel.findNodesByData(nodes, [npGridMock.getRootElement()])[0];
                        expect(pageNode.children.length).to.be.equal(1);
                        expect(pageNode.children[0].type).to.be.equal('group');
                    });
                    $rootScope.$apply();
                });

                it('should have inserted the list and button nodes as the page content\'s children', function () {
                    var refreshPromise = treeModel.refreshModel();
                    refreshPromise.then(function (nodes) {
                        var pageNode = treeModel.findNodesByData(nodes, [npGridMock.getRootElement()])[0],
                            contentNode = pageNode.children[0];
                        expect(contentNode.children.length).to.be.equal(2);
                        expect(contentNode.children[0].data).to.be.equal(npGridMock._list1);
                        expect(contentNode.children[1].data).to.be.equal(npGridMock._button1);
                    });
                    $rootScope.$apply();
                });

                it('should have inserted the items group node as the list\'s only child', function () {
                    var refreshPromise = treeModel.refreshModel();
                    refreshPromise.then(function (nodes) {
                        var listNode = treeModel.findNodesByData(nodes, [npGridMock._list1])[0];
                        expect(listNode.children.length).to.be.equal(1);
                        expect(listNode.children[0].type).to.be.equal('group');
                    });
                    $rootScope.$apply();
                });

                it('should have inserted the list and button nodes as the page content\'s children', function () {
                    var refreshPromise = treeModel.refreshModel();
                    refreshPromise.then(function (nodes) {
                        var listNode = treeModel.findNodesByData(nodes, [npGridMock._list1])[0],
                            itemsNode = listNode.children[0];
                        expect(itemsNode.children.length).to.be.equal(2);
                        var listItem1 = _.find(itemsNode.children, {
                                data: npGridMock._listItem1
                            }),
                            listItem2 = _.find(itemsNode.children, {
                                data: npGridMock._listItem2
                            });
                        expect(listItem1).to.be.an('object');
                        expect(listItem2).to.be.an('object');
                    });
                    $rootScope.$apply();
                });
            });
        });

        describe('keeping the model updated', function () {
            it('should create a tree node under the page\'s content node for the newly created link grid element', function () {
                var refreshPromise = treeModel.refreshModel();
                refreshPromise.then(function (nodes) {
                    var newGridElement = createGridElement('link1', npGridMock.getRootElement(), 'content', 2);
                    $rootScope.$emit('npGrid/elementsAdded', [newGridElement]);
                    var pageNode = treeModel.findNodesByData(nodes, [npGridMock.getRootElement()])[0],
                        contentNode = pageNode.children[0];
                    expect(contentNode.children.length).to.be.equal(3);
                    expect(contentNode.children[2].data).to.be.equal(newGridElement);
                });
                $rootScope.$apply();
            });

            it('should create a tree node under the list\'s items node for the newly created listItem grid element', function () {
                var refreshPromise = treeModel.refreshModel();
                refreshPromise.then(function (nodes) {
                    var newGridElement = createGridElement('listItem3', npGridMock._list1, 'items');
                    $rootScope.$emit('npGrid/elementsAdded', [newGridElement]);
                    var listNode = treeModel.findNodesByData(nodes, [npGridMock._list1])[0],
                        itemsNode = listNode.children[0];
                    expect(itemsNode.children.length).to.be.equal(3);
                    var listItemNode = _.find(itemsNode.children, {
                        data: newGridElement
                    });
                    expect(listItemNode).to.be.an('object');
                });
                $rootScope.$apply();
            });

            it('should remove listItem1 and button1 all their children when their grid elements are deleted', function () {
                var refreshPromise = treeModel.refreshModel();
                refreshPromise.then(function (nodes) {
                    var nodesBeforeDeletion = treeModel.findNodesByData(nodes, [npGridMock._listItem1, npGridMock._attribute1,
                        npGridMock._button1
                    ]);
                    expect(nodesBeforeDeletion.length).to.be.equal(3);
                    _.forEach(nodesBeforeDeletion, function (node) {
                        expect(node).to.be.an('object');
                    });
                    var deletedGridElements = [npGridMock._listItem1, npGridMock._button1];
                    $rootScope.$emit('npGrid/elementsRemoved', deletedGridElements);

                    var nodesAfterDeletion = treeModel.findNodesByData(nodes, [npGridMock._listItem1, npGridMock._attribute1,
                        npGridMock._button1
                    ]);
                    expect(nodesAfterDeletion.length).to.be.equal(0);
                });
                $rootScope.$apply();
            });

            it('should move button into the list\'s items group when the button grid element is moved there', function () {
                var refreshPromise = treeModel.refreshModel();
                refreshPromise.then(function (nodes) {
                    var pageNode = treeModel.findNodesByData(nodes, [npGridMock.getRootElement()])[0],
                        contentNode = pageNode.children[0];
                    expect(contentNode.children.length).to.be.equal(2);
                    var listNode = treeModel.findNodesByData(nodes, [npGridMock._list1])[0],
                        itemsNode = listNode.children[0];
                    expect(itemsNode.children.length).to.be.equal(2);

                    var buttonGridElement = npGridMock._button1;
                    _.remove(npGridMock.getRootElement().children, buttonGridElement);
                    buttonGridElement.parentId = npGridMock._list1.elementId;
                    buttonGridElement.controlMd.parentGroupId = 'items';
                    npGridMock._list1.children.push(buttonGridElement);

                    $rootScope.$emit('npGrid/elementsMoved', [buttonGridElement]);

                    expect(contentNode.children.length).to.be.equal(1);
                    expect(itemsNode.children.length).to.be.equal(3);
                    var buttonNode = _.find(itemsNode.children, {
                        data: buttonGridElement
                    });
                    expect(buttonNode).to.be.an('object');
                });
                $rootScope.$apply();
            });

            it('should update the \'visible on canvas\' icon for all elements who\'s layout was refreshed', function () {
                var refreshPromise = treeModel.refreshModel();
                refreshPromise.then(function (nodes) {
                    var buttonGridElement = npGridMock._button1;
                    var buttonNode = treeModel.findNodesByData(nodes, [buttonGridElement])[0];
                    buttonNode.controlNotVisible = true;
                    buttonGridElement.domRef = function () {
                        return angular.element('<div></div>');
                    };
                    $rootScope.$emit('npGrid/layoutUpdated', [buttonGridElement]);
                    expect(buttonNode.controlNotVisible).to.be.equal(false);
                });
                $rootScope.$apply();
            });
        });

        describe('absolute layout specifics:', function () {
            beforeEach(function () {
                npLayoutHelperMock.isAbsoluteLayout = function () {
                    return true;
                };
            });

            it('should reverse the page content node\'s children when building the tree', function () {
                var refreshPromise = treeModel.refreshModel();
                refreshPromise.then(function (nodes) {
                    var pageNode = treeModel.findNodesByData(nodes, [npGridMock.getRootElement()])[0],
                        contentNode = pageNode.children[0];
                    expect(contentNode.children[0].data).to.be.equal(npGridMock._button1);
                    expect(contentNode.children[1].data).to.be.equal(npGridMock._list1);
                });
                $rootScope.$apply();
            });

            it('should not reverse the order of any other node\'s children when building the tree', function () {
                var refreshPromise = treeModel.refreshModel();
                refreshPromise.then(function (nodes) {
                    var listNode = treeModel.findNodesByData(nodes, [npGridMock._list1])[0],
                        itemsNode = listNode.children[0];
                    expect(itemsNode.children[0].data).to.be.equal(npGridMock._listItem1);
                    expect(itemsNode.children[1].data).to.be.equal(npGridMock._listItem2);
                });
                $rootScope.$apply();
            });

            it('should adjust the index accordingly when adding new child nodes into the page\'s content node', function () {
                var refreshPromise = treeModel.refreshModel();
                refreshPromise.then(function (nodes) {
                    var newGridElement = createGridElement('link1', npGridMock.getRootElement(), 'content', 2);
                    $rootScope.$emit('npGrid/elementsAdded', [newGridElement]);
                    var pageNode = treeModel.findNodesByData(nodes, [npGridMock.getRootElement()])[0],
                        contentNode = pageNode.children[0];
                    expect(contentNode.children[0].data).to.be.equal(newGridElement);
                });
                $rootScope.$apply();
            });
        });
    });
})();

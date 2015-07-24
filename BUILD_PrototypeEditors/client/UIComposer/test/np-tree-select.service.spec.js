'use strict';
(function () {

    var expect = chai.expect,
        _ = window._;

    /*
     * Mocked base structure used for all tests:
     * pageNode1
     *   contentNode
     *     listNode
     *       itemsNode
     *         listItemNode1
     *         listItemNode2
     *     buttonNode
     * pageNode2
     */
    describe('Service: np-tree-select', function () {
        var npTreeSelect,
            npTreeModelMock, npGridMock,
            pageNode1, contentNode, listNode, itemsNode, listItemNode1, listItemNode2, buttonNode, pageNode2, nodeFactory;

        beforeEach(module('uiComposer.uiEditor.treePanel'));

        beforeEach(function () {
            nodeFactory = {
                _nextId: 0,
                _createdNodes: [],
                create: function (type, data, parent) {
                    var node = {
                        nodeId: nodeFactory._nextId++,
                        type: type,
                        data: data,
                        children: [],
                        select: sinon.stub()
                    };
                    if (parent) {
                        node.parentNodeId = parent.nodeId;
                        parent.children.push(node);
                    }
                    nodeFactory._createdNodes.push(node);
                    return node;
                }
            };

            pageNode1 = nodeFactory.create('gridElement', {
                isRootChild: function () {
                    return false;
                }
            });
            contentNode = nodeFactory.create('group', {}, pageNode1);
            listNode = nodeFactory.create('gridElement', {
                isRootChild: function () {
                    return true;
                }
            }, contentNode);
            itemsNode = nodeFactory.create('group', {}, listNode);
            listItemNode1 = nodeFactory.create('gridElement', {
                isRootChild: function () {
                    return false;
                }
            }, itemsNode);
            listItemNode2 = nodeFactory.create('gridElement', {
                isRootChild: function () {
                    return false;
                }
            }, itemsNode);
            buttonNode = nodeFactory.create('gridElement', {
                isRootChild: function () {
                    return true;
                }
            }, contentNode);
            pageNode2 = nodeFactory.create('page', {});

            npTreeModelMock = {
                getNodes: function () {
                    return [pageNode1, pageNode2];
                },
                getNode: function (nodeId) {
                    return _.find(nodeFactory._createdNodes, {
                        nodeId: nodeId
                    });
                },
                findNodesByData: function (nodes, data) {
                    return _.filter(nodeFactory._createdNodes, function (node) {
                        return _.contains(data, node.data);
                    });
                }
            };

            npGridMock = {
                getSelectedElements: function () {}
            };

            module(function ($provide) {
                $provide.value('npTreeModel', npTreeModelMock);
                $provide.value('npGrid', npGridMock);
            });

            inject(function ($injector) {
                npTreeSelect = $injector.get('npTreeSelect');
            });
        });

        beforeEach(function () {
            _.forEach(nodeFactory._createdNodes, function (node) {
                expect(node.select.called).to.be.equal(false);
            });
        });

        describe('selecting next nodes', function () {
            it('should skip group nodes and select the next selectable page or gridElement node', function () {
                npGridMock.getSelectedElements = function () {
                    return [pageNode1.data];
                };
                npTreeSelect.selectNextNode();
                expect(contentNode.select.callCount).to.be.equal(0);
                expect(listNode.select.callCount).to.be.equal(1);
            });

            it('should select child elements first', function () {
                npGridMock.getSelectedElements = function () {
                    return [listNode.data];
                };
                npTreeSelect.selectNextNode();
                expect(listItemNode1.select.called).to.be.ok;
            });

            it('should select the next possible sibling element if there are no more children to select', function () {
                npGridMock.getSelectedElements = function () {
                    return [listItemNode1.data];
                };
                npTreeSelect.selectNextNode();
                expect(listItemNode2.select.called).to.be.ok;
            });

            it(
                'should walk up the hierarchy and select the next possible sibling of any of it\'s parent elements if there are no more children or siblings to select',
                function () {
                    npGridMock.getSelectedElements = function () {
                        return [listItemNode2.data];
                    };
                    npTreeSelect.selectNextNode();
                    expect(buttonNode.select.called).to.be.ok;
                });

            it('should select the next page if there are no more controls to select',
                function () {
                    npGridMock.getSelectedElements = function () {
                        return [buttonNode.data];
                    };
                    npTreeSelect.selectNextNode();
                    expect(pageNode2.select.called).to.be.ok;
                });

            it('should not select anything if there is no next node',
                function () {
                    npGridMock.getSelectedElements = function () {
                        return [pageNode2.data];
                    };
                    npTreeSelect.selectNextNode();
                    _.forEach(nodeFactory._createdNodes, function (node) {
                        expect(node.select.called).to.be.equal(false);
                    });
                });
        });

        describe('selecting previous nodes', function () {
            it('should skip group nodes and select the previous selectable page or gridElement node', function () {
                npGridMock.getSelectedElements = function () {
                    return [listNode.data];
                };
                npTreeSelect.selectPreviousNode();
                expect(contentNode.select.callCount).to.be.equal(0);
                expect(pageNode1.select.callCount).to.be.equal(1);
            });

            it('should select siblings first when selection previous nodes', function () {
                npGridMock.getSelectedElements = function () {
                    return [listItemNode2.data];
                };
                npTreeSelect.selectPreviousNode();
                expect(listItemNode1.select.called).to.be.ok;
            });

            it('should select the parent node if there is no previous sibling to select', function () {
                npGridMock.getSelectedElements = function () {
                    return [listItemNode1.data];
                };
                npTreeSelect.selectPreviousNode();
                expect(listNode.select.called).to.be.ok;
            });

            it('should skip over all child nodes if a root child node is not expanded', function () {
                npGridMock.getSelectedElements = function () {
                    return [buttonNode.data];
                };
                npTreeSelect.selectPreviousNode();
                expect(listNode.select.called).to.be.ok;
            });

            it('should not select anything if there is no previous node',
                function () {
                    npGridMock.getSelectedElements = function () {
                        return [pageNode1.data];
                    };
                    npTreeSelect.selectPreviousNode();
                    _.forEach(nodeFactory._createdNodes, function (node) {
                        expect(node.select.called).to.be.equal(false);
                    });
                });
        });


    });
})();

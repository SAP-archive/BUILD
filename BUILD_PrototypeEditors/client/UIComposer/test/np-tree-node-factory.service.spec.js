'use strict';
(function () {

    var expect = chai.expect;

    describe('Service: np-tree-node-factory', function () {
        var nodeFactory,
            npUiCatalogMock, uiUtilMock, npGridMock, npPageMetadataMock;

        beforeEach(module('uiComposer.uiEditor.treePanel'));

        beforeEach(function () {
            npUiCatalogMock = {
                getControlDisplayName: sinon.stub(),
                getControlDiffName: sinon.stub()
            };

            uiUtilMock = {
                _nextUid: 0,
                nextUid: function () {
                    return this._nextUid++;
                }
            };

            npGridMock = {
                setSelectedElements: sinon.stub()
            };

            npPageMetadataMock = {
                setCurrentPageName: sinon.stub()
            };

            module(function ($provide) {
                $provide.value('npUiCatalog', npUiCatalogMock);
                $provide.value('uiUtil', uiUtilMock);
                $provide.value('npGrid', npGridMock);
                $provide.value('npPageMetadata', npPageMetadataMock);
            });

            inject(function ($injector) {
                nodeFactory = $injector.get('npTreeNodeFactory');
            });
        });

        it('should throw an error if no node type was provided', function () {
            expect(nodeFactory.createNode).to.throw();
        });

        it('should throw an error if an unsupported node type was provided', function () {
            expect(function () {
                nodeFactory.createNode({
                    type: 'unsupported'
                });
            }).to.throw();
        });

        it('should create nodes collapsed by default', function () {
            var node = nodeFactory.createNode({
                type: 'page',
                data: {}
            });
            expect(node.collapsed).to.be.equal(true);
        });

        it('should insert a node into the parents child nodes if a parent node is provided', function () {
            var parent = nodeFactory.createNode({
                    type: 'page',
                    data: {}
                }),
                child = nodeFactory.createNode({
                    type: 'group',
                    data: {}
                }, parent);
            expect(child.parentNodeId).to.be.equal(parent.nodeId);
            expect(parent.children.indexOf(child)).to.not.be.equal(-1);
        });

        it('should insert a node into the parents child nodes at a certain position if parent node and index are provided', function () {
            var parent = nodeFactory.createNode({
                type: 'page',
                data: {}
            });
            nodeFactory.createNode({
                type: 'group',
                data: {}
            }, parent);
            nodeFactory.createNode({
                type: 'group',
                data: {}
            }, parent);
            var child = nodeFactory.createNode({
                type: 'group',
                data: {}
            }, parent, 1);
            expect(parent.children.indexOf(child)).to.be.equal(1);
        });

        describe('page nodes:', function () {
            it('should support \'page\' as a valid node type and set the node\'s data reference according to provided page object', function () {
                var page = {},
                    pageNode = nodeFactory.createNode({
                        type: 'page',
                        data: page
                    });
                expect(pageNode.type).to.be.equal('page');
                expect(pageNode.data).to.be.equal(page);
            });

            it('should assign a display name according to the passed page\'s displayName', function () {
                var page = {
                        displayName: 'Page 1'
                    },
                    node = nodeFactory.createNode({
                        type: 'page',
                        data: page
                    });
                expect(node.displayName).to.be.equal(page.displayName);
            });

            it('should set the current page when a page node is selected', function () {
                var page = {
                        displayName: 'Page 1',
                        name: 'S0'
                    },
                    node = nodeFactory.createNode({
                        type: 'page',
                        data: page
                    });
                node.select();
                expect(npPageMetadataMock.setCurrentPageName.calledWith(page.name)).to.be.ok;
            });
        });

        describe('group nodes:', function () {
            it('should support \'group\' as a valid node type and set the node\'s data reference according to provided group object', function () {
                var group = {},
                    groupNode = nodeFactory.createNode({
                        type: 'group',
                        data: group
                    });
                expect(groupNode.type).to.be.equal('group');
                expect(groupNode.data).to.be.equal(group);
            });

            it('should assign a display name according to the passed group\'s displayName', function () {
                var group = {
                        displayName: 'Content'
                    },
                    node = nodeFactory.createNode({
                        type: 'group',
                        data: group
                    });
                expect(node.displayName).to.be.equal(group.displayName);
            });
        });

        describe('gridElement nodes:', function () {
            it('should support \'gridElement\' as a valid node type and set the node\'s data reference according to provided gridElement object',
                function () {
                    var gridElement = {
                            controlMd: {},
                            domRef: function () {
                                return [];
                            }
                        },
                        gridElementNode = nodeFactory.createNode({
                            type: 'gridElement',
                            data: gridElement
                        });
                    expect(gridElementNode.type).to.be.equal('gridElement');
                    expect(gridElementNode.data).to.be.equal(gridElement);
                });

            it('should read the control\'s displayName from the catalog and set it on the node', function () {
                var controlDisplayName = 'Some Control';
                npUiCatalogMock.getControlDisplayName = function () {
                    return controlDisplayName;
                };
                var gridElement = {
                        controlMd: {},
                        domRef: function () {
                            return [];
                        }
                    },
                    node = nodeFactory.createNode({
                        type: 'gridElement',
                        data: gridElement
                    });
                expect(node.displayName).to.be.equal(controlDisplayName);
            });

            it('should select the grid element when a grid element node is selected', function () {
                var gridElement = {
                        controlMd: {},
                        domRef: function () {
                            return [];
                        }
                    },
                    node = nodeFactory.createNode({
                        type: 'gridElement',
                        data: gridElement
                    });
                var spy = npGridMock.setSelectedElements;
                node.select();
                expect(spy.called).to.be.ok;
                expect(spy.args[0][0][0]).to.be.equal(gridElement);
            });

        });
    });
})();

'use strict';
(function () {
    var expect = chai.expect,
        _ = window._;

    describe('Service: np-page-metadata-delete-control', function () {
        var deleteControlService,
            npPageMetadataHelperMock, npPageMetadataEventsMock,
            pageMd;

        beforeEach(module('uiComposer.services'));

        beforeEach(function () {
            npPageMetadataHelperMock = {
                getGroupMd: function (groupId, controlMd) {
                    return _.find(controlMd.groups, {
                        groupId: groupId
                    });
                },
                adjustChildIndexes: sinon.stub(),
                getControlMd: function (controlId, pageMetadata) {
                    return _.find(pageMetadata.controls, {
                        controlId: controlId
                    });
                },
                getControlAndChildMd: function (controlId, pageMd) {
                    var controlMd = _.find(pageMd.controls, {
                            controlId: controlId
                        }),
                        children = _.flattenDeep(_.map(controlMd.groups, function (group) {
                            return _.map(group.children, function (childId) {
                                return npPageMetadataHelperMock.getControlAndChildMd(childId, pageMd);
                            });
                        }));
                    return [controlMd].concat(children);
                }
            };

            npPageMetadataEventsMock = {
                events: {
                    controlsRemoved: 'controlsRemoved'
                },
                broadcast: sinon.stub()
            };

            pageMd = {
                rootControlId: 'page',
                controls: [{
                    controlId: 'page',
                    groups: [{
                        groupId: 'content',
                        children: ['list1', 'button1']
                    }],
                    getParentMd: function () {}
                }, {
                    controlId: 'list1',
                    parentControlId: 'page',
                    parentGroupId: 'content',
                    parentGroupIndex: 0,
                    groups: [{
                        groupId: 'items',
                        children: ['listItem1', 'listItem2']
                    }],
                    getParentMd: function () {
                        return npPageMetadataHelperMock.getControlMd(this.parentControlId, pageMd);
                    }
                }, {
                    controlId: 'button1',
                    parentControlId: 'page',
                    parentGroupId: 'content',
                    parentGroupIndex: 1,
                    getParentMd: function () {
                        return npPageMetadataHelperMock.getControlMd(this.parentControlId, pageMd);
                    }

                }, {
                    controlId: 'listItem1',
                    parentControlId: 'list1',
                    parentGroupId: 'items',
                    parentGroupIndex: 0,
                    getParentMd: function () {
                        return npPageMetadataHelperMock.getControlMd(this.parentControlId, pageMd);
                    }

                }, {
                    controlId: 'listItem2',
                    parentControlId: 'list1',
                    parentGroupId: 'items',
                    parentGroupIndex: 1,
                    getParentMd: function () {
                        return npPageMetadataHelperMock.getControlMd(this.parentControlId, pageMd);
                    }

                }]
            };

            module(function ($provide) {
                $provide.value('npPageMetadataHelper', npPageMetadataHelperMock);
                $provide.value('npPageMetadataEvents', npPageMetadataEventsMock);
            });

            inject(function ($injector) {
                deleteControlService = $injector.get('npPageMetadataDeleteControl');
            });
        });

        describe('removeControlFromPage:', function () {
            it('should remove the control from the page and its parent group', function () {
                var listItem1 = npPageMetadataHelperMock.getControlMd('listItem1', pageMd);
                deleteControlService.removeControlFromPage(listItem1, pageMd);

                expect(npPageMetadataHelperMock.getControlMd('listItem1', pageMd)).to.be.undefined;
                var list1 = npPageMetadataHelperMock.getControlMd('list1', pageMd);
                expect(list1.groups[0].children.length).to.be.equal(1);
                expect(list1.groups[0].children.indexOf('listItem1')).to.be.equal(-1);
            });

            it('should adjust the parentGroupIndices of other controls in the same group when control is deleted', function () {
                var listItem1 = npPageMetadataHelperMock.getControlMd('listItem1', pageMd),
                    list1 = npPageMetadataHelperMock.getControlMd('list1', pageMd);
                deleteControlService.removeControlFromPage(listItem1, pageMd);
                expect(npPageMetadataHelperMock.adjustChildIndexes.calledWith(list1, 'items')).to.be.ok;
            });

            it('should not remove children by default, they need to be removed separately', function () {
                var list1 = npPageMetadataHelperMock.getControlMd('list1', pageMd),
                    listItem1 = npPageMetadataHelperMock.getControlMd('listItem1', pageMd);

                deleteControlService.removeControlFromPage(list1, pageMd);
                expect(npPageMetadataHelperMock.getControlMd('listItem1', pageMd)).to.be.equal(listItem1);
            });
        });

        describe('performDelete:', function () {
            it('should remove controls by their metadata from the pageMd', function () {
                var listItem2 = npPageMetadataHelperMock.getControlMd('listItem2', pageMd);

                deleteControlService.performDelete([listItem2], pageMd);
                expect(npPageMetadataHelperMock.getControlMd('listItem2', pageMd)).to.be.undefined;
            });

            it('should remove controls with parent child relationship from the page', function () {
                var list1 = npPageMetadataHelperMock.getControlMd('list1', pageMd),
                    listItem1 = npPageMetadataHelperMock.getControlMd('listItem1', pageMd),
                    listItem2 = npPageMetadataHelperMock.getControlMd('listItem2', pageMd),
                    controls = [list1, listItem1, listItem2];

                deleteControlService.performDelete(controls, pageMd);
                _.forEach(['list1', 'listItem1', 'listItem2'], function (id) {
                    expect(npPageMetadataHelperMock.getControlMd(id, pageMd)).to.be.undefined;
                });
            });
        });

        describe('performDeletions:', function () {
            it('should accept an array of control deletions and remove all passed controls from page', function () {
                var list1 = npPageMetadataHelperMock.getControlMd('list1', pageMd),
                    listItem1 = npPageMetadataHelperMock.getControlMd('listItem1', pageMd),
                    listItem2 = npPageMetadataHelperMock.getControlMd('listItem2', pageMd),
                    deleteGroup1 = [list1, listItem1, listItem2],
                    button1 = npPageMetadataHelperMock.getControlMd('button1', pageMd),
                    deleteGroup2 = [button1],
                    controlDeletions = [deleteGroup1, deleteGroup2];

                deleteControlService.performDeletions(controlDeletions, pageMd);

                _.forEach(['list1', 'listItem1', 'listItem2', 'button1'], function (id) {
                    expect(npPageMetadataHelperMock.getControlMd(id, pageMd)).to.be.undefined;
                });
            });

            it('should broadcast a pageMd event with the pageMd and all deleted top level controls', function () {
                var list1 = npPageMetadataHelperMock.getControlMd('list1', pageMd),
                    listItem1 = npPageMetadataHelperMock.getControlMd('listItem1', pageMd),
                    listItem2 = npPageMetadataHelperMock.getControlMd('listItem2', pageMd),
                    deleteGroup1 = [list1, listItem1, listItem2],
                    button1 = npPageMetadataHelperMock.getControlMd('button1', pageMd),
                    deleteGroup2 = [button1],
                    controlDeletions = [deleteGroup1, deleteGroup2];

                deleteControlService.performDeletions(controlDeletions, pageMd);

                expect(npPageMetadataEventsMock.broadcast.calledWith('controlsRemoved', pageMd, [list1, button1])).to.be.ok;
            });
        });

        describe('deleteGroupChildren', function () {
            it('should delete all children in the target group and all their children as well from pageMd', function () {
                var list1 = npPageMetadataHelperMock.getControlMd('list1', pageMd),
                    button1 = npPageMetadataHelperMock.getControlMd('button1', pageMd),
                    page = npPageMetadataHelperMock.getControlMd('page', pageMd),
                    contentGroup = page.groups[0];
                deleteControlService.deleteGroupChildren(contentGroup, pageMd);

                _.forEach(['list1', 'listItem1', 'listItem2', 'button1'], function (id) {
                    expect(npPageMetadataHelperMock.getControlMd(id, pageMd)).to.be.undefined;
                });
            });
        });
    });
})();

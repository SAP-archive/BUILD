'use strict';
(function () {

    var expect = chai.expect;

    describe('Service: np-page-metadata-helper', function () {
        var npUiCatalogMock, npPageMetadataHelper;

        beforeEach(module('ngResource'));
        beforeEach(module('uiComposer.services'));

        beforeEach(function () {

            npUiCatalogMock = {
                isMultipleAggregation: function (groupId, controlName) {
                    return 'siblingEnabled' === controlName;
                },
                getControlAggregations: function (controlName) {
                    switch (controlName) {
                        case 'siblingEnabled':
                            return {
                                groupId: {
                                    name: 'groupId'
                                }
                            };
                        case 'editableControl':
                            return {
                                editableGroupId: {
                                    name: 'editableGroupId'
                                }
                            };
                        default:
                            return null;
                    }
                },
                getControlProperties: function (controlName) {
                    switch (controlName) {
                        case 'editableControl':
                            return {
                                editableProperty: {
                                    name: 'editableProperty'
                                }
                            };
                        default:
                            return null;
                    }
                }
            };

            module(function ($provide) {
                $provide.value('npUiCatalog', npUiCatalogMock);
            });

            inject(function ($injector) {
                npPageMetadataHelper = $injector.get('npPageMetadataHelper');
            });
        });

        it('should not allow to move control without parent', function () {
            var rootControlMd = {
                getParentMd: function () {
                    return null;
                }
            };

            var canMove = npPageMetadataHelper.canMoveControl(rootControlMd);

            expect(canMove).to.be.equal(false);
        });

        it('should not allow to move control that is template', function () {
            var groupMock = {
                    groupId: 'id',
                    binding: {
                        paths: 'mock'
                    }
                },
                parentMock = {
                    groups: [groupMock]
                },
                controlMock = {
                    parentGroupId: 'id',
                    getParentMd: function () {
                        return parentMock;
                    }
                };

            var canMove = npPageMetadataHelper.canMoveControl(controlMock);

            expect(canMove).to.be.equal(false);
        });

        it('should allow to move control ', function () {
            var groupMock = {
                    groupId: 'id'
                },
                parentMock = {
                    groups: [groupMock]
                },
                controlMock = {
                    parentGroupId: 'id',
                    getParentMd: function () {
                        return parentMock;
                    }
                };

            var canMove = npPageMetadataHelper.canMoveControl(controlMock);

            expect(canMove).to.be.equal(true);
        });

        it('Should adjust child indexes', function () {
            var controlChildrenMock = [
                {
                    parentGroupIndex: 0
                },
                {
                    parentGroupIndex: 0
                },
                {
                    parentGroupIndex: 0
                }
            ];
            var controlMock = {
                getChildrenMd: function () {
                    return controlChildrenMock;
                }
            };
            _.forEach(controlChildrenMock, function (child) {
                expect(child.parentGroupIndex).to.be.equal(0);
            });
            npPageMetadataHelper.adjustChildIndexes(controlMock, 'id');
            _.forEach(controlChildrenMock, function (child, i) {
                expect(child.parentGroupIndex).to.be.equal(i);
            });
        });

        it('Should allow to have siblings', function () {
            var parentMock = {
                    catalogControlName: 'siblingEnabled',
                    catalogId: 'mock'
                },
                controlMock = {
                    parentGroupId: 'id',
                    parentControlId: 'parentId',
                    getParentMd: function () {
                        return parentMock;
                    }
                },
                controlWithoutParentGroupMock = {
                    parentControlId: 'parentId',
                    getParentMd: function () {
                        return parentMock;
                    }
                };
            var canHaveSiblings = npPageMetadataHelper.canHaveSiblings(controlMock);
            expect(canHaveSiblings).to.be.ok;

            canHaveSiblings = npPageMetadataHelper.canHaveSiblings(controlWithoutParentGroupMock);
            expect(canHaveSiblings).not.to.be.ok;
        });

        it('Should not allow to have siblings if there is no control or parentControlId', function () {
            var controlMock = {};
            var canHaveSiblings = npPageMetadataHelper.canHaveSiblings();
            expect(canHaveSiblings).to.be.equal(false);
            canHaveSiblings = npPageMetadataHelper.canHaveSiblings(controlMock);
            expect(canHaveSiblings).to.be.equal(false);
        });

        it('Should get top most template', function () {
            var groupMock = {
                    groupId: 'id2',
                    binding: {
                        paths: 'mock'
                    }
                },
                groupNonTemplateMock = {
                    groupId: 'id'
                },
                topParentMock = {
                    groups: [groupMock],
                    getParentMd: function () {
                        return null;
                    }
                },
            // Top most template. It is enclosed in a group which has binding paths
                parentMock = {
                    parentGroupId: 'id2',
                    groups: [groupNonTemplateMock],
                    getParentMd: function () {
                        return topParentMock;
                    }
                },
                controlMock = {
                    parentGroupId: 'id',
                    getParentMd: function () {
                        return parentMock;
                    }
                };
            var topMostTemplate = npPageMetadataHelper.getTopMostTemplate(controlMock);
            expect(topMostTemplate).to.be.equal(parentMock);
        });

        it('Should evaluate if the control is a template', function () {
            var groupWithBindingsMock = {
                    groupId: 'id',
                    binding: {
                        paths: 'mock'
                    }
                },
                groupWithoutBindingsMock = {
                    groupId: 'id2'
                },
                parentMock = {
                    groups: [groupWithBindingsMock, groupWithoutBindingsMock]
                },
                controlMock = {
                    parentGroupId: 'id',
                    getParentMd: function () {
                        return parentMock;
                    }
                };
            var isTemplate = npPageMetadataHelper.isTemplate(controlMock);
            expect(isTemplate).to.be.equal(true);
            controlMock.parentGroupId = 'id2';
            isTemplate = npPageMetadataHelper.isTemplate(controlMock);
            expect(isTemplate).to.be.equal(false);
            controlMock.getParentMd = function () {
                return null;
            };
            isTemplate = npPageMetadataHelper.isTemplate(controlMock);
            expect(isTemplate).to.be.equal(false);
        });

        it('Should evaluate if the object is a Control Md', function () {
            var controlMock = {
                catalogControlName: 'mock',
                catalogId: 'id'
            };
            var isControlMd = npPageMetadataHelper.isControlMd(controlMock);
            expect(isControlMd).to.be.equal(true);

            delete controlMock.catalogControlName;
            isControlMd = npPageMetadataHelper.isControlMd(controlMock);
            expect(isControlMd).to.be.equal(false);

            controlMock.catalogControlName = 'mock';
            delete controlMock.catalogId;
            isControlMd = npPageMetadataHelper.isControlMd(controlMock);
            expect(isControlMd).to.be.equal(false);

            delete controlMock.catalogControlName;
            isControlMd = npPageMetadataHelper.isControlMd(controlMock);
            expect(isControlMd).to.be.equal(false);
        });

        it('Should evaluate if the object is a Control Definition', function () {
            var isControlDef = npPageMetadataHelper.isControlDef({newCtrlCatalogName: 'mock'});
            expect(isControlDef).to.be.equal(true);
            isControlDef = npPageMetadataHelper.isControlDef({});
            expect(isControlDef).to.be.equal(false);
        });

        it('Should get correct event Md from events', function () {
            var controlMock = {
                events: [
                    {
                        eventId: 'id1'
                    },
                    {
                        eventId: 'id2'
                    },
                    {
                        eventId: 'id3'
                    }
                ]
            };
            var eventMd = npPageMetadataHelper.getEventMd('id1', controlMock);
            expect(eventMd.eventId).to.be.equal('id1');

            eventMd = npPageMetadataHelper.getEventMd('id3', controlMock);
            expect(eventMd.eventId).to.be.equal('id3');

            eventMd = npPageMetadataHelper.getEventMd('id4', controlMock);
            expect(eventMd).to.be.undefined;
        });

        it('Should get correct Control design property from Design Properties', function () {
            var controlMock = {
                designProperties: [
                    {
                        name: 'id1'
                    },
                    {
                        name: 'id2'
                    },
                    {
                        name: 'id3'
                    }
                ]
            };
            var md = npPageMetadataHelper.getControlDesignProperty('id1', controlMock);
            expect(md.name).to.be.equal('id1');

            md = npPageMetadataHelper.getControlDesignProperty('id3', controlMock);
            expect(md.name).to.be.equal('id3');

            md = npPageMetadataHelper.getControlDesignProperty('id4', controlMock);
            expect(md).to.be.undefined;
        });

        it('Should get correct Control property from Properties', function () {
            var controlMock = {
                properties: [
                    {
                        name: 'id1'
                    },
                    {
                        name: 'id2'
                    },
                    {
                        name: 'id3'
                    }
                ]
            };
            var md = npPageMetadataHelper.getControlProperty('id1', controlMock);
            expect(md.name).to.be.equal('id1');

            md = npPageMetadataHelper.getControlProperty('id3', controlMock);
            expect(md.name).to.be.equal('id3');

            md = npPageMetadataHelper.getControlProperty('id4', controlMock);
            expect(md).to.be.undefined;
        });

        it('Should get group Md from groups', function () {
            var controlMock = {
                groups: [
                    {
                        groupId: 'id1'
                    },
                    {
                        groupId: 'id2'
                    },
                    {
                        groupId: 'id3'
                    }
                ]
            };
            var md = npPageMetadataHelper.getGroupMd('id1', controlMock);
            expect(md.groupId).to.be.equal('id1');

            md = npPageMetadataHelper.getGroupMd('id3', controlMock);
            expect(md.groupId).to.be.equal('id3');

            md = npPageMetadataHelper.getGroupMd('id4', controlMock);
            expect(md).to.be.undefined;
        });

        it('Should get control Md from page Md', function () {
            var pageMdMock = {
                controls: [
                    {
                        controlId: 'id1'
                    },
                    {
                        controlId: 'id2'
                    },
                    {
                        controlId: 'id3'
                    }
                ]
            };
            var md = npPageMetadataHelper.getControlMd('id1', pageMdMock);
            expect(md.controlId).to.be.equal('id1');

            md = npPageMetadataHelper.getControlMd('id3', pageMdMock);
            expect(md.controlId).to.be.equal('id3');

            md = npPageMetadataHelper.getControlMd('id4', pageMdMock);
            expect(md).to.be.undefined;
        });

        it('Should get controls Md from page Md', function () {
            var pageMdMock = {
                controls: [
                    {
                        controlId: 'id1'
                    },
                    {
                        controlId: 'id2'
                    },
                    {
                        controlId: 'id3'
                    }
                ]
            };
            var md = npPageMetadataHelper.getControlsMd(['id1'], pageMdMock);
            expect(md).to.be.an('array');
            expect(md.length).to.be.equal(1);
            expect(md[0].controlId).to.be.equal('id1');

            // 'id4' is not available
            md = npPageMetadataHelper.getControlsMd(['id1', 'id3', 'id4'], pageMdMock);
            expect(md.length).to.be.equal(3);
            expect(md[2]).to.be.undefined;

            md = npPageMetadataHelper.getControlsMd([], pageMdMock);
            expect(md.length).to.be.equal(0);
        });

        it('Should get containing Group', function () {
            var groupWithBindingsMock = {
                    groupId: 'id',
                    binding: {
                        paths: 'mock'
                    }
                },
                groupWithoutBindingsMock = {
                    groupId: 'id2'
                },
                parentMock = {
                    groups: [groupWithBindingsMock, groupWithoutBindingsMock]
                },
                controlMock = {
                    parentGroupId: 'id',
                    getParentMd: function () {
                        return parentMock;
                    }
                };
            var group = npPageMetadataHelper.getContainingGroupMd(controlMock);
            expect(group).to.be.equal(groupWithBindingsMock);

            controlMock.parentGroupId = 'id2';
            group = npPageMetadataHelper.getContainingGroupMd(controlMock);
            expect(group).to.be.equal(groupWithoutBindingsMock);

            controlMock.getParentMd = function () {
                return null;
            };
            group = npPageMetadataHelper.getContainingGroupMd(controlMock);
            expect(group).to.be.null;
        });

        it('Should evaluate if the object is bound or not', function () {
            var groupMock = {
                binding: {
                    paths: 'mock'
                }
            };

            var isBound = npPageMetadataHelper.isBound(groupMock);
            expect(isBound).to.be.equal(true);

            delete groupMock.binding.paths;
            isBound = npPageMetadataHelper.isBound(groupMock);
            expect(isBound).to.be.equal(false);

            delete groupMock.binding;
            isBound = npPageMetadataHelper.isBound(groupMock);
            expect(isBound).to.be.equal(false);

            isBound = npPageMetadataHelper.isBound();
            expect(isBound).to.be.equal(false);
        });

        it('Should check if the group can be edited or not', function () {
            var controlMock = {
                    catalogControlName: 'editableControl'
                },
                groupId = 'editableGroupId';

            var canEditGroup = npPageMetadataHelper.canEditGroup(controlMock, groupId);
            expect(canEditGroup).to.be.equal(true);
            canEditGroup = npPageMetadataHelper.canEditGroup(controlMock, 'mockId');
            expect(canEditGroup).to.be.equal(false);
            canEditGroup = npPageMetadataHelper.canEditGroup({}, groupId);
            expect(canEditGroup).to.be.equal(false);
        });

        it('Should check if the property can be edited', function () {
            var controlMock = {
                    catalogControlName: 'editableControl'
                },
                property = 'editableProperty';
            var canEdit = npPageMetadataHelper.canEditProperty(controlMock, property);
            expect(canEdit).to.be.equal(true);
            canEdit = npPageMetadataHelper.canEditProperty(controlMock, 'mockId');
            expect(canEdit).to.be.equal(false);
            canEdit = npPageMetadataHelper.canEditProperty({}, property);
            expect(canEdit).to.be.equal(false);
        });

        it('Should get control in flattened parent child order', function () {
            var controlMdMockParent = {
                    controlId: 'parentId',
                    groups: [
                        {
                            children: ['id1', 'id2']
                        },
                        {
                            children: ['id3']
                        }
                    ]
                },
                controlMdMock1 = {
                    controlId: 'id1',
                    groups: [
                        {
                            children: ['id11']
                        }
                    ]
                },
                controlMdMock2 = {
                    controlId: 'id2',
                    groups: []
                },
                controlMdMock3 = {
                    controlId: 'id3',
                    groups: []
                },
                controlMdMock11 = {
                    controlId: 'id11',
                    groups: []
                },
                pageMdMock = {
                    controls: [controlMdMockParent, controlMdMock1, controlMdMock2, controlMdMock3, controlMdMock11]
                };
            var flattenedParentArray = [controlMdMockParent, controlMdMock1, controlMdMock11, controlMdMock2, controlMdMock3];
            var parentChildArray = npPageMetadataHelper.getControlAndChildMd(controlMdMockParent.controlId, pageMdMock);
            expect(parentChildArray).to.be.an('array');
            expect(JSON.stringify(parentChildArray)).to.be.equal(JSON.stringify(flattenedParentArray));

            parentChildArray = npPageMetadataHelper.getControlAndChildMd(controlMdMock11.controlId, pageMdMock);
            expect(JSON.stringify(parentChildArray)).to.be.equal(JSON.stringify([controlMdMock11]));

            parentChildArray = npPageMetadataHelper.getControlAndChildMd('dummyId', pageMdMock);
            expect(parentChildArray.length).to.be.equal(0);
        });

        it('Should get controls in flattened parent child order', function () {
            var controlMdMockParent = {
                    controlId: 'parentId',
                    groups: [
                        {
                            children: ['id1', 'id2']
                        },
                        {
                            children: ['id3']
                        }
                    ]
                },
                controlMdMock1 = {
                    controlId: 'id1',
                    groups: [
                        {
                            children: ['id11']
                        }
                    ]
                },
                controlMdMock2 = {
                    controlId: 'id2',
                    groups: []
                },
                controlMdMock3 = {
                    controlId: 'id3',
                    groups: []
                },
                controlMdMock11 = {
                    controlId: 'id11',
                    groups: []
                },
                pageMdMock = {
                    controls: [controlMdMockParent, controlMdMock1, controlMdMock2, controlMdMock3, controlMdMock11]
                };
            var flattenedParentArray = [controlMdMockParent, controlMdMock1, controlMdMock11, controlMdMock2, controlMdMock3];
            var parentChildArray = npPageMetadataHelper.getControlsAndChildMd([controlMdMockParent.controlId], pageMdMock);
            expect(parentChildArray).to.be.an('array');
            expect(JSON.stringify(parentChildArray)).to.be.equal(JSON.stringify(flattenedParentArray));

            // Controls are not repeated. They are unique
            parentChildArray = npPageMetadataHelper.getControlsAndChildMd([controlMdMockParent.controlId, controlMdMock1.controlId], pageMdMock);
            expect(JSON.stringify(parentChildArray)).to.be.equal(JSON.stringify(flattenedParentArray));

            parentChildArray = npPageMetadataHelper.getControlsAndChildMd(['dummyId'], pageMdMock);
            expect(parentChildArray.length).to.be.equal(0);

            parentChildArray = npPageMetadataHelper.getControlsAndChildMd([], pageMdMock);
            expect(parentChildArray.length).to.be.equal(0);

        });

        it('Should set helper method for each control', function () {
            var controlMdMockParent = {
                    controlId: 'parentId',
                    groups: [
                        {
                            groupId: 'pg1',
                            children: ['id1', 'id2']
                        },
                        {
                            groupId: 'pg2',
                            children: ['id3']
                        }
                    ]
                },
                controlMdMock1 = {
                    parentControlId: 'parentId',
                    controlId: 'id1',
                    groups: [
                        {
                            groupId: 'id1g1',
                            children: ['id11']
                        }
                    ]
                },
                controlMdMock2 = {
                    parentControlId: 'parentId',
                    controlId: 'id2',
                    groups: []
                },
                controlMdMock3 = {
                    parentControlId: 'parentId',
                    controlId: 'id3',
                    groups: []
                },
                controlMdMock11 = {
                    parentControlId: 'id1',
                    controlId: 'id11',
                    groups: []
                },
                pageMdMock = {
                    controls: [controlMdMockParent, controlMdMock1, controlMdMock2, controlMdMock3, controlMdMock11]
                };
            expect(controlMdMock1.getParentMd).to.be.undefined;
            expect(controlMdMock1.getChildrenMd).to.be.undefined;
            npPageMetadataHelper.setControlMdPrototype(controlMdMock1, pageMdMock);
            expect(controlMdMock1.getParentMd).to.be.an('function');
            expect(controlMdMock1.getChildrenMd).to.be.an('function');

            expect(controlMdMock1.getParentMd().controlId).to.be.equal(controlMdMockParent.controlId);
            var childrenOfId1Control = controlMdMock1.getChildrenMd('id1g1');
            expect(childrenOfId1Control.length).to.be.equal(1);

            childrenOfId1Control = controlMdMock1.getChildrenMd('mockGroup');
            expect(childrenOfId1Control.length).to.be.equal(0);
        });


        it('should filter the editable properties', function () {
            var controlMd = {
                properties: [
                    {name: 'not-editable'},
                    {name: 'propertyId'}
                ]
            };
            npUiCatalogMock.getControlProperties = function () {
                return {
                    propertyId: {
                        name: 'propertyId',
                        displayToUser: true
                    }
                };
            };
            expect(npPageMetadataHelper.getDisplayableProperties(controlMd)).to.be.deep.equal([{name: 'propertyId'}]);
        });
        it('should filter the editable groups', function () {
            var controlMd = {
                groups: [
                    {groupId: 'not-editable'},
                    {groupId: 'groupId'}
                ]
            };
            npUiCatalogMock.getControlAggregations = function () {
                return {
                    groupId: {
                        name: 'groupId',
                        displayToUser: true
                    }
                };
            };
            expect(npPageMetadataHelper.getDisplayableGroups(controlMd)).to.be.deep.equal([{groupId: 'groupId'}]);
        });
    });
})();

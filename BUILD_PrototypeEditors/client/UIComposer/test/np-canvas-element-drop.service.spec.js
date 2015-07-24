'use strict';
(function () {

    var expect = chai.expect;

    describe('Directive: np-canvas-element-drop', function () {
        var $q, $rootScope, npCanvasElementDrop;
        var npUiCatalogMock, npGridMock, npPageMetadataMock, npLayoutHelperMock, npBindingHelperMock, npPageMetadataHelperMock, npPageMetadataEventsMock, npUiCanvasAPIMock;
        var addControlSpy, moveControlSpy;
        var pageMd;

        beforeEach(module('uiComposer.uiCanvas'));
        beforeEach(module('uiComposer.uiEditor'));

        beforeEach(module(function ($provide) {

            pageMd = {
                rootControlId: 'c',
                controls: [{
                    controlId: 'c',
                    getParentMd: sinon.stub()
                }, {
                    controlId: 'page',
                    isRootChild: function () {
                        return true;
                    }
                }]
            };
            npGridMock = {
                getElementForControlId: function () {
                    return {
                        style: {}
                    };
                }
            };

            npUiCatalogMock = {
                getControlDefaultAggregation: function () {
                    return 'default';
                },
                isControlValidInAggregation: function (sourceCatalogControlName) {
                    return (sourceCatalogControlName === 'listItem' || sourceCatalogControlName === 'sap_m_Button');
                }
            };

            npPageMetadataMock = {
                addControl: function () {
                    return $q.when([{
                        controlId: 'c0'
                    }]);
                },
                moveControl: function () {
                    return $q.when([{
                        controlId: 'c0'
                    }]);
                },
                getCurrentPageName: function () {
                },
                getPageMetadata: function () {
                    return $q.when(pageMd);
                },
                getMainEntity: function () {
                    return $q.when();
                }
            };

            npBindingHelperMock = {};

            npPageMetadataHelperMock = {};

            npPageMetadataEventsMock = {
                events: { mainEntityChanged: '' },
                listen: function () {}
            };

            npLayoutHelperMock = {
                isAbsoluteLayout: function () {
                    return true;
                }
            };

            npUiCanvasAPIMock = {};

            addControlSpy = sinon.spy(npPageMetadataMock, 'addControl');
            moveControlSpy = sinon.spy(npPageMetadataMock, 'moveControl');
            $provide.value('npUiCatalog', npUiCatalogMock);
            $provide.value('npGrid', npGridMock);
            $provide.value('npPageMetadata', npPageMetadataMock);
            $provide.value('npBindingHelper', npBindingHelperMock);
            $provide.value('npPageMetadataHelper', npPageMetadataHelperMock);
            $provide.value('npPageMetadataEvents', npPageMetadataEventsMock);
            $provide.value('npLayoutHelper', npLayoutHelperMock);
            $provide.value('npUiCanvasAPI', npUiCanvasAPIMock);
        }));

        beforeEach(inject(function ($injector) {
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');
            npCanvasElementDrop = $injector.get('npCanvasElementDrop');
            var npFormFactor = $injector.get('npFormFactor'),
                availableFormFactors = npFormFactor.getAvailableFormFactors();
            // set desktop
            npFormFactor.setCurrentFormFactor(availableFormFactors[1]);
        }));

        afterEach(function () {
            npPageMetadataMock.addControl.restore();
            npPageMetadataMock.moveControl.restore();
        });


        /*
         * tests for moveAtTarget
         * */

        //==> first case: we drag something outside the canvas
        //targetMd: empty
        it('should reject the move promise for empty targetMd', function () {
            var controlMd = {
                    catalogControlName: 'not_valid_in_aggr',
                    controlId: 'button_1',
                    catalogId: '123'
                },
                targetMd = {},
                positionData = {
                    x: 1,
                    y: 2,
                    properties: []
                };
            var promise = npCanvasElementDrop.moveAtTarget(controlMd, targetMd, positionData);
            $rootScope.$apply();
            expect(promise).to.be.rejected;
        });

        //==> second case: we try to move some invalid control from some other control onto the page
        //targetMd: defined, page
        //groupId: defined, default aggregation
        //isTargetRootChild: true, is the page
        //absolute layout: yes
        //targetMd.parentControlId: not defined as target is the page
        //targetMd.parentGroupId: not defined as target is the page
        //controlValidInAggr: no
        //groupIdEmpty || controlNotValid -> true, -> parentId = undefined, groupId = undefined
        //(index === undefined && controlMd.parentControlId === targetMd.parentControlId && controlMd.parentGroupId === targetMd.parentGroupId) -> true
        //parentId undefined -> return
        it('should reject the move promise for invalid aggregations', function () {
            var controlMd = {
                    catalogControlName: 'not_valid_in_aggr',
                    controlId: 'button_1',
                    catalogId: '123',
                    parentControlId: 'list_0',
                    parentGroupId: 'items',
                    parentGroupIndex: '1'
                },
                targetMd = {
                    controlId: 'page',
                    catalogControlName: 'page_0',
                    catalogId: '123',
                    isRootChild: function () {
                        return true;
                    }
                },
                positionData = {
                    x: 1,
                    y: 2,
                    properties: []
                };
            npUiCatalogMock.getControlDefaultAggregation = function () {
                return undefined;
            };
            var promise = npCanvasElementDrop.moveAtTarget(controlMd, targetMd, positionData);
            $rootScope.$apply();
            expect(promise).to.be.rejected;
        });

        //==> third case: we try to move a valid control outside of some other control onto the page
        //targetMd: defined, page
        //groupId: defined, default aggregation
        //isTargetRootChild: true, is the page
        //absolute layout: yes
        //targetMd.parentControlId: not defined as target is the page
        //targetMd.parentGroupId: not defined as target is the page
        //controlValidInAggr: yes
        //groupIdEmpty || controlNotValid -> false
        //(index === undefined && controlMd.parentControlId === targetMd.controlId && controlMd.parentGroupId === targetMd.groupId) -> false
        it('should resolve promise with index being undefined', function () {
            var controlMd = {
                    catalogControlName: 'listItem',
                    controlId: 'item_1',
                    catalogId: '123',
                    parentControlId: 'list_0',
                    parentGroupId: 'items',
                    parentGroupIndex: '1'
                },
                targetMd = {
                    controlId: 'page',
                    catalogControlName: 'page_0',
                    catalogId: '123',
                    isRootChild: function () {
                        return true;
                    }
                },
                positionData = {
                    x: 1,
                    y: 2,
                    properties: []
                };
            var promise = npCanvasElementDrop.moveAtTarget(controlMd, targetMd, positionData);
            $rootScope.$apply();
            expect(moveControlSpy.called).to.be.equal(true);
            expect(moveControlSpy.args[0][0].index).to.be.undefined;
            expect(promise).to.be.fulfilled;
        });

        //==> fourth case: we try to move a control within another control to a different position
        //targetMd: defined, listitem
        //groupId: undefined from default aggregation
        //isTargetRootChild: false, listitem is not root
        //absolute layout: yes
        //targetMd.parentControlId: the same list
        //targetMd.parentGroupId: items aggregation of list
        //targetMd.parentGroupIndex: some index
        //controlValidInAggr: no
        //groupIdEmpty || controlNotValid -> true, -> index = 2
        //(index === undefined && controlMd.parentControlId === targetMd.parentControlId && controlMd.parentGroupId === targetMd.parentGroupId) -> false
        it('should resolve promise and change the index to target-index', function () {
            var controlMd = {
                    catalogControlName: 'listItem',
                    controlId: 'item_1',
                    catalogId: '123',
                    parentControlId: 'list_0',
                    parentGroupId: 'items',
                    parentGroupIndex: '1'
                },
                targetMd = {
                    controlId: 'item_2',
                    catalogControlName: 'listItem',
                    catalogId: '123',
                    parentControlId: 'list_0',
                    parentGroupId: 'items',
                    parentGroupIndex: '2',
                    isRootChild: function () {
                        return false;
                    }
                },
                positionData = {
                    x: 1,
                    y: 2,
                    properties: []
                };
            npUiCatalogMock.getControlDefaultAggregation = function () {
                return undefined;
            };
            var promise = npCanvasElementDrop.moveAtTarget(controlMd, targetMd, positionData);
            $rootScope.$apply();
            expect(moveControlSpy.called).to.be.equal(true);
            expect(moveControlSpy.args[0][0].index).to.be.equal(targetMd.parentGroupIndex);
            expect(promise).to.be.fulfilled;
        });

        //==> fifth case: we try to move a control within another control without changing its position
        //targetMd: defined, list
        //groupId: defined from default aggregation
        //isTargetRootChild: false, list is not root
        //absolute layout: yes
        //targetMd.parentControlId: page
        //targetMd.parentGroupId: content aggregation of page
        //targetMd.parentGroupIndex: some index
        //controlValidInAggr: yes
        //groupIdEmpty || controlNotValid -> false
        //(index === undefined && controlMd.parentControlId === targetMd.controlId && controlMd.parentGroupId === defaultAggr) -> true, -> index = 1
        it('should resolve promise and maintain the controls index', function () {
            var controlMd = {
                    catalogControlName: 'listItem',
                    controlId: 'item_1',
                    catalogId: '123',
                    parentControlId: 'list_0',
                    parentGroupId: 'default',
                    parentGroupIndex: '1'
                },
                targetMd = {
                    controlId: 'list_0',
                    catalogControlName: 'list',
                    catalogId: '123',
                    parentControlId: 'page_0',
                    parentGroupId: 'content',
                    parentGroupIndex: '2',
                    isRootChild: function () {
                        return false;
                    }
                },
                positionData = {
                    x: 1,
                    y: 2,
                    properties: []
                };
            var promise = npCanvasElementDrop.moveAtTarget(controlMd, targetMd, positionData);
            $rootScope.$apply();
            expect(moveControlSpy.called).to.be.equal(true);
            expect(moveControlSpy.args[0][0].index).to.be.equal(controlMd.parentGroupIndex);
            expect(promise).to.be.fulfilled;
        });

        /*
         * tests for dropAtTarget
         * */

        //==> first case: drop some invalid control from palette onto page
        it('should reject the drop promise for invalid aggregations', function () {
            var controlMd = {
                    catalogControlName: 'not_valid_in_aggr',
                    controlId: 'button_1',
                    catalogId: '123'
                },
                targetMd = {
                    controlId: 'page',
                    catalogControlName: 'page_0',
                    catalogId: '123',
                    isRootChild: function () {
                        return true;
                    }
                },
                positionData = {
                    x: 1,
                    y: 2,
                    properties: []
                };
            npUiCatalogMock.getControlDefaultAggregation = function () {
                return undefined;
            };
            var promise = npCanvasElementDrop.dropAtTarget(controlMd, targetMd, positionData);
            $rootScope.$apply();
            expect(promise).to.be.rejected;
        });

        //==> second case: drop a valid control from palette on page
        it('should return drop promise with index undefined', function () {
            var controlMd = {
                    catalogControlName: 'sap_m_Button',
                    controlId: 'button_1',
                    catalogId: '123'
                },
                targetMd = {
                    controlId: 'page',
                    catalogControlName: 'page_0',
                    catalogId: '123',
                    isRootChild: function () {
                        return true;
                    }
                },
                positionData = {
                    x: 1,
                    y: 2,
                    properties: []
                };
            var promise = npCanvasElementDrop.dropAtTarget(controlMd, targetMd, positionData);
            $rootScope.$apply();
            expect(addControlSpy.called).to.be.equal(true);
            expect(moveControlSpy.called).to.be.equal(false);
            expect(addControlSpy.args[0][0].index).to.be.undefined;
            expect(promise).to.be.fulfilled;
        });

        //==> third case: drop a valid control from palette into another aggregation
        it('should check if add control is called with index as parent index', function () {
            var targetMd = {
                catalogControlName: 'listItem',
                controlId: 'listItem_0',
                catalogId: '123',
                parentGroupId: 'default',
                parentControlId: 'list',
                parentGroupIndex: 1,
                isRootChild: function () {
                    return false;
                }
            };
            var ctrlMd = {
                catalogControlName: 'listItem_case2',
                controlId: 'listItem_1',
                catalogId: '123'
            };
            var positionData = {
                x: 1,
                y: 2,
                properties: []
            };
            expect(addControlSpy.called).to.be.equal(false);
            npCanvasElementDrop.dropAtTarget(ctrlMd, targetMd, positionData);
            $rootScope.$apply();
            expect(addControlSpy.called).to.be.equal(true);
            expect(moveControlSpy.called).to.be.equal(false);
            expect(addControlSpy.args[0][0].index).to.be.equal(1);
        });

    });
})();

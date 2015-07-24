'use strict';
(function () {
    var expect = chai.expect,
        _ = window._;

    describe('Service: np-page-metadata-add-control', function () {
        var npPageMetadataAddControl, npPageMetadataHelperMock,
            npLayoutHelperMock, npUiCatalogMock, npPageMetadataEventsMock, pageMetadataMock, uiUtilMock;

        beforeEach(module('ngResource'));
        beforeEach(module('uiComposer.services'));

        beforeEach(function () {
            pageMetadataMock = {
                rootControlId: 'sap_m_Page_0',
                controls: [{
                    controlId: 'sap_m_Page_0',
                    catalogControlName: 'sap_m_Page',
                    catalogId: '556f6b0088fc39dfaead6099',
                    getChildrenMd: function () {
                        return [];
                    }
                }]
            };
            npPageMetadataHelperMock = {
                getControlMd: function (controlId, pageMd) {
                    return _.find(pageMd.controls, {
                        controlId: controlId
                    });
                },
                getGroupMd: function () {
                    var grpChildren = [];
                    var i = 0;
                    for (; i < pageMetadataMock.controls.length - 1; i++) {
                        grpChildren.push({});
                    }
                    return {
                        groupId: 'content',
                        children: grpChildren
                    };
                },
                setControlMdPrototype: sinon.stub(),
                adjustChildIndexes: sinon.stub()
            };
            npLayoutHelperMock = {
                isAbsoluteLayout: function () {
                    return true;
                }
            };
            npUiCatalogMock = {
                getHotspotName: function () {
                    return 'hotspot';
                },
                getControlDefaultAggregation: function () {
                    return 'content';
                },
                getControlProperties: function () {

                },
                getControlDesignProperties: function () {

                },
                getControlAggregations: function () {

                }
            };

            npPageMetadataEventsMock = {
                events: {},
                broadcast: function () {}
            };

            uiUtilMock = {
                _counter: 0,
                nextUid: function () {
                    return this._counter++;
                }
            };

            module(function ($provide) {
                $provide.value('npPageMetadataHelper', npPageMetadataHelperMock);
                $provide.value('npLayoutHelper', npLayoutHelperMock);
                $provide.value('npUiCatalog', npUiCatalogMock);
                $provide.value('npPageMetadataEvents', npPageMetadataEventsMock);
                $provide.value('uiUtil', uiUtilMock);
            });

            inject(function ($injector) {
                npPageMetadataAddControl = $injector.get('npPageMetadataAddControl');
            });
        });

        it('Should add control to page', function () {
            var groupChildernLength = pageMetadataMock.controls.length;
            npPageMetadataAddControl.addControlToPage(controlMdMock, pageMetadataMock);
            expect(pageMetadataMock.controls.length).to.be.equal(groupChildernLength + 1);
            npPageMetadataAddControl.addControlToPage(hotspotcontrolMdMock, pageMetadataMock);
            expect(pageMetadataMock.controls.length).to.be.equal(groupChildernLength + 2);
            // Sould not add same control again
            var fnFail = function () {
                npPageMetadataAddControl.addControlToPage(hotspotcontrolMdMock, pageMetadataMock);
            };
            expect(fnFail).to.throw(Error);

            expect(pageMetadataMock.controls.length).to.be.equal(groupChildernLength + 2);
        });

        it('Should get Floor plan properties in Md format', function () {
            var floorPlanProps = npPageMetadataAddControl.getFloorplanProperties(50, 60);
            expect(floorPlanProps[0].name).to.be.equal('left');
            expect(floorPlanProps[0].value).to.be.equal('50px');
            expect(floorPlanProps[1].name).to.be.equal('top');
            expect(floorPlanProps[1].value).to.be.equal('60px');
        });

        it('Should get Control Metadata from Control Def', function () {
            var getControlPropertiesSpy = sinon.spy(npUiCatalogMock, 'getControlProperties');
            var getControlDesignPropertiesSpy = sinon.spy(npUiCatalogMock, 'getControlDesignProperties');
            npPageMetadataAddControl.getControlMdObjects(buttonControlDefMock, pageMetadataMock);
            expect(getControlPropertiesSpy.called).to.be.equal(true);
            expect(getControlDesignPropertiesSpy.called).to.be.equal(true);
        });

        var controlMdMock = {
            controlId: 'np-sap_m_Button-1',
            catalogControlName: 'sap_m_Button',
            parentGroupId: 'content',
            parentControlId: 'sap_m_Page_0'
        };

        var buttonControlDefMock = {
            catalogId: '556f6b0088fc39dfaead6099',
            groupId: 'content',
            newCtrlCatalogName: 'sap_m_Button',
            parentId: 'sap_m_Page_0',
            x: 0,
            y: 0
        };

        var hotspotcontrolMdMock = {
            controlId: 'np-hotspot-1',
            catalogControlName: 'hotspot',
            parentGroupId: 'content',
            parentControlId: 'sap_m_Page_0'
        };
    });
})();

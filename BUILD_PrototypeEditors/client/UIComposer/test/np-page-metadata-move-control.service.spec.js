'use strict';
(function () {
    var expect = chai.expect;
    describe('Service: np-page-metadata-move-control', function () {
        var $q, npPageMetadataMoveControl, npPageMetadataHelperMock,
            npPageMetadataEventsMock,
            npPageMetadataAddControlMock, npPageMetadataDeleteControlMock;

        beforeEach(module('ngResource'));
        beforeEach(module('uiComposer.services'));

        beforeEach(function () {
            npPageMetadataAddControlMock = {
                addControlToPage: function () {

                },
                getFloorplanProperties: function () {

                }
            };
            npPageMetadataDeleteControlMock = {
                removeControlFromPage: function () {

                }
            };
            npPageMetadataHelperMock = {
                getControlMd: function () {
                    return buttonControlDefMock;
                }
            };

            npPageMetadataEventsMock = {
                events: {},
                broadcast: function () {}
            };
            module(function ($provide) {
                $provide.value('npPageMetadataHelper', npPageMetadataHelperMock);
                $provide.value('npPageMetadataAddControl', npPageMetadataAddControlMock);
                $provide.value('npPageMetadataDeleteControl', npPageMetadataDeleteControlMock);
                $provide.value('npPageMetadataEvents', npPageMetadataEventsMock);
            });

            inject(function ($injector) {
                npPageMetadataMoveControl = $injector.get('npPageMetadataMoveControl');
                $q = $injector.get('$q');
            });
        });

        it('Should move control on page with canvas update', function () {
            var deleteControlSpy = sinon.spy(npPageMetadataDeleteControlMock, 'removeControlFromPage'),
                addControlSpy = sinon.spy(npPageMetadataAddControlMock, 'addControlToPage');
            npPageMetadataMoveControl.performMoves([buttonControlDefMock], pageMetadataMock);

            // Move should happen by deleting and adding the control
            expect(deleteControlSpy.calledOnce).to.be.equal(true);
            expect(addControlSpy.calledOnce).to.be.equal(true);
        });

        var buttonControlDefMock = {
            catalogId: '556f6b0088fc39dfaead6099',
            groupId: 'content',
            controlId: 'np-sap_m_Button-1',
            newCtrlCatalogName: 'sap_m_Button',
            parentId: 'sap_m_Page_0',
            x: 0,
            y: 0
        };
        var pageMetadataMock = {
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
    });
})();

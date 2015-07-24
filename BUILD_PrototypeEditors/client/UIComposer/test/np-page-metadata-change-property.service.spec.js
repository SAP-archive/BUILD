'use strict';
(function () {
    var expect = chai.expect;
    describe('Service: np-page-metadata-change-property', function () {
        var npPageMetadataEventsMock, npPageMetadataChangeProperty, pageMetadataMock, controlMdMock, properties = [], npPageMetadataHelperMock,
            propertyChanges = [], propertyEditable = true;

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
                }, {
                    controlId: 'button1',
                    catalogControlName: 'sap_m_Button',
                    properties:[{name: 'width',
                        displayName: 'Width',
                        displayToUser: true,
                        value : 'auto',
                        type:'CSSSize'},
                        {name:'text', displayName:'Text',
                            value:'Button'}],
                    parentGroupId: 'content',
                    parentControlId: 'sap_m_Page_0'
                }]
            };

             controlMdMock = {
                controlId: 'button1',
                catalogControlName: 'sap_m_Button',
                properties:[{name: 'width',
                    displayName: 'Width',
                    displayToUser: true,
                    value : 'auto',
                    type:'CSSSize'},
                    {name:'text', displayName:'Text',
                        value:'Button'}],
                parentGroupId: 'content',
                parentControlId: 'sap_m_Page_0'
            };

            npPageMetadataEventsMock = {
                events: {
                    controlPropertiesChanged : 'controlPropertiesChanged'
                },
                broadcast: function () {}
            };

            npPageMetadataHelperMock = {
                getControlMd: function (controlId, pageMetadata) {
                    return _.find(pageMetadata.controls, {
                        controlId: controlId
                    });
                },
                canEditProperty:function () {
                    return propertyEditable;
                },

                getControlProperty: function () {

                }
            };
            properties = [{
                name:'width',
                value: '250px',
                displayName: 'Width',
                displayToUser: true,
                type: 'CSSSize'
            }];

            propertyChanges = [{
                properties: properties,
                propertyType:'properties',
                controlMd: controlMdMock
            }];

            module(function ($provide) {
                $provide.value('npPageMetadataEvents', npPageMetadataEventsMock);
                $provide.value('npPageMetadataHelper', npPageMetadataHelperMock)
            });

            inject(function ($injector) {
                npPageMetadataChangeProperty = $injector.get('npPageMetadataChangeProperty');
            });


        });

        it('should call propertychange event broadcast method', function () {
            var spy = sinon.spy(npPageMetadataEventsMock, 'broadcast');
            npPageMetadataChangeProperty.performPropertyChanges(propertyChanges, pageMetadataMock);
            expect(spy.calledOnce).to.be.equal(true);
        });

        it('should throw error if property is not editable based on UICatalog', function () {
            //returning property editable to be false
            propertyEditable = false;
            var fnFail = function () {
                npPageMetadataChangeProperty.performPropertyChanges(propertyChanges, pageMetadataMock);
            };
            assert.throw(fnFail, Error, 'property width cannot be edited because it is not exposed by the catalog');
        });

        it('should return successfully after property change is done', function () {
            propertyEditable = true;
            var returnChange = npPageMetadataChangeProperty.performPropertyChanges(propertyChanges, pageMetadataMock);
            expect(returnChange.length).to.be.equal(1);
            expect(returnChange).to.be.deep.equal([propertyChanges[0].controlMd])
        });

    });
})();

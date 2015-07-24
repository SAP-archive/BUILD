'use strict';
(function () {

    var expect = chai.expect;


    describe('Service: np-ui-catalog', function () {


        var npUiCatalog;
        var $httpBackend;
        var $q;
        var $rootScope;

        var npPrototypeMock = {
            getPrototype: function () {

                var defer = $q.defer();
                var prototype = {
                    catalogId: 'customCatalog123'
                };

                defer.resolve(prototype);

                return defer.promise;
            }
        };

        beforeEach(module('ngResource'));
        beforeEach(module('uiComposer.uiEditor'));

        beforeEach(function () {
            module(function ($provide) {
                $provide.value('npPrototype', npPrototypeMock);
            });

            inject(function ($injector) {
                $httpBackend = $injector.get('$httpBackend');
                npUiCatalog = $injector.get('npUiCatalog');
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                $httpBackend.whenGET('/api/uicatalogs/getCompatibleCatalogs/customCatalog123').respond(getCompatibleCatalogsResp);
            });
        });


        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should return one control of the custom catalog', inject(function () {
            npUiCatalog.getCatalogs();
            $httpBackend.flush();
            $rootScope.$apply();
            var controlName = 'sap_m_Button';
            var groupName = 'sap_m';
            var catalogId = 'customCatalog123';
            var controls = npUiCatalog.getControlsByCatalogId(catalogId);
            var keys = Object.keys(controls);
            expect(keys.length).to.be.equal(1);
            expect(controls[groupName]).to.be.an('array');
            expect(controls[groupName][0]).to.be.an('object');
            expect(controls[groupName][0].name).to.be.equal(controlName);
        }));

        it('should return the button control', inject(function () {
            npUiCatalog.getCatalogs();
            $httpBackend.flush();
            $rootScope.$apply();
            var name = 'sap_m_Button';
            var catalogId = 'customCatalog123';
            var control = npUiCatalog.getControlByName(name, catalogId);
            expect(control.name).to.be.equal(name);
        }));

        it('should return the button control type', inject(function () {
            npUiCatalog.getCatalogs();
            $httpBackend.flush();
            $rootScope.$apply();
            var name = 'sap_m_Button';
            var catalogId = 'customCatalog123';
            var type = npUiCatalog.getControlType(name, catalogId);
            expect(type).to.be.equal('sap.m.Button');
        }));


        it('should return control DisplayName', inject(function () {
            npUiCatalog.getCatalogs();
            $httpBackend.flush();
            $rootScope.$apply();
            var name = 'sap_m_Button';
            var catalogId = 'customCatalog123';
            var displayName = npUiCatalog.getControlDisplayName(name, catalogId);
            expect(displayName).to.be.equal('Button');
        }));

        it('should return aggregation DisplayName', inject(function () {
            npUiCatalog.getCatalogs();
            $httpBackend.flush();
            $rootScope.$apply();
            var name = 'sap_m_Button';
            var catalogId = 'customCatalog123';
            var displayName = npUiCatalog.getAggregationDisplayName('tooltip', name, catalogId);
            expect(displayName).to.be.equal('Tooltip');
        }));

        it('should return property displayName', inject(function () {
            npUiCatalog.getCatalogs();
            $httpBackend.flush();
            $rootScope.$apply();
            var name = 'sap_m_Button';
            var catalogId = 'customCatalog123';
            var displayName = npUiCatalog.getPropertyDisplayName('text', name, catalogId);
            expect(displayName).to.be.equal('Text');
        }));

        it('should return event displayName', inject(function () {
            npUiCatalog.getCatalogs();
            $httpBackend.flush();
            $rootScope.$apply();
            var name = 'sap_m_Button';
            var catalogId = 'customCatalog123';
            var displayName = npUiCatalog.getEventDisplayName('press', name, catalogId);
            expect(displayName).to.be.equal('Press');
        }));

        it('should return control aggregations', inject(function () {
            npUiCatalog.getCatalogs();
            $httpBackend.flush();
            $rootScope.$apply();
            var name = 'sap_m_Button';
            var catalogId = 'customCatalog123';
            var aggrs = npUiCatalog.getControlAggregations(name, catalogId);
            var keys = Object.keys(aggrs);
            expect(keys.length).to.be.equal(1);
            expect(aggrs['tooltip']).to.be.an('object');
        }));

        it('should return control properties', inject(function () {
            npUiCatalog.getCatalogs();
            $httpBackend.flush();
            $rootScope.$apply();
            var name = 'sap_m_Button';
            var catalogId = 'customCatalog123';
            var props = npUiCatalog.getControlProperties(name, catalogId);
            var keys = Object.keys(props);
            expect(keys.length).to.be.equal(8);
        }));

        it('should return control design properties', inject(function () {
            npUiCatalog.getCatalogs();
            $httpBackend.flush();
            $rootScope.$apply();
            var name = 'sap_m_Button';
            var catalogId = 'customCatalog123';
            var props = npUiCatalog.getControlDesignProperties(name, catalogId);
            var keys = Object.keys(props);
            expect(keys.length).to.be.equal(1);
            expect(props['lockAspectRatio']).to.be.an('object');
        }));

        it('should return events for given control', inject(function () {
            npUiCatalog.getCatalogs();
            $httpBackend.flush();
            $rootScope.$apply();
            var name = 'sap_m_Button';
            var catalogId = 'customCatalog123';
            var events = npUiCatalog.getControlEvents(name, catalogId);
            var keys = Object.keys(events);
            expect(keys.length).to.be.equal(1);
        }));

        it('should return defaultProperty for given control', inject(function () {
            npUiCatalog.getCatalogs();
            $httpBackend.flush();
            $rootScope.$apply();
            var name = 'sap_m_Button';
            var catalogId = 'customCatalog123';
            var p = npUiCatalog.getDefaultProperty(name, catalogId);
            expect(p).to.be.equal('text');
        }));

        it('should return the button control', inject(function () {
            npUiCatalog.getCatalogs();
            $httpBackend.flush();
            $rootScope.$apply();
            var name = 'sap_m_Button';
            var catalogId = 'customCatalog123';
            var validControls = npUiCatalog.getValidControlsForAggregation('tooltip', name, catalogId);
            var keys = Object.keys(validControls);
            expect(keys.length).to.be.equal(1);
            expect(validControls[name]).to.be.an('object');
        }));

        it('should return the button control', inject(function () {
            npUiCatalog.getCatalogs();
            $httpBackend.flush();
            $rootScope.$apply();
            var name = 'sap_m_Button';
            var catalogId = 'customCatalog123';
            var valid = npUiCatalog.isControlValidInAggregation(name, catalogId, name, catalogId, 'tooltip');
            expect(valid).to.be.true;
            valid = npUiCatalog.isControlValidInAggregation('any_control', catalogId, name, catalogId, 'tooltip');
            expect(valid).to.be.false;
        }));

        it('should return an array through promise', inject(function () {
            var promise = npUiCatalog.getCatalogs();
            var catalogs = [];
            promise.then(function (catalogList) {
                catalogs = catalogList;

            });
            $httpBackend.flush();
            $rootScope.$apply();
            expect(catalogs.length).to.be.equal(1);
            expect(catalogs).to.be.an('array');
        }));

        it('should return actions if any from the catalogs', inject(function () {
            npUiCatalog.getCatalogs();
            $httpBackend.flush();
            $rootScope.$apply();
            var actions = npUiCatalog.getActions();
            expect(actions).to.be.an('object');
        }));

        it('should return tag name', inject(function () {
            npUiCatalog.getCatalogs();
            $httpBackend.flush();
            $rootScope.$apply();
            var name = 'sap_m_Button';
            var catalogId = 'customCatalog123';
            var tag = npUiCatalog.getTagName(name, catalogId);
            expect(tag).to.be.equal('<button>');
        }));

        it('should return hotspot name', inject(function () {
            var hotspotName = npUiCatalog.getHotspotName();
            expect(hotspotName).to.be.equal('sap_norman_Hotspot');
        }));

        it('should return possible VAlues of property TYPE', inject(function () {
            npUiCatalog.getCatalogs();
            $httpBackend.flush();
            $rootScope.$apply();
            var name = 'sap_m_Button';
            var catalogId = 'customCatalog123';
            var values = npUiCatalog.getPropertyPossibleValues('type', name, catalogId);
            expect(values[2]).to.be.equal('Accept');
        }));

        it('should get prototype custom catalog id', inject(function () {
            npUiCatalog.getCatalogs();
            $httpBackend.flush();
            $rootScope.$apply();
            var catalogId = 'customCatalog123';
            var id = npUiCatalog.getPrototypeCustomCatalogId();
            expect(id).to.be.equal(catalogId);
        }));

        it('should get property isDataDriven of button-control "text" property', inject(function () {
            npUiCatalog.getCatalogs();
            $httpBackend.flush();
            $rootScope.$apply();
            var name = 'sap_m_Button';
            var catalogId = 'customCatalog123';
            var property = 'text';
            var dataDriven = npUiCatalog.isDataDriven(property, name, catalogId);
            expect(dataDriven).to.be.deep.equal(true);
        }));

        // FIXME put this into a json file please!
        var getCompatibleCatalogsResp = [{
            actions: {
                ALERT: {
                    Library: 'SAPUI5',
                    actionFn: ' alert (\'{{text}}\');',
                    actionId: 'ALERT',
                    actionParam: [{
                        paramName: 'text',
                        paramType: 'String'
                    }],
                    name: 'Alert'
                },
                'Delete Record': {
                    Library: 'SAPUI5',
                    actionFn: 'var onSuccess = jQuery.proxy(function (oData, response) { this.onNavBack(); }, this); this.getView().getModel().remove(this.sContext, null, onSuccess);',
                    actionId: 'DELETE',
                    actionParam: [],
                    name: 'Delete Record'
                },
                ListSelect: {
                    Library: 'SAPUI5',
                    actionFn: 'var oListItem = oEvent.getParameter(\'listItem\');var oBindingContext = oListItem.getBindingContext();var sPath = oBindingContext.getPath();if (sPath.substring(0, 1) == \'/\') {sPath = sPath.substring(1);} this_oRouter_navTo(\'route12\', { context : sPath }, true);',
                    actionId: 'LISTSELECT',
                    actionParam: [{
                        paramName: 'oEvent',
                        paramType: 'EVENT'
                    }],
                    name: 'ListSelect'
                },
                NAVTO: {
                    Library: 'SAPUI5',
                    actionFn: ' sap_ui_core_UIComponent_getRouterFor(this).navTo(\'{{routeName}}\');',
                    actionParam: [{
                        paramName: 'routeName',
                        paramType: 'PAGE'
                    }],
                    name: 'NAVTO'
                },
                NavBack: {
                    Library: 'SAPUI5',
                    actionFn: 'if (this.oRouter) { this_oRouter_navBack(); }',
                    actionId: 'NAVBACK',
                    actionParam: [],
                    name: 'NavBack'
                },
                PROMPT: {
                    Library: 'SAPUI5',
                    actionFn: 'prompt (\'{{text}}\');',
                    actionParam: [{
                        paramName: 'text',
                        paramType: 'String'
                    }],
                    name: 'Prompt'
                }
            },
            catalogLang: 'openui5',
            catalogName: 'rootCatalog',
            catalogVersion: '1_0',
            isRootCatalog: true,
            isDefault: true,
            catalogId: 'root123',
            libraryObjectId: '',
            libraryPublicURL: '',
            libraryURL: '/resources/sap-ui-core.js',
            libraryVersion: '1_26_6',
            controls: {
                sap_m_Button: {
                    additionalMetadata: {
                        controlTemplate: '',
                        defaultAggregation: '',
                        deprecated: false,
                        events: {
                            press: {
                                displayName: 'Press',
                                displayToUser: true,
                                name: 'press'
                            }
                        },
                        isStructuralElement: false,
                        parent: 'sap_m_Button',
                        aggregations: {
                            tooltip: {
                                name: 'tooltip',
                                isDataDriven: false,
                                displayToUser: true,
                                displayName: 'Tooltip',
                                types: ['sap_m_Label', 'sap_m_Button'],
                                renderAction: 'showPopup',
                                aggregationTemplate: {},
                                multiple: false,
                                deprecated: false
                            }
                        },
                        properties: {
                            activeIcon: {
                                defaultValue: null,
                                deprecated: false,
                                displayName: 'ActiveIcon',
                                displayToUser: true,
                                group: 'Misc',
                                groupName: '',
                                isDataDriven: false,
                                isEditable: true,
                                name: 'activeIcon',
                                possibleValues: null,
                                type: 'URI'
                            },
                            enabled: {
                                defaultValue: true,
                                deprecated: false,
                                displayName: 'Enabled',
                                displayToUser: true,
                                group: 'Behavior',
                                groupName: '',
                                isDataDriven: false,
                                isEditable: true,
                                name: 'enabled',
                                possibleValues: null,
                                type: 'boolean'
                            },
                            icon: {
                                defaultValue: null,
                                deprecated: false,
                                displayName: 'Icon',
                                displayToUser: true,
                                group: 'Appearance',
                                groupName: '',
                                isDataDriven: false,
                                isEditable: true,
                                name: 'icon',
                                possibleValues: null,
                                type: 'URI'
                            },
                            iconDensityAware: {
                                defaultValue: true,
                                deprecated: false,
                                displayName: 'IconDensityAware',
                                displayToUser: true,
                                group: 'Misc',
                                groupName: '',
                                isDataDriven: false,
                                isEditable: true,
                                name: 'iconDensityAware',
                                possibleValues: null,
                                type: 'boolean'
                            },
                            iconFirst: {
                                defaultValue: true,
                                deprecated: false,
                                displayName: 'IconFirst',
                                displayToUser: true,
                                group: 'Appearance',
                                groupName: '',
                                isDataDriven: false,
                                isEditable: true,
                                name: 'iconFirst',
                                possibleValues: null,
                                type: 'boolean'
                            },
                            text: {
                                defaultValue: 'Button Text',
                                deprecated: false,
                                displayName: 'Text',
                                displayToUser: true,
                                group: 'Misc',
                                groupName: '',
                                isDataDriven: false,
                                isEditable: true,
                                name: 'text',
                                possibleValues: null,
                                type: 'string'
                            },
                            type: {
                                defaultValue: 'Default',
                                deprecated: false,
                                displayName: 'Type',
                                displayToUser: true,
                                group: 'Appearance',
                                groupName: '',
                                isDataDriven: false,
                                isEditable: true,
                                name: 'type',
                                possibleValues: [
                                    'Default',
                                    'Back',
                                    'Accept',
                                    'Reject',
                                    'Transparent',
                                    'Up',
                                    'Unstyled',
                                    'Emphasized'
                                ],
                                type: 'sap_m_ButtonType'
                            },
                            width: {
                                defaultValue: '200px',
                                deprecated: false,
                                displayName: 'Width',
                                displayToUser: true,
                                group: 'Misc',
                                groupName: '',
                                isDataDriven: false,
                                isEditable: true,
                                name: 'width',
                                possibleValues: null,
                                type: 'CSSSize'
                            }
                        },
                        readOnlyPropertyName: 'na',
                        structuralType: '',
                        tagname: '<button>'
                    },
                    description: 'sap_m_Button',
                    displayName: 'Button',
                    displayToUser: true,
                    groupName: 'sap_m',
                    name: 'sap_m_Button'
                }
            }
        }, {
            catalogLang: 'openui5',
            catalogName: 'customCatalog',
            catalogVersion: '1_0',
            catalogId: 'customCatalog123',
            isRootCatalog: false,
            isDefault: true,
            libraryObjectId: '',
            libraryPublicURL: '',
            libraryURL: '/resources/sap-ui-core.js',
            libraryVersion: '1_26_6',
            rootCatalogId: 'root123',
            controls: {
                sap_m_Button: {
                    additionalMetadata: {
                        controlTemplate: '',
                        defaultAggregation: '',
                        deprecated: false,
                        events: {
                            press: {
                                displayName: 'Press',
                                displayToUser: true,
                                name: 'press'
                            }
                        },
                        designProperties: {
                            lockAspectRatio: {
                                type: 'boolean',
                                possibleValues: null,
                                name: 'lockAspectRatio',
                                isEditable: true,
                                displayToUser: true,
                                displayName: 'LockAspectRatio',
                                defaultValue: true
                            }
                        },
                        isStructuralElement: false,
                        parent: 'sap_m_Button',
                        aggregations: {
                            tooltip: {
                                name: 'tooltip',
                                isDataDriven: false,
                                displayToUser: true,
                                displayName: 'Tooltip',
                                types: ['sap_m_Label', 'sap_m_Button'],
                                renderAction: 'showPopup',
                                aggregationTemplate: {},
                                multiple: false,
                                deprecated: false
                            }
                        },
                        defaultProperty: 'text',
                        properties: {
                            activeIcon: {
                                defaultValue: null,
                                deprecated: false,
                                displayName: 'ActiveIcon',
                                displayToUser: true,
                                group: 'Misc',
                                groupName: '',
                                isDataDriven: false,
                                isEditable: true,
                                name: 'activeIcon',
                                possibleValues: null,
                                type: 'URI'
                            },
                            enabled: {
                                defaultValue: true,
                                deprecated: false,
                                displayName: 'Enabled',
                                displayToUser: true,
                                group: 'Behavior',
                                groupName: '',
                                isDataDriven: false,
                                isEditable: true,
                                name: 'enabled',
                                possibleValues: null,
                                type: 'boolean'
                            },
                            icon: {
                                defaultValue: null,
                                deprecated: false,
                                displayName: 'Icon',
                                displayToUser: true,
                                group: 'Appearance',
                                groupName: '',
                                isDataDriven: false,
                                isEditable: true,
                                name: 'icon',
                                possibleValues: null,
                                type: 'URI'
                            },
                            iconDensityAware: {
                                defaultValue: true,
                                deprecated: false,
                                displayName: 'IconDensityAware',
                                displayToUser: true,
                                group: 'Misc',
                                groupName: '',
                                isDataDriven: false,
                                isEditable: true,
                                name: 'iconDensityAware',
                                possibleValues: null,
                                type: 'boolean'
                            },
                            iconFirst: {
                                defaultValue: true,
                                deprecated: false,
                                displayName: 'IconFirst',
                                displayToUser: true,
                                group: 'Appearance',
                                groupName: '',
                                isDataDriven: false,
                                isEditable: true,
                                name: 'iconFirst',
                                possibleValues: null,
                                type: 'boolean'
                            },
                            text: {
                                defaultValue: 'Button Text',
                                deprecated: false,
                                displayName: 'Text',
                                displayToUser: true,
                                group: 'Misc',
                                groupName: '',
                                isDataDriven: true,
                                isEditable: true,
                                name: 'text',
                                possibleValues: null,
                                type: 'string'
                            },
                            type: {
                                defaultValue: 'Default',
                                deprecated: false,
                                displayName: 'Type',
                                displayToUser: true,
                                group: 'Appearance',
                                groupName: '',
                                isDataDriven: false,
                                isEditable: true,
                                name: 'type',
                                possibleValues: [
                                    'Default',
                                    'Back',
                                    'Accept',
                                    'Reject',
                                    'Transparent',
                                    'Up',
                                    'Unstyled',
                                    'Emphasized'
                                ],
                                type: 'sap_m_ButtonType'
                            },
                            width: {
                                defaultValue: '200px',
                                deprecated: false,
                                displayName: 'Width',
                                displayToUser: true,
                                group: 'Misc',
                                groupName: '',
                                isDataDriven: false,
                                isEditable: true,
                                name: 'width',
                                possibleValues: null,
                                type: 'CSSSize'
                            }
                        },
                        readOnlyPropertyName: 'na',
                        structuralType: '',
                        tagname: '<button>'
                    },
                    description: 'sap_m_Button',
                    displayName: 'Button',
                    displayToUser: true,
                    groupName: 'sap_m',
                    name: 'sap_m_Button'
                }
            }
        }];
    });
})();

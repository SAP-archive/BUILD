'use strict';
(function () {

    var expect = chai.expect;

    describe('Service: np-binding-helper', function () {
        beforeEach(module('uiComposer.uiCanvas'));

        var npBindingHelper, dataModelService, npConstantsMock, npPageMetadataHelperMock, npUiCatalogMock, models;
        var controlMd = {
            parentGroup: {
                groupId: 'items',
                binding: {isRelative: false, paths: [
                    {entityId: 'salesorderId', propertyId: undefined}
                ]}
            },
            getParentMd: function () {
                return {
                    getParentMd: function () {
                    }
                };
            }
        };

        models = {};

        models.model1 = {
            projectId: 'model1',
            entities: [
                {
                    _id: 'salesorderId',
                    name: 'SalesOrder',
                    nameSet: 'SalesOrderSet',
                    label: 'SalesOrder',
                    groups: [],
                    tags: [],
                    isReadOnly: false,
                    properties: [
                        {
                            _id: 'id',
                            name: 'ID',
                            label: 'ID',
                            propertyType: 'String',
                            order: 1,
                            isForeignKey: false,
                            tags: [],
                            calculated: {
                                inputProperties: []
                            },
                            isNullable: true,
                            isKey: true,
                            isReadOnly: false
                        },
                        {
                            _id: 'nameId',
                            name: 'Name',
                            label: 'Name',
                            propertyType: 'String',
                            order: 2,
                            isForeignKey: false,
                            tags: [],
                            calculated: {
                                inputProperties: []
                            },
                            isNullable: true,
                            isKey: false,
                            isReadOnly: false
                        },
                        {
                            _id: 'dateId',
                            name: 'Date',
                            label: 'Date',
                            propertyType: 'DateTime',
                            order: 3,
                            isForeignKey: false,
                            tags: [],
                            calculated: {
                                inputProperties: []
                            },
                            isNullable: true,
                            isKey: false,
                            isReadOnly: false
                        },
                        {
                            _id: 'amountId',
                            name: 'Amount',
                            label: 'Amount',
                            propertyType: 'Decimal',
                            order: 4,
                            isForeignKey: false,
                            tags: [],
                            calculated: {
                                inputProperties: []
                            },
                            isNullable: true,
                            isKey: false,
                            isReadOnly: false
                        },
                        {
                            _id: 'currencyId',
                            name: 'Currency',
                            label: 'Currency',
                            propertyType: 'String',
                            order: 5,
                            isForeignKey: false,
                            tags: [],
                            calculated: {
                                inputProperties: []
                            },
                            isNullable: true,
                            isKey: false,
                            isReadOnly: false
                        },
                        {
                            _id: 'salesId',
                            name: 'Sales',
                            label: 'Sales',
                            propertyType: 'Int16',
                            order: 5,
                            isForeignKey: false,
                            tags: [],
                            calculated: {
                                inputProperties: []
                            },
                            isNullable: true,
                            isKey: false,
                            isReadOnly: false
                        },
                        {
                            _id: 'deliveredId',
                            name: 'Delivered',
                            label: 'Delivered',
                            propertyType: 'Boolean',
                            order: 5,
                            isForeignKey: false,
                            tags: [],
                            calculated: {
                                inputProperties: []
                            },
                            isNullable: true,
                            isKey: false,
                            isReadOnly: false
                        }
                    ]
                }
            ]
        };

        models.model2 = {
            projectId: 'model2',
            entities: [
                {
                    _id: 'entity1Id',
                    name: 'Entity1',
                    nameSet: 'Entity1Set',
                    label: 'Entity1',
                    navigationProperties: [
                        {
                            _id: 'Entity1_To_2_1_nId',
                            toEntityId: 'entity2Id',
                            name: 'Entity1_To_2_1_n',
                            referentialConstraints: [
                                {
                                    entityId: 'entity1Id',
                                    propertyRef: 'Entity1IDId'
                                },
                                {
                                    entityId: 'entity2Id',
                                    propertyRef: '___Entity1_Entity1_To_2_1_n_IDId'
                                }
                            ],
                            isReadOnly: false,
                            multiplicity: true
                        },
                        {
                            _id: 'Entity1_To_2_2_nId',
                            toEntityId: 'entity2Id',
                            name: 'Entity1_To_2_2_n',
                            referentialConstraints: [
                                {
                                    entityId: 'entity1Id',
                                    propertyRef: 'Entity1IDId'
                                },
                                {
                                    entityId: 'entity2Id',
                                    propertyRef: '___Entity1_Entity1_To_2_2_n_IDId'
                                }
                            ],
                            isReadOnly: false,
                            multiplicity: true
                        },
                        {
                            _id: 'Entity1_To_4_1_1Id',
                            toEntityId: 'entity4Id',
                            name: 'Entity1_To_4_1_1',
                            referentialConstraints: [
                                {
                                    entityId: 'entity1Id',
                                    propertyRef: 'Entity1IDId'
                                },
                                {
                                    entityId: 'entity4Id',
                                    propertyRef: '___Entity1_Entity1_To_4_1_1_IDId'
                                }
                            ],
                            isReadOnly: false,
                            multiplicity: false
                        }
                    ],
                    properties: [
                        {
                            _id: 'Entity1IDId',
                            name: 'ID',
                            label: 'ID',
                            order: 1,
                            isForeignKey: false,
                            isAsset: false,
                            isNullable: false,
                            isKey: true,
                            isReadOnly: false,
                            propertyType: 'String'
                        }
                    ],
                    isReadOnly: false
                },
                {
                    _id: 'entity2Id',
                    name: 'Entity2',
                    nameSet: 'Entity2Set',
                    label: 'Entity2',
                    navigationProperties: [
                        {
                            _id: 'Entity2_To_3_1_1Id',
                            toEntityId: 'entity3Id',
                            name: 'Entity2_To_3_1_1',
                            referentialConstraints: [
                                {
                                    entityId: 'entity3Id',
                                    propertyRef: 'Entity3IDId'
                                },
                                {
                                    entityId: 'entity2Id',
                                    propertyRef: '___Entity2_Entity2_To_3_1_1_IDId'
                                }
                            ],
                            isReadOnly: false,
                            multiplicity: false
                        }
                    ],
                    properties: [
                        {
                            _id: 'Entity2IDId',
                            name: 'ID',
                            label: 'ID',
                            order: 1,
                            isForeignKey: false,
                            isAsset: false,
                            isNullable: false,
                            isKey: true,
                            isReadOnly: false,
                            propertyType: 'String'
                        },
                        {
                            _id: '___Entity1_Entity1_To_2_1_n_IDId',
                            name: '___Entity1_Entity1_To_2_1_n_ID',
                            label: '___Entity1_Entity1_To_2_1_n_ID',
                            order: 2,
                            isForeignKey: true,
                            isAsset: false,
                            isNullable: false,
                            isKey: false,
                            isReadOnly: false,
                            propertyType: 'String'
                        },
                        {
                            _id: '___Entity1_Entity1_To_2_2_n_IDId',
                            name: '___Entity1_Entity1_To_2_2_n_ID',
                            label: '___Entity1_Entity1_To_2_2_n_ID',
                            order: 3,
                            isForeignKey: true,
                            isAsset: false,
                            isNullable: false,
                            isKey: false,
                            isReadOnly: false,
                            propertyType: 'String'
                        },
                        {
                            _id: '___Entity2_Entity2_To_3_1_1_IDId',
                            name: '___Entity2_Entity2_To_3_1_1_ID',
                            label: '___Entity2_Entity2_To_3_1_1_ID',
                            order: 4,
                            isForeignKey: true,
                            isAsset: false,
                            isNullable: false,
                            isKey: false,
                            isReadOnly: false,
                            propertyType: 'String'
                        }
                    ],
                    isReadOnly: false
                },
                {
                    _id: 'entity3Id',
                    name: 'Entity3',
                    nameSet: 'Entity3Set',
                    label: 'Entity3',
                    navigationProperties: [],
                    properties: [
                        {
                            _id: 'Entity3IDId',
                            name: 'ID',
                            label: 'ID',
                            order: 1,
                            isForeignKey: false,
                            isAsset: false,
                            isNullable: false,
                            isKey: true,
                            isReadOnly: false,
                            propertyType: 'String'
                        }
                    ],
                    isReadOnly: false
                },
                {
                    _id: 'entity4Id',
                    name: 'Entity4',
                    nameSet: 'Entity4Set',
                    label: 'Entity4',
                    navigationProperties: [
                        {
                            _id: 'Entity4_To_5_1_nId',
                            toEntityId: 'entity5Id',
                            name: 'Entity4_To_5_1_n',
                            referentialConstraints: [
                                {
                                    entityId: 'entity4Id',
                                    propertyRef: 'Entity4DId'
                                },
                                {
                                    entityId: 'entity5Id',
                                    propertyRef: '___Entity4_Entity5_IDId'
                                }
                            ],
                            isReadOnly: false,
                            multiplicity: true
                        }
                    ],
                    properties: [
                        {
                            _id: 'Entity4DId',
                            name: 'ID',
                            label: 'ID',
                            order: 1,
                            isForeignKey: false,
                            isAsset: false,
                            isNullable: false,
                            isKey: true,
                            isReadOnly: false,
                            propertyType: 'String'
                        },
                        {
                            _id: '___Entity1_Entity1_To_4_1_1_IDId',
                            name: '___Entity1_Entity1_To_4_1_1_ID',
                            label: '___Entity1_Entity1_To_4_1_1_ID',
                            order: 2,
                            isForeignKey: true,
                            isAsset: false,
                            isNullable: false,
                            isKey: false,
                            isReadOnly: false,
                            propertyType: 'String'
                        }
                    ],
                    isReadOnly: false
                },
                {
                    _id: 'entity5Id',
                    name: 'Entity5',
                    nameSet: 'Entity5Set',
                    label: 'Entity5',
                    navigationProperties: [],
                    properties: [
                        {
                            _id: 'Entity5IDId',
                            name: 'ID',
                            label: 'ID',
                            order: 1,
                            isForeignKey: false,
                            isAsset: false,
                            isNullable: false,
                            isKey: true,
                            isReadOnly: false,
                            propertyType: 'String'
                        },
                        {
                            _id: '___Entity4_Entity5_IDId',
                            name: '___Entity4_Entity5_ID',
                            label: '___Entity4_Entity5_ID',
                            order: 2,
                            isForeignKey: true,
                            isAsset: false,
                            isNullable: false,
                            isKey: false,
                            isReadOnly: false,
                            propertyType: 'String'
                        }
                    ],
                    isReadOnly: false
                }
            ]
        };

        dataModelService = {
            get: function (params, onSuccessModelLoaded) {
                onSuccessModelLoaded(models[params.id]);
            }
        };

        npConstantsMock = {
            localFeatureToggle: {
                dataModeler: true
            }
        };
        npPageMetadataHelperMock = {
            getContainingGroupMd: function (md) {
                return md ? md.parentGroup : undefined;
            },
            isBound: function (group) {
                return !!group && group.binding && group.binding.paths.length;
            }
        };
        npUiCatalogMock = {
            getAggregationContextProperty: function (aggregationName) {
                return (aggregationName === 'contextProperty') ? 'contextProperty' : undefined;
            },
            isContextProperty: function (propertyName/*, controlName, catalogId*/) {
                return propertyName === 'contextProperty';
            },
            isLinkProperty: function (propertyName/*, controlName, catalogId*/) {
                return propertyName === 'linkProperty';
            },
            isDataDriven: function () {
                return true;
            }
        };

        beforeEach(module('ngResource'));
        beforeEach(module(function ($provide) {
            $provide.value('dm.Model', dataModelService);
            $provide.value('npConstants', npConstantsMock);
            $provide.value('npPageMetadataHelper', npPageMetadataHelperMock);
            $provide.value('npUiCatalog', npUiCatalogMock);
        }));

        beforeEach(inject(function ($injector) {
            npBindingHelper = $injector.get('npBindingHelper');
        }));

        it('Get paths compatible with entity', function () {
            npBindingHelper.initEntities('model2');
            var result = [
                {
                    path: '/Entity1Set',
                    name: '/Entity1Set',
                    binding: {
                        isRelative: false,
                        paths: [
                            {
                                entityId: 'entity1Id',
                                propertyId: undefined
                            }
                        ]
                    }
                }
            ];
            expect(result).to.deep.equal(npBindingHelper.getPathsCompatibleWithEntity(undefined, 'Entity1'));
            result = [
                {
                    path: 'Entity1_To_2_1_n',
                    name: 'Entity1_To_2_1_n',
                    binding: {
                        isRelative: true,
                        paths: [
                            {
                                entityId: 'entity1Id',
                                propertyId: 'Entity1_To_2_1_nId'
                            }
                        ]
                    }
                },
                {
                    path: 'Entity1_To_2_2_n',
                    name: 'Entity1_To_2_2_n',
                    binding: {
                        isRelative: true,
                        paths: [
                            {
                                entityId: 'entity1Id',
                                propertyId: 'Entity1_To_2_2_nId'
                            }
                        ]
                    }
                },
                {
                    path: 'Entity1_To_4_1_1/Entity4_To_5_1_n',
                    name: 'Entity1_To_4_1_1/Entity4_To_5_1_n',
                    binding: {
                        isRelative: true,
                        paths: [
                            {
                                entityId: 'entity1Id',
                                propertyId: 'Entity1_To_4_1_1Id'
                            },
                            {
                                entityId: 'entity4Id',
                                propertyId: 'Entity4_To_5_1_nId'
                            }
                        ]
                    }
                }
            ];
            expect(result).to.deep.equal(npBindingHelper.getPathsCompatibleWithEntity({relative: false, paths: [
                {entityId: 'entity1Id'}
            ]}, 'Entity2'));
            result = [
                {
                    path: 'Entity1_To_4_1_1/Entity4_To_5_1_n',
                    name: 'Entity1_To_4_1_1/Entity4_To_5_1_n',
                    binding: {
                        isRelative: true,
                        paths: [
                            {
                                entityId: 'entity1Id',
                                propertyId: 'Entity1_To_4_1_1Id'
                            },
                            {
                                entityId: 'entity4Id',
                                propertyId: 'Entity4_To_5_1_nId'
                            }
                        ]
                    }
                }
            ];

            expect(result).to.deep.equal(npBindingHelper.getPathsCompatibleWithEntity({paths: [
                {entityId: 'entity1Id'}
            ]}, 'Entity5'));
            expect([]).to.deep.equal(npBindingHelper.getPathsCompatibleWithEntity({paths: [
                {entityId: 'entity1Id'}
            ]}, ''));
            expect([]).to.deep.equal(npBindingHelper.getPathsCompatibleWithEntity(undefined, ''));
        });

        it('Get possible paths for a group', function () {
            npBindingHelper.initEntities('model1');
            var groupPossiblePaths = [
                {
                    path: '/SalesOrderSet',
                    name: '/SalesOrderSet',
                    binding: {isRelative: false, paths: [
                        {entityId: 'salesorderId', propertyId: undefined}
                    ]}
                }
            ];
            var result = npBindingHelper.getGroupPathsFromMd();
            expect(result).to.deep.equal(groupPossiblePaths);
        });

        it('Get possible paths for a context property (smart template only)', function () {
            npBindingHelper.initEntities('model2');
            var controlMdForContextProperty = {
                getParentMd: function () {
                }
            };

            var ctrlProperty = {
                type: 'string',
                name: 'contextProperty'
            };

            var contextPropertyPossiblePaths = [
                {
                    path: 'Entity1_To_2_1_n',
                    name: 'Entity1_To_2_1_n',
                    isEntity: true,
                    binding: {
                        isRelative: true,
                        paths: [
                            {entityId: 'entity1Id', propertyId: 'Entity1_To_2_1_nId'}
                        ]
                    }
                },
                {
                    path: 'Entity1_To_2_2_n',
                    name: 'Entity1_To_2_2_n',
                    isEntity: true,
                    binding: {
                        isRelative: true,
                        paths: [
                            {entityId: 'entity1Id', propertyId: 'Entity1_To_2_2_nId'}
                        ]
                    }
                }
            ];
            var result = npBindingHelper.getPropertyPathsFromMd(ctrlProperty, controlMdForContextProperty, 'entity1Id');
            expect(result).to.deep.equal(contextPropertyPossiblePaths);
        });

        it('Get possible paths for a property under a group that have a context property (smart template only)', function () {
            npBindingHelper.initEntities('model2');
            var controlMdForContextProperty = {
                parentGroup: {
                    groupId: 'contextProperty',
                    contextProperty: 'contextProperty'
                },
                getParentMd: function () {
                    return {
                        properties: [
                            {
                                name: 'contextProperty',
                                binding: {isRelative: false, paths: [
                                    {entityId: 'entity1Id', propertyId: undefined}
                                ]}
                            }
                        ],
                        getParentMd: function () {
                        }
                    };
                }
            };
            var ctrlProperty = {
                type: 'string',
                name: 'text'
            };

            var contextPropertyPossiblePaths = [
                {
                    path: 'ID',
                    name: 'ID',
                    group: 'Entity1',
                    entityName: 'Entity1',
                    isCurrentEntity: true,
                    binding: {
                        isRelative: true,
                        paths: [
                            { entityId: 'entity1Id', propertyId: 'Entity1IDId' }
                        ]
                    }
                },
                {
                    path: 'Entity1_To_4_1_1/ID',
                    name: 'ID',
                    group: 'Entity4 (Entity1_To_4_1_1)',
                    entityName: 'Entity4',
                    binding: {
                        isRelative: true,
                        paths: [
                            { entityId: 'entity1Id', propertyId: 'Entity1_To_4_1_1Id'},
                            { entityId: 'entity4Id', propertyId: 'Entity4DId'}
                        ]
                    }
                }
            ];
            var result = npBindingHelper.getPropertyPathsFromMd(ctrlProperty, controlMdForContextProperty);
            expect(result).to.deep.equal(contextPropertyPossiblePaths);
        });

        it('Get possible paths for a control property of type string', function () {
            npBindingHelper.initEntities('model1');
            var propertyPossiblePaths = [
                {
                    path: 'ID',
                    name: 'ID',
                    group: 'SalesOrder',
                    entityName: 'SalesOrder',
                    isCurrentEntity: true,
                    binding: {isRelative: true, paths: [
                        {entityId: 'salesorderId', propertyId: 'id'}
                    ]}
                },
                {
                    path: 'Name',
                    name: 'Name',
                    group: 'SalesOrder',
                    entityName: 'SalesOrder',
                    isCurrentEntity: true,
                    binding: {isRelative: true, paths: [
                        {entityId: 'salesorderId', propertyId: 'nameId'}
                    ]}
                },
                {
                    path: 'Date',
                    name: 'Date',
                    group: 'SalesOrder',
                    entityName: 'SalesOrder',
                    isCurrentEntity: true,
                    binding: {isRelative: true, paths: [
                        {entityId: 'salesorderId', propertyId: 'dateId'}
                    ]}
                },
                {
                    path: 'Amount',
                    name: 'Amount',
                    group: 'SalesOrder',
                    entityName: 'SalesOrder',
                    isCurrentEntity: true,
                    binding: {isRelative: true, paths: [
                        {entityId: 'salesorderId', propertyId: 'amountId'}
                    ]}
                },
                {
                    path: 'Currency',
                    name: 'Currency',
                    group: 'SalesOrder',
                    entityName: 'SalesOrder',
                    isCurrentEntity: true,
                    binding: {isRelative: true, paths: [
                        {entityId: 'salesorderId', propertyId: 'currencyId'}
                    ]}
                },
                {
                    path: 'Sales',
                    name: 'Sales',
                    group: 'SalesOrder',
                    entityName: 'SalesOrder',
                    isCurrentEntity: true,
                    binding: {isRelative: true, paths: [
                        {entityId: 'salesorderId', propertyId: 'salesId'}
                    ]}
                }
            ];
            var ctrlProperty = {
                type: 'string'
            };
            var result = npBindingHelper.getPropertyPathsFromMd(ctrlProperty, controlMd);
            expect(result).to.deep.equal(propertyPossiblePaths);
        });

        it('Get possible paths for a control property of type float', function () {
            npBindingHelper.initEntities('model1');
            var propertyPossiblePaths = [
                {
                    path: 'Amount',
                    name: 'Amount',
                    group: 'SalesOrder',
                    entityName: 'SalesOrder',
                    isCurrentEntity: true,
                    binding: {isRelative: true, paths: [
                        {entityId: 'salesorderId', propertyId: 'amountId'}
                    ]}
                },
                {
                    path: 'Sales',
                    name: 'Sales',
                    group: 'SalesOrder',
                    entityName: 'SalesOrder',
                    isCurrentEntity: true,
                    binding: {isRelative: true, paths: [
                        {entityId: 'salesorderId', propertyId: 'salesId'}
                    ]}
                }
            ];
            var ctrlProperty = {
                type: 'float'
            };
            var result = npBindingHelper.getPropertyPathsFromMd(ctrlProperty, controlMd);
            expect(result).to.deep.equal(propertyPossiblePaths);
        });

        it('Get possible paths for a control property of type int', function () {
            npBindingHelper.initEntities('model1');
            var propertyPossiblePaths = [
                {
                    path: 'Sales',
                    name: 'Sales',
                    group: 'SalesOrder',
                    entityName: 'SalesOrder',
                    isCurrentEntity: true,
                    binding: {isRelative: true, paths: [
                        {entityId: 'salesorderId', propertyId: 'salesId'}
                    ]}
                }
            ];
            var ctrlProperty = {
                type: 'int'
            };
            var result = npBindingHelper.getPropertyPathsFromMd(ctrlProperty, controlMd);
            expect(result).to.deep.equal(propertyPossiblePaths);
        });

        it('Get possible paths for a control property of type boolean', function () {
            npBindingHelper.initEntities('model1');
            var propertyPossiblePaths = [
                {
                    path: 'Delivered',
                    name: 'Delivered',
                    group: 'SalesOrder',
                    entityName: 'SalesOrder',
                    isCurrentEntity: true,
                    binding: {isRelative: true, paths: [
                        {entityId: 'salesorderId', propertyId: 'deliveredId'}
                    ]}
                }
            ];
            var ctrlProperty = {
                type: 'boolean'
            };
            var result = npBindingHelper.getPropertyPathsFromMd(ctrlProperty, controlMd);
            expect(result).to.deep.equal(propertyPossiblePaths);
        });

        it('Get possible paths for a control property of type object (date)', function () {
            npBindingHelper.initEntities('model1');
            var propertyPossiblePaths = [
                {
                    path: 'Date',
                    name: 'Date',
                    group: 'SalesOrder',
                    entityName: 'SalesOrder',
                    isCurrentEntity: true,
                    binding: {isRelative: true, paths: [
                        {entityId: 'salesorderId', propertyId: 'dateId'}
                    ]}
                }
            ];
            var ctrlProperty = {
                type: 'object'
            };
            var result = npBindingHelper.getPropertyPathsFromMd(ctrlProperty, controlMd);
            expect(result).to.deep.equal(propertyPossiblePaths);
        });

        it('Test getAllEntities', function () {
            npBindingHelper.initEntities('model2');
            var expectedResult = [
                {_id: 'entity1Id', name: 'Entity1'},
                {_id: 'entity2Id', name: 'Entity2'},
                {_id: 'entity3Id', name: 'Entity3'},
                {_id: 'entity4Id', name: 'Entity4'},
                {_id: 'entity5Id', name: 'Entity5'}
            ];
            var result = npBindingHelper.getAllEntities();
            expect(result).to.deep.equal(expectedResult);
        });

        it('Test getExpandPaths', function () {
            npBindingHelper.initEntities('model2');
            var expectedResult = ['Entity1_To_2_1_n', 'Entity1_To_2_2_n/Entity2_To_3_1_1', 'Entity1_To_4_1_1'];
            var result = npBindingHelper.getExpandPaths('/Entity1Set(\'entity1_1\')', ['Entity1_To_2_1_n/ID', 'Entity1_To_2_2_n/Entity2_To_3_1_1/ID', 'Entity1_To_4_1_1/ID']);
            expect(result).to.deep.equal(expectedResult);
        });

        it('Test data modeler feature toggle enabled', function () {
            var propertyPossiblePaths = [
                {
                    path: 'Date',
                    name: 'Date',
                    group: 'SalesOrder',
                    entityName: 'SalesOrder',
                    isCurrentEntity: true,
                    binding: {isRelative: true, paths: [
                        {entityId: 'salesorderId', propertyId: 'dateId'}
                    ]}
                }
            ];
            npConstantsMock.localFeatureToggle.dataModeler = true;
            npBindingHelper.initEntities('model1');
            expect(npBindingHelper.dataModel).to.be.equal(undefined);
            expect(npBindingHelper.entitySetMap).to.be.equal(undefined);
            var ctrlProperty = {
                type: 'object'
            };
            var result = npBindingHelper.getPropertyPathsFromMd(ctrlProperty, controlMd);
            expect(result).to.deep.equal(propertyPossiblePaths);
        });

        it('Test data modeler feature toggle disabled', function () {
            npConstantsMock.localFeatureToggle.dataModeler = false;
            npBindingHelper.initEntities('model1');
            var ctrlProperty = {
                type: 'object'
            };
            var result = npBindingHelper.getPropertyPathsFromMd(ctrlProperty, controlMd);
            // Reactivate the datamodeler feature for the next tests to work
            npConstantsMock.localFeatureToggle.dataModeler = true;
            expect(result).to.be.equal(undefined);
        });
    });
})();

'use strict';

var htmlparser = require('htmlparser');
var commonServer = require('norman-common-server');
var logger = commonServer.logging.createLogger('catalog-service');

function getCatalogInfo(context, catalog) {
    context.service = htmlparser.DomUtils.getElementsByTagName('Schema', context.dom)[0];
    if (!context.service) {
        catalog = null;
        return false;
    }
    context.serviceName = context.service.attribs.Namespace;

    catalog.odataServiceName = context.serviceName;
    catalog.odataVersion = htmlparser.DomUtils.getElementsByTagName('edmx:DataServices', context.dom)[0].attribs['m:DataServiceVersion'];

    catalog.entities = [];
    catalog.complexTypes = [];
    catalog.functions = [];
    catalog.associations = [];

    return true;
}

function getAssociation(context) {
    var xmlAssociations = htmlparser.DomUtils.getElementsByTagName('Association', context.service);
    var xmlAssociationSets = htmlparser.DomUtils.getElementsByTagName('AssociationSet', context.service);

    context.associations = {};

    xmlAssociations.forEach(function (xmlAssociation) {
        var associationName = context.serviceName + '.' + xmlAssociation.attribs.Name;

        xmlAssociationSets.forEach(function (xmlAssociationSet) {
            if (associationName === xmlAssociationSet.attribs.Association) {
                var name = context.serviceName + '.' + xmlAssociation.attribs.Name;
                context.associations[name] = {
                    relationship: xmlAssociation.attribs.Name,
                    relationshipSet: xmlAssociationSet.attribs.Name,
                    creatable: xmlAssociationSet.attribs['sap:creatable'] === 'true',
                    updatable: xmlAssociationSet.attribs['sap:updatable'] === 'true',
                    deletable: xmlAssociationSet.attribs['sap:deletable'] === 'true',
                    referentialConstraints: []
                };

                var associationEnds = htmlparser.DomUtils.getElementsByTagName('End', xmlAssociation);
                var associationSetEnds = htmlparser.DomUtils.getElementsByTagName('End', xmlAssociationSet);
                associationEnds.forEach(function (end) {
                    associationSetEnds.forEach(function (end2) {
                        if (end.attribs.Role === end2.attribs.Role) {
                            context.associations[name][end.attribs.Role] = end.attribs;
                        }
                    });
                });

                var xmlReferentialConstraint = htmlparser.DomUtils.getElementsByTagName('ReferentialConstraint', xmlAssociation);

                if (xmlReferentialConstraint) {
                    var process = function (element) {
                        var xmlPropertyRefs = htmlparser.DomUtils.getElementsByTagName('PropertyRef', element);
                        var xmlRole = element.attribs.Role;
                        xmlPropertyRefs.forEach(function (xmlPropertyRef) {
                            context.associations[name].referentialConstraints.push({
                                roleName: xmlRole,
                                propertyRef: xmlPropertyRef.attribs.Name
                            });
                        });
                    };

                    htmlparser.DomUtils.getElementsByTagName('Principal', xmlReferentialConstraint).forEach(process);
                    htmlparser.DomUtils.getElementsByTagName('Dependent', xmlReferentialConstraint).forEach(process);
                }
            }
        });
    });
}

function getEntity(context, catalog) {
    var xmlEntityTypes = htmlparser.DomUtils.getElementsByTagName('EntityType', context.dom);
    var xmlEntitySets = htmlparser.DomUtils.getElementsByTagName('EntitySet', context.dom);

    context.entities = {};

    xmlEntityTypes.forEach(function (xmlEntityType) {
        var EntityTypeName = context.serviceName + '.' + xmlEntityType.attribs.Name;

        xmlEntitySets.forEach(function (xmlEntitySet) {
            if (xmlEntitySet.attribs) {
                if (EntityTypeName === xmlEntitySet.attribs.EntityType) {
                    var entity = {
                        name: xmlEntityType.attribs.Name,
                        nameSet: xmlEntitySet.attribs.Name,
                        isRoot: false,
                        media: xmlEntityType.attribs['m:HasStream'] === 'true',
                        creatable: xmlEntitySet.attribs['sap:creatable'] === 'true',
                        updatable: xmlEntitySet.attribs['sap:updatable'] === 'true',
                        deletable: xmlEntitySet.attribs['sap:deletable'] === 'true',
                        readable: xmlEntitySet.attribs['sap:readable'] === 'true',
                        pageable: xmlEntitySet.attribs['sap:pageable'] === 'true',
                        addressable: xmlEntitySet.attribs['sap:addressable'] === 'true',
                        semantics: xmlEntityType.attribs['sap:semantics'],
                        label: xmlEntitySet.attribs['sap:label'],
                        properties: [],
                        navigationProperties: [],
                        groups: [],
                        tags: []
                    };

                    createTags(xmlEntityType.attribs, entity.tags);

                    catalog.entities.push(entity);

                    context.entities[xmlEntityType.attribs.Name] = entity;
                }
            }
        });
    });
}

function getComplexType(context, catalog) {
    var xmlComplexTypes = htmlparser.DomUtils.getElementsByTagName('ComplexType', context.service);

    xmlComplexTypes.forEach(function (xmlComplexType) {
        var complexType = {
            name: xmlComplexType.attribs.Name,
            properties: []
        };

        var xmlProperties = htmlparser.DomUtils.getElementsByTagName('Property', xmlComplexType);
        xmlProperties.forEach(function (xmlProperty) {
            complexType.properties.push(createProperty(xmlProperty.attribs));

        });

        catalog.complexTypes.push(complexType);
    });
}

function createProperty(xmlProperty, keys) {
    var property = {
        name: xmlProperty.Name,
        isNullable: xmlProperty.Nullable === 'true',
        propertyType: xmlProperty.Type,
        tags: []
    };

    if (keys) { // Property in entity. It's not ComplexType
        property.isKey = keys.hasOwnProperty(xmlProperty.Name);
        property.isETag = xmlProperty.ConcurrencyMode === 'Fixed';
    }

    if (xmlProperty.MaxLength) {
        property.maxLength = parseInt(xmlProperty.MaxLength, 10);
    }

    if (xmlProperty.Precision) {
        property.precision = parseInt(xmlProperty.Precision, 10);
    }

    if (xmlProperty.Scale) {
        property.scale = parseInt(xmlProperty.Scale, 10);
    }

    if (xmlProperty.Default) {
        property.default = xmlProperty.Default;
    }

    if (xmlProperty['sap:semantics']) {
        property.semantics = xmlProperty['sap:semantics'];
    }

    if (xmlProperty['sap:unit']) {
        property.unit = xmlProperty['sap:unit'];
    }

    if (xmlProperty['sap:field-control']) {
        property['field-control'] = xmlProperty['sap:field-control'];
    }

    if (xmlProperty['sap:label']) {
        property.label = xmlProperty['sap:label'];
    }
    if (xmlProperty.Default) {
        property.default = parseInt(xmlProperty.Default, 10);
    }

    property.creatable = !!xmlProperty['sap:creatable'] ? xmlProperty['sap:creatable'] === 'true' : true;
    property.updatable = !!xmlProperty['sap:updatable'] ? xmlProperty['sap:updatable'] === 'true' : true;

    createTags(xmlProperty, property.tags);

    return property;
}

function getProperties(context) {
    var xmlEntityTypes = htmlparser.DomUtils.getElementsByTagName('EntityType', context.service);

    xmlEntityTypes.forEach(function (xmlEntityType) {
        var entityName = xmlEntityType.attribs.Name;


        var keys = {};
        var xmlPropertyRefs = htmlparser.DomUtils.getElementsByTagName('PropertyRef', xmlEntityType);
        xmlPropertyRefs.forEach(function (xmlPropertyRef) {
            keys[xmlPropertyRef.attribs.Name] = true;

        });

        var entity = context.entities[entityName];
        var xmlProperties = htmlparser.DomUtils.getElementsByTagName('Property', xmlEntityType);
        var groups = {_units: []};
        xmlProperties.forEach(function (xmlProperty) {
            entity.properties.push(createProperty(xmlProperty.attribs, keys));
            lookupGroups(groups, xmlProperty.attribs);
        });
        createGroups(entity, groups);
    });
}

function getNavigationProperties(context) {
    var xmlEntityTypes = htmlparser.DomUtils.getElementsByTagName('EntityType', context.service);
    xmlEntityTypes.forEach(function (xmlEntityType) {
        var entityName = xmlEntityType.attribs.Name;

        var entity = context.entities[entityName];

        var xmlNavProps = htmlparser.DomUtils.getElementsByTagName('NavigationProperty', xmlEntityType);
        xmlNavProps.forEach(function (xmlNavigationProperty) {
            var association = context.associations[xmlNavigationProperty.attribs.Relationship];

            var navProp = {
                name: xmlNavigationProperty.attribs.Name,
                multiplicity: association[xmlNavigationProperty.attribs.ToRole].Multiplicity === '*',
                toEntity: association[xmlNavigationProperty.attribs.ToRole].Type.replace(context.serviceName + '.', ''),
                relationship: xmlNavigationProperty.attribs.Relationship,
                relationshipSet: association.relationshipSet,
                FromRole: xmlNavigationProperty.attribs.FromRole,
                ToRole: xmlNavigationProperty.attribs.ToRole,
                creatable: association.creatable,
                updatable: association.updatable,
                deletable: association.deletable,
                referentialConstraints: association.referentialConstraints
            };

            entity.navigationProperties.push(navProp);
        });
    });
}

exports.getCatalog = function (metadata) {
    var context = {}, catalog = {};

    try {
        var handler = new htmlparser.DefaultHandler(function (error, dom) {
            if (error) {
                catalog = null;
            }
            else {
                context.dom = dom;

                // get catalog info
                if (getCatalogInfo(context, catalog)) {

                    // get association
                    getAssociation(context);

                    // get entitySet
                    getEntity(context, catalog);

                    // Complex Type
                    getComplexType(context, catalog);

                    // get Properties
                    getProperties(context, catalog);

                    // get navigation properties
                    getNavigationProperties(context, catalog);

                    // get function
                    getFunction(context, catalog);
                }
                else {
                    catalog = null;
                }
            }

        }, { verbose: false, ignoreWhitespace: true });

        var parser = new htmlparser.Parser(handler);
        parser.parseComplete(metadata);
    }
    catch (err) {
        logger.error(err);
        catalog = null;
    }

    return catalog;
};

function getFunction(context, catalog) {
    var xmlFunctionImports = htmlparser.DomUtils.getElementsByTagName('FunctionImport', context.service);

    xmlFunctionImports.forEach(function (xmlFunctionImport) {
        var functionImport = {
            name: xmlFunctionImport.attribs.Name,
            isBound: false, // http://docs.oasis-open.org/odata/odata/v4.0/errata01/os/complete/part3-csdl/odata-v4.0-errata01-os-part3-csdl-complete.html#_Toc395268196
            isComposable: false, // http://docs.oasis-open.org/odata/odata/v4.0/errata01/os/complete/part3-csdl/odata-v4.0-errata01-os-part3-csdl-complete.html#_Toc395268196
            entitySetPath: xmlFunctionImport.attribs.EntitySet,
            httpMethod: xmlFunctionImport.attribs['m:HttpMethod'],
            returnType: xmlFunctionImport.attribs.ReturnType,
            parameters: []
        };

        var xmlParameters = htmlparser.DomUtils.getElementsByTagName('Parameter', xmlFunctionImport);
        xmlParameters.forEach(function (xmlParameter) {
            xmlParameter = xmlParameter.attribs;
            var parameter = {
                name: xmlParameter.Name,
                mode: xmlParameter.Mode,
                propertyType: xmlParameter.Type,
                isNullable: xmlParameter.Nullable === 'true'
            };

            if (xmlParameter.MaxLength) {
                parameter.maxLength = parseInt(xmlParameter.MaxLength, 10);
            }

            if (xmlParameter.Precision) {
                parameter.precision = parseInt(xmlParameter.Precision, 10);
            }

            if (xmlParameter.Scale) {
                parameter.scale = parseInt(xmlParameter.Scale, 10);
            }

            if (xmlParameter.Srid) {
                parameter.srid = parseInt(xmlParameter.Srid, 10);
            }

            functionImport.parameters.push(parameter);

        });

        catalog.functions.push(functionImport);
    });
}

function createGroups(entity, groups) {
    Object.keys(groups).forEach(function (type) {
        if (type.indexOf('_') !== 0) {
            groups[type].forEach(function (group) {
                var roles = [];
                Object.keys(group).forEach(function (id) {
                    if (id.indexOf('_') !== 0) {
                        if (group[id]) {
                            roles.push({ id: id, path: group[id]});
                            if (id === 'currency' && groups._units[group[id]]) {
                                roles.push({ id: 'amount', path: groups._units[group[id]]});
                            }
                            else if (id === 'unit' && groups._units[group[id]]) {
                                roles.push({ id: 'value', path: groups._units[group[id]]});
                            }
                        }
                    }
                });
                entity.groups.push({type: type, roles: roles });
            });
        }
    });
}

function getGroup(groups, groupType) {
    if (!groups.hasOwnProperty(groupType)) {
        if (groupType === 'DataSeries') {
            groups[groupType] = [
                {
                    _numberDimension: 0,
                    _numberData: 0
                }
            ];
        }
        else {
            groups[groupType] = [
                {}
            ];
        }
    }
    else if ((groupType === 'AmountWithCurrency' || groupType === 'ValueWithUnit')) {
        groups[groupType].push({});
    }
    return groups[groupType][groups[groupType].length - 1];
}

function getGroupSemanticInfo(semantic) {
    var semantics = {
        // Person
        name: {group: 'Person', role: 'fullName'},
        givenname: {group: 'Person', role: 'givenName' },
        middlename: {group: 'Person', role: 'middleName'},
        familyname: {group: 'Person', role: 'familyName'},
        nickname: {group: 'Person', role: 'nickName'},
        honorific: {group: 'Person', role: 'title'},
        suffix: {group: 'Person', role: 'suffix'},
        photo: {group: 'Person', role: 'photo'},
        bday: {group: 'Person', role: 'bday'},
        // RoleInOrganization
        org: {group: 'RoleInOrganization', role: 'orgName'},
        'org-unit': {group: 'RoleInOrganization', role: 'orgUnit' },
        'org-role': {group: 'RoleInOrganization', role: 'role'},
        // Address
        street: {group: 'Address', role: 'street'},
        city: {group: 'Address', role: 'city' },
        zip: {group: 'Address', role: 'zip'},
        country: {group: 'Address', role: 'country'},
        region: {group: 'Address', role: 'region'},
        pobox: {group: 'Address', role: 'pobox'},
        // AmountWithCurrency
        'currency-code': {group: 'AmountWithCurrency', role: 'currency'},
        // ValueWithUnit
        'unit-of-measure': {group: 'ValueWithUnit', role: 'unit'},
        // Tags
        email: {tags: ['type:email']},
        tel: {tags: ['type:tel']},
        url: {tags: ['type:url']}
    };
    if (!semantics[semantic]) {
        if (semantic.indexOf(';') > 0) {
            var tags = semantic.split(';');
            var semanticInfo = semantics[tags[0]];
            if (semanticInfo && semanticInfo.hasOwnProperty('tags')) {
                semanticInfo.tags.pop();
                semanticInfo.tags.push(tags[0] + '-' + tags[1]);
                return semanticInfo;
            }
        }
    }
    return semantics[semantic];
}

function lookupGroups(groups, xmlProperty) {
    if (xmlProperty['sap:aggregation-role']) {
        var group = getGroup(groups, 'DataSeries');
        var role = xmlProperty['sap:aggregation-role'];
        if (role === 'dimension') {
            if (group._numberDimension < 3) {
                group._numberDimension = group._numberDimension + 1;
                var dimension = 'dimension' + (group._numberDimension).toString();
                group[dimension] = xmlProperty.Name;
            }
        }
        else if (role === 'measure') {
            if (group._numberData < 3) {
                group._numberData = group._numberData + 1;
                var data = 'data' + (group._numberData).toString();
                group[data] = xmlProperty.Name;
            }
        }
    }

    if (xmlProperty['sap:semantics']) {
        var semanticInfo = getGroupSemanticInfo(xmlProperty['sap:semantics']);
        if (semanticInfo && semanticInfo.hasOwnProperty('group')) {
            getGroup(groups, semanticInfo.group)[semanticInfo.role] = xmlProperty.Name;
        }
    }

    if (xmlProperty['sap:unit']) {
        groups._units[xmlProperty['sap:unit']] = xmlProperty.Name;
    }
}

function getTagSemanticInfo(semantic) {
    var semantics = {
        photo: {tags: ['type:url']},
        email: {tags: ['type:email']},
        tel: {tags: ['type:tel']},
        url: {tags: ['type:url']}
    };
    if (semantic.indexOf(';') > 0) {
        var tags = semantic.split(';');
        var semanticInfo = semantics[tags[0]];
        if (semanticInfo && semanticInfo.hasOwnProperty('tags')) {
            semanticInfo.tags.pop();
            semanticInfo.tags.push(tags[0] + '-' + tags[1]);
            return semanticInfo;
        }
    }
    return semantics[semantic];
}

function createTags(element, tags) {
    if (!element) {
        return;
    }
    if (element['sap:label']) {
        tags.push(element['sap:label']);
    }
    if (element['sap:semantics']) {
        var semanticInfo = getTagSemanticInfo(element['sap:semantics']);
        if (semanticInfo && semanticInfo.hasOwnProperty('tags')) {
            semanticInfo.tags.forEach(function (tag) {
                tags.push(tag);
            });
        }
    }
}

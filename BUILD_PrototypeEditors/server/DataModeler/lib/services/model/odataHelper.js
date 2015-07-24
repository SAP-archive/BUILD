'use strict';
var xmlBuilder = require('xmlbuilder');
var _ = require('norman-server-tp').lodash;

exports.getServiceDescription = function (context) {
    if (!context.model) {
        throw new Error('Model not found!');
    }

    var xml = xmlBuilder.create({
        service: {
            '@xmlns:atom': 'http://www.w3.org/2005/Atom',
            '@xmlns:app': 'http://www.w3.org/2007/app',
            '@xmlns': 'http://www.w3.org/2007/app',
            '@xml:base': context.model.projectId,
            workspace: {
                'atom:title': {'#text': 'Default'}
            }
        }
    });

    context.model.entities.forEach(function (entity) {
        xml.children['0'].ele('collection', {href: entity.nameSet}).ele('atom:title', null, entity.nameSet);
    });

    return xml.end();
};

exports.generateMetadata = function (context) {
    var getCardinality = function (multiplicity) {
        return multiplicity ? '*' : '1';
    };

    var model = context.model;

    var oDataServiceName = model.projectId || model._id.toJSON();
    var xml = xmlBuilder.create({
            'edmx:Edmx': {
                '@Version': '1.0',
                '@xmlns:edmx': 'http://schemas.microsoft.com/ado/2007/06/edmx',
                '@xmlns:m': 'http://schemas.microsoft.com/ado/2007/08/dataservices/metadata',
                '@xmlns:sap': 'http://www.sap.com/Protocols/SAPData'
            }
        },
        {version: '1.0', encoding: 'UTF-8'}
    );

    var dataServices = xml.ele({
        'edmx:DataServices': {
            '@m:DataServiceVersion': '2.0'
        }
    });
    var schema = dataServices.ele('Schema', {
        Namespace: oDataServiceName,
        'xml:lang': 'en',
        'sap:schema-version': '0000',
        xmlns: 'http://schemas.microsoft.com/ado/2008/09/edm'
    });

    var entityContainer = schema.ele('EntityContainer', {
        Name: oDataServiceName + '_Entities',
        'm:IsDefaultEntityContainer': 'true'
    });

    var entitySet = {}, entities = {};
    model.entities.forEach(function (entity) {
        entities[entity._id] = entity;
        entitySet[entity.name] = entity.nameSet;
    });

    model.entities.forEach(function (entity) {
        entityContainer.ele('EntitySet', {
            Name: entity.nameSet,
            EntityType: oDataServiceName + '.' + entity.name
        });

        var entityType = schema.ele('EntityType', {
            Name: entity.name
        });

        var keys = entityType.ele('Key');

        entity.properties.forEach(function (property) {
            var propAttributes = {
                Name: property.name,
                Type: 'Edm.' + property.propertyType
            };

            if (property.isKey) {
                keys.ele('PropertyRef', {Name: property.name});
            }

            if (property.isNullable !== undefined) {
                propAttributes.Nullable = property.isNullable;
            }

            if (property.maxLength) {
                propAttributes.MaxLength = property.maxLength;
            }

            if (property.precision) {
                propAttributes.Precision = property.precision;
            }

            if (property.scale) {
                propAttributes.Scale = property.scale;
            }

            if (property.default) {
                propAttributes.Default = property.default;
            }

            if (property.calculated && property.calculated.calculation) {
                property.calculated.inputProperties.forEach(function (inputProperty) {
                    var calculatedEntity = entities[inputProperty.entityId];
                    inputProperty.entityId = calculatedEntity._id;
                    var calculatedProperty = _.find(calculatedEntity.properties, {_id: inputProperty.propertyId});
                    inputProperty.propertyId = calculatedProperty._id;

                    if (inputProperty.navPropId) {
                        var calculatedNavProp = _.find(entity.navigationProperties, {_id: inputProperty.navPropId});
                        inputProperty.navPropId = calculatedNavProp._id;
                    }
                });

                var substituteNames = function (formula) {
                    formula.forEach(function (element) {
                        if (element.type === 'property') {
                            var ent = entities[element.entityId];
                            var prop = _.find(ent.properties, {_id: element.propertyId});
                            if (element.navPropId) {
                                var navProp = _.find(entity.navigationProperties, {_id: element.navPropId});
                                element.navPropId = navProp.name;
                                element.navPropName = navProp.name;
                            }
                            else {
                                element.navPropName = ent.name;
                            }
                            element.entityName = ent.name;
                            element.entityId = ent.name;
                            element.propertyName = prop.name;
                            element.propertyId = prop.name;
                        }
                        else {
                            for (var elt in element) {
                                if (Array.isArray(element[elt])) {
                                    substituteNames(element[elt]);
                                }
                            }
                        }
                    });
                };

                var calculation = JSON.parse(property.calculated.calculation);

                var inputProps = _.extend(property.calculated.inputProperties.toObject());

                inputProps.forEach(function (inputProperty) {
                    var calculatedEntity = entities[inputProperty.entityId];
                    inputProperty.entityId = calculatedEntity.name;
                    var calculatedProperty = _.find(calculatedEntity.properties, {_id: inputProperty.propertyId});
                    inputProperty.propertyId = calculatedProperty.name;

                    if (inputProperty.navPropId) {
                        var calculatedNavProp = _.find(entity.navigationProperties, {_id: inputProperty.navPropId});
                        inputProperty.navPropId = calculatedNavProp.name;
                    }
                });

                substituteNames(calculation);

                propAttributes['sap:calculated'] = JSON.stringify({
                    calculation: JSON.stringify(calculation),
                    inputProperties: inputProps
                });
            }

            propAttributes['sap:label'] = property.name;

            entityType.ele('Property', propAttributes);
        });

        entity.navigationProperties.forEach(function (navigationProperty) {
            var relationshipName = entities[entity._id].name + navigationProperty.name + entities[navigationProperty.toEntityId].name;
            var fromRoleName = 'FromRole_' + relationshipName, toRoleName = 'ToRole_' + relationshipName;

            entityType.ele('NavigationProperty', {
                Name: navigationProperty.name,
                Relationship: oDataServiceName + '.' + relationshipName,
                FromRole: fromRoleName,
                ToRole: toRoleName
            });

            var xmlAssociation = schema.ele('Association', {
                Name: relationshipName
            });
            var xmlAssociationSet = entityContainer.ele('AssociationSet', {
                Name: relationshipName,
                Association: oDataServiceName + '.' + relationshipName,
                'sap:creatable': !navigationProperty.isReadOnly || true,
                'sap:updatable': !navigationProperty.isReadOnly || true,
                'sap:deletable': !navigationProperty.isReadOnly || true
            });

            xmlAssociation.ele('End', {
                Type: oDataServiceName + '.' + entities[entity._id].name,
                Multiplicity: getCardinality(false),
                Role: fromRoleName
            });

            xmlAssociationSet.ele('End', {
                EntitySet: entities[entity._id].nameSet,
                Role: fromRoleName
            });

            xmlAssociation.ele('End', {
                Type: oDataServiceName + '.' + entities[navigationProperty.toEntityId].name,
                Multiplicity: getCardinality(navigationProperty.multiplicity),
                Role: toRoleName
            });

            xmlAssociationSet.ele('End', {
                EntitySet: entities[navigationProperty.toEntityId].nameSet,
                Role: toRoleName
            });

            if (navigationProperty.referentialConstraints && navigationProperty.referentialConstraints.length > 0) {
                var xmlReferentialConstraint = xmlAssociation.ele('ReferentialConstraint');
                var xmlPrincipal = xmlReferentialConstraint.ele('Principal', {Role: fromRoleName});
                var xmlDependent = xmlReferentialConstraint.ele('Dependent', {Role: toRoleName});
                navigationProperty.referentialConstraints.forEach(function (referentialConstraint) {
                    var propertyName = _.find(entities[referentialConstraint.entityId].properties, {_id: referentialConstraint.propertyRef}).name;
                    var element = referentialConstraint.entityId === entity._id ? xmlPrincipal : xmlDependent;
                    element.ele('PropertyRef', {Name: propertyName});
                });
            }
        });
    });

    return xml.end();
};

function generateData(entity) {
    var data = {};
    var keys = [];
    entity.properties.forEach(function (property) {
        var v;
        switch (property.propertyType) {
            case 'String':
                v = property.name + Math.floor(Math.random() * 8000 + 1).toString();
                break;
            case 'Time':
            case 'DateTime':
                v = new Date();
                v.setFullYear(2000 + Math.floor(Math.random() * 20));
                v.setDate(Math.floor(Math.random() * 30));
                v.setMonth(Math.floor(Math.random() * 12));
                v.setMilliseconds(0);
                break;
            case 'Int16':
            case 'Int32':
            case 'Int64':
                v = Math.floor(Math.random() * 10000);
                break;
            case 'Decimal':
                v = Math.floor(Math.random() * 1000000) / 100;
                break;
            case 'Byte':
            case 'Double':
            case 'Single':
            case 'SByte':
            default:
                v = Math.random() * 10;
                break;
        }
        data[property.name] = v;
        if (property.isKey) {
            keys.push(property.name);
        }
    });

    return data;
}

function clone(source) {
    var data = [];

    source.forEach(function (line) {
        var el = {};

        Object.keys(line).forEach(function (key) {
            el[key] = line[key];
        });

        data.push(el);
    });

    return data;
}

exports.getEntityData = function (context) {
    var element = [];

    if (context.sampleData && context.sampleData.entities) {
        context.sampleData.entities.forEach(function (ent) {
            if (context.entity.name.toLowerCase() === ent.entityName.toLowerCase()) {
                element = clone(ent.properties);
            }
        });
    }

    if (context.doGenerateData && element.length === 0) {
        for (var i = 0; i < 100; i++) {
            element.push(generateData(context.entity));
        }
    }

    context.data = element;

    context.entity.properties.forEach(function (property) {
        if (property.propertyType === 'DateTime' || property.propertyType === 'DateTimeOffset') {
            context.data.forEach(function (line) {
                if (line[property.name] && line[property.name].getTime) {
                    line[property.name] = '/Date(' + line[property.name].getTime() + ')/';
                }
            });
        }

        if (property.isAsset) {
            context.data.forEach(function (line) {
                var assetId = context.assets[line[property.name]];
                if (assetId) {
                    line[property.name] = '/api/projects/' + context.projectId + '/document/' + assetId + '/render';
                }
                else {
                    line[property.name] = 'not found';
                }
            });
        }
    });

    context.logger.debug('odata getEntityData - ' + JSON.stringify(context.data));

    return context;
};

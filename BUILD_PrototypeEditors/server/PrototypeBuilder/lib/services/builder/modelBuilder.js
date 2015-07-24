'use strict';

var builder = require('xmlbuilder');
var builderUtils = require('./builderUtils');
var odataHelper = require('./technology/odataHelper');

var _ = require('norman-server-tp').lodash;

var DATETIME = 'DateTime';
var DATETIMEOFFSET = 'DateTimeOffset';

var entityDefaultContext = {};

exports.generateEDMX = function (prototypeDataModel) {
    var getCardinality = function (multiplicity) {
        return multiplicity ? '*' : '1';
    };

    var dataModelExtension = odataHelper.getDataModelExtension();
    _.each(dataModelExtension, function (newEntity, entityName) {
        var createEntity = false;
        var entityToModify = _.find(prototypeDataModel.entities, function (entity) {
            return entity.name === entityName;
        });
        if (!entityToModify) {
            createEntity = true;
            entityToModify = {
                _id: entityName,
                name: entityName,
                nameSet: entityName + 'Set',
                properties: [{name: 'ID', isKey: true, propertyType: 'String'}],
                navigationProperties: []
            };
        }
        _.each(newEntity, function (propertyValue, propertyName) {
            if (propertyValue.isNavProp) {
                entityToModify.navigationProperties.push({
                    name: propertyName,
                    label: propertyValue.label,
                    multiplicity: propertyValue.isMultiple,
                    toEntityId: propertyValue.toEntityId
                });
            }
            else {
                var existingProperty = _.find(entityToModify.properties, function (property) {
                    return property.name === propertyName;
                });
                if (!existingProperty) {
                    entityToModify.properties.push({
                        name: propertyName,
                        label: propertyValue.label,
                        propertyType: 'String',
                        defaultValue: propertyValue.value
                    });
                }
                else {
                    if (propertyValue.label) {
                        existingProperty.label = propertyValue.label;
                    }
                    if (propertyValue.isNullable) {
                        existingProperty.isNullable = propertyValue.isNullable;
                    }
                }

            }
        });
        if (createEntity) {
            prototypeDataModel.entities.push(entityToModify);
        }
    });

    var oDataServiceName = prototypeDataModel.projectId || prototypeDataModel._id.toJSON();
    var xml = builder.create({
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
    prototypeDataModel.entities.forEach(function (entity) {
        entities[entity._id] = entity;
        entitySet[entity.name] = entity.nameSet;
    });

    prototypeDataModel.entities.forEach(function (entity) {
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

            if (property.propertyType === 'DateTime') {
                // So that it will be displayed as a date and anot a date with time
                propAttributes['sap:display-format'] = 'Date';
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

                var inputProps = _.extend(property.calculated.inputProperties);

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

            propAttributes['sap:label'] = property.label || property.name;

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

    return xml.toString({pretty: true, indent: '    '});
};

function generatePropertyValue(property, keyIdx) {
    var v;
    if (property.defaultValue) {
        v = property.defaultValue;
    }
    else {
        switch (property.propertyType) {
            case 'String':
                if (property.isKey) {
                    v = keyIdx.toString();
                }
                else {
                    v = Math.floor(Math.random() * 8000 + 1).toString();
                }
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
    }
    return v;
}

function generateData(entity) {
    var data = {};
    var keyIdx = 0;
    _.each(entity.properties, function (property) {

        data[property.name] = generatePropertyValue(property, keyIdx++);
    });

    return data;
}

/**
 * Retrieve the content of the entity from the sample data manager
 * @param projectId associated projectId
 * @param entity the entity we want to parse
 * @param sampleDataMetadata collection of sampleDataMetadata at our disposal
 * @param assets map of existing assets
 * @param assetsToCopy array containing the assets to copy to Shared Workspace
 * @returns {Object} the array containing the entity data
 */
exports.getEntityData = function (projectId, entity, sampleDataMetadata, assets, assetsToCopy) {
    var entityData = null;
    // Find the associated entity on the sample data side
    var sampleDataEntity = _.find(sampleDataMetadata.entities, function (sampleDataMetadataEntity) {
        return sampleDataMetadataEntity.entityName.toLowerCase() === entity.name.toLowerCase();
    });

    if (sampleDataEntity) {
        entityData = sampleDataEntity.properties;
        _.each(entity.properties, function (property) {
            _.each(entityData, function (entityDataLine) {
                if (entityDataLine[property.name] === undefined) {
                    entityDataLine[property.name] = generatePropertyValue(property);
                }
            });
            // Special handling for DateTime/DateTimeOffset properties
            if (property.propertyType === DATETIME || property.propertyType === DATETIMEOFFSET) {
                _.each(entityData, function (entityDataLine) {
                    if (entityDataLine[property.name] && entityDataLine[property.name].getTime) {
                        entityDataLine[property.name] = '/Date(' + entityDataLine[property.name].getTime() + ')/';
                    }
                });
            }
            // Special handling for assets
            if (property.isAsset) {
                _.each(entityData, function (line) {
                    var associatedAsset = _.find(assets, function (asset) {
                        return line[property.name] === 'assets/' + asset.filename;
                    });

                    if (associatedAsset) {
                        var assetId = associatedAsset._id.toString();
                        line[property.name] = '/api/projects/' + projectId + '/document/' + assetId + '/render';
                        line[property.name] = builderUtils.replaceAssetUrl(line[property.name], assetsToCopy);
                    }
                    else {
                        line[property.name] = 'not found';
                    }
                });
            }
        });
    }
    else {
        entityData = [];
        for (var i = 0; i < 10; i++) {
            entityData.push(generateData(entity));
        }
    }
    entityDefaultContext[entity.nameSet] = '';
    if (entityData.length > 0) {
        var keyProperty = _.find(entity.properties, function (property) {
            return property.isKey;
        });
        entityDefaultContext[entity.nameSet] = '\'' + entityData[0][keyProperty.name] + '\'';
    }

    return entityData;
};

exports.getEntityDefaultContext = function (entityName) {
    return entityDefaultContext[entityName];
};

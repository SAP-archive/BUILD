'use strict';

var commonBuilder = require('../builderUtils.js');
var fs = require('fs');
var htmlparser = require('htmlparser');
var path = require('path');

var commonServer = require('norman-common-server');
var _ = require('norman-server-tp').lodash;
var Promise = require('norman-promise');

var NormanError = commonServer.NormanError;
var serviceLogger = commonServer.logging.createLogger('prototypeBuilder-service');

/**
 Provides OData Specific utilities
 **/

function _extractTerms(parsedXml, vocabularyNamespace) {
    var terms = {};
    var vocabularyTerms = htmlparser.DomUtils.getElementsByTagName('Term', parsedXml);
    _.each(vocabularyTerms, function (vocabularyTerm) {
        var term = {};
        _.each(vocabularyTerm.attribs, function (attributeValue, attributeName) {
            term[attributeName] = attributeValue;
        });
        term.FullName = vocabularyNamespace + '.' + term.Name;
        if (term.Type.indexOf('Collection') === 0) {
            term.IsCollection = true;
            term.CollectionType = term.Type.substr(11, term.Type.length - 12);
        }
        var termAnnotations = htmlparser.DomUtils.getElementsByTagName('Annotation', vocabularyTerm.children, false);
        if (termAnnotations) {
            term.annotations = [];
            _.each(termAnnotations, function (termAnnotation) {
                term.annotations.push(termAnnotation.attribs.Term);
            });
        }
        terms[term.Name] = term;
    });
    return terms;
}

function _extractTypes(parsedXml, vocabularyNamespace) {
    var types = {};
    var complexTypes = htmlparser.DomUtils.getElementsByTagName('ComplexType', parsedXml);
    _.each(complexTypes, function (vocabularyType) {
        var type = {};
        _.each(vocabularyType.attribs, function (attributeValue, attributeName) {
            type[attributeName] = attributeValue;
        });
        type.FullType = vocabularyNamespace + '.' + type.Name;
        if (type.BaseType) {
            var splitBaseType = type.BaseType.split('.');
            type.FullBaseType = vocabularyNamespace + '.' + splitBaseType[1];
        }
        var typeProperties = htmlparser.DomUtils.getElementsByTagName('Property', vocabularyType.children, false);
        if (typeProperties) {
            type.properties = {};
            _.each(typeProperties, function (typeProperty) {
                var property = {};
                _.each(typeProperty.attribs, function (attributeValue, attributeName) {
                    property[attributeName] = attributeValue;
                });
                if (property.Type.indexOf('Collection') === 0) {
                    property.IsCollection = true;
                    property.CollectionType = property.Type.substr(11, property.Type.length - 12);
                }
                // Property Annotation children
                var termAnnotations = htmlparser.DomUtils.getElementsByTagName('Annotation', typeProperty.children, false);
                if (termAnnotations) {
                    _.each(termAnnotations, function (termAnnotation) {
                        // only deal with isUrl
                        property.IsURL = (termAnnotation.attribs.Term === 'Core.IsURL');
                    });
                }
                type.properties[property.Name] = property;
            });
        }
        types[type.Name] = type;
    });
    var simpleTypes = htmlparser.DomUtils.getElementsByTagName('TypeDefinition', parsedXml);
    _.each(simpleTypes, function (vocabularyType) {
        var type = {};
        _.each(vocabularyType.attribs, function (attributeValue, attributeName) {
            type[attributeName] = attributeValue;
        });
        type.FullType = vocabularyNamespace + '.' + type.Name;
        type.IsSimple = true;
        types[type.Name] = type;
    });
    var enumTypes = htmlparser.DomUtils.getElementsByTagName('EnumType', parsedXml);
    _.each(enumTypes, function (enumType) {
        var type = {};
        _.each(enumType.attribs, function (attributeValue, attributeName) {
            type[attributeName] = attributeValue;
        });
        type.FullType = vocabularyNamespace + '.' + type.Name;
        type.IsEnum = true;
        var typeMembers = htmlparser.DomUtils.getElementsByTagName('Member', enumType.children, false);
        if (typeMembers) {
            type.members = [];
            _.each(typeMembers, function (typeMember) {
                type.members.push(typeMember.attribs.Name);
            });
        }
        types[type.Name] = type;
    });
    return types;
}

var vocabularies = {};
var annotationStructure = {};
var dataModelExtension = {};
var qualifierPerPath = {};
var virtualEntityId = 0;

exports.parseVocabulary = function (vocabularyData) {
    var parsedVocabulary = {};
    var handler = new htmlparser.DefaultHandler(function (err, parsedXml) {
        if (!err) {
            var SchemaInfo = htmlparser.DomUtils.getElementsByTagName('Schema', parsedXml)[0];
            parsedVocabulary.Alias = SchemaInfo.attribs.Alias;
            parsedVocabulary.Namespace = SchemaInfo.attribs.Namespace;

            parsedVocabulary.Terms = _extractTerms(parsedXml, parsedVocabulary.Namespace);
            parsedVocabulary.Types = _extractTypes(parsedXml, parsedVocabulary.Namespace);
        }
        else {
            var error = new NormanError('OData Helper has failed while parsing the vocabulary', err);
            serviceLogger.error(err);
            throw error;
        }
    }, {verbose: false, ignoreWhitespace: true});

    var parser = new htmlparser.Parser(handler);
    parser.parseComplete(vocabularyData);

    return parsedVocabulary;
};

/** Load the template file once at the start of the server **/
exports.initialize = function (done) {
    var templatePromises = [];
    var readFileAsPromised = function (fileName) {
        return Promise.invoke(fs.readFile, path.join(__dirname, fileName));
    };
    vocabularies = {};
    templatePromises.push(readFileAsPromised('odata/UI.vocabularies.xml').then(function (fileData) {
        var uiVocabulary = exports.parseVocabulary(fileData);
        vocabularies[uiVocabulary.Alias] = uiVocabulary;
        vocabularies[uiVocabulary.Namespace] = uiVocabulary;
    }));

    templatePromises.push(readFileAsPromised('odata/Common.vocabularies.xml').then(function (fileData) {
        var commonVocabulary = exports.parseVocabulary(fileData);
        vocabularies[commonVocabulary.Alias] = commonVocabulary;
        vocabularies[commonVocabulary.Namespace] = commonVocabulary;
    }));

    templatePromises.push(readFileAsPromised('odata/Analytics.vocabularies.xml').then(function (fileData) {
        var analyticsVocabulary = exports.parseVocabulary(fileData);
        vocabularies[analyticsVocabulary.Alias] = analyticsVocabulary;
        vocabularies[analyticsVocabulary.Namespace] = analyticsVocabulary;
    }));

    templatePromises.push(readFileAsPromised('odata/Communication.vocabularies.xml').then(function (fileData) {
        var communicationVocabulary = exports.parseVocabulary(fileData);
        vocabularies[communicationVocabulary.Alias] = communicationVocabulary;
        vocabularies[communicationVocabulary.Namespace] = communicationVocabulary;
    }));

    templatePromises.push(readFileAsPromised('odata/Org.OData.Capabilities.V1.xml').then(function (fileData) {
        var odataCapabilities = exports.parseVocabulary(fileData);
        vocabularies[odataCapabilities.Alias] = odataCapabilities;
        vocabularies[odataCapabilities.Namespace] = odataCapabilities;
    }));

    templatePromises.push(readFileAsPromised('odata/Org.OData.Core.V1.xml').then(function (fileData) {
        var odataCore = exports.parseVocabulary(fileData);
        vocabularies[odataCore.Alias] = odataCore;
        vocabularies[odataCore.Namespace] = odataCore;
    }));

    templatePromises.push(readFileAsPromised('odata/Org.OData.Measures.V1.xml').then(function (fileData) {
        var odataMeasures = exports.parseVocabulary(fileData);
        vocabularies[odataMeasures.Alias] = odataMeasures;
        vocabularies[odataMeasures.Namespace] = odataMeasures;
    }));

    Promise.all(templatePromises).callback(done);
};

exports.reset = function () {
    annotationStructure = {};
    dataModelExtension = {};
    qualifierPerPath = {};
    virtualEntityId = 0;
};

exports.getDataModelExtension = function () {
    return dataModelExtension;
};

exports.initializeModelExtension = function (entityName) {
    if (!dataModelExtension[entityName]) {
        dataModelExtension[entityName] = {};
    }
};

exports.getCurrentAnnotation = function () {
    return annotationStructure;
};

exports.findTerm = function (completeTermName) {
    var lastDot = completeTermName.lastIndexOf('.');
    var annotationNamespace = completeTermName.substr(0, lastDot);
    var targetVocabulary = vocabularies[annotationNamespace];
    var foundTerm = null;

    if (targetVocabulary) {
        var termName = completeTermName.substr(lastDot + 1);
        foundTerm = targetVocabulary.Terms[termName];
    }
    return foundTerm;
};

exports.findType = function (completeTypeName) {
    var lastDot = completeTypeName.lastIndexOf('.');
    var annotationNamespace = completeTypeName.substr(0, lastDot);
    var typeName = completeTypeName.substr(lastDot + 1);

    var targetVocabulary = vocabularies[annotationNamespace];
    var foundComplexType = null;
    if (targetVocabulary) {
        foundComplexType = targetVocabulary.Types[typeName];
    }
    else if (annotationNamespace === 'Edm') {
        foundComplexType = {IsSimple: true, FullType: completeTypeName, Type: typeName};
    }

    if (foundComplexType.BaseType !== undefined) {
        var parentType = this.findType(foundComplexType.BaseType);
        foundComplexType = _.merge(_.clone(parentType, true), foundComplexType);
    }
    return foundComplexType;
};

exports.findChildTypeWithProperty = function (completeTypeName, additionalProperty) {
    // Let's look for type whose base Type is the original one and that has the right property
    var lastDot = completeTypeName.lastIndexOf('.');
    var annotationNamespace = completeTypeName.substr(0, lastDot);
    var targetVocabulary = vocabularies[annotationNamespace];
    var descendants = this.findDescendants(targetVocabulary, completeTypeName);
    var potentialType = _.find(descendants, function (typeValue) {
        return typeValue.properties[additionalProperty] !== undefined;
    });
    if (potentialType && potentialType.BaseType !== undefined) {
        var parentType = this.findType(potentialType.BaseType);
        potentialType = _.merge(_.clone(parentType, true), potentialType);
    }
    return potentialType;
};

exports.findDescendants = function (targetVocabulary, completeTypeName) {
    var self = this;
    var result = [];
    var children = _.filter(targetVocabulary.Types, function (typeValue) {
        return typeValue.FullBaseType === completeTypeName;
    });
    if (children && children.length > 0) {
        _.each(children, function (child) {
            result = result.concat(self.findDescendants(targetVocabulary, child.FullType));
        });
    }

    return result.concat(children);
};

exports.createStructure = function (vocabularyType, structureName, isCollection, objectIndex, requireBinding) {
    // console.log('Creating structure ' + vocabularyType.FullType + ' :: ' + structureName + ' :: ' + isCollection + ' :: ' + objectIndex + ' :: ' + requireBinding);
    var structure = {};
    structure.type = vocabularyType.FullType;
    structure.isSimple = vocabularyType.IsSimple || false;
    structure.isEnum = vocabularyType.IsEnum || false;
    structure.name = structureName;
    structure.requireBinding = requireBinding;
    structure.annotations = {};
    if (!isCollection) {
        if (structure.isSimple) {
            structure.value = null;
        }
        else {
            structure.properties = {};
            _.each(vocabularyType.properties, function (propertyValue) {
                structure.properties[propertyValue.Name] = null;
            });
        }
        if (objectIndex !== undefined && objectIndex !== 0) {
            structure.qualifier = objectIndex;
        }
    }
    else {
        structure.isCollection = true;
        structure.records = [];
    }
    return structure;
};

var RESOLVE_KEYWORD = /^sap\.ui\.model\.odata\.AnnotationHelper\.resolvePath\(([^)]+)\)/i;
var MODEL_KEYWORD = /^([^>]+)>(.*)$/i;
var reservedModelName = ['meta', 'entitySet', 'entityType'];

exports.extractTargetVariable = function (annotationName) {
    var resolveMatch = RESOLVE_KEYWORD.exec(annotationName);
    var targetVariable = null;
    if (resolveMatch !== null) {
        var modelMatch = MODEL_KEYWORD.exec(resolveMatch[1]);
        if (modelMatch !== null) {
            targetVariable = {model: modelMatch[1], path: modelMatch[2]};
        }
    }
    return targetVariable;
};

exports.extractModelVariable = function (annotationName) {
    var targetVariable = null;
    var modelMatch = MODEL_KEYWORD.exec(annotationName);
    if (modelMatch !== null) {
        targetVariable = modelMatch[1];
    }
    return targetVariable;
};

var _parseAnnotationName = function (annotationName, variableMap, currentIndex, repeatType, termInfo) {
    var annotationPath = [];
    var resolveMatch = RESOLVE_KEYWORD.exec(annotationName);
    if (resolveMatch !== null) {
        annotationPath = annotationPath.concat(_parseAnnotationName(resolveMatch[1], variableMap));
        annotationPath[annotationPath.length - 1].resolved = true;
        if (currentIndex !== undefined) {
            annotationPath[annotationPath.length - 1].idx = currentIndex;
        }
        if (repeatType !== undefined) {
            annotationPath[annotationPath.length - 1].repeatType = repeatType;
        }
        if (termInfo !== undefined) {
            annotationPath[annotationPath.length - 1].termInfo = termInfo;
        }
    }
    else {
        var splitPath = annotationName.split('/');
        var pathObj;
        _.each(splitPath, function (subAnnotationName) {
            var modelMatch = MODEL_KEYWORD.exec(subAnnotationName);
            console.log(subAnnotationName);
            if (modelMatch !== null && _.contains(reservedModelName, modelMatch[1])) {
                subAnnotationName = modelMatch[2];
                modelMatch = null;
            }
            if (modelMatch !== null) {
                var modelVar = variableMap[modelMatch[1]];
                var modelIndex = (modelVar.idx !== undefined) ? modelVar.idx : currentIndex;
                var modelRepeat = (modelVar.repeatType !== undefined) ? modelVar.repeatType : repeatType;
                var modelTarget = (modelVar.termInfo !== undefined) ? modelVar.termInfo : termInfo;
                annotationPath = annotationPath.concat(_parseAnnotationName(modelVar.path, variableMap, modelIndex, modelRepeat, modelTarget));
                if (modelMatch[2] !== '') {
                    pathObj = {path: modelMatch[2]};
                    if (currentIndex !== undefined) {
                        pathObj.idx = currentIndex;
                    }
                    if (repeatType !== undefined) {
                        pathObj.repeatType = repeatType;
                    }
                    if (termInfo !== undefined) {
                        pathObj.termInfo = termInfo;
                    }
                    annotationPath.push(pathObj);
                }
            }
            else {
                pathObj = {path: subAnnotationName};
                if (currentIndex !== undefined) {
                    pathObj.idx = currentIndex;
                }
                if (repeatType !== undefined) {
                    pathObj.repeatType = repeatType;
                }
                if (termInfo !== undefined) {
                    pathObj.termInfo = termInfo;
                }
                annotationPath.push(pathObj);
            }
        });
    }
    return annotationPath;
};

exports.getAnnotationDepth = function (annotationValue, variableMap) {
    var annotationName = (annotationValue.model !== '') ? annotationValue.model + '>' + annotationValue.path : annotationValue.path;
    var annotationPath = _parseAnnotationName(annotationName, variableMap);
    return annotationPath.length;
};

exports.getBaseAnnotation = function (annotationName, variableMap) {
    var annotationPath = _parseAnnotationName(annotationName, variableMap);
    return annotationPath[0];
};

var _getNewQualifier = function (entityPath) {
    if (!qualifierPerPath[entityPath]) {
        qualifierPerPath[entityPath] = 0;
    }
    return qualifierPerPath[entityPath]++;
};

var _createNavigationInfo = function (entityId, navigationPropertyId) {
    var entitySetName = '',
        navPropName = '',
        referentialConstraint,
        entity = commonBuilder.retrieveEntity(entityId); // get entity object by Id

    // use the entity to get the name of the entitySet and the propertyId for navigation
    if (entity) {
        // find the navigation property we want
        var navigationProperty = _.find(entity.navigationProperties, function (property) {
            return property._id === navigationPropertyId;
        });
        if (navigationProperty) {
            // find the ref constraint for the source entity
            referentialConstraint = _.find(navigationProperty.referentialConstraints, function (refContraint) {
                return refContraint.entityId === entityId;
            });
            if (referentialConstraint) {
                // get the property name from the source entity
                navPropName = commonBuilder.retrievePropertyName(entityId, referentialConstraint.propertyRef);
            }
            // find the target entity from the other ref constraint
            referentialConstraint = _.find(navigationProperty.referentialConstraints, function (refContraint) {
                return refContraint.entityId !== entityId;
            });
            if (referentialConstraint) {
                // get the nameset of the target entity
                entitySetName = commonBuilder.retrieveEntityName(referentialConstraint.entityId, true); // true gets the nameset rather the name
            }
        }
    }
    return {entitySetName: entitySetName, navigationPropertyName: navPropName};
};

exports.createEntity = function () {
    var entityName = 'Entity_' + virtualEntityId; // create next entity name
    // ensure that an existing entity does not have the same name
    while (commonBuilder.getEntityByName(entityName) !== undefined) {
        entityName += '_' + virtualEntityId; // will create entity names such as 'Entity_1_1_1'
    }
    virtualEntityId++; // increment global count
    return {id: entityName, name: entityName, nameSet: entityName + 'Set'};
};

exports.createEntityPropertyName = function (entityName, propertyName) {
    var newPropertyName = propertyName.replace(/ /, '_'), // remove spaces
        propertyCount = 1;
    // ensure that an existing entity does not have the same property name
    while (commonBuilder.hasPropertyName(entityName, newPropertyName)) {
        newPropertyName = propertyName + '_' + propertyCount++; // will create property names such as 'Name_2'
    }
    return newPropertyName;
};

exports.isTypeCompatible = function (recordType, newType) {
    var isCompatible = (recordType === newType.FullType || recordType === newType.FullBaseType);
    if (!isCompatible && newType.FullBaseType) {
        var parentType = this.findType(newType.FullBaseType);
        if (parentType) {
            isCompatible = this.isTypeCompatible(recordType, parentType);
        }
    }
    else if (!isCompatible && !newType.FullBaseType) {
        // In that case the type we are trying to introduce is less precise than the currently assigned one
        var recordTypeDetail = this.findType(recordType);
        if (recordTypeDetail.FullBaseType) {
            isCompatible = this.isTypeCompatible(recordTypeDetail.FullBaseType, newType);
        }
    }
    return isCompatible;
};

exports.storeAnnotationValue = function (entityName, annotationValue, propertyValue, variableMap, currentControlType) {
    var self = this;
    var annotationName = (annotationValue.model !== '') ? annotationValue.model + '>' + annotationValue.path : annotationValue.path;
    var annotationPath = _parseAnnotationName(annotationName, variableMap);
    // First part contains the vocabulary information
    var vocabularyPath = annotationPath[0].path || annotationPath[0].repeatType;
    var isAbstractTerm = false;
    if (vocabularyPath.indexOf('Collection') === 0) {
        isAbstractTerm = true;
        vocabularyPath = vocabularyPath.substr(11, vocabularyPath.length - 12);
    }
    var lastDot = vocabularyPath.lastIndexOf('.');
    var annotationNamespace = vocabularyPath.substr(0, lastDot);
    var targetVocabulary = vocabularies[annotationNamespace];

    if (targetVocabulary) {
        var termName = vocabularyPath.substr(lastDot + 1);
        var term = targetVocabulary.Terms[termName];
        var type;
        if (isAbstractTerm || term.IsCollection) {
            var collectionType = annotationPath[0].repeatType || term.CollectionType;
            type = self.findType(collectionType);
        }
        else {
            type = self.findType(term.Type);
        }
        termName = term.Name;
        if (!term.IsCollection && annotationPath[0].idx !== undefined && annotationPath[0].idx !== 0) {
            termName = term.Name + '#' + annotationPath[0].idx;
        }
        if (term.AppliesTo === 'EntitySet') {
            // Promote to nameSet for this annotation
            var entityType = commonBuilder.getEntityByName(entityName);
            if (entityType) {
                entityName = commonBuilder.getProjectId() + '_Entities/' + entityType.nameSet;
            }
            else {
                entityName = commonBuilder.getProjectId() + '_Entities/' + entityName + 'Set';
            }
        }
        if (annotationStructure[entityName] === undefined) {
            annotationStructure[entityName] = {};
        }
        var existingStructure = annotationStructure[entityName][termName];
        if (!existingStructure) {
            existingStructure = annotationStructure[entityName][termName] = self.createStructure(type, term.FullName, term.IsCollection, annotationPath[0].idx, term.RequireBinding);
        }

        if (annotationPath[0].idx !== undefined && term.IsCollection) {
            var realIndex = annotationPath[0].idx;
            var offsetIndex = 0;
            var newStructure = null;
            _.each(existingStructure.records, function (record) {
                if (self.isTypeCompatible(record.type, type)) {
                    realIndex--;
                }
                else {
                    offsetIndex++;
                }
                if (realIndex === -1) {
                    newStructure = record;
                }
            });
            if (!newStructure) {
                existingStructure.records[offsetIndex + annotationPath[0].idx] = self.createStructure(type, term.FullName, false, offsetIndex + annotationPath[0].idx);
                existingStructure = existingStructure.records[offsetIndex + annotationPath[0].idx];
            }
            else {
                existingStructure = newStructure;
            }
        }
        type = self.findType(existingStructure.type);

        var slicedPath = annotationPath.slice(1);
        var isResolved = false;
        var newBindingPath;
        var newEntityId;
        var targetEntityName;
        var previousValue;
        var idx = 0;

        var completePath = null;
        var resolvedTerm = null;
        var targetTerm;
        var prevIdx = annotationPath[0].idx;
        var currentQualifier = undefined;
        var previousSlicedPathPart = annotationPath[0];
        _.each(slicedPath, function (slicedPathPart) {
            prevIdx = (slicedPathPart.idx !== undefined) ? slicedPathPart.idx : prevIdx;
            console.log('Iteration ' + slicedPathPart.path + ' ' + propertyValue + ' ' + idx++);
            console.log(existingStructure);
            path = slicedPathPart.path;
            if (completePath !== null) {
                if (prevIdx !== undefined) {
                    completePath += '_' + prevIdx + '_' + path;
                }
                else {
                    completePath += '_' + path;
                }
            }
            else {
                if (prevIdx !== undefined) {
                    completePath = prevIdx + '_' + path;
                }
                else {
                    completePath = path;
                }

            }
            if (path.indexOf('sap:') === 0) {
                // This is a V2 annotation and we should place it as an extension to the property
                if (existingStructure && existingStructure.value && existingStructure.value.bindingPath) {
                    if (!dataModelExtension[entityName][existingStructure.value.bindingPath]) {
                        dataModelExtension[entityName][existingStructure.value.bindingPath] = {};
                    }
                    dataModelExtension[entityName][existingStructure.value.bindingPath][path.substr(4)] = propertyValue;
                }
                else if (targetEntityName && newBindingPath) {
                    if (!dataModelExtension[targetEntityName][newBindingPath]) {
                        dataModelExtension[targetEntityName][newBindingPath] = {};
                    }
                    dataModelExtension[targetEntityName][newBindingPath][path.substr(4)] = propertyValue;
                }
            }
            else {
                if (isResolved) {
                    // Previous path piece was resolved so we need to find the correct type

                    if (resolvedTerm) {
                        term = self.findTerm(resolvedTerm);
                        resolvedTerm = null;
                    }
                    else {
                        term = self.findTerm(path);
                    }
                    if (term.IsCollection) {
                        type = self.findType(previousSlicedPathPart.repeatType || term.CollectionType);
                    }
                    else {
                        type = self.findType(term.Type);
                    }

                    var targetTermName = term.FullName;
                    if (currentQualifier > 0) {
                        targetTermName += '#' + currentQualifier;
                    }
                    if (!existingStructure[targetTermName]) {
                        // we prevent from creating a structure when this is a currency and there is no value
                        if ((term.FullName === 'Org.OData.Measures.V1.ISOCurrency' || term.FullName === 'com.sap.vocabularies.Common.v1.Text') && !propertyValue) {
                            return;
                        }
                        existingStructure[targetTermName] = self.createStructure(type, term.FullName, term.IsCollection, currentQualifier, term.RequireBinding);
                    }
                    existingStructure = existingStructure[targetTermName];

                    if (prevIdx !== undefined && term.IsCollection) {
                        realIndex = prevIdx;
                        offsetIndex = 0;
                        newStructure = null;
                        _.each(existingStructure.records, function (record) {
                            if (record && self.isTypeCompatible(record.type, type)) {
                                realIndex--;
                            }
                            else {
                                offsetIndex++;
                            }
                            if (realIndex === -1) {
                                newStructure = record;
                            }
                        });
                        if (!newStructure) {
                            existingStructure.records[offsetIndex + prevIdx] = self.createStructure(type, term.FullName, false, offsetIndex + prevIdx);
                            existingStructure = existingStructure.records[offsetIndex + prevIdx];
                        }
                        else {
                            existingStructure = newStructure;
                        }
                    }

                }
                type = self.findType(existingStructure.type);
                console.log('REQUIRE BINDING ' + existingStructure.requireBinding + ' ' + completePath);
                isResolved = slicedPathPart.resolved || existingStructure.requireBinding || (slicedPathPart.path === 'Value');
                if (!existingStructure.isSimple && !existingStructure.isEnum) {
                    var propertyInfo = type.properties[path];
                    var potentialTerm = self.findTerm(path);
                    if (propertyInfo === undefined && potentialTerm === null) {
                        // We will violate the property type
                        var potentialType = self.findChildTypeWithProperty(type.FullType, path);
                        if (potentialType !== undefined) {
                            type = potentialType;
                            newStructure = self.createStructure(potentialType, term.FullName, false, undefined, term.RequireBinding);
                            existingStructure.type = newStructure.type;
                            _.each(newStructure.properties, function (subPropertyValue, subPropertyName) {
                                if (existingStructure.properties[subPropertyName] === undefined) {
                                    existingStructure.properties[subPropertyName] = subPropertyValue;
                                }
                            });
                        }
                        else {
                            type.properties[path] = {
                                CollectionType: '',
                                Name: path,
                                Nullable: true,
                                Type: 'Edm.String'
                            };
                        }
                        propertyInfo = type.properties[path];

                    }
                    if (propertyInfo !== undefined) {

                        if (propertyInfo.Type.indexOf('Edm') === -1) {
                            var isCollection = type.properties[path].IsCollection;
                            if (type.properties[path].IsCollection) {
                                type = self.findType(type.properties[path].CollectionType);
                            }
                            else {
                                type = self.findType(type.properties[path].Type);
                            }
                            if (!existingStructure.properties[path]) {
                                existingStructure.properties[path] = self.createStructure(type, path, isCollection);
                            }

                            if (existingStructure.properties[path].isSimple) {
                                existingStructure.properties[path].value = propertyValue;
                            }
                            existingStructure = existingStructure.properties[path];
                            if (prevIdx !== undefined && isCollection) {
                                realIndex = prevIdx;
                                offsetIndex = 0;
                                newStructure = null;
                                _.each(existingStructure.records, function (record) {
                                    if (self.isTypeCompatible(record.type, type)) {
                                        realIndex--;
                                    }
                                    else {
                                        offsetIndex++;
                                    }
                                    if (realIndex === -1) {
                                        newStructure = record;
                                    }
                                });
                                if (!newStructure) {
                                    existingStructure.records[offsetIndex + prevIdx] = self.createStructure(type, path, false, offsetIndex + prevIdx);
                                    existingStructure = existingStructure.records[offsetIndex + prevIdx];
                                }
                                else {
                                    existingStructure = newStructure;
                                }
                            }
                        }
                        else {
                            if (isResolved) {
                                // If it's resolved then either it already has a binding or it has a string in which case we need to extract the property
                                previousValue = existingStructure.properties[path];
                                console.log('RESOLVING :: ' + path);
                                console.log(previousValue);
                                if (!previousValue || !previousValue.isBinding) {
                                    if (previousValue && previousValue.entityId) {
                                        newEntityId = previousValue.entityId;
                                        targetEntityName = commonBuilder.retrieveEntity(previousValue.entityId).name;
                                    }
                                    else {
                                        targetEntityName = entityName;
                                    }

                                    if (!propertyValue.isBinding) {
                                        if (annotationPath[0].idx !== undefined) {
                                            newBindingPath = currentControlType + '_' + annotationPath[0].idx + '_' + completePath;
                                        }
                                        else {
                                            newBindingPath = currentControlType + '_' + completePath;
                                        }
                                        if (!dataModelExtension[targetEntityName]) {
                                            dataModelExtension[targetEntityName] = {};
                                        }
                                        dataModelExtension[targetEntityName][newBindingPath] = {
                                            label: pathPropertyName,
                                            value: previousValue || propertyValue
                                        };
                                    }
                                    else {
                                        newBindingPath = propertyValue.bindingPath;
                                        newEntityId = propertyValue.entityId;
                                    }
                                    if (propertyInfo.Type.indexOf('Edm.AnnotationPath') === 0) {
                                        if (slicedPathPart.termInfo) {
                                            targetTerm = self.findTerm(slicedPathPart.termInfo);
                                            resolvedTerm = slicedPathPart.termInfo;
                                        }
                                        else {
                                            // FIXME There is a missing metadata in the smartTemplates
                                            targetTerm = {FullName: 'com.sap.vocabularies.UI.v1.LineItem'};
                                            resolvedTerm = 'com.sap.vocabularies.UI.v1.LineItem';
                                        }
                                        if (previousValue === undefined || previousValue === null) {
                                            newBindingPath = '@' + targetTerm.FullName;
                                            var actualQualifier = _getNewQualifier(newBindingPath);
                                            if (actualQualifier > 0) {
                                                newBindingPath += '#' + actualQualifier;
                                                currentQualifier = actualQualifier;
                                            }
                                            var targetAnnotationPath = entityName;
                                            if (!annotationStructure[targetAnnotationPath]) {
                                                annotationStructure[targetAnnotationPath] = {};
                                            }
                                            existingStructure.properties[path] = {
                                                annotationPath: newBindingPath,
                                                fullAnnotationPath: targetAnnotationPath,
                                                isAnnotationPath: true,
                                                targetQualifier: currentQualifier
                                            };
                                        }
                                        else {
                                            // We have two case here,
                                            // either we only grabbed an entityName (associated property)
                                            // or we already have a full path
                                            if (previousValue.fullAnnotationPath) {
                                                targetAnnotationPath = previousValue.fullAnnotationPath;
                                            }
                                            else {
                                                // Previous Value is equal to the navPropName
                                                newBindingPath = previousValue.annotationPath + '/@' + targetTerm.FullName;
                                                targetAnnotationPath = previousValue.entityName;
                                                if (!annotationStructure[targetAnnotationPath]) {
                                                    annotationStructure[targetAnnotationPath] = {};
                                                }
                                                existingStructure.properties[path] = {
                                                    annotationPath: newBindingPath,
                                                    fullAnnotationPath: targetAnnotationPath,
                                                    isAnnotationPath: true
                                                };
                                            }
                                            currentQualifier = previousValue.targetQualifier;
                                        }
                                        existingStructure = annotationStructure[targetAnnotationPath];
                                    }
                                    else {
                                        if (newEntityId) {
                                            targetEntityName = commonBuilder.retrieveEntity(newEntityId).name;
                                        }
                                        else {
                                            targetEntityName = entityName;
                                        }

                                        if (!annotationStructure[targetEntityName + '/' + newBindingPath]) {
                                            annotationStructure[targetEntityName + '/' + newBindingPath] = {};
                                        }
                                        existingStructure.properties[path] = {
                                            isBinding: true,
                                            bindingPath: newBindingPath,
                                            entityId: newEntityId,
                                            isSimple: true
                                        };
                                        existingStructure = annotationStructure[targetEntityName + '/' + newBindingPath];
                                    }
                                }
                                else {
                                    if (propertyInfo.Type.indexOf('Edm.AnnotationPath') === 0) {
                                        newEntityId = commonBuilder.getNavPropTarget(previousValue.bindingPath);
                                        targetEntityName = commonBuilder.retrieveEntityName(newEntityId);
                                        // Previous Value is equal to the navPropName
                                        if (slicedPathPart.termInfo) {
                                            targetTerm = self.findTerm(slicedPathPart.termInfo);
                                            resolvedTerm = slicedPathPart.termInfo;
                                        }
                                        else {
                                            // FIXME There is a missing metadata in the smartTemplates
                                            targetTerm = {FullName: 'com.sap.vocabularies.UI.v1.LineItem'};
                                            resolvedTerm = 'com.sap.vocabularies.UI.v1.LineItem';
                                        }

                                        newBindingPath = previousValue.bindingPath + '/@' + targetTerm.FullName;
                                        targetAnnotationPath = targetEntityName;
                                        if (!annotationStructure[targetAnnotationPath]) {
                                            annotationStructure[targetAnnotationPath] = {};
                                        }
                                        existingStructure.properties[path] = {
                                            annotationPath: newBindingPath,
                                            fullAnnotationPath: targetAnnotationPath,
                                            entityId: newEntityId,
                                            isAnnotationPath: true
                                        };

                                        existingStructure = annotationStructure[targetAnnotationPath];
                                    }
                                    else {
                                        if (newEntityId) {
                                            targetEntityName = commonBuilder.retrieveEntity(newEntityId).name;
                                        }
                                        else {
                                            targetEntityName = entityName;
                                        }

                                        newBindingPath = previousValue.bindingPath;
                                        if (!annotationStructure[targetEntityName + '/' + newBindingPath]) {
                                            annotationStructure[targetEntityName + '/' + newBindingPath] = {};
                                        }
                                        existingStructure = annotationStructure[targetEntityName + '/' + newBindingPath];
                                    }
                                }
                            }
                            else {
                                if (propertyValue.isBinding && propertyInfo.IsURL) {
                                    propertyValue.isNavigationURL = true;
                                    propertyValue.navigationInfo = _createNavigationInfo(propertyValue.entityId, propertyValue.bindingProperty);
                                    existingStructure.properties[path] = propertyValue;
                                }
                                else if (!propertyValue.isBinding && propertyInfo.Type.indexOf('Edm.AnnotationPath') === 0) {
                                    var newEntity = self.createEntity();
                                    if (!dataModelExtension[newEntity.id]) {
                                        dataModelExtension[newEntity.id] = {};
                                    }
                                    if (propertyValue === '') {
                                        propertyValue = 'Nav_To_' + newEntity.id;
                                    }
                                    if (!dataModelExtension[entityName]) {
                                        dataModelExtension[entityName] = {};
                                    }
                                    dataModelExtension[entityName][propertyValue] = {
                                        label: propertyValue,
                                        value: null,
                                        isNavProp: true,
                                        toEntityId: newEntity.id,
                                        isMultiple: true
                                    };
                                    existingStructure.properties[path] = {
                                        annotationPath: propertyValue,
                                        entityName: newEntity.id,
                                        isAnnotationPath: true
                                    };
                                }
                                else {
                                    if (propertyInfo.Type.indexOf('Edm.AnnotationPath') === 0) {
                                        propertyValue.isAnnotationPath = true;
                                    }
                                    existingStructure.properties[path] = propertyValue;
                                }
                            }
                        }
                    }
                    else if (potentialTerm !== null) {
                        type = self.findType(potentialTerm.Type);
                        existingStructure = existingStructure.annotations[potentialTerm.FullName] = self.createStructure(type, potentialTerm.FullName, potentialTerm.IsCollection, undefined, potentialTerm.RequireBinding);
                    }
                }
                else {
                    if (isResolved) {

                        // If it's resolved then either it already has a binding or it has a string in which case we need to extract the property
                        previousValue = existingStructure.value;
                        console.log('RESOLVING :: ' + path);
                        console.log(previousValue);
                        if (!previousValue || !previousValue.isBinding) {
                            var lastIndexOfDotInPath = path.lastIndexOf('.');
                            var pathPropertyName = path.substr(lastIndexOfDotInPath + 1);
                            newBindingPath = newBindingPath + '_' + pathPropertyName;
                            if (!propertyValue.isBinding) {
                                if (!dataModelExtension[entityName]) {
                                    dataModelExtension[entityName] = {};
                                }
                                dataModelExtension[entityName][newBindingPath] = {
                                    label: pathPropertyName,
                                    value: previousValue || propertyValue
                                };
                                existingStructure.value = {
                                    isBinding: true,
                                    bindingPath: newBindingPath,
                                    isSimple: true
                                };
                            }
                            else {
                                existingStructure.value = propertyValue;
                            }

                            existingStructure = annotationStructure[entityName + '/' + newBindingPath];
                        }
                    }
                    else {
                        if (slicedPathPart.path === 'PropertyPath' && propertyValue.isBinding === undefined) {
                            // If the thing we are binding is a PropertyPath we need to add a new property to the entity
                            if (!dataModelExtension[entityName]) {
                                dataModelExtension[entityName] = {};
                            }
                            // remove spaces and check for conflicts with existing entity properties
                            newBindingPath = self.createEntityPropertyName(entityName, propertyValue);
                            // This entity should have a label defined based on the original value that was passed
                            dataModelExtension[entityName][newBindingPath] = {
                                label: propertyValue
                            };
                            existingStructure.value = {
                                isBinding: true,
                                bindingPath: newBindingPath,
                                isSimple: true
                            };
                        }
                        else {
                            existingStructure.value = propertyValue;
                        }
                    }
                }
                previousSlicedPathPart = slicedPathPart;
            }
        });
    }
};

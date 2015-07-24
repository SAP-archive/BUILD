'use strict';

var builder = require('xmlbuilder');
var _ = require('norman-server-tp').lodash;
var builderUtils = require('./builderUtils');
var odataHelper = require('./technology/odataHelper');

/**
 * Generate the annotations from the Metadata
 *
 * @param pageMetadata the view Metadata coming from the UI Composer
 * @param designTemplate the design template for the current page (probably should be retrieved from the UICatalogManager)
 * @returns {*} the XML string representing the annotations.
 */
exports.extractAnnotationFromPageMetadata = function (pageMetadata, assetsToCopy) {
    var langHelper = builderUtils.langHelper;
    var controlMap = _.indexBy(pageMetadata.controls, 'controlId');
    var mainEntityName = pageMetadata.mainEntityName;
    var designTemplate = builderUtils.retrieveDesignTemplate(pageMetadata.floorplan);
    if (!designTemplate) {
        throw new Error('Cannot find design template for ' + pageMetadata.floorplan);
    }
    var currentVarIdx = {};
    odataHelper.initializeModelExtension(mainEntityName);

    function _extractAnnotationFromControl(controlId, designTemplateElement, sourceVariableMap) {
        // We clone the variable map as we don't want to propagate back up the changes done inside.
        var variableMap = _.cloneDeep(sourceVariableMap);
        var controlData = controlMap[controlId];
        var annotationName;
        if (controlData && builderUtils.isControlValid(controlData)) {
            _(controlData.properties).sortBy(function (property) {
                var annotationPropertyValue = designTemplateElement.properties[property.name];
                return odataHelper.getAnnotationDepth(annotationPropertyValue, variableMap);
            }).forEach(function (property) {
                // console.log('Control ' + controlId + ' ' + property.name + ' ' + property.value);
                if (property.value !== null && builderUtils.isPropertyValid(property, controlData, assetsToCopy)) {
                    var propertyValue = langHelper.escapePropertyValue(property.value);
                    if (property.binding != null) {
                        // get information about the binding
                        var bindingInfo = langHelper.retrieveBindingInfo(property.binding, true);
                        if (bindingInfo && bindingInfo.bindingPath) {
                            propertyValue = {
                                isBinding: true,
                                bindingPath: bindingInfo.bindingPath,
                                entityId: bindingInfo.entityId,
                                bindingProperty: bindingInfo.bindingProperty
                            };
                        }
                    }
                    if (designTemplateElement.isAbstract) {
                        // Get the implementation element
                        var subElement = _.find(designTemplateElement.instanceChoice, function (implementationType) {
                            return implementationType.type === controlData.catalogControlName;
                        });
                        subElement.properties = _.merge({}, designTemplateElement.properties, subElement.properties);
                        subElement.template = _.merge({}, designTemplateElement.template, subElement.template);
                        if (subElement.template && subElement.template.repeatType) {
                            // we need to find the repeat var and update it
                            _.each(subElement.template.var, function (varValue, varName) {
                                if (varValue === 'repeat') {
                                    variableMap[varName].repeatType = subElement.template.repeatType;
                                }
                                else {
                                    // Make sure we can override variable in specific instance
                                    variableMap[varName].path = varValue;
                                }
                            });
                        }
                        designTemplateElement = subElement;
                    }
                    annotationName = designTemplateElement.properties[property.name];
                    if (annotationName.path && annotationName.path.indexOf('HeaderInfo/ImageUrl') > -1 && !property.value && !builderUtils.hasBinding(property)) {
                        //we don't create the annotation for the Image Url if its value is empty
                        return;
                    }
                    odataHelper.storeAnnotationValue(mainEntityName, annotationName, propertyValue, variableMap, controlData.catalogControlName);
                }
            }).value();

            var repeatCollectionIndex = {};
            _.each(controlData.groups, function (currentGroup) {
                if (builderUtils.isGroupValid(currentGroup.groupId, controlData)) {
                    variableMap = _.cloneDeep(sourceVariableMap);
                    var annotationData = designTemplateElement.groups[currentGroup.groupId];
                    var childIdx = 0;
                    if (!annotationData) {
                        annotationData = {};
                        if (currentGroup.children.length === 1 && controlMap[currentGroup.children[0]].catalogControlName && controlMap[currentGroup.children[0]].catalogControlName.split('-').length > 0) {
                            var childType = controlMap[currentGroup.children[0]].catalogControlName.split('-')[1];
                            var groupName = childType.charAt(0).toLowerCase() + childType.slice(1) + 's';
                            annotationData = designTemplateElement.groups[groupName];
                        }
                    }
                    if (annotationData && annotationData.template) {
                        var varToUpdate = [];
                        var varToAdd = [];
                        var repeatTarget = odataHelper.extractModelVariable(annotationData.template.repeat);
                        _.each(annotationData.template.var, function (varValue, varName) {
                            var varData = {
                                path: varValue
                            };
                            if (varValue === 'repeat') {
                                varData.path = annotationData.template.repeat;
                                varData.repeatType = annotationData.template.repeatType;
                            }
                            if (repeatTarget && varName === repeatTarget) {
                                varData.isRepeatCollection = true;
                            }
                            if (variableMap[varName] !== undefined) {
                                if (!currentVarIdx[varName]) {
                                    currentVarIdx[varName] = 0;
                                }
                                var varNewName = varName + currentVarIdx[varName]++;
                                variableMap[varNewName] = variableMap[varName];
                                variableMap[varName] = null;
                                // We also need to update all var in this template resolving this one
                                varToUpdate.push({oldName: varName, newName: varNewName});
                            }
                            if (varData.isRepeatCollection) {
                                // In case it's the repeat variable we add it directly as it happens slightly before the others
                                variableMap[varName] = varData;
                            }
                            else {
                                varToAdd.push({name: varName, data: varData});
                            }

                        });
                        _.each(varToUpdate, function (varToUpdateValue) {
                            _.each(variableMap, function (varValue, varName) {
                                if (varValue !== null) {
                                    var targetVar = odataHelper.extractTargetVariable(varValue.path);
                                    if (variableMap[varName] && targetVar !== null && targetVar.model === varToUpdateValue.oldName) {
                                        variableMap[varName].path = 'sap.ui.model.odata.AnnotationHelper.resolvePath(' + varToUpdateValue.newName + '>' + targetVar.path + ')';
                                    }
                                }
                            });
                        });
                        _.each(varToAdd, function (varToAddDetails) {
                            variableMap[varToAddDetails.name] = varToAddDetails.data;
                        });

                        _.each(annotationData.template.termInfo, function (termName, varName) {
                            if (variableMap[varName]) {
                                variableMap[varName].termInfo = termName;
                            }
                        });

                    }
                    _.each(currentGroup.children, function (child) {
                        if (annotationData.template) {
                            _.each(annotationData.template.var, function (varValue, varName) {
                                if (variableMap[varName].hasOwnProperty('repeatType')) {
                                    variableMap[varName].idx = childIdx;
                                    var targetVar = odataHelper.getBaseAnnotation(variableMap[varName].path, variableMap);
                                    if (repeatCollectionIndex[targetVar.path]) {
                                        // Offset by as much was found in the previous group
                                        variableMap[varName].idx += repeatCollectionIndex[targetVar.path];
                                    }
                                }
                            });
                            childIdx++;
                        }
                        _extractAnnotationFromControl(child, annotationData, variableMap);
                    });
                    // For the next iteration we might want to start some variable at a further point
                    if (annotationData.template) {
                        _.each(annotationData.template.var, function (varValue, varName) {
                            if (variableMap[varName].hasOwnProperty('repeatType')) {
                                var targetVar = odataHelper.getBaseAnnotation(variableMap[varName].path, variableMap);
                                repeatCollectionIndex[targetVar.path] = childIdx;
                            }
                        });
                    }
                }
            });
        }
        else {
            // Throw Error because we couldn't find the designated child control
            throw new Error(controlId + ' is invalid or couldn\'t be found in the metadata');
        }
    }


    _extractAnnotationFromControl(pageMetadata.rootControlId, designTemplate, {});
};

/**
 * Return the annotation file based on the generated annotation structure.
 */
exports.getAnnotationFile = function () {
    var outputXML = builder.create({
        'edmx:Edmx': {
            '@xmlns:edmx': 'http://docs.oasis-open.org/odata/ns/edmx',
            '@Version': '4.0'
        }
    });
    var dataServiceNode = outputXML.ele('edmx:DataServices');
    var schemaNode = dataServiceNode.ele({
        Schema: {
            '@xmlns': 'http://docs.oasis-open.org/odata/ns/edm',
            '@Namespace': 'zanno4sample_anno_mdl.v1'
        }
    });

    var annotations = odataHelper.getCurrentAnnotation();
    console.log(JSON.stringify(annotations, null, 4));

    var _addProperty = function (currentElement, propertyName, propertyValue, propertyType) {
        if (propertyValue.isSimple || propertyValue.isAnnotationPath || typeof propertyValue === 'string' || !propertyValue.type) {
            if (propertyValue.isNavigationURL) {
                if (propertyValue.navigationInfo && propertyValue.navigationInfo.entitySetName && propertyValue.navigationInfo.navigationPropertyName) {
                    /*
                     <PropertyValue Property="Url">
                     <Apply Function="odata.fillUriTemplate">
                     <String>#/ProductSet({ID})</String>
                     <LabeledElement Name="ID">
                     <Path>ProductID</Path>
                     </LabeledElement>
                     </Apply>
                     </PropertyValue>
                     */
                    var navHash = '#/' + propertyValue.navigationInfo.entitySetName + '(\'{ID}\')';
                    var applyElement = currentElement.ele('PropertyValue', {Property: propertyName}).ele('Apply', {Function: 'odata.fillUriTemplate'});
                    applyElement.ele('String', null, navHash);
                    applyElement.ele('LabeledElement', {Name: 'ID'}).ele('Path', null, propertyValue.navigationInfo.navigationPropertyName);
                }
                else {
                    // normal binding
                    currentElement.ele('PropertyValue', {
                        Property: propertyName,
                        Path: propertyValue.bindingPath
                    });
                }
            }
            else if (propertyValue.isBinding) {
                currentElement.ele('PropertyValue', {
                    Property: propertyName,
                    Path: propertyValue.bindingPath
                });
            }
            else if (propertyValue.isSimple && propertyValue.value !== '') {
                currentElement.ele('PropertyValue', {
                    Property: propertyName,
                    String: propertyValue.value
                });
            }
            else if (propertyValue.isAnnotationPath) {
                currentElement.ele('PropertyValue', {
                    Property: propertyName,
                    AnnotationPath: propertyValue.annotationPath
                });
            }
            else {
                var propertyTypeString = propertyType ? propertyType.Type : '';
                switch (propertyTypeString) {
                    case 'Edm.Boolean' :
                        currentElement.ele('PropertyValue', {
                            Property: propertyName,
                            Bool: propertyValue
                        });
                        break;
                    default:
                        currentElement.ele('PropertyValue', {
                            Property: propertyName,
                            String: propertyValue
                        });
                        break;
                }

            }
        }
        else if (propertyValue.isCollection) {
            var collectionElement = currentElement.ele('PropertyValue', {
                Property: propertyName
            });
            _addCollection(collectionElement, propertyValue);
        }
        else {
            var subRecord = currentElement.ele('PropertyValue', {Property: propertyName}).ele('Record', {Type: propertyValue.type});
            _.each(propertyValue.properties, function (subPropertyValue, subPropertyName) {
                if (subPropertyValue != null) {
                    if (subPropertyValue.isBinding) {
                        subRecord.ele('PropertyValue', {
                            Property: subPropertyName,
                            Path: subPropertyValue.bindingPath
                        });
                    }
                    else {
                        subRecord.ele('PropertyValue', {
                            Property: subPropertyName,
                            String: subPropertyValue
                        });
                    }
                }
            });
        }
    };

    var _addCollection = function (currentElement, typeStructure) {
        var mainCollection = currentElement.ele('Collection');
        _.each(typeStructure.records, function (recordInfo) {
            if (recordInfo) {
                if (recordInfo.isSimple) {
                    var simplifiedType = recordInfo.type.split('.')[1];
                    var recordValue = recordInfo.value;
                    if (recordValue.isBinding) {
                        recordValue = recordValue.bindingPath;
                    }
                    mainCollection.ele(simplifiedType, null, recordValue);
                }
                else {
                    var mainRecord = mainCollection.ele('Record', {Type: recordInfo.type});
                    var subAnnotationType = odataHelper.findType(recordInfo.type);
                    _.each(recordInfo.annotations, function (subAnnotationValue, subAnnotationName) {
                        if (subAnnotationValue !== null && subAnnotationValue.value != null) {
                            mainRecord.ele('Annotation', {
                                Term: subAnnotationName,
                                EnumMember: subAnnotationValue.value
                            });
                        }
                    });
                    _.each(recordInfo.properties, function (propertyValue, propertyName) {
                        if (propertyValue !== null) {
                            _addProperty(mainRecord, propertyName, propertyValue, subAnnotationType.properties[propertyName]);
                        }
                    });
                }
            }
        });
    };

    _.each(annotations, function (annotationPerEntity, entityName) {
        var entityNode = schemaNode.ele({
            Annotations: {
                '@Target': builderUtils.dataModel.projectId + '.' + entityName
            }
        });
        var mainRecord;
        // console.log(JSON.stringify(annotationPerEntity, null, 4));
        _.forIn(annotationPerEntity, function (annotationValue) {
            var annotationType = odataHelper.findType(annotationValue.type);
            var mainAnnotation = entityNode.ele('Annotation', {Term: annotationValue.name});
            if (annotationValue.qualifier !== undefined && annotationValue.qualifier !== 0) {
                mainAnnotation.att('Qualifier', annotationValue.qualifier);
            }
            if (annotationValue.isCollection) {
                _addCollection(mainAnnotation, annotationValue);
            }
            else if (annotationValue.isSimple) {
                var propertyValue = annotationValue.value;
                if (propertyValue.isBinding) {
                    mainAnnotation.att('Path', propertyValue.bindingPath);
                }
                else {
                    mainAnnotation.att('String', propertyValue);
                }
            }
            else {
                mainRecord = mainAnnotation.ele('Record', {Type: annotationValue.type});
                _.each(annotationValue.annotations, function (subAnnotationValue, subAnnotationName) {
                    if (subAnnotationValue !== null) {
                        mainRecord.ele('Annotation', {
                            Term: subAnnotationName,
                            EnumMember: subAnnotationValue.value
                        });
                    }
                });
                _.each(annotationValue.properties, function (propertyValue, propertyName) {
                    if (propertyValue !== null) {
                        _addProperty(mainRecord, propertyName, propertyValue, annotationType.properties[propertyName]);
                    }
                });
            }
        });
    });

    return outputXML.toString({pretty: true, indent: '    '});
};

exports.getDataModelExtension = function () {
    return odataHelper.getDataModelExtension();
};


exports.getPageConfiguration = function (pageMetadataArray) {
    var smartConfiguration = {pages: []};
    var currentPages = smartConfiguration.pages;
    var firstPage = true;
    var map = {};

    _.each(pageMetadataArray, function (pageMetadata) {
        var entityNameSet = builderUtils.retrieveEntityName(pageMetadata.mainEntity, true);
        // In case the entity was just created
        if (entityNameSet === null) {
            entityNameSet = pageMetadata.mainEntityDetail.nameSet;
        }
        var designTemplateName = builderUtils.retrieveDesignTemplateName(pageMetadata.floorplan);
        var pageInfo = {
            pageName: pageMetadata.name,
            entitySet: entityNameSet,
            component: designTemplateName,
            pages: []
        };

        map[entityNameSet] = pageInfo;

        currentPages.push(pageInfo);
        if (firstPage) {
            currentPages = pageInfo.pages;
            firstPage = false;
        }
    });

    function setNav(pageInfo, path) {
        var entity = builderUtils.getEntityByNameSet(pageInfo.entitySet);
        var currPath = path + entity._id + '/';

        _.forEach(entity.navigationProperties, function (navProp) {
            if (currPath.indexOf(navProp.toEntityId) === -1) {
                var target = builderUtils.retrieveEntity(navProp.toEntityId);

                if (target) {
                    var targetPage = map[target.nameSet];

                    if (targetPage) {
                        var subPage = _.clone(targetPage, true);
                        subPage.navigationProperty = navProp.name;
                        pageInfo.pages.push(subPage);
                        setNav(subPage, currPath);
                    }
                }
            }
        });
    }

    // the first page is LR and this page constains all ObectPage. We search that there is navigation beetwen OP
    _.forEach(currentPages, function (pageInfo) {
        setNav(pageInfo, '/');
    });

    return smartConfiguration;
};

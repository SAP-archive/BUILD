'use strict';

var htmlparser = require('htmlparser');
var commonServer = require('norman-common-server');
var logger = commonServer.logging.createLogger('business-catalog-service');
commonServer.logging.addWatch(logger);


var AliasUI;
var AliasService;
var AliasMeasures;
var AliasCommunication;

function updateRolePathInGroup(xmlProperty, group, roleName) {
    var bUpdated = false;
    var value;
    if (xmlProperty.attribs && xmlProperty.attribs.Path) {
        value = xmlProperty.attribs.Path;
    }
    var propertyValues = htmlparser.DomUtils.getElementsByTagName('PropertyValue', xmlProperty.children);
    propertyValues.forEach(function (xmlPropertyValue) {
        if (xmlPropertyValue.attribs && xmlPropertyValue.attribs.Property === 'Value' && xmlPropertyValue.attribs.Path) {
            value = xmlPropertyValue.attribs.Path;
        }
    });
    if (value) {
        for (var i = 0; i < group.roles.length; i++) {
            if (group.roles[i].id === roleName) {
                group.roles[i].path = value;
                bUpdated = true;
                break;
            }
        }
    }
    return bUpdated;
}

function resolvePropertyString(xmlProperty) {
    var result;
    if (xmlProperty.attribs && xmlProperty.attribs.String) {
        result = xmlProperty.attribs.String.trim();
    }
    return result;
}

function initRolesInGroup(group, roleNames) {
    for (var i = 0; i < roleNames.length; i++) {
        var role = {
            id: roleNames[i],
            path: undefined
        };
        group.roles.push(role);
    }

}

function getEntityProperty(entity, sPropertyName) {
    var property;
    for (var i = 0; i < entity.properties.length; i++) {
        if (entity.properties[i].name === sPropertyName) {
            property = entity.properties[i];
            break;
        }
    }
    return property;
}

function tagEntityPropertyAsUrl(xmlProperty, entity) {
    var sProperty, sPropertyName;
    if (xmlProperty.attribs && xmlProperty.attribs.Path) {
        sPropertyName = xmlProperty.attribs.Path;
    }
    var propertyValues = htmlparser.DomUtils.getElementsByTagName('PropertyValue', xmlProperty.children);
    propertyValues.forEach(function (xmlPropertyValue) {
        if (xmlPropertyValue.attribs && xmlPropertyValue.attribs.Property) {
            sProperty = xmlPropertyValue.attribs.Property.toLowerCase();
        }
        if (sProperty === 'value') {
            if (xmlPropertyValue.attribs.Path) {
                sPropertyName = xmlPropertyValue.attribs.Path;
            }
        }
    });
    if (sPropertyName) {
        var property = getEntityProperty(entity, sPropertyName);
        if (property) {
            if (!property.tags) {
                property.tags = [];
            }
            property.tags.push('type:url');
        }
    }
}


function parseHeaderInfo(xmlTerm, entity) {
    var group = {
        type: 'Overview',
        roles: []
    };
    var bGroupUpdated = false;
    var tag;
    initRolesInGroup(group, ['title', 'description', 'image', 'mainInfo', 'secondaryInfo']);
    var xmlRecords = htmlparser.DomUtils.getElementsByTagName('Record', xmlTerm.children, false);
    xmlRecords.forEach(function (xmlRecord) {
        var xmlProperties = htmlparser.DomUtils.getElementsByTagName('PropertyValue', xmlRecord.children, false);
        xmlProperties.forEach(function (xmlProperty) {
            if (xmlProperty.attribs && xmlProperty.attribs.Property) {
                var sProperty = xmlProperty.attribs.Property.toLowerCase();
                switch (sProperty) {
                    case 'title':
                        bGroupUpdated = updateRolePathInGroup(xmlProperty, group, 'title');
                        break;
                    case 'description':
                        bGroupUpdated = updateRolePathInGroup(xmlProperty, group, 'description');
                        break;
                    case 'imageurl' :
                        bGroupUpdated = updateRolePathInGroup(xmlProperty, group, 'image');
                        tagEntityPropertyAsUrl(xmlProperty, entity);
                        break;
                    case 'typename' :
                        var typeName = resolvePropertyString(xmlProperty);
                        if (typeName) {
                            tag = 'label:' + typeName;
                            entity.tags.push(tag);
                        }
                        break;
                    case 'typenameplural' :
                        var typeNamePlural = resolvePropertyString(xmlProperty);
                        if (typeNamePlural) {
                            tag = 'label-plural:' + typeNamePlural;
                            entity.tags.push(tag);
                        }
                        break;
                }
            }
        });
    });
    if (bGroupUpdated) {
        entity.groups.push(group);
    }
}

function getReferences(context) {
    AliasUI = '';
    AliasService = [];
    AliasMeasures = '';
    AliasCommunication = '';
    var edmxReferences = htmlparser.DomUtils.getElementsByTagName('edmx:Reference', context.dom);
    edmxReferences.forEach(function (edmxReference) {
        if (edmxReference.attribs && edmxReference.attribs.Uri) {
            var uri = edmxReference.attribs.Uri;
            var edmxInclude;
            if (uri.indexOf('/UI.xml') > 0) {
                edmxInclude = htmlparser.DomUtils.getElementsByTagName('edmx:Include', edmxReference.children, false)[0];
                AliasUI = edmxInclude.attribs.Alias;
            }
            if (uri.indexOf('/Org.OData.Measures.V1.xml') > 0) {
                edmxInclude = htmlparser.DomUtils.getElementsByTagName('edmx:Include', edmxReference.children, false)[0];
                AliasMeasures = edmxInclude.attribs.Alias;
            }
            if (uri.indexOf('/Communication.xml') > 0) {
                edmxInclude = htmlparser.DomUtils.getElementsByTagName('edmx:Include', edmxReference.children, false)[0];
                AliasCommunication = edmxInclude.attribs.Alias;
            }
            if (uri.indexOf('/$metadata') > 0) {
                edmxInclude = htmlparser.DomUtils.getElementsByTagName('edmx:Include', edmxReference.children, false)[0];
                AliasService.push(edmxInclude.attribs.Alias);
            }
        }
    });
}

function getEntity(catalog, sEntityName) {
    var entity;
    for (var i = 0; i < catalog.entities.length; i++) {
        if (catalog.entities[i].name === sEntityName) {
            entity = catalog.entities[i];
            break;
        }
    }
    return entity;
}

function getAnnotations(context, catalog) {
    var annotationsNodes = htmlparser.DomUtils.getElementsByTagName('Annotations', context.dom);
    annotationsNodes.forEach(function (annotationsNode) {
        var sTarget, aTargets, sTargetEntityName, sTargetPropertyName;
        if (annotationsNode.attribs && annotationsNode.attribs.Target) {
            sTarget = annotationsNode.attribs.Target;
        }
        if (sTarget && sTarget.indexOf('.') > 0) {
            aTargets = sTarget.split('.');
        }
        if (aTargets && AliasService.indexOf(aTargets[0]) >= 0) {
            if (aTargets[1].indexOf('/') > 0) {
                var arrayNames = aTargets[1].split('/');
                sTargetEntityName = arrayNames[0];
                sTargetPropertyName = arrayNames[1];
            }
            else {
                sTargetEntityName = aTargets[1];
            }
        }
        if (!sTargetEntityName || sTargetEntityName.length === 0) {
            return;
        }
        var entity = getEntity(catalog, sTargetEntityName);
        if (!entity) {
            return;
        }
        if (!entity.groups) {
            entity.groups = [];
        }
        if (!entity.tags) {
            entity.tags = [];
        }
        var annotationNodes = htmlparser.DomUtils.getElementsByTagName('Annotation', annotationsNode.children);
        annotationNodes.forEach(function (annotationNode) {
            if (annotationNode.attribs && annotationNode.attribs.Term) {
                var term = annotationNode.attribs.Term;
                switch (term) {
                    case AliasUI + '.HeaderInfo':
                        parseHeaderInfo(annotationNode, entity);
                        break;
                    case AliasUI + '.Badge':
                        parseBadge(annotationNode, entity);
                        break;
                    case AliasMeasures + '.ISOCurrency':
                        parseISOCurrency(annotationNode, entity, sTargetPropertyName);
                        break;
                    case AliasMeasures + '.Unit':
                        parseUnit(annotationNode, entity, sTargetPropertyName);
                        break;
                    case AliasCommunication + '.Address':
                        parseAddress(annotationNode, entity);
                        break;
                    case AliasCommunication + '.Contact':
                        parseContact(annotationNode, entity);
                        break;
                    case AliasUI + '.Chart':
                        parseChart(annotationNode, entity);
                        break;
                    default:
                        parseDataField(annotationNode, entity);
                        break;
                }
            }
        });
    });
}

function parseBadge(xmlTerm, entity) {
    var group = {
        type: 'Overview',
        roles: []
    };
    var bGroupUpdated = false;
    initRolesInGroup(group, ['title', 'description', 'image', 'mainInfo', 'secondaryInfo']);
    var xmlRecords = htmlparser.DomUtils.getElementsByTagName('Record', xmlTerm.children, false);
    xmlRecords.forEach(function (xmlRecord) {
        var xmlProperties = htmlparser.DomUtils.getElementsByTagName('PropertyValue', xmlRecord.children, false);
        xmlProperties.forEach(function (xmlProperty) {
            if (xmlProperty.attribs && xmlProperty.attribs.Property) {
                var sProperty = xmlProperty.attribs.Property.toLowerCase();
                switch (sProperty) {
                    case 'title' :
                        bGroupUpdated = updateRolePathInGroup(xmlProperty, group, 'title');
                        break;
                    case 'headline':
                        bGroupUpdated = updateRolePathInGroup(xmlProperty, group, 'description');
                        break;
                    case 'typeimageurl':
                        bGroupUpdated = updateRolePathInGroup(xmlProperty, group, 'image');
                        tagEntityPropertyAsUrl(xmlProperty, entity);
                        break;
                    case 'maininfo' :
                        bGroupUpdated = updateRolePathInGroup(xmlProperty, group, 'mainInfo');
                        break;
                    case 'secondaryinfo' :
                        bGroupUpdated = updateRolePathInGroup(xmlProperty, group, 'secondaryInfo');
                        break;
                }
            }
        });
    });
    if (bGroupUpdated) {
        entity.groups.push(group);
    }
}

function parseISOCurrency(xmlTerm, entity, sTargetPropertyName) {
    var group = {
        type: 'AmountWithCurrency',
        roles: [
            {
                id: 'amount',
                path: sTargetPropertyName
            },
            {
                id: 'currency',
                path: resolveAttributePath(xmlTerm)
            }
        ]
    };
    entity.groups.push(group);
}

function parseUnit(xmlTerm, entity, sTargetPropertyName) {
    var group = {
        type: 'ValueWithUnit',
        roles: [
            {
                id: 'value',
                path: sTargetPropertyName
            },
            {
                id: 'unit',
                path: resolveAttributePath(xmlTerm)
            }
        ]
    };
    entity.groups.push(group);
}

function parseAddress(xmlTerm, entity) {
    var group = {
        type: 'Address',
        roles: []
    };
    var bGroupUpdated = false;
    initRolesInGroup(group, ['street', 'city', 'region', 'zipCode', 'country', 'poBox', 'extension']);
    var xmlRecords = htmlparser.DomUtils.getElementsByTagName('Record', xmlTerm.children, false);
    xmlRecords.forEach(function (xmlRecord) {
        var xmlProperties = htmlparser.DomUtils.getElementsByTagName('PropertyValue', xmlRecord.children, false);
        xmlProperties.forEach(function (xmlProperty) {
            if (xmlProperty.attribs && xmlProperty.attribs.Property) {
                var sProperty = xmlProperty.attribs.Property.toLowerCase();
                switch (sProperty) {
                    case 'street' :
                        bGroupUpdated = updateRolePathInGroup(xmlProperty, group, 'street');
                        break;
                    case 'locality':
                        bGroupUpdated = updateRolePathInGroup(xmlProperty, group, 'city');
                        break;
                    case 'region':
                        bGroupUpdated = updateRolePathInGroup(xmlProperty, group, 'region');
                        break;
                    case 'code' :
                        bGroupUpdated = updateRolePathInGroup(xmlProperty, group, 'zipCode');
                        break;
                    case 'country' :
                        bGroupUpdated = updateRolePathInGroup(xmlProperty, group, 'country');
                        break;
                    case 'pobox' :
                        bGroupUpdated = updateRolePathInGroup(xmlProperty, group, 'poBox');
                        break;
                    case 'ext' :
                        bGroupUpdated = updateRolePathInGroup(xmlProperty, group, 'extension');
                        break;
                }
            }
        });
    });
    if (bGroupUpdated) {
        entity.groups.push(group);
    }
}

function parseContact(xmlTerm, entity) {
    var groupPerson = {
        type: 'Person',
        roles: []
    };
    var groupRoleInOrganization = {
        type: 'RoleInOrganization',
        roles: []
    };
    var bGroupPersonUpdated = false;
    var bGroupOrganizationUpdated = false;
    initRolesInGroup(groupPerson, ['role', 'orgName', 'orgUnit']);
    initRolesInGroup(groupRoleInOrganization, ['fullName', 'givenName', 'middleName', 'familyName', 'prefix', 'suffix', 'nickName', 'photo', 'gender', 'title', 'birthday']);
    var xmlRecords = htmlparser.DomUtils.getElementsByTagName('Record', xmlTerm.children, false);
    xmlRecords.forEach(function (xmlRecord) {
        var xmlProperties = htmlparser.DomUtils.getElementsByTagName('PropertyValue', xmlRecord.children, false);
        xmlProperties.forEach(function (xmlProperty) {
            if (xmlProperty.attribs && xmlProperty.attribs.Property) {
                var sProperty = xmlProperty.attribs.Property.toLowerCase();
                switch (sProperty) {
                    case 'fn' :
                        bGroupPersonUpdated = updateRolePathInGroup(xmlProperty, groupPerson, 'fullName');
                        break;
                    case 'nickname':
                        bGroupPersonUpdated = updateRolePathInGroup(xmlProperty, groupPerson, 'nickName');
                        break;
                    case 'photo':
                        bGroupPersonUpdated = updateRolePathInGroup(xmlProperty, groupPerson, 'photo');
                        tagEntityPropertyAsUrl(xmlProperty, entity);
                        break;
                    case 'bday' :
                        bGroupPersonUpdated = updateRolePathInGroup(xmlProperty, groupPerson, 'birthday');
                        break;
                    case 'gender' :
                        bGroupPersonUpdated = updateRolePathInGroup(xmlProperty, groupPerson, 'gender');
                        break;
                    case 'title' :
                        bGroupPersonUpdated = updateRolePathInGroup(xmlProperty, groupPerson, 'title');
                        break;
                    case 'role' :
                        bGroupOrganizationUpdated = updateRolePathInGroup(xmlProperty, groupRoleInOrganization, 'role');
                        break;
                    case 'org' :
                        bGroupOrganizationUpdated = updateRolePathInGroup(xmlProperty, groupRoleInOrganization, 'orgName');
                        break;
                    case 'orgunit' :
                        bGroupOrganizationUpdated = updateRolePathInGroup(xmlProperty, groupRoleInOrganization, 'orgUnit');
                        break;
                    case 'n':
                        bGroupPersonUpdated = parseContactNameType(xmlProperty, groupPerson);
                        break;
                }
            }
        });
    });
    if (bGroupOrganizationUpdated) {
        entity.groups.push(groupRoleInOrganization);
    }
    if (bGroupPersonUpdated) {
        entity.groups.push(groupPerson);
    }
}

function parseContactNameType(xmlTerm, groupPerson) {
    var bGroupPersonUpdated = false;
    var xmlRecords = htmlparser.DomUtils.getElementsByTagName('Record', xmlTerm.children, false);
    xmlRecords.forEach(function (xmlRecord) {
        var xmlProperties = htmlparser.DomUtils.getElementsByTagName('PropertyValue', xmlRecord.children, false);
        xmlProperties.forEach(function (xmlProperty) {
            if (xmlProperty.attribs && xmlProperty.attribs.Property) {
                var sProperty = xmlProperty.attribs.Property.toLowerCase();
                switch (sProperty) {
                    case 'surname' :
                        bGroupPersonUpdated = updateRolePathInGroup(xmlProperty, groupPerson, 'familyName');
                        break;
                    case 'given':
                        bGroupPersonUpdated = updateRolePathInGroup(xmlProperty, groupPerson, 'givenName');
                        break;
                    case 'additional':
                        bGroupPersonUpdated = updateRolePathInGroup(xmlProperty, groupPerson, 'middleName');
                        break;
                    case 'prefix' :
                        bGroupPersonUpdated = updateRolePathInGroup(xmlProperty, groupPerson, 'prefix');
                        break;
                    case 'suffix' :
                        bGroupPersonUpdated = updateRolePathInGroup(xmlProperty, groupPerson, 'suffix');
                        break;
                }
            }
        });
    });
    return bGroupPersonUpdated;
}

function parseChart(xmlTerm, entity) {
    var group = {
        type: 'DataSeries',
        roles: []
    };
    var bGroupUpdated = false;
    var xmlRecords = htmlparser.DomUtils.getElementsByTagName('Record', xmlTerm.children, false);
    xmlRecords.forEach(function (xmlRecord) {
        var xmlProperties = htmlparser.DomUtils.getElementsByTagName('PropertyValue', xmlRecord.children, false);
        xmlProperties.forEach(function (xmlProperty) {
            if (xmlProperty.attribs && xmlProperty.attribs.Property) {
                var sProperty = xmlProperty.attribs.Property.toLowerCase();
                switch (sProperty) {
                    case 'measures' :
                        bGroupUpdated = addDataSeriesRole(xmlProperty, group, 'data');
                        break;
                    case 'dimensions' :
                        bGroupUpdated = addDataSeriesRole(xmlProperty, group, 'dimension');
                        break;
                }
            }
        });
    });
    if (bGroupUpdated) {
        entity.groups.push(group);
    }
}

function addDataSeriesRole(xmlProperty, group, roleName) {
    var bGroupUpdated = false;
    var index = 1;
    var role, value;
    var xmlPropertyPaths = htmlparser.DomUtils.getElementsByTagName('PropertyPath', xmlProperty.children);
    xmlPropertyPaths.forEach(function (xmlPropertyPath) {
        value = getTextNodeValue(xmlPropertyPath);
        if (value && index < 4) {
            role = {
                id: roleName + index,
                path: value
            };
            group.roles.push(role);
            bGroupUpdated = true;
            index++;
        }
    });
    for (var i = index; i < 4; i++) {
        role = {
            id: roleName + i,
            path: undefined
        };
        group.roles.push(role);
    }
    return bGroupUpdated;
}

function getTextNodeValue(xmlNode) {
    var result;
    var textNode = xmlNode.children[0];
    if (textNode.type === 'text') {
        result = textNode.data;
    }
    return result;
}

function parseDataField(xmlTerm, entity) {
    var xmlRecords = htmlparser.DomUtils.getElementsByTagName('Record', xmlTerm.children);
    xmlRecords.forEach(function (xmlRecord) {
        if (xmlRecord.attribs && xmlRecord.attribs.Type === AliasUI + '.DataField') {
            var xmlProperties = htmlparser.DomUtils.getElementsByTagName('PropertyValue', xmlRecord.children, false);
            if (xmlProperties && xmlProperties.length > 0) {
                var sLabel;
                var sPropertyName;
                xmlProperties.forEach(function (xmlProperty) {
                    if (xmlProperty.attribs && xmlProperty.attribs.Property) {
                        var sProperty = xmlProperty.attribs.Property.toLowerCase();
                        if (sProperty === 'label') {
                            if (xmlProperty.attribs && xmlProperty.attribs.String) {
                                sLabel = xmlProperty.attribs.String.trim();
                            }
                        }
                        if (sProperty === 'value') {
                            if (xmlProperty.attribs && xmlProperty.attribs.Path) {
                                sPropertyName = xmlProperty.attribs.Path;
                            }
                        }
                    }
                });
                if (sLabel && sPropertyName) {
                    var property = getEntityProperty(entity, sPropertyName);
                    if (property) {
                        if (!property.tags) {
                            property.tags = [];
                        }
                        property.tags.push('label:' + sLabel);
                    }
                }
            }
        }
    });
}

function resolveAttributePath(xmlNode) {
    var result;
    if (xmlNode.attribs && xmlNode.attribs.Path) {
        result = xmlNode.attribs.Path;
    }
    return result;
}

exports.getCatalogAnnotations = function (annotation, catalog) {
    var context = {};

    try {
        var handler = new htmlparser.DefaultHandler(function (error, dom) {
            if (!error) {
                context.dom = dom;

                getReferences(context);

                getAnnotations(context, catalog);

            }
        }, { verbose: false, ignoreWhitespace: true });

        var parser = new htmlparser.Parser(handler);
        parser.parseComplete(annotation);
    }
    catch (err) {
        logger.error(err);
    }

    return catalog;
};

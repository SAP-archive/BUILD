/* eslint no-unused-vars: 0 */
'use strict';

function replaceDotsWithUnderScore(match) {
    return match.replace(/\./g, '_');
}

function constructControls(tree, type, version, isPrivate) {
    var pattern = {
        'floorPlans': {
            'ABSOLUTE': {
                'name': 'ABSOLUTE',
                'controls': {
                    'sap.m.Page': {
                        'catalogVersion': '1.26.6',
                        'controlCatalog': 'sap.m',
                        'controlId': 'Page',
                        'ctrlType': 'sap.m.Page',
                        'groups': [{
                            'binding': {
                                'filterOptions': [

                                ],
                                'sortOptions': [

                                ]
                            },
                            'children': [{
                                'name': 'root'
                            }],
                            'groupId': 'content'
                        }],
                        'properties': [{
                            'name': 'showHeader',
                            'value': 'false'
                        }, {
                            'name': 'enableScrolling',
                            'value': 'false'
                        }],
                        'uiCatalogName': 'openui5r1'
                    },
                    'sap.ui.commons.layout.AbsoluteLayout': {
                        'catalogVersion': '1.26.6',
                        'controlCatalog': 'sap.ui',
                        'controlId': 'root',
                        'ctrlType': 'sap.ui.commons.layout.AbsoluteLayout',
                        'parentControlId': 'Page',
                        'properties': [{
                            'name': 'verticalScrolling',
                            'value': 'Auto'
                        }, {
                            'name': 'horizontalScrolling',
                            'value': 'Auto'
                        }],
                        'uiCatalogName': 'openui5r1'
                    }
                },
                'rootControlId': 'Page',
                'thumbnail': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABQAAAAQAAQMAAACEXWYAAAAAA1BMVEX///+nxBvIAAAAtElEQVQYGe3BAQEAAACAkP6v7ggKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGIQeAAHYiJ6XAAAAAElFTkSuQmCC'
            }
        },
        'actions': {
            'Alert': {
                'Library': 'SAPUI5',
                'displayToUser': true,
                'actionFn': ' alert ("{{text}}");',
                'actionId': 'ALERT',
                'actionParam': [{
                    'paramName': 'text',
                    'paramDisplayName': 'Text',
                    'paramType': 'String'
                }],
                'name': 'Alert'
            },
            'DeleteRecord': {
                'Library': 'SAPUI5',
                'displayToUser': false,
                'actionFn': 'var onSuccess = jQuery<;dot;>proxy(function (oData, response) { this<;dot;>onNavBack(); }, this); this<;dot;>getView()<;dot;>getModel()<;dot;>remove(this<;dot;>sContext, null, onSuccess);',
                'actionId': 'DELETERECORD',
                'actionParam': [],
                'name': 'DeleteRecord'
            },
            'ListSelect': {
                'Library': 'SAPUI5',
                'displayToUser': false,
                'actionFn': 'var oListItem = oEvent<;dot;>getParameter("listItem");var oBindingContext = oListItem<;dot;>getBindingContext();var sPath = oBindingContext<;dot;>getPath();if (sPath<;dot;>substring(0, 1) == "/") {sPath = sPath<;dot;>substring(1);} this<;dot;>oRouter<;dot;>navTo("{{routeName}}", { context : sPath }, true);',
                'actionId': 'LISTSELECT',
                'actionParam': [{
                    'paramName': 'oEvent',
                    'paramDisplayName': 'Event',
                    'paramType': 'EVENT'
                }, {
                    'paramName': 'routeName',
                    'paramDisplayName': 'Route',
                    'paramType': 'PAGE'
                }],
                'name': 'ListSelect'
            },
            'NavTo': {
                'Library': 'SAPUI5',
                'displayToUser': true,
                'actionFn': ' sap<;dot;>ui<;dot;>core<;dot;>UIComponent<;dot;>getRouterFor(this)<;dot;>navTo("{{routeName}}");',
                'actionId': 'NAVTO',
                'actionParam': [{
                    'paramName': 'routeName',
                    'paramDisplayName': 'Page',
                    'paramType': 'PAGE'
                }],
                'name': 'NavTo'
            },
            'NavBackPage': {
                'Library': 'SAPUI5',
                'displayToUser': false,
                'actionFn': 'sap<;dot;>ui<;dot;>core<;dot;>UIComponent<;dot;>getRouterFor(this)<;dot;>navTo("{{routeName}}");',
                'actionId': 'NAVBACKPAGE',
                'actionParam': [{
                    'paramName': 'routeName',
                    'paramType': 'PAGE'
                }],
                'name': 'NavBackPage'
            },
            'Prompt': {
                'Library': 'SAPUI5',
                'displayToUser': false,
                'actionFn': 'prompt ("{{text}}");',
                'actionId': 'PROMPT',
                'actionParam': [{
                    'paramName': 'text',
                    'paramDisplayName': 'Text',
                    'paramType': 'String'
                }],
                'name': 'Prompt'
            }
        }

    };
    var controlTree = [];
    var controlString = '';
    var tempStr = '';
    if (tree.namespace !== undefined && tree.namespace !== null) {
        for (var folder in tree.namespace) {
            constructChildControls(tree.namespace[folder].children.namespace, controlTree);
            if (controlTree[0]) {
                if (Object.keys(controlTree[0]).length > 0) {
                    tempStr = JSON.stringify(controlTree[0]);
                    controlString += tempStr.substring(1, tempStr.length - 1) + ',';
                    controlTree = [];
                }
            }
        }
    } else {
        //for (var itr in tree) {
        for (var itr = 0; itr < tree.length; itr++) {
            constructChildControls(tree[itr], controlTree);
            if (controlTree[0]) {
                if (Object.keys(controlTree[0]).length > 0) {
                    tempStr = JSON.stringify(controlTree[0]);
                    controlString += tempStr.substring(1, tempStr.length - 1) + ',';
                    controlTree = [];
                }
            }
        }
    }
    var tmpwholeString = '{' + controlString.substring(0, controlString.length - 1) + '}';
    var controlObject = JSON.parse(tmpwholeString);
    var catalogJsonParent = {};
    catalogJsonParent.controls = controlObject; //controlCatalogArray;
    catalogJsonParent.floorPlans = pattern.floorPlans;
    catalogJsonParent.actions = pattern.actions;
    catalogJsonParent.catalogVersion = '1_0';
    catalogJsonParent.libraryVersion = version;
    catalogJsonParent.description = 'openui5r5';
    catalogJsonParent.displayName = 'Open UI5';
    catalogJsonParent.catalogLang = 'openui5';
    catalogJsonParent.isRootCatalog = true;
    catalogJsonParent.rootCatalogId = null;
    if (isPrivate) {
        catalogJsonParent.libraryURL = '/api/uicatalogs/private/uilib/' + type + '/' + version.replace(/\./g, '<;dot;>') + '/sap-ui-core.js';
    } else {
        catalogJsonParent.libraryURL = '/api/uicatalogs/public/uilib/' + type + '/' + version.replace(/\./g, '<;dot;>') + '/sap-ui-core.js';
    }
    // var mashupString = '{' +
    //     ' 'catalogIdOfAngularCatalog": "sap.norman.controls.Angular",' +
    //     ' "catalogIdOfHTMLCatalog": "sap.ui.core.HTML"' +
    //     '}';
    //catalogJsonParent.mashupControls = JSON.parse(mashupString);
    catalogJsonParent.libraryObjectId = '';
    catalogJsonParent.libraryPublicURL = '';
    catalogJsonParent.catalogName = type + '_' + version + '_rootCatalog';
    var finalOutputStr = JSON.stringify(catalogJsonParent);
    finalOutputStr = finalOutputStr.replace(/(([a-zA-Z0-9]+\.){2,}\w+)/g, replaceDotsWithUnderScore);
    finalOutputStr = finalOutputStr.replace(/sap\.m/g, 'sap_m');
    finalOutputStr = finalOutputStr.replace(/sap\.ui/g, 'sap_ui');
    finalOutputStr = finalOutputStr.replace(/%26/g, '&');
    finalOutputStr = finalOutputStr.replace(/<;dot;>/g, '.');
    document.getElementById('libraryMetadata').innerHTML = finalOutputStr;
}

function constructChildControls(packagename, controlTree) {
    var packageStr = '';
    var resultString = '';
    resultString = renderProperties(packagename);
    if (resultString.length !== 0) {
        packageStr += resultString + ',';
    }
    if (packageStr.length > 1) {
        packageStr = packageStr.substring(0, packageStr.length - 1);
    }
    var jsonObject = JSON.parse('{' + packageStr + '}');
    if (Object.keys(jsonObject).length !== 0) {
        if (controlTree.length === 0) {
            controlTree.push(jsonObject);
        } else {
            if (Object.keys(jsonObject).length > 1) {
                jQuery.extend(controlTree[0], jsonObject);
            }
        }
    }
    // console.log(packageStr);
    return;
    // return packageStr;
}



function renderProperties(control) {
    var propertiesJson = {};
    propertiesJson[control] = {};
    var metadata = {};
    jQuery.extend(metadata, getMetaData(control));
    var prop = {};
    var aggregation = {};
    var eventsArray = {};
    var association = {};
    var token = null;
    var wholeString = '';

    try {
        var propJson = metadata.getProperties();
        //console.log(control + ' *** ');
        var aggJson = metadata.getAggregations();
        var assocJson = metadata.getAssociations();
        var eventJson = metadata.getEvents();

        if (aggJson.hasOwnProperty('customData')) {
            aggJson.customData._oParent = null;
        }
        if (aggJson.hasOwnProperty('layoutData')) {
            aggJson.layoutData._oParent = null;
        }
        if (aggJson.hasOwnProperty('dependents')) {
            aggJson.dependents._oParent = null;
        }
        if (aggJson.hasOwnProperty('tooltip')) {
            aggJson.tooltip._oParent = null;
        }
        var keysArrayPropJson = Object.keys(propJson);
        keysArrayPropJson = Object.keys(propJson);
        for (var key in aggJson) {
            var types = [];
            delete aggJson[key]._sName;
            delete aggJson[key]._oParent;
            token = aggJson[key];
            token.isDataDriven = false;
            token.displayToUser = true;
            token.types = [];
            token.renderAction = '';
            token.aggregationTemplate = {};

            var aggName = aggJson[key].name;
            token.displayName = aggName.charAt(0).toUpperCase() + aggName.slice(1);

            if (token.hasOwnProperty('altTypes') && undefined !== token.altTypes) {
                var newAltArray = [];
                for (var i = 0; i < token.altTypes.length; i++) {
                    newAltArray[i] = token.altTypes[i].slice();
                }
                types = types.concat(newAltArray);
                delete token.altTypes;
            }

            if (token.hasOwnProperty('type')) {
                types.push(token.type);
                delete token.type;
            }
            token.types = types;

            if (token.deprecated !== null) {
                if (token.deprecated) {
                    token.displayToUser = false;
                } else {
                    token.deprecated = false;
                }
            }
            aggregation[token.name] = {};
            jQuery.extend(aggregation[token.name], token);
        }
        for (var it in assocJson) {
            token = assocJson[it];
            if (assocJson[it].hasOwnProperty('_iKind')) {
                delete assocJson[it]._iKind;
            }
            if (assocJson[it].hasOwnProperty('_oParent')) {
                delete assocJson[it]._oParent;
            }
            if (assocJson[it].hasOwnProperty('_sGetter')) {
                delete assocJson[it]._sGetter;
            }
            if (assocJson[it].hasOwnProperty('_sMutator')) {
                delete assocJson[it]._sMutator;
            }
            if (assocJson[it].hasOwnProperty('_sUID')) {
                delete assocJson[it]._sUID;
            }
            token.isDataDriven = false;
            if (token.deprecated !== null) {
                association[token.name] = {};
                jQuery.extend(association[token.name], token);
            }
        }
        for (var itr in eventJson) {
            var jsonObj = {};
            if (eventJson[itr].deprecated !== null) {
                jsonObj = {
                    name: itr,
                    displayName: itr.charAt(0).toUpperCase() + itr.slice(1),
                    displayToUser: true,
                    deprecated: eventJson[itr].deprecated
                };
                eventsArray[jsonObj.name] = {};
                jQuery.extend(eventsArray[jsonObj.name], jsonObj);
            }
        }
        prop.parent = metadata.getParent()._sClassName;
        var defaultAggregation = '';
        if (metadata.getDefaultAggregation() !== null && metadata.getDefaultAggregation() !== '' && metadata.getDefaultAggregation() !== undefined) {
            defaultAggregation = metadata.getDefaultAggregation().name;
        }
        prop.defaultAggregation = defaultAggregation;
        prop.defaultProperty = null;
        if (control === 'sap_m_Button') {
            prop.defaultProperty = 'text';
        }
        prop.readOnlyPropertyName = 'na';
        if (keysArrayPropJson.indexOf('editable') !== -1) {
            prop.readOnlyPropertyName = 'editable';
        }
        prop.aggregations = aggregation;
        prop.properties = generateDefaultProperties(control, propJson);
        propJson = null;
        prop.aggregations = aggregation;
        prop.associations = association;
        prop.events = eventsArray;
        prop.deprecated = false;
        prop.tagname = '';
        prop.isStructuralElement = false;
        prop.patternData = {};

        prop.icon = '/resources/norman-ui-catalog-manager-client/assets/norman-uicatalogmanager-client.svg';
        prop.structuralType = '';
        prop.controlTemplate = '';

        var additionalMetadata = {};
        additionalMetadata.additionalMetadata = prop;
        additionalMetadata.groupName = '';
        additionalMetadata.description = control.description;
        additionalMetadata.name = control;
        additionalMetadata.displayName = '';
        additionalMetadata.displayToUser = true;
        if (control) {
            additionalMetadata.displayName = control.substring(control.lastIndexOf('.') + 1, control.length);
            additionalMetadata.groupName = control.substring(0, control.lastIndexOf('.'));
        }
        jQuery.extend(propertiesJson[control], additionalMetadata);
        if (Object.keys(propertiesJson[control]).length !== 0) {
            wholeString += JSON.stringify(propertiesJson) + ',';
        }
    } catch (err) {
        //console.log('->>>>>>>>>' + err);
    }
    if (wholeString.length > 1) {
        // remove the brackets { at start and } at end and comma at end
        wholeString = wholeString.substring(1, wholeString.length - 2);
    }
    return wholeString;
}


function getMetaData(controlName) {
    try {
        jQuery.sap.require(controlName);
        var elementClass = {};
        jQuery.extend(elementClass, getControlClass(controlName));
        return new elementClass.getMetadata();
    } catch (err) {
        //console.log(err);
    }

}


function _stringToFunction(str) {
    var arr = str.split('.');
    var fn = (window || this);
    for (var i = 0, len = arr.length; i < len && fn; i++) {
        fn = fn[arr[i]];
    }
    return fn;
}


function getControlClass(sControlTypeName) {
    var elementClass = _stringToFunction(sControlTypeName);
    if (!elementClass) {
        var lib = this.getLibrary(sControlTypeName) + '.library';
        try {
            jQuery.sap.preloadModules(lib + '-preload', false);
            jQuery.sap.require(sControlTypeName);
        } catch (error) {
            //console.error('Control not found - ' + sControlTypeName);
            return null;
        }
        elementClass = _stringToFunction(sControlTypeName);
        if (!elementClass) {
            //console.error('Control not found - ' + sControlTypeName);
            return null;
        }
    }

    return elementClass;
}


function generateDefaultProperties(controlName, properties) {
    var mProp = {};
    var isDataDriven = {
        isDataDriven: false
    };

    jQuery.sap.each(properties, function(property, description) {
        description.isDataDriven = false;
        description.displayToUser = true;
        description.isDataDriven = false;
        description.isEditable = true;
        description.groupName = '';
        description.possibleValues = null;
        description.displayName = description.name;
        if (description.hasOwnProperty('_iKind')) {
            delete description._iKind;
        }
        if (description.hasOwnProperty('_oParent')) {
            delete description._oParent;
        }
        if (description.hasOwnProperty('_oType')) {
            delete description._oType;
        }
        if (description.hasOwnProperty('_sBind')) {
            delete description._sBind;
        }
        if (description.hasOwnProperty('_sGetter')) {
            delete description._sGetter;
        }
        if (description.hasOwnProperty('_sMutator')) {
            delete description._sMutator;
        }
        if (description.hasOwnProperty('_sUID')) {
            delete description._sUID;
        }
        if (description.hasOwnProperty('_sUnbind')) {
            delete description._sUnbind;
        }
        try {
            description.displayName = description.name.charAt(0).toUpperCase() + description.name.slice(1);
        } catch (error) {
            //console.log('display name error *******************' + description.name + ' error ' + error);
        }


        if (description.type.indexOf('.') !== -1) {
            var typeObject = getControlClass(description.type);
            if (typeof typeObject[Object.keys(typeObject)[0]] !== 'function') {
                description.possibleValues = [];
                description.possibleValues = Object.keys(typeObject);
            }
        }

        if (description.deprecated !== null) {
            if (!description.deprecated) {
                description.deprecated = false;
            }
        }
        mProp[description.name] = {};
        jQuery.extend(mProp[description.name], description);
    });
    return mProp;
}

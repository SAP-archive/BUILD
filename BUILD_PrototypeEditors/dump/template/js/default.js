'use strict';

window.norman = {
    services: {

        // ...
        // APIs to be implemented by the app, the ide will use them
        // ...

        ready: function (fn, listener) {
            var root = sap.ui.getCore().getUIArea(document.querySelector('*[data-sap-ui-area]')).getRootControl();
            if (root.getDomRef() || (!root.onAfterRendering && !root.onBeforeRendering)) {
                fn.call(listener);
            }
            else if (root.onBeforeRendering) {
                root.addEventDelegate({
                    onBeforeRendering: fn
                }, listener);
            }
            else {
                root.addEventDelegate({
                    onAfterRendering: fn
                }, listener);
            }
        },
        getRootControl: function () {
            //lazy loading
            if (!this._root) {
                this._root = sap.ui.getCore().getUIArea(document.querySelector('*[data-sap-ui-area]')).getRootControl();
            }
            return this._root;
        },
        controlAtPosition: function (x, y) {
            var oElem = document.elementFromPoint(x, y);
            var oCtrl = this._controlForElement(oElem);
            if (oCtrl && oCtrl.getUIArea().getRootControl() !== this.getRootControl()) {
                oCtrl = undefined;
            }
            return oCtrl;
        },

        siblingAtPosition: function (ctrlType, x, y) {
            var oCtrl = this.controlAtPosition(x, y);
            while (!!oCtrl) {
                var oParent = oCtrl.getParent(), oParentAggregation = oParent.getMetadata().getAllAggregations()[oCtrl.sParentAggregationName];
                if (this._extends(ctrlType, oParentAggregation.type)) {
                    break;
                }
                else {
                    var aggregations = oCtrl.getMetadata().getAllAggregations();
                    for (var aggrName in aggregations) {
                        var aggregation = aggregations[aggrName];
                        //must be empty aggregation and of desired type
                        if (this._extends(ctrlType, aggregation.type) && (!oCtrl.getAggregation(aggrName) || (aggregation.multiple === true && oCtrl.getAggregation(aggrName).length === 0))) {
                            break;
                        }
                    }
                }
                oCtrl = oParent;
            }
            if (oCtrl === this.getRootControl()) {
                oCtrl = undefined;
            }
            return oCtrl;
        },

        moveControlToPosition: function (ctrl, x, y) {
            var oldParent = ctrl.getParent();
            var oSibling = this.siblingAtPosition(ctrl.getMetadata().getName(), x, y);

            if (!oSibling) {
                if (oldParent) {
                    oldParent.invalidate();
                }
                return;
            }
            var oldAggrName = ctrl.sParentAggregationName;
            var oldAggrMd = oldParent.getMetadata().getAllAggregations()[oldAggrName];

            var newParent = oSibling.getParent();
            var newAggrName = oSibling.sParentAggregationName;
            var newAggrMd = newParent.getMetadata().getAllAggregations()[newAggrName];

            var i;
            if (oldParent === newParent && oldAggrMd.multiple) {
                // check if user wanted to move control before/after other one
                var arr = this._getAggregation(oldParent, oldAggrName);
                i = arr.indexOf(oSibling);
                if (i === -1) {
                    i = arr.indexOf(ctrl);
                }
                this._removeAggregation(oldParent, oldAggrName, ctrl);
                this._insertAggregation(oldParent, oldAggrName, ctrl, i);
            }
            // check if the control can be contained in this aggregation
            else if (oldParent !== newParent) {
                // remove from parent aggregation
                if (newAggrMd.multiple) {
                    this._removeAggregation(oldParent, oldAggrName, ctrl);
                    i = this._getAggregation(newParent, newAggrName).indexOf(oSibling);
                    if (i === -1) {
                        this._setAggregation(newParent, newAggrName, ctrl);
                    } else {
                        this._insertAggregation(newParent, newAggrName, ctrl, i);
                    }
                } else {
                    this._setAggregation(oldParent, oldAggrName, undefined);
                    newParent.setAggregation(newAggrName, ctrl);
                }
            } else {
                oldParent.invalidate();
            }
        },

        addSibling: function (oNewControlData, bAfter, oRefControl) {
            var parent = oRefControl.getParent();
            var aggregationName = oRefControl.sParentAggregationName;
            var i = jQuery.inArray(oRefControl, this._getAggregation(parent, aggregationName));
            if (bAfter === true) {
                i++;
            }
            var ctrl = this._initControl(oNewControlData);
            this._insertAggregation(parent, aggregationName, ctrl, i);
            return ctrl;
        },
        changeControl: function (oRefControl, oNewControlData) {
            if (oRefControl === this.getRootControl()) {
                return;
            }
            var parent = oRefControl.getParent();
            var aggregationName = oRefControl.sParentAggregationName;
            var i = jQuery.inArray(oRefControl, this._getAggregation(parent, aggregationName));
            var ctrl = this._initControl(oNewControlData);
            this.deleteControl(oRefControl);
            this._insertAggregation(parent, aggregationName, ctrl, i);
        },
        canDeleteControl: function (oCtrl) {
            return oCtrl !== this.getRootControl();
        },
        deleteControl: function (oCtrl) {
            var parent = oCtrl.getParent();
            var aggregationName = oCtrl.sParentAggregationName;
            this._removeAggregation(parent, aggregationName, oCtrl);
            oCtrl.destroy();
        },

        controlId: function (ctrl) {
            return ctrl.getId();
        },

        controlDomRef: function (ctrl) {
            return ctrl && ctrl.getDomRef ? ctrl.getDomRef() : undefined;
        },
        getParent: function (ctrl) {
            var parent = ctrl === this.getRootControl() ? undefined : ctrl.getParent();
            while (parent && this._canBeRendered(parent.getMetadata().getName()) && !this._isInPublicAggregation(parent)) {
                parent = parent.getParent();
            }
            return parent;
        },
        getControlType: function (ctrl) {
            return ctrl.getMetadata().getName();
        },
        getControlProperties: function (ctrl) {
            var md = ctrl.getMetadata();
            var aProperties = [];
            var oAllProps = md.getAllProperties();
            var oTemp = new sap.ui.core.Control(), oTempProps = oTemp.getMetadata().getAllProperties();
            oTemp.destroy();
            for (var sProperty in oAllProps) {
                // we skip properties of Control like busyDelay and showBusy...
                if (oTempProps[sProperty] !== undefined) {
                    continue;
                }
                var value = ctrl.getProperty(sProperty);
                var possibleValues;
                var sType = oAllProps[sProperty].type;
                var oClass = jQuery.sap.getObject(sType);
                if (oClass) {
                    possibleValues = [];
                    for (var sKey in oClass) {
                        var sValue = oClass[sKey];
                        if (typeof sValue !== 'string' && typeof sValue !== 'number') {
                            possibleValues = undefined;
                            break;
                        }
                        possibleValues.push(sValue);
                    }
                }
                // sType will work for boolean, float, int. Otherwise used as
                // string
                if (sType === 'sap.ui.core.CSSSize') {
                    sType = 'CSSSize';
                }
                aProperties.push({
                    name: sProperty,
                    value: value,
                    type: sType,
                    possibleValues: possibleValues
                });
            }
            return aProperties;
        },

        setControlProperty: function (property, ctrl) {
            if (ctrl) {
                // get the mutator from internal string on metadata
                // TODO check if there is better way, other solution is to build
                // the
                // string manually but not so clean as well
                var sPropName = property.name;
                var sNameUpper = sPropName.replace(sPropName.substr(0, 1), sPropName.substr(0, 1).toUpperCase());
                var propMd = ctrl.getMetadata().getAllProperties()[sPropName];
                var sMutator = propMd._sMutator || 'set' + sNameUpper;
                if (ctrl[sMutator]) {
                    ctrl[sMutator](property.value);
                } else {
                    ctrl.setProperty(property.ctrlType, property.value);
                }
            }
        },

        canHaveSiblings: function (ctrl) {
            if (ctrl === this.getRootControl()) {
                return false;
            }
            var parentAggregation = ctrl.getParent().getMetadata().getAllAggregations()[ctrl.sParentAggregationName];
            return parentAggregation && parentAggregation.visibility === 'public' && parentAggregation.multiple === true;
        },

        getPaletteForContainerOfControl: function (ctrl) {
            if (ctrl === this.getRootControl()) {
                return undefined;
            }
            var parent = ctrl.getParent();
            var aggregationName = ctrl.sParentAggregationName;
            var parentAggregation = parent.getMetadata().getAllAggregations()[aggregationName];
            return this._getPaletteForAggregation(parentAggregation);
        },

        getPaletteForGroup: function (group) {
            return this._getPaletteForAggregation(group.data.aggregation);
        },

        getGroups: function (ctrl) {
            //special handling for ComponentContainer
            if (ctrl.getComponentInstance && ctrl.getComponentInstance()) {
                return [
                    {
                        groupId: 'component',
                        children: [
                            ctrl.getComponentInstance().getAggregation('rootControl')
                        ],
                        singleChild: true
                    }
                ];
            }
            var groups = [];
            var oTemp = new sap.ui.core.Control(), oTempAggregations = oTemp.getMetadata().getAllAggregations();
            oTemp.destroy();
            var aggregations = ctrl.getMetadata().getAllAggregations();
            for (var sName in aggregations) {
                var aggr = aggregations[sName];
                // not exposing default aggregations from control
                if (!!oTempAggregations[sName]) {
                    continue;
                }
                var childsData = [];
                var childs = this._getAggregation(ctrl, sName) || [];
                if (!aggr.multiple && !!childs && !Array.isArray(childs)) {
                    childs = [
                        childs
                    ];
                }
                for (var i = 0, l = childs.length; i < l; i++) {
                    var child = childs[i];
                    childsData.push(child);
                }
                groups.push({
                    groupId: sName,
                    children: childsData,
                    singleChild: !aggr.multiple,
                    data: {
                        aggregation: aggr
                    }
                });
            }
            return groups;
        },

        emptyGroup: function (oCtrl, group) {
            var aggregation = group.data.aggregation;
            oCtrl[aggregation._sDestructor]();
        },

        addChild: function (childData, parent, parentGroup, index) {
            var groupId = parentGroup.groupId;
            var newCtrl = this._initControl(childData);
            if (typeof index === 'number') {
                this._insertAggregation(parent, groupId, newCtrl, index);
            }
            else {
                this._setAggregation(parent, groupId, newCtrl, index);
            }
            return newCtrl;
        },

        moveChild: function (child, parent, parentGroup, index) {
            var groupId = parentGroup.groupId;
            var oldIndex = parentGroup.children.indexOf(child);
            //if no index is passed, add it to the end
            if (typeof index !== 'number') {
                index = parentGroup.children.length;
            }
            if (oldIndex !== index) {
                this._removeAggregation(parent, groupId, child);
                this._insertAggregation(parent, groupId, child, index);
            }
            return child;
        },

        // UI5 specific internal methods

        _initControl: function (oCtrlData) {
            var MyClass = this._classFromString(oCtrlData.ctrlType);
            var ctrl = new MyClass();
            //properties setup, either by ctrl data
            if (oCtrlData.properties) {
                for (var i = 0, l = oCtrlData.properties.length; i < l; i++) {
                    this.setControlProperty(oCtrlData.properties[i], ctrl);
                }
            }
            //or default values
            else {
                var md = ctrl.getMetadata();
                var props = md.getAllProperties();
                for (var pName in props) {
                    var prop = props[pName];
                    if (prop.defaultValue === undefined || prop.defaultValue === null || prop.defaultValue === '') {
                        var defaultVal = null;
                        switch (prop.type) {
                            case 'string':
                                defaultVal = prop.name;
                                break;
                            case 'sap.ui.core.CSSSize':
                                defaultVal = 'auto';
                                break;
                            case 'sap.ui.core.URI':
                                defaultVal = 'sap-icon://add';
                                break;
                            case 'number':
                                defaultVal = 0;
                                break;
                            default:
                                // check if it is a key/value collection and choose
                                // the
                                // first element
                                var oClass = jQuery.sap.getObject(prop.type);
                                if (oClass && !oClass.prototype && oClass instanceof Object) {
                                    var sKey = Object.keys(oClass)[0];
                                    defaultVal = sKey ? oClass[sKey] : null;
                                }
                        }
                        if (defaultVal !== null) {
                            ctrl.setProperty(pName, defaultVal);
                        }
                    }
                }
            }
            return ctrl;
        },

        _initControlPalette: function () {
            var loadedLibraries = sap.ui.getCore().getLoadedLibraries();
            var palette = [];
            for (var library in loadedLibraries) {
                var controls = loadedLibraries[library].controls;
                for (var i = 0, l = controls.length; i < l; i++) {
                    // TODO insert appropriate images
                    if (this._canBeRendered(controls[i])) {
                        palette.push({
                            // imageUrl : 'sap-icon://calendar',
                            ctrlType: controls[i]
                        });
                    }
                }
            }
            this._controlPalette = palette;
        },

        _getPaletteForAggregation: function (aggregation) {
            var palette = [];
            if (aggregation) {
                if (!this._controlPalette) {
                    this._initControlPalette();
                }
                for (var i = 0, l = this._controlPalette.length; i < l; i++) {
                    var obj = this._controlPalette[i];
                    if (this._extends(obj.ctrlType, aggregation.type)) {
                        palette.push(obj);
                    }
                }
            }
            return palette;
        },

        _canBeRendered: function (sCtrlType) {
            // it means it can be rendered!
            return this._extends(sCtrlType, 'sap.ui.core.Control');

        },
        _extends: function (sCtrlType, sExtendType) {
            return sCtrlType === sExtendType || this._classFromString(sExtendType).prototype.isPrototypeOf(this._classFromString(sCtrlType).prototype);
        },

        _classFromString: function (sClass) {
            if (!jQuery.sap.isDeclared(sClass)) {
                try {
                    jQuery.sap.require(sClass);
                } catch (e) {
                    // statements to handle any exceptions
                    jQuery.sap.log.warning(e);
                }
            }
            var oClass = jQuery.sap.getObject(sClass);
            return oClass;
        },

        _controlForElement: function (element) {
            //safe to stop at the body
            if (!element || element.tagName.toLowerCase() === 'body') {
                return null;
            }
            var ctrl = sap.ui.getCore().byId(element.id);
            // check 2 levels up to see if the parent.parent control is
            // contained in
            // public aggregation...
            // e.g. Label in a Bar that is internalBar of Page
            if (ctrl && ( !this._isInPublicAggregation(ctrl) || !this._isInPublicAggregation(ctrl.getParent()) )) {
                ctrl = undefined;
            }
            return ctrl || this._controlForElement(element.parentElement);
        },
        _isInPublicAggregation: function (ctrl) {
            if (!ctrl) {
                return false;
            }
            var parent = ctrl.getParent(), aggregationName = ctrl.sParentAggregationName;
            if (parent && aggregationName) {
                var aggregationMD = parent.getMetadata().getAllAggregations()[aggregationName];
                if (aggregationMD && aggregationMD.visibility === 'public') {
                    return true;
                }
            }
            return false;
        },

        _getAggregation: function (ctrl, sAggrName) {
            var sNameUpper = sAggrName.replace(sAggrName.substr(0, 1), sAggrName.substr(0, 1).toUpperCase());
            var aggregationMd = ctrl.getMetadata().getAllAggregations()[sAggrName];
            var sGetter = aggregationMd._sGetter || 'get' + sNameUpper;
            if (ctrl[sGetter]) {
                return ctrl[sGetter]();
            } else {
                return ctrl.getAggregation(sAggrName);
            }
        },
        _setAggregation: function (ctrl, sAggrName, newCtrl) {
            var aggregationMd = ctrl.getMetadata().getAllAggregations()[sAggrName];
            sAggrName = aggregationMd.singularName || sAggrName;
            var sNameUpper = sAggrName.replace(sAggrName.substr(0, 1), sAggrName.substr(0, 1).toUpperCase());
            var sMutator = aggregationMd.multiple ? 'add' + sNameUpper : 'set' + sNameUpper;
            if (ctrl[sMutator]) {
                ctrl[sMutator](newCtrl);
            } else if (aggregationMd.multiple) {
                ctrl.addAggregation(sAggrName, newCtrl);
            } else {
                ctrl.setAggregation(sAggrName, newCtrl);
            }
            return ctrl;
        },
        _removeAggregation: function (ctrl, sAggrName, ctrlToRemove) {
            var aggregationMd = ctrl.getMetadata().getAllAggregations()[sAggrName];
            sAggrName = aggregationMd.singularName || sAggrName;
            var sNameUpper = sAggrName.replace(sAggrName.substr(0, 1), sAggrName.substr(0, 1).toUpperCase());
            var sMutator = 'remove' + sNameUpper;
            if (ctrl[sMutator]) {
                ctrl[sMutator](ctrlToRemove);
            } else if (aggregationMd.multiple) {
                ctrl.removeAggregation(sAggrName, ctrlToRemove);
            }
            return ctrl;
        },
        _insertAggregation: function (ctrl, sAggrName, newCtrl, i) {
            var aggregationMd = ctrl.getMetadata().getAllAggregations()[sAggrName];
            sAggrName = aggregationMd.singularName || sAggrName;
            if (!aggregationMd.multiple) {
                return this._setAggregation(ctrl, sAggrName, newCtrl);
            }
            var sNameUpper = sAggrName.replace(sAggrName.substr(0, 1), sAggrName.substr(0, 1).toUpperCase());
            var sMutator = 'insert' + sNameUpper;

            if (ctrl[sMutator]) {
                ctrl[sMutator](newCtrl, i);
            } else if (aggregationMd.multiple) {
                ctrl.insertAggregation(sAggrName, newCtrl, i);
            }
            return ctrl;
        }
    }
};

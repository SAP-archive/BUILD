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
                var root = document.querySelector('.sapUiRespGrid') || {};
                this._root = sap.ui.getCore().byId(root.id);
            }
            return this._root;
        },
        controlAtPosition: function (x, y) {
            var oElem = document.elementFromPoint(x, y), oCtrl;
            //check if clicked on wrapper of element
            if (sap.ui.getCore().byId(oElem.parentElement.id) === this.getRootControl()) {
                oCtrl = sap.ui.getCore().byId(oElem.childNodes[0].id);
            }
            else {
                oCtrl = this._controlForElement(oElem);
            }
            return oCtrl;
        },

        siblingAtPosition: function (ctrlType, x, y) {
            var oCtrl = this.controlAtPosition(x, y);
            while (!!oCtrl) {
                var oParent = oCtrl.getParent(), oParentAggregation = oParent.getMetadata().getAllAggregations()[oCtrl.sParentAggregationName];
                if (this._extends(ctrlType, oParentAggregation.type)) {
                    if (oCtrl === this.getRootControl()) {
                        oCtrl = undefined;
                    }
                    break;
                }
                oCtrl = oParent;
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

            // check if user wanted to move control before/after other one
            var arr = this._getAggregation(oldParent, oldAggrName);
            var i = arr.indexOf(oSibling);
            if (i === -1) {
                i = arr.indexOf(ctrl);
            }
            this._removeAggregation(oldParent, oldAggrName, ctrl);
            this._insertAggregation(oldParent, oldAggrName, ctrl, i);
        },

        addSibling: function (oNewControlData, bAfter, oRefControl) {
            var parent = oRefControl.getParent();
            var aggregationName = oRefControl.sParentAggregationName;
            var i = this._getAggregation(parent, aggregationName).indexOf(oRefControl);
            if (bAfter === true) {
                i++;
            }
            var ctrl = this._initControl(oNewControlData);
            this._insertAggregation(parent, aggregationName, ctrl, i);
            return ctrl;
        },
        changeControl: function (oRefControl, oNewControlData) {
            var parent = oRefControl.getParent();
            var aggregationName = oRefControl.sParentAggregationName;
            var i = this._getAggregation(parent, aggregationName).indexOf(oRefControl);
            var ctrl = this._initControl(oNewControlData);
            this.deleteControl(oRefControl);
            this._insertAggregation(parent, aggregationName, ctrl, i);
        },
        canDeleteControl: function (oCtrl) {
            // TODO check if it can
            return oCtrl instanceof sap.ui.core.LayoutData === false;
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
            if (ctrl === this.getRootControl()) {
                return ctrl.getDomRef();
            }
            else if (ctrl && ctrl.getDomRef() && ctrl.getParent() === this.getRootControl()) {
                return ctrl.getDomRef().parentElement;
            }
            return undefined;
        },
        getParent: function (ctrl) {
            var root = this.getRootControl(), parent = ctrl ? ctrl.getParent() : undefined;
            return parent === root || (ctrl instanceof sap.ui.core.LayoutData && parent && parent.getParent() === root) ? parent : undefined;
        },
        getControlType: function (ctrl) {
            return ctrl.getMetadata().getName();
        },
        getControlProperties: function (ctrl) {
            if (!ctrl) {
                return undefined;
            }
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
                    ctrl.setProperty(property.name, property.value);
                }
            }
        },

        canHaveSiblings: function (ctrl) {
            return ctrl.getParent() === this.getRootControl();
        },

        getPaletteForContainerOfControl: function (ctrl) {
            var parent = ctrl.getParent();
            var aggregationName = ctrl.sParentAggregationName;
            var parentAggregation = parent.getMetadata().getAllAggregations()[aggregationName];
            return this._getPaletteForAggregation(parentAggregation.type);
        },

        getPaletteForGroup: function (group) {
            return this._getPaletteForAggregation(group.groupType);
        },

        getDefaultGroup: function (ctrl) {
            var md = ctrl.getMetadata();
            var aggr = md.getDefaultAggregation();
            return this._getGroupData(ctrl, aggr);
        },

        getGroups: function (ctrl) {
            var root = this.getRootControl();
            if (!ctrl || (ctrl !== root && ctrl.getParent() !== root)) {
                return undefined;
            }
            var groups = [];
            var oTemp = new sap.ui.core.Control(), oTempAggregations = oTemp.getMetadata().getAllAggregations();
            oTemp.destroy();
            var aggregations = ctrl.getMetadata().getAllAggregations();
            if (ctrl !== root) {
                aggregations = {
                    layoutData: oTempAggregations.layoutData
                };
                oTempAggregations = {};
            }
            for (var sName in aggregations) {
                var aggr = aggregations[sName];
                // not exposing default aggregations from control
                if (!oTempAggregations[sName]) {
                    groups.push(this._getGroupData(ctrl, aggr));
                }
            }
            return groups;
        },

        emptyGroup: function (ctrl, group) {
            var aggregation = ctrl.getMetadata().getAllAggregations()[group.groupId];
            ctrl[aggregation._sDestructor]();
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
        getEvents: function (ctrl) {
            var oEvents = ctrl.getMetadata().getEvents();
            var result = [];
            for (var sEventId in oEvents) {
                var evt = {
                    eventId: sEventId,
                    eventName: sEventId,
                    possibleActions: this._getActionsForEvent(ctrl, sEventId),
                    selectedAction: this._getSelectedActionForEvent(ctrl, sEventId)
                };
                result.push(evt);
            }
            return result;
        },
        setActionForEvent: function (ctrl, eventId, action) {
            //TODO by code generator, temp implementation!!
            var curAction = this._getSelectedActionForEvent(ctrl, eventId);
            if (curAction) {
                ctrl.detachEvent(eventId, curAction.data.callback);
            }
            ctrl.attachEvent(eventId, action.data.data, action.data.callback);
            return ctrl;
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
            ctrl.setLayoutData(new sap.ui.layout.GridData());
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
        _getGroupData: function (ctrl, aggr) {
            if (!aggr) {
                return undefined;
            }
            var children = this._getAggregation(ctrl, aggr.name) || [];
            if (!aggr.multiple && !!children && !Array.isArray(children)) {
                children = [
                    children
                ];
            }
            var childrenData = [];
            for (var i = 0, l = children.length; i < l; i++) {
                var child = children[i];
                childrenData.push(child);
            }
            return {
                groupId: aggr.name,
                groupType: aggr.type,
                singleChild: !aggr.multiple,
                children: childrenData
            };
        },

        _getPaletteForAggregation: function (aggregationType) {
            var palette = [];
            if (aggregationType) {
                if (!this._controlPalette) {
                    this._initControlPalette();
                }
                for (var i = 0, l = this._controlPalette.length; i < l; i++) {
                    var obj = this._controlPalette[i];
                    if (this._extends(obj.ctrlType, aggregationType)) {
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
            while (element && !element.getAttribute('data-sap-ui')) {
                element = element.parentElement;
            }
            if (!element || element.tagName.toLowerCase() === 'body') {
                return null;
            }
            var ctrl = sap.ui.getCore().byId(element.getAttribute('id'));
            if (ctrl && ctrl !== this.getRootControl() && ctrl.getParent() !== this.getRootControl()) {
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
        },
        _getActionsForEvent: function (ctrl, eventId) {
            //must keep same reference of functions otherwise detachEvent won't work!
            this._events = this._events || [
                {
                    actionId: 'log',
                    actionName: 'log',
                    data: {
                        callback: function () {
                            console.log('hello world');
                        }
                    }
                },
                {
                    actionId: 'alert',
                    actionName: 'alert',
                    data: {
                        callback: function () {
                            window.alert('hello world');
                        }
                    }
                }
            ];
            return this._events;
        },

        _getSelectedActionForEvent: function (ctrl, eventId) {
            var events = ctrl.mEventRegistry[eventId] || [];
            var actions = this._getActionsForEvent(ctrl, eventId) || [];
            if (events.length && actions.length) {
                for (var j = 0, k = events.length; j < k; j++) {
                    for (var i = 0, l = actions.length; i < l; i++) {
                        if (events[j].fFunction === actions[i].data.callback) {
                            return actions[i];
                        }
                    }
                }
            }
            return undefined;
        }
    }
};

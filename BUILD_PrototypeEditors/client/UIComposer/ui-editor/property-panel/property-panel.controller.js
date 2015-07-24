'use strict';

var _ = require('norman-client-tp').lodash;

module.exports = ['$scope', '$rootScope', '$q', '$log', '$timeout', 'npGrid', 'npUiCanvasAPI', 'npPrototype', 'npUiCatalog', 'npBindingHelper', 'npImageHelper', 'npConstants', 'npPageMetadata', 'npMessaging', 'npPropertyChangeHelper', 'npPageMetadataHelper', 'npPropertyChangeObserver', 'npPageMetadataEvents',
    function ($scope, $rootScope, $q, $log, $timeout, npGrid, npUiCanvasAPI, npPrototype, npUiCatalog, npBindingHelper, npImageHelper, npConstants, npPageMetadata, npMessaging, npPropertyChangeHelper, npPageMetadataHelper, npPropertyChangeObserver, pageMdEvents) {

        var that = this;
        var selectedElement, changeDelay, aspectRatio;

        that.smartApp = false;

        var isSmartApp = function () {
            return npPrototype.getPrototype().then(function (prototype) {
                that.smartApp = prototype.isSmartApp;
                return that.smartApp;
            });
        };

        var setUp = function () {

            that.hasDataModel = npBindingHelper.hasEntities();
            var selectedElements = npGrid.getSelectedElements();
            selectedElement = selectedElements[0];

            // TODO: SHOULD handle multiple selectedElements in the future
            if (!_.isEmpty(selectedElement)) {
                var controlMd = selectedElement.controlMd;

                // set display name of control
                that.ctrlName = npUiCatalog.getControlDisplayName(controlMd.catalogControlName, controlMd.catalogId);
                that.isPage = selectedElement.isPageElement();
                that.canDelete = selectedElement.canDeleteElement();

                setupMainEntity();
                setupRoutes(controlMd);

                isSmartApp().then(function () {

                    setupAvailableMainEntities();
                    // initialize data for properties panel
                    setupProperties(controlMd);
                    // setup groups for control
                    setupGroups(controlMd);
                });
            }
        };

        var setupMainEntity = function () {
            npPageMetadata.getMainEntity()
                .then(function (mainEntityId) {
                    that.mainEntityId = mainEntityId;
                    that.mainEntity = _.find(that.modelEntities, {_id: mainEntityId});
                })
                .catch(function () {
                    that.mainEntity = undefined;
                    that.mainEntityId = undefined;
                });
        };

        var setupAvailableMainEntities = function () {
            var currentPageName = npPageMetadata.getCurrentPageName();
            return $q.when()
                .then(function () {
                    if (that.smartApp) {
                        return npPageMetadata.getAvailableMainEntityIds(currentPageName)
                            .then(npBindingHelper.getEntitiesFromIds);
                    }
                    else {
                        return npBindingHelper.getAllEntities();
                    }
                })
                .then(function (entities) {
                    that.modelEntities = entities || [];
                    that.modelEntities.unshift(undefined);
                    that.mainEntity = _.find(that.modelEntities, {_id: that.mainEntityId});
                })
                .catch(function () {
                    that.modelEntities = [];
                    that.mainEntity = undefined;
                });
        };

        that.onMainEntityChange = function () {
            var entityId = that.mainEntity ? that.mainEntity._id : undefined;
            that.mainEntityId = entityId;
            return npPageMetadata.changeMainEntity(entityId);
        };

        var setupProperties = function (controlMd) {
            // get id of control
            var catalogId = controlMd.catalogId, controlName = controlMd.catalogControlName;
            that.properties = _.chain(npPageMetadataHelper.getDisplayableProperties(controlMd))
                .map(function (propertyMd) {
                    var property = {
                        name: propertyMd.name,
                        value: propertyMd.value,
                        type: propertyMd.type,
                        displayName: npUiCatalog.getPropertyDisplayName(propertyMd.name, controlName, catalogId),
                        possibleValues: npUiCatalog.getPropertyPossibleValues(propertyMd.name, controlName, catalogId),
                        possiblePaths: npBindingHelper.getPropertyPathsFromMd(propertyMd, controlMd, that.mainEntity ? that.mainEntity._id : undefined, that.smartApp) || [],
                        isDoingBinding: npPageMetadataHelper.isBound(propertyMd),
                        isSmartApp: that.smartApp
                    };
                    if (property.isDoingBinding) {
                        var path = npBindingHelper.getPath(propertyMd.binding);
                        property.selectedPath = _.find(property.possiblePaths, {path: path});
                    }
                    else {
                        property.selectedPath = undefined;
                    }
                    var entityNameToolTip = (property.selectedPath && property.selectedPath.entityName) ? ' (' + property.selectedPath.entityName + ')' : '';
                    property.displayedValue = property.selectedPath ? (property.selectedPath.name + entityNameToolTip) : property.value;
                    return property;
                })
                .value();

            // to check if the control has properties height and width
            var iWidth = _.findIndex(that.properties, {name: npConstants.sizeProperties.WIDTH});
            var iHeight = _.findIndex(that.properties, {name: npConstants.sizeProperties.HEIGHT});
            that.fitFillEnabled = false;
            if (iHeight >= 0 && iWidth >= 0) {
                that.widthProperty = that.properties[iWidth];
                that.heightProperty = that.properties[iHeight];
                that.widthProperty.hasSpecialHandler = true;
                that.heightProperty.hasSpecialHandler = true;

                if (controlMd.catalogControlName === npUiCatalog.getImageName()) {
                    that.fitFillEnabled = true;
                }

                // Get locked aspect ratio design property if any
                var lockDesignProperty = npPageMetadataHelper.getControlDesignProperty(npConstants.designProperties.LOCKASPECT, controlMd) || {};
                that.isLockedAspectRatio = lockDesignProperty.value;
                if (that.isLockedAspectRatio) {
                    aspectRatio = npImageHelper.calcAspectRatio(_.parseInt(that.widthProperty.value), _.parseInt(that.heightProperty.value));
                }
            }
            else {
                that.isLockedAspectRation = false;
                that.widthProperty = that.heightProperty = null;
            }
        };

        /**
         * @private
         * @returns {PropertyMd[]} Array of default property metadata objects for a certain control.
         */
        var getDefaultEvents = function (catalogControlName, catalogId) {
            var catalogEvents = npUiCatalog.getControlEvents(catalogControlName, catalogId, true);
            return _.map(catalogEvents, function (event) {
                return {name: event.name, displayName: event.displayName};
            });
        };
        /* ---------------------------------------------------------------------------------------------------- */
        /* Editing properties for a given control
         /* ---------------------------------------------------------------------------------------------------- */
        that.onPropertyChange = function (property, keyDownEvent, endChange, isBindable) {
            if (isBindable) {
                property.value = property.displayedValue;
            }
            $timeout.cancel(changeDelay);

            var controlMd = selectedElement.controlMd;

            var keyPressed, inputField, oldSelectionStart;
            if (keyDownEvent) {
                inputField = keyDownEvent.target;
                oldSelectionStart = inputField.selectionStart;
                keyPressed = keyDownEvent.key;
            }
            property.value = npPropertyChangeHelper.typeAheadPropertyValue(property, keyPressed);

            if (!npPropertyChangeHelper.isPropertyValueValid(property)) {
                return;
            }

            if (inputField && npPropertyChangeHelper.updateCSSSelection(property, keyPressed)) {
                $timeout(function () {
                    inputField.setSelectionRange(oldSelectionStart, inputField.value.length);
                });
            }

            if (that.isLockedAspectRatio && (property.name === npConstants.sizeProperties.HEIGHT || property.name === npConstants.sizeProperties.WIDTH)) {
                var width, height;
                if (property.name === npConstants.sizeProperties.HEIGHT) {
                    height = _.parseInt(property.value);
                    width = npImageHelper.getWidthForFixedHeight(aspectRatio, height);

                }
                else if (property.name === npConstants.sizeProperties.WIDTH) {
                    width = _.parseInt(property.value);
                    height = npImageHelper.getHeightForFixedWidth(aspectRatio, width);
                }
                updateDimensions(width, height, false);
            }
            else {
                var newProp = {
                    name: property.name,
                    value: npPropertyChangeHelper.serializePropertyValue(property)
                };

                if (endChange) {
                    npPageMetadata.changeProperty({
                        controlId: controlMd.controlId,
                        properties: [newProp]
                    });
                    npPropertyChangeObserver.endPropertyChange(controlMd, newProp);
                }
                else {
                    npUiCanvasAPI.setControlPropertiesByMd(controlMd, [newProp]);
                    npPropertyChangeObserver.doPropertyChange(controlMd, newProp, keyDownEvent);
                }
            }
        };

        var findProperty = function (propertyName) {
            var property = _.find(that.properties, {name: propertyName});
            if (!property) {
                property = propertyName === 'width' ? that.widthProperty : propertyName === 'height' ? that.heightProperty : property;
            }
            return property;
        };

        /**
         * @name updateDimensions
         * @private
         * @description updates selectedElement controlMd with the new width/height. can pass only width or height, but needs at least one
         * @param {number} width
         * @param {number} height
         * @param {boolean} [bMoveTopLeft]
         */
        var updateDimensions = function (width, height, bMoveTopLeft) {
            var properties = [];
            if (typeof width === 'number') {
                properties.push({name: 'width', value: width + 'px'});
            }
            if (typeof height === 'number') {
                properties.push({name: 'height', value: height + 'px'});
            }
            if (_.isEmpty(properties)) {
                return;
            }
            var controlMd = selectedElement.controlMd;
            if (bMoveTopLeft) {
                npPageMetadata.moveControl({
                    controlId: controlMd.controlId,
                    newCtrlCatalogName: controlMd.catalogControlName,
                    parentId: controlMd.parentControlId,
                    groupId: controlMd.parentGroupId,
                    index: controlMd.parentGroupIndex,
                    x: 0,
                    y: 0
                });
            }
            // this will trigger controlPropertiesChanged and, panel properties will be updated by then
            npPageMetadata.changeProperty({
                controlId: controlMd.controlId,
                properties: properties
            }, {combineWithPreviousOperation: bMoveTopLeft});
        };


        // to Handle fit and fill for Image
        that.onFitOrFill = function (isFit) {
            var scaledDimensions;
            var width = _.parseInt(selectedElement.style.width),
                height = _.parseInt(selectedElement.style.height);
            if (isFit) {
                scaledDimensions = npImageHelper.getFitDimensions(width, height);
            }
            else {
                scaledDimensions = npImageHelper.getFillDimensions(width, height);
            }
            updateDimensions(scaledDimensions.imageWidth, scaledDimensions.imageHeight, true);
        };

        // handle lock and unlock of aspect ratio
        that.toggleLockAspectRatio = function () {
            that.isLockedAspectRatio = !that.isLockedAspectRatio;
            var property = {
                name: npConstants.designProperties.LOCKASPECT,
                value: that.isLockedAspectRatio
            };
            npPageMetadata.changeProperty({
                controlId: selectedElement.controlMd.controlId,
                properties: [{
                    name: property.name,
                    value: property.value
                }],
                propertyType: 'designProperties'
            });

            if (that.isLockedAspectRatio) {
                aspectRatio = npImageHelper.calcAspectRatio(_.parseInt(that.widthProperty.value), _.parseInt(that.heightProperty.value));
            }

        };

        /* ---------------------------------------------------------------------------------------------------- */
        /* Saving and reading actions for a given control
         /* ---------------------------------------------------------------------------------------------------- */


        var setupEvents = function (controlMd) {
            // Get Events for a control

            that.events = getDefaultEvents(controlMd.catalogControlName, controlMd.catalogId);

            // get all available actions
            that.actions = _.chain(npUiCatalog.getActions()).filter({displayToUser: true}).indexBy('name').value();

            if (_.isEmpty(that.events)) {
                that.event = {};
                return;
            }

            // read the latest event
            var eventsMd = controlMd.events,
                eventId = _.first(that.events).name,
                actionId = npConstants.actionTypes.NavTo,
                param = {key: 'routeName', value: 'Select'};
            if (!_.isEmpty(eventsMd)) {
                // @TODO this just assumes single event per control, the requirement of multiple events needs to be addressed
                var event = _.last(eventsMd);
                eventId = event.eventId;
                actionId = event.actionId;
                param = event.params[0] || {};
            }

            that.event = {
                savedEvent: _.find(that.events, {name: eventId}),
                savedAction: _.find(that.actions, {actionId: actionId})
            };

            that.event.savedValue = (param.key === 'routeName') ? _.find(that.routes, {name: param.value}) : param.value;
        };

        var getActionParams = function (action) {
            if (_.isEmpty(action.actionParam)) {
                return [];
            }
            return [{
                key: action.actionParam[0].paramName,
                value: action.actionParam[0].paramType === 'PAGE' && that.event.savedValue ? that.event.savedValue.name : that.event.savedValue
            }];
        };

        that.changeAction = function () {
            that.event.savedValue = that.event.savedAction.actionParam[0].paramType === 'PAGE' ? that.routes[0] : '';
            that.onSaveAction();
        };

        that.onSaveAction = function () {

            npPageMetadata.changeEvents({
                controlId: selectedElement.controlMd.controlId,
                eventId: that.event.savedEvent.name,
                actionId: that.event.savedAction.actionId,
                params: getActionParams(that.event.savedAction)
            });
        };


        /* ---------------------------------------------------------------------------------------------------- */
        /* adding and deleting of child controls for different aggregations of a control
         /* ---------------------------------------------------------------------------------------------------- */
        var setupGroups = function (ctrlMd) {
            var zCount = 1000;
            that.groups = _.map(npPageMetadataHelper.getDisplayableGroups(ctrlMd), function (groupMd, index) {
                var validControls = npUiCatalog.getValidControlsForAggregation(groupMd.groupId, ctrlMd.catalogControlName, ctrlMd.catalogId);
                validControls = _.sortBy(validControls, 'displayName');

                var isMultiple = npUiCatalog.isMultipleAggregation(groupMd.groupId, ctrlMd.catalogControlName, ctrlMd.catalogId),
                    entityId = that.mainEntity ? that.mainEntity._id : undefined,
                    possiblePaths = !that.smartApp && isMultiple ? npBindingHelper.getGroupPathsFromMd(ctrlMd, entityId) : undefined;
                return {
                    expanded: false,
                    groupId: groupMd.groupId,
                    style: {'z-index': zCount - index},
                    displayName: npUiCatalog.getAggregationDisplayName(groupMd.groupId, ctrlMd.catalogControlName, ctrlMd.catalogId),
                    validControls: validControls,
                    validControlsCount: _.size(validControls),
                    multiple: isMultiple,
                    selectedControl: validControls[0],
                    possiblePaths: possiblePaths || [],
                    isDoingBinding: npPageMetadataHelper.isBound(groupMd)
                };
            });
            _.forEach(that.groups, setupGroupChildren);
        };

        var setupGroupChildren = function (panelGroup) {
            var controlMd = selectedElement.controlMd,
                groupMd = npPageMetadataHelper.getGroupMd(panelGroup.groupId, controlMd),
                groupChildrenMd = controlMd.getChildrenMd(panelGroup.groupId);
            panelGroup.children = _.map(groupChildrenMd, function (childMd) {
                return {
                    canDelete: npGrid.getElementForControlId(childMd.controlId).canDeleteElement(),
                    displayName: npUiCatalog.getControlDisplayName(childMd.catalogControlName, childMd.catalogId),
                    childMd: childMd
                };
            });
            var selectedTemplate, selectedPath, templateName, templatePath;
            if (npPageMetadataHelper.isBound(groupMd)) {
                templateName = panelGroup.children[0].childMd.catalogControlName;
                templatePath = npBindingHelper.getPath(groupMd.binding);
                selectedTemplate = _.find(panelGroup.validControls, {name: templateName});
                selectedPath = _.find(panelGroup.possiblePaths, {path: templatePath});
            }
            else {
                if (!_.isEmpty(panelGroup.children[0])) {
                    templateName = panelGroup.children[0].childMd.catalogControlName;
                    selectedTemplate = _.find(panelGroup.validControls, {name: templateName});
                }
                if (!selectedTemplate) {
                    selectedTemplate = panelGroup.validControls[0];
                }
                selectedPath = panelGroup.possiblePaths[0];
            }
            panelGroup.selectedTemplate = selectedTemplate;
            panelGroup.selectedPath = selectedPath;
        };


        var updateGroup = function (group) {
            setupGroupChildren(group);
        };

        that.deleteChild = function (panelGroup, childMd) {
            npPageMetadata.deleteControl(childMd.controlId)
                .then(function () {
                    updateGroup(panelGroup);
                });
        };


        // TODO: This addChild logic is code repeated elsewhere.
        // TODO: Pass the selected item directly
        that.addChild = function (group, ctrlData) {
            npPageMetadata.addControl({
                newCtrlCatalogName: ctrlData.name,
                catalogId: ctrlData.catalogId,
                parentId: selectedElement.controlMd.controlId,
                groupId: group.groupId
            }, {
                selectAddedControls: false
            }).then(function () {
                updateGroup(group);
            });
        };


        that.bindGroup = function (group) {
            if (group.selectedTemplate && group.selectedPath) {
                bindGroup(group);
            }
        };

        var bindGroup = function (group) {
            var controlMd = selectedElement.controlMd,
                changeBindingData = {
                    controlId: controlMd.controlId,
                    groupId: group.groupId,
                    binding: group.selectedPath.binding,
                    template: {
                        newCtrlCatalogName: group.selectedTemplate.name,
                        catalogId: group.selectedTemplate.catalogId
                    },
                    autoBind: true
                };
            return npPageMetadata.changeBinding(changeBindingData).then(function () {
                return group;
            });
        };

        var unbindGroup = function (group) {
            return npPageMetadata.changeBinding({
                controlId: selectedElement.controlMd.controlId,
                groupId: group.groupId
            }).then(function () {
                return group;
            });
        };

        that.bindProperty = function (property) {
            if (!property.selectedPath) {
                return;
            }
            var propertyDef = {
                name: property.name,
                binding: property.selectedPath.binding
            };
            npPageMetadata.changeProperty({
                controlId: selectedElement.controlMd.controlId,
                properties: [propertyDef]
            });
        };

        that.togglePropertyIsDoingBinding = function (property) {
            property.isDoingBinding = !property.isDoingBinding;
            if (property.isDoingBinding) {
                that.bindProperty(property);
            }
            else {
                that.onPropertyChange(property, null, true);
            }
        };

        that.toggleGroupIsDoingBinding = function (group, event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            $timeout.cancel(changeDelay);
            group.isDoingBinding = !group.isDoingBinding;
            if (!group.isDoingBinding) {
                unbindGroup(group);
            }
            else if (group.selectedTemplate && group.selectedPath) {
                bindGroup(group);
            }
        };

        that.selectControl = function (controlMd) {
            var element = npGrid.getElementForControlId(controlMd.controlId);
            npGrid.setSelectedElements([element]);
        };


        var setupRoutes = function (controlMd) {
            that.routes = [{name: 'Select', displayName: 'Select...'}];
            var curPageName = npPageMetadata.getCurrentPageName();
            npPrototype.getPages().then(function (pages) {
                var routes = _.chain(pages).filter(function (page) {
                    return page.name !== curPageName;
                }).cloneDeep().value();
                that.routes = that.routes.concat(routes);
                setupEvents(controlMd);
            });
        };

        that.deleteControl = function () {
            npPageMetadata.deleteControl(selectedElement.controlMd.controlId);
        };

        var updateProperties = function (changedProperties) {
            _.forEach(changedProperties, function (changedProperty) {
                var panelProperty = findProperty(changedProperty.name);
                if (panelProperty) {
                    panelProperty.value = changedProperty.value;
                    panelProperty.isDoingBinding = changedProperty.binding && changedProperty.binding.paths && changedProperty.binding.paths.length;
                    if (panelProperty.isDoingBinding) {
                        var path = npBindingHelper.getPath(changedProperty.binding);
                        panelProperty.selectedPath = _.find(panelProperty.possiblePaths, {path: path});
                    }
                    else {
                        panelProperty.selectedPath = undefined;
                    }
                    var entityNameToolTip = (panelProperty.selectedPath && panelProperty.selectedPath.entityName) ? ' (' + panelProperty.selectedPath.entityName + ')' : '';
                    panelProperty.displayedValue = panelProperty.selectedPath ? (panelProperty.selectedPath.name + entityNameToolTip) : panelProperty.value;
                }
                else {
                    $log.warn('property-panel: did not find property to update', changedProperty);
                }
            });
        };

        var listenForPropertyChange = function (controlMd, changedProperties) {
            if (selectedElement && controlMd === selectedElement.controlMd) {
                updateProperties(changedProperties);
            }
        };

        var handlePropertiesChange = function (event, pageMd, propertyChanges) {
            var changedControls = _.pluck(propertyChanges, 'controlMd');
            if (selectedElement && _.contains(changedControls, selectedElement.controlMd)) {
                updateProperties(selectedElement.controlMd.properties);
            }
        };

        var handleEventsChange = function (event, changedControls) {
            if (selectedElement && _.contains(changedControls, selectedElement.controlMd)) {
                setupEvents(selectedElement.controlMd);
            }
        };

        var handleBindingChange = function (event, pageMd, bindingDefs) {
            bindingDefs.forEach(function (bindingDef) {
                var group = _.find(that.groups, function (grp) {
                    return grp.groupId === bindingDef.groupId;
                });
                if (group) {
                    if (bindingDef.binding) {
                        group.isDoingBinding = true;
                    }
                    else {
                        group.isDoingBinding = false;
                    }
                    updateGroup(group);
                }
            });
        };

        setUp();

        npPropertyChangeObserver.listenForChange(listenForPropertyChange);
        pageMdEvents.listen(pageMdEvents.events.controlPropertiesChanged, handlePropertiesChange);
        pageMdEvents.listen(pageMdEvents.events.controlEventsChanged, handleEventsChange);
        pageMdEvents.listen(pageMdEvents.events.controlsBindingChanged, handleBindingChange);
        // Listen for main entity changes
        pageMdEvents.listen(pageMdEvents.events.mainEntityChanged, setupMainEntity);

        $scope.$on('bindinghelper-model-loaded', setUp);
        $scope.$on('selectionChanged', setUp);
    }];

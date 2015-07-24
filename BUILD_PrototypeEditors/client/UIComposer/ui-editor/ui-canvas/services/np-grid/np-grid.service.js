'use strict';

var _ = require('norman-client-tp').lodash;

/**
 * The npGrid service provides an abstraction layer between UIComposer and UICanvas.
 * It keeps references to all controls inside UICanvas and their DOM representations.
 * Each grid element represents exactly one control of the canvas.
 * @namespace npGrid
 */

/**
 * @typedef {object} GridElement
 * @memberof npGrid
 * @property {number} elementId - grid elements id
 * @property {number} parentId - id of parent grid element
 * @property {object} control - reference to control in canvas
 * @property {object} style - object containing height and width of rendered control and top/left position relative to canvas
 * @property {GridElement[]} children - array of grid elements that represent that control's children
 * @property {function} domRef - obtain a reference to the element's control HTMLDOMElement wrapped as a jqLite object
 * @property {function} isSelected - whether element is currently selected
 * @property {function} isDragged - whether element is currently being dragged
 * @property {function} isPageElement - whether element represents the page control
 */

var npGrid = ['$rootScope', '$timeout', '$log', 'npUiCanvasAPI', 'npConstants', 'jQuery', 'npPageMetadata', 'npPageMetadataEvents', 'npFormFactor',
    'npPageMetadataHelper', 'npUiCatalog', 'npCanvasEvents',
    function ($rootScope, $timeout, $log, npUiCanvasAPI, npConstants, jQuery, npPageMetadata, pageMdEvents, npFormFactor, npPageMetadataHelper, npUiCatalog,
              npCanvasEvents) {
        var _rootElement = null,
            _elements = [],
            _elementsMap = {};

        /**
         * @name
         * @memberof npGrid
         * @description Initialize the grid for a certain page. Resets all elements.
         * @param {string} pageName
         */
        var init = function (pageName) {
            _rootElement = null;
            _elements = [];
            _elementsMap = {};
            pageChangeListener(null, pageName);
        };

        var pageChangeListener = function (event, newPageName) {
            stopListeningForMetadataChanges();
            if (_.isUndefined(newPageName)) {
                _rootElement = null;
                _.setArrayValues(_elements, []);
                updateElementMap(_elementsMap, _elements);
                return;
            }
            npPageMetadata.getPageMetadata(newPageName)
                .then(function (pageMd) {
                    refreshGrid(pageMd);
                    startListeningForMetadataChanges();
                });
        };

        pageMdEvents.listen(pageMdEvents.events.pageChanged, pageChangeListener);

        $rootScope.$on('uiCanvas/navigationDone', function () {
            $timeout(function () {
                updateLayout(_elementsMap);
            });
        });

        var refreshGrid = function (pageMd) {
            var rootControl = _.find(pageMd.controls, {
                    controlId: pageMd.rootControlId
                }),
                rootGridControl = createGridElement(rootControl);
            addChildInformation(rootGridControl);
            _rootElement = rootGridControl;
            _.setArrayValues(_elements, [rootGridControl]);
            updateElementMap(_elementsMap, _elements);
            $rootScope.$broadcast('gridRefreshed');
            //setSelectedElements([rootGridControl]);
            $timeout(function () {
                setSelectedElements([rootGridControl]);
            }, 500);

        };

        var addChildInformation = function (gridElement) {
            _.forEach(npPageMetadataHelper.getDisplayableGroups(gridElement.controlMd), function (group) {
                var groupChildren = gridElement.controlMd.getChildrenMd(group.groupId);
                _.forEach(groupChildren, function (childMd) {
                    var childElement = createGridElement(childMd, gridElement);
                    addChildInformation(childElement);
                });
            });
        };

        /**
         * @description Factory function that creates new grid elements with some defaults set
         * @private
         */
        var createGridElement = (function () {
            var count = 0,
                gridElementProto = {
                    elementId: -1,
                    parentId: -1,
                    controlMd: null,
                    style: null,
                    resizableWidth: false,
                    resizableHeight: false,
                    children: null,
                    domRef: function () { // TODO remove, replace with clientboundingrect
                        if (this.controlMd && npUiCanvasAPI.isReady()) {
                            return angular.element(npUiCanvasAPI.getControlDomRefByMd(this.controlMd));
                        }
                        return angular.element();
                    },
                    displayName: null,
                    setSelected: function (selected) {
                        this._selected = selected;
                        if (angular.isDefined(this.style.visibility)) {
                            this.style.visibility = (selected || this.isRootChild()) ? 'visible' : 'hidden';
                        }
                    },
                    isSelected: function () {
                        return this._selected;
                    },
                    startDrag: function () {
                        this._dragged = true;
                    },
                    stopDrag: function () {
                        this._dragged = false;
                    },
                    isDragged: function () {
                        return this._dragged;
                    },
                    isPageElement: function () {
                        return this === _rootElement;
                    },
                    isRootChild: function () {
                        return this.parentId === _rootElement.elementId;
                    },
                    canDeleteElement: function () {
                        return !this.isPageElement() && !npPageMetadataHelper.isTemplate(this.controlMd);
                    },
                    _selected: false,
                    _dragged: false
                };

            return function (controlMd, parent) {
                var gridElement = Object.create(gridElementProto);
                gridElement.elementId = count++;
                gridElement.controlMd = controlMd;
                var properties = npPageMetadataHelper.getDisplayableProperties(controlMd);
                gridElement.resizableWidth = _.some(properties, {
                    name: npConstants.sizeProperties.WIDTH
                });
                gridElement.resizableHeight = _.some(properties, {
                    name: npConstants.sizeProperties.HEIGHT
                });
                gridElement.displayName = npUiCatalog.getControlDisplayName(controlMd.catalogControlName, controlMd.catalogId);
                gridElement.style = {};
                gridElement.children = [];
                if (parent) {
                    gridElement.parentId = parent.elementId;
                    // FIXME if parent has multiple groups this does not insert at correct position
                    parent.children.splice(gridElement.controlMd.parentGroupIndex, 0, gridElement);
                }
                return gridElement;
            };
        })();

        var updateLayout = function (gridElements) {
            gridElements = gridElements || _elementsMap;
            _.forEach(gridElements, function (gridElement) {
                gridElement.style = {};

                var wrappedDomRef = jQuery(gridElement.domRef());
                if (wrappedDomRef.length) {
                    var allDesignProperties = npConstants.designProperties;
                    var outerHeight = wrappedDomRef.outerHeight(true),
                        outerWidth = wrappedDomRef.outerWidth(true),
                        height = wrappedDomRef.outerHeight(),
                        width = wrappedDomRef.outerWidth(),
                        top = wrappedDomRef.offset().top - ((outerHeight - height) / 2),
                        left = wrappedDomRef.offset().left - ((outerWidth - width) / 2);

                    gridElement.style.width = outerWidth + 'px';
                    gridElement.style.height = outerHeight + 'px';
                    gridElement.style.top = top + 'px';
                    gridElement.style.left = left + 'px';
                    var propertyMd = npPageMetadataHelper.getControlDesignProperty(allDesignProperties.BGCOLOR, gridElement.controlMd) || {};
                    gridElement.style.backgroundColor = propertyMd.value;
                    gridElement.style.visibility = gridElement.isRootChild() || gridElement.isSelected() ? 'visible' : 'hidden';
                }
            });
            var updatedElements = _.isObject(gridElements) ? _.values(gridElements) : gridElements;
            $rootScope.$broadcast('npGrid/layoutUpdated', updatedElements);
        };

        $rootScope.$on('uiComposer/exitInteractiveMode', updateLayout.bind(this, _elementsMap));

        $rootScope.$watch(function () {
            return npFormFactor.getCurrentFormFactor();
        }, function () {
            $timeout(function () {
                updateLayout(_elementsMap);
            });
        });

        var startListeningForMetadataChanges = function () {
            var listeners = [];
            listeners.push(pageMdEvents.listen(pageMdEvents.events.controlsAdded, function (event, pageMd, addedControls, options) {
                options = options || {};
                var addedElements = addGridElementsByMd(addedControls);
                if (options.selectNewElements !== false) {
                    setSelectedElements(addedElements);
                }
            }));
            listeners.push(pageMdEvents.listen(pageMdEvents.events.controlsRemoved, function (event, pageMd, removedControls) {
                removeGridElementsByMd(removedControls);
            }));
            listeners.push(pageMdEvents.listen(pageMdEvents.events.controlsMoved, function (event, pageMd, movedControls, options) {
                options = options || {};
                var movedElements = moveGridElements(movedControls);
                if (options.selectMovedElements !== false) {
                    setSelectedElements(movedElements);
                }
            }));
            listeners.push(pageMdEvents.listen(pageMdEvents.events.controlPropertiesChanged, function (event, pageMd, propertyChanges, options) {
                options = options || {};
                if (options.selectChangedElements !== false) {
                    var changedElements = _.chain(propertyChanges).pluck('controlMd').pluck('controlId').map(getElementForControlId).value();
                    setSelectedElements(changedElements);
                }
            }));
            listeners.push(pageMdEvents.listen(pageMdEvents.events.controlEventsChanged, function (event, changedControls, options) {
                options = options || {};
                if (options.selectChangedElements !== false) {
                    var changedElements = _.chain(changedControls).pluck('controlId').map(getElementForControlId).value();
                    setSelectedElements(changedElements);
                }
            }));
            listeners.push(pageMdEvents.listen(pageMdEvents.events.controlsBindingChanged, function (event, pageMd, bindingChanges, options) {
                bindingChanged(bindingChanges);
                options = options || {};
                if (options.selectChangedElements !== false) {
                    var changedElements = _.chain(bindingChanges).pluck('controlId').map(getElementForControlId).value();
                    setSelectedElements(changedElements);
                }
            }));
            listeners.push(npCanvasEvents.listen(npCanvasEvents.events.controlsRendered, function () {
                updateLayout(_elementsMap);
                // FIXME: first one not working correctly in all cases (e.g. move list item out of list)
                $timeout(function () {
                    updateLayout(_elementsMap);
                });
            }));
            startListeningForMetadataChanges._listeners = listeners;
        };

        var stopListeningForMetadataChanges = function () {
            var listeners = startListeningForMetadataChanges._listeners;
            _.forEach(listeners, function (listener) {
                if (_.isFunction(listener)) {
                    listener();
                }
            });
        };

        var addGridElementsByMd = function (controlMdObjs) {
            var createdGridElements = [];

            _.forEach(controlMdObjs, function (controlMd) {
                var parent = _.find(_elementsMap, function (gridElement) {
                    return gridElement.controlMd.controlId === controlMd.parentControlId;
                });
                if (parent) {
                    var newElem = createGridElement(controlMd, parent);
                    addChildInformation(newElem);
                    createdGridElements.push(newElem);
                }
                else {
                    $log.error('npGrid: unable to insert grid element since parent does not exist.');
                }
            });
            updateElementMap(_elementsMap, _elements);
            $rootScope.$broadcast('npGrid/elementsAdded', createdGridElements);
            return createdGridElements;
        };

        var removeGridElementsByMd = function (controlsDeleted) {
            var gridElementIds = _.chain(_elementsMap)
                .filter(function (gridElement) {
                    return _.contains(controlsDeleted, gridElement.controlMd);
                })
                .pluck('elementId')
                .value();
            return removeGridElementsById(gridElementIds);
        };

        var removeGridElementsById = function (gridElementIds) {
            var selectedElements = [];
            var removedElements = _.map(gridElementIds, function (elementId) {
                var elemToRemove = getElement(elementId),
                    parent = getElement(elemToRemove.parentId);
                if (parent) {
                    var iElem = _.findIndex(parent.children, elemToRemove);
                    parent.children.splice(iElem, 1);
                    if (elemToRemove.isSelected()) {
                        selectedElements.push(parent);
                    }
                }
                return elemToRemove;
            });
            updateElementMap(_elementsMap, _elements);
            $rootScope.$broadcast('npGrid/elementsRemoved', removedElements);
            if (_.size(selectedElements)) {
                setSelectedElements(_.uniq(selectedElements));
            }
            return removedElements;
        };

        var moveGridElements = function (movedControls) {
            var movedElements = _.map(movedControls, function (movedControl) {
                var gridElement = getElementForControlId(movedControl.controlId),
                    parentGridElement = _elementsMap[gridElement.parentId],
                    iGridElem = _.findIndex(parentGridElement.children, gridElement),
                    newParentGridElement = getElementForControlId(movedControl.parentControlId);
                parentGridElement.children.splice(iGridElem, 1);
                var newIndex = (_.findIndex(newParentGridElement.children, function (child) {
                        return child.controlMd.parentGroupId === movedControl.parentGroupId;
                    }) || 0) + movedControl.parentGroupIndex;
                newParentGridElement.children.splice(newIndex, 0, gridElement);
                gridElement.parentId = newParentGridElement.elementId;
                return gridElement;
            });
            $rootScope.$broadcast('npGrid/elementsMoved', movedElements);
            return movedElements;
        };

        /**
         * @private
         * @description searches for the group children that need to be updated, removing the obsolete ones and adding the new ones.
         * @param {Object[]} bindingChanges - { controlId:'', groupId:''}
         */
        var bindingChanged = function (bindingChanges) {
            var controlsMdToRemove = [],
                controlsMdToAdd = [];
            _.forEach(bindingChanges, function (bindingChange) {
                var controlId = bindingChange.controlId,
                    groupId = bindingChange.groupId;
                var gridElement = _.find(_elementsMap, function (elem) {
                        return elem.controlMd.controlId === controlId;
                    }),
                    oldChildrenElements = getChildrenElementsOfGroup(gridElement, groupId),
                    oldChildrenMd = _.pluck(oldChildrenElements, 'controlMd'),
                    newChildrenMd = gridElement.controlMd.getChildrenMd(groupId),
                    childrenMdToKeep = _.intersection(newChildrenMd, oldChildrenMd);

                var childrenMdToRemove = _.difference(oldChildrenMd, childrenMdToKeep),
                    childrenMdToAdd = _.difference(newChildrenMd, childrenMdToKeep);
                controlsMdToRemove = controlsMdToRemove.concat(childrenMdToRemove);
                controlsMdToAdd = controlsMdToAdd.concat(childrenMdToAdd);
            });
            if (_.size(controlsMdToAdd)) {
                addGridElementsByMd(controlsMdToAdd);
            }
            if (_.size(controlsMdToRemove)) {
                removeGridElementsByMd(controlsMdToRemove);
            }
        };

        /**
         * @private
         * @description returns the child elements that belong to a group.
         * @param {GridElement} element
         * @param {string} groupId
         * @returns {GridElement[]}
         */
        var getChildrenElementsOfGroup = function (element, groupId) {
            return _.filter(element.children, function (child) {
                return child.controlMd.parentGroupId === groupId;
            });
        };

        /**
         * @private
         * @description Traverse through list of elements and recursively flatten child arrays into lookup object.
         */
        var flattenElements = function (elements) {
            var lookup = {},
                traverseDeep = function (elems) {
                    _.forEach(elems, function (elem) {
                        lookup[elem.elementId] = elem;
                        traverseDeep(elem.children);
                    });
                };
            traverseDeep(elements);
            return lookup;
        };

        /**
         * @private
         * @description Update the lookup object with new elements
         */
        var updateElementMap = function (lookup, newElements) {
            _.forEach(_elementsMap, function (element) {
                lookup[element.elementId] = undefined;
                delete lookup[element.elementId];
            });
            _.forEach(flattenElements(newElements), function (element) {
                lookup[element.elementId] = element;
            });
        };

        /**
         * @name getRootElement
         * @memberof npGrid
         * @description Retrieve the root grid element.
         * @returns {GridElement}
         */
        var getRootElement = function () {
            return _rootElement;
        };

        /**
         * @name getElements
         * @memberof npGrid
         * @description Retrieve all grid elements.
         * @returns {GridElement[]} Array of grid elements.
         */
        var getElements = function () {
            return _elements;
        };

        /**
         * @name getElements
         * @memberof npGrid
         * @description Retrieve all grid elements as a flat list.
         * @returns {GridElement{}} Object of grid elements with an elementId - gridElement mapping.
         */
        var getElementsFlattened = function () {
            return _elementsMap;
        };

        /**
         * @name getElement
         * @memberof npGrid
         * @description Get a specific grid element.
         * @param {string|number} elementId ID of element that should be retrieved.
         * @returns {GridElement} grid element with given ID. Undefined if no element matched ID.
         */
        var getElement = function (elementId) {
            if (typeof elementId === 'string') {
                elementId = _.parseInt(elementId);
            }
            return _elementsMap[elementId];
        };

        /**
         * @name getElementForControlId
         * @memberof npGrid
         * @description Get a specific grid element.
         * @param {controlId} control id of control for which grid element is needed.
         * @returns {GridElement} grid element that represents given control. Undefined if no element matched control.
         */
        var getElementForControlId = function (controlId) {
            // TODO: find a way to get the control id (need to call np-ui-canvas-api?)
            return _.find(_elementsMap, function (element) {
                return controlId === element.controlMd.controlId;
            });
        };

        /**
         * @name setSelectedElements
         * @memberof npGrid
         * @description Set a number of grid elements as selected. Everything else will be unselected.
         * @param {GridElement[]} elements Grid elements that should be selected
         * @param {boolean} [skipNotify=false] if notification should be emitted
         */
        var setSelectedElements = function (elements, skipNotify) {
            if (_.isEmpty(elements)) {
                elements = [_rootElement];
            }
            var currentSelection = getSelectedElements(),
                elementsToUnselect = _.difference(currentSelection, elements),
                elementsToSelect = _.difference(elements, currentSelection),
                selectionChanged = false;

            _.forEach(elementsToUnselect, function (elem) {
                elem.setSelected(false);
                selectionChanged = true;
            });

            _.forEach(elementsToSelect, function (elem) {
                elem.setSelected(true);
                selectionChanged = true;
            });

            if (skipNotify !== true && selectionChanged) {
                $rootScope.$broadcast('selectionChanged');
            }
            return selectionChanged;
        };

        /**
         * @name getSelectedElements
         * @memberof npGrid
         * @description Retrieve all grid elements that are currently selected.
         * @returns {GridElement[]} Array of grid elements that are currently selected.
         */
        var getSelectedElements = function () {
            // TODO check if _.values works fine here, should probably be _.valuesIn
            return _.values(_.filter(_elementsMap, function (element) {
                return element.isSelected();
            }));
        };

        /**
         * @name getTopElement
         * @memberof npGrid
         * @description Gets the element on top of the others. element should be included in elements.
         * @param {GridElement[]} elements
         * @param {int} [startIndex]
         * @returns {GridElement} topElement
         */
        var getTopElement = function (elements, startIndex) {
            var topMostRootChild = _.findLast(elements, function (elem) {
                return elem.isRootChild();
            });
            if (typeof startIndex !== 'number' || !elements[startIndex]) {
                return topMostRootChild;
            }
            var element = elements[startIndex],
                rootChildElement = element;
            while (rootChildElement && !rootChildElement.isRootChild()) {
                rootChildElement = getElement(rootChildElement.parentId);
            }
            if (topMostRootChild && topMostRootChild !== rootChildElement) {
                element = topMostRootChild;
            }
            return element;
        };

        return {
            init: init,
            getRootElement: getRootElement,
            getElements: getElements,
            getElementsFlattened: getElementsFlattened,
            getElement: getElement,
            getElementForControlId: getElementForControlId,
            setSelectedElements: setSelectedElements,
            getSelectedElements: getSelectedElements,
            getTopElement: getTopElement
        };
    }
];

module.exports = npGrid;

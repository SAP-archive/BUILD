'use strict';

var _ = require('norman-client-tp').lodash;

var npCanDropBinding = ['$rootScope', 'npGrid', 'npDragHelper', 'npBindingHelper', 'npPageMetadata', 'npUiCatalog',
    function ($rootScope, npGrid, npDragHelper, npBindingHelper, npPageMetadata, npUiCatalog) {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                var controlPropertyName = attr.npCanDropBindingPropertyName;
                var isSmartApp = (attr.npCanDropBindingSmartApp === 'true');
                var allEntities = npBindingHelper.getEntitiesAndProperties();
                var mainEntity = _.find(allEntities, function (entity) {
                    return entity._id === attr.npCanDropBindingMainEntity;
                });
                var selectedElements = npGrid.getSelectedElements();
                var selectedElement = selectedElements[0];
                var _dragEnterCount = 0;
                var _dragData;
                if (!_.isEmpty(selectedElement)) {
                    var controlMd = selectedElement.controlMd;
                }

                var onOver = function (evt) {
                    if (controlMd && _dragData && _dragData.propertyId) {
                        var propType = npUiCatalog.getPropertyType(controlPropertyName, controlMd.catalogControlName, controlMd.catalogId);
                        if (npBindingHelper.isTypeCompatibleWithProperty(_dragData.entityId, _dragData.propertyId, propType)) {
                            var entity = npBindingHelper.getContextEntity(controlMd, mainEntity ? mainEntity._id : undefined);
                            if (!entity || npBindingHelper.getPathsCompatibleWithProperty(entity._id, _dragData.entityId, _dragData.propertyId, isSmartApp).length > 0) {
                                evt.dataTransfer.dropEffect = 'copy';
                                // Highlight?
                            }
                        }
                    }
                };

                var onEnter = function (evt) {
                    _dragEnterCount++;
                    evt.dataTransfer.dropEffect = 'copy';
                    _dragData = npDragHelper.getDragData();
                };

                var onLeave = function () {
                    _dragEnterCount--;
                    if (_dragEnterCount <= 0) {
                        _dragData = undefined;
                    }
                };

                var onDrop = function () {
                    _dragData = npDragHelper.getDragData();
                    if (controlMd && _dragData && _dragData.propertyId) {
                        var propType = npUiCatalog.getPropertyType(controlPropertyName, controlMd.catalogControlName, controlMd.catalogId);
                        if (npBindingHelper.isTypeCompatibleWithProperty(_dragData.entityId, _dragData.propertyId, propType)) {
                            var entity = npBindingHelper.getContextEntity(controlMd, mainEntity ? mainEntity._id : undefined);
                            var bindingProp = npBindingHelper.getPathsCompatibleWithProperty(entity._id, _dragData.entityId, _dragData.propertyId, isSmartApp);
                            if (bindingProp.length > 0) {
                                if (bindingProp && bindingProp[0]) {
                                    var bindingPath = bindingProp[0];
                                    var propertyDef = {
                                        name: controlPropertyName,
                                        value: bindingPath.path,
                                        binding: bindingPath.binding
                                    };

                                    return npPageMetadata.changeProperty({
                                        controlId: controlMd.controlId,
                                        properties: [propertyDef]
                                    });
                                }
                            }
                        }
                        _dragData = undefined;
                    }
                };

                element.on('dragover', onOver);
                element.on('dragenter', onEnter);
                element.on('dragleave', onLeave);
                element.on('drop', onDrop);
            }
        };
    }
];

module.exports = npCanDropBinding;

'use strict';
var _ = require('norman-client-tp').lodash;

(function () {
    angular.module('model')
        .filter('shortList', [function () {
            return function (types, shortListActived) {
                if (!shortListActived) {
                    return types;
                }
                else {
                    var shortListTypes = [];
                    angular.forEach(types, function (type) {
                        if (type.isShortList) {
                            shortListTypes.push(type);
                        }
                    });
                    return shortListTypes;
                }
            };
        }])
        .controller('PropertiesController', ['$state', '$window', '$rootScope', '$scope', '$timeout', 'dm.ModelEditorService']);

    function PropertiesController($state, $window, $rootScope, $scope, $timeout, ModelEditorService) {
        var vm = this;

        vm.editingFormula = false;

        vm.dataTypes = [
            {code: 'String', label: 'String', isShortList: true},
            {code: 'Decimal', label: 'Numeric', isShortList: true},
            {code: 'DateTime', label: 'Date', isShortList: true},
            {code: 'Boolean', label: 'Boolean', isShortList: false},
            {code: 'Binary', label: 'Binary', isShortList: false},
            {code: 'Byte', label: 'Byte', isShortList: false},
            {code: 'Double', label: 'Double', isShortList: false},
            {code: 'Single', label: 'Single', isShortList: false},
            {code: 'Guid', label: 'Guid', isShortList: false},
            {code: 'Int16', label: 'Int16', isShortList: false},
            {code: 'Int32', label: 'Int32', isShortList: false},
            {code: 'Int64', label: 'Int64', isShortList: false},
            {code: 'SByte', label: 'SByte', isShortList: false},
            {code: 'Time', label: 'Time', isShortList: false},
            {code: 'DateTimeOffset', label: 'DateTimeOffset', isShortList: false}
        ];

        vm.isShort = true;
        vm.moreLabel = 'Show more...';

        vm.onTypeChange = function (type) {
            if (type === vm.moreLabel) {
                vm.isShort = false;
                vm.newProperty.propertyType = vm.dataTypes[0].code;

                setTimeout(function () {
                    var element = document.getElementById('dataTypeSelect');
                    if (element) {
                        var event = document.createEvent('MouseEvents');
                        event.initMouseEvent('mousedown', true, true, window);
                        element.dispatchEvent(event);
                    }
                }, 100);
            }
        };

        $scope.tab = {
            active: ''
        };

        $scope.$watch('tab.active', function () {
            if ($scope.tab.active === '') {
                $scope.tab.active = 'informations';
            }
            else if ($scope.tab.active === 'formula') {
                vm.validFormula = vm.editedProperty.calculated.calculation.length === 0 || vm.formulaIsValid(vm.editedProperty.calculated.calculation);
            }
        });

        $rootScope.$on('ModelEditorService.editedPropertyChanged', function () {
            vm.editedProperty = ModelEditorService.model.editedProperty; // Keep property updated on both sidePandelEditor.controller and formulaEditor.controller

            vm.editedProperty.isMandatory = !vm.editedProperty.isNullable;

            // TODO Find if this can be done without JSON.parse
            if (typeof vm.editedProperty.calculated.calculation === 'string') {
                vm.editedProperty.calculated.calculation = JSON.parse(vm.editedProperty.calculated.calculation);
            }
            else {
                vm.editedProperty.calculated.calculation = vm.editedProperty.calculated.calculation || [];
            }

            if (vm.renameProperties) {
                vm.renameProperties(vm.editedProperty.calculated.calculation);
            }
        });

        vm.editFormula = function () {
            vm.editingFormula = true;
            vm.oldCalculation = angular.copy(vm.editedProperty.calculated.calculation);
            $rootScope.$broadcast('ModelEditorService.editedPropertyChanged');
        };

        vm.cancelFormula = function () {
            vm.editingFormula = false;
            vm.editedProperty.calculated.calculation = angular.copy(vm.oldCalculation);
        };

        vm.saveFormula = function () {
            vm.editingFormula = false;
            vm.needToUpdateProperty = true;
            vm.validFormula = vm.editedProperty.calculated.calculation.length === 0 || vm.formulaIsValid(vm.editedProperty.calculated.calculation);
            if (vm.editedProperty.calculated && vm.editedProperty.calculated.calculation.length) {
                vm.editedProperty.isReadOnly = true;
            }
        };

        vm.startPropertyCreation = function () {
            if (!vm.propertyInCreation) {
                vm.newProperty = {name: 'DefaultName', propertyType: vm.dataTypes[0].code};
                vm.propertyInCreation = true;
                $rootScope.$broadcast('ModelEditorService.modelChangeStart');
                vm.newPropertyNameInput = document.getElementById('newPropertyNameInput');
                $timeout(function () {
                    if (vm.newPropertyNameInput) {
                        vm.newPropertyNameInput.focus();
                        vm.newPropertyNameInput.select();
                    }
                    angular.element($window).bind('click', onClickOutsidePropertyCreation);
                }, 100);
            }
        };

        vm.getDataTypeLabel = function (code) {
            var dataType = _.find(vm.dataTypes, {code: code});
            return dataType.label;
        };

        vm.addProperty = function () {
            vm.isShort = true;
            ModelEditorService.addProperty(vm.newProperty);
        };

        vm.removeProperty = function (property) {
            // timeout to make sure if we are editing this property delete request comes after the update (popup on close method)
            $timeout(function () {
                ModelEditorService.removeProperty(property);
            }, 50);
        };

        vm.openPropertyEditorModal = function (property, event) {
            // timeout to make sure that the onclose method of the popup is never close after the open
            $timeout(function () {
                if (!property.isKey) {
                    $scope.tab.active = 'informations';
                    vm.needToUpdateProperty = false;
                    vm.selectedProperty = property.name;
                    if (property) {
                        ModelEditorService.setEditedProperty(angular.copy(property));
                    }
                    else {
                        ModelEditorService.setEditedProperty({
                            name: '',
                            creatable: true,
                            updatable: true,
                            isNullable: false,
                            calculated: {
                                calculation: [],
                                inputProperties: []
                            }
                        });
                    }
                    $rootScope.$broadcast('popup-open', {
                        id: 'propertyEditorModal',
                        elem: [event.srcElement.parentElement]
                    });

                }
            }, 50);
        };

        vm.getTemplate = function (type) {
            return type + '_viewer.html';
        };

        vm.nOperators = [
            {
                name: 'sum',
                label: 'SUM'
            },
            {
                name: 'mean',
                label: 'MEAN'
            },
            {
                name: 'count',
                label: 'COUNT'
            }
        ];

        vm.editFormulaLabel = function () {
            var sResult;
            if (vm.editedProperty && vm.editedProperty.calculated.calculation.length) {
                sResult = 'Edit';
            }
            else {
                sResult = 'Create';
            }
            return sResult;
        };

        vm.getOpLabel = function (name) {
            var label = '';
            for (var i = 0; i < vm.nOperators.length; i++) {
                if (vm.nOperators[i].name === name) {
                    label = vm.nOperators[i].label;
                }
            }
            return label;
        };

        vm.propertyExists = function (inputProp) {
            var result = false;
            ModelEditorService.model.entities.forEach(function (ent) {
                ent.properties.forEach(function (prop) {
                    if (prop._id === inputProp.propertyId) {
                        result = true;
                    }
                });
            });
            return result;
        };

        vm.saveProperty = function () {
            // TODO Find if this can be done without JSON.stringify
            var result = false;
            // manage read-only and mandatory property
            vm.editedProperty.isNullable = !vm.editedProperty.isMandatory;
            var property = angular.copy(vm.editedProperty);
            if (!property.calculated.calculation || property.calculated.calculation.length === 0) {
                property.calculated.calculation = null;
            }
            else {
                property.calculated.calculation = JSON.stringify(property.calculated.calculation);
                property.isReadOnly = true;
            }

            if (vm.editedProperty._id && vm.propertyIsValid(vm.editedProperty)) {
                ModelEditorService.updateProperty(property);
                result = true;
            }
            else if (vm.propertyIsValid(vm.editedProperty)) {
                ModelEditorService.addProperty(property);
                result = true;
            }
            vm.editedProperty = null;
            return result;
        };

        vm.propertyIsValid = function (property) {
            var propertyIsValid = false;
            if (property.name && (!property.calculated.calculation || property.calculated.calculation.length === 0)) {
                propertyIsValid = true;
            }
            else if (property.name) {
                propertyIsValid = vm.formulaIsValid(property.calculated.calculation);
            }
            return propertyIsValid;
        };

        vm.formulaIsValid = function (inputArray) {
            var result = true;
            if (inputArray.length !== 1) {
                result = false;
            }
            else {
                for (var property in inputArray[0]) {
                    if (Array.isArray(inputArray[0][property])) {
                        result = vm.formulaIsValid(inputArray[0][property]);
                        if (!result) {
                            break;
                        }
                    }
                }
                if (result) {
                    for (var i = 0; i < ModelEditorService.model.editedProperty.calculated.inputProperties.length; i++) {
                        result = vm.propertyExists(ModelEditorService.model.editedProperty.calculated.inputProperties[i]);
                        if (!result) {
                            break;
                        }
                    }
                }
            }
            return result;
        };

        vm.removeFormula = function () {
            vm.editedProperty.calculated.calculation = [];
            vm.editedProperty.calculated.inputProperties = [];
        };

        vm.renameProperties = function (inputArray) {
            inputArray.forEach(function (element) {
                if (element.type && element.type === 'property') {
                    if (!element.navPropId || element.navPropId === '') {
                        element.entityId = ModelEditorService.selectedEntity._id;
                        element.entityName = ModelEditorService.selectedEntity.name;
                        ModelEditorService.selectedEntity.properties.forEach(function (prop) {
                            if (prop._id === element.propertyId) {
                                element.propertyName = prop.name;
                            }
                        });
                    }
                    else {
                        ModelEditorService.selectedEntity.navigationProperties.forEach(function (navProp) {
                            if (navProp._id === element.navPropId) {
                                element.navPropName = navProp.name;
                                ModelEditorService.model.entities.forEach(function (ent) {
                                    if (ent._id === navProp.toEntityId) {
                                        element.entityId = ent._id;
                                        element.entityName = ent.name;
                                        ent.properties.forEach(function (prop) {
                                            if (prop._id === element.propertyId) {
                                                element.propertyName = prop.name;
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
                else {
                    for (var part in element) {
                        if (Array.isArray(element[part])) {
                            vm.renameProperties(element[part]);
                        }
                    }
                }
            });
        };

        var onClickOutsidePropertyCreation = function (event) {
            if (event.toElement.classList.length < 2 || event.toElement.classList[1] !== 'ui-select' && event.toElement.classList[1] !== 'ui-input') {
                vm.savePropertyCreation();
            }
        };

        vm.savePropertyCreation = function () {
            vm.addProperty();
            angular.element($window).unbind('click', onClickOutsidePropertyCreation);
            vm.propertyInCreation = false;
        };

        vm.onClose = function () {
            if (vm.needToUpdateProperty) {
                vm.saveProperty();
                vm.needToUpdateProperty = false;
            }

            vm.selectedProperty = null;

        };


    }

    module.exports = ['$state', '$window', '$rootScope', '$scope', '$timeout', 'dm.ModelEditorService', PropertiesController];
})();

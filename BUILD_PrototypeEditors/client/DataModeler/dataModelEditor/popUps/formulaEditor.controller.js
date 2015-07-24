'use strict';

(function () {
    angular.module('model')
        .controller('FormulaEditorController', ['$scope', '$rootScope', '$timeout', 'dm.ModelEditorService', FormulaEditorController])
        .directive('ngDraggable', [function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    scope.defineDrag(scope, element, attrs);
                }
            };
        }])
        .directive('ngDroppable', [function () {

            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    scope.defineDrop(scope, element, attrs);
                }
            };
        }]);


    function FormulaEditorController($scope, $rootScope, $timeout, ModelEditorService) {

        var vm = this;
        $scope.$on('ModelEditorService.editedPropertyChanged', function () {
            vm.editedProperty = ModelEditorService.model.editedProperty;
            if (vm.editedProperty) {
                vm.editedProperty.calculated = vm.editedProperty.calculated || {};
                vm.entities = vm.getEntities();
                // TODO Find if this can be done without JSON.parse
                if (typeof vm.editedProperty.calculated.calculation === 'string') {
                    vm.editedProperty.calculated.calculation = JSON.parse(vm.editedProperty.calculated.calculation) || [];
                }
                else {
                    vm.editedProperty.calculated.calculation = vm.editedProperty.calculated.calculation || [];
                }
                vm.formula = ModelEditorService.model.editedProperty.calculated.calculation;
            }
        });

        // ----------  Calculated Properties ----------

        vm.dropElement = false;
        vm.endDrag = true;
        vm.calculatedPropertyFormula = '';
        var FormulaElement = function () {
            var oResult;

            if (arguments[0] === 'condition') {
                oResult = {
                    label: 'IF',
                    name: 'if',
                    type: 'condition',
                    condition: [],
                    then: [],
                    else: []
                };
            }
            else if (arguments[0] === 'operator') {
                if (arguments[1] === 'plus') {
                    oResult = {
                        label: '+',
                        name: 'plus',
                        type: 'operator',
                        left: [],
                        right: []
                    };
                }
                else if (arguments[1] === 'minus') {
                    oResult = {
                        label: '-',
                        name: 'minus',
                        type: 'operator',
                        left: [],
                        right: []
                    };
                }
                else if (arguments[1] === 'times') {
                    oResult = {
                        label: '*',
                        name: 'times',
                        type: 'operator',
                        left: [],
                        right: []
                    };
                }
                else if (arguments[1] === 'divide') {
                    oResult = {
                        label: '/',
                        name: 'divide',
                        type: 'operator',
                        left: [],
                        right: []
                    };
                }
                else if (arguments[1] === 'ltoe') {
                    oResult = {
                        label: '<=',
                        name: 'ltoe',
                        type: 'operator',
                        left: [],
                        right: []
                    };
                }
                else if (arguments[1] === 'lt') {
                    oResult = {
                        label: '<',
                        name: 'lt',
                        type: 'operator',
                        left: [],
                        right: []
                    };
                }
                else if (arguments[1] === 'gtoe') {
                    oResult = {
                        label: '>=',
                        name: 'gtoe',
                        type: 'operator',
                        left: [],
                        right: []
                    };
                }
                else if (arguments[1] === 'gt') {
                    oResult = {
                        label: '>',
                        name: 'gt',
                        type: 'operator',
                        left: [],
                        right: []
                    };
                }
                else if (arguments[1] === 'and') {
                    oResult = {
                        label: 'AND',
                        name: 'and',
                        type: 'operator',
                        left: [],
                        right: []
                    };
                }
                else if (arguments[1] === 'or') {
                    oResult = {
                        label: 'OR',
                        name: 'or',
                        type: 'operator',
                        left: [],
                        right: []
                    };
                }
                else if (arguments[1] === 'equals') {
                    oResult = {
                        label: '=',
                        name: 'equals',
                        type: 'operator',
                        left: [],
                        right: []
                    };
                }
                else if (arguments[1] === 'different') {
                    oResult = {
                        id: null,
                        label: '!=',
                        name: 'different',
                        type: 'operator',
                        left: [],
                        right: []
                    };
                }
                else if (arguments[1] === 'isNull') {
                    oResult = {
                        id: null,
                        label: 'IS NULL',
                        name: 'isNull',
                        type: 'operator',
                        right: []
                    };
                }
                else {
                    oResult = new FormulaElement('operator', 'plus');
                }
            }
            else if (arguments[0] === 'property') {
                if (vm.getProperties(ModelEditorService.selectedEntity._id).length) {
                    var properties = vm.getProperties(ModelEditorService.selectedEntity._id);
                    oResult = {
                        label: 'PROPERTY',
                        name: 'property',
                        entityName: angular.copy(ModelEditorService.selectedEntity.name),
                        entityId: angular.copy(ModelEditorService.selectedEntity._id),
                        navPropName: angular.copy(ModelEditorService.selectedEntity.name),
                        navPropId: '',
                        navPropMultiplicity: null,
                        navPropOp: null,
                        propertyName: angular.copy(properties[0].name),
                        propertyId: angular.copy(properties[0]._id),
                        type: 'property'
                    };
                }
                else {
                    oResult = {
                        label: 'PROPERTY',
                        name: 'property',
                        entityName: angular.copy(ModelEditorService.selectedEntity.name),
                        entityId: angular.copy(ModelEditorService.selectedEntity._id),
                        navPropName: '',
                        navPropId: '',
                        navPropMultiplicity: null,
                        navPropOp: null,
                        propertyName: '',
                        propertyId: '',
                        type: 'property'
                    };
                }
            }
            else if (arguments[0] === 'value') {
                oResult = {
                    label: 'VALUE',
                    name: 'value',
                    type: 'value',
                    value: null
                };
            }

            return oResult;
        };

        vm.nOperators = [
            {
                name: 'sum',
                label: 'SUM',
                dataTypes: ['number']
            },
            {
                name: 'mean',
                label: 'MEAN',
                dataTypes: ['number']
            },
            {
                name: 'count',
                label: 'COUNT',
                dataTypes: ['number', 'string']
            }
        ];

        vm.operators = ['plus', 'minus', 'times', 'divide', 'ltoe', 'lt', 'gtoe', 'gt', 'equals', 'different', 'and', 'or', 'isNull'];
        for (var i = 0; i < vm.operators.length; i++) {
            vm.operators[i] = new FormulaElement('operator', vm.operators[i]);
        }

        vm.setOperator = function (id) {
            var newData = new FormulaElement('operator', vm.getElement(id, ModelEditorService.model.editedProperty.calculated.calculation).name);
            var element = vm.getElement(id, ModelEditorService.model.editedProperty.calculated.calculation);
            element.label = newData.label;
            if (!newData.hasOwnProperty('left') && element.hasOwnProperty('left')) {
                if (!element.right.length && element.left.length) {
                    element.right = element.left;
                }
                delete element.left;
            }
            else if (!element.hasOwnProperty('left') && newData.hasOwnProperty('left')) {
                element.left = [];
            }
        };

        vm.setProperty = function (id) {
            var element = vm.getElement(id, ModelEditorService.model.editedProperty.calculated.calculation);
            var propMet = false;
            var setEntity = false;
            var entityId;
            if (element.navPropId === '' || element.navPropId === null) {
                entityId = ModelEditorService.selectedEntity._id;
                element.navPropName = '';
                element.navPropId = '';
                element.navPropMultiplicity = null;
                element.navPropOp = null;
            }
            else {
                ModelEditorService.selectedEntity.navigationProperties.forEach(function (navProp) {
                    if (navProp._id === element.navPropId) {
                        element.navPropName = navProp.name;
                        entityId = navProp.toEntityId;
                        element.navPropMultiplicity = navProp.multiplicity;
                        element.navPropOp = element.navPropOp || 'sum';
                    }
                });
            }
            ModelEditorService.model.entities.forEach(function (ent) {
                if (ent._id === entityId) {
                    setEntity = ent;
                    element.entityId = ent._id;
                    element.entityName = ent.name;
                    ent.properties.forEach(function (prop) {
                        if (prop._id === element.propertyId) {
                            propMet = true;
                            element.propertyName = prop.name;
                        }
                    });
                }
            });
            if (!propMet && setEntity) {
                if (vm.getProperties(setEntity._id).length) {
                    var properties = vm.getProperties(setEntity._id);
                    element.propertyName = properties[0].name;
                    element.propertyId = properties[0]._id;
                }
                else {
                    element.propertyName = '';
                    element.propertyId = '';
                }
            }
            ModelEditorService.model.editedProperty.calculated.inputProperties = [];
            vm.generateIds(ModelEditorService.model.editedProperty.calculated.calculation, 0);
        };

        vm.inArray = function (value, array) {
            var result = false;
            for (var k = 0; k < array.length; k++) {
                if (array[k] === value) {
                    result = true;
                }
            }
            return result;
        };

        vm.generateIds = function (formula, id) {
            var inputProp = {};
            for (var k = 0; k < formula.length; k++) {
                formula[k].id = id;
                inputProp = {
                    navPropId: formula[k].navPropId,
                    entityId: formula[k].entityId,
                    propertyId: formula[k].propertyId
                };
                if (formula[k].propertyId && !vm.inArray(inputProp, ModelEditorService.model.editedProperty.calculated.inputProperties)) {
                    ModelEditorService.model.editedProperty.calculated.inputProperties.push(inputProp);
                }
                id++;
                vm.formulaElementId = id;
                for (var property in formula[k]) {
                    id = vm.formulaElementId;
                    if (Array.isArray(formula[k][property])) {
                        vm.generateIds(formula[k][property], id);
                    }
                }
            }
        };

        vm.getElement = function (id, inputArray) {
            var result = null;
            for (var k = 0; k < inputArray.length; k++) {
                if (inputArray[k].id === id) {
                    result = inputArray[k];
                    break;
                }
                else {
                    for (var property in inputArray[k]) {
                        if (Array.isArray(inputArray[k][property])) {
                            result = vm.getElement(id, inputArray[k][property]);
                            if (result != null) {
                                break;
                            }
                        }
                    }
                }
                if (result != null) {
                    break;
                }
            }
            return result;
        };

        vm.getParent = function (id, inputArray) {
            var result = null;
            for (var k = 0; k < inputArray.length; k++) {
                if (inputArray[k].id === id) {
                    result = inputArray;
                    break;
                }
                else {
                    for (var property in inputArray[k]) {
                        if (Array.isArray(inputArray[k][property])) {
                            result = vm.getParent(id, inputArray[k][property]);
                            if (result != null) {
                                break;
                            }
                        }
                    }
                }
                if (result != null) {
                    break;
                }
            }
            return result;
        };

        vm.placementIsValid = function (placedElementId, inputArray) {
            var result = true;
            for (var k = 0; k < inputArray.length; k++) {
                if (inputArray[k].id === placedElementId) {
                    result = false;
                    break;
                }
                else {
                    for (var property in inputArray[k]) {
                        if (Array.isArray(inputArray[k][property])) {
                            result = vm.placementIsValid(placedElementId, inputArray[k][property]);
                            if (!result) {
                                break;
                            }
                        }
                    }
                }
                if (!result) {
                    break;
                }
            }
            return result;
        };

        vm.getDeepest = function (container, inputArray) {
            var result = inputArray;

            if (inputArray.length === 1 && inputArray[0].hasOwnProperty(container)) {
                result = vm.getDeepest(container, inputArray[0][container]);
            }

            return result;
        };

        vm.removeLine = function (inputArray) {
            inputArray.splice(0, inputArray.length);
        };

        vm.removeElement = function (id, inputArray, removeAll) {
            var result = false;
            var lengthOfInput = inputArray.length;
            for (var k = 0; k < lengthOfInput; k++) {
                if (inputArray[k].id === id) {
                    if (inputArray[k].type === 'operator' && inputArray[k].hasOwnProperty('left') && (!removeAll)) {
                        var left = vm.getDeepest('right', inputArray[k].left);
                        var leftCopy = angular.copy(left);
                        var subRight = vm.getDeepest('left', inputArray[k].right);
                        var subRightCopy = angular.copy(subRight);
                        var length = left.length;
                        left.splice(0, length);
                        length = subRight.length;
                        subRight.splice(0, length);
                        var newExpression = leftCopy.concat(subRightCopy);
                        for (var i = 0; i < newExpression.length; i++) {
                            subRight.push(newExpression[i]);
                        }
                        var right = angular.copy(inputArray[k].right);
                        length = right.length;
                        for (i = 0; i < length; i++) {
                            left.push(right[i]);
                        }
                        leftCopy = angular.copy(inputArray[k].left);
                        length = inputArray.length;
                        inputArray.splice(0, length);
                        length = leftCopy.length;
                        for (i = 0; i < length; i++) {
                            inputArray.push(leftCopy[i]);
                        }
                    }
                    else {
                        inputArray.splice(k, 1);
                        result = true;
                    }
                    break;
                }
                else {
                    for (var property in inputArray[k]) {
                        if (Array.isArray(inputArray[k][property])) {
                            result = vm.removeElement(id, inputArray[k][property], removeAll);
                            if (result) {
                                break;
                            }
                        }
                    }
                }
                if (result) {
                    break;
                }
            }
            return result;
        };

        vm.navPropExists = function (from, to) {
            var result = false;
            if (ModelEditorService.model.entities) {
                ModelEditorService.model.entities.forEach(function (ent) {
                    if (ent._id === from._id) {
                        ent.navigationProperties.forEach(function (navProp) {
                            if (navProp.toEntityId === to._id) {
                                result = true;
                            }
                        });
                    }
                });
            }
            return result;
        };

        vm.getEntities = function () {
            var result = [];
            var entity;
            if (vm.getProperties(ModelEditorService.selectedEntity._id).length) {
                entity = {};
                entity.navPropId = '';
                entity.navPropName = ModelEditorService.selectedEntity.name;
                result.push(entity);
            }
            if (ModelEditorService.selectedEntity.navigationProperties) {
                ModelEditorService.selectedEntity.navigationProperties.forEach(function (navProp) {
                    if (vm.getProperties(navProp.toEntityId).length) {
                        var ent = {};
                        ent.navPropId = navProp._id;
                        ent.navPropName = navProp.name;
                        result.push(ent);
                    }
                });
            }
            return result;
        };

        vm.getProperties = function (entityId) {
            var result = [];
            if (ModelEditorService.model.entities && entityId) {
                ModelEditorService.model.entities.forEach(function (ent) {
                    if (ent._id === entityId) {
                        ent.properties.forEach(function (prop) {
                            if (!prop.isForeignKey && (!ModelEditorService.model.editedProperty || ModelEditorService.model.editedProperty._id !== prop._id)) {
                                result.push(prop);
                            }
                        });
                    }
                });
            }
            return result;
        };

        vm.addElement = function (inputArray, addedStuff, place, id, container, addAll) {
            var addedObject;
            var length;
            var remainingStuff = [];
            var oResult;
            if (typeof addedStuff === 'string') {
                addedObject = new FormulaElement(addedStuff);
            }
            else {
                addedObject = addedStuff;
            }
            var formulaObj;
            if (id === -1 && container === '') {
                formulaObj = ModelEditorService.model.editedProperty.calculated.calculation;
            }
            else if (place === 'after' || place === '') {
                formulaObj = vm.getElement(id, inputArray)[container];
            }
            else {
                if (typeof place === 'string') {
                    place = parseInt(place, 10);
                }
                formulaObj = vm.getParent(id, inputArray);
            }
            if (Array.isArray(formulaObj)) {
                if (formulaObj.length === 1 && formulaObj[0].hasOwnProperty('right') && !addedObject.hasOwnProperty('left')) {
                    vm.addElement(formulaObj, addedObject, place, formulaObj[0].id, 'right', addAll);
                }
                else {
                    if (addedObject.hasOwnProperty('left') && !addAll) {
                        if (place === 'after' || place === '') {
                            addedObject.right = [];
                        }
                        else {
                            var right = [];
                            length = formulaObj.length;
                            for (var i = place; i < length; i++) {
                                right.push(formulaObj[place]);
                                formulaObj.splice(place, 1);
                            }
                            addedObject.right = right;
                        }
                        addedObject.left = angular.copy(formulaObj);
                        length = formulaObj.length;
                        formulaObj.splice(0, length);
                    }
                    else {
                        length = formulaObj.length;
                        for (i = place; i < length; i++) {
                            remainingStuff.push(formulaObj[place]);
                            formulaObj.splice(place, 1);
                        }
                    }
                    formulaObj.push(addedObject);
                    for (i = 0; i < remainingStuff.length; i++) {
                        formulaObj.push(remainingStuff[i]);
                    }
                    ModelEditorService.model.editedProperty.calculated.inputProperties = [];
                    vm.generateIds(ModelEditorService.model.editedProperty.calculated.calculation, 0);
                }
                oResult = formulaObj;
            }
            else {
                oResult = false;
            }
            return oResult;
        };

        vm.getTemplate = function (type) {
            return type + '_renderer.html';
        };

        vm.getPreview = function (type) {
            return type + '_previewer.html';
        };

        vm.widthClass = function (type, operatorArray) {
            var result = '';

            if (type === 'condition' || vm.containsOtherOperators(operatorArray)) {
                result = 'dmfe-conditionLayout';
            }

            return result;
        };

        vm.containsOtherOperators = function (operatorArray) {
            var result = false;
            if (operatorArray) {
                for (var k = 0; k < operatorArray.length; k++) {
                    if (operatorArray[k]) {
                        if (operatorArray[k].type === 'condition' || operatorArray[k].type === 'operator') {
                            result = true;
                            break;
                        }
                        else {
                            for (var property in operatorArray[k]) {
                                if (Array.isArray(operatorArray[k][property])) {
                                    result = vm.containsOtherOperators(operatorArray[k][property]);
                                    if (result) {
                                        break;
                                    }
                                }
                            }
                        }
                        if (result) {
                            break;
                        }
                    }
                }
            }

            return result;
        };

        vm.numberOfLevels = function (operatorArray, result) {

            if (result === undefined) {
                result = 0;
            }

            if (operatorArray) {
                if (operatorArray.length === 1 && operatorArray[0].type === 'operator') {
                    result++;
                    if (vm.containsOtherOperators(operatorArray[0].left) || vm.containsOtherOperators(operatorArray[0].right)) {
                        var left = vm.numberOfLevels(operatorArray[0].left, 0);
                        var right = vm.numberOfLevels(operatorArray[0].right, 0);

                        if (left > right) {
                            result += left;
                        }
                        else {
                            result += right;
                        }

                    }
                }
                else {
                    for (var i = 0; i < operatorArray.length; i++) {
                        if (operatorArray[i].type === 'condition') {
                            result++;
                            break;
                        }
                    }
                }
            }

            return result;
        };

        vm.getModel = function () {
            return ModelEditorService;
        };

        vm.editElement = function (id, element) {
            document.querySelector('#grabDiv' + id).style.display = 'none';
            if (element === 'value') {
                document.querySelector('#valueInput' + id).focus();
            }
            else if (element === 'select') {
                setTimeout(function () {
                    if (!document.activeElement || (document.activeElement.id !== 'selectOpOp' + id && document.activeElement.id !== 'selectPropOp' + id && document.activeElement.id !== 'selectProp' + id && document.activeElement.id !== 'selectNavProp' + id)) {
                        document.querySelector('#grabDiv' + id).style.display = '';
                    }
                }, 800);
            }
        };

        vm.doneEditing = function (id) {
            setTimeout(function () {
                if (!document.activeElement || (document.activeElement.id !== 'selectOpOp' + id && document.activeElement.id !== 'selectPropOp' + id && document.activeElement.id !== 'selectProp' + id && document.activeElement.id !== 'selectNavProp' + id)) {
                    document.querySelector('#grabDiv' + id).style.display = '';
                }
            }, 200);
        };

        vm.blurElement = function (event) {
            if (event.keyCode === 13) {
                event.target.blur();
            }
        };

        vm.grabbedClass = function (id) {
            var oResult;

            if (vm.deletableElement) {
                oResult = id === vm.deletableElement.dataset.eid;
            }
            else {
                oResult = false;
            }
            return oResult;
        };

        vm.showDeleteButton = function (data, evt, side) {
            if (vm.containsOtherOperators(data.right.concat(data.left)) >= 1) {
                evt.stopPropagation();
                vm.overBracket = data.id + side;
            }
        };

        vm.getLastDroppableDiv = function (div) {
            var result;
            for (var i = 0; i < div.children.length; i++) {
                if ((new RegExp('(^|\\s)(dmfe-dropZone)(\\s|$)')).test(div.children[i].className) && !result) {
                    result = div.children[i];
                }
                else if (!result && !(new RegExp('(^|\\s)(dmfe-dropZone)|(dmfe-endOfOperand)|(dmfe-operandInline)|(dmfe-then)|(dmfe-else)|(dmfe-if)|(dmfe-valueDiv)|(dmfe-propertyDiv)(\\s|$)')).test(div.children[i].className) && div.children[i].tagName.toLowerCase() === 'div') {
                    result = vm.getLastDroppableDiv(div.children[i]);
                }
            }
            return result;
        };

        vm.hideOtherDropZones = function () {
            var dropZones = document.querySelectorAll('.dmfe-dropZone');
            for (var i = 0; i < dropZones.length; i++) {
                if (dropZones[i] !== vm.currentDropZone) {
                    dropZones[i].style.display = '';
                }
            }
        };

        // ---------------  Drag & Drop ----------------

        $scope.defineDrag = function (scope, element, attrs) {
            attrs.$set('draggable', 'true');
            element.bind('dragstart', function (evt) {
                evt.stopPropagation();
                vm.dropElement = false;
                vm.dropZoneWidth = evt.toElement.offsetWidth + 'px';
                vm.deleteElement = false;
                if (evt.toElement.dataset.element === 'setElement') {
                    vm.deletableElement = evt.toElement;
                }
                else {
                    vm.deletableElement = false;
                }
                $scope.$apply();
            });
            element.bind('dragend', function (evt) {
                var all;
                evt.stopPropagation();
                vm.dropZoneWidth = 0;
                if (vm.endDrag) {
                    vm.endDrag = false;
                    if (evt.toElement.nodeName !== '#text' && (new RegExp('(^|\\s)(dmfe-elementButton)|(dmfe-operatorHandle)|(dmfe-inlineElement)|(dmfe-condition)(\\s|$)')).test(evt.toElement.className)) {
                        if (vm.dropElement && evt.toElement.dataset.element !== 'setElement') {
                            vm.addElement(ModelEditorService.model.editedProperty.calculated.calculation, evt.toElement.dataset.element, vm.droppedIntoElement.dataset.added, parseInt(vm.droppedIntoElement.dataset.eid, 10), vm.droppedIntoElement.dataset.container);
                        }
                        else if (vm.dropElement && vm.placementIsValid(parseInt(vm.droppedIntoElement.dataset.eid, 10), [vm.getElement(parseInt(evt.toElement.dataset.eid, 10), ModelEditorService.model.editedProperty.calculated.calculation)])) {
                            var subElement = JSON.parse(JSON.stringify(vm.getElement(parseInt(evt.toElement.dataset.eid, 10), ModelEditorService.model.editedProperty.calculated.calculation)));
                            all = (vm.deletableElement.dataset.remove && vm.deletableElement.dataset.remove === 'all');
                            vm.removeElement(parseInt(subElement.id, 10), ModelEditorService.model.editedProperty.calculated.calculation, all);
                            vm.addElement(ModelEditorService.model.editedProperty.calculated.calculation, subElement, vm.droppedIntoElement.dataset.added, parseInt(vm.droppedIntoElement.dataset.eid, 10), vm.droppedIntoElement.dataset.container, all);
                        }
                        else if (vm.deleteElement && vm.deletableElement) {
                            all = (vm.deletableElement.dataset.remove && vm.deletableElement.dataset.remove === 'all');
                            vm.removeElement(parseInt(vm.deletableElement.dataset.eid, 10), ModelEditorService.model.editedProperty.calculated.calculation, all);
                            vm.deleteElement = false;
                            ModelEditorService.model.editedProperty.calculated.inputProperties = [];
                            vm.generateIds(ModelEditorService.model.editedProperty.calculated.calculation, 0);
                        }
                        vm.deletableElement = false;
                    }
                    if (document.getSelection()) {
                        document.getSelection().removeAllRanges();
                    }
                    setTimeout(function () {
                        vm.endDrag = true;
                    }, 200);
                    if (vm.currentDropZone) {
                        vm.currentDropZone.style.display = '';
                        vm.currentDropZone = false;
                    }
                    $scope.$apply();
                }
            });
        };

        $scope.defineDrop = function (scope, element, attrs) {
            scope.dropData = scope[attrs.drop];
            element.bind('dragover', function (evt) {
                evt.stopPropagation();
                vm.overElement = element;
                vm.droppedIntoElement = element[0];
                vm.dropElement = element[0];
                if (vm.deleteTimeout) {
                    clearTimeout(vm.deleteTimeout);
                }
                vm.deleteElement = false;
                $scope.$apply();
                if ((new RegExp('(^|\\s)(dmfe-droppableDiv)|(dmfe-deleteButton)(\\s|$)')).test(element[0].className) && !(new RegExp('(^|\\s)(dmfe-emptyCondition)(\\s|$)')).test(element[0].className)) {
                    element[0].style.backgroundColor = 'transparent';
                }
                else if ((new RegExp('(^|\\s)(dmfe-addElement)|(dmfe-operand)|(dmfe-operatorHandle)|(dmfe-valueDiv)|(dmfe-propertyDiv)(\\s|$)')).test(element[0].className) && !(new RegExp('(^|\\s)(dmfe-operatorHandle)(\\s|$)')).test(vm.deletableElement.className)) {
                    if ((new RegExp('(^|\\s)(dmfe-operatorHandle)(\\s|$)')).test(element[0].className)) {
                        if (element[0].parentElement.children.length) {
                            vm.currentDropZone = vm.getLastDroppableDiv(element[0].parentElement.children[0]);
                            vm.currentDropZone.style.display = 'block';
                    }
                    }
                    else {
                        if (element[0].children.length) {
                            vm.currentDropZone = vm.getLastDroppableDiv(element[0]);
                            vm.currentDropZone.style.display = 'block';
                        }
                    }
                }
                else if ((!vm.deletableElement || element[0].dataset.eid !== vm.deletableElement.dataset.eid) && element[0].dataset.element === 'setElement' && !(new RegExp('(^|\\s)(dmfe-operatorHandle)(\\s|$)')).test(vm.deletableElement.className)) {
                    element[0].children[0].style.display = 'block';
                }
                else if ((new RegExp('(^|\\s)(dmfe-conditionHeader)(\\s|$)')).test(element[0].className)) {
                    setTimeout(function () {
                        if (element === vm.overElement && !(new RegExp('(^|\\s)(is-expanded)(\\s|$)')).test(element[0].className)) {
                            for (var i = 0; i < element[0].children.length; i++) {
                                if ((new RegExp('(^|\\s)(ui-accordion-paneHeader-arrow)(\\s|$)')).test(element[0].children[i].click())) {
                                    element[0].children[i].click();
                                }
                            }
                        }
                    }, 750);
                }
                vm.hideOtherDropZones();
            });
            element.bind('dragleave', function (evt) {
                evt.stopPropagation();
                setTimeout(function () {
                    if (vm.endDrag) {
                        vm.overElement = false;
                        vm.deleteTimeout = setTimeout(function () {
                            vm.deleteElement = true;
                        }, 100);
                        setTimeout(function () {
                            vm.dropElement = false;
                            $scope.$apply();
                            if (vm.overElement !== element && (new RegExp('(^|\\s)(dmfe-droppableDiv)|(dmfe-deleteButton)(\\s|$)')).test(element[0].className) && !(new RegExp('(^|\\s)(dmfe-emptyCondition)(\\s|$)')).test(element[0].className)) {
                                element[0].style.backgroundColor = '';
                            }
                            else if (element[0].dataset.element === 'setElement') {
                                element[0].children[0].style.display = '';
                            }
                            vm.hideOtherDropZones();
                        }, 150);
                    }
                }, 100);
            });
        };

    }
})();

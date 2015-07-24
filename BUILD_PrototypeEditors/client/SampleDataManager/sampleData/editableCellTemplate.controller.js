'use strict';
var moment = require('norman-client-tp').moment;
var _ = require('norman-client-tp').lodash;
module.exports = [
    '$scope',
    function ($scope) {
        $scope.headerTypeMap = null;

        function cellTypeMatched(value, type) {
            if (!value && !type) {
                return false;
            }
            switch (type.toLowerCase()) {
            case 'string':
                return true;

            case 'decimal':
            case 'float':
            case 'number':
            case 'single':
            case 'double':
            case 'int':
            case 'int16':
            case 'int32':
            case 'int64':
            case 'integer':
                return !isNaN(value);


            case 'boolean':
                if (value === true || value === false) {
                    return true;
                }
                if (value.toLowerCase()) {
                    if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
                        return true;
                    }
                }
                return false;
            case 'time':
                if (value) {
                    value = value.trim();
                    var test = /^(?:2[0-3]|[01]?[0-9]):[0-5][0-9]:[0-5][0-9]$/;
                    return test.test(value);
                }
                return true;
            case 'date':
            case 'datetime':
            case 'datetimeoffset':
                if (!value) {
                    return true;
                }
                else {
                    value = value.trim();
                    var dtest = /^[0-9]{4}-(((0[13578]|(10|12))-(0[1-9]|[1-2][0-9]|3[0-1]))|(02-(0[1-9]|[1-2][0-9]))|((0[469]|11)-(0[1-9]|[1-2][0-9]|30)))$/;
                    if (dtest.test(value)) {
                        if (typeof value === 'string') {
                            value = moment.parseZone(value + ' UTC');
                            value = value._d;
                        }
                        if (value instanceof Date && isFinite(value)) {
                            return true;
                        }
                    }
                    return false;
                }
            }
        }

        function setHeaderTypeMap(dataModel) {
            var localMap = {};
            for (var i = 0; i < dataModel.entities.length; i++) {
                var entity = dataModel.entities[i];
                localMap[entity.name] = {};
                for (var j = 0; j < entity.properties.length; j++) {
                    var property = entity.properties[j];
                    localMap[entity.name][property.name] = {
                        type: property.propertyType.toLowerCase(),
                        isKey: property.isKey
                    };
                }
            }
            return localMap;
        }
        $scope.removeHighlight = function (row, col) {
                if (row.entity.isHighLight) {
                    var index = row.entity.isHighLight.indexOf(col);
                    if (index > -1) {
                        row.entity.isHighLight.splice(index, 1);
                    }
                    if (row.entity.isHighLight.length === 0) {
                        delete row.entity.isHighLight;
                    }
                }
                if (row.entity.errorText) {
                    delete row.entity.errorText[col];
                    if (Object.keys(row.entity.errorText).length === 0) {
                        delete row.entity.errorText;
                    }
                }
                if (!(_.some(row.grid.options.data, 'errorText'))) {
                    var data = $scope.grid.options.tabName;
                    console.log($scope.$parent.entityTabs);
                    $scope.$emit('removeError', data);
                }
        };
        $scope.validateCellData = function (row, colField) {
            // $scope.$emit('ON_BLUR_CELL', row);
            if (!$scope.headerTypeMap) {
                $scope.headerTypeMap = setHeaderTypeMap(row.grid.options.dataModel);
            }

            if (!row.entity[colField]) {
                row.entity[colField] = null;
            }
            var newValue = row.entity[colField];
            var isTypeMatched = cellTypeMatched(newValue, $scope.headerTypeMap[row.grid.options.tabName][colField].type);
            if (!isTypeMatched) {
                $scope.invalidCellEntry = true;
                if (!row.entity.dirtyCells) {
                    row.entity.dirtyCells = [];
                }
                var columnName = row.grid.api.cellNav.getFocusedCell().col.name;
                if (row.entity.dirtyCells.indexOf(columnName) === -1) {
                    row.entity.dirtyCells.push(columnName);
                }
            }
            else {
                if (row.entity.dirtyCells) {
                    var index = row.entity.dirtyCells.indexOf(row.grid.api.cellNav.getFocusedCell().col.name);
                    if (index > -1) {
                        row.entity.dirtyCells.splice(index, 1);
                    }
                }
            }
        };
    }
];

'use strict';

module.exports = [
    '$scope',
    '$timeout',
    function ($scope) {

        $scope.rowHeaderClicked = function (event, row) {
            if (row.isSelected) {
                row.grid.api.selection.unSelectRow(row.entity);
            }
            else {
                row.grid.api.selection.selectRow(row.entity);
            }
            var sdGrid = angular.element(document.getElementById('sd-grid-dialog-id'));
            var coordinates = {},
                data = {};
            coordinates.x = event.clientX;
            if (sdGrid.length > 0) {
                coordinates.y = (event.srcElement.getBoundingClientRect().top) - (sdGrid[0].getBoundingClientRect().top);
            }
            data.coordinates = coordinates;
            data.row = row;
            $scope.$emit('emitRow', data);
        };

        $scope.rowHeaderLostFocus = function () {
            $scope.$emit('hidePop');
        };
        this.rowTemplateControllerSafe = true;
    }
];

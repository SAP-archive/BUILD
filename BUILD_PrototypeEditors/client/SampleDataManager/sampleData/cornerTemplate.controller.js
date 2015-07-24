'use strict';
module.exports = [
    '$scope',
    function ($scope) {
        $scope.triggerNewLine = function (row) {
            $scope.$emit('addLine', row);
        };
    }
];

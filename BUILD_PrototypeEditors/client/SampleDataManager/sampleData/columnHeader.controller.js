'use strict';

module.exports = [
    '$scope',
    function ($scope) {
        $scope.hideFilter = true;
        $scope.showFilter = function () {
            $scope.hideFilter = false;
            $scope.isFocused = true;
            $scope.$broadcast('showFilterInput');
        };


        $scope.hideFilterFn = function ($event) {
            if ($event.target.value === '') {
                $scope.hideFilter = true;
            }
            $scope.$broadcast('hideFilterInput');
        };
        this.columnHeaderControllerSafe = true;
    }
];

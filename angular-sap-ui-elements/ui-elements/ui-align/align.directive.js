'use strict';

// @ngInject
module.exports = function() {
    return {
        restrict: 'E',
        scope: {
            selectedAlignment: '@'
        },
        controller: ['$scope', function($scope) {
            $scope.selectedAlignment = '';
            this.getSelectedAlignment = function() {
                return $scope.selectedAlignment;
            };
            this.setSelectedAlignment = function(selectedAlignment) {
                $scope.selectedAlignment = selectedAlignment;
            };
        }]
    };
};

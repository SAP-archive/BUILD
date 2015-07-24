'use strict';

module.exports = angular.module('common.directives', [])
    .directive('nnEnter', require('./enter.directive.js'))
    .directive('nnFocus', require('./focus.directive.js'))
    // Temporary controller used to populate data for sample page.  Will be removed.
    .controller('DirectiveController', ['$scope', '$log', function($scope, $log) {

        // Function to be called when the user hits the enter key
        $scope.enterFunction = function() {
            $log.log('You triggered an nnEnter event');
        };
    }]);

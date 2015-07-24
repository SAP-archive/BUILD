'use strict';

// @ngInject
module.exports = function ($timeout, $log, jsPlumbService) {
    var templateUrl = 'resources/norman-prototype-editors-client/DataModeler/dataModelEditor/dataModelDesigner/directives/dmdItem.html';
    return {
        restrict: 'E',
        replace: true,
        scope: {
            item: '=',
            selectedItem: '=',
            updateItem: '&',
            selectItem: '&',
            removeItem: '&',
            dragItemStop: '&'
        },
        controller: ['$scope', function ($scope) {
            $scope.bAllowSelection = true;
            $scope.bedit = false;

            // ----------------------------- event API -----------------------------
            $scope.$on('ModelEditorService.modelChangeStart', function () {
                $scope.bAllowSelection = false;
            });
            $scope.$on('ModelEditorService.modelChanged', function () {
                $scope.bAllowSelection = true;
            });
            $scope.$on('ModelEditorService.propertyAdded', function () {
                $scope.bAllowSelection = true;
            });
            $scope.$on('ModelEditorService.relationAdded', function () {
                $scope.bAllowSelection = true;
            });

            // --------------------------- directive methods ----------------------

            $scope.validateName = function ($data) {
                $scope.bedit = false;

                if ($data !== $scope.item.name) {
                    var copy = angular.copy($scope.item);
                    copy.name = $data;
                    $scope.updateItem()(copy);
                }
                // false = Success. But local model will not be updated and form will close
                return false;
            };

            $scope.onEdit = function () {
                jsPlumbService.scrollToItem($scope.item._id);
                $scope.bedit = true;
                $timeout(function () {
                    $scope.dmdEntity.$show();
                });
            };

            $scope.onCancel = function () {
                $scope.bedit = false;
            };
        }],
        link: function (scope, element) {
            element.on('click', function () {
                if (scope.bAllowSelection) {
                    scope.selectItem()(scope.item);
                    scope.$apply();
                }
                scope.bAllowSelection = true; // avoid locks = only skips 1 click max
            });

            scope.delete = function () {
                // clean ui
                jsPlumbService.instance.remove(element);

                // clean model
                scope.selectItem()(scope.item);
                scope.removeItem(scope.item._id);
            };
        },
        templateUrl: templateUrl
    };
};


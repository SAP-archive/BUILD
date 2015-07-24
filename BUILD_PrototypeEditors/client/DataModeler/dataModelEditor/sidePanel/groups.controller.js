'use strict';

(function () {
    angular.module('model')
        .controller('GroupsController', ['$state', '$window', '$rootScope', '$scope', '$timeout', 'dm.ModelEditorService']);

    function GroupsController($state, $window, $rootScope, $scope, $timeout, ModelEditorService) {
        var vm = this;

        vm.initAddGroupModal = function () {
            if (!vm.standardGroups) {
                vm.standardGroups = ModelEditorService.getStandardGroups();
            }
            vm.newGroup = {
                name: 'Default Name',
                type: null
            };
            if (vm.standardGroups.length && vm.standardGroups.length > 0) {
                vm.newGroup.type = vm.standardGroups[0];
            }
        };

        vm.getPropertyName = function (propertyId) {

            var propertyName = '';
            angular.forEach($scope.selectedEntity.properties, function (property) {
                if (property._id === propertyId) {
                    propertyName = property.name;
                    return true;
                }
            });
            return propertyName;
        };

        $scope.$on('ModelEditorService.standardGroupsChanged', function () {
            vm.standardGroups = ModelEditorService.getStandardGroups();
        });

        vm.openAddGroupModal = function () {
            vm.initAddGroupModal();
            $rootScope.$broadcast('dialog-open', 'addGroupModal');
            var element = document.getElementById('groupNameInput');
            $timeout(function () {
                if (element) {
                    element.focus();
                }
            }, 100);
        };

        vm.createGroup = function () {
            ModelEditorService.addGroup(vm.newGroup);
        };

        vm.removeGroup = function (entityId, groupData, index) {
            ModelEditorService.removeGroup(entityId, groupData).then(function () {
                vm.entity.groups.splice(index, 1);
            });
        };
        vm.toggleSelectForRole = function (index) {
            var selectedRoleIndex = index;
            $timeout(function () {
                $scope.selectedRoleIndex = selectedRoleIndex;
                vm.roleInEdition = true;
                angular.element($window).bind('click', cancelRoleEdition);
            }, 100);
        };

        vm.updateGroup = function (groupData) {
            ModelEditorService.updateGroup(groupData).then(function () {
                $scope.selectedRoleIndex = -1;
            });
        };

        vm.resetRoleSelect = function () {
            angular.element($window).unbind('click', cancelRoleEdition);
            vm.editing = '';
        };

        $scope.onDrop = function ($event, $data, role, group) {
            role.propertyId = $data._id;
            ModelEditorService.updateGroup(group);
        };


        vm.unbindRole = function (role, groupData, $event) {
            role.propertyId = null;
            ModelEditorService.updateGroup(groupData);
            $event.stopPropagation();
        };

        var cancelRoleEdition = function (event) {

                // for the role if a select appears and we do not click within it it cancels edition
                if (event.toElement.classList.length < 1 || event.toElement.classList[0] !== 'ui-select') {
                    $scope.selectedRoleIndex = -1;
                    angular.element($window).unbind('click', cancelRoleEdition);
                    vm.roleInEdition = false;
                    $scope.$apply();// force the digest cycle to toggle the visibility
                }
        };

    }

    module.exports = ['$state', '$window', '$rootScope', '$scope', '$timeout', 'dm.ModelEditorService', GroupsController];
})();

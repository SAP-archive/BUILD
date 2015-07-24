'use strict';

(function () {
    angular.module('model')
        .controller('SidePanelController', ['$state', '$window', '$scope', '$rootScope', '$timeout', '$stateParams', '$http', 'dm.ModelEditorService', 'dm.SidePanelService', 'featureToggle']);

    function SidePanelController($state, $window, $scope, $rootScope, $timeout, $stateParams, $http, ModelEditorService, SidePanelService, featureToggle) {

        var vm = this;
        $scope.projectId = $stateParams.currentProject;

        // -------- Disable Group feature ---------

        vm.groupDisabled = false;
        featureToggle.isEnabled('disable-group').then(function (groupDisabled) {
            vm.groupDisabled = groupDisabled;
        });

        // -------- Sorting properties ---------
        vm.propSortPredicate = 'isKey';
        vm.propSortReverse = true;
        vm.editing = '';

        vm.orderProperty = function (predicate) {
            vm.propSortPredicate = predicate;
            vm.propSortReverse = !vm.propSortReverse;
        };

        // -------- Sorting navigation --------
        vm.navSortPredicate = '';
        vm.navSortReverse = false;

        vm.orderNavigation = function (predicate) {
            vm.navSortPredicate = predicate;
            vm.navSortReverse = !vm.navSortReverse;
        };

        // ---------- Show/Hide mechanism --------

        vm.showSidePanel = SidePanelService.isDisplayed();

        $scope.$on(SidePanelService.EVENTS.SIDE_PANEL_SHOWN, function () {
            vm.showSidePanel = true;
        });

        $scope.$on(SidePanelService.EVENTS.SIDE_PANEL_HIDDEN, function () {
            vm.showSidePanel = false;
        });

        // ---------- Model ---------

        $scope.model = ModelEditorService.getModel($scope.projectId);
        $scope.$on('ModelEditorService.modelChanged', function (event, model) {
            $scope.model = model;
        });

        $scope.$on('ModelEditorService.propertyAdded', function () {
            $scope.model = ModelEditorService.getModel();
            $scope.selectedEntity = ModelEditorService.getSelectedEntity();
        });

        // ---------- Selection ---------
        $scope.selectedEntity = ModelEditorService.getSelectedEntity();

        $scope.$on('ModelEditorService.selectedEntityChanged', function () {
            $scope.selectedEntity = ModelEditorService.getSelectedEntity();
        });

        vm.selectEntity = function (entity) {
            ModelEditorService.setSelectedEntity(entity);
            return false;
        };

        vm.selectEntityById = function (id) {
            var e;
            angular.forEach($scope.model.entities, function (entity) {
                if (entity._id === id) {
                    e = entity;
                    return;
                }
            });
            ModelEditorService.setSelectedEntity(e);
            return false;
        };

        vm.selectNext = function () {
            var i;
            angular.forEach($scope.model.entities, function (entity, index) {
                if (entity._id === $scope.selectedEntity._id) {
                    var next = (index + 1 === $scope.model.entities.length) ? 0 : index + 1;
                    i = next;
                    return;
                }
            });
            ModelEditorService.setSelectedEntity($scope.model.entities[i]);
        };

        vm.selectPrevious = function () {
            var i;
            angular.forEach($scope.model.entities, function (entity, index) {
                if (entity._id === $scope.selectedEntity._id) {
                    var previous = (index === 0) ? $scope.model.entities.length - 1 : index - 1;
                    i = previous;
                    return;
                }
            });
            ModelEditorService.setSelectedEntity($scope.model.entities[i]);
        };

        vm.removeEntity = function () {
            // timeout to make sure if we are editing this entity delete request comes after the update (popup on close method)
            $timeout(function () {
                ModelEditorService.removeEntity();
            }, 50);
        };

        vm.saveEntity = function () {
            var result = false;
            if (vm.entity) {
                var copy = angular.copy(vm.entity);
                ModelEditorService.updateEntity(copy);
                vm.entity = null;
            }
            return result;
        };

        vm.openEntityEditorModal = function (entity, event) {
            if (entity) {
                vm.entity = angular.copy(entity);
                vm.needToUpdateEntity = false;
            }
            $timeout(function () {
                $rootScope.$broadcast('popup-open', {
                    id: 'entityEditorModal',
                    elem: [event.srcElement]
                });
            });
        };

        // -------------- Popups -----------------

        vm.onClose = function () {
            if (vm.needToUpdateProperty) {
                vm.saveProperty();
                vm.needToUpdateProperty = false;
            }
            if (vm.needDeleteAndCreateNavProperty) {
                vm.deleteAndCreateNavProperty();
                vm.needDeleteAndCreateNavProperty = false;
            }
            else if (vm.needToUpdateNavProperty) {
                vm.saveNavProperty();
                vm.needToUpdateNavProperty = false;
            }
            if (vm.needToUpdateEntity) {
                vm.saveEntity();
                vm.needToUpdateEntity = false;
            }
            // reset selected entity if any
            vm.entity = null;
            // reset selected property or nav property if any
            vm.selectedProperty = null;
            vm.selectedNavProperty = null;
        };




        // --------------- Groups -------------------
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

    }

    module.exports = ['$state', '$window', '$scope', '$rootScope', '$timeout', '$stateParams', '$http', 'dm.ModelEditorService', 'dm.SidePanelService', 'featureToggle', SidePanelController];

})();

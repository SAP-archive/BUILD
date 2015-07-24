'use strict';

(function () {

    var _ = require('norman-client-tp').lodash;

    angular.module('model')
        .controller('RelationsController', ['$state', '$window', '$rootScope', '$scope', '$timeout', 'dm.ModelEditorService']);

    function RelationsController($state, $window, $rootScope, $scope, $timeout, ModelEditorService) {
        var vm = this;

        // ------ foreign key ------

        vm.source = '';
        vm.target = '';

        function _computeForeignKey(navProperty) {

            //the name displayed is 'source.relation.target'
            if (navProperty) {
                angular.forEach(navProperty.referentialConstraints, function (constraint) {
                    if (constraint.entityId === navProperty.toEntityId) {
                        vm.target = _.result(_.find(vm.model.entities, {_id: constraint.entityId}), 'name');
                    }
                    else {
                        vm.source = _.result(_.find(vm.model.entities, {_id: constraint.entityId}), 'name');
                    }
                });
            }
        }

        // ---------- Model ---------

        vm.model = ModelEditorService.getModel($scope.projectId);
        $scope.$on('ModelEditorService.modelChanged', function () {
            vm.model = ModelEditorService.getModel();
        });

        // --------------------------

        vm.removeNavigation = function (navigation) {
            // timeout to make sure if we are editing this relation delete request comes after the update (popup on close method)
            $timeout(function () {
                ModelEditorService.removeNavigation(navigation);
            }, 50);
        };

        // creation in the side panel
        vm.startNavigationCreation = function () {
            if (!vm.navigationInCreation) {
                vm.newNavigation = {name: 'RelationName', multiplicity: true, toEntityId: vm.model.entities[0]._id};
                vm.navigationInCreation = true;
                $rootScope.$broadcast('ModelEditorService.modelChangeStart');
                vm.newNavigationNameInput = document.getElementById('newNavigationNameInput');
                $timeout(function () {
                    if (vm.newNavigationNameInput) {
                        vm.newNavigationNameInput.focus();
                        vm.newNavigationNameInput.select();
                    }
                    angular.element($window).bind('click', onClickOutsideSaveNavigation);
                }, 100);
            }
        };

        // called when clicked outside of the creation in side panel
        vm.addNavigation = function () {
            ModelEditorService.addNavigation(vm.newNavigation);
        };

        // called to reset the pop up
        vm.clearRelationEditorModal = function () {
            vm.selectedTab = 'dm-rel-info';
            vm.MULTIPLICITY_TYPE = ['1', 'n'];
            vm.multiplicityType = vm.MULTIPLICITY_TYPE[0];
            vm.needToUpdateNavProperty = false;
            vm.needDeleteAndCreateNavProperty = false;
        };

        vm.openRelationEditorModal = function (navProperty, currentEntity, event) {
            ModelEditorService.setSelectedNavigation(currentEntity._id, navProperty.toEntityId, navProperty.name);
            // timeout to make sure that the onclose method of the popup is never close after the open
            $timeout(function () {
                vm.selectedNavProperty = navProperty.name;
                vm.clearRelationEditorModal();
                if (navProperty) {
                    _computeForeignKey(navProperty);
                    vm.navProperty = angular.copy(navProperty);
                    vm.multiplicityType = navProperty.multiplicity ? vm.MULTIPLICITY_TYPE[1] : vm.MULTIPLICITY_TYPE[0];
                }

                $rootScope.$broadcast('popup-open', {
                    id: 'relationEditorModal',
                    elem: [event.srcElement.parentElement]
                });
            }, 50);
        };

        // called to update multiplicity
        vm.onNavPropertyChange = function (propertyKey, propertyValue) {
            vm.needToUpdateNavProperty = true;
            vm.navProperty[propertyKey] = propertyValue;
        };

        // called on popup close to update navProperty (navigation target not changed)
        vm.saveNavProperty = function () {
            var copy = angular.copy(vm.navProperty);
            ModelEditorService.updateNavigation(copy);
        };

        // called on popup close to delete navProperty and create a new one because target has changed
        vm.deleteAndCreateNavProperty = function () {
            var copy = angular.copy(vm.navProperty);
            var createdNavProp = {name: copy.name, multiplicity: copy.multiplicity, toEntityId: copy.toEntityId};
            ModelEditorService.removeNavigation(vm.navProperty);
            ModelEditorService.addNavigation(createdNavProp);
        };


        vm.clearRelationEditorModal();

        var onClickOutsideSaveNavigation = function (event) {
            if (event.toElement.classList.length < 2 || event.toElement.classList[1] !== 'ui-select' && event.toElement.classList[1] !== 'ui-input') {
                vm.saveNavigation();
            }
        };

        vm.saveNavigation = function () {
            vm.addNavigation();
            angular.element($window).unbind('click', onClickOutsideSaveNavigation);
            vm.navigationInCreation = false;
        };

        vm.onClose = function () {

            if (vm.needDeleteAndCreateNavProperty) {
                vm.deleteAndCreateNavProperty();
                vm.needDeleteAndCreateNavProperty = false;
            }
            else if (vm.needToUpdateNavProperty) {
                vm.saveNavProperty();
                vm.needToUpdateNavProperty = false;
            }
            vm.selectedNavProperty = null;
        };


    }

    module.exports = ['$state', '$window', '$rootScope', '$scope', '$timeout', 'dm.ModelEditorService', RelationsController];
})();

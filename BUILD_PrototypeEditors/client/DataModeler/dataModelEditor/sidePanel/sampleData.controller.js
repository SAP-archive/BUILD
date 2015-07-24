'use strict';

(function () {
    angular.module('model')
        .controller('SampleDataController', ['$state', '$scope', '$rootScope', '$timeout', 'dm.ModelEditorService']);

    function SampleDataController($state, $scope, $rootScope, $timeout, ModelEditorService) {
        var vm = this;

        vm.EXPORT_TYPES = ['ENTITY', 'ALL'];
        vm.exportType = vm.EXPORT_TYPES[0];
        vm.exportUseTable = true;
        vm.uploadActive = false;
        vm.exportActive = false;


        // ---------- Selection ---------
        vm.selectedEntity = ModelEditorService.getSelectedEntity();

        $scope.$on('ModelEditorService.selectedEntityChanged', function () {
            vm.selectedEntity = ModelEditorService.getSelectedEntity();
        });

        vm.openSampleData = function () {
            $rootScope.$broadcast('SampleDataEditor', {
                sampleDataPath: 'anyPathName',
                id: $scope.projectId,
                entityName: vm.selectedEntity.name
            });
        };

        vm.checkModelHasMultipleEntities = function (model) {
            var multipleEntities = model && model.entities.length > 1;
            if (!multipleEntities && vm.exportType === vm.EXPORT_TYPES[1]) {
                vm.exportType = vm.EXPORT_TYPES[0];
            }
            return multipleEntities;
        };

        vm.getImportUrl = function () {
            return ModelEditorService.getUpdateExcelUrl($scope.projectId);
        };

        vm.importSuccess = function (value) {
            ModelEditorService.onUpdateExcelSuccess(value);
        };

        vm.exportInExcel = function () {
            switch (vm.exportType) {
                case vm.EXPORT_TYPES[0] : // entity only
                    ModelEditorService.exportEntityInExcel(vm.exportUseTable);
                    break;
                case vm.EXPORT_TYPES[1] : // all
                    ModelEditorService.exportModelInExcel(vm.exportUseTable);
                    break;
            }
        };
    }

    module.exports = ['$state', '$scope', '$rootScope', '$timeout', 'dm.ModelEditorService', SampleDataController];
})();

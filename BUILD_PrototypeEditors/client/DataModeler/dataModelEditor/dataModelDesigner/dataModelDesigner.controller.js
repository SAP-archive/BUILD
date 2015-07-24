'use strict';

module.exports = ['$stateParams', '$scope', '$rootScope', '$log', 'dm.ModelEditorService', 'npConcurrentAccessHelper', function ($stateParams, $scope, $rootScope, $log, ModelEditorService, npConcurrentAccessHelper) {


    // ----------------- INIT ---------------------
    var self = this,
        projectId = $stateParams.currentProject;

    // enable to unlock before unload
    npConcurrentAccessHelper.enableUnlockMonitoring();

    // ---------- Model --------
    self.model = ModelEditorService.getModel(projectId);
    $log.debug('starting dataModeler editor for project ' + projectId);

    $scope.$on('ModelEditorService.modelChanged', function (event, model) {
        self.model = model;
    });

    // ---------- file upload  --------
    self.importSuccess = function (value) {
        ModelEditorService.onImportExcelSuccess(value);
    };

    self.getImportUrl = function () {
        return ModelEditorService.getImportExcelUrl(projectId);
    };

    // ---------- Selection ---------
    if (ModelEditorService.selectedEntity) {
        self.selectedEntity = ModelEditorService.selectedEntity;
    }
    $scope.$on('ModelEditorService.selectedEntityChanged', function () {
        self.selectedEntity = ModelEditorService.selectedEntity;
    });
    self.selectEntity = function (entity) {
        ModelEditorService.setSelectedEntity(entity);
    };

    // ---------------  Entities ---------------
    self.addNewEntity = function () {
        ModelEditorService.addEntity();
    };
    self.renameEntity = function (entity) {
        ModelEditorService.updateEntity(entity);
    };
    self.removeEntity = function () {
        ModelEditorService.removeEntity();
    };
    self.changeRoot = function () {
        ModelEditorService.changeRootEntity();
    };

    // ---------------  Navigation ----------------
    self.addNavigation = function (newNavigationTarget) {
        if (newNavigationTarget) {

            ModelEditorService.addNavigation({
                name: newNavigationTarget.name,
                multiplicity: true,
                toEntityId: newNavigationTarget._id
            });
        }
    };

    self.removeNavigation = function removeNavigation(navigation) {
        ModelEditorService.removeNavigation(navigation);
    };

    // ----------- VISUALIZATION --------------

    self.openSearch = function () {
        $rootScope.$broadcast('dialog-open', 'search-entity-panel');
    };

    self.dragEntityStop = function () {
        ModelEditorService.updateModel();
    };

}];

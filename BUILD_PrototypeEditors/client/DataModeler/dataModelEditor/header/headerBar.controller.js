'use strict';

function HeaderBarController($rootScope, $scope, $state, $stateParams, ModelEditorService,
                             npConcurrentAccessHelper, AsideFactory, SidePanelService) {

    var vm = this;
    var projectId = $stateParams.currentProject;
    var currentScreen;

    $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        currentScreen = fromParams.currentScreen;
    });
    // ----------------   SAVE STATUS   -----------------------

    var saveNotificationLabel = {
        SAVE_SUCCESSFUL: 'All Changes Saved.',
        SAVE_FAILED: 'Failed to save changes.',
        SAVE_PENDING: 'Saving...'
    };

    function updateSaveNotification() {
        var status = ModelEditorService.getSaveStatus();
        switch (status) {
            case ModelEditorService.saveStatuses.SAVE_SUCCESSFUL:
                vm.saveNotification = saveNotificationLabel.SAVE_SUCCESSFUL;
                break;
            case ModelEditorService.saveStatuses.SAVE_FAILED:
                vm.saveNotification = saveNotificationLabel.SAVE_FAILED;
                break;
            case ModelEditorService.saveStatuses.SAVE_PENDING:
                vm.saveNotification = saveNotificationLabel.SAVE_PENDING;
                break;
        }
    }

    updateSaveNotification();
    $scope.$on('ModelEditorService.saveStatusChanged', updateSaveNotification);

    // --------------------------------------------------------


    vm.toggleNavigationBar = function () {
        if (vm.toggleNavigationBar.toggled) {
            AsideFactory.show();
            vm.toggleNavigationBar.toggled = false;
        }
        else {
            AsideFactory.hide();
            vm.toggleNavigationBar.toggled = true;
        }
    };
    vm.toggleNavigationBar.toggled = false;


    vm.goToUIComposer = function () {
        // go to ui composer should not released the lock
        npConcurrentAccessHelper.disableUnlockOnce();
        var redirectState = currentScreen ? 'ui-composer' : 'page-map-view';
        $state.go(redirectState, {
            currentProject: projectId,
            currentScreen: currentScreen
        });
    };

    vm.addNewEntity = function () {
        ModelEditorService.addEntity();
    };

    vm.getImportUrl = function () {
        return ModelEditorService.getImportExcelUrl(projectId);
    };

    vm.importSuccess = function (value) {
        ModelEditorService.onImportExcelSuccess(value);
    };

    vm.sidePanelShown = SidePanelService.isDisplayed();
    $scope.$on(SidePanelService.EVENTS.SIDE_PANEL_SHOWN, function () {
        vm.sidePanelShown = true;
    });

    $scope.$on(SidePanelService.EVENTS.SIDE_PANEL_HIDDEN, function () {
        vm.sidePanelShown = false;
    });

    vm.toggleShowHideSidePanel = function () {
        SidePanelService.toggleDisplay();
    };
    vm.openSearch = function () {
        $rootScope.$broadcast('dialog-open', 'search-entity-panel');
    };
}
module.exports = ['$rootScope', '$scope', '$state', '$stateParams', 'dm.ModelEditorService', 'npConcurrentAccessHelper', 'AsideFactory', 'dm.SidePanelService', HeaderBarController];

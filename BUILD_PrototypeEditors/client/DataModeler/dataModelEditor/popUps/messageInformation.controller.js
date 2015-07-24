'use strict';

function MessageInformationController($scope, $rootScope, $timeout, ModelEditorService) {

    var vm = this;
    vm.expand = false;
    $scope.$on('ModelEditorService.importMessages', function () {
        vm.messages = ModelEditorService.getImportMessages();
        $timeout(function () {
            $rootScope.$broadcast('dialog-open', 'messagesModal');
        });
    });

    vm.expandMessages = function () {
        vm.expand = !vm.expand;
    };

    vm.clearMessages = function () {
        vm.messages = [];
    };

    vm.clearMessages();
}

module.exports = ['$scope', '$rootScope', '$timeout', 'dm.ModelEditorService', MessageInformationController];

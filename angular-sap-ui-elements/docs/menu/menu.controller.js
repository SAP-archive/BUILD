'use strict';

// @ngInject
module.exports = function ($state, $scope, $rootScope, $timeout, $log, DocsMenuFactory) {
    $scope.menu = DocsMenuFactory;
    $scope.menuAccordion = {};

    /**
     * exposes the $state.go() method to the template while handling
     * missing params and check of isPersistent
     * @param stateName
     * @param params
     */
    $scope.stateGo = function(url, id) {
        var param = {
            'id': id,
            'url': url
        };
        $state.go('uielements.docs', param, param);
    };
};

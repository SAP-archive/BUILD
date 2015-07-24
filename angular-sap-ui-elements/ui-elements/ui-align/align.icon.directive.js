'use strict';

// @ngInject
module.exports = function() {
    return {
        restrict: 'E',
        scope: {
            alignment: '@'
        },
        templateUrl: 'resources/angular-sap-ui-elements/ui-elements/ui-align/align.icon.template.html',
        require: '^uiAlign',
        link: function(scope, element, attrs, alignController) {
            scope.selectAlignItem = function() {
                alignController.setSelectedAlignment(scope.alignment);
            };

            scope.isSelectedAlignment = function() {
                return alignController.getSelectedAlignment() === scope.alignment;
            };
        },
        transclude: false,
        replace: true
    };
};

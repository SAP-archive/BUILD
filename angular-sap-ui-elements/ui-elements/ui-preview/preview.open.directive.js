'use strict';

// @ngInject
module.exports = function() {
    return {
        restrict: 'A',
        replace: true,
        link: function (scope, elem, attrs) {
            elem.bind('click', function() {
                scope.$parent.$broadcast('preview-open', attrs.uiPreviewOpen, attrs.uiPreviewDocId);
            });
        }
    };
};

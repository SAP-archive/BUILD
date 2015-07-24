'use strict';
// @ngInject
module.exports = function () {
    return {
        restrict: 'A',
        scope: {
            ngModel: '='
        },
        link: function (scope) {

            var sanitize = function (v) {
                if (!v) return '';
                var div = document.createElement('div');
                div.innerHTML = v;
                return div.textContent || div.innerText || '';
            };


            scope.$watch('ngModel', function (v) {
                scope.ngModel = sanitize(v);
            });

        }
    };
};

'use strict';

module.exports = ['$http', '$compile', function ($http, $compile) {
    return {
        restrict: 'EA',
        link: function (scope, element, attrs) {
            $http.get(attrs.src).then(function (response) {
                var icon = $compile(response.data)(scope);
                element.append(icon);
            });
        }
    };
}];

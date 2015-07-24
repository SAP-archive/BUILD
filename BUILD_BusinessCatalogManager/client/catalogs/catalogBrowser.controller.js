/*eslint global-strict:0 */
'use strict';

module.exports = ['$scope', '$rootScope', 'bcm.Catalog', function ($scope, $rootScope, Catalog) {
    $scope.url = '';
    $scope.login = '';
    $scope.pwd = '';
    $scope.services = [];

    Catalog.getCatalogs({}, function (response) {
        $scope.services = response;
    });

    $scope.run = function () {
        var postInfo = {
            url: this.url,
            login: this.login,
            pwd: this.pwd
        };

        Catalog.import(postInfo, function () {
            $scope.services = [];
            $scope.importStatus = 'start';
        });
    };

}];

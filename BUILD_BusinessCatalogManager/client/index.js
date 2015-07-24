/*eslint global-strict:0 */
'use strict';

require('norman-client-tp');

module.exports = angular.module('catalog', [])

    // @ngInject
    .config(function ($stateProvider) {
        $stateProvider
            .state('shell.admin.catalogs', {
                url: '/catalogs',
                templateUrl: 'resources/norman-business-catalog-manager-client/catalogs/catalogBrowser.html',
                controller: 'CatalogbrowserCtrl',
                authenticate: true
            });
    })
    .factory('bcm.Catalog', require('./services/catalog.service.js'))
    .controller('CatalogbrowserCtrl', require('./catalogs/catalogBrowser.controller.js'))
    // @ngInject
    .run(function () { });

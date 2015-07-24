'use strict';

module.exports = angular.module('docs.menu', [])
    .service('DocsMenuFactory', require('./menu.factory.js'))
    .controller('DocsMenuCtrl', require('./menu.controller.js'))
    .config(function($stateProvider) {
        $stateProvider
            .state('uielements.docs', {
                url: '/:id',
                templateProvider: function($log, $http, $templateCache, $state, $stateParams, DocsMenuFactory) {
                    var url = '/resources/angular-sap-ui-elements/docs/templates/';
                    if ($stateParams.id !== undefined && $stateParams.id !== '') {
                        url += $stateParams.id.toLowerCase() + '.html';
                    } else {
                        url = '/resources/angular-sap-ui-elements' + DocsMenuFactory.sections[0].url;
                    }
                    return $http.get(url, {
                        cache: $templateCache
                    }).then(function(response) {
                        return response.data;
                    });
                },
                params: {
                    id: null,
                    url: null
                },
                authenticate: false
            });
    });

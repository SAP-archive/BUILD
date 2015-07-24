'use strict';

module.exports = angular.module('project.document', [])
    .config(function ($stateProvider) {
        $stateProvider
            .state('shell.project.document', {
                url: '/document',
                templateUrl: 'resources/norman-projects-client/document/document.html',
                controller: 'DocumentCtrl',
                controllerAs: 'document',
                authenticate: true
            });
    })
    .controller('DocumentCtrl', require('./document.controller.js'));

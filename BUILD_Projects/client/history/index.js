'use strict';

module.exports = angular.module('project.history', [])
    .config(function ($stateProvider) {
        $stateProvider
            .state('shell.project.history', {
                url: '/historyService',
                templateUrl: 'resources/norman-projects-client/historyService/historyService.html',
                controller: 'ProjectHistoryCtrl',
                authenticate: true
            });
    })
    .directive('uiTimeLine', require('./timeline.directive'))
    .controller('ProjectHistoryCtrl', require('./history.controller.js'));

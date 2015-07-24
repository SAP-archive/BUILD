'use strict';

require('./userTile');

module.exports = angular.module('project.team', ['project.team.userTile'])

    .config(function ($stateProvider) {
        $stateProvider

            .state('shell.project.team', {
                url: '/team',
                templateUrl: 'resources/norman-projects-client/team/team.html',
                authenticate: true
            });
    })
    .controller('TeamCtrl', require('./team.controller.js'));

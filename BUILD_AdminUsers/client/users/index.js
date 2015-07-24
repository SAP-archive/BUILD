'use strict';
// Use Application configuration module to register a new module
module.exports = angular.module('users', ['shell', 'ui.router'])
    .config(function ($stateProvider) {
        $stateProvider.state('console.users', {
                url: '/users',
                templateUrl: './resources/norman-admin-users-client/users/users.html',
                controller: 'AdminUsersCtrl'
            });
    })
    .controller('AdminUsersCtrl', require('./users.controller.js'))
    .factory('AdminUsersService', require('./../services/users.service.js'))
    .run(function (AsideFactory, HomeDashboardFactory, NavBarService) {
        NavBarService.updateHeading('Admin Console');
        AsideFactory.push({
            state: 'console.users',
            priority: 3,
            name: 'Users',
            isPersistant: true
        });
    });

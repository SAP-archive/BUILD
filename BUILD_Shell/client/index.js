'use strict';

require('./globals');
require('./dashboard');
require('./projectLandingPage');
require('./aside');
require('./navbar');
require('./admin');

/**
 * @ngdoc module
 * @name shell
 * @description main module for the Shell. It is dependent on the shell Aside module and shell Navbar module
 */
module.exports = angular.module('shell', ['shell.aside', 'shell.navbar', 'shell.admin', 'shell.dashboard', 'shell.projectLandingPage'])
    .config(function ($stateProvider) {
        $stateProvider
            .state('shell', {
                url: '/norman',
                templateUrl: 'resources/norman-shell-client/dashboard/dashboard.html',
                controller: 'ShellDashboardCtrl',
                authenticate: true,
                aside: 'hideAnimate',
                navbar: 'hero'
            })
            .state('shell.admin', {
                url: '/admin',
                templateUrl: 'resources/norman-shell-client/admin/admin.html',
                controller: 'AdminCtrl',
                authenticate: true
            })
            .state('shell.project.prototype', {
                url: '/prototype',
                templateUrl: 'resources/norman-shell-client/projectLandingPage/projectLandingPage.html',
                controller: 'projectLandingPageCtrl',
                authenticate: true,
                navbar: 'hero',
                aside: 'showAnimate'

            })
            .state('console', {
                url: '/console',
                templateUrl: 'resources/norman-shell-client/dashboard/dashboard.html',
                controller: 'ShellDashboardCtrl',
                authenticate: true

            });
    })
    .controller('ShellDashboardCtrl', require('./dashboard/dashboard.controller.js'))
    .controller('AdminCtrl', require('./admin/admin.controller.js'))
    .run(function (AdminService, AsideFactory, Auth) {
        Auth.getSecurityConfig()
            .then(function (d) {
                var settings = d.settings;
                if (!(settings && settings.application && settings.application.admin === true)) {
                    AdminService.init();
                    AsideFactory.push({
                        state: 'shell',
                        priority: 1,
                        name: 'Home',
                        type: 'Home',
                        isPersistant: true,
                        clearCurrentProject: true
                    });
                    AsideFactory.push({
                        state: 'shell.project.prototype',
                        priority: 2,
                        name: 'Project',
                        type: 'project',
                        id: 'project'
                    });
                }
            });
    });

require('./directives');

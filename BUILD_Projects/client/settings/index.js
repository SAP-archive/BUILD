'use strict';
var _ = require('norman-client-tp').lodash;

module.exports = angular.module('project.settings', [])
    .config(function ($stateProvider) {
        $stateProvider

            .state('shell.project.settings', {
                url: '/settings',
                templateUrl: 'resources/norman-projects-client/settings/settings.html',
                controller: 'ProjectSettingsCtrl',
                controllerAs: 'settings',
                authenticate: true
            });
    }).run(function ($timeout, Auth, AsideFactory, ActiveProjectService, ProjectFactory, uiError) {
        if (ActiveProjectService.id) {
            if (!Auth.isLoggedIn()) {
                Auth.initCurrentUser();
            }
            Auth.isLoggedInAsync(function (isLoggedIn) {
                if (isLoggedIn) {
                    Auth.getCurrentUser().$promise
                        .then(function (user) {
                            var projectOwnerRole = _.find(user.acl_roles, function (role) {
                                return (role === 'owner-' + ActiveProjectService.id);
                            });
                            if (projectOwnerRole) {
                                AsideFactory.push({
                                    state: 'shell.project.settings',
                                    priority: 98,
                                    name: 'Settings'
                                });
                            }
                            else {
                                AsideFactory.pop('settings');

                            }
                        })
                        .catch(function (res) {
                            if (res.status === 403) {
                                AsideFactory.pop('settings');
                            }
                            else {
                                uiError.create({content: res.data.message, dismissOnTimeout: true});

                            }
                        });
                }
                else {
                    AsideFactory.pop('settings');
                }
            });
        }
    }).controller('ProjectSettingsCtrl', require('./settings.controller.js'));

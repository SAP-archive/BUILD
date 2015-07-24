'use strict';
var _ = require('norman-client-tp').lodash;

module.exports = angular.module('project.prototype', [])
    .constant('PrototypeConfig', require('./prototype.constants.js'))
    .controller('PrototypeCtrl', require('./prototype.controller.js'))
    .run(function ($state, $rootScope, Auth, AsideFactory, $location, ActiveProjectService, uiError) {
        // Handle the refresh case, there is no ActiveProjectService.id set
        if (!ActiveProjectService.id) {
            var pathegx = /^\/norman\/projects\/([0-9a-zA-Z]{1,})\//i;
            var path = $location.path();
            var match = pathegx.exec(path);
            if (match !== null) {
                var projectId = match[1] || null;
                // Dev-note: Removed double negation, http://eslint.org/docs/rules/no-extra-boolean-cast.html
                if (projectId) {
                    $rootScope.currentProject = projectId;
                    ActiveProjectService.id = projectId;
                }
            }
        }
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
    });

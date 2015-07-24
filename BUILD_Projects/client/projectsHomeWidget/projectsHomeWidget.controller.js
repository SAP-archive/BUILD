'use strict';
var _ = require('norman-client-tp').lodash;

// @ngInject
module.exports = function ($state, $rootScope, $timeout, $log, $window, AsideFactory, Auth, ProjectFactory, ActiveProjectService, NavBarService, uiError, $filter) {
    var that = this;

    this.init = function () {
        that.activeProjects = [];
        that.archivedProjects = [];
        that.inviteProjects = [];
        that.loading = true;
        that.preferences = {};

        // Setup user
        Auth.getCurrentUser().$promise
            .then(function (user) {
                that.user = user;
                that.canCreate = (user && user.acl_roles && user.acl_roles.indexOf('standard') !== -1);
            });
        Auth.getPreferences()
            .then(function (data) {
                that.preferences = data.preferences;
                if (!data.preferences.projectsHelp.disable) {
                    that.lucyBlockShow = true;
                }
            });
        that.showInvitation = false;
        that.showAllProjects = false;
        that.predicate = ['+isNew', '-stats.created_at'];
        that.newProject = {
            archived: false,
            isNew: true,
            name: '',
            stats: {}
        };
        that.numOfHidden = 0;
        that.isCreatingNewProject = false;
        that.openNewProject = false;

        // Get the list of projects
        ProjectFactory.query([]).$promise
            .then(function (res) {
                that.loading = false;
                handleQueryResponse(res);
                that.showInvitation = false;
            })
            .catch(function error(res) {
                that.loading = false;
                uiError.create({
                    content: res.data.error,
                    dismissOnTimeout: false
                });
            });
    };

    // Generic function to handle GET /api/projects
    function handleQueryResponse(res) {
        // Reset projects
        that.activeProjects.length = 0;
        that.archivedProjects.length = 0;
        that.inviteProjects.length = 0;

        if (!that.canCreate) {
            return;
        }

        var isInvite = false;

        res.forEach(function (project) {

            var owner = _.find(project.user_list, {
                role: 'owner'
            });
            if (owner && owner._id === that.user._id) {
                // Used to handle the settings navigation tab
                project.isOwner = true;
            }
            // Sorting user's list
            var orderBy = $filter('orderBy');
            project.user_list = orderBy(project.user_list, '+name', false);
            // 1. Handle collaboration projects, which are projects where you have accepted the invite and not archived
            project.user_list.forEach(function (entry) {
                if (entry._id === that.user._id && !project.isOwner && !project.archived) {
                    that.activeProjects.push(project);
                }
            });

            // 2. Handle invites, these are outstanding invites which have not been accepted yet
            project.invite_list.forEach(function (entry) {
                if (entry.email === that.user.email) {
                    that.inviteProjects.push(project);
                }
            });

            if (that.inviteProjects.length) {
                if (!isInvite) {
                    isInvite = true;
                }
            }

            // 3. Handle projects owned by the user and which are not archived
            if (!project.archived && project.isOwner) {
                that.activeProjects.push(project);
            }

            // 4. Track archived projects
            if (project.archived) {
                that.archivedProjects.push(project);
            }
        });

        if (isInvite) {
            that.showInvitation = true;
        } else {
            that.showInvitation = false;
        }

    }

    this.invitesSort = function (/**Event*/) {
    };

    this.showNewProjectForm = function () {
        if (that.isCreatingNewProject) {
            return;
        }
        that.activeProjects.unshift(angular.extend({}, that.newProject));
        that.isCreatingNewProject = true;
    };

    this.cancelNewProject = function () {
        if (!that.isCreatingNewProject) {
            return;
        }
        that.activeProjects.shift();
        that.isCreatingNewProject = false;
        // Stop propagation to ensure not to open project
        angular.element(document.getElementsByClassName('project-widget')[0]).unbind('click');
        event.stopPropagation();
    };

    this.createProject = function () {
        var newProject = that.activeProjects[0];
        Auth.getPreferences()
            .then(function (data) {
              that.preferences = data.preferences;
              that.preferences.projectsHelp.disable = true;
              Auth.updatePreferences(that.preferences);
              that.lucyBlockShow = false;
            });
        if (newProject.name && newProject.name.trim().length > 0) {
            // This has to be set in order to show latest project before result returns
            newProject.created_by = that.user._id;
            newProject.isOwner = true;

            ProjectFactory.save(newProject).$promise
                .then(function (res) {
                    newProject._id = res._id;
                    delete newProject.isNew;
                    if (that.openNewProject === true) {
                        that.openProject(newProject._id, newProject.name, newProject.isOwner);
                        that.openNewProject = false;
                    }
                })
                .catch(function (res) {
                    uiError.create({
                        content: res.data.error,
                        dismissOnTimeout: false
                    });
                });

            // need to create this user_list to make sure that the user icon appears on the newly created project tile
            newProject.user_list = [{
                _id: that.user._id,
                email: that.user.email
            }];
            that.isCreatingNewProject = false;
        }
    };

    this.openProject = function (projectId, projectName, isOwner) {
        if (that.isCreatingNewProject === true) {
            if (typeof projectName !== 'undefined' && projectName.trim().length > 0) {
                that.openNewProject = true;
                that.createProject();
            }
            else {
                return;
            }
        }
        if (typeof projectId === 'undefined') {
            return;
        }

        $rootScope.currentProject = projectId;
        ActiveProjectService.id = projectId;
        NavBarService.updateHeading(projectName);

        // Add/Remove "settings" before we update 'shell.aside.updated'
        if (isOwner) {
            AsideFactory.push({
                state: 'shell.project.settings',
                priority: 98,
                name: 'Settings'
            });
        }
        else {
            AsideFactory.pop('settings');
        }
        // we navigate to the new project page. if the feature is disable, then the prototype widget is not injected so we will not see it.
        $rootScope.$broadcast('shell.aside.updated', {
            menuSelected: 'prototype'
        });
        $state.go('shell.project.prototype', {
            currentProject: projectId
        });
    };

    this.refreshProjects = function () {
        ProjectFactory.query([]).$promise
            .then(function (res) {
                handleQueryResponse(res);
                AsideFactory.pop('settings');
            })
            .catch(function (res) {
                uiError.create({
                    content: res.data.error,
                    dismissOnTimeout: false
                });
            });
    };

    this.acceptProject = function (projectId) {
        ProjectFactory.acceptInvite({
                _id: projectId
            }).$promise
            .then(function () {
                that.refreshProjects();
            }).catch(function (res) {
                uiError.create({
                    content: res.data.error,
                    dismissOnTimeout: false
                });
            });
    };

    this.rejectProject = function (projectId) {
        ProjectFactory.rejectInvite({}, {
                _id: projectId
            }).$promise
            .then(function () {
                that.refreshProjects();
            }).catch(function (res) {
                uiError.create({
                    content: res.data.error,
                    dismissOnTimeout: false
                });
            });
    };
    that.init();
};

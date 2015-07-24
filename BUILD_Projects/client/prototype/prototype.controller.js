'use strict';
var _ = require('norman-client-tp').lodash;

// Controller for page showing an individual project
// @ngInject
module.exports = function ($state, $rootScope, $log, Auth, npPrototype, uiError, AsideFactory, ProjectFactory, ActiveProjectService, PrototypeConfig, httpError) {

    var that = this;
    that.screens = [];
    that.currentProject = $state.params.currentProject;
    this.showAllPages = false;
    this.numOfHidden = 0;

    npPrototype.getPrototype()
            .then(function (res) {
                that.screens = res.pages;
            }, function (res) {
                httpError.create({
                    req: res,
                    content: 'Error: retrieving prototype failed',
                    dismissOnTimeout: false
                });
            });

    // Setup user
    Auth.getCurrentUser().$promise
            .then(function (response) {
                that.user = response;

                npPrototype.getPrototypeLockStatus()
                        .then(function (res) {
                            var prototypeLockUserId = res.userId;
                            that.prototypeLocked = res.exists && !res.sameSession;

                            if (that.prototypeLocked) {
                                ProjectFactory.getTeam({
                                    id: ActiveProjectService.id
                                }).$promise
                                        .then(function (projectResponse) {
                                            that.prototypeLockUser = _.find(projectResponse.user_list, function (user) {
                                                return user.user_id === prototypeLockUserId;
                                            });
                                        }).catch(function (error) {
                                            uiError.create({
                                                content: error.data.error,
                                                dismissOnTimeout: false
                                            });
                                        });
                            }
                        }, function () {
                            uiError.create({
                                content: 'Error: retrieving prototype lock status failed',
                                dismissOnTimeout: false
                            });
                        });
            });

    that.artifactBaseUrl = '/api/projects/' + that.currentProject + '/prototype/artifact/';

    this.reset = function () {
        $rootScope.$broadcast('shell.aside.updated');
    };

    this.openPageMapView = function () {
        $state.go('shell.page-map-view', {
            currentProject: that.currentProject
        });
    };

    this.stateGoComposer = function (page) {
        $state.go('shell.ui-composer', {
            currentProject: that.currentProject,
            currentScreen: page
        });
    };

    this.openComposer = function (page) {
        npPrototype.setPrototypeViewModeData({prototypeViewMode: false});
        this.stateGoComposer(page);
    };

    this.openComposerInViewMode = function () {
        npPrototype.setPrototypeViewModeData({
            prototypeViewMode: true,
            prototypeViewModeAvatar: {
                name: that.prototypeLockUser.name || that.prototypeLockUser.email,
                image: that.prototypeLockUser.avatar_url
            }
        });
        this.stateGoComposer(PrototypeConfig.settings.defaultPage);
    };

    this.openDataModelView = function () {
        $state.go('shell.models', {
            currentProject: that.currentProject
        });
    };

    this.openPageFlowView = function () {
        $state.go('shell.pageFlow', {
            currentProject: that.currentProject
        });
    };

};

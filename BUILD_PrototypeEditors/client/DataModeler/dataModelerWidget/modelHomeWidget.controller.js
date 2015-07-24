'use strict';
var _ = require('norman-client-tp').lodash;

// Controller for page showing an individual project
// @ngInject
module.exports = function ($q, $state, $rootScope, $log, Auth, npPrototype, uiError, AsideFactory, ProjectFactory, ActiveProjectService) {

    var that = this;
    that.currentProject = $state.params.currentProject;
    that.dataModelerEnabled = true;

    npPrototype.getPrototype()
        .then(function (prototype) {
            that.dataModelerEnabled = !prototype.pages || prototype.pages.length === 0 || prototype.isSmartApp;
        })
        .catch(function () {
            uiError.create({
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

    this.reset = function () {
        $rootScope.$broadcast('shell.aside.updated');
    };


    this.openDataModelView = function () {
        $state.go('shell.models', {
            currentProject: that.currentProject
        });
    };
};

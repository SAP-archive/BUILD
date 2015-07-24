'use strict';
/**
 * @ngdoc Admin service
 * @description A factory used to populate the Admin section
 * @param $rootScope
 * @returns {{push: Function}}
 */
// @ngInject
module.exports = function ($rootScope, $log, Auth, AsideFactory) {
    var self = this, states = {};

    self.items = [];

    self.push = function (item) {
        // Check if not already added
        if (states[item.state]) {
            return $log.warn('admin.service: state ' + item.state + ' already added!');
        }
        states[item.state] = true;
        self.items.push(item);
        self.items.sort(function (a, b) {
            return a.priority - b.priority;
        });
    };

    self.updateAside = function () {
        var currentUser = Auth.getCurrentUser().$promise;
        if (!currentUser) return;
        currentUser.then(function (user) {
            if (!user.acl_roles || user.acl_roles.indexOf('admin') === -1) return;
            AsideFactory.push({
                name: 'Admin',
                state: 'shell.admin',
                root: 'shell.admin',
                priority: 99,
                isPersistant: true
            });
        });
    };


    self.init = function () {
        $rootScope.$on('$stateChangeStart', self.updateAside);
        self.updateAside();
    };

};

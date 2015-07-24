'use strict';

module.exports = angular.module('shell.dashboard', [])
    .service('HomeDashboardFactory', require('./dashboard.service.js'))
    .controller('ShellDashboardCtrl', require('./dashboard.controller.js'));

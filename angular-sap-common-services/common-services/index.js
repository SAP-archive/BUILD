'use strict';

module.exports = angular.module('common.services', ['ngResource', 'ngCookies'])
    .factory('UserService', require('./user.service.js'))
    .factory('uiCommandManager', require('./command-manager.service.js'));

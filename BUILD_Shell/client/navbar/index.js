'use strict';

module.exports = angular.module('shell.navbar', [])
    .service('NavBarService', require('./navbar.service.js'))
    .controller('NavBarCtrl', require('./navbar.controller.js'));

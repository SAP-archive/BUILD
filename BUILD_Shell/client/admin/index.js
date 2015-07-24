'use strict';

module.exports = angular.module('shell.admin', [])
    .service('AdminService', require('./admin.service.js'))
    .controller('AdminCtrl', require('./admin.controller.js'));

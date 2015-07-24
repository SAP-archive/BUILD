'use strict';

module.exports = angular.module('shell.projectLandingPage', [])
    .service('projectLandingPageService', require('./projectLandingPage.service.js'))
    .controller('projectLandingPageCtrl', require('./projectLandingPage.controller.js'));

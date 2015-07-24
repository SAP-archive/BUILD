'use strict';

/**
 * @ngdoc module
 * @name projects.services
 * @description projects module to handle project related functions. Dependent on the dashboard, prototype modules.
 */
module.exports = angular.module('project.services', [])
    .factory('ProjectFactory', require('./project.service.js'))
    .factory('HistoryService', require('./history.service.js'))
    .factory('ActiveProjectService', require('./activeProject.service.js'));

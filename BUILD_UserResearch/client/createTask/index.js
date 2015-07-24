'use strict';

angular.module('UserResearch')
    .factory('Tasks', require('./service'))
    .controller('CreateTaskCtrl', require('./controller.js'))
    .factory('TaskCreator', require('./taskCreator.js'));

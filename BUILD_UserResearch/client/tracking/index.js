'use strict';

angular.module('UserResearch')
    .factory('TrackingService', require('./service'))
    .directive('tracker', require('./tracker.directive.js'));

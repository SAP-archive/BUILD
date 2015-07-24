'use strict';

angular.module('UserResearch')

    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('errorInterceptor');
    })
    .factory('errorInterceptor', require('./interceptor.js'));

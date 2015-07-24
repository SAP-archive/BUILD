'use strict';

angular.module('model')
    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('modelErrorInterceptor');
    })
    .factory('modelErrorInterceptor', require('./interceptor.js'));

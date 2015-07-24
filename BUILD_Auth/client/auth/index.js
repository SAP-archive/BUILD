'use strict';

angular.module('account.auth', ['ngResource', 'ngCookies'])

    .config(function ($httpProvider) {
        $httpProvider.interceptors.push('authInterceptor');
    })

    .factory('authInterceptor', require('./auth.interceptor.js'))
    .factory('Auth', require('./auth.service.js'))
    .factory('User', require('./user.service.js'));

'use strict';
// Use Application configuration module to register a new module

module.exports = angular.module('landing', [])
    .config(function ($stateProvider) {
        $stateProvider
            .state('welcome', {
                url: '/',
                templateUrl: 'welcome/welcome.html'
            });
    })
    .controller('WelcomeNavbarCtrl', require('./navbar.controller.js'));

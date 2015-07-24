'use strict';

module.exports = angular.module('account.signup', ['ui.router'])
    .config(function ($stateProvider) {
        $stateProvider
            .state('signup', {
                url: '/signup',
                templateUrl: './resources/norman-auth-client/signup/signup.html',
                controller: 'SignupCtrl'
            });
    })
    .controller('SignupCtrl', require('./signup.controller'))
    .directive('additionalEmailValidation', require('../email/emailVerification.directive'));

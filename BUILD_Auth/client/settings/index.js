'use strict';

require('../passwordPolicy');

module.exports = angular.module('account.settings', ['ui.router', 'account.passwordpolicy'])

.config(function ($stateProvider) {
        $stateProvider
            .state('shell.settings.timezone', {
                url: '/timezone',
                templateUrl: './resources/norman-auth-client/profile/user-timezone.html',
                controller: 'SettingsCtrl',
                authenticate: true
            })
            .state('shell.settings.email-notifications', {
                url: '/email-notifications',
                templateUrl: './resources/norman-auth-client/profile/email-notifications.html',
                controller: 'SettingsCtrl',
                authenticate: true
            }).state('shell.settings.verify-email', {
                url: '/verify-email',
                templateUrl: './resources/norman-auth-client/profile/verify-email.html',
                controller: 'SettingsCtrl',
                authenticate: true
            });
    })
    .controller('SettingsCtrl', require('./settings.controller'))
    .directive('additionalEmailValidation', require('../email/emailVerification.directive'))
    .directive('settingsDialogOpen', require('./settings-open.directive'))
    .directive('settingsDialog', require('./settings.directive'));

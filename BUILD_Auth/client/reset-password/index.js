'use strict';

module.exports = angular.module('account.reset-password', [])
    .config(function ($stateProvider) {
        $stateProvider.state('reset-password', {
            url: '/reset-password/:id',
            templateUrl: './resources/norman-auth-client/reset-password/reset-password.html',
            authenticate: false,
             resolve: {
                ResetPasswordTokenValidation: function ($stateParams, Auth) {
                   return Auth.resetPasswordTokenValidation($stateParams.id);
                }
            },
            controller: 'ResetPasswordCtrl'
        });
    })
    .directive('uiPasswordMatch', require('./password-match.directive'))
    .controller('ResetPasswordCtrl', require('./reset-password.controller'));

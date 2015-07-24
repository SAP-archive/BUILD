'use strict';

module.exports = angular.module('account.verifyEmail', [])
	.config(function ($stateProvider) {
		$stateProvider.state('verifyemail', {
			url: '/verifyemail/:id',
			templateUrl: './resources/norman-auth-client/verifyEmail/verifyEmail.html',
            authenticate: true,
             resolve: {
                EmailVerification: function ($stateParams, Auth) {
                    return Auth.verifyEmail($stateParams.id);
                }
            },
			controller: 'VerifyEmailCtrl'
		});
	})
	.controller('VerifyEmailCtrl', require('./verifyEmail.controller'));

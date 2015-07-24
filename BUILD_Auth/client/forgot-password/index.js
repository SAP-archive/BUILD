'use strict';

module.exports = angular.module('account.forgot-password', [])
	.config(function ($stateProvider) {
		$stateProvider.state('forgot-password', {
			url: '/forgot-password',
			templateUrl: './resources/norman-auth-client/forgot-password/forgot-password.html',
			controller: 'ForgotPasswordCtrl',
			authenticate: false
		});
	})
	.controller('ForgotPasswordCtrl', require('./forgot-password.controller'));

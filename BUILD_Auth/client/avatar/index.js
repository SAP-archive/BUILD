'use strict';

module.exports = angular.module('account.avatar', [])
	.config(function ($stateProvider) {
		$stateProvider.state('shell.settings.picture', {
			url: '/picture',
			templateUrl: './resources/norman-auth-client/avatar/avatar.html',
			controller: 'AvatarCtrl',
            authenticate: true
		});
	})
	.controller('AvatarCtrl', require('./avatar.controller'));

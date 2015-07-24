'use strict';

// Require dependencies after angular and before all the aother modules
require('angular');

var aModule = angular.module, modules = [], dependencies = [];
angular.module = function (name, dep) {
	if (dep) {
		if (name !== 'norman' && dependencies.indexOf(name) === -1) {
			modules.push(name);
		}
		dependencies = dependencies.concat(dep);
	}
	return aModule(name, dep);
};

require('angular-cookies');
require('angular-resource');
require('angular-sanitize');
require('angular-ui-router');

// Require optional modules
require('./requires.js');

// display angular errors using source-maps
angular.module('source-map-exception-handler', [])
	.config(function ($provide) {
		$provide.decorator('$exceptionHandler', function ($delegate) {
			return function (exception, cause) {
				$delegate(exception, cause);
				throw exception;
			};
		});
	});

angular.module('norman', modules)
	.config(function ($urlRouterProvider, $locationProvider) {
		$urlRouterProvider.otherwise('/norman');
		$locationProvider.html5Mode(true);
	})
	.controller('appCtrl', function ($scope, Auth, NavBarService, AsideFactory) {


		/*** FOR TESTING THE SHELL ONLY ***********************************************************/
		$scope.isLogged = false;
		$scope.navbarService = NavBarService;
		$scope.asideService = AsideFactory;

		$scope.checkAuth = function () {
			Auth.isLoggedInAsync(function (isLogged) {
				$scope.isLogged = isLogged;
			});
		};

		$scope.toggleAside = function () {
			if ($scope.asideService.hidden) $scope.asideService.show();
			else $scope.asideService.hide();
		};

		$scope.toggleNavBar = function () {
			if ($scope.navbarService.hidden) $scope.navbarService.show();
			else $scope.navbarService.hide();
		};

		$scope.$on('$stateChangeStart', function () {
			$scope.checkAuth();
		});
		/******************************************************************************************/


	})
	// add state name as a class to the body
	.run(function ($rootScope) {
		$rootScope.$on('$stateChangeStart', function (ev, toState) {
			$rootScope.pageClass = 'page-' + toState.name;
		});
	});

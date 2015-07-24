'use strict';

module.exports = angular.module('Previewer', ['ui.router'])

	.config(['$stateProvider', function ($stateProvider) {
		$stateProvider
			.state('shell.Previewer', {
				url: '/Previewer',
				templateUrl: 'node_modules/norman-prototype-editors-client/Previewer/Previewer.html',
				controller: 'PreviewerCtrl',
                authenticate: false
			});
	}])
    // .run(function ($rootScope, AsideFactory) {
    //     /**
    //      * Update the side bar with the new projects tab
    //      */
    //     AsideFactory.push({
    //         'state': 'norman.generator-tests',
    //         'priority': 1,
    //         'icon': 'fa-th-large',
    //         'name': 'generator-tests'
    //     });
    // })
	.controller('PreviewerCtrl', require('./Previewer.controller.js'));

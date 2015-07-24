'use strict';

module.exports = angular.module('UICatalogManager', ['ui.router', 'angular.filter'])

.config(function($stateProvider) {
        $stateProvider
            .state('console.uicatalogmanager', {
                url: '/UICatalogManager',
                templateUrl: 'resources/norman-ui-catalog-manager-client/catalogs/UICatalogManager.html',
                controller: 'UICatalogManagerCtrl',
                authenticate: true
            });
    })
    .factory('ucm.UICatalog', require('./services/uicatalog.service.js'))
    .directive('iframeOnload', require('./catalogs/metadataIframe.directive.js'))
    .controller('UICatalogManagerCtrl', require('./catalogs/UICatalogManager.controller.js'))
    .run(['$rootScope', '$state','AsideFactory','Auth','featureToggle',function($rootScope, $state, AsideFactory, Auth, featureToggle) {
    	$rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
		// If the state is uicatalog/users, check if the uicatalog client has to be enabled or disabled
		if(toState.name === 'console.uicatalogmanager' || toState.name === 'console.users'){
			featureToggle.isEnabled('disable-ui-catalog-manager-client').then(function(uicatalogToggle){
				// if uicatalog is disabled do not push data into AsideFactory and prevent navigation to access
				// uicatalogmanager and redirect to defualt or first tab in admin console.
				if (uicatalogToggle) {
					var hasCatalogState=false;
					if(AsideFactory.hasOwnProperty('menuItems')){
						for(var count in AsideFactory.menuItems){
							if(AsideFactory.menuItems[count].hasOwnProperty('state') && AsideFactory.menuItems[count].state==='console.uicatalogmanager'){
								hasCatalogState=true;
								break;
							}
						}
					}
					// only if AsideFactory does not have the state as 'uicatalog'
					if(!hasCatalogState){
						Auth.getSecurityConfig()
						.then(function(config) {
							var settings = config.settings;
							if (settings && settings.application && settings.application.admin === true) {
								AsideFactory.push({
									state: 'console.uicatalogmanager',
									name: 'UI Catalog',
									type: 'uicatalog',
									isPersistant: true
								});
							}
						});
					}
				} else {
					// when the state is uicatalog and it is disabled, redirect to console.users, prevent access to this route directly
					if (toState.name === 'console.uicatalogmanager') {
						event.preventDefault();
						$state.go('console.users', toParams);
					}
				}
			});
		}
    	});
    	}]);
require('norman-client-tp');
require('angular-filter');

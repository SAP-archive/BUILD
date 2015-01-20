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
        $urlRouterProvider.otherwise('/');
        $locationProvider.html5Mode(true);
    })
    .run(function ($rootScope, $location, NavBarService, AsideService) {
        $rootScope.navbarService = NavBarService;
        $rootScope.asideService = AsideService;

        // add state name as a class to the body
        $rootScope.$on('$stateChangeStart', function (ev, toState) {
            // add state name to body class
            $rootScope.pageClass = 'page-' + toState.name;

            // redirect (aka deep-link)
            var path = $location.path().substr(1), redirect = $rootScope.redirect;
            if (redirect && path !== 'login' && path !== 'signup') {
                delete $rootScope.redirect;
                $location.path(redirect);
            }
        });

    })
    .constant('jQuery', require('norman-jquery'));

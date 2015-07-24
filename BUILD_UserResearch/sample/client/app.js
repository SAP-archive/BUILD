'use strict';

var modules = require('norman-client-tp');

// Require norman modules
require('./requires.js');


angular.module('norman', modules.modules)

    .config(function ($urlRouterProvider, $locationProvider) {
        $urlRouterProvider.otherwise('/norman');
        $locationProvider.html5Mode(true);
    })
    .run(function ($rootScope, NavBarService, AsideFactory) {
        $rootScope.navbarService = NavBarService;
        $rootScope.asideService = AsideFactory;

        $rootScope.$on('$stateChangeStart', function (ev, toState) {
            $rootScope.pageClass = 'page-' + toState.name.replace(/\./g, '-');
        });
    })
    .constant('jQuery', modules.jquery);

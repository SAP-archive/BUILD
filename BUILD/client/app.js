'use strict';

var modules = require('norman-client-tp').modules;

// Require optional modules
require('./requires.js');

angular.module('norman', modules)
    .config(function ($urlRouterProvider, $locationProvider, $httpProvider) {
        $urlRouterProvider.otherwise('/');
        $locationProvider.html5Mode(true);
        $httpProvider.defaults.xsrfCookieName = 'X-CSRF-Token';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRF-Token';
    })
    .run(function ($rootScope, $location, NavBarService, AsideFactory, Auth) {
        $rootScope.navbarService = NavBarService;
        $rootScope.asideService = AsideFactory;

        $rootScope.$on('$stateChangeStart', function (ev, toState) {
            // If the current user is not already initialize, will try to do it
            Auth.initCurrentUser();

            $rootScope.pageClass = 'page-' + toState.name.replace(/\./g, '-');

            var path = $location.path().substr(1);
            Auth.isLoggedInAsync(function (loggedIn) {
                Auth.getSecurityConfig()
                    .then(function (d) {
                        if (toState.authenticate && !loggedIn) {
                            $rootScope.redirect = $location.url();
                            if (d && d.settings && d.settings.provider && d.settings.provider.local === false) {
                                $location.path('/norman');
                            }
                            else {
                                $location.path('/login');
                            }
                        }
                        else {
                            var settings = d.settings;
                            path = $location.path().substr(1);
                            if (path === 'signup' && settings && settings.registration && settings.registration.self === false) {
                                $location.path('/');
                            }
                            if (path === 'login' && settings && settings.provider && settings.provider.local === false) {
                                $location.path('/');
                            }
                        }
                        return d;
                    })
                    .then(function (d) {
                        if (toState.authenticate && !loggedIn) {
                            path = $location.path().substr(1);
                            var settings = d.settings;
                            if (path === 'signup' && settings && settings.registration && settings.registration.self === false) {
                                $location.path('/');
                            }
                            if (path === 'login' && settings && settings.provider && settings.provider.local === false) {
                                $location.path('/');
                            }
                        }
                    }).then(function () {
                        // add state name to body class
                        // $rootScope.pageClass = 'page-' + toState.name.replace(/\./g, '-');
                        var redirect = $rootScope.redirect;
                        if (redirect && path !== 'login' && path !== 'signup') {
                            delete $rootScope.redirect;
                            $location.path(redirect);
                        }
                    });
            });
        });
    })
    .constant('jQuery', require('norman-client-tp').jquery);

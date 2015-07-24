'use strict';
/* eslint global-strict:0 */
var modules = require('norman-client-tp').modules;

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

angular.module('admin', modules)
    .config(function ($urlRouterProvider, $locationProvider, $httpProvider, $stateProvider) {
        $stateProvider.state('console.root', { url: '/'});
        $urlRouterProvider.otherwise('/console/users');
        $locationProvider.html5Mode(true);
        $httpProvider.defaults.xsrfCookieName = 'X-CSRF-Token';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRF-Token';
    })
    .run(function ($state, $rootScope, NavBarService, AsideFactory, Auth) {
        $rootScope.navbarService = NavBarService;
        $rootScope.asideService = AsideFactory;

        // add state name as a class to the body
        $rootScope.$on('$stateChangeStart', function (event, toState) {
           var redirectToState = function (stateName) {
                if (stateName && toState.name !== stateName) {
                    event.preventDefault();
                    $state.go(stateName);
                }
            };
            Auth.initCurrentUser();
            Auth.isLoggedInAsync(function (loggedIn) {
                Auth.getSecurityConfig()
                    .then(function (config) {
                        var newStateName;
                        if (!loggedIn) {
                            if (toState.name !== 'privacystatement' && toState.name !== 'tos') {
                                if (config && config.settings && config.settings.provider && config.settings.provider.local === false) {
                                    newStateName = 'console.users';
                                }
                                else {
                                    newStateName = 'login';
                                }
                            }
                        }
                        $rootScope.pageClass = 'page-' + toState.name.replace(/\./g, '-');
                        if (toState.name === 'console.root' || toState.name === 'console') {
                            newStateName = 'console.users';
                        }
                        redirectToState(newStateName);
                    })
                    .catch(function () {
                        redirectToState('login');
                    });
            });
        });

    })
    .constant('jQuery', require('norman-client-tp').jquery);

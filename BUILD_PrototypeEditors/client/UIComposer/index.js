'use strict';

require('./polyfills.js');
require('./mixins.js');
require('./services');
require('./directives');
require('./ui-editor');
require('./page-map-view');
require('./technology-helpers');

module.exports = angular.module('uiComposer', [
        'ui.router',
        'ngResource',
        'angularFileUpload',
        'uiComposer.services',
        'uiComposer.directives',
        'uiComposer.uiEditor',
        'uiComposer.uiCanvas',
        'pageMapView',
        'uiComposer.technologyHelpers'
    ])
    .config(['$provide', '$stateProvider', '$resourceProvider', '$locationProvider',
        function uiComposerConfig($provide, $stateProvider, $resourceProvider, $locationProvider) {
            $provide.decorator('$location', function ($delegate, $rootScope) {
                var skipping = false;

                $rootScope.$on('$locationChangeSuccess', function (event) {
                    if (skipping) {
                        event.preventDefault();
                        skipping = false;
                    }
                });

                $delegate.skipReload = function () {
                    skipping = true;
                    return this;
                };

                return $delegate;
            });

            var lockPrototypeResolver = {
                prototypeLock: ['npPrototype', function (npPrototype) {
                    return npPrototype.lockPrototype();
                }]
            };

            var lockPrototypeOnEnter = ['$state', '$stateParams', '$timeout', 'prototypeLock', 'npPrototype',
                function ($state, $stateParams, $timeout, prototypeLock, npPrototype) {
                    if (!prototypeLock.success) {
                        var prototpyeViewModeData = npPrototype.getPrototypeViewModeData();
                        if (!angular.isDefined(prototpyeViewModeData) || !prototpyeViewModeData.prototypeViewMode) {
                            // TODO: $timeout wrapping is needed as a workaround to get the $state.go to work properly within onEnter. This is a known $stateProvider issue. Not sure if it will ever be fixed.
                            $timeout(function () {
                                $state.go('shell.project.prototype', {
                                    currentProject: $stateParams.currentProject
                                });
                            });
                        }
                    }
                }
            ];

            var unlockPrototypeOnExit = ['npConcurrentAccessHelper',
                function (npConcurrentAccessHelper) {
                    npConcurrentAccessHelper.handleUnlock();
                }
            ];

            $stateProvider
                .state('prototype-editor', {
                    parent: 'shell.project',
                    abstract: true,
                    template: '<ui-view></ui-view>',
                    authenticate: true,
                    resolve: lockPrototypeResolver,
                    onEnter: lockPrototypeOnEnter,
                    onExit: unlockPrototypeOnExit
                })
                // TODO remove once other modules were updated. These states are deprecated.
                .state('shell.ui-composer', {
                    url: '/projects/{currentProject}/ui-composer/{currentScreen}'
                })
                .state('shell.page-map-view', {
                    url: '/projects/{currentProject}/ui-composer/{currentScreen}'
                });

            // Don't strip trailing slashes from calculated URLs
            $resourceProvider.defaults.stripTrailingSlashes = false;

            $locationProvider.html5Mode(true);
        }
    ])
    .run(['$rootScope', '$state', '$log', 'npEnter', 'featureToggle',
        function ($rootScope, $state, $log, npEnter, featureToggleProvider) {
            var rerouteDepricatedStates = function (event, toState, toParams) {
                if (toState.name === 'shell.ui-composer' || toState.name === 'shell.page-map-view') {
                    $log.warn('Using deprecated state ', toState.name, '. Please update to \'ui-composer\'/\'page-map-view\' without the \'shell.\'.');
                    event.preventDefault();
                    $state.go(toState.name.substr(6), toParams);
                }
            };

            var checkFeatureEnabled = function (toState) {
                // If prototype is disable with feature toggle then go back to the welcome page
                featureToggleProvider.isEnabled('disable-prototype')
                    .then(function (value) {
                        if (value) {
                            if (toState.name === 'ui-composer' || toState.name === 'page-map-view') {
                                event.preventDefault();
                                $state.go('welcome');
                            }
                        }
                    });
            };

            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState) {
                rerouteDepricatedStates(event, toState, toParams);
                checkFeatureEnabled(toState);
                npEnter.checkEnter(toState.name, fromState.name);
            });
        }
    ]);

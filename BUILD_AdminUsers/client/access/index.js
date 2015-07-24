'use strict';

module.exports = angular.module('access', ['shell', 'ui.router'])
    .constant('ADMIN_ACCESS_CONSTANT', {
        PROJECT_INVITATION: {
            COLLABORATOR: 'collaborator',
            NONE: 'none'
        },
        SELF_REGISTRATION: {
           STANDARD: 'standard',
           GUEST: 'guest',
           NONE: 'none'
        },
        ACCESS_LEVEL: {
           LEVEL_0: 'level0',
           LEVEL_1: 'level1',
           LEVEL_2: 'level2',
           LEVEL_3: 'level3',
           LEVEL_4: 'level4',
           LEVEL_5: 'level5'
        }

    })
    .config(function ($stateProvider) {
        $stateProvider.state('console.access', {
            url: '/access',
            templateUrl: './resources/norman-admin-users-client/access/access.html',
            controller: 'AdminAccessCtrl'
        });
    })
    .controller('AdminAccessCtrl', require('./access.controller.js'))
    .factory('AdminAccessService', require('./../services/access.service.js'))
    .filter('accessDomainFilter', require('./filters/access-domain.filter.js'))
    .filter('accessLevelNameFilter', require('./filters/access-level-name.filter.js'))
    .filter('accessLevelDescriptionFilter', require('./filters/access-level-description.filter.js'))
    .provider('accessLevelProvider', require('./providers/access-level.provider.js'))
    .directive('accessDuplicated', require('./directives/access-duplicated.directive.js'))
    .directive('accessLevelRestricted', ['accessLevelProvider', require('./directives/access-level-restricted.directive.js')])
    .directive('accessShowError', require('./directives/access-show-error.directive.js'))
    .directive('accessAutoFocus', require('./directives/access-autofocus.directive.js'))
    .run(function ($rootScope, ADMIN_ACCESS_CONSTANT, AsideFactory) {
       $rootScope.ADMIN_ACCESS_CONSTANT = ADMIN_ACCESS_CONSTANT;
        AsideFactory.push({
            state: 'console.access',
            priority: 5,
            name: 'Access',
            isPersistant: true
        });
    });

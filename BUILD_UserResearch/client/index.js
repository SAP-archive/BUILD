'use strict';

require('angular-filter');
module.exports = angular.module('UserResearch', ['ui.router', 'angular.filter'])
    .constant('SENTIMENT', {
        NONE: 0,
        HAPPY: 1,
        SAD: 2,
        NEUTRAL: 3
    })
    // @ngInject
    .config(function ($stateProvider) {
        $stateProvider

            .state('shell.project.UserResearch', {
            abstract: true,
            url: '/research',
            templateUrl: 'resources/norman-user-research-client/UserResearch.html',
            controller: 'UserResearchCtrl',
            authenticate: false
        });
    })
    // @ngInject
    .run(function ($rootScope, AsideFactory, HomeDashboardFactory, projectLandingPageService) {
        /**
         * Update the side bar with the new projects tab
         */
        AsideFactory.push({
            state: 'shell.project.UserResearch.list',
            root: 'shell.project.UserResearch',
            priority: 3,
            name: 'Research',
            id: 'research'
        });

        // the study list widget is now injected in landing page
        projectLandingPageService.push({
            template: 'resources/norman-user-research-client/study/list/studyListWidget.html',
            priority: 3

        });

        HomeDashboardFactory.push({
            priority: 2,
            template: 'resources/norman-user-research-client/studyHomeWidget/studyHomeWidget.html'
        });
    })

.controller('UserResearchCtrl', require('./UserResearch.controller.js'));


require('./utils');
require('./directives');
require('./interceptor');
require('./participant');
require('./questions');
require('./review');
require('./selectAssets');
require('./createTask');
require('./tracking');
require('./study');
require('./studyHomeWidget');

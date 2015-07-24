'use strict';

require('./prototype');
require('./team');
require('./settings');
require('./document');
require('./services');
require('./history');
require('./projectsHomeWidget');

/**
 * @ngdoc module
 * @name projects
 * @description projects module to handle project related functions. Dependent on the homeWidget, prototype modules.
 */
module.exports = angular.module('project', [
    'project.services',
    'project.prototype',
    'project.team',
    'project.document',
    'project.projectsHomeWidget'
])
    .config(function ($stateProvider) {
        $stateProvider
            .state('shell.project', {
                abstract: true,
                url: '/projects/{currentProject}',
                template: '<ui-view/>'
            });
    })
    .run(function ($injector, AsideFactory, HomeDashboardFactory, projectLandingPageService, featureToggle) {
        /**
         * Inject the prototype in the project landing page if feature toggle is ok and the service is available
         * Dev-note: run() is executed after the injector is created and is used to kickstart the application
         * Dev-note: even though the service might be toggled, there are situations i.e. in the local module where the
         * npPrototype service is not available at runtime
         */
        featureToggle.isEnabled('disable-prototype').then(function (prototypeDisabled) {
            if (!prototypeDisabled && $injector.has('npPrototype')) {
                projectLandingPageService.push({
                    priority: 1,
                    template: 'resources/norman-projects-client/prototype/prototype.html'
                });
            }
        });
        // the team is now injected in landing page
        projectLandingPageService.push({
            template: 'resources/norman-projects-client/team/team.html',
            priority: 5

        });
        AsideFactory.push({
            state: 'shell.project.document',
            priority: 4,    // UR is 3rd
            name: 'Files',
            type: 'Docs'
        });
        HomeDashboardFactory.push({
            priority: 1,
            template: 'resources/norman-projects-client/projectsHomeWidget/projectsHomeWidget.html'
        });
    });

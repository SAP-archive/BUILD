'use strict';

angular.module('UserResearch')
    .config(function ($stateProvider) {
        $stateProvider

            .state('shell.project.UserResearch.participant', {
                abstract: true,
                url: '/participant/:studyId',
                templateUrl: 'resources/norman-user-research-client/participant/participant.html',
                resolve: {
                    currentStudy: require('../resolver').currentStudyParticipant
                },
                params: {
                    study: null,
                    studyId: null,
                    currentProject: null
                },
                authenticate: true
            })

            .state('shell.project.UserResearch.participant.list', {
                url: '',
                templateUrl: 'resources/norman-user-research-client/participant/list/template.html',
                controller: 'ParticipantListCtrl',
                params: {
                    study: null,
                    studyId: null,
                    currentProject: null
                },
                authenticate: true,
                aside: 'hide',
                navbar: 'show'
            })

            .state('shell.project.UserResearch.participant.question', {
                url: '/question/:questionId',
                templateUrl: 'resources/norman-user-research-client/participant/question/template.html',
                controller: 'ParticipantQuestionCtrl',
                params: {
                    study: null,
                    studyId: null,
                    questionId: null,
                    currentProject: null,
                    action: null,
                    progress: null,
                    lastPageViewId: null
                },
                authenticate: true,
                aside: 'hide',
                navbar: 'hideAnimate'
            })


            .state('shell.project.UserResearch.preview', {
                abstract: true,
                url: '/preview/:studyId',
                templateUrl: 'resources/norman-user-research-client/participant/preview.html',
                resolve: {
                    currentStudy: require('../resolver').currentStudyPreview
                },
                params: {
                    study: null,
                    studyId: null,
                    currentProject: null
                },
                authenticate: true
            })

            .state('shell.project.UserResearch.preview.list', {
                url: '',
                templateUrl: 'resources/norman-user-research-client/participant/list/template.html',
                controller: 'ParticipantListCtrl',
                resolve: {
                    AnonymousService: require('./preview.service.js')
                },
                params: {
                    study: null,
                    studyId: null,
                    currentProject: null,
                    isPreviewMode: true
                },
                authenticate: true,
                aside: 'hide',
                navbar: 'showAnimate'
            })

            .state('shell.project.UserResearch.preview.question', {
                url: '/question/:questionId',
                templateUrl: 'resources/norman-user-research-client/participant/question/template.html',
                controller: 'ParticipantQuestionCtrl',
                resolve: {
                    Annotations: require('./preview.service.js'),
                    Answers: require('./preview.service.js'),
                    Auth: require('./preview.service.js'),
                    TrackingService: require('./preview.service.js')
                },
                params: {
                    study: null,
                    studyId: null,
                    questionId: null,
                    currentProject: null,
                    isPreviewMode: true,
                    progress: null,
                    lastPageViewId: null
                },
                authenticate: true,
                aside: 'hide',
                navbar: 'hideAnimate'
            });

    })

    .factory('ParticipantStudy', require('./service.js'))
    .factory('Annotations', require('./question/annotations.service.js'))
    .factory('Answers', require('./question/answers.service.js'))
    .factory('AnonymousService', require('./list/anonymous.service.js'))
    .controller('ParticipantListCtrl', require('./list/controller.js'))
    .controller('ParticipantQuestionCtrl', require('./question/controller.js'))
    .directive('cursorTooltip', require('./question/directives/cursorTooltip/cursorTooltip.js'))
    .directive('sentimentManager', require('./question/directives/sentimentManager/sentimentManager.js'));

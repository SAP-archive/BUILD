'use strict';

angular.module('UserResearch')
    .config(function ($stateProvider) {
        $stateProvider
            .state('shell.project.UserResearch.review', {
                url: '/review/:studyId',
                templateUrl: 'resources/norman-user-research-client/review/review.template.html',
                controller: 'ReviewCtrl',
                resolve: {
                    currentStudy: require('../resolver').currentStudy
                },
                params: {
                    studyId: null,
                    currentProject: null
                },
                authenticate: true
            })
            .state('shell.project.UserResearch.review.overview', {
                url: '/overview',
                templateUrl: 'resources/norman-user-research-client/review/overview/overview.template.html',
                controller: 'ReviewOverviewCtrl',
                resolve: {
                    currentReview: require('../resolver').currentReview
                },
                params: {
                    study: null,
                    studyId: null,
                    currentProject: null
                },
                authenticate: true
            })
            .state('shell.project.UserResearch.review.questions', {
                url: '/questions',
                templateUrl: 'resources/norman-user-research-client/review/questions/questions.template.html',
                controller: 'ReviewQuestionsCtrl',
                resolve: {
                    currentReview: require('../resolver').currentReview
                },
                params: {
                    study: null,
                    studyId: null,
                    currentProject: null
                },
                authenticate: true
            })
            .state('shell.project.UserResearch.review.participants', {
                url: '/participants',
                templateUrl: 'resources/norman-user-research-client/review/participants/participants.template.html',
                controller: 'ReviewParticipantsCtrl',
                resolve: {
                    currentReview: require('../resolver').currentReview
                },
                params: {
                    study: null,
                    studyId: null,
                    currentProject: null
                },
                authenticate: true
            })
            .state('shell.project.UserResearch.review.settings', {
                url: '/settings',
                templateUrl: 'resources/norman-user-research-client/review/settings/settings.template.html',
                controller: 'ReviewSettingsCtrl',
                resolve: {
                    currentReview: require('../resolver').currentReview
                },
                params: {
                    study: null,
                    studyId: null,
                    currentProject: null
                },
                authenticate: true
            })
            .state('shell.project.UserResearch.review.participant-overview', {
                url: '/participant-overview',
                templateUrl: 'resources/norman-user-research-client/review/participant-overview/participant-overview.html',
                controller: 'ParticipantOverviewCtrl',
                resolve: {
                    currentReview: require('../resolver').currentReview
                },
                params: {
                    study: null,
                    studyId: null,
                    currentProject: null
                },
                authenticate: true
            })
            .state('shell.project.UserResearch.detail', {
                url: '/review/:studyId/detail/:questionId',
                templateUrl: 'resources/norman-user-research-client/review/detail/template.html',
                controller: 'ReviewDetailCtrl',
                resolve: {
                    currentStudy: require('../resolver').currentStudy
                },
                params: {
                    studyId: null,
                    currentProject: null,
                    questionId: null
                },
               authenticate: true,
               aside: 'hide',
               navbar: 'hide'
            })
            .state('shell.project.UserResearch.review.participant-invitation', {
                url: '/participant-invitation',
                templateUrl: 'resources/norman-user-research-client/review/participant-invitation/participant-invitation.html',
                controller: 'ParticipantInvitationCtrl',
                resolve: {
                    currentStudy: require('../resolver').currentStudy
                },
                authenticate: true
            });
    })
    .filter('AverageDurationFilter', require('./filter/average-duration.filter.js'))
    .filter('STAnnotationActiveFilter', require('./filter/st-annotation-active.filter.js'))
    .factory('Reviews', require('./review.service.js'))
    .controller('ReviewCtrl', require('./review.controller.js'))
    .controller('ReviewOverviewCtrl', require('./overview/overview.controller.js'))
    .controller('ReviewQuestionsCtrl', require('./questions/questions.controller.js'))
    .controller('ReviewParticipantsCtrl', require('./participants/participants.controller.js'))
    .controller('ReviewSettingsCtrl', require('./settings/settings.controller.js'))
    .controller('ParticipantOverviewCtrl', require('./participant-overview/participant-overview.controller.js'))
    .controller('ReviewDetailCtrl', require('./detail/controller.js'))
    .controller('ParticipantInvitationCtrl', require('./participant-invitation/participant-invitation.controller.js'))
    .directive('arrowKeys', require('./directives/arrowKeys/arrowKeys.js'))
    .directive('laserPointer', require('./directives/laserPointer/laserPointer.js'))
    .filter('TaskStatusFilter', require('./filter/task-status.filter.js'))
    .directive('questionParticipantBreakdown', require('./directives/participant-question-breakdown/participant-qustion-breakdown.js'))
    .directive('taskParticipantBreakdown', require('./directives/participant-task-breakdown/participant-task-breakdown.js'))
    .directive('studyParticipantBreakdown', require('./directives/participant-study-breakdown/participant-study-breakdown.js'))
    .directive('iframeMessageListener', require('./directives/iframeMessageListener/iframeMessageListener.js'))
    .factory('scrollToCommentApi', require('./directives/scroll-to-comment/scroll-to-comment.factory.js'))
    .directive('scrollToComment', require('./directives/scroll-to-comment/scroll-to-comment.directive.js'));

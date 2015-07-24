'use strict';

angular.module('UserResearch')
    .config(function ($stateProvider) {
        $stateProvider

        .state('shell.project.UserResearch.list', {
            url: '/',
            templateUrl: 'resources/norman-user-research-client/study/list/template.html',
            controller: 'StudiesListCtrl',
            authenticate: true
        })

        .state('shell.project.UserResearch.create', {
            abstract: true,
            url: '/create',
            templateUrl: 'resources/norman-user-research-client/study/edit/template.html',
            controller: 'StudyEditCtrl',
            params: {
                snapshot: null,
                assets: null,
                currentProject: null
            },
            resolve: {
                currentStudy: function () {
                    return {};
                }
            },
            authenticate: true
        })

        .state('shell.project.UserResearch.edit', {
            abstract: true,
            url: '/edit/:studyId',
            templateUrl: 'resources/norman-user-research-client/study/edit/template.html',
            controller: 'StudyEditCtrl',
            resolve: {
                currentStudy: require('../resolver').currentStudy
            },
            params: {
                study: null,
                studyId: null,
                currentProject: null,
                created: null
            },
            authenticate: true
        })

        .state('shell.project.UserResearch.published', {
            url: '/published/:studyId',
            templateUrl: 'resources/norman-user-research-client/study/published/template.html',
            controller: 'PublishedCtrl',
            resolve: {
                currentStudy: require('../resolver').currentStudy
            },
            authenticate: true
        });

    })

    .factory('Studies', require('./service'))
    .factory('StudiesParticipate', require('./participate.service'))
    .controller('StudiesListCtrl', require('./list/controller.js'))
    .controller('StudyEditCtrl', require('./edit/controller.js'))
    .controller('PublishedCtrl', require('./published/controller.js'));

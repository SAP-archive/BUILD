'use strict';

angular.module('UserResearch')
    .config(function ($stateProvider) {
        $stateProvider

        .state('shell.project.UserResearch.create.screens', {
            url: '/',
            templateUrl: 'resources/norman-user-research-client/questions/list/template.html',
            controller: 'QuestionsListCtrl',
            authenticate: true,
            params: {
                study: null,
                studyId: null,
                snapshot: null,
                assets: null,
                currentProject: null
            }
        })

        .state('shell.project.UserResearch.edit.screens', {
            url: '/',
            templateUrl: 'resources/norman-user-research-client/questions/list/template.html',
            controller: 'QuestionsListCtrl',
            authenticate: true,
            params: {
                study: null,
                studyId: null,
                currentProject: null,
                created: null
            }
        });
    })

    .factory('Questions', require('./service'))
    .factory('QuestionValidator', require('./edit-modal/question.validator.js'))
    .controller('QuestionsListCtrl', require('./list/controller.js'))
    .filter('QuestionsListFilter', require('./list/question-filter.js'))
    .controller('QuestionEditCtrl', require('./edit-modal/controller.js'))
    .service('Snapshots', require('./edit-modal/snapshot.service.js'))
    .directive('editQuestion', require('./directives/questionEdit/editQuestion.js'));

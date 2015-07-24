'use strict';

describe('Unit tests for ReviewCtrl', function () {
    var scope,
        httpBackend,
        state = {
            go: function () {},
            href: function () {
                return 'previewTest';
            }
        },
        userServiceMock,
        // Mock data
        stateParams = {
            questionId: 'questionId1',
            studyId: 'studyId',
            currentProject: 'projectId'
        },

        sentiment = {
            NONE: 0,
            HAPPY: 1,
            SAD: 2,
            NEUTRAL: 3
        },

        qAnnotations = [{
            _id: 'annoId1.1',
            absoluteX: 142,
            absoluteY: 117,
            containerId: '',
            comment: 'anno text 1.1',
            createBy: 'participant1',
            createTime: '2015-01-15T15:42:22.598Z',
            questionId: 'questionId1',
            sentiment: sentiment.SAD
        }, {
            _id: 'annoId1.2',
            absoluteX: 213,
            absoluteY: 231,
            containerId: '',
            comment: 'anno text 1.2',
            createBy: 'participant2',
            createTime: '2015-01-15T15:42:22.598Z',
            questionId: 'questionId1',
            sentiment: sentiment.HAPPY
        }, {
            _id: 'annoId2.1',
            absoluteX: 145,
            absoluteY: 154,
            containerId: '',
            comment: 'anno text 2.1',
            createBy: 'participant1',
            createTime: '2015-01-15T15:42:22.598Z',
            questionId: 'questionId2',
            sentiment: sentiment.NEUTRAL
        }],

        currentStudy = {
            name: 'test',
            annotations: qAnnotations,
            description: 'test description',
            participants: [{_id: 'participant1', name: 'John Doe', avatar_url: 'http://api'}, {_id: 'participant2', name: 'John Two', avatar_url: 'http://api'}],
            status: 'draft',
            _id: stateParams.studyId,
            questions: [{
                _id: 'questionId1',
                text: 'url1 question1',
                ordinal: 0,
                url: 'url1'
            }, {
                _id: 'questionId2',
                text: 'url2 question1',
                ordinal: 1,
                url: 'url2'
            }]
        };

    beforeEach(module('UserResearch'));
    beforeEach(module('common.ui.elements'));
    beforeEach(module('shell.aside'));
    beforeEach(module('shell.dashboard'));
    beforeEach(module('shell.projectLandingPage'));

    beforeEach(module('ngResource'));
    beforeEach(module(function ($provide) {
        $provide.value('$stateParams', stateParams);
    }));

    beforeEach(inject(function ($injector, $rootScope, $timeout, $controller, $q, $httpBackend) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();

        userServiceMock = {
            getUserById: function () {
                var def = $q.defer();
                def.$promise = def.promise;
                def.resolve({
                    name: 'john Doe'
                });
                return def;
            }
        };

        $controller('ReviewCtrl', {
            $scope: scope,
            $state: state,
            $window: window,
            $stateParams: stateParams,
            currentStudy: currentStudy,
            UserService: userServiceMock,
            urUtil: function () {}
        });

    }));

    afterEach(function () {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });
});

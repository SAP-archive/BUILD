'use strict';

describe('Unit tests for ParticipantListCtrl: ', function () {
    var scope, httpBackend, userServiceMock, anonymousServiceMock, currentStudy, answers,
        state = {
            go: function () {
            }, current: {name: 'test'}
        },
        stateSpy = sinon.spy(state, 'go'),

    // Mock data
        stateParams = {
            questionId: 'questionId2',
            studyId: 'studyId',
            currentProject: 'projectId'
        },

        questions = [
            {_id: 'questionId1', text: 'url1 question1', ordinal: 0, subOrdinal: 0, url: 'url1', type: 'Annotation'},
            {_id: 'questionId2', text: 'url2 question1', ordinal: 1, subOrdinal: 0, url: 'url2', type: 'Annotation'}
        ];

    currentStudy = {
        name: 'test',
        annotations: [],
        description: 'test description',
        status: 'draft',
        _id: stateParams.studyId,
        participants: [
            {_id: '55363bc269bedc4063ebb6b1', email: 'test@test.com', name: 'User One', isAnonymous: true}
        ],
        questions: questions
    };

    beforeEach(module('shell.aside'));
    beforeEach(module('shell.dashboard'));
    beforeEach(module('shell.projectLandingPage'));

    beforeEach(module('UserResearch'));
    beforeEach(module('common.ui.elements'));
    beforeEach(module('ngResource'));

    beforeEach(module(function ($provide) {
        $provide.value('$stateParams', stateParams);
    }));

    beforeEach(inject(function ($rootScope, $controller, $httpBackend, $q) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        currentStudy = currentStudy;
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
        anonymousServiceMock = {
            toggle: function () {
                var def = $q.defer();
                def.$promise = def.promise;
                def.resolve({
                    _id: 'e593f3356a86a08009f932a5',
                    participants: [
                        {
                            _id: '55365f8c16e5c5f4702de71c',
                            created_at: '2015-04-21T14:33:17.578Z',
                            isAnonymous: true
                        }
                    ]
                });
                return def;
            }
        };

        $controller('ParticipantListCtrl', {
            $scope: scope,
            $state: state,
            $stateParams: stateParams,
            currentStudy: currentStudy,
            NavBarService: {
                show: function () {
                }, setLogoState: function () {
                }
            },
            UserService: userServiceMock,
            AnonymousService: anonymousServiceMock
        });
    }));

    afterEach(function () {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('when there are not answered questions or tasks', function () {
        before(function () {
            currentStudy.questions.push({
                _id: 'questionId3',
                text: 'url3 question3',
                ordinal: 2,
                subOrdinal: 0,
                url: 'url3',
                type: 'Task'
            });
        });
        it('should say "3 Items (1 Task, 2 Questions)"', function () {
            expect(scope.findNextUnansweredQ()).to.be.equal('questionId1');
            expect(scope.quesString).to.be.equal('3 Items (1 Task, 2 Questions)');
            expect(scope.progress).to.be.equal(0);
        });
        after(function () {
            currentStudy.questions = questions;
        });
    });

    describe('when there are not answered tasks', function () {
        before(function () {
            currentStudy.questions = [{
                _id: 'questionId3',
                text: 'url3 question3',
                ordinal: 3,
                subOrdinal: 0,
                url: 'url3',
                type: 'Task'
            }];
        });
        it('should say "1 Task"', function () {
            expect(scope.findNextUnansweredQ()).to.be.equal('questionId3');
            expect(scope.quesString).to.be.equal('1 Task');
            expect(scope.progress).to.be.equal(0);
        });
        after(function () {
            currentStudy.questions = questions;
        });
    });

    describe('when there is an answered task', function () {
        before(function () {
            currentStudy.questions = [{
                _id: 'questionId3',
                text: 'url3 question3',
                ordinal: 4,
                subOrdinal: 0,
                url: 'url3',
                type: 'Task'
            }];
            currentStudy.answers = [{questionId: 'questionId3', status: 'aborted'}];
        });
        it('should say "1 Task" and that task should be finished', function () {
            expect(scope.findNextUnansweredQ()).to.be.equal('questionId3');
            expect(scope.quesString).to.be.equal('1 Task');
            expect(scope.progress).to.be.equal(100);
        });
        after(function () {
            currentStudy.questions = questions;
            currentStudy.answers = answers;
        });
    });

    describe('when there are not answered questions', function () {
        it('should say next unanswered question is the first', function () {
            expect(scope.findNextUnansweredQ()).to.be.equal('questionId1');
            expect(scope.quesString).to.be.equal('2 Questions');
            expect(scope.progress).to.be.equal(0);
        });
    });

    describe('when the first annotation question has been answered', function () {
        before(function () {
            currentStudy.annotations.push({questionId: 'questionId1'});
        });
        it('should say next unanswered question is the second', function () {
            expect(scope.findNextUnansweredQ()).to.be.equal('questionId2');
            expect(scope.progress).to.be.equal(50);
        });

    });

    describe('when all the questions (annotation only) have been answered', function () {
        before(function () {
            currentStudy.annotations.push({questionId: 'questionId1'});
            currentStudy.annotations.push({questionId: 'questionId2'});
        });
        it('should say next unanswered question is the first', function () {
            expect(scope.findNextUnansweredQ()).to.be.equal('questionId1');
            expect(scope.progress).to.be.equal(100);
        });
    });

    it('should go to questions page when goToQuestion is invoked', function () {
        scope.goToQuestion('question1');
        stateSpy.should.have.been.calledWith('^.question', {
            questionId: 'question1',
            study: currentStudy
        });
    });

    it('should update isUserAnonymous when ui-checkbox isUserAnonymous is selected', function () {
        scope.isAnonymous();
        expect(scope.isUserAnonymous).to.be.equal(true);
        expect(scope.study.participants[0].isAnonymous).to.be.equal(true);
    });

    describe('validate sortBy is working correctly i.e. Ordinal 0-1-2 and subOrdinal 0-1-2', function () {
        before(function () {
            currentStudy.questions.push({
                _id: 'questionId3',
                text: 'url3 question3',
                ordinal: 0,
                subOrdinal: 1,
                url: 'url3',
                type: 'Task'
            });
            currentStudy.questions.push({
                _id: 'questionId3',
                text: 'url3 question3',
                ordinal: 0,
                subOrdinal: 2,
                url: 'url3',
                type: 'Task'
            });
            currentStudy.questions.push({
                _id: 'questionId3',
                text: 'url3 question3',
                ordinal: 0,
                subOrdinal: 3,
                url: 'url3',
                type: 'Task'
            });
            // Start counter at 5 as other ordinals have been added already
            for (var counter = 5; counter <= 25; counter++) {
                currentStudy.questions.push({
                    _id: 'questionId3',
                    text: 'url3 question3',
                    ordinal: counter,
                    subOrdinal: 0,
                    url: 'url3',
                    type: 'Task'
                });
            }
        });
        it('Questions should be ordered by ordinal 0-1-2-3 but also by subOrdinal (0,0)-(0,1)-(1,0)-(2,0)', function () {
            // Dev-note: there were issues with lodash and how it was sorting items with a count greater than 20
            expect(scope.study.questions.length).to.be.equal(26);
            expect(scope.study.questions[0].ordinal).to.be.equal(0);
            expect(scope.study.questions[0].subOrdinal).to.be.equal(0);
            expect(scope.study.questions[1].ordinal).to.be.equal(0);
            expect(scope.study.questions[1].subOrdinal).to.be.equal(1);
            expect(scope.study.questions[2].ordinal).to.be.equal(0);
            expect(scope.study.questions[2].subOrdinal).to.be.equal(2);
            expect(scope.study.questions[3].ordinal).to.be.equal(0);
            expect(scope.study.questions[3].subOrdinal).to.be.equal(3);
            expect(scope.study.questions[15].ordinal).to.be.equal(15);
            expect(scope.study.questions[20].ordinal).to.be.equal(20);
            expect(scope.study.questions[21].ordinal).to.be.equal(21);
        });
    });

});

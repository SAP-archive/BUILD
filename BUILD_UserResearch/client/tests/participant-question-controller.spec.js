/*eslint no-unused-expressions: 0*/
'use strict';

describe('Unit tests for ParticipantQuestionCtrl', function () {
    var scope, httpBackend, authServiceMock,
        state = {
            go: function () {},
            current: {
                name: 'current.state'
            }
        },
        stateSpy = sinon.spy(state, 'go'),

    // Mock data
        stateParams = {
            questionId: 'questionId2',
            studyId: 'studyId',
            currentProject: 'projectId'
        },

        currentStudy = {
            name: 'test',
            description: 'test description',
            status: 'draft',
            _id: stateParams.studyId,
            questions: [
                {_id: 'questionId1', text: 'url1 question1', ordinal: 0, url: 'url1', type: 'Freeform'},
                {_id: 'questionId2', text: 'url2 question1', ordinal: 1, url: 'url2', type: 'Task', snapshotUILang: 'UI5'},
                {
                    _id: 'questionId3',
                    text: 'url3 question1',
                    ordinal: 2,
                    url: 'url3',
                    allowMultipleAnswers: false,
                    answerOptions: ['AnswerOption1', 'AnswerOption2'],
                    type: 'MultipleChoice'
                }
            ],
            answers: [
                {
                    _id: 'answerId1',
                    answer: 'answerId1',
                    questionId: 'questionId1',
                    stats: {created_by: 'Norman', created_at: '15042015'}
                },
                {
                    _id: 'answerId2',
                    answer: 'answerId2',
                    questionId: 'questionId2',
                    status: 'not started',
                    stats: {created_by: 'Norman', created_at: '15042015'}
                }
            ],
            annotations: [
                {
                    _id: 'annotationId1',
                    questionId: 'questionId2',
                    absoluteX: 0,
                    absoluteY: 0,
                    comment: 'test annotation',
                    url: 'url2'
                }
            ]
        };

    beforeEach(module('UserResearch'));
    beforeEach(module('common.ui.elements'));
    beforeEach(module('shell.aside'));
    beforeEach(module('shell.dashboard'));
    beforeEach(module('shell.projectLandingPage'));
    beforeEach(module('account.auth'));

    beforeEach(module('ngResource'));
    beforeEach(module(function ($provide) {
        $provide.value('$stateParams', stateParams);
    }));

    beforeEach(inject(function ($rootScope, $controller, $httpBackend, Answers, $q) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        authServiceMock = {
            user: {},
            getCurrentUser: function () {
                return this.user;
            },
            initCurrentUser: function () {
                var def = $q.defer();
                this.user.name = 'john Doe';
                this.user.avatar_url = 'url';
                this.user.$promise = def.promise;
                def.resolve(this.user);
            }
        };
        $controller('ParticipantQuestionCtrl', {
            $scope: scope,
            $state: state,
            $stateParams: stateParams,
            currentStudy: currentStudy,
            AsideFactory: {
                hide: function () {
                }
            },
            NavBarService: {
                hide: function () {
                }, show: function () {
                }
            },
            Auth: authServiceMock,
            $timeout: function (cb) {
                cb();
            },
            urUtil: {
                getRelativeURI: function () {
                    return {pathname: '', hash: ''};
                },
                getContextFromUrl: function () {
                    return { context_type: 'ST'};
                }
            },
            Answers: Answers
        });

    }));

    afterEach(function () {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });


    it('should initialize the controller', function () {
        expect(scope.study).to.be.equal(currentStudy);
        expect(scope.currentQuestionId).to.be.equal(stateParams.questionId);
        expect(scope.currentQuestion).to.be.equal(currentStudy.questions[1]);
        expect(scope.annotations.length).to.be.equal(1);
        expect(scope.currentIndex).to.be.equal(1);
        expect(scope.isLastQuestion).to.be.false;
        expect(scope.isFirstQuestion).to.be.false;
    });

    it('should update an annotation when "update" is called', function () {
        httpBackend.expect('PUT', '/api/participant/studyId/annotations/annotationId1')
            .respond(200);
        scope.update(scope.annotations[0]);
        httpBackend.flush();
    });


    it('should update an annotation when it is moved', function () {
        scope.startDrag(scope.annotations[0]);
        var eventMock = {offsetX: 10, offsetY: 20};
        var updateSpy = sinon.spy(scope, 'update');
        scope.drag(eventMock);
        expect(scope.isDragging).to.be.true;
        scope.stopDrag();
        expect(scope.isDragging).to.be.false;
        updateSpy.should.have.been.calledWith(scope.annotations[0]);
        expect(scope.annotations[0].absoluteX).to.be.equal(10);
        expect(scope.annotations[0].absoluteY).to.be.equal(20);
    });


    it('should go to the previous screen when "previous" is called', function () {
        scope.previous();
        stateSpy.should.have.been.calledWith(state.current.name, {
            questionId: currentStudy.questions[0]._id,
            study: currentStudy,
            action: 'previous',
            lastPageViewId: scope.lastPageViewId
        });
        stateParams.questionId = 'questionId1';  // for the next test
    });


    it('should go to the next screen when "next" is called', function () {
        scope.next();
        stateSpy.should.have.been.calledWith(state.current.name, {
            questionId: currentStudy.questions[1]._id,
            study: currentStudy,
            action: 'next',
            lastPageViewId: scope.lastPageViewId
        });
    });

    it('should close an open freeform answer on question change', function () {
        httpBackend.expect('PUT', '/api/participant/studies/studyId/answers')
            .respond(200, currentStudy.answers[0]);
        scope.startEditFreeForm();
        expect(scope.currentAnswer.isEditing).to.be.equal(true);

        scope.next();
        expect(scope.currentAnswer.isEditing).to.be.equal(false);
        httpBackend.flush();
    });


    it('should go to the list page when "goToList" is called', function () {
        scope.goToList();
        stateSpy.should.have.been.calledWith('^.list', {
            study: currentStudy
        });
    });


    it('should add new answer ', function () {
        expect(currentStudy.answers.length).to.be.equal(2);
        var stats = {created_at: '', created_by: 'user_1'};
        httpBackend.expect('PUT', '/api/participant/studies/studyId/answers')
            .respond(200, {_id: 'answer1', answer: 'answer_1', stats: stats, questionId: stateParams.questionId});


        scope.addOrUpdateAnswer({answer: 'answer_1', questionId: stateParams.questionId});
        httpBackend.flush();
        scope.$apply();
        expect(currentStudy.answers.length).to.be.equal(3);
        expect(scope.currentAnswer.answer).to.be.equal('answer_1');
    });


    it('should choose  multiple choice answer ', function () {
        scope.currentQuestionId = 'questionId3';
        scope.currentAnswer = null;
        scope.study.answers = [];
        scope.updateMultipleChoice(0);
        httpBackend.expect('PUT', '/api/participant/studies/studyId/answers')
            .respond(200, {answer: '0', questionId: 'questionId3', _id: 'answer_0_id'});
        httpBackend.flush();
        expect(currentStudy.answers.length).to.be.equal(1);
        expect(scope.currentAnswer._id).to.be.equal('answer_0_id');
        expect(scope.currentAnswer.questionId).to.be.equal('questionId3');
        expect(scope.currentAnswer.answer).to.be.equal('0');
    });


    it('should choose  multiple choice question with multiple answers', function () {
        scope.currentQuestionId = 'questionId3';
        scope.currentAnswer = null;
        scope.study.answers = [];
        scope.updateMultipleChoice(0);
        scope.updateMultipleChoice(1);
        httpBackend.expect('PUT', '/api/participant/studies/studyId/answers')
            .respond(200, {answer: '0', questionId: 'questionId3', _id: 'answer_0_id'});
        httpBackend.expect('PUT', '/api/participant/studies/studyId/answers')
            .respond(200, {answer: '0,1', questionId: 'questionId3', _id: 'answer_0_id'});
        httpBackend.flush();
        expect(currentStudy.answers.length).to.be.equal(1);
        expect(scope.currentAnswer._id).to.be.equal('answer_0_id');
        expect(scope.currentAnswer.questionId).to.be.equal('questionId3');
        expect(scope.currentAnswer.answer).to.be.equal('0,1');

        // Now remove an existing choice
        scope.updateMultipleChoice(0);
        httpBackend.expect('PUT', '/api/participant/studies/studyId/answers')
            .respond(200, {answer: '1', questionId: 'questionId3', _id: 'answer_0_id'});
        httpBackend.flush();
        expect(scope.currentAnswer.answer).to.be.equal('1');
    });

    // test for startTask
    it('should send data to the server indicating that a task has been started', function () {
        scope.currentQuestionId = 'questionId3';
        httpBackend.expect('PUT', '/api/participant/studies/studyId/answers')
            .respond(200, {questionId: 'questionId3', status: 'in progress'});
        scope.startTask();
        httpBackend.flush();
        expect(scope.currentAnswer.status).to.be.equal('in progress');
    });

    it('should check which boxes are selected', function () {
        expect(scope.isMultipleChoiceSelected(1)).to.be.equal(false);

        scope.selectedChoice = '0,1,2';
        expect(scope.isMultipleChoiceSelected(1)).to.be.equal(true);

        scope.selectedChoice = '0';
        expect(scope.isMultipleChoiceSelected(1)).to.be.equal(false);

        scope.selectedChoice = '1';
        expect(scope.isMultipleChoiceSelected(1)).to.be.equal(true);
        expect(scope.isMultipleChoiceSelected(2)).to.be.equal(false);
    });

    it('should hide the helper text', function () {
        // If we've finished answering a freeform question
        expect(scope.currentQuestion.type).to.be.equal('Freeform');
        scope.currentAnswer = {isEditing: false};
        expect(scope.showHelperText()).to.be.equal(false);
    });

    it('should show the helper text', function () {
        // If we haven't finished a freeform question
        expect(scope.showHelperText()).to.be.equal(true);

        // Even if we've finished answering a task
        scope.currentQuestion = currentStudy.questions[1];
        scope.currentAnswer = currentStudy.answers[1];
        scope.currentAnswer.status = 'aborted';
        expect(scope.currentQuestion.type).to.be.equal('Task');
        expect(scope.showHelperText()).to.be.equal(true);
    });

});

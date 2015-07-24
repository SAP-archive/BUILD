/*eslint no-unused-expressions: 0*/
'use strict';

describe('Unit tests for QuestionListCtrl', function () {
    var scope, httpBackend, broadcastSpy,
        state = {
            go: function () {}
        },
        stateSpy = sinon.spy(state, 'go'),

        // Mock data
        stateParams = {
            studyId: 'studyId',
            currentProject: 'projectId'
        },

        currentStudy = {
            name: 'test',
            _id: stateParams.studyId,
            questions: [{
                _id: 'questionId1',
                text: 'url1 question1',
                ordinal: 0,
                subOrdinal: 0,
                url: 'url1',
                type: 'Annotation',
                documentId: '1'
            }, {
                _id: 'questionId2',
                text: 'url2 question1',
                ordinal: 1,
                subOrdinal: 0,
                url: 'url2',
                type: 'Annotation',
                documentId: '2'
            }, {
                _id: 'questionId3',
                text: 'url2 question2',
                ordinal: 1,
                subOrdinal: 0,
                url: 'url3',
                type: 'Annotation',
                documentId: '2'
            }],
            $remove: function (cb) {
                cb();
            }
        };

    var mockTaskCreator = function () {

        this.createTask = function () {};
        this.init = function () {};
    };

    beforeEach(module('UserResearch'));
    beforeEach(module('common.ui.elements'));
    beforeEach(module('shell.aside'));
    beforeEach(module('shell.dashboard'));
    beforeEach(module('shell.projectLandingPage'));
    beforeEach(module('UserResearch.utils'));

    beforeEach(module('ngResource'));
    beforeEach(module(function ($provide) {
        $provide.value('$stateParams', stateParams);
    }));

    beforeEach(inject(function ($injector, $rootScope, $controller, $httpBackend) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        broadcastSpy = sinon.spy($rootScope, '$broadcast');

        $controller('QuestionsListCtrl', {
            $scope: scope,
            $state: state,
            currentStudy: currentStudy,
            Questions: $injector.get('Questions'),
            TaskCreator: mockTaskCreator
        });
    }));

    afterEach(function () {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    it('should have the current study in the scope', function () {
        expect(scope.study).to.be.equal(currentStudy);
    });

    it('should go to the edit questions screen when goToQuestions is called', function () {
        scope.goToQuestions(currentStudy.questions[1]._id);
        broadcastSpy.should.have.been.calledOnce;
        expect(scope.currentUrl).to.be.equal(currentStudy.questions[1].url);
        broadcastSpy.should.have.been.calledWith('dialog-open', 'editQuestionModal');
    });

    it('should be able to check if a screen has all his questions filled, expecting 2', function () {
        expect(scope.countQuestionByOrdinal(1)).to.be.equal(2);
        expect(scope.countQuestionByOrdinal(0)).to.be.equal(1);
        scope.study.questions[0].text = undefined;
        expect(scope.countQuestionByOrdinal(0)).to.be.equal(0);
    });

    it('should be able to delete a screen with all its questions', function () {
        var orderSpy = sinon.spy(scope, 'updateOrder');
        scope.getScreenList = function () {
            return [
                { dataset: {ordinal: 0 } },
                { dataset: {ordinal: 1 } },
                { dataset: {ordinal: 1 } }
            ];
        };

        httpBackend.expect('DELETE', '/api/projects/projectId/studies/studyId/questions/questionId2/bulk').respond(204);
        httpBackend.expect('PUT', '/api/projects/projectId/studies/studyId/questions').respond(204);

        expect(currentStudy.questions.length).to.be.equal(3);
        scope.deleteScreen(currentStudy.questions[1]);

        httpBackend.flush();
        orderSpy.should.have.been.called;

        scope.getScreenList = function () {
            return [
                { dataset: {ordinal: 0 } }
            ];
        };
        expect(currentStudy.questions.length).to.be.equal(1);
    });

    it('should do nothing as there is nothing to upload', function () {
        var questionCount = scope.study.questions.length;
        scope.addQuestions(null);
        expect(scope.study.questions.length).to.be.equal(questionCount);
        scope.addQuestions([]);
        expect(scope.study.questions.length).to.be.equal(questionCount);
    });

    it('should navigate to the create static study screen', function () {
        scope.createStaticStudy();
        stateSpy.should.have.been.calledWith('shell.project.UserResearch.create.screens', {
            studyId: scope.study._id,
            study: scope.study
        });
    });

    it('should set isUploadingScreen to true when setScreenUploading is called', function () {
        expect(scope.isUploadingScreen).to.be.false;
        scope.setScreenUploading();
        expect(scope.isUploadingScreen).to.be.true;
    });

    it('should set isUploadingScreen to false when onUploadFailure is called', function () {
        scope.isUploadingScreen = true;
        scope.onUploadFailure();
        expect(scope.isUploadingScreen).to.be.false;
    });
});

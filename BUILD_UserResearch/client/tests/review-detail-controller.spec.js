/*eslint no-unused-expressions: 0 */
'use strict';

var expect = chai.expect;

describe('Unit tests for ReviewDetailCtrl', function () {
    var scope, navBarShowCalled, asideShowCalled,
        httpBackend,
        broadcastSpy,
        state = {
            go: function () {},
            href: function () {
                return 'previewTest';
            },
            current: {
                name: 'current.state'
            }
        },
        stateSpy = sinon.spy(state, 'go'),
        userServiceMock,
        ReviewsMock,

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
            participants: [{
                _id: 'participant1',
                name: 'John Doe',
                avatar_url: 'http://api'
            }, {
                _id: 'participant2',
                name: 'John Two',
                avatar_url: 'http://api'
            }],
            answers: [{
                _id: 'ans1',
                questionId: 'questionId1'
            }],
            status: 'draft',
            _id: stateParams.studyId,
            questions: [{
                _id: 'questionId1',
                text: 'url1 question1',
                ordinal: 0,
                url: 'url1',
                type: 'Annotation'
            }, {
                _id: 'questionId2',
                text: 'url2 question1',
                ordinal: 1,
                url: 'url2',
                interactive: true,
                type: 'Task'
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
        broadcastSpy = sinon.spy($rootScope, '$broadcast');
        navBarShowCalled = false;
        asideShowCalled = false;

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

        ReviewsMock = {
            getQuestionStats: function () {
                var def = $q.defer();
                def.$promise = def.promise;
                def.resolve({
                    stats: {
                        links: [{
                            name: 'page1'
                        }, {
                            name: 'page2'
                        }]
                    }
                });
                return def;
            }
        };

        $controller('ReviewDetailCtrl', {
            $scope: scope,
            $state: state,
            $window: window,
            $stateParams: stateParams,
            currentStudy: currentStudy,
            UserService: userServiceMock,
            Reviews: ReviewsMock,
            $timeout: function (cb) {
                cb();
            },
            AsideFactory: {
                show: function () {
                    asideShowCalled = true;
                },
                hide: function () { }
            },
            NavBarService: {
                show: function () {
                    navBarShowCalled = true;
                },
                hide: function () { }
            },
            urUtil: {
                getRelativeURI: function () {
                    return {
                        pathname: '',
                        hash: ''
                    };
                }
            }
        });

    }));

    afterEach(function () {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    it('should initialise with expected values', function () {
        expect(scope.question).to.be.equal(currentStudy.questions[0]);
        expect(scope.participantMap).to.not.be.undefined;
        expect(scope.prevQId).to.be.equal('questionId2');
        expect(scope.nextQId).to.be.equal('questionId2');
        expect(scope.noOfComments).to.be.equal(2);

        expect(scope.qAnnotations[0]).to.be.equal(currentStudy.annotations[0]);
        expect(scope.qAnnotations[0].createdName).to.be.equal(currentStudy.participants[0].name);
        expect(scope.qAnnotations[0].avatar_url).to.be.equal(currentStudy.participants[0].avatar_url);
        expect(scope.qAnnotations[1]).to.be.equal(currentStudy.annotations[1]);
        expect(scope.qAnnotations[1].createdName).to.be.equal(currentStudy.participants[1].name);
        expect(scope.qAnnotations[1].avatar_url).to.be.equal(currentStudy.participants[1].avatar_url);
        expect(scope.qAnnotations.length).to.be.equal(currentStudy.annotations.length - 1);
    });

    it('should go to the next question when nav("next") is called (ensure ids loop correctly)', function () {
        scope.next();
        stateSpy.should.have.been.calledWith(state.current.name, {
            questionId: currentStudy.questions[1]._id,
            study: currentStudy,
            action: 'next'
        });
    });

    it('should go to the next question when nav("next") is called (ensure ids)', function () {
        scope.initDetail(currentStudy, 'questionId2');
        scope.next();
        stateSpy.should.have.been.calledWith(state.current.name, {
            questionId: currentStudy.questions[0]._id,
            study: currentStudy,
            action: 'next'
        });
    });

    it('should go to the prev question when nav("prev") is called', function () {
        scope.previous();
        stateSpy.should.have.been.calledWith(state.current.name, {
            questionId: currentStudy.questions[0]._id,
            study: currentStudy,
            action: 'next'
        });
    });

    it('should go to prototype with correct page url', function () {
        scope.question = scope.study.questions[1];
        scope.goToAnnotationScreen('somePageUrl.html');
        expect(scope.prototypeUrl).to.be.equal('somePageUrl.html');
    });

    it('should load the snapshot pages for an interactive study', function () {
        scope.initDetail(currentStudy, 'questionId2');
        scope.$apply();
        expect(scope.pages.length).to.be.equal(2);
        expect(scope.pages[0].name).to.be.equal('page1');
        expect(scope.pages[1].name).to.be.equal('page2');
    });

    it('should place the annotation left', function () {
        window.innerWidth = 200;
        expect(scope.getPlacement({
            absoluteX: 150
        })).to.be.equal('left');
    });

    it('should place the annotation right', function () {
        window.innerWidth = 500;
        expect(scope.getPlacement({
            absoluteX: 150
        })).to.be.equal('right');
    });

    it('should select the next annotation and draw it', function () {
        // this text also cover 'setSelected'
        expect(scope.currentlySelectedIndex).to.be.equal(undefined);
        expect(scope.currentSelected).to.be.equal(null);
        scope.currentSelected = qAnnotations[0];
        expect(scope.currentSelected._id).to.be.equal(qAnnotations[0]._id);
        scope.updateComment('next');
        expect(scope.currentSelected._id).to.be.equal(qAnnotations[1]._id);
        broadcastSpy.should.have.been.calledWith('laser-render');
    });

    it('should select the previous annotation and draw it', function () {
        expect(scope.currentlySelectedIndex).to.be.equal(undefined);
        expect(scope.currentSelected).to.be.equal(null);
        scope.currentSelected = qAnnotations[1];
        expect(scope.currentSelected._id).to.be.equal(qAnnotations[1]._id);
        scope.updateComment('previous');
        expect(scope.currentSelected._id).to.be.equal(qAnnotations[0]._id);
        broadcastSpy.should.have.been.calledWith('laser-render');
    });

    it('should just return, doing nothing', function () {
        expect(scope.currentSelected).to.be.equal(null);
        scope.updateComment('next');
        expect(scope.currentSelected).to.be.equal(null);
        broadcastSpy.should.not.have.been.calledWith('laser-render');
    });

    it('when going from a detail view back to list show the shell and navigate', function () {
        expect(asideShowCalled).to.be.equal(false);
        expect(navBarShowCalled).to.be.equal(false);
        scope.goBack();
        expect(asideShowCalled).to.be.equal(true);
        expect(navBarShowCalled).to.be.equal(true);

        stateSpy.should.have.been.calledWith('^.review.questions', {
            studyId: currentStudy._id,
            currentProject: currentStudy.projectId
        });
    });


    it('needs to handle leaving the prototype tab', function () {
        scope.question = scope.study.questions[1];
        scope.showAnnotations = false;
        scope.currentSelected = qAnnotations[0];
        scope.qAnnotations = [];

        scope.handleLeaveAnnotationScreen();
        expect(scope.currentSelected).to.be.equal(null);
        expect(scope.showAnnotations).to.be.equal(false);
        expect(scope.qAnnotations.length).to.be.equal(1);
        expect(scope.qAnnotations[0]).to.be.equal(qAnnotations[2]);

    });


    it('select the annotation and draw the laser, on second time used it is unselect', function () {
        expect(scope.currentSelected).to.be.equal(null);
        scope.showAnnotations = false;
        expect(scope.question._id).to.be.equal(currentStudy.questions[0]._id);
        scope.selectAnnotation(qAnnotations[0]);
        expect(scope.currentSelected).to.be.equal(qAnnotations[0]);
        expect(scope.showAnnotations).to.be.equal(false);
        broadcastSpy.should.have.been.calledWith('laser-render');

        scope.selectAnnotation(qAnnotations[0]);
        expect(scope.currentSelected).to.be.equal(null);
        expect(scope.showAnnotations).to.be.equal(false);
        broadcastSpy.should.have.been.calledWith('laser-render');
    });

    it('select the annotation and show annotations (because this one is a task), on second time used it is unselect', function () {
        expect(scope.currentSelected).to.be.equal(null);
        scope.showAnnotations = false;
        scope.question = currentStudy.questions[1];
        expect(scope.question._id).to.be.equal(currentStudy.questions[1]._id);
        scope.selectAnnotation(qAnnotations[0]);
        expect(scope.currentSelected).to.be.equal(qAnnotations[0]);
        expect(scope.showAnnotations).to.be.equal(true);


        scope.selectAnnotation(qAnnotations[0]);
        expect(scope.currentSelected).to.be.equal(null);
        expect(scope.showAnnotations).to.be.equal(true);
    });

});

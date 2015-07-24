/*eslint no-unused-expressions: 0*/
'use strict';

describe('Unit tests for StudyEditCtrl', function () {
    var scope, httpBackend, rootScope, timeout, location, $window, testUiError, urUtilMock,

        state = {
            go: function () {},
            transitionTo: function () {}
        },
        stateSpy = sinon.spy(state, 'go'),

    // Mock data
    // state params for creating a study via snapshot
        stateParamsCreateSnapshot = {
            snapshot: {_id: 'snapshotId', projectId: 'projectId-snapshot', thumbnail: 'thumbID'},
            currentProject: 'projectId'
        },

    // state params for creating a study via selecting assets
        stateParamsCreateAssets = {
            currentProject: 'projectId',
            assets: [{_id: 'asset1'}, {_id: 'asset2'}]
        },
    // state params for a study already created
        stateParamsEdit = {currentProject: 'projectId', studyId: 'studyId'},

        currentStudy = {
            name: 'test',
            description: 'test description',
            status: 'draft',
            _id: stateParamsEdit.studyId
        },

        studiesServiceMock = {
            save: function (s, cb) {
                cb(s);
            }
        },
        urUtil = {
            textCountValidation: function () {
                return {remaining: 13, max: 40};
            }
        },
        historyServiceMock = {
            log: function () {
                return;
            }
        };

    /*** SETUP ************************************************************************************/
    beforeEach(module('UserResearch'));
    beforeEach(module('common.ui.elements'));
    beforeEach(module('shell.aside'));
    beforeEach(module('shell.dashboard'));
    beforeEach(module('shell.projectLandingPage'));

    beforeEach(module('ngResource'));
    beforeEach(module(function ($provide) {
        $provide.value('$stateParams', stateParamsCreateSnapshot);
    }));

    beforeEach(inject(function ($rootScope, $controller, $httpBackend, $timeout, $location, _$window_, uiError) {
        httpBackend = $httpBackend;
        rootScope = $rootScope;
        rootScope.$watch = function () {};
        scope = $rootScope.$new();
        timeout = $timeout;
        location = $location;
        $window = _$window_;
        testUiError = uiError;
        urUtilMock = urUtil;

        $controller('StudyEditCtrl', {
            $scope: scope,
            $state: state,
            $stateParams: stateParamsEdit,
            $location: location,
            Studies: studiesServiceMock,
            currentStudy: currentStudy,
            HistoryService: historyServiceMock,
            uiError: testUiError,
            urUtil: urUtilMock
        });
    }));

    afterEach(function () {
        stateSpy.reset();
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });
    /*** SETUP ************************************************************************************/

    /*** TESTS ************************************************************************************/

    it('should initialise when there is a new study from a snapshot', inject(function ($controller) {
        $controller('StudyEditCtrl', {
            $scope: scope,
            $state: state,
            $stateParams: stateParamsCreateSnapshot,
            currentStudy: currentStudy,
            HistoryService: historyServiceMock,
            urUtil: urUtilMock
        });

        var showPopupFunctionSpy = sinon.spy(scope, 'showNameAndDescriptionPopup');
        scope.init();
        expect(scope.showEdit).to.be.true;
        expect(currentStudy.projectId).to.be.equal(stateParamsCreateSnapshot.snapshot.projectId);
        expect(currentStudy.snapshotId).to.be.equal(stateParamsCreateSnapshot.snapshot._id);
        expect(currentStudy.thumbnail).to.be.equal(stateParamsCreateSnapshot.snapshot.thumbnail);
        showPopupFunctionSpy.should.have.been.called;
    }));

    it('should initialise when the study has not yet been created', inject(function ($controller) {
        $controller('StudyEditCtrl', {
            $scope: scope,
            $state: state,
            $stateParams: stateParamsCreateAssets,
            currentStudy: {},
            HistoryService: historyServiceMock,
            urUtil: urUtilMock
        });

        var showPopupFunctionSpy = sinon.spy(scope, 'showNameAndDescriptionPopup');
        scope.init();
        expect(scope.showEdit).to.be.true;
        showPopupFunctionSpy.should.have.been.called;
    }));

    it('should initialise with an existing study', function () {
        var showPopupFunctionSpy = sinon.spy(scope, 'showNameAndDescriptionPopup');
        scope.init();
        expect(scope.showEdit).to.be.false;
        showPopupFunctionSpy.should.not.have.been.called;
    });

    it('should broadcast event to open popup', function () {
        var broadcastSpy = sinon.spy(rootScope, '$broadcast');

        scope.showNameAndDescriptionPopup();
        timeout.flush();
        broadcastSpy.should.have.been.calledWith('popup-open', {
            id: 'study-name'
        });
    });

    it('should set showErrors to true and not open the publish dialog when there are no questions', function () {
        var openDialogSpy = sinon.spy(scope, '$broadcast');

        scope.study.questions = [];
        scope.publish();
        expect(scope.study.showErrors).to.be.true;
        openDialogSpy.should.not.have.been.called;
    });

    it('should not set showErrors to true and open the publish dialog there are questions', function () {
        var openDialogSpy = sinon.spy(scope, '$broadcast');

        scope.study.questions = [{text: 'Question 1'}, {text: 'Another Question'}];
        scope.publish();
        expect(scope.study.showErrors).to.be.false;
        openDialogSpy.should.have.been.called;
    });


    it('should set showErrors to true and not open the publish dialog when there are no questions', function () {
        var openDialogSpy = sinon.spy(scope, '$broadcast');

        scope.study.questions = [];
        scope.publish();
        expect(scope.study.showErrors).to.be.true;
        expect(scope.study.showErrors).to.be.true;
        openDialogSpy.should.not.have.been.called;
    });


    it('should update status and change state', function () {
        scope.study.$update = function () {
        };

        scope.confirmedPublish();
        stateSpy.should.have.been.calledWith('shell.project.UserResearch.published', {
            studyId: currentStudy._id
        });
    });


    it('should save the study', function () {
        var updateSpy = sinon.spy(scope, 'update'),
            studiesSpy = sinon.spy(studiesServiceMock, 'save');

        scope.study._id = true;
        scope.save();
        updateSpy.should.have.been.called;

        scope.study = {};
        scope.save();
        studiesSpy.should.have.been.called;
    });


    it('should update the study', function () {
        scope.study.$update = function () {
        };
        var studyUpdateSpy = sinon.spy(scope.study, '$update');

        scope.update();
        studyUpdateSpy.should.have.been.called;
    });

    it('should be able to delete a study', function () {
        scope.study.$remove = function (cb) {
            cb();
        };
        var deleteSpy = sinon.spy(scope.study, '$remove');
        scope.delete();
        deleteSpy.should.have.been.called;
        stateSpy.should.have.been.calledWith('shell.project.UserResearch.list');
    });

    it('should allow to Cancel Name Edit', function () {
        var id = scope.study.projectId,
            cancelSpy = sinon.spy(location, 'path');

        scope.study._id = 1;
        scope.onCancelEditName();
        cancelSpy.should.not.have.been.called;
        cancelSpy.reset();

        scope.study._id = null;
        scope.onCancelEditName();
        cancelSpy.should.have.been.calledWith('/norman/projects/' + id + '/research/');
    });

    it('should update imageUploaded status', function () {
        expect(scope.imageUploaded).to.be.falsy;

        scope.$broadcast('image-uploaded');
        expect(scope.imageUploaded).to.be.true;
    });

    it('should open Assets modal window', function () {
        var spy = sinon.spy(rootScope, '$broadcast');

        scope.imageUploaded = false;
        scope.openAssetsModal();
        spy.should.have.been.calledOnce;
        spy.should.have.been.calledWith('dialog-open', 'selectAssetsModal');
        spy.reset();

        scope.imageUploaded = true;
        scope.openAssetsModal();
        spy.should.have.been.calledTwice;
        spy.should.have.been.calledWith('refresh-assets');
        spy.should.have.been.calledWith('dialog-open', 'selectAssetsModal');
    });

    it('should open Preview', function () {
        state.href = function () {
            return 'test';
        };
        $window.open = function () {
        };

        var winSpy = sinon.spy($window, 'open'),
            stateHrefSpy = sinon.spy(state, 'href');

        scope.canPublish = function () {
            return false;
        };
        scope.startPreview();
        winSpy.should.not.have.been.called;
        winSpy.reset();

        scope.canPublish = function () {
            return true;
        };
        scope.startPreview();
        stateHrefSpy.should.have.been.called;
        winSpy.should.have.been.called;
    });

    // test for issue #1071 - ensure that error toast is cleared so that it can re-appear
    it('should make sure that the current error toast is dismissed when validating the study', function () {
        // first create an error by validating a bad study
        scope.study = {questions: []};
        var createSpy = sinon.spy(testUiError, 'create');
        scope.canPublish(true);
        createSpy.should.have.been.called;

        // verify that error is dismissed when validation is called again
        createSpy.reset();
        var dismissSpy = sinon.spy(testUiError, 'dismiss');
        scope.canPublish(true);
        dismissSpy.should.have.been.calledBefore(createSpy);
    });

});

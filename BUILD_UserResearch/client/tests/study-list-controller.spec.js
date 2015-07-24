/*eslint no-unused-expressions: 0*/
'use strict';

describe('Unit tests for StudiesListCtrl', function () {
    var scope,
        state = {
            go: function () {}
        },
        stateSpy = sinon.spy(state, 'go');


    /*** SETUP ************************************************************************************/
    beforeEach(module('UserResearch'));
    beforeEach(module('common.ui.elements'));
    beforeEach(module('shell.aside'));
    beforeEach(module('shell.dashboard'));
    beforeEach(module('shell.projectLandingPage'));

    beforeEach(module('ngResource'));

    beforeEach(inject(function ($rootScope, $controller) {
        scope = $rootScope.$new();
        $controller('StudiesListCtrl', {
            $scope: scope,
            $state: state
        });
    }));
    afterEach(function () {
        stateSpy.reset();
    });
    /*** SETUP ************************************************************************************/



    /*** TESTS ************************************************************************************/
    it('should handle Create Study clicks', function () {
        scope.createStudy();
        stateSpy.should.have.been.calledWith('shell.project.UserResearch.create.screens');
    });


    it('should handle Study clicks', function () {
        scope.studyClick({ status: 'active' });
        stateSpy.should.have.been.calledWith('shell.project.UserResearch.review.overview');
        stateSpy.reset();

        scope.studyClick({ status: 'draft' });
        stateSpy.should.have.been.calledWith('shell.project.UserResearch.edit.screens');
        stateSpy.reset();

        scope.studyClick({ status: 'archived', questions: [{ _id: 1 }] });
        stateSpy.should.have.been.calledWith('shell.project.UserResearch.review.overview');
        stateSpy.reset();
        scope.studyClick({ status: 'none' });
        stateSpy.should.not.have.been.called;
    });


    it('should get the correct status of the study', function () {
        expect(scope.getStatus({ status: 'active' })).to.equal('active');
        expect(scope.getStatus({ status: 'published' })).to.equal('active');
        expect(scope.getStatus({ status: 'paused' })).to.equal('active');

        expect(scope.getStatus({ status: 'draft' })).to.equal('draft');
        expect(scope.getStatus({ status: 'archived' })).to.equal('archived');
    });


    it('should set the correct filter from the status of the study', function () {
        scope.statusFilter = 'active';
        expect(scope.filterByStatus({ status: 'active' })).to.be.true;
        expect(scope.filterByStatus({ status: 'published' })).to.be.true;
        expect(scope.filterByStatus({ status: 'paused' })).to.be.true;

        scope.statusFilter = 'draft';
        expect(scope.filterByStatus({ status: 'draft' })).to.be.true;

        scope.statusFilter = 'archived';
        expect(scope.filterByStatus({ status: 'archived' })).to.be.true;
    });


    it('should count participants in studies', function () {
        scope.studies = [
            { participants: 1 },
            { participants: 2 },
            { participants: 3 }
        ];
        var total = scope.studies.reduce(function (sum, s) {
            return sum + s.participants;
        }, 0);
        scope.getParticipantSum();
        expect(scope.participantSum).to.equal(total);
    });

    it('should set the correct default studies tab', function () {
        scope.studies = [
            { status: 'archived' }
        ];
        expect(scope.getDefaultStatus()).to.equal('archived');
        scope.studies = [
            { status: 'archived' },
            { status: 'draft' }
        ];
        expect(scope.getDefaultStatus()).to.equal('draft');
        scope.studies = [
            { status: 'archived' },
            { status: 'draft' },
            { status: 'paused' }
        ];
        expect(scope.getDefaultStatus()).to.equal('active');
        scope.studies = [
            { status: 'archived' },
            { status: 'draft' },
            { status: 'paused' },
            { status: 'published' }
        ];
        expect(scope.getDefaultStatus()).to.equal('active');
    });

});

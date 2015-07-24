
/*global chai, sinon, inject */
/*eslint no-unused-expressions:0 */
'use strict';
var expect = chai.expect;
var userResearchModule;

 describe('User Research>> Dependencies test for ParticipantInvitationDirectiveCtrl', function () {
    before(function () {
        userResearchModule = angular.module('UserResearch');
    });

    it('User Research module should be registered', function () {
        expect(userResearchModule).not.to.equal(null);
    });


    it('should have a ParticipantInvitationDirectiveCtrl controller', function () {
            expect(userResearchModule.ParticipantInvitationDirectiveCtrl).not.to.equal(null);
    });

});


describe('Unit tests for ParticipantInvitationDirectiveCtrl', function () {
    var scope,
        httpBackend,
        uiError = {
            create: function () {}
        },
        // Mock data
        stateParams = {
            questionId: 'questionId1',
            studyId: 'studyId',
            currentProject: 'projectId'
        },
        currentStudy = {
            name: 'test',
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

        $controller('ParticipantInvitationDirectiveCtrl', {
            $scope: scope,
            $stateParams: stateParams,
            uiError: uiError,
            Studies: {currentStudy: currentStudy}
        });

    }));

    /*** TESTS ************************************************************************************/
    it('should initialize variables', function () {
        expect(scope.countNewInvite).to.equal(0);
        expect(scope.inviteList.length).to.equal(scope.countNewInvite);
    });


    it('should have a properly working ParticipantInvitationDirectiveCtrl controller', function () {
         // new new email
        var email1 = 'a@a.com';
        var email2 = 'a@b.com';
        var emailToRemove = email2;

        scope.addInvitee(email1);
        expect(scope.inviteList.length).to.equal(1);
        expect(scope.countNewInvite).to.equal(1);

        scope.addInvitee(email2);
        expect(scope.inviteList.length).to.equal(2);
        expect(scope.countNewInvite).to.equal(2);

        scope.removeInvite(emailToRemove);
        expect(scope.inviteList.length).to.equal(1);
        expect(scope.countNewInvite).to.equal(1);

        scope.addInvitee(email2);
        expect(scope.inviteList.length).to.equal(2);
        expect(scope.countNewInvite).to.equal(2);


        //Duplicate email
        var uiErrorSpy = sinon.spy(uiError, 'create');
        scope.addInvitee(email1);
        expect(scope.inviteList.length).to.equal(2);
        expect(scope.countNewInvite).to.equal(2);
        uiErrorSpy.should.have.been.called;

        //Regex Test
        var pattern = new RegExp('/^[a-zA-Z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?/');

        var invalidEmail = 'nvalidEmail@';
        expect(pattern.test(invalidEmail)).to.false;

        invalidEmail = 'nvalidEmail@...com';
        expect(pattern.test(invalidEmail)).to.false;

        invalidEmail = 'nvalidEmail.test.com';
        expect(pattern.test(invalidEmail)).to.false;


        });



     /*** TESTS ************************************************************************************/

    afterEach(function () {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });
});




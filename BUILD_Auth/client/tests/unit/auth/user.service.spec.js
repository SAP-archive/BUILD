/**
 * Created by i311181 on 05 Dec 2014.
 */
/*global chai, inject*/
'use strict';

var expect = chai.expect;

var httpBackend;

describe('User Factory', function () {
    var serviceToTest;
    beforeEach(function () {
        module('account');
        inject(function ($httpBackend) {
            var httpBackend = $httpBackend;
            httpBackend.whenGET('/legal/terms/privacy_statement_EN.txt').respond(200);
        });
    });

    beforeEach(function () {
        inject(function (User, $injector) {
            httpBackend = $injector.get('$httpBackend');
            serviceToTest = $injector.get('User');
            // regex to match /api/users/:id/password
            // :id = any combination of a-b, A-b abd 0-9
            var regexUpdatePassword = /\/api\/users\/[a-zA-Z0-9]{1,}\/password/;
            var regexUpdateProfile = /api\/users\/[a-zA-Z0-9]{1,}\/profile/;
            var regexGetMe = /\/api\/users\/me/;
            var regexPostAvatarList = /\/api\/users\/avatar/;
            var regexGETVerifyEmail = /\/api\/users\/0\/verifyEmail/;
            var regexGETresendVerificationEmail = /\/api\/users\/0\/resendVerificationEmail/;

            httpBackend.whenPUT(regexUpdatePassword).respond({res: 'ok'});

            httpBackend.whenPUT(regexUpdateProfile).respond({res: 'ok'});

            httpBackend.whenGET(regexGetMe).respond({res: 'ok'});

            httpBackend.whenGET(regexGETVerifyEmail).respond({res: 'ok'});
            httpBackend.whenGET(regexGETresendVerificationEmail).respond({res: 'ok'});

            httpBackend.whenPOST(regexPostAvatarList).respond([{res: 'ok'}]);

        });

    });


// verifyEmail: { method: 'GET', params: { controller: 'verifyEmail' }},
 // resendVerificationEmail: { method: 'GET', params: { controller: 'resendVerificationEmail' }},

    it('User Factory : Testing get', inject(function () {
        var result = serviceToTest.get();
        httpBackend.flush();
        expect(angular.equals(result.res, 'ok')).to.be.eq(true);

    }));

    it('User Factory : Testing change Password', inject(function () {

        var changePassResult = serviceToTest.changePassword({id: '123'}, {oldPassword: 'oldPassword',
            newPassword: 'newPassword'});
        httpBackend.flush();
        expect(angular.equals(changePassResult.res, 'ok')).to.be.eq(true);

    }));

    it('User Factory : Testing Update Profile', inject(function () {

        var updateProfileResult = serviceToTest.updateProfile({id: '123'}, { name: 'some name'});
        httpBackend.flush();
        expect(angular.equals(updateProfileResult.res, 'ok')).to.be.eq(true);

    }));

    it('User Factory : Testing avatar list', inject(function () {

        var postAvatarListResult = serviceToTest.avatarList({_id: '123'});
        httpBackend.flush();
        expect(angular.equals(postAvatarListResult[0].res, 'ok')).to.be.eq(true);

    }));

     it('User Factory : Testing verify email', inject(function () {

        var result = serviceToTest.verifyEmail({id: '0'}, {token: 'token'});
        httpBackend.flush();
        expect(angular.equals(result.res, 'ok')).to.be.eq(true);

    }));

     it('User Factory : Testing resend verification email', inject(function () {

        var result = serviceToTest.resendVerificationEmail({id: '0'}, {token: 'token'});
        httpBackend.flush();
        expect(angular.equals(result.res, 'ok')).to.be.eq(true);

    }));

       it('User Factory : Testing change Avatar', inject(function () {

        // var result = serviceToTest.changeAvatar({}, {data: 'file'});
        /*httpBackend.flush();
        expect(angular.equals(result.res, 'ok')).to.be.eq(true);*/

    }));

});

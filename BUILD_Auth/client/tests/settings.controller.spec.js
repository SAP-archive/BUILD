/*global chai, sinon, window, inject */
'use strict';

var expect = chai.expect;

describe('Settings Controller', function () {
    var deferred, isSuccessful, rootScope, scope, mockedUiError, mockedHttpError, mockedAuthService;

    function isEmpty(map) {
        for (var key in map) {
            if (map.hasOwnProperty(key)) {
                return false;
            }
        }
        return true;
    }

    beforeEach(module('account.settings'));

    beforeEach(inject(function ($controller, $q, $rootScope) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
        mockedAuthService = {};
        mockedUiError = {
            create: function () {
            },
            dismiss: function () {
            }
        };
        mockedHttpError = {
            create: function () {
            }
        };
        deferred = $q.defer();

        mockedAuthService.getSecurityConfig = function () {
            var def = $q.defer();
            def.resolve({settings: {
                registration: {
                    self: true,
                    social: true
                },
                provider: {
                    local: true
                }
            }
            });
            return def.promise;
        };

        mockedAuthService.updateProfile = function () {
            if (isSuccessful) deferred.resolve();
            else deferred.reject();
            return deferred.promise;
        };

        mockedAuthService.changePassword = function () {
            if (isSuccessful) deferred.resolve();
            else {
                deferred.reject({
                    data: {
                        errors: {
                            password: {
                                message: 'unable to change password'
                            }
                        }
                    }
                });
            }
            return deferred.promise;

        };
        mockedAuthService.getCurrentUser = function () {
            return { name: 'John'};
        };
        mockedAuthService.resendVerificationEmail = function () {
            if (isSuccessful) deferred.resolve();
            else deferred.reject();
            return deferred.promise;
        };
        mockedAuthService.getPasswordPolicy = function () {
            var def = $q.defer();

            def.resolve({
                minLength: 6,
                maxLength: 40,
                digits: {
                    allowed: true,
                    required: true,
                    minOccurrence: 1
                },
                upperCase: {
                    allowed: true,
                    required: true,
                    minOccurrence: 1
                },
                lowerCase: {
                    allowed: true,
                    required: true,
                    minOccurrence: 1
                },
                specialCharacters: {
                    allowed: true,
                    required: true,
                    minOccurrence: 1,
                    // make sure to escape quotes matching surrounding string and backslashes
                    allowedCharacters: '!"#$%&\'()*+,-./:;><=?@[]\\^_`{|}~´'
                },
                bannedPasswords: [
                    'password'
                ],
                bannedCharacterCombination: [
                    '@sap.com'
                ]
            });

            return def.promise;

        };

        $controller('SettingsCtrl', {
            $scope: scope,
            Auth: mockedAuthService,
            uiError: mockedUiError,
            httpError: mockedHttpError
        });

    }));

    it('Test Profile Update Successful', function () {
        var form = {
            name: {$valid: true},
            email: {$valid: true},
            $setPristine: function () {
            }
        };
        expect(isEmpty(scope.errors)).to.be.eq(true);
        expect(typeof scope.getCurrentUser).to.be.eq('function');
        isSuccessful = true;
        scope.profileUpdate(form);
        expect(scope.user.name).to.be.eq('John');
        rootScope.$apply();
        expect(scope.profileMessage).to.be.eq('Profile successfully update.');

    });
    it('Test Profile Update Not Successful', function () {
        var form = {
            name: {$valid: true},
            email: {$valid: true},
            $setValidity: function () {
            }
        };
        expect(isEmpty(scope.errors)).to.be.eq(true);
        expect(typeof scope.getCurrentUser).to.be.eq('function');
        isSuccessful = false;
        scope.profileUpdate(form);
        expect(scope.user.name).to.be.eq('John');
        rootScope.$apply();

    });

    it('Test change password Successful', function () {

        // form mock
        var form = {
            $valid: true
        };

        scope.user = {};
        scope.user.oldPassword = 'password';
        scope.user.newPassword = 'password123';
        scope.user.confirmNewPassword = 'password123';

        expect(isEmpty(scope.errors)).to.be.eq(true);
        expect(typeof scope.getCurrentUser).to.be.eq('function');
        isSuccessful = true;
        scope.changePassword(form);
        rootScope.$apply();
        expect(scope.message).to.be.eq('Password successfully changed.');
    });

    it('Test change Password Not Successful', inject(function ($httpBackend) {
        var form = {
            $valid: true,
            oldPassword: { },
            confirmNewPassword: {
                $setValidity: function () {
                    return true;
                }
            }
        };

        form.oldPassword.$setValidity = function () {
            return true;
        };

        // mocked api
        $httpBackend.expectPUT('/api/users/1/password', {
            email: 'email@email.com',
            password: 'password'
        }).respond(500, {
            data: {
                errors: {
                    password: {
                        message: 'unable to change password'
                    }
                },
                name: 'ValidationError'
            }
        });

        scope.user = {};
        scope.user.oldPassword = 'password';
        scope.user.newPassword = 'password123';
        scope.user.confirmNewPassword = 'password123';

        // var validitySpy = sinon.spy(form.oldPassword, '$setValidity');

        expect(isEmpty(scope.errors.other)).to.be.eq(true);
        isSuccessful = false;
        scope.changePassword(form);
        rootScope.$apply();
        // validitySpy.should.have.been.calledWith('mongoose', false);
        expect(scope.message).to.be.eq('');

    }));

    it('Test change Password Not Successful - Confirm new password not match', function () {

        var form = {
            $valid: true,
            oldPassword: { },
            confirmNewPassword: {
                $setValidity: function () {
                    return true;
                }
            }
        };

        form.confirmNewPassword.$setValidity = function () {
            return true;
        };

        scope.user = {};
        scope.user.oldPassword = 'password';
        scope.user.newPassword = 'password123';
        scope.user.confirmNewPassword = 'password1234';

        var confirmNewPasswordSpy = sinon.spy(form.confirmNewPassword, '$setValidity');

        expect(isEmpty(scope.errors.other)).to.be.eq(true);
        isSuccessful = false;
        scope.changePassword(form);
        rootScope.$apply();
        confirmNewPasswordSpy.should.have.been.calledWith('notMatch', false);
    });

    it('Test resend Verification Email', function () {

        isSuccessful = false;
        scope.resendVerificationEmail();
        rootScope.$apply();

    });

});

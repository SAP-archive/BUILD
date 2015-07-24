'use strict';

var expect = chai.expect;

describe('DataModelEditor Service', function () {
    var dataModelEditorService, httpBackend, scope;
    var blankModel;

    beforeEach(module('norman'));
    beforeEach(module('model'));
    var mockModelErrorInterceptor = {responseError :function(){}};
    beforeEach(module(function ($provide) {
        $provide.value('modelErrorInterceptor', mockModelErrorInterceptor);
    }));
    beforeEach(inject(['dm.ModelEditorService', '$httpBackend', '$rootScope', function (_DataModelEditorService_, $httpBackend, $rootScope) {
        scope = $rootScope;
        dataModelEditorService = _DataModelEditorService_;
        httpBackend = $httpBackend;

    }]));

    afterEach(function() {
        httpBackend.verifyNoOutstandingRequest();
    });

    xit('should allow to create models', function (done) {
        httpBackend.expectPOST('/api/models').respond(function (method, url, data) {
            var parsedData = JSON.parse(data);
            blankModel = {
                projectId: parsedData.projectId,
                name: '',
                layout: '',
                sampleData: null,
                catalog: null,
                entities: []
            };
            return [201, blankModel];
        });

        httpBackend.expectGET('/auth/securityConfig').respond(function (method, url, data) {
            var response = {
                "settings": {
                    "registration": {"self": true, "social": true},
                    "provider": {"local": true},
                    "maxLoginAttempts": 5,
                    "lockTimeInHours": 2,
                    "crypto": {
                        "saltLength": 128,
                        "keyLength": 128,
                        "iterations": 10000,
                        "emailVerifyingTokenLength": 64
                    },
                    "failedLoginReasons": {
                        "notFound": "The email or password you entered is incorrect.",
                        "passwordIncorrect": "The email or password you entered is incorrect.",
                        "maxAttempts": "Your account has been temporarily locked, please try again later."
                    },
                    "passwordPolicy": {
                        "minLength": 6,
                        "maxLength": 13,
                        "digits": {"allowed": true},
                        "upperCase": {"allowed": true},
                        "lowerCase": {"allowed": true},
                        "specialCharacters": {"allowed": true},
                        "bannedPasswords": [],
                        "bannedCharacterCombination": ["@sap.com"]
                    },
                    "errorMessage": "Validation error"
                }
            };
            return [200, response];
        });

        scope.$on('ModelEditorService.modelChanged', function () {
            expect(dataModelEditorService.model.projectId).to.deep.equal('abc123');
            done();
        });
        dataModelEditorService.createBlankModel('abc123');
        httpBackend.flush();
    });
});

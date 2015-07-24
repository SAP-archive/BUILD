'use strict';

var expect = require('norman-testing-tp').chai.expect;
var path = require('path');
var util = require('util');
var commonServer = require('norman-common-server');
var registry = commonServer.registry;

var AccessRestApi = require('../api/AccessRestApi');
var accessApi = new AccessRestApi();

var fs = require('fs');
var defaultRuleId = '*';

var testContext = {
    ip: '::1',
    user: {
        _id: '0',
        name: 'TEST'
    }
};
var emailInBlackList = 'blacklist.in@test.com';

var defaultRule = { "_id" : defaultRuleId,
                    "scope" : [
                    ]
                    };

var domainGuestAccess ={ "_id" : "@test.com",
    "scope" : [
        {
            "name" : "access",
            "permissions" : ["guest"]
        },
        {
            "name" : "study",
            "permissions" : ["participant"]
        },
        {
            "name" : "project",
            "permissions" : ["collaborator"]
        }
    ]
};

var domainNoAccess ={ "_id" : "@noway.com",
    "scope" : [
        {
            "name" : "study",
            "permissions" : ["participant"]
        },
        {
            "name" : "project",
            "permissions" : ["collaborator"]
        }
    ]
};

var userSample = { "_id" : "zUser@test.com",
    "scope" : [
        {
            "name" : "access",
            "permissions" : ["guest"]
        }
    ]
};

var userSampleToDelete = { "_id" : "test@test.com",
    "scope" : [
        {
            "name" : "access",
            "permissions" : ["guest"]
        }
    ]
};

require('../../bin/test-app.js');

function testPassed(done) {
    return function () {
        done();
    };
}
function testFailed(done) {
    return function (err) {
        done(err || new Error('Test failed'));
    };
}

describe('Access services and REST API Test', function() {
    this.timeout(150000);

    before('Initialize Access API ', function (done) {
        accessApi.initialize()
            .then(function() {
                var optOutService = registry.getModule('OptOutService');
                return optOutService.add(emailInBlackList, testContext);
            })
            .then(testPassed(done), testFailed(done));
    });

    after(function (done) {
      accessApi.resetDB(done);
    });

    it("should be exposed through Norman registry", function (done) {
        var accessService = commonServer.registry.getModule("AccessService");
        expect(accessService).to.exist;
        done();
    });

    it("should support create API", function (done) {
        var accessService = commonServer.registry.getModule("AccessService");
        accessService.create(defaultRule, testContext)
            .then(function (createdDefaultRule) {
                expect(createdDefaultRule).to.exist;
                expect(createdDefaultRule._id).to.be.equal(defaultRule['_id']);
                return accessService.create(userSampleToDelete, testContext);
            })
            .then(function (createdUserRule) {
                expect(createdUserRule).to.exist;
                expect(createdUserRule._id).to.be.equal(userSampleToDelete['_id']);
                return accessService.create(userSample, testContext);
            })
            .then(function (createdUserRule) {
                expect(createdUserRule).to.exist;
                expect(createdUserRule._id).to.be.equal(userSample['_id']);
            })
            .then(testPassed(done), testFailed(done));
    });

    it("should not add twice the same id", function (done) {
        var accessService = commonServer.registry.getModule("AccessService");
        accessService.create(domainGuestAccess)
            .then(function (createRule) {
                return accessService.create(domainGuestAccess, testContext);
            })
            .catch(function (err) {
                expect(err).to.exist;
            })
            .then(testPassed(done), testFailed(done));
    });

    it("should support update API", function (done) {
        var accessService = commonServer.registry.getModule("AccessService");
        var updatedDomainSample = {};
        util._extend(updatedDomainSample, domainGuestAccess);
        updatedDomainSample.scope[0]['permissions'][0] = 'standard';
        accessService.update(updatedDomainSample, testContext)
            .then(function (updatedRule) {
                expect(updatedRule.scope[0]['permissions'][0]).to.be.equal('standard');
            })
            .then(testPassed(done), testFailed(done));
    });

    it("should support getAccessById API", function (done) {
        var accessService = commonServer.registry.getModule("AccessService");
        accessService.getAccessById(domainGuestAccess._id)
            .then(function (domainRule) {
                expect(domainRule).to.exist;
                expect(domainRule.scope.length).to.be.equal(3);
            })
            .then(testPassed(done), testFailed(done));
    });

    it("should support set API", function (done) {
        var accessService = commonServer.registry.getModule("AccessService");
        accessService.set(domainNoAccess, testContext)
            .then(function (accessRule) {
                expect(accessRule).to.exist;
                expect(accessRule._id).to.be.equal(domainNoAccess['_id']);
                return accessService.set(domainNoAccess, testContext);
            })
            .then(function (accessRule) {
                expect(accessRule).to.exist;
                expect(accessRule._id).to.be.equal(domainNoAccess['_id']);
            })
            .then(testPassed(done), testFailed(done));
    });

    it("should support get with filtering order", function (done) {
        var accessService = commonServer.registry.getModule("AccessService");
        var options = {};
        options['filter'] = {$in: [ /^@/i, accessService.getDefaultDomainID()] };
        accessService.get(options)
            .then(function (values) {
                expect(values['nbTotalRules']).to.be.equals(5);
                expect(values['accessRules'].length).to.be.equals(3);
                expect(values['accessRules'][0]['_id']).to.be.equals('*');
                expect(values['accessRules'][1]['_id']).to.be.equals('@noway.com');
                expect(values['accessRules'][2]['_id']).to.be.equals('@test.com');
            })
            .then(testPassed(done), testFailed(done));
    });

    it("should support delete API", function (done) {
        var accessService = commonServer.registry.getModule("AccessService");
        accessService.delete(userSampleToDelete._id)
            .then(function () {
                return accessService.get();
            })
            .then(function (values) {
                expect(values['nbTotalRules']).to.be.equals(4);
            })
            .then(testPassed(done), testFailed(done));
    });

    it("should support delete API with an unknown user", function (done) {
        var accessService = commonServer.registry.getModule("AccessService");
        accessService.delete('notKnown@john.doe')
            .then(function () {
                return accessService.get();
            })
            .then(function (values) {
                expect(values['nbTotalRules']).to.be.equals(4);
            })
            .then(testPassed(done), testFailed(done));
    });

    it("should support getPermissions - registered address ", function (done) {
        var accessService = commonServer.registry.getModule("AccessService");
        accessService.getPermissions("zUser@test.com",'access')
            .then(function (permissions) {
                expect(permissions.length).to.be.equals(1);
                expect(permissions[0]).to.be.equals('guest');
            })
            .then(testPassed(done), testFailed(done));
    });

    it("should support getPermissions - unregistered address/registered domain", function (done) {
        var accessService = commonServer.registry.getModule("AccessService");
        accessService.getPermissions("unregisteredUser@test.com",'study')
            .then(function (permissions) {
                expect(permissions.length).to.be.equals(1);
                expect(permissions[0]).to.be.equals('participant');
            })
            .then(testPassed(done), testFailed(done));
    });

    it("should support getPermissions - unregistered address/unregistered domain", function (done) {
        var accessService = commonServer.registry.getModule("AccessService");
        accessService.getPermissions("unregisteredUser@pas.com",'study')
            .then(function (permissions) {
                expect(permissions.length).to.be.equals(0);
            })
            .then(testPassed(done), testFailed(done));
    });

    it("should support getRoles", function (done) {
        var accessService = commonServer.registry.getModule("AccessService");
        var roles = accessService.getRoles('access',['standard']);
        expect(roles.length).to.be.equals(1);
        done();
    });

    it("should support inviteUsers API, study", function (done) {
        var accessService = commonServer.registry.getModule("AccessService");
        accessService.inviteUsers(['toto@test.com', emailInBlackList,'titi@noway.com', 'tutu@noknown.com', userSample['_id']], 'study', testContext)
            .then(function (invitationResult) {
                expect(invitationResult.length).to.be.equals(5);
                invitationResult.forEach(function (invitedUser) {
                    if (invitedUser.emailAddress === 'toto@test.com') {
                        expect(invitedUser.successfullyProvisioned).to.be.equals(true);
                        expect(invitedUser.acceptNotification).to.be.equals(true);
                    } else if (invitedUser.emailAddress === emailInBlackList) {
                        expect(invitedUser.successfullyProvisioned).to.be.equals(true);
                        expect(invitedUser.acceptNotification).to.be.equals(false);
                    } else if (invitedUser.emailAddress === 'titi@noway.com') {
                        expect(invitedUser.successfullyProvisioned).to.be.equals(true);
                        expect(invitedUser.acceptNotification).to.be.equals(true);
                    } else if (invitedUser.emailAddress === 'tutu@noknown.com') {
                        expect(invitedUser.successfullyProvisioned).to.be.equals(false);
                        expect(invitedUser.acceptNotification).to.be.equals(true);
                    } else if (invitedUser.emailAddress === userSample['_id']) {
                        expect(invitedUser.successfullyProvisioned).to.be.equals(true);
                        expect(invitedUser.acceptNotification).to.be.equals(true);
                    }
                })
           })
            .then(testPassed(done), testFailed(done));
    });

    it("should support inviteUsers API, projects", function (done) {
        var accessService = commonServer.registry.getModule("AccessService");
        accessService.inviteUsers(['toto@test.com', emailInBlackList, 'titi@noway.com', 'tutu@noknown.com', userSample['_id']], 'project', testContext)
            .then(function (invitationResult) {
                expect(invitationResult.length).to.be.equals(5);
                invitationResult.forEach(function (invitedUser) {
                    if (invitedUser.emailAddress === 'toto@test.com') {
                        expect(invitedUser.successfullyProvisioned).to.be.equals(true);
                        expect(invitedUser.acceptNotification).to.be.equals(true);
                    } else if (invitedUser.emailAddress === emailInBlackList) {
                        expect(invitedUser.successfullyProvisioned).to.be.equals(true);
                        expect(invitedUser.acceptNotification).to.be.equals(false);
                    } else if (invitedUser.emailAddress === 'titi@noway.com') {
                        expect(invitedUser.successfullyProvisioned).to.be.equals(true);
                        expect(invitedUser.acceptNotification).to.be.equals(true);
                    } else if (invitedUser.emailAddress === 'tutu@noknown.com') {
                        expect(invitedUser.successfullyProvisioned).to.be.equals(false);
                        expect(invitedUser.acceptNotification).to.be.equals(true);
                    } else if (invitedUser.emailAddress === userSample['_id']) {
                        expect(invitedUser.successfullyProvisioned).to.be.equals(true);
                        expect(invitedUser.acceptNotification).to.be.equals(true);
                    }
                })
            })
            .then(testPassed(done), testFailed(done));
    });

    it("should support removeExpirationDate API", function (done) {
        var accessService = commonServer.registry.getModule("AccessService");
        accessService.removeExpirationDate('titi@noway.com', testContext)
            .then(function (updatedRule) {
                expect(updatedRule).to.exist;
                expect(updatedRule.proposed_at).to.be.null;
            })
            .then(testPassed(done), testFailed(done));
    });

    it("should support hasAccess API, positive answer", function (done) {
        var user = {email: 'titi@noway.com'};
        accessApi.hasAccess(user, 200, function (err, res) {
            expect(err).to.be.eq(null);
            expect(res).to.exist;
            expect(res.text).to.be.equals('1');
            done();
        })
    });

    it("should support hasAccess API, negative answer", function (done) {
        var user = {email: 'test@nodomain.com'};
        accessApi.hasAccess(user, 200, function (err, res) {
            expect(err).to.be.eq(null);
            expect(res).to.exist;
            expect(res.text).to.be.equals('0');
            done();
        })
    });
});

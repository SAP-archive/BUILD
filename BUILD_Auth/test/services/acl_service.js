/*eslint no-unused-expressions:0*/
'use strict';
var path = require('path');
var chai = require('norman-testing-tp').chai;
var expect = chai.expect;
var commonServer = require('norman-common-server');
var TEST_TIMEOUT = 30000;
var dummyContext = {
    requestId: 10,
    ip: "10.176.26.228",
    user: {
        _id: "54e4aa5272d2cd74274e92d7",
        name: "Smith"
    },
    request: {
        ip: "10.176.26.229",
        protocol: "my.protocol",
        host: "localhost",
        method: "GET",
        url: 'http://localhost/verifyemail'
    }
};

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
function dropAuthCollections() {
    var db = commonServer.db.connection.getDb('auth');
    return Promise.all([
        Promise.invoke(db, 'dropCollection', 'users'),
        Promise.invoke(db, 'dropCollection', 'authACLresources'),
        Promise.invoke(db, 'dropCollection', 'audits')
    ]);
}

describe('ACL Service', function () {
    if ((this.timeout() > 0 ) && (this.timeout() < TEST_TIMEOUT)) {
        // Do not override explicit timeout settings, e.g. through --timeout command line option when debugging
        this.timeout(TEST_TIMEOUT);
    }
    after(function (done) {
        dropAuthCollections()
            .callback(done);
    });

    it('should be exposed through Norman registry', function () {
        var aclService = commonServer.registry.getModule('AclService');
        expect(aclService).to.exist;
        expect(aclService).to.be.an('object');
    });

    it('getAcl should return ACL façade', function () {
        var aclService = commonServer.registry.getModule('AclService');
        var acl = aclService.getAcl();
        expect(acl).to.exist;
    });


    it('createAdmin >> should create Admin User', function (done) {
        var aclService = commonServer.registry.getModule('AclService');
        aclService.createAdmin({name: 'acladmin', email: 'acladmin@localhost', password: 'FOO-bar123'}, dummyContext)
            .then(function (adminUser) {
                expect(adminUser).to.exist;
                return Promise.invoke(aclService.getAcl(), 'hasRole', adminUser._id.toString(), 'admin');
            })
            .then(function (isAdmin) {
                expect(isAdmin).to.be.true;
            })
            .then(testPassed(done), testFailed(done));
    });

    it('unassignAdmin >> should unassign Admin User', function (done) {
        var aclService = commonServer.registry.getModule('AclService');
        aclService.createAdmin({name: 'acladmin2', email: 'acladmin2@localhost', password: 'FOO-bar123'}, dummyContext)
            .then(function (adminUser) {
                return aclService.unassignAdmin(adminUser, dummyContext);
            })
            .then(function (adminUser) {
                expect(adminUser).to.exist;
                return Promise.invoke(aclService.getAcl(), 'hasRole', adminUser._id.toString(), 'admin');
            })
            .then(function (isAdmin) {
                expect(isAdmin).to.be.false;
            })
            .then(testPassed(done), testFailed(done));
    });

    describe('createAclProjectRoles', function () {
        it ('should create project roles', function (done) {
            var aclService = commonServer.registry.getModule('AclService');
            var projectId = commonServer.utils.shardkey();
            aclService.createAclProjectRoles(projectId, dummyContext)
                .then(function () {
                    return aclService.getAcl().areAnyRolesAllowed('owner-' + projectId, '/' + projectId, 'delete');
                })
                .then(function (isAllowed) {
                    expect(isAllowed).to.be.true;
                })
                .then(testPassed(done), testFailed(done));
        });
    });

    describe('removeProjectRoles', function () {
        it ('should delete project roles', function (done) {
            var aclService = commonServer.registry.getModule('AclService');
            var projectId = commonServer.utils.shardkey();
            aclService.createAclProjectRoles(projectId, dummyContext)
                .then(function () {
                    return aclService.removeProjectRoles(projectId, dummyContext);
                })
                .then(function () {
                    return aclService.getAcl().areAnyRolesAllowed('owner-' + projectId, '/' + projectId, 'delete');
                })
                .then(function (isAllowed) {
                    expect(isAllowed).to.be.false;
                })
                .then(testPassed(done), testFailed(done));
        });
    });

    describe('grantUserRole', function () {
        it ('should grant a role to a user', function (done) {
            var aclService = commonServer.registry.getModule('AclService');
            var projectId = commonServer.utils.shardkey();
            aclService.createAclProjectRoles(projectId, dummyContext)
                .then(function () {
                    return aclService.grantUserRole(dummyContext.user._id, 'owner-' + projectId, dummyContext);
                })
                .then(function () {
                    return aclService.getAcl().hasRole(dummyContext.user._id, 'owner-' + projectId);
                })
                .then(function (hasRole) {
                    expect(hasRole).to.be.true;
                })
                .then(testPassed(done), testFailed(done));
        });
    });



    /* it('removeUserRole>>should remove User Role', function (done) {
     if (skipTests) {
     return done();
     }
     aclService.removeUserRole(1, {});
     var aclSpy = sinon.spy(acl, 'removeUserRoles');
     aclSpy.should.have.been.called();
     done();
     });*/
});

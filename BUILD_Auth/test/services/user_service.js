'use strict';
var path = require('path');
var NormanTestServer = require('norman-testing-server').server;
var chai = require('norman-testing-tp').chai;
var expect = chai.expect;
var TEST_TIMEOUT = 30000;

var Promise = require('norman-promise');
var commonServer = require('norman-common-server');
var user = {
    name: 'Test User',
    email: 'user@servicetest.local',
    principal: 'user@servicetest.local',
    provider: 'local',
    password: 'Minisap'
};
var userToSetDeleted = {
    name: 'Test User For Deletion',
    email: 'userToDelete@servicetest.local',
    principal: 'userToDelete@servicetest.local',
    provider: 'local',
    password: 'Minisap',
    deleted: true
};
var adminUser = {
    name: 'admin user',
    email: 'admin@servicetest.local',
    principal: 'admin@servicetest.local',
    provider: 'local',
    password: 'admin1234'
};
var url = 'http://localhost/verifyemail';
var emailTemplateData = {'url': url};
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
        url: url
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

describe('User Service', function () {
    if ((this.timeout() > 0 ) && (this.timeout() < TEST_TIMEOUT)) {
        // Do not override explicit timeout settings, e.g. through --timeout command line option when debugging
        this.timeout(TEST_TIMEOUT);
    }

    before(function (done) {
        var accessService = commonServer.registry.getModule("AccessService");
        var updatedDefaultDomain = { _id: accessService.getDefaultDomainID(), scope:[{name: 'access', permissions: ['standard']}]};
        accessService.create(updatedDefaultDomain);
        done();
    });


    after(function (done) {
        dropAuthCollections()
            .always(function () {
                //return NormanTestServer.shutdown();
            })
            .callback(done);
    });

    describe('service', function () {
        it('should be exposed through Norman registry', function () {
            var userService = commonServer.registry.getModule('UserService');
            expect(userService).to.exist;
            expect(userService).to.be.an('object');
        });

        it('should return the user model', function () {
            var userService = commonServer.registry.getModule('UserService');
            var userModel = userService.getModel();
            expect(userModel).to.exist;
            expect(userModel).to.be.a('function');
        });
    });

    describe('createLocalAdmin', function () {
        it('should create an admin user', function (done) {
            var userService = commonServer.registry.getModule('UserService');
            userService.createLocalAdmin(adminUser, dummyContext)
                .then(function (doc) {
                    expect(doc).to.exist;
                    expect(doc).to.be.an('object');
                    expect(doc.principal).to.eq(adminUser.principal);
                    expect(doc.email).to.eq(adminUser.email);
                    expect(doc.name).to.eq(adminUser.name);
                    adminUser = doc;
                })
                .then(testPassed(done), testFailed(done));
        });
    });

    describe('CreateUser', function () {
        it('should create a user', function (done) {
            var userService = commonServer.registry.getModule('UserService');
            userService.createUser(user, emailTemplateData, dummyContext)
                .then(function (doc) {
                    expect(doc).to.exist;
                    expect(doc).to.be.an('object');
                    user = doc;
                    expect(doc.email).to.eq(user.email);
                    expect(doc.name).to.eq(user.name);
                    return userService.getUserById(doc._id.toString());
                })
                .then(function (doc) {
                    expect(doc).to.exist;
                    expect(doc).to.be.an('object');
                    expect(doc.email).to.eq(user.email);
                    expect(doc.name).to.eq(user.name);
                })
                .then(testPassed(done), testFailed(done));
        });
    });

    describe('GetUserById', function () {
        it('should retrieve a user from its id', function (done) {
            var userService = commonServer.registry.getModule('UserService');
            userService.getUserById(user._id)
                .then(function (doc) {
                    expect(doc).to.exist;
                    expect(doc).to.be.an('object');
                    expect(doc._id.toString()).to.equal(user._id.toString());
                })
                .then(testPassed(done), testFailed(done));
        });
    });

    describe('getUsers', function () {
        it('should retrieve all users by default', function (done) {
            var userService = commonServer.registry.getModule('UserService');
            userService.getUsers({}, null)
                .then(function (data) {
                    expect(data.users).to.be.instanceof(Array);
                    expect(data.users).length.to.be(2);
                    expect(data.nbUsers).to.eql(2);
                    expect(data.users[0].name).to.eql(adminUser.name);
                    expect(data.users[1].name).to.eql(user.name);
                })
                .then(testPassed(done), testFailed(done));
        });
        it('should find users from their name', function (done) {
            var userService = commonServer.registry.getModule('UserService');
            userService.getUsers({name: 'admin'}, null)
                .then(function (data) {
                    expect(data.users).to.be.instanceof(Array);
                    expect(data.users).length.to.be(1);
                    expect(data.users[0].name).to.eql(adminUser.name);
                    expect(data.nbUsers).to.eql(1);
                    expect(data.nbTotalUsers).to.eql(2);
                })
                .then(testPassed(done), testFailed(done));
        });
        it('should find users from their email', function (done) {
            var userService = commonServer.registry.getModule('UserService');
            userService.getUsers({name: 'admin@servicetest'}, null)
                .then(function (data) {
                    expect(data.users).to.be.instanceof(Array);
                    expect(data.users).length.to.be(1);
                    expect(data.users[0].name).to.eql(adminUser.name);
                    expect(data.nbUsers).to.eql(1);
                    expect(data.nbTotalUsers).to.eql(2);
                })
                .then(testPassed(done), testFailed(done));
        });

        describe('test cases to be cleaned', function () {
            it('Show User>>should retrieve user by id', function (done) {
                var userService = commonServer.registry.getModule('UserService');
                userService.show(user._id)
                    .then(function (doc) {
                        expect(doc).to.exist;
                        expect(doc).to.be.an('object');
                        expect(doc._id.toString()).to.equal(user._id.toString());
                    })
                    .then(testPassed(done), testFailed(done));
            });


            it('GetUserByEmail>>should retrieve user by email', function (done) {
                var userService = commonServer.registry.getModule('UserService');
                userService.GetUserByEmail(user.email)
                    .then(function (doc) {
                        expect(doc).to.exist;
                        expect(doc).to.be.an('object');
                        expect(doc.email.toString()).to.equal(user.email);
                    })
                    .then(testPassed(done), testFailed(done));
            });

            it('GetUser>>should retrieve user by query', function (done) {
                var userService = commonServer.registry.getModule('UserService');
                userService.GetUser({email: user.email})
                    .then(function (doc) {
                        expect(doc).to.exist;
                        expect(doc).to.be.an('object');
                        expect(doc.email.toString()).to.equal(user.email);
                    })
                    .then(testPassed(done), testFailed(done));
            });


            it('Update>>should Update user', function (done) {
                var userService = commonServer.registry.getModule('UserService');
                userService.Update(user._id, {name: 'Updated'})
                    .then(function (doc) {
                        expect(doc).to.exist;
                        expect(doc).to.be.an('object');
                        expect(doc.name).to.equal('Updated');
                    })
                    .then(testPassed(done), testFailed(done));
            });


            it('Avatar>>should return avatar url', function (done) {
                var userService = commonServer.registry.getModule('UserService');
                userService.Update(user._id, {avatar_url: 'Updated'})
                    .then(function (doc) {
                        expect(doc).to.exist;
                        expect(doc).to.be.an('object');
                    })
                    .then(function () {
                        userService.picture(user._id)
                            .then(function (doc) {
                                expect(doc).to.exist;
                                expect(doc).to.be.an('object');
                                expect(doc.avatar_url).to.eq('Updated');
                            });
                    })
                    .then(testPassed(done), testFailed(done));
            });


            it('ChangeAvatar>>should change avatar', function (done) {
                var userService = commonServer.registry.getModule('UserService');
                userService.changeAvatar(user._id, {buffer: 'buffer'}, 'image/png', dummyContext)
                    .then(function (doc) {
                        expect(doc).to.exist;
                        expect(doc).to.be.an('object');
                        expect(doc.avatar_content_type).to.equal('image/png');
                        expect(doc.avatar_url).to.equal('/api/users/' + user._id + '/avatar');
                    })
                    .then(testPassed(done), testFailed(done));
            });

            it('Remove Avatar>>should remove avatar', function (done) {
                var userService = commonServer.registry.getModule('UserService');
                userService.removeAvatar(user._id, dummyContext)
                    .then(function (doc) {
                        expect(doc).to.exist;
                        expect(doc).to.be.an('object');
                        expect(doc.avatar_url).to.not.exist;
                        expect(doc.avatar_content_type).to.not.exist;
                        expect(doc.avatar_bin).to.not.exist;
                    })
                    .then(testPassed(done), testFailed(done));
            });


            it('ChangePassword>>should change user password', function (done) {
                var userService = commonServer.registry.getModule('UserService');
                userService.changePassword(user._id, 'Minisap', 'Minisap1', {context: dummyContext})
                    .then(function (doc) {
                        expect(doc).to.exist;
                        expect(doc).to.be.an('object');
                        expect(doc.password).to.not.eq(user.password);
                    })
                    .then(testPassed(done), testFailed(done));
            });

            it('Update Profile>>should update user profile (name)', function (done) {
                var userService = commonServer.registry.getModule('UserService');
                userService.updateProfile(user._id, {name: 'profile updated', email: user.email}, dummyContext)
                    .then(function (doc) {
                        expect(doc).to.exist;
                        expect(doc).to.be.an('object');
                        expect(doc.name).to.eq('profile updated');
                        expect(doc.email).to.eq(user.email);
                    })
                    .then(testPassed(done), testFailed(done));
            });

            it('Update Profile>>should update user profile (name and email)', function (done) {
                var userService = commonServer.registry.getModule('UserService');
                userService.updateProfile(user._id, {name: 'user1', email: 'local@test.com'}, dummyContext)
                    .then(function (doc) {
                        expect(doc).to.exist;
                        expect(doc).to.be.an('object');
                        expect(doc.name).to.eq('user1');
                        expect(doc.email).to.eq('local@test.com');
                        expect(doc.has_email_verified).to.be.false;
                    })
                    .then(testPassed(done), testFailed(done));
            });

            it('Update Profile>>should update user profile (email)', function (done) {
                var userService = commonServer.registry.getModule('UserService');
                userService.updateProfile(user._id, {name: user.name, email: user.email}, dummyContext)
                    .then(function (doc) {
                        expect(doc).to.exist;
                        expect(doc).to.be.an('object');
                        expect(doc.name).to.eq(user.name);
                        expect(doc.email).to.eq(user.email);
                        expect(doc.has_email_verified).to.be.false;
                    })
                    .then(testPassed(done), testFailed(done));
            });


            it('RequestPwd>>should request password change', function (done) {
                var userService = commonServer.registry.getModule('UserService');
                userService.requestPwd(user.email, {context: dummyContext})
                    .then(function (doc) {
                        expect(doc).to.exist;
                        expect(doc).to.be.an('object');
                        expect(doc.request_password_token).to.exist;
                        expect(doc.request_password_token_expired).to.exist;
                    })
                    .then(testPassed(done), testFailed(done));
            });


            it('RequestPwd>>should resent verification email', function (done) {
                var userService = commonServer.registry.getModule('UserService');
                userService.resendVerificationEmail(user.email, {})
                    .then(function (doc) {
                        expect(doc).to.exist;
                        expect(doc).to.be.an('object');
                        expect(doc.email_verified_token).to.not.eq(user.email_verified_token);
                        expect(doc.email_verified_token_expired).to.not.eq(user.email_verified_token_expired);
                    })
                    .then(testPassed(done), testFailed(done));
            });

            it('To Set Deleted>>should create a user, set deleted flag and retrieve deleted', function (done) {
                var userService = commonServer.registry.getModule('UserService');
                userService.createUser(userToSetDeleted, emailTemplateData, dummyContext)
                    .then(function (doc) {
                        expect(doc).to.exist;
                        expect(doc).to.be.an('object');
                        expect(doc.deleted).to.eq(true);
                    })
                    .then(function () {
                        userService.listDeleted()
                            .then(function (users) {
                                expect(users).to.exist;
                                expect(doc).to.be.an('Array');
                                expect(users.length).to.eq(1);
                                expect(users[0].email).to.eq(userToSetDeleted.email);
                                expect(users[0].name).to.eq(userToSetDeleted.name);
                            });
                    })
                    .then(testPassed(done), testFailed(done));
            });
        });
    })
});

/*global chai, inject, sinon */
/*eslint no-unused-expressions:0 */
'use strict';

var expect = chai.expect;

describe('AdminService', function () {
    var adminService, asideService, rootScope, log,
        auth = function () {
            return {
                getCurrentUser: function () {
                    return {
                        $promise: {
                            then: function (cb) {
                                cb({ acl_roles: ['admin'] });
                            }
                        }
                    };
                }
            };
        };

    beforeEach(module('shell.admin'));
    beforeEach(module('shell.aside'));
    beforeEach(function () {
        module(function ($provide) {
            $provide.service('Auth', auth);
        });
    });
    beforeEach(inject(function ($injector, $rootScope, $log, AdminService) {
        rootScope = $rootScope;
        log = $log;
        adminService = AdminService;
        asideService = $injector.get('AsideFactory');
    }));




    it('should initialise', function () {
        expect(adminService).not.to.be.empty;
        expect(adminService.init).to.be.a('function');
        expect(adminService.items.length).to.be.equal(0);
    });


    it('should inject admin section to aside', function () {
        adminService.init();
        expect(asideService.menuItems.length).to.equal(1);  // admin section injected
    });


    it('should accept items', function () {
        var spy = sinon.spy(log, 'warn');

        adminService.push({ name: 'one', state: 'one' });
        expect(adminService.items.length).to.be.equal(1);

        adminService.push({ name: 'two', state: 'two' });
        expect(adminService.items.length).to.be.equal(2);

        adminService.push({ name: 'two', state: 'two' });
        spy.should.have.been.called;
        expect(adminService.items.length).to.be.equal(2);
    });


    it('should update on state change', function () {
        var spy = sinon.spy(adminService, 'updateAside');
        spy.should.not.have.been.called;
        spy.reset();

        adminService.init();
        rootScope.$broadcast('$stateChangeStart');
        spy.should.have.been.called;
    });

});



describe('AdminService - Non-Admin', function () {
    var adminService, asideService,
        auth = function () {
            return {
                getCurrentUser: function () {
                    return {
                        $promise: {
                            then: function (cb) {
                                cb({ acl_roles: ['user'] });
                            }
                        }
                    };
                }
            };
        };

    beforeEach(module('shell.admin'));
    beforeEach(module('shell.aside'));
    beforeEach(function () {
        module(function ($provide) {
            $provide.service('Auth', auth);
        });
    });
    beforeEach(inject(function ($injector, AdminService) {
        adminService = AdminService;
        asideService = $injector.get('AsideFactory');
    }));



    it('should initialise', function () {
        expect(adminService).not.to.be.empty;
        expect(adminService.init).to.be.a('function');
        expect(adminService.items.length).to.be.equal(0);
    });


    it('should not inject admin section to aside', function () {
        adminService.init();
        expect(asideService.menuItems.length).to.equal(0);  // admin section not injected
    });

});


describe('AdminService - No Auth', function () {
    var adminService, asideService,
        auth = function () {
            return {
                getCurrentUser: function () {
                    return {};
                }
            };
        };

    beforeEach(module('shell.admin'));
    beforeEach(module('shell.aside'));
    beforeEach(function () {
        module(function ($provide) {
            $provide.service('Auth', auth);
        });
    });
    beforeEach(inject(function ($injector, AdminService) {
        adminService = AdminService;
        asideService = $injector.get('AsideFactory');
    }));



    it('should initialise', function () {
        expect(adminService).not.to.be.empty;
        expect(adminService.init).to.be.a('function');
        expect(adminService.items.length).to.be.equal(0);
    });


    it('should not inject admin section to aside', function () {
        adminService.init();
        expect(asideService.menuItems.length).to.equal(0);  // admin section not injected
        expect(adminService.updateAside()).to.be.empty;
    });

});

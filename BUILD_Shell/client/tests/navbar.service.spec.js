/*global chai, inject */
/*eslint no-unused-expressions: 0*/
'use strict';

var expect = chai.expect;

describe('NavbarFactory', function () {
    var navBarService;

    beforeEach(module('shell.navbar'));
    beforeEach(inject(function ($injector) {
        navBarService = $injector.get('NavBarService');
    }));



    it('should get & push items', function () {
        expect(navBarService.menuItems).to.be.a('array');
        expect(navBarService.menuItems.length).to.equal(0);

        navBarService.push({ state: 'some.state', priority: 1, icon: 'fa-icon', name: 'test 1' });
        expect(navBarService.menuItems.length).to.equal(1);

        navBarService.push({ state: 'some.state', priority: 2, icon: 'fa-icon', name: 'test 1' });
        expect(navBarService.menuItems.length).to.equal(2);
    });


    it('should set NavBar Heading correctly', function () {
        expect(navBarService.heading).to.be.eq('');
        navBarService.updateHeading('Norman Project X');

        expect(navBarService.heading).to.be.eq('Norman Project X');
        navBarService.updateHeading();

        expect(navBarService.heading).to.be.eq('');
        try {
            navBarService.updateHeading({key: 'value'});
        }
        catch (error) {
            expect(error).to.not.eq(null);
            expect(error.message).to.eq('Cannot set Heading as a non String');
        }

        var undefinedVar;
        try {
            navBarService.updateHeading(undefinedVar);
        }
        catch (error) {
            expect(error).to.not.eq(null);
            expect(error.message).to.eq('Cannot set Heading as a non String');
        }
    });



    it('should show and hide', function () {
        expect(navBarService.hidden).to.equal(false);

        navBarService.hide();
        expect(navBarService.hidden).to.equal(true);

        navBarService.show();
        expect(navBarService.hidden).to.equal(false);
    });


    it('should set logoState', function () {
        expect(navBarService.logoState).to.be.undefined;

        navBarService.setLogoState('test-url');
        expect(navBarService.logoState).to.equal('test-url');
    });


});

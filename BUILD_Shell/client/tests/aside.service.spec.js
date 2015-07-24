/*global chai, inject */
'use strict';

var expect = chai.expect;

describe('AsideFactory', function () {
    var asideService, scope;


    beforeEach(module('shell.aside'));



    it('should handle get & push with $broadcast', function () {
        inject(function ($rootScope, $injector) {
            scope = $rootScope.$new();
            asideService = $injector.get('AsideFactory');
            var items = asideService.menuItems;

            expect(items).to.be.a('Array');
            expect(items.length).to.equal(0);

            asideService.push({
                state: 'some.state',
                priority: 1,
                icon: 'fa-icon',
                name: 'test 1'
            });

            expect(items.length).to.equal(1);
            asideService.push({
                state: 'some.state',
                priority: 2,
                icon: 'fa-icon',
                name: 'test 2'
            });

            // cannot add item with same name twice
            expect(items.length).to.equal(2);

            asideService.push({
                state: 'some.state',
                priority: 2,
                icon: 'fa-icon',
                name: 'test 3 '
            });

            scope.$on('shell.aside.updated', function () {
                expect(items.length).to.be.at.least(1);
                items = asideService.get();
            });

            expect(items.length).to.equal(3);
            // inject 2 more - to test merging items
            asideService.push({ state: 'some.state', priority: 2, icon: 'fa-icon', name: 'test 3 ' });
            asideService.push({ state: 'some.state', priority: 2, icon: 'fa-icon', name: 'test 3 ' });
            expect(items.length).to.equal(3);

        });
    });



    it('should show and hide', function () {
        inject(function ($injector) {

            asideService = $injector.get('AsideFactory');
            expect(asideService.hidden).to.equal(false);

            asideService.hide();
            expect(asideService.hidden).to.equal(true);

            asideService.show();
            expect(asideService.hidden).to.equal(false);
        });

    });



});

/*global chai, inject */
'use strict';

var expect = chai.expect;

describe('initials Filter', function () {
    var filter;

    beforeEach(module('shell.aside'));
    beforeEach(inject(function ($filter) {
        filter = $filter('initials');
    }));


    it('should return empty string if no input', function () {
        var hs = filter();
        expect(hs).to.be.eq('');
    });

    it('should return initials for 1 word', function () {
        var hs = filter('Eminem');
        expect(hs).to.be.eq('E');
    });

    it('should return initials for 2 words', function () {
        var hs = filter('Homer Simpson');
        expect(hs).to.be.eq('HS');
        expect(hs).to.not.be.eq('hs');
    });

    it('should return initials for >2 words', function () {
        var jr = filter('John Ronald Reuel Tolkien');
        expect(jr).to.not.be.eq('jrrt');
        expect(jr).to.be.eq('JT');
        expect(jr).to.not.be.eq('jr');
    });


});

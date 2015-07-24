'use strict';

var expect = chai.expect;

describe('globals Service', function () {
    beforeEach(module('globals'));

    it('Test \'displayNonPersistant\'', inject(function (globals) {
        expect(globals.displayNonPersistant).to.be.eq(false);
        globals.displayNonPersistant = true;
        expect(globals.displayNonPersistant).to.be.eq(true);
    }));

});

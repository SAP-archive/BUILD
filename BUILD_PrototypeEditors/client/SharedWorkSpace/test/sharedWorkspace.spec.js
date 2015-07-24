'use strict';

var expect = chai.expect;

describe('Client module', function() {

    beforeEach(module('sharedWorkspace'));

    it('should have sharedWorkspace module', function() {
        expect(1).to.be.equal(1);
    });

});

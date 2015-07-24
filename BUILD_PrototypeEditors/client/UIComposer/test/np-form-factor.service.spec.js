'use strict';
(function () {

    var expect = chai.expect;

    describe('Service: np-form-factor', function () {
        var npFormFactor;

        beforeEach(module('uiComposer.uiEditor'));

        beforeEach(inject(function (_npFormFactor_) {
            npFormFactor = _npFormFactor_;
        }));

        it('should return the available form factors', function () {
            expect(npFormFactor.getAvailableFormFactors()).to.be.an('array');
        });

        it('should provide a way to store and retrieve the currently selected form factor', function () {
            var currentFormFactor = {
                id: 'someId'
            };
            npFormFactor.setCurrentFormFactor(currentFormFactor);
            expect(npFormFactor.getCurrentFormFactor()).to.be.equal(currentFormFactor);
        });
    });
})();

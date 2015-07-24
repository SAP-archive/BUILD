'use strict';
(function () {

    var expect = chai.expect;

    describe('Service: np-canvas-inline-edit-helper', function () {
        var inlineEditHelper;

        beforeEach(module('uiComposer.uiCanvas'));

        beforeEach(function () {
            inject(function ($injector) {
                inlineEditHelper = $injector.get('npCanvasInlineEditHelper');
            });
        });

        it('should call registered listeners on inline edit start with the provided args', function () {
            var listener = sinon.stub();
            inlineEditHelper.startListening(listener);
            inlineEditHelper.startInlineEdit(1, 2, 3);
            expect(listener.calledWith(1, 2, 3)).to.be.ok;
        });

        it('should not call the listener after unregistering', function () {
            var listener = sinon.stub();
            var unregister = inlineEditHelper.startListening(listener);
            inlineEditHelper.startInlineEdit(1, 2, 3);
            expect(listener.calledOnce).to.be.ok;

            unregister();
            inlineEditHelper.startInlineEdit(1, 2, 3);
            expect(listener.calledOnce).to.be.ok;
        });

        it('should return the current inline edit status', function () {
            expect(inlineEditHelper.isInlineEditing()).to.be.equal(false);
            inlineEditHelper.startInlineEdit(1, 2, 3);
            expect(inlineEditHelper.isInlineEditing()).to.be.equal(true);
            inlineEditHelper.stopInlineEdit();
            expect(inlineEditHelper.isInlineEditing()).to.be.equal(false);
        });

    });
})();

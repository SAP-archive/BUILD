'use strict';
(function () {

    var expect = chai.expect;

    describe('Service: np-keyboarder-helper', function () {
        var npKeyboarderHelper, npConstants;

        beforeEach(module('uiComposer.services'));
        beforeEach(module('uiComposer.uiEditor'));

        beforeEach(function () {
            inject(function (_npKeyboarderHelper_, _npConstants_) {
                npKeyboarderHelper = _npKeyboarderHelper_;
                npConstants = _npConstants_;
            });
        });

        it('should not perform custom operations by default when an editable textfield is focused', function () {
            _.forEach(npConstants.keymap, function (key) {
                if (key === npConstants.keymap.Enter || key === npConstants.keymap.Escape) {
                    return;
                }
                var event = {
                    key: npConstants.keymap[key],
                    srcElement: {
                        tagName: 'INPUT',
                        type: 'TEXT',
                        preventDefault: sinon.stub()
                    }
                };
                expect(npKeyboarderHelper.shouldPerformCustomOperation(event)).to.be.equal(false);
            });
        });

        it('should perform custom operations for certain keys even when a textfield is focused', function () {
            var event = {
                key: npConstants.keymap.Enter,
                srcElement: {
                    tagName: 'INPUT',
                    type: 'TEXT',
                    preventDefault: sinon.stub()
                }
            };
            expect(npKeyboarderHelper.shouldPerformCustomOperation(event)).to.be.equal(true);

            event.key = npConstants.keymap.Escape;
            expect(npKeyboarderHelper.shouldPerformCustomOperation(event)).to.be.equal(true);
        });

        it('should perform custom operations by default when a readonly textfield is focused', function () {
            _.forEach(npConstants.keymap, function (key) {
                var event = {
                    key: npConstants.keymap[key],
                    srcElement: {
                        tagName: 'INPUT',
                        type: 'TEXT',
                        readOnly: true
                    },
                    preventDefault: sinon.stub()
                };
                expect(npKeyboarderHelper.shouldPerformCustomOperation(event)).to.be.equal(true);
            });
        });

        it('should perform custom operations by default when no textfield is focused', function () {
            _.forEach(npConstants.keymap, function (key) {
                var event = {
                    key: npConstants.keymap[key],
                    srcElement: {
                        tagName: 'NO-INPUT'
                    },
                    preventDefault: sinon.stub()
                };
                expect(npKeyboarderHelper.shouldPerformCustomOperation(event)).to.be.equal(true);
            });
        });

        it('should prevent the default back navigation on backspace if a custom operation should be performed', function () {
            var preventDefault = sinon.stub();
            var event = {
                key: npConstants.keymap.Backspace,
                srcElement: {
                    tagName: 'NO-INPUT'
                },
                preventDefault: preventDefault
            };
            var shouldPerformCustomOperation = npKeyboarderHelper.shouldPerformCustomOperation(event);
            expect(shouldPerformCustomOperation).to.be.equal(true);
            expect(preventDefault.called).to.be.ok;
        });

        it('should not prevent the default action on backspace when a textfield is focused', function () {
            var preventDefault = sinon.stub();
            var event = {
                key: npConstants.keymap.Backspace,
                srcElement: {
                    tagName: 'INPUT',
                    type: 'TEXT'
                },
                preventDefault: preventDefault
            };
            var shouldPerformCustomOperation = npKeyboarderHelper.shouldPerformCustomOperation(event);
            expect(shouldPerformCustomOperation).to.be.equal(false);
            expect(preventDefault.called).to.be.equal(false);
        });

        it('should prevent the window from scrolling left on left arrow key when a textfield is focused', function () {
            var preventDefault = sinon.stub();
            var event = {
                key: npConstants.keymap.ArrowLeft,
                srcElement: {
                    tagName: 'INPUT',
                    type: 'TEXT',
                    value: 'Button',
                    selectionStart: 0
                },
                preventDefault: preventDefault
            };
            var shouldPerformCustomOperation = npKeyboarderHelper.shouldPerformCustomOperation(event);
            expect(shouldPerformCustomOperation).to.be.equal(false);
            expect(preventDefault.called).to.be.equal(true);
        });

        it('should prevent the window from scrolling right on right arrow key when a textfield is focused', function () {
            var preventDefault = sinon.stub();
            var event = {
                key: npConstants.keymap.ArrowRight,
                srcElement: {
                    tagName: 'INPUT',
                    type: 'TEXT',
                    value: 'Button',
                    selectionStart: 6
                },
                preventDefault: preventDefault
            };
            var shouldPerformCustomOperation = npKeyboarderHelper.shouldPerformCustomOperation(event);
            expect(shouldPerformCustomOperation).to.be.equal(false);
            expect(preventDefault.called).to.be.equal(true);
        });

        it('should prevent the default undo to avoid conflicts with our own implementation', function () {
            var preventDefault = sinon.stub();
            var event = {
                key: npConstants.keymap.z,
                metaKey: true,
                srcElement: {
                    tagName: 'INPUT',
                    type: 'TEXT'
                },
                preventDefault: preventDefault
            };
            var shouldPerformCustomOperation = npKeyboarderHelper.shouldPerformCustomOperation(event);
            expect(shouldPerformCustomOperation).to.be.equal(true);
            expect(preventDefault.called).to.be.equal(true);
        });

        it('should prevent the default redo to avoid conflicts with our own implementation', function () {
            var preventDefault = sinon.stub();
            var event = {
                key: npConstants.keymap.z,
                metaKey: true,
                shiftKey: true,
                srcElement: {
                    tagName: 'INPUT',
                    type: 'TEXT'
                },
                preventDefault: preventDefault
            };
            var shouldPerformCustomOperation = npKeyboarderHelper.shouldPerformCustomOperation(event);
            expect(shouldPerformCustomOperation).to.be.equal(true);
            expect(preventDefault.called).to.be.equal(true);
        });
    });
})();

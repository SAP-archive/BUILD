'use strict';
(function () {

    var expect = chai.expect,
        triggerKeyEvent = window.triggerKeyEvent;

    describe('Service: np-keyboarder', function () {
        var $document, npKeyboarder, npConstants,
            userOS;

        beforeEach(module('uiComposer.services'));
        beforeEach(module('uiComposer.uiEditor'));

        beforeEach(inject(function (_$document_, _npConstants_, _npKeyboarder_, npUserInfo, npKeyboarderHelper) {
            $document = _$document_;
            npConstants = _npConstants_;
            npKeyboarder = _npKeyboarder_;

            userOS = npUserInfo.getUserOS();

            sinon.stub(npKeyboarderHelper, 'shouldPerformCustomOperation', function () {
                return true;
            });
        }));

        describe('single key presses without modifiers', function () {
            it('should execute a callback for a certain key', function () {
                var stub = sinon.stub();
                npKeyboarder.on(npConstants.keymap.Enter, stub);
                triggerKeyEvent(npConstants.keymap.Enter, 'keydown', $document[0]);
                expect(stub.called).to.be.equal(true);
            });

            it('should not execute that callback after unsubscription', function () {
                var stub = sinon.stub(),
                    listenerId = npKeyboarder.on(npConstants.keymap.Enter, stub);
                npKeyboarder.off(listenerId);
                triggerKeyEvent(npConstants.keymap.Enter, 'keydown', $document[0]);
                expect(stub.called).to.be.equal(false);
            });

            it('should not execute the callback if no custom operations are to be executed for the given event', inject(function (npKeyboarderHelper) {
                npKeyboarderHelper.shouldPerformCustomOperation.restore();
                sinon.stub(npKeyboarderHelper, 'shouldPerformCustomOperation', function () {
                    return false;
                });
                var cb = sinon.stub();
                npKeyboarder.on(npConstants.keymap.Enter, cb);
                triggerKeyEvent(npConstants.keymap.Enter, 'keydown', $document[0]);
                expect(cb.called).to.be.equal(false);
            }));

            it('should support operating system specific callbacks', function () {
                var stub = sinon.stub(),
                    listenerId = npKeyboarder.on(npConstants.keymap.Enter, stub, [], [userOS]);
                expect(listenerId).to.not.be.equal(-1);

                // assign something that is not true
                if (userOS !== npConstants.os.Windows) {
                    userOS = npConstants.os.Windows;
                }
                else {
                    userOS = npConstants.os.Linux;
                }
                listenerId = npKeyboarder.on(npConstants.keymap.Enter, stub, [], [userOS]);
                expect(listenerId).to.be.equal(-1);
            });

            it('should not register a callback if incorrect arguments are passed (non supported key)', function () {
                var listenerId = npKeyboarder.on('Enterrrrr', sinon.stub());
                expect(listenerId).to.be.equal(-1);
            });

            it('should not register a callback if incorrect arguments are passed (no callback function provided)', function () {
                var listenerId = npKeyboarder.on(npConstants.keymap.Enter, 'no function');
                expect(listenerId).to.be.equal(-1);
            });
        });

        describe('key events that include modifier keys', function () {
            it('should execute a callback for a certain key/modifier combination', function () {
                var cb = sinon.stub();
                npKeyboarder.on(npConstants.keymap.c, cb, [npConstants.modifierKeys.Control]);
                triggerKeyEvent(npConstants.keymap.c, 'keydown', $document[0]);
                expect(!cb.called).to.be.ok;
                triggerKeyEvent(npConstants.keymap.c, 'keydown', $document[0], [npConstants.modifierKeys.Control]);
                expect(cb.called).to.be.ok;
            });

            it('should not execute the callback for a certain key/modifier combination if too many/little modifiers are pressed', function () {
                var cb = sinon.stub();
                npKeyboarder.on(npConstants.keymap.c, cb, [npConstants.modifierKeys.Control, npConstants.modifierKeys.Shift]);
                triggerKeyEvent(npConstants.keymap.c, 'keydown', $document[0], [npConstants.modifierKeys.Control]);
                expect(!cb.called).to.be.ok;
                triggerKeyEvent(npConstants.keymap.c, 'keydown', $document[0], [npConstants.modifierKeys.Shift]);
                expect(!cb.called).to.be.ok;
                triggerKeyEvent(npConstants.keymap.c, 'keydown', $document[0], [npConstants.modifierKeys.Control, npConstants.modifierKeys.Shift, npConstants.modifierKeys.Alt]);
                expect(!cb.called).to.be.ok;
                triggerKeyEvent(npConstants.keymap.c, 'keydown', $document[0], [npConstants.modifierKeys.Shift, npConstants.modifierKeys.Control]);
                expect(cb.called).to.be.ok;
            });
        });

        describe('suspension of key events', function () {
            it('should provide a way to suspend and resume all listeners', function () {
                var cb = sinon.stub();
                npKeyboarder.on(npConstants.keymap.Enter, cb);
                triggerKeyEvent(npConstants.keymap.Enter, 'keydown', $document[0]);
                expect(cb.callCount).to.be.equal(1);

                npKeyboarder.suspendListeners();
                triggerKeyEvent(npConstants.keymap.Enter, 'keydown', $document[0]);
                expect(cb.callCount).to.be.equal(1);

                npKeyboarder.resumeListeners();
                triggerKeyEvent(npConstants.keymap.Enter, 'keydown', $document[0]);
                expect(cb.callCount).to.be.equal(2);
            });

            it('should allow exceptions when suspending listeners (suspend all but ...)', function () {
                var cb1 = sinon.stub(),
                    cb2 = sinon.stub(),
                    listener1 = npKeyboarder.on(npConstants.keymap.Enter, cb1);
                npKeyboarder.on(npConstants.keymap.Enter, cb2);

                npKeyboarder.suspendListeners([listener1]);
                triggerKeyEvent(npConstants.keymap.Enter, 'keydown', $document[0]);
                expect(cb1.callCount).to.be.equal(1);
                expect(cb2.callCount).to.be.equal(0);

                npKeyboarder.resumeListeners();
                triggerKeyEvent(npConstants.keymap.Enter, 'keydown', $document[0]);
                expect(cb1.callCount).to.be.equal(2);
                expect(cb2.callCount).to.be.equal(1);
            });
        });
    });
})();

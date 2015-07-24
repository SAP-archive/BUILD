'use strict';
(function () {

    var expect = chai.expect,
        triggerKeyEvent = window.triggerKeyEvent;

    describe('Directive: np-canvas-element-delete', function () {
        var elem, scope, $rootScope, $document,
            npGridMock, npPageMetadataMock;

        var canDeleteElement = function () {
            return true;
        };

        beforeEach(function () {
            npGridMock = {
                _selectedElements: [{
                    controlMd: {
                        controlId: 'control1'
                    },
                    canDeleteElement: canDeleteElement
                }, {
                    controlMd: {
                        controlId: 'control2'
                    },
                    canDeleteElement: canDeleteElement
                }],
                getSelectedElements: function () {
                    return this._selectedElements;
                }
            };

            npPageMetadataMock = {
                deleteControl: function () {
                }
            };

            module('uiComposer.uiCanvas');
            module('uiComposer.uiEditor');
            module('uiComposer.services');

            module(function ($provide) {
                $provide.value('npGrid', npGridMock);
                $provide.value('npPageMetadata', npPageMetadataMock);
            });

            inject(function (_$rootScope_, _$document_, $compile, npKeyboarderHelper) {
                sinon.stub(npKeyboarderHelper, 'shouldPerformCustomOperation', function () {
                    return true;
                });

                $rootScope = _$rootScope_;
                $document = _$document_;
                elem = angular.element('<div np-canvas-element-delete></div>');
                scope = $rootScope.$new();
                elem = $compile(elem)(scope);
                scope.$digest();
            });
        });

        it('should get all selected elements and delete them when delete key is pressed', function () {
            var getSelectedElementsSpy = sinon.spy(npGridMock, 'getSelectedElements'),
                deleteControlSpy = sinon.spy(npPageMetadataMock, 'deleteControl');
            triggerKeyEvent('Delete', 'keydown', $document[0]);
            expect(getSelectedElementsSpy.calledOnce).to.be.equal(true);
            expect(deleteControlSpy.calledOnce).to.be.equal(true);
            // first call, first args, first elem
            expect(deleteControlSpy.args[0][0][0]).to.be.equal(npGridMock._selectedElements[0].controlMd.controlId);
            expect(deleteControlSpy.args[0][0][1]).to.be.equal(npGridMock._selectedElements[1].controlMd.controlId);
        });

        it('should get all selected elements and delete them when backspace key is pressed', function () {
            var getSelectedElementsSpy = sinon.spy(npGridMock, 'getSelectedElements'),
                deleteControlSpy = sinon.spy(npPageMetadataMock, 'deleteControl');
            triggerKeyEvent('Backspace', 'keydown', $document[0]);
            expect(getSelectedElementsSpy.calledOnce).to.be.equal(true);
            expect(deleteControlSpy.calledOnce).to.be.equal(true);
            // first call, first args, first elem
            expect(deleteControlSpy.args[0][0][0]).to.be.equal(npGridMock._selectedElements[0].controlMd.controlId);
            expect(deleteControlSpy.args[0][0][1]).to.be.equal(npGridMock._selectedElements[1].controlMd.controlId);
        });

        it('should remove keyboard listeners when scope is destroyed', inject(function (npKeyboarder) {
            var keyboarderOffSpy = sinon.spy(npKeyboarder, 'off');
            scope.$emit('$destroy');
            expect(keyboarderOffSpy.callCount).to.be.equal(2);
        }));
    });
})();

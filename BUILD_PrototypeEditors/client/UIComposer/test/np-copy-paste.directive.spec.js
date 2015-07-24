//(function () {
//
//    'use strict';
//
//    var expect = chai.expect,
//        triggerKeyEvent = window.triggerKeyEvent;
//
//    describe('Directive: np-copy-paste', function () {
//        var elem, scope, $document, npConstants, userOS,
//            npGridMock, npUiCanvasAPIMock, npCanvasElementDropMock, npPageMetadataMock;
//        var getControlDataSpy, getSelectedElementsSpy, dropAtTargetSpy, addChildSpy;
//
//        beforeEach(module(function ($provide) {
//            $provide.value('jQuery', window['norman-jquery']);
//        }));
//
//        beforeEach(module('uiComposer.uiCanvas'));
//        beforeEach(module('uiComposer.uiEditor'));
//        beforeEach(module('uiComposer.services'));
//
//        beforeEach(function () {
//            npGridMock = {
//                _gridElements: [{
//                    elementId: 0,
//                    selected: true,
//                    control: {
//                        domRef: function () {
//                            return '<div style="height: 10px; width:20px; top:20px; left:10px" data-element-id = 0></div>';
//                        },
//                        name: 'sap.m.ObjectListItem'
//                    },
//                    isPageElement: function () {
//                        return false;
//                    }
//                }, {
//                    elementId: 1,
//                    selected: true,
//                    control: {
//                        domRef: function () {
//                            return '<div style="height: 24px; width:100px; top:5px; left:5px;" data-element-id = 1></div>';
//                        },
//                        name: 'sap.m.ActionList'
//                    },
//                    isPageElement: function () {
//                        return false;
//                    }
//                }, {
//                    elementId: 2,
//                    selected: true,
//                    control: {
//                        domRef: function () {
//                            return '<div style="height: 400px; width:32px; top:100px; left:100px;" data-element-id = 2></div>';
//                        },
//                        name: 'sap.m.Bar'
//                    },
//                    isPageElement: function () {
//                        return false;
//                    }
//                }],
//                getSelectedElements: function () {
//                    return this._gridElements;
//                },
//                getElement: function (id) {
//                    return this._gridElements[id];
//                },
//                refreshGrid: function () {
//
//                },
//                getElementForControl: function () {
//                    return {
//
//                    };
//                },
//                setSelectedElements: sinon.stub()
//            };
//
//            npUiCanvasAPIMock = {
//
//                addChild: function () {
//                    return {
//                        then: function (cb) {
//                            cb([]);
//                        }
//
//                    };
//                },
//                getControlData: function () {
//                    return {
//
//                    };
//                },
//                getControlDomRefByMd: function (control) {
//                    return control.domRef();
//
//                },
//                getCatalogName: function (control) {
//                    return control.name;
//                },
//                getParent: function () {
//                    return 'root';
//                },
//                isRootChild: function (control) {
//                    if (control.name === 'sap.m.ActionList' || control.name === 'sap.m.Bar') {
//                        return true;
//                    } else {
//                        return false;
//                    }
//                },
//                setAction: sinon.stub()
//
//            };
//
//            npCanvasElementDropMock = {
//                dropAtTarget: function () {
//                    return {
//                        then: function (cb) {
//                            cb([]);
//                        }
//
//                    };
//                }
//            };
//
//            npPageMetadataMock = {
//                getCurrentPageName: function () {
//                    return '#s1';
//                }
//            };
//
//            module(function ($provide) {
//                getSelectedElementsSpy = sinon.spy(npGridMock, 'getSelectedElements');
//                getControlDataSpy = sinon.spy(npUiCanvasAPIMock, 'getControlData');
//                dropAtTargetSpy = sinon.spy(npCanvasElementDropMock, 'dropAtTarget');
//                addChildSpy = sinon.spy(npUiCanvasAPIMock, 'addChild');
//
//                $provide.value('npGrid', npGridMock);
//                $provide.value('npUiCanvasAPI', npUiCanvasAPIMock);
//                $provide.value('npCanvasElementDrop', npCanvasElementDropMock);
//                $provide.value('npPageMetadata', npPageMetadataMock);
//            });
//
//            inject(function ($rootScope, $compile, _$document_, _npConstants_, npKeyboarderHelper, npUserInfo) {
//                sinon.stub(npKeyboarderHelper, 'shouldPerformCustomOperation', function () {
//                    return true;
//                });
//                $document = _$document_;
//                npConstants = _npConstants_;
//                userOS = npUserInfo.getUserOS();
//                var html = '<div id="canvas-runtime" src="#s1" style="height: 1024px; width=20px">' + ' <div np-copy-paste>';
//                angular.element(document.body).append(html);
//                elem = angular.element('<div np-copy-paste> ' +
//                    '<div style="height: 10px; width:20px; top:20px; left:10px;" id = ' + npGridMock._gridElements[0].elementId + '></div>' +
//                    '<div style="height: 24px; width:100px; top:0px; left:0px;" id = ' + npGridMock._gridElements[1].elementId + '></div>' +
//                    '<div style="height: 400px; width:32px; top:100px; left:100px;" id = ' + npGridMock._gridElements[2].elementId + '></div> </div>');
//                scope = $rootScope.$new();
//                elem = $compile(elem)(scope);
//                scope.$digest();
//            });
//        });
//
//        afterEach(function () {
//            npUiCanvasAPIMock.getControlData.restore();
//            npGridMock.getSelectedElements.restore();
//            npCanvasElementDropMock.dropAtTarget.restore();
//            npUiCanvasAPIMock.addChild.restore();
//            var canvasElem = document.getElementById('canvas-runtime');
//            canvasElem.parentNode.removeChild(canvasElem);
//        });
//
//
//        // TODO update after refactoring of copy paste
///*
//        it('should respond to the keydown copy event', function () {
//            expect(getSelectedElementsSpy.called).to.be.equal(false);
//            expect(getControlDataSpy.called).to.be.equal(false);
//            if (userOS === npConstants.os.MacOS) {
//                triggerKeyEvent(npConstants.keymap.c, 'keydown', $document[0], [npConstants.modifierKeys.Meta]);
//            } else {
//                triggerKeyEvent(npConstants.keymap.c, 'keydown', $document[0], [npConstants.modifierKeys.Control]);
//            }
//            expect(getSelectedElementsSpy.called).to.be.equal(true);
//            expect(getControlDataSpy.called).to.be.equal(true);
//        });
//
//        it('should respond to the keydown paste event', function () {
//            expect(getSelectedElementsSpy.called).to.be.equal(false);
//            if (userOS === npConstants.os.MacOS) {
//                triggerKeyEvent(npConstants.keymap.v, 'keydown', $document[0], [npConstants.modifierKeys.Meta]);
//            } else {
//                triggerKeyEvent(npConstants.keymap.v, 'keydown', $document[0], [npConstants.modifierKeys.Control]);
//            }
//            expect(getSelectedElementsSpy.called).to.be.equal(true);
//        });
//
//        it('should not call the dropAtTarget, addChild methods when there are no copiedElements', function () {
//            expect(dropAtTargetSpy.called).to.be.equal(false);
//            if (userOS === npConstants.os.MacOS) {
//                triggerKeyEvent(npConstants.keymap.v, 'keydown', $document[0], [npConstants.modifierKeys.Meta]);
//            } else {
//                triggerKeyEvent(npConstants.keymap.v, 'keydown', $document[0], [npConstants.modifierKeys.Control]);
//            }
//            expect(dropAtTargetSpy.called).to.be.equal(false);
//            expect(addChildSpy.called).to.be.equal(false);
//        });
//
//        it('should call the addChild method to create the pasted element', function () {
//            expect(addChildSpy.called).to.be.equal(false);
//            if (userOS === npConstants.os.MacOS) {
//                triggerKeyEvent(npConstants.keymap.c, 'keydown', $document[0], [npConstants.modifierKeys.Meta]);
//                triggerKeyEvent(npConstants.keymap.v, 'keydown', $document[0], [npConstants.modifierKeys.Meta]);
//            } else {
//                triggerKeyEvent(npConstants.keymap.c, 'keydown', $document[0], [npConstants.modifierKeys.Control]);
//                triggerKeyEvent(npConstants.keymap.v, 'keydown', $document[0], [npConstants.modifierKeys.Control]);
//            }
//            expect(addChildSpy.called).to.be.equal(true);
//        });
//
//        it('should call the dropAtRoot method to create the pasted element', function () {
//            expect(dropAtTargetSpy.called).to.be.equal(false);
//            if (userOS === npConstants.os.MacOS) {
//                triggerKeyEvent(npConstants.keymap.c, 'keydown', $document[0], [npConstants.modifierKeys.Meta]);
//                triggerKeyEvent(npConstants.keymap.v, 'keydown', $document[0], [npConstants.modifierKeys.Meta]);
//            } else {
//                triggerKeyEvent(npConstants.keymap.c, 'keydown', $document[0], [npConstants.modifierKeys.Control]);
//                triggerKeyEvent(npConstants.keymap.v, 'keydown', $document[0], [npConstants.modifierKeys.Control]);
//            }
//            expect(dropAtTargetSpy.called).to.be.equal(true);
//        });
//*/
//
//
//    });
//
//})();

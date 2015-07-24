'use strict';
(function () {

    var expect = chai.expect;

    describe('Directive: np-canvas-inline-edit', function () {
        var $rootScope, scope, elem, inlineEditHelper, npKeyboarderMock;
        var npGridMock, npUiCanvasAPIMock, npPageMdMock, npPropObserverMock;

        beforeEach(module('uiComposer.uiCanvas'));
        beforeEach(module('uiComposer.uiEditor'));

        beforeEach(function () {
            /*
             * Selection relies mainly on grid, need to mock out structure here
             * To test selection we are going with the following structure:
             * - top level element with 2 children, each child has 2 children again
             * - 2nd top level element without children
             */
            var createGridElement = (function () {
                var count = 0,
                    proto = {
                        parentId: -1,
                        _selected: false,
                        select: function () {
                            this._selected = true;
                        },
                        unselect: function () {
                            this._selected = false;
                        },
                        isSelected: function () {
                            return this._selected;
                        },
                        domRef: function () {
                            return angular.element('<div></div>');
                        },
                        isRootChild: function () {
                            return this.parentId === -1;
                        },
                        // control: {},
                        controlMd: {controlId: ''}
                    };
                return function (parent) {
                    var element = Object.create(proto);
                    element.elementId = count++;
                    element.control = {
                        id: element.elementId
                    };
                    element.children = [];
                    if (parent) {
                        element.parentId = parent.elementId;
                        parent.children.push(element);
                    }
                    return element;

                };
            })();
            var p1 = createGridElement(),
                p2 = createGridElement(),
                flc1 = createGridElement(p1),
                flc2 = createGridElement(p1),
                slc1 = createGridElement(flc1),
                slc2 = createGridElement(flc1),
                slc3 = createGridElement(flc2),
                slc4 = createGridElement(flc2);

            npGridMock = {
                _elements: [p1, p2],
                _elementsFlattened: [p1, p2, flc1, flc2, slc1, slc2, slc3, slc4],
                getElement: function (id) {
                    for (var i = 0; i < this._elementsFlattened.length; ++i) {
                        if (this._elementsFlattened[i].elementId === id) {
                            return this._elementsFlattened[i];
                        }
                    }
                },
                setSelectedElements: function () {

                }
            };

            npPageMdMock = {
                changeProperty: function () {

                }
            };

            npUiCanvasAPIMock = {
                getEditablePropertyAtPosition: function () {
                    var element = document.createElement('div');
                    element.innerHTML = '<span>hello</span>';
                    return {
                        name: 'text',
                        value: 'hello',
                        domRef: element.firstChild
                    };
                }
            };

            npPropObserverMock = {
                endPropertyChange: function () {
                },
                doPropertyChange: function () {
                }
            };

            npKeyboarderMock = {
                _listeners: [],
                on: function (key, listener) {
                    this._listeners.push({
                        key: key,
                        cb: listener
                    });
                },
                trigger: function (key, event) {
                    _.forEach(this.listeners, function (listener) {
                        if (listener.key === key) {
                            listener.cb(event);
                        }
                    });
                }
            };

            module(function ($provide) {
                $provide.value('npGrid', npGridMock);
                $provide.value('npUiCanvasAPI', npUiCanvasAPIMock);
                $provide.value('npKeyboarder', npKeyboarderMock);
                $provide.value('npPageMetadata', npPageMdMock);
                $provide.value('npPropertyChangeObserver', npPropObserverMock);
            });

            inject(function ($compile, $injector) {
                $rootScope = $injector.get('$rootScope');
                inlineEditHelper = $injector.get('npCanvasInlineEditHelper');
                elem = angular.element('<div np-canvas-inline-edit></div>');
                scope = $rootScope.$new();
                elem = $compile(elem)(scope);
                scope.$digest();
            });
        });

        beforeEach(function () {
            for (var i = 0; i < npGridMock._elementsFlattened; ++i) {
                expect(npGridMock._elementsFlattened[i].isSelected()).to.be.equal(false);
            }
        });

        describe('inline-edit-tests:', function () {
            it('should create an input field and add it to the scope', function () {
                var gridElements = [npGridMock.getElement(5), npGridMock.getElement(4), npGridMock.getElement(1)],
                    x = 1,
                    y = 2;
                expect(scope.inputValue).to.be.undefined;
                inlineEditHelper.startInlineEdit(gridElements, x, y);
                var inputField = elem[0].firstChild;
                expect(inputField.tagName).to.be.equal('INPUT');
                expect(scope.inputValue).to.be.equal('hello');
                scope.onInputLoseFocus();
            });

            it('should destroy the input field on looseFocus', function () {
                var gridElements = [npGridMock.getElement(5), npGridMock.getElement(4), npGridMock.getElement(1)],
                    x = 1,
                    y = 2;
                inlineEditHelper.startInlineEdit(gridElements, x, y);
                scope.onInputLoseFocus();
                expect(elem[0].firstChild).to.be.null;
                expect(scope.inputValue).to.be.null;
            });

            // TODO figure out why this is failing
            // it('should destroy the input field on ENTER', function () {
            //    var gridElements = [npGridMock.getElement(5), npGridMock.getElement(4), npGridMock.getElement(1)],
            //        x = 1,
            //        y = 2;
            //    inlineEditHelper.startInlineEdit(gridElements, x, y);
            //    npKeyboarderMock.trigger('Enter', {});
            //    inlineEditHelper.onEnter();
            //    expect(elem[0].firstChild).to.be.null;
            //    expect(scope.inputValue).to.be.null;
            //});

        });

    });
})();

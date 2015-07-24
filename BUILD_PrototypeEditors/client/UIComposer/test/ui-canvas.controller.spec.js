'use strict';
(function () {

    var expect = chai.expect;

    describe('Controller: ui-canvas', function () {
        var scope, createController, $q,
            $stateParamsMock, npUiCanvasAPIMock, npGridMock, npImageHelperMock, npSnapGuideMock, npPrototypeMock, npCanvasElementHighlightMock,
            npCanvasElementDropMock, npPageMetadataMock, npMessagingMock, npCanvasUpdaterMock, npPageMetadataEventsMock, resPrototypeMock;



        beforeEach(module('ngResource'));
        beforeEach(module('uiComposer.uiCanvas'));

        beforeEach(function () {
            $stateParamsMock = {
                currentScreen: 'S0'
            };

            npUiCanvasAPIMock = {
                initReady: function () {
                    return $q.when();
                },
                navTo: function () {
                    return $q.when();
                }
            };

            npGridMock = {
                init: sinon.stub(),
                getElementsFlattened: sinon.stub()
            };

            npSnapGuideMock = {
                _horizontalGuides: [],
                _verticalGuides: [],
                getHorizontalGuides: sinon.stub().returns(this._horizontalGuides),
                getVerticalGuides: sinon.stub().returns(this._verticalGuides)
            };

            npCanvasElementHighlightMock = {
                _elementHighlights: [],
                getElementHighlights: sinon.stub().returns(this._elementHighlights)
            };

            npPrototypeMock = {
                _mainUrl: '/prototype-url',
                getPrototypeMainUrl: sinon.stub().returns(this._mainUrl)
            };

            npPageMetadataMock = {
                _pageMd: {},
                getPageMetadata: function () {
                    return this._pageMd;
                }
            };

            npMessagingMock = {
                showBusyIndicator: sinon.stub(),
                hideBusyIndicator: sinon.stub()
            };

            npCanvasUpdaterMock = {
                startListeningForMetadataChanges: sinon.stub(),
                stopListeningForMetadataChanges: sinon.stub()
            };

            npPageMetadataEventsMock = {
                events: {
                    pageChanged: 'pageChanged'
                },
                listen: sinon.stub()
            };

            resPrototypeMock = {};

            inject(function ($injector, $rootScope, $controller) {
                $q = $injector.get('$q');
                scope = $rootScope.$new();
                createController = function () {
                    var ctrl = $controller('CanvasCtrl', {
                        $scope: scope,
                        $stateParams: $stateParamsMock,
                        npUiCanvasAPI: npUiCanvasAPIMock,
                        npGrid: npGridMock,
                        npImageHelper: npImageHelperMock,
                        npSnapGuide: npSnapGuideMock,
                        npPrototype: npPrototypeMock,
                        npCanvasElementHighlight: npCanvasElementHighlightMock,
                        npCanvasElementDrop: npCanvasElementDropMock,
                        npPageMetadata: npPageMetadataMock,
                        npMessaging: npMessagingMock,
                        npCanvasUpdater: npCanvasUpdaterMock,
                        npPageMetadataEvents: npPageMetadataEventsMock,
                        resPrototype: resPrototypeMock
                    });
                    scope.$apply();
                    return ctrl;
                };
            });
        });

        it('should update the snap guides when it receives the appropriate event', function () {
            createController();
            npSnapGuideMock.getHorizontalGuides.reset();
            npSnapGuideMock.getVerticalGuides.reset();
            expect(npSnapGuideMock.getHorizontalGuides.called).to.not.be.ok;
            expect(npSnapGuideMock.getVerticalGuides.called).to.not.be.ok;
            scope.$emit('snapGuides/updated');
            expect(npSnapGuideMock.getHorizontalGuides.called).to.be.ok;
            expect(npSnapGuideMock.getVerticalGuides.called).to.be.ok;
        });

        it('should actiate the canvas updater if the prototype is not a smart app', function () {
            resPrototypeMock = {
                isSmartApp: false
            };
            createController();
            expect(npCanvasUpdaterMock.startListeningForMetadataChanges.called).to.be.ok;
        });

        it('should not actiate the canvas updater if the prototype is a smart app', function () {
            resPrototypeMock = {
                isSmartApp: true
            };
            createController();
            expect(npCanvasUpdaterMock.startListeningForMetadataChanges.called).to.not.be.ok;
        });
    });
})();

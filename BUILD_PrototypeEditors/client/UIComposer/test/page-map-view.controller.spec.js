'use strict';
(function () {

    var expect = chai.expect,
        triggerKeyEvent = window.triggerKeyEvent;

    describe('Controller: page-map-view', function () {
        var createController, scope, $httpBackend, $rootScope, $document, $q;
        var page1 = {
                displayName: 'Page 1',
                id: 'cfdbcd9b8412872c09db4ce3',
                name: 'S0',
                pageUrl: '/index.html#S0',
                thumbnailUrl: '/resources/thumbnail/S0.png'
            },
            page2 = {
                displayName: 'Page 2',
                id: 'cfdbcd9b8412872c09db4ce3',
                name: 'S1',
                pageUrl: '/index.html#S1',
                thumbnailUrl: '/resources/thumbnail/S1.png'
            };

        var result = {
            pages: [
                page1,
                page2
            ],
            navigations: {}
        };

        var state = {
            params: {
                currentProject: 123,
                currentScreen: 'S1'
            }
        };
        var npUiCatalogMock = {
            getFloorplans: function () {
              return $q.when({});
            }
        };
        var npPrototypeMock = {
                getPages: function () {
                    var deferred = $q.defer();
                    deferred.resolve(result.pages);
                    return deferred.promise;
                },
                getCurrentPage: function () {
                    return page1;
                },
                getPrototype: function () {
                    var deferred = $q.defer();
                    deferred.resolve(result);
                    return deferred.promise;
                },
                setCurrentPage: function () {
                    return;
                },
                createPages: function () {
                    return $q.when(result);
                },
                flushUpdates: function () {
                    return $q.when({});
                },
                deletePage: function () {
                    return $q.when(page2);
                },
                getArtifactBaseUrl: function () {
                    return '/api/projects/' + state.params.currentProject + '/prototype/artifact/';
                },
                getNavigationToPage: function () {
                    return $q.when([]);
                }
            },
            npJsPlumbMock = {
                init: function () {
                    return;
                },
                reset: function () {
                    return;
                },
                repaintEverything: sinon.stub()
            },
            npNavBarHelperMock = {
                enableUpdateSaveStatus: function () {
                    return;
                },
                disableUpdateSaveStatus: function () {
                    return;
                }
            },
            npPageMapLayoutMock = {
                getGridLayout: function () {

                },
                setPositionsForNewPage: function () {

                },
                applyFirstOccurenceRuleOnLinks: function () {
                    return {
                        edges: [],
                        unConnectedPages: [],
                        connectedPages: []
                    };
                },
                createLayout: function () {

                }
            },
            npConcurrentAccessHelperMock = {
                enableUnlockMonitoring: sinon.stub(),
                disableUnlockOnce: sinon.stub()
            },
            npMessagingMock = {
                showError: function () {
                }
            },
            npBindingHelperMock = {
                queryModel: function () {
                    return {
                        entities: []
                    };
                }
            };

        beforeEach(module('pageMapView'));
        beforeEach(module('uiComposer.uiEditor'));
        beforeEach(module('uiComposer.services'));

        beforeEach(inject(function (_$rootScope_, $controller, _$httpBackend_, npKeyboarderHelper, _$document_, _$q_) {
            $httpBackend = _$httpBackend_;
            $document = _$document_;
            $rootScope = _$rootScope_;
            $q = _$q_;
            sinon.stub(npKeyboarderHelper, 'shouldPerformCustomOperation', function () {
                return true;
            });
            $httpBackend.when('GET', '/api/projects/123/prototype').respond({});

            createController = function () {
                scope = $rootScope.$new();
                scope.map = {currentProject: 123};
                scope.selectedPage = page2;
                scope.screens = result.pages;
                return $controller('PageMapCtrl', {
                    $scope: scope,
                    $state: state,
                    npJsPlumb: npJsPlumbMock,
                    npPrototype: npPrototypeMock,
                    npNavBarHelper: npNavBarHelperMock,
                    npPageMapLayout: npPageMapLayoutMock,
                    npMessaging: npMessagingMock,
                    npConcurrentAccessHelper: npConcurrentAccessHelperMock,
                    npUiCatalog: npUiCatalogMock,
                    npBindingHelper: npBindingHelperMock
                });
            };
        }));

        it('create page service called on click of create page', function () {
            var createPages = sinon.spy(npPrototypeMock, 'createPages');
            var ctrl = createController();
            expect(createPages.called).to.be.equal(false);
            ctrl.createPage({floorplan: 'absolute'});
            $rootScope.$apply();
            expect(createPages.called).to.be.equal(true);
        });

        it('delete page service called on click of delete key', function () {
            var ctrl = createController();
            var broadcastSpy = sinon.spy(scope, '$broadcast');
            ctrl.selectedPage = {name: 'S0', pageUrl: '/resources/project123/S0'};
            triggerKeyEvent('Delete', 'keydown', $document[0]);
            $rootScope.$apply();
            expect(broadcastSpy.called).to.be.equal(true);
        });

        it('delete page service called on click of backspace key', function () {
            var ctrl = createController();
            var broadcastSpy = sinon.spy(scope, '$broadcast');
            ctrl.selectedPage = {name: 'S0', pageUrl: '/resources/project123/S0'};
            triggerKeyEvent('Backspace', 'keydown', $document[0]);
            $rootScope.$apply();
            expect(broadcastSpy.called).to.be.equal(true);
        });
    });
})();

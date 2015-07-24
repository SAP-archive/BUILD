'use strict';
(function () {

    var expect = chai.expect;

    describe('Service: np-page-metadata', function () {
        var $rootScope, $httpBackend, $q, npPageMetadata, $locationMock, npPrototypeMock,
            ActiveProjectServiceMock, npUiCanvasAPIMock, uiThumbnailGeneratorMock, npUiCatalogMock,
            npPageMetadataAddControlMock, npPageMetadataDeleteControlMock, npPageMetadataMoveControlMock, npPageMetadataChangePropertyMock, npPageMetadataControlBindingMock, npPageMetadataHelperMock,
            npLayoutHelperMock, npAbsoluteLayoutHelperMock, npPageMetadataEventsMock, uiCommandManagerMock, stateMock, npConstantsMock, uiErrorMock, npImageHelperMock;

        beforeEach(module('ngResource'));
        beforeEach(module('uiComposer.services'));

        beforeEach(function () {
            ActiveProjectServiceMock = {
                id: 'Project123'
            };
            npPrototypeMock = {
                getCatalogId: function () {
                    return $q.when('556f6b0088fc39dfaead6099');
                },
                updateCachedPrototypePromise: function () {

                },
                unlockPrototype: function () {

                },
                getPrototype: function() {
                    return $q.when({});
                }
            };
            npUiCanvasAPIMock = {
                navTo: function () {
                    return $q.when('OK');
                }
            };
            uiThumbnailGeneratorMock = {
                generateFromHtml: function (domRef, h, w, cb) {
                    if (typeof cb === 'function') {
                        cb({});
                    }
                }
            };
            npUiCatalogMock = {};
            npPageMetadataAddControlMock = {
                performAdditions: function () {

                },
                getControlMdObjects: function (control) {
                    return control;
                }
            };
            npPageMetadataDeleteControlMock = {
                performDeletions: function () {

                }
            };
            npPageMetadataMoveControlMock = {
                performMoves: function () {
                }
            };
            npPageMetadataChangePropertyMock = {};
            npPageMetadataControlBindingMock = {};
            npPageMetadataHelperMock = {
                setControlMdPrototype: sinon.stub(),
                getControlMd: function () {
                    return buttonControlDefMock;
                },
                getControlAndChildMd: function () {

                }
            };
            npLayoutHelperMock = {
                setCurrentLayout: sinon.stub()
            };
            npAbsoluteLayoutHelperMock = {
                init: sinon.stub()
            };
            stateMock = {
                params: {}
            };
            npConstantsMock = {};
            uiErrorMock = {};
            npPageMetadataEventsMock = {
                events: {
                   navigationDone: 'OK'
                },
                broadcast: sinon.stub()
            };
            uiCommandManagerMock = {
               execute: function () {
                   return $q.when('OK');
               }
            };
            npImageHelperMock = {
                setOriginalDimensions: function() {

                }
            };
            $locationMock = {
                skipReload: function () {
                    return {
                        path: function () {
                            return {
                                replace: sinon.stub()
                            };
                        }
                    };
                }
            };
            module(function ($provide) {
                $provide.value('ActiveProjectService', ActiveProjectServiceMock);
                $provide.value('npUiCanvasAPI', npUiCanvasAPIMock);
                $provide.value('uiThumbnailGenerator', uiThumbnailGeneratorMock);
                $provide.value('npUiCatalog', npUiCatalogMock);
                $provide.value('npPageMetadataAddControl', npPageMetadataAddControlMock);
                $provide.value('npPageMetadataDeleteControl', npPageMetadataDeleteControlMock);
                $provide.value('npPageMetadataMoveControl', npPageMetadataMoveControlMock);
                $provide.value('npPageMetadataChangeProperty', npPageMetadataChangePropertyMock);
                $provide.value('npPageMetadataControlBinding', npPageMetadataControlBindingMock);
                $provide.value('npPageMetadataHelper', npPageMetadataHelperMock);
                $provide.value('npAbsoluteLayoutHelper', npAbsoluteLayoutHelperMock);
                $provide.value('npPageMetadataEvents', npPageMetadataEventsMock);
                $provide.value('npLayoutHelper', npLayoutHelperMock);
                $provide.value('npPrototype', npPrototypeMock);
                $provide.value('npImageHelper', npImageHelperMock);
                $provide.value('uiCommandManager', uiCommandManagerMock);
                $provide.value('$state', stateMock);
                $provide.value('npConstants', npConstantsMock);
                $provide.value('$location', $locationMock);
                $provide.value('uiError', uiErrorMock);
            });

            inject(function ($injector) {
                $q = $injector.get('$q');
                $rootScope = $injector.get('$rootScope');
                $httpBackend = $injector.get('$httpBackend');
                npPageMetadata = $injector.get('npPageMetadata');
                $httpBackend.whenGET('/api/projects/Project123/prototype/page?pageName=S0').respond(getPageMetaDataResponse);
                $httpBackend.whenPUT('/api/projects/Project123/prototype/page').respond({status: 'OK'});
            });
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should return current status', function () {
            expect(npPageMetadata.getSaveStatus()).to.be.equal(npPageMetadata.saveStatuses.SAVE_SUCCESSFUL);
            npPageMetadata.saveStatuses._currentStatus = npPageMetadata.saveStatuses.SAVE_FAILED;
            expect(npPageMetadata.getSaveStatus()).to.be.equal(npPageMetadata.saveStatuses.SAVE_FAILED);
        });
        it('Should return Page Meta Data', function () {
            var promise = npPageMetadata.getPageMetadata('S0');
            var pageMd = null;
            promise.then(function (pageMeta) {
                pageMd = pageMeta;
            });

            $httpBackend.flush();
            expect(pageMd).to.be.an('object');
            expect(pageMd.controls).to.be.an('array');
        });
        it('Should set Page and return Meta Data', function () {
            npPageMetadata.getPageMetadata('S0');
            var promise = npPageMetadata.setCurrentPageName('S0');
            var pageMd = null;
            promise.then(function (pageMeta) {
                pageMd = pageMeta;
            });
            $httpBackend.flush();
            expect(pageMd).to.be.an('object');
            expect(pageMd.controls).to.be.an('array');
            expect(npPageMetadata.getCurrentPageName()).to.be.equal('S0');
        });

        it('Should add control', function () {
            npPageMetadata.setCurrentPageName('S0');
            $httpBackend.flush();
            expect(npPageMetadata.getCurrentPageName()).to.be.equal('S0');
            var getControlMdObjectsSpy = sinon.spy(npPageMetadataAddControlMock, 'getControlMdObjects'),
                commandExecuteSpy = sinon.spy(uiCommandManagerMock, 'execute');
            npPageMetadata.addControl(buttonControlDefMock);
            $rootScope.$apply();

            expect(getControlMdObjectsSpy.called).to.be.equal(true);
            expect(commandExecuteSpy.called).to.be.equal(true);
        });

        it('Should move control', function () {
            npPageMetadata.setCurrentPageName('S0');
            $httpBackend.flush();
            expect(npPageMetadata.getCurrentPageName()).to.be.equal('S0');
            var commandExecuteSpy = sinon.spy(uiCommandManagerMock, 'execute');
            npPageMetadata.moveControl(buttonControlDefMock);
            $rootScope.$apply();

            expect(commandExecuteSpy.called).to.be.equal(true);
        });

        it('Should delete control', function () {
            npPageMetadata.setCurrentPageName('S0');
            $httpBackend.flush();
            expect(npPageMetadata.getCurrentPageName()).to.be.equal('S0');
            var commandExecuteSpy = sinon.spy(uiCommandManagerMock, 'execute');
            npPageMetadata.deleteControl(buttonControlDefMock);
            $rootScope.$apply();

            expect(commandExecuteSpy.called).to.be.equal(true);
        });

        it('Should unlock prototype on browser close', function () {
            var unlockPrototypeSpy = sinon.spy(npPrototypeMock, 'unlockPrototype');
            npPageMetadata.flushUpdates(true);
            expect(unlockPrototypeSpy.calledOnce).to.be.equal(true);
        });
        // TODO: Move this to json file
        var buttonControlDefMock = {
            catalogId: '556f6b0088fc39dfaead6099',
            groupId: 'content',
            newCtrlCatalogName: 'sap_m_Button',
            parentId: 'sap_m_Page_0',
            x: 317.77225909846845,
            y: 96.98019499825959
        };
        var getPageMetaDataResponse = {
            rootControlId: 'sap_m_Page_0',
            controls: [{
                controlId: 'sap_m_Page_0',
                catalogControlName: 'sap_m_Page',
                catalogId: '556f6b0088fc39dfaead6099',
                getChildrenMd: function () {
                    return [];
                }
            }]
        };

    });
})();

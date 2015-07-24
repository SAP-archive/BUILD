'use strict';
(function () {

    var expect = chai.expect;

    describe('Service: np-ui-canvas-api', function () {
        beforeEach(module('ngResource'));
        beforeEach(module('uiComposer.uiCanvas'));

        var $q, $rootScope, npUiCanvasAPI, npUi5Helper, npUiCatalog, npBindingHelper, npPageMetadataHelper, npImageHelper, npConstants, npPropertyChangeHelper;

        var controls, controlsMd;
        var pageMd;

        var defaultProperties = {
            text: {
                name: 'text',
                defaultValue: 'hello'
            },
            visible: {
                name: 'visible',
                defaultValue: true
            }
        };


        var initControl = function (type, id) {
            return {
                id: id,
                __catalogControlName: type,
                type: type,
                properties: {},
                aggregations: {},
                classes: [],
                domRef: function () {
                    return '<div id="' + this.id + '"></div>';
                }
            };
        };
        var initMd = function (control, parent) {
            var parentId = parent ? parent.id : null;
            return {
                controlId: control.id,
                parentControlId: parentId,
                parentGroupId: null,
                parentGroupIndex: 0,
                properties: [],
                groups: [],
                getParentMd: function () {
                    return npPageMetadataHelper.getControlMd(this.parentControlId);
                },
                getChildrenMd: function (groupId) {
                    var group = _.find(this.groups, {groupId: groupId}) || {};
                    return _.map(group.children, npPageMetadataHelper.getControlMd);
                }
            };
        };

        npPropertyChangeHelper = {

        };

        npUi5Helper = {
            setWindow: function () {
                return $q.when();
            },
            getWindow: function () {
            },
            waitForRendering: function () {
                return $q.when();
            },
            waitForBinding: function () {
                return $q.when();
            },
            initControl: initControl,
            insertControl: function () {
            },
            moveControl: function () {
            },
            removeControl: function () {
            },
            updateAggregation: function () {
            },
            bindAggregation: function () {
            },
            getId: function (ctrl) {
                return ctrl.id;
            },
            getDomRef: function (ctrl) {
                return ctrl.domRef();
            },
            setControlProperty: function (ctrl, name, value) {
                ctrl.properties[name] = value;
            },
            getBindingInfo: function () {
            },
            getChild: function () {
            },
            navTo: function () {
                var deferred = $q.defer();
                deferred.resolve();
                return deferred.promise;
            },
            getControlById: function (sId) {
                return _.find(controls, {id: sId});
            },
            setContext: function () {
                return $q.reject();
            }
        };

        npUiCatalog = {
            getControlProperties: function () {
                return defaultProperties;
            },
            getDefaultProperty: function () {
                return 'text';
            },
            getControlType: function (name) {
                return name;
            },
            getTagName: function () {
            }
        };

        npBindingHelper = {
            getEntityDefaultPath: function () {
                return $q.when('defaultPath');
            },
            getExpandPathsFromMd: function () {
                return 'expandPaths';
            },
            getPath: function () {
                return;
            }
        };

        npPageMetadataHelper = {
            getControlMd: function (controlId) {
                return _.find(controlsMd, {controlId: controlId});
            },
            getGroupMd: function (groupId, controlMd) {
                return _.find(controlMd.groups, {groupId: groupId});
            },
            isTemplate: function () {
                return false;
            },
            getTopMostTemplate: function () {
            },
            isBound: function () {
                return false;
            }
        };
        npImageHelper = {
            loadImages: function () {
                return $q.when();
            }
        };
        npConstants = {
            renderingProperties: {
                VISIBLE: 'visible'
            }
        };

        beforeEach(module(function ($provide) {
            $provide.value('npUi5Helper', npUi5Helper);
            $provide.value('npUiCatalog', npUiCatalog);
            $provide.value('npBindingHelper', npBindingHelper);
            $provide.value('npPageMetadataHelper', npPageMetadataHelper);
            $provide.value('npImageHelper', npImageHelper);
            $provide.value('npImageHelper', npImageHelper);
            $provide.value('npConstants', npConstants);
            $provide.value('npPropertyChangeHelper', npPropertyChangeHelper);
        }));

        beforeEach(inject(function ($injector) {
            npUiCanvasAPI = $injector.get('npUiCanvasAPI');
            $q = $injector.get('$q');
            $rootScope = $injector.get('$rootScope');

            var button = initControl('sap.m.Button', 'button'),
                root = initControl('sap.m.Page', 'root'),
                buttonMd = initMd(button, root),
                rootMd = initMd(root);
            rootMd.groups.push({
                groupId: 'content',
                children: [button.id]
            });
            buttonMd.parentGroupId = 'content';

            controls = [root, button];
            controlsMd = [rootMd, buttonMd];
            pageMd = {
                name: 'S0',
                rootControlId: root.id,
                controls: controlsMd
            };
        }));


        describe('initialization', function () {

            it('init wait for canvas to be rendered', function () {
                var initPromise;
                initPromise = npUiCanvasAPI.init();
                expect(initPromise).to.be.rejected;

                initPromise = npUiCanvasAPI.init(window, 'UI5');
                expect(initPromise).to.eventually.exist;
            });

            it('init should set window and get it back', function () {
                var setWindowSpy = sinon.spy(npUi5Helper, 'setWindow');
                npUiCanvasAPI.init(window, 'UI5');

                expect(setWindowSpy.calledWith(window)).to.be.ok;
                npUi5Helper.setWindow.restore();
            });

            it('should get window from helper', function () {
                npUiCanvasAPI.init(window, 'UI5');
                var spy = sinon.spy(npUi5Helper, 'getWindow');
                npUiCanvasAPI.getWindow();
                expect(spy.called).to.be.ok;
                npUi5Helper.getWindow.restore();
            });
        });


        describe('control metadata methods', function () {
            beforeEach(function () {
                npUiCanvasAPI.init(window, 'UI5');
                npUiCanvasAPI.navTo(pageMd);
                $rootScope.$apply();
            });

            it('should get control dom ref', function () {
                var buttonMd = controlsMd[1],
                    buttonCtrl = controls[1],
                    spy = sinon.spy(npUi5Helper, 'getControlById'),
                    domRef = npUiCanvasAPI.getControlDomRefByMd(buttonMd);
                expect(domRef).to.exist;
                expect(domRef).to.be.equal(buttonCtrl.domRef());
                expect(spy.calledWith(buttonMd.controlId)).to.be.ok;
                npUi5Helper.getControlById.restore();
            });

            it('should wait for control to be ready: set the main entity context', function () {
                pageMd.mainEntity = 'entityId';
                npUiCanvasAPI.navTo(pageMd);

                var bindingSpy = sinon.spy(npBindingHelper, 'getEntityDefaultPath'),
                    helperSpy = sinon.spy(npUi5Helper, 'setContext'),
                    buttonMd = controlsMd[1];
                npUiCanvasAPI.controlReady(buttonMd);
                $rootScope.$apply();

                expect(bindingSpy.calledWith('entityId')).to.be.ok;
                expect(helperSpy.calledWith('defaultPath', 'expandPaths')).to.be.ok;

                npBindingHelper.getEntityDefaultPath.restore();
                npUi5Helper.setContext.restore();
            });

            it('should wait for control to be ready: top most template', function () {
                var aggregationSpy = sinon.spy(npUi5Helper, 'bindAggregation'),
                    bindingSpy = sinon.spy(npUi5Helper, 'waitForBinding'),
                    renderingSpy = sinon.spy(npUi5Helper, 'waitForRendering'),
                    buttonMd = controlsMd[1],
                    rootMd = controlsMd[0],
                    rootCtrl = controls[0];

                rootMd.groups[0].binding = {
                    isRelative: false
                };
                sinon.stub(npPageMetadataHelper, 'getTopMostTemplate', function () {
                    return buttonMd;
                });
                sinon.stub(npPageMetadataHelper, 'isBound', function (groupMd) {
                    return groupMd === rootMd.groups[0];
                });
                npUiCanvasAPI.controlReady(buttonMd);
                $rootScope.$apply();

                expect(aggregationSpy.calledWith(rootCtrl, buttonMd.parentGroupId)).to.be.ok;
                expect(bindingSpy.calledWith(rootCtrl)).to.be.ok;
                expect(bindingSpy.calledAfter(aggregationSpy)).to.be.ok;
                expect(renderingSpy.called).not.to.be.ok;

                npUi5Helper.bindAggregation.restore();
                npUi5Helper.waitForBinding.restore();
                npUi5Helper.waitForRendering.restore();
                npPageMetadataHelper.isBound.restore();
                npPageMetadataHelper.getTopMostTemplate.restore();
                delete rootMd.groups[0].binding;
            });

            it('should wait for control to be ready: no binding, URI properties', function () {
                var buttonMd = controlsMd[1];
                buttonMd.properties = [{
                    type: 'URI',
                    value: '/api/image/1.png'
                }];
                var spy = sinon.spy(npImageHelper, 'loadImages');
                npUiCanvasAPI.controlReady(buttonMd);
                $rootScope.$apply();
                expect(spy.calledWith([buttonMd.properties[0].value])).to.be.ok;
                buttonMd.properties = [];
                npImageHelper.loadImages.restore();
            });

            it('should wait for control to be ready: no binding', function () {
                var spy = sinon.spy(npUi5Helper, 'waitForRendering'),
                    buttonMd = controlsMd[1],
                    buttonCtrl = controls[1];
                npUiCanvasAPI.controlReady(buttonMd);
                $rootScope.$apply();
                expect(spy.calledWith(buttonCtrl)).to.be.ok;
                npUi5Helper.waitForRendering.restore();
            });


            it('should wait for control to be ready if control is visible', function () {
                var buttonMd = controlsMd[1];
                buttonMd.properties = [{
                    name:'visible',
                    type: 'boolean',
                    value: true
                }];
                var spy = sinon.spy(npUi5Helper, 'waitForRendering');
                npUiCanvasAPI.controlReady(buttonMd);
                $rootScope.$apply();
                expect(spy.called).to.be.true;
                buttonMd.properties = [];
                npUi5Helper.waitForRendering.restore();
            });

            it('should not wait for control to be ready if control is invisible', function () {
                var buttonMd = controlsMd[1];
                buttonMd.properties = [{
                    name:'visible',
                    type: 'boolean',
                    value: false
                }];
                var spy = sinon.spy(npUi5Helper, 'waitForRendering');
                npUiCanvasAPI.controlReady(buttonMd);
                $rootScope.$apply();
                expect(spy.called).to.be.false;
                buttonMd.properties = [];
                npUi5Helper.waitForRendering.restore();
            });
        });

        // TODO write for addCHildByMd
        /*it('should add child', function () {
         var newCtrl = initControl('sap.m.Button', 'button0'),
         parentGroup = {groupId: 'content'};

         var promise = npUiCanvasAPI.addChild(newCtrl, button, parentGroup);
         expect(promise).to.eventually.be.equal(newCtrl);

         var newCtrlData = {catalogName: 'sap.m.Button'};
         promise = npUiCanvasAPI.addChild(newCtrlData, button, parentGroup);
         expect(promise).to.eventually.not.be.equal(newCtrlData);
         expect(promise).to.eventually.have.property('type', newCtrlData.catalogName);
         });

         it('should create a group', function () {
         expect(npUiCanvasAPI._createGroup(button)).to.be.undefined;

         var aggregationMd = {
         name: 'positions',
         multiple: true,
         type: 'sap.ui.commons.layout.PositionContainer'
         };
         var spy = sinon.spy(npUi5Helper, 'getControlAggregation');
         var group = npUiCanvasAPI._createGroup(button, aggregationMd);
         expect(spy).to.be.called;
         npUi5Helper.getControlAggregation.restore();
         expect(group.groupId).to.be.equal(aggregationMd.name);
         expect(group.groupType).to.be.equal(aggregationMd.type);
         expect(group.singleChild).to.be.false;
         expect(group.children.length).to.be.equal(0);
         });*/

        // TODO write for initByMd
        /*it('should initialize control', function () {
         sinon.stub(npUiCatalog, 'getControlAggregations', function () {
         return {items: {name: 'items'}};
         });

         expect(npUiCanvasAPI._initControl).to.throw(Error);
         var fnError = function () {
         npUiCanvasAPI._initControl({});
         };
         expect(fnError).to.throw(Error);

         var childData = {
         catalogName: 'sap.m.ListItem'
         };
         var ctrlData = {
         catalogName: 'sap.m.List',
         properties: [{name: 'text', value: 'hi'}],
         groups: [{groupId: 'items', children: [childData]}]
         };
         var initControlSpy = sinon.spy(npUi5Helper, 'initControl');
         var ctrl = npUiCanvasAPI._initControl(ctrlData);
         //once for the list, once for the item
         expect(initControlSpy).to.be.calledTwice;
         npUi5Helper.initControl.restore();
         expect(ctrl.type).to.be.equal(ctrlData.catalogName);
         expect(ctrl.aggregations.items[0].type).to.be.equal(childData.catalogName);
         expect(ctrl.properties.text).to.be.equal('hi');
         expect(npUiCanvasAPI.getCatalogName(ctrl)).to.be.equal('sap.m.List');

         // TODO test mashup control

         npUiCatalog.getControlAggregations.restore();
         });

         it('should return if control can have siblings', function () {
         var canHaveSiblings;
         //root control shouldn't return true
         canHaveSiblings = npUiCanvasAPI.canHaveSiblings(root);
         expect(canHaveSiblings).to.be.false;

         var isPublicSpy = sinon.spy(npUi5Helper, 'isInPublicAggregation');
         var mdSpy = sinon.spy(npUi5Helper, 'getControlParentAggregationMetadata');
         var ctrl = initControl('sap.m.Button');
         canHaveSiblings = npUiCanvasAPI.canHaveSiblings(ctrl);
         expect(canHaveSiblings).to.be.true;
         expect(isPublicSpy.calledWith(ctrl)).to.be.ok;
         expect(mdSpy.calledWith(ctrl)).to.be.ok;
         npUi5Helper.isInPublicAggregation.restore();
         npUi5Helper.getControlParentAggregationMetadata.restore();

         // if not in public aggregation
         npUi5Helper.isInPublicAggregation = function () {
         return false;
         };
         canHaveSiblings = npUiCanvasAPI.canHaveSiblings(ctrl);
         expect(canHaveSiblings).to.be.false;

         //restore
         npUi5Helper.isInPublicAggregation = function () {
         return true;
         };

         // if multiple is false
         npUi5Helper.getControlParentAggregationMetadata = function () {
         return {
         multiple: false
         };
         };
         canHaveSiblings = npUiCanvasAPI.canHaveSiblings(ctrl);
         expect(canHaveSiblings).to.be.false;
         });*/

        // TODO: fix this test and separate the different test cases (root control, public aggregation etc.)
        /*it('should say delete a control if possible', function () {
         var canDelete;

         var pageId = npUiCanvasAPI.getControlId(root);

         // root control cannot be deleted
         canDelete = npUiCanvasAPI.canDeleteControl(pageId);
         expect(canDelete).to.be.false;

         var isPublicSpy = sinon.spy(npUi5Helper, 'isInPublicAggregation');
         var ctrl = initControl('sap.m.Button', 'btn'),
         ctrlId = npUiCanvasAPI.getControlId(ctrl);
         canDelete = npUiCanvasAPI.canDeleteControl(ctrlId);
         expect(canDelete).to.be.true;
         expect(isPublicSpy.calledWith(ctrl)).to.be.ok;
         npUi5Helper.isInPublicAggregation.restore();

         //need to have a parent
         ctrl.parent = button;
         //delete control
         var updatePageSpy = sinon.spy(npPrototype, 'updatePage');
         var removeControlSpy = sinon.spy(npUi5Helper, 'removeControl');
         var deletePromise = npUiCanvasAPI.deleteControl(ctrlId);
         expect(updatePageSpy.called).to.be.ok;
         expect(removeControlSpy.calledWith(ctrl)).to.be.ok;
         npPrototype.updatePage.restore();
         npUi5Helper.removeControl.restore();
         expect(deletePromise).to.eventually.be.equal(ctrl);
         });*/
    });

    // TODO adjust for initByMd
    /*describe('canvas tests for inline-edit', function () {
     beforeEach(function () {
     pageMd.floorplan = 'ABSOLUTE';
     npUiCanvasAPI.init(win);
     npUiCanvasAPI.navTo('S0');
     $rootScope.$apply();
     });

     it('should get one editable property', function () {
     var posContainer = initControl('PositionContainer', 'pc0');
     npUi5Helper.insertControl(posContainer, page, 'content');
     var name = 'text', value = 'hello', span = '<span>hello</span>';
     var ctrlData = {
     catalogName: 'sap.m.Button',
     properties: [{name: name, value: value}]
     };
     var btn = npUiCanvasAPI._initControl(ctrlData);
     //set domref to contain the value 'hello'
     btn.domRef = function () {
     var element = document.createElement('div');
     element.innerHTML = '<div id="' + btn.id + '">' + span + '</div>';
     return element.firstChild;
     };
     win.document = {
     elementFromPoint: function () {
     return btn.domRef().firstChild;
     }
     };
     npUi5Helper.insertControl(btn, posContainer, 'control');
     var prop = npUiCanvasAPI.getEditablePropertyAtPosition(btn, 1, 2);
     expect(prop.name).to.be.equal(name);
     expect(prop.value).to.be.equal(value);
     var element = document.createElement('div');
     element.appendChild(prop.domRef);
     expect(element.innerHTML).to.be.equal(span);
     });
     });
     });*/
})();

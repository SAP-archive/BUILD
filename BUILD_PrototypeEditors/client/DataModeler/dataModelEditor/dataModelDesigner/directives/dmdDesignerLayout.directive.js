'use strict';

module.exports = ['$rootScope', '$parse', '$timeout', '$interval', '$log', '$location', '$anchorScroll', 'jsPlumbService', 'dm.ModelEditorService', function ($rootScope, $parse, $timeout, $interval, $log, $location, $anchorScroll, jsPlumbService, ModelEditorService) {
    var templateUrl = 'resources/norman-prototype-editors-client/DataModeler/dataModelEditor/dataModelDesigner/directives/dmdDesignerLayout.html';
    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            selectedItem: '=',
            addNavigation: '&',
            updateItem: '&',
            editNavigationTarget: '&',
            removeNavigation: '&',
            removeItem: '&',
            dragItemStop: '&',
            selectItem: '&'
        },
        controller: ['$scope', function ($scope) {

            // state
            $scope.isJSPlumbReady = false;
            $scope.model = {};

            // ---------------------------- model update handling methods ------------------------

            /**
             * This methods is drawing the arrows on the visual part of the datemodeler (aka dataModelerEditor)
             * The main challenge is to start drawing these arrows once the items are correctly positioned in the dom since (offset used by jsPlumb)
             * In order to be as consistent as possible, we re-draw all arrows with each model change since we can't know what has changed (eg: import a whole model at once).
             * Do not modify this method unless you are sure of what you are doing.
             * @private
             */
            $scope._drawConnections = function () {
                $log.debug('drawing is now possible');

                // first ask jsPlumb to stop drawing on the fly for performance improvements
                jsPlumbService.instance.setSuspendDrawing(true);

                // second, delete and re-create endpoints, that are used by jsPlumb for attaching arrows
                // this will also delete all existing connections
                jsPlumbService.instance.deleteEveryEndpoint();

                angular.forEach($scope.model.entities, function (entity) {
                    $log.debug('creating endpoint', entity._id);

                    // necessary un-registration step as jsPlumb keeps event listeners in memory
                    // triggering several onBeforeDrop
                    if (jsPlumbService.instance.isSource(entity._id)) {
                        jsPlumbService.instance.unmakeSource(entity._id);
                        jsPlumbService.instance.unmakeTarget(entity._id);
                    }

                    jsPlumbService.instance.makeSource(entity._id, {
                        anchor: 'Continuous',
                        filter: '.dmd-linkIcon',
                        isSource: true
                    });

                    jsPlumbService.instance.makeTarget(entity._id, {
                        anchor: 'Continuous',
                        dropOptions: {hoverClass: 'dragHover'},
                        uniqueEndpoint: false,
                        allowLoopback: true
                    });
                });

                // third, create all connections for navigation properties
                angular.forEach($scope.model.entities, function (entity) {

                    var navigationProperties = entity.navigationProperties || [];

                    navigationProperties.forEach(function (navigation) {

                        $log.debug('creating connection', navigation._id);

                        var paintStyle = navigation.multiplicity ? jsPlumbService.PAINT_STYLE_MULTIPLICITY_N : jsPlumbService.PAINT_STYLE_MULTIPLICITY_ONE,
                            label = navigation.multiplicity ? 'n' : '1';

                        jsPlumbService.instance.connect({
                            source: entity._id,
                            target: navigation.toEntityId,
                            editable: false,
                            paintStyle: paintStyle,
                            parameters: {
                                connId: navigation._id
                            },
                            overlays: [
                                ['Custom', {
                                    create: function () {
                                        return document.createElement('div');
                                    },
                                    cssClass: 'removeConnection dmsvg-remove',
                                    id: 'overlay-' + navigation._id,
                                    events: {
                                        click: function () {
                                            $scope.removeNavigation()(navigation);  // will update model
                                        }
                                    }
                                }],
                                [
                                    'Label',
                                    {
                                        label: label,
                                        location: [-25],
                                        id: 'label-' + navigation._id,
                                        cssClass: 'dmd-edge-multiplicity'
                                    }
                                ]
                            ]
                        });
                    });
                });


                // last, resume jsPlumb normal behavior and trigger the paint of created arrows
                jsPlumbService.instance.setSuspendDrawing(false, true);
            };

            // we need to draw jsPlumb connections only once the items are really in the dom
            // as there are no "onAfterRendering" in angular, we can't for sure know when this would be
            // in order to catch the item readiness as soon as possible, we set an checking function called every 50 milliseconds
            $scope._drawConnectionWhenReady = function () {

                var fnCallAfterItemRendering = function () {
                    if ($scope.isJSPlumbReady) {
                        var itemRendered = jsPlumbService.instance.getContainer().querySelectorAll('.dmd-entity');

                        if (itemRendered.length === $scope.model.entities.length) {
                            $interval.cancel($scope.drawConnectionIntervalPromise);
                            $scope.drawConnectionIntervalPromise = undefined;
                            $scope._drawConnections();
                        }
                    }
                };

                // don't wait for item readiness if there are no item in the model
                if ($scope.model.entities.length > 0 && !$scope.drawConnectionIntervalPromise) {
                    $scope.drawConnectionIntervalPromise = $interval(fnCallAfterItemRendering, 50);
                }
            };

            $scope._updateModel = function (updatedModel) {
                $scope.model = updatedModel;
                $scope._drawConnectionWhenReady();
            };

            $scope.$on('$destroy', function () {
                $log.log('destroy layout container ', $scope);
                jsPlumbService.instance.deleteEveryEndpoint();
                $scope.model = undefined;
            });

            // final step for initial drawing
            $scope.model = ModelEditorService.getModel();
            if ($scope.model && $scope.model.entities) {
                $scope._updateModel($scope.model);
            }

            // ---------------------------- external event handlers ------------------------

            $scope.$on('ModelEditorService.modelChanged', function (event, model) {
                $log.debug('model updated, repainting layout', model);
                $scope._updateModel(model);
            });

            $scope.$on('ModelEditorService.newEntity', function (event, item, bEdit) {
                if (bEdit === undefined || bEdit === true) {
                    // need to wait for the next digest cycle in order to make sure that our item is rendered in the dom
                    $timeout(function () {
                        var el = angular.element(document.getElementById(item._id)),
                            scopeElement = el.isolateScope();

                        scopeElement.onEdit();
                    });
                }
            });

            $scope.$on('ModelEditorService.selectedNavigation', function (event, selectionData) {
                var conn = jsPlumbService.getConnection(selectionData.navProp._id);
                conn.setHover(true);
                $timeout(function () {
                    conn.setHover(false);
                }, 3000);
            });

            // ---------------------------- zoom specific ------------------------
            $scope.$on('zoom-changed', function (event, args) {
                $scope.setZoom(args.value);
            });

            $scope.$on('fit-width', function (/*event, args*/) {
                var visibleArea = angular.element(jsPlumbService.instance.getContainer()).parent(),
                    right = 0,
                    position,
                    i;

                for (i = 0; i < $scope.model.entities.length; i++) {
                    position = $scope.model.entities[i].position;

                    if (position.left + position.width > right) {
                        right = position.left + position.width;
                    }
                }

                var zoom = Math.floor((visibleArea.prop('clientWidth') / (right + 20 /* margin */)) * 100);
                $scope.setZoom(zoom);

                // Broadcast back the value to display in the component
                $rootScope.$broadcast('fit-width-value', {value: zoom});
            });

            $scope.setZoom = function (zoom) {
                if ($scope.isJSPlumbReady) {
                    var ratio = parseInt(zoom, 10) / 100,
                        graphContainer = angular.element(jsPlumbService.instance.getContainer());

                    graphContainer.css({
                        transform: 'scale3D(' + ratio + ',' + ratio + ',' + ratio + ')',
                        transformOrigin: '0 0'
                    });

                    jsPlumbService.instance.setZoom(ratio);
                    jsPlumbService.instance.repaintEverything();
                }
            };

        }],
        link: function (scope) {

            jsPlumbService.init(function () {
                var container = document.getElementById('modelerlayout');
                jsPlumbService.instance.setContainer(container);

                // prevent connection creation from the ui, everything goes through the model updates
                jsPlumbService.instance.bind('beforeDrop', function (connection) {

                    var navigationData = {
                        multiplicity: true,
                        toEntityId: connection.targetId
                    };

                    ModelEditorService.setSelectedEntity({_id: connection.sourceId});
                    ModelEditorService.addNavigation(navigationData);

                    return false;
                });

                scope.isJSPlumbReady = true;
            });

        },
        templateUrl: templateUrl
    };
}];

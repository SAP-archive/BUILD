'use strict';

var npOutlineDropSupport = ['$document', '$log', 'jQuery', 'npDragHelper', 'npUiCatalog', 'npPageMetadata', 'npPageMetadataHelper',
    function ($document, $log, jQuery, npDragHelper, npUiCatalog, npPageMetadata, npPageMetadataHelper) {
        return {
            restrict: 'A',
            scope: {
                node: '='
            },
            link: function (scope, element) {
                var _dragData,
                    _dragEnterCount = 0, // we need to keep a counter since enter is called again whenever we hover over a child element of the drop target
                    _aggregations,
                    _acceptCSSClass = 'np-outline-drop-support-accepted';
                element.addClass('np-outline-drop-support');
                var addCopyEffect = function (oEvent) {
                    oEvent.dataTransfer.dropEffect = 'copy';
                };

                var addNoneEffect = function (oEvent) {
                    oEvent.dataTransfer.dropEffect = 'none';
                };

                var getAggregations = function () {
                    var aggregations = null,
                        controlMd = scope.node.data.controlMd;
                    if (controlMd && controlMd.catalogControlName && controlMd.catalogId && _dragData && _dragData.catalogControlName && _dragData.catalogId) {
                        aggregations = npUiCatalog.getValidAggregationsForControl(controlMd.catalogControlName, controlMd.catalogId, _dragData.catalogControlName, _dragData.catalogId);
                    }
                    return aggregations;
                };

                var isAcceptable = function () {
                    var controlMd = scope.node.data.controlMd;
                    _aggregations = getAggregations();
                    if (_aggregations && _aggregations.length > 0) {
                        // for beta 2: we consider only one aggregation
                        var candidate = _aggregations[0];
                        return candidate.multiple || controlMd.getChildrenMd(candidate.name).length === 0;
                    }
                    else if (npPageMetadataHelper.canHaveSiblings(controlMd)) {
                        return npUiCatalog.isControlValidInAggregation(_dragData.catalogControlName, _dragData.catalogId, controlMd.getParentMd().catalogControlName, controlMd.getParentMd().catalogId, controlMd.parentGroupId);
                    }
                    return false;
                };

                var onEnter = function (oEvent) {
                    $log.debug(this + ' drag onEnter');
                    _dragEnterCount++;
                    var dragData = npDragHelper.getDragData();
                    _dragData = dragData;
                    var bAcceptable = isAcceptable();
                    if (bAcceptable) {
                        element.addClass(_acceptCSSClass);
                        addCopyEffect(oEvent);
                        oEvent.preventDefault();
                        $log.debug(this + ' drag onEnter accept');
                    }
                    else {
                        addNoneEffect(oEvent);
                        $log.debug(this + ' drag onEnter refuse');
                    }
                };

                var onLeave = function (oEvent) {
                    $log.debug(this + ' drag onLeave');
                    _dragEnterCount--;
                    if (_dragEnterCount === 0) {
                        _dragData = undefined;
                    }
                    element.removeClass(_acceptCSSClass);
                    addNoneEffect(oEvent);
                };

                var onDrop = function () {
                    $log.debug(this + ' drag onDrop');
                    _dragEnterCount = 0;
                    var dragData = npDragHelper.getDragData();
                    _dragData = dragData;
                    var bAcceptable = isAcceptable();
                    if (bAcceptable && scope.node.data.controlMd.controlId) {
                        if (_aggregations && (_aggregations.length > 0)) {
                            npPageMetadata.addControl({
                                newCtrlCatalogName: _dragData.catalogControlName,
                                catalogId: _dragData.catalogId,
                                parentId: scope.node.data.controlMd.controlId,
                                groupId: _aggregations[0].name, // Group Id = aggregation name
                                index: 0
                            }, {
                                selectAddedControls: true,
                                skipCanvasUpdate: false
                            });
                            $log.debug(this + ' drag onDrop added has a child');
                        }
                        else {
                            npPageMetadata.addControl({
                                newCtrlCatalogName: _dragData.catalogControlName,
                                catalogId: _dragData.catalogId,
                                parentId: scope.node.data.controlMd.parentControlId,
                                groupId: scope.node.data.controlMd.parentGroupId, // Group Id = aggregation name
                                controlId: scope.node.data.controlMd.controlId + scope.node.data.controlMd.parentGroupIndex,  // This is a temporary workaround. If no controlId, the one generated already exists
                                index: (scope.node.data.controlMd.parentGroupIndex + 1) // Increment the group index so it will be after this sibling
                            }, {
                                selectAddedControls: true,
                                skipCanvasUpdate: false
                            });
                            $log.debug(this + ' drag onDrop added has a sibling');
                        }
                    }
                    else {
                        $log.debug(this + ' drag onDrop could not add');
                    }
                    npDragHelper.endDrag();
                    _dragData = undefined;
                    _aggregations = undefined;
                    element.removeClass(_acceptCSSClass);
                };

                element.on('dragenter', onEnter);
                element.on('dragover', onEnter);
                element.on('drop', onDrop);
                element.on('dragleave', onLeave);
            }
        };
    }
];

module.exports = npOutlineDropSupport;

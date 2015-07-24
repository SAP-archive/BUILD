'use strict';

var _ = require('norman-client-tp').lodash;

/**
 * @ngdoc factory
 * @name npCanvasUpdater
 * @namespace npCanvasUpdater
 */
var npCanvasUpdater = ['$q', 'npUiCanvasAPI', 'npCanvasEvents', 'npPageMetadataEvents', 'npPageMetadataHelper',
    function ($q, npUiCanvasAPI, npCanvasEvents, pageMdEvents, pageMdHelper) {
        return {
            startListeningForMetadataChanges: startListeningForMetadataChanges,
            stopListeningForMetadataChanges: stopListeningForMetadataChanges
        };

        /**
         * @name startListeningForMetadataChanges
         * @memberof npCanvasUpdater
         * @description Start listening for page metadata changes to update canvas accordingly.
         */
        function startListeningForMetadataChanges() {
            var listeners = [];
            listeners.push(pageMdEvents.listen(pageMdEvents.events.controlsAdded, controlsAddedListener));
            listeners.push(pageMdEvents.listen(pageMdEvents.events.controlsRemoved, controlsRemovedListener));
            listeners.push(pageMdEvents.listen(pageMdEvents.events.controlsMoved, controlsMovedListener));
            listeners.push(pageMdEvents.listen(pageMdEvents.events.controlPropertiesChanged, controlPropertiesChangedListener));
            listeners.push(pageMdEvents.listen(pageMdEvents.events.controlsBindingChanged, controlsBindingChangedListener));
            listeners.push(pageMdEvents.listen(pageMdEvents.events.mainEntityChanged, mainEntityChangedListener));
            startListeningForMetadataChanges._listeners = listeners;
        }

        /**
         * @name stopListeningForMetadataChanges
         * @memberof npCanvasUpdater
         * @description Stop listening for page metadata changes.
         */
        function stopListeningForMetadataChanges() {
            var listeners = startListeningForMetadataChanges._listeners;
            _.forEach(listeners, function (listener) {
                if (_.isFunction(listener)) {
                    listener();
                }
            });
        }

        /**
         * @private
         * @description Waits until controls are ready and publishes the 'controlsRendered' event once they are.
         *
         * @param {ControlMd[]} waitControls
         */
        function broadcastWhenReady(waitControls) {
            var allControlsReady = _.map(waitControls, function (controlMd) {
                return npUiCanvasAPI.controlReady(controlMd);
            });
            $q.all(allControlsReady)
                .then(function () {
                    npCanvasEvents.broadcast(npCanvasEvents.events.controlsRendered, waitControls);
                });
        }

        /**
         * @private
         * @description Listener for when controls are added to page metadata. Will navigate to the appropriate page, add the controls and
         * broadcast the 'controlsRendered' event once controls are ready.
         *
         * @param {object} event
         * @param {PageMd} pageMd
         * @param {ControlMd[]} addedControls
         */
        function controlsAddedListener(event, pageMd, addedControls) {
            npUiCanvasAPI.navTo(pageMd)
                .then(function () {
                    addControlsByMd(addedControls);
                    broadcastWhenReady(addedControls);
                });
        }

        /**
         * @private
         * @description Recursively adds controls and all their children to canvas.
         *
         * @param {ControlMd[]} controlMdObjs
         */
        function addControlsByMd(controlMdObjs) {
            _.forEach(controlMdObjs, function (controlMd) {
                npUiCanvasAPI.addChildByMd(controlMd);
                var children = _.chain(controlMd.groups)
                    .map(function (group) {
                        return controlMd.getChildrenMd(group.groupId);
                    })
                    .flatten()
                    .value();
                addControlsByMd(children);
            });
        }

        /**
         * @private
         * @description Listener for when controls are removed from page metadata. Will navigate to the appropriate page, remove the controls and
         * broadcast the 'controlsRendered' event once parent controls are ready.
         *
         * @param {object} event
         * @param {PageMd} pageMd
         * @param {ControlMd[]} removedControls
         */
        function controlsRemovedListener(event, pageMd, removedControls) {
            npUiCanvasAPI.navTo(pageMd)
                .then(function () {
                    removeControlsByMd(removedControls);
                    var parentControls = _.chain(removedControls)
                        .map(function (controlMd) {
                            return controlMd.getParentMd();
                        })
                        .uniq('controlId')
                        .value();
                    broadcastWhenReady(parentControls);
                });
        }

        /**
         * @private
         * @description Removes all controls from canvas.
         *
         * @param {ControlMd[]} controlMdObjs
         */
        function removeControlsByMd(controlMdObjs) {
            _.forEach(controlMdObjs, function (controlMd) {
                npUiCanvasAPI.deleteControl(controlMd);
            });
        }

        /**
         * @private
         * @description Listener for when controls are moved on a page. Will navigate to the appropriate page, move the controls and
         * broadcast the 'controlsRendered' event once  controls are ready.
         *
         * @param {object} event
         * @param {PageMd} pageMd
         * @param {ControlMd[]} removedControls
         */
        function controlsMovedListener(event, pageMd, movedControls) {
            npUiCanvasAPI.navTo(pageMd)
                .then(function () {
                    moveControlsByMd(movedControls);
                    broadcastWhenReady(movedControls);
                });
        }

        /**
         * @private
         * @description Moves passed controls to their new position/parent/index.
         *
         * @param {ControlMd[]} controlMdObjs
         */
        function moveControlsByMd(controlMdObjs) {
            _.forEach(controlMdObjs, function (controlMd) {
                npUiCanvasAPI.moveChildByMd(controlMd);
            });
        }

        /**
         * @private
         * @description Listener for when control properties are changed. Will navigate to the appropriate page, update the controls and
         * broadcast the 'controlsRendered' event once controls are ready.
         *
         * @param {object} event
         * @param {PageMd} pageMd
         * @param {ControlMd[]} removedControls
         */
        function controlPropertiesChangedListener(event, pageMd, propertyChanges) {
            npUiCanvasAPI.navTo(pageMd)
                .then(function () {
                    var changedControls = _.map(propertyChanges, function (propertyChange) {
                        if (propertyChange.propertyType === 'properties') {
                            npUiCanvasAPI.setControlPropertiesByMd(propertyChange.controlMd, propertyChange.properties);
                        }
                        return propertyChange.controlMd;
                    });
                    broadcastWhenReady(changedControls);
                });
        }

        /**
         * @private
         * @description Listener for when control bindings are changed. Will navigate to the appropriate page, change the bindings and
         * broadcast the 'controlsRendered' event once controls are ready.
         *
         * @param {object} event
         * @param {PageMd} pageMd
         * @param {ControlMd[]} removedControls
         */
        function controlsBindingChangedListener(event, pageMd, bindingDefs) {
            npUiCanvasAPI.navTo(pageMd)
                .then(function () {
                    var changedControls = _.map(bindingDefs, function (bindingDef) {
                        updateCanvasBinding(bindingDef, pageMd);
                        return pageMdHelper.getControlMd(bindingDef.controlId, pageMd);
                    });
                    broadcastWhenReady(changedControls);
                });
        }

        /**
         * @private
         * @description Updates a controls binding.
         *
         * @param {object} bindingDef
         * @param {PageMd} pageMd
         */
        function updateCanvasBinding(bindingDef, pageMd) {
            var controlMd = pageMdHelper.getControlMd(bindingDef.controlId, pageMd),
                groupMd = pageMdHelper.getGroupMd(bindingDef.groupId, controlMd),
                templateMd = pageMdHelper.getControlMd(groupMd.children[0], pageMd);
            npUiCanvasAPI.bindControlGroupByMd(controlMd, groupMd, templateMd);
            if (!pageMdHelper.isBound(groupMd)) {
                _.forEach(bindingDef.children, npUiCanvasAPI.addChildByMd);
            }
        }

        /**
         * @private
         * @description Listener for when the main entity of a page changes. Will navigate to the appropriate page and
         * broadcast the 'controlsRendered' event once the page is ready.
         *
         * @param {object} event
         * @param {PageMd} pageMd
         * @param {ControlMd[]} removedControls
         */
        function mainEntityChangedListener(event, pageMd) {
            npUiCanvasAPI.navTo(pageMd)
                .then(function () {
                    var rootMd = pageMdHelper.getControlMd(pageMd.rootControlId, pageMd);
                    broadcastWhenReady([rootMd]);
                });
        }
    }
];

module.exports = npCanvasUpdater;

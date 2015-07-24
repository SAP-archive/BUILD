'use strict';

var _ = require('norman-client-tp').lodash;

/**
 * @ngdoc factory
 * @name npPageMetadataMoveControl
 * @namespace uiComposer:services:npPageMetadata:moveControl
 */

var npPageMetadataMoveControl = ['npPageMetadataHelper', 'npPageMetadataEvents', 'npPageMetadataAddControl', 'npPageMetadataDeleteControl',
    function (pageMdHelper, pageMdEvents, addControlService, deleteControlService) {

        /**
         * @private
         * @description Moves the control to its new parent/group/index/position.
         *
         * @param {ControlDef} controlDef The updated control metadata that contains the information about new parent, group, index and position.
         * @param {PageMd} pageMd The page metadata object to move in.
         */
        var performMove = function (controlDef, pageMd) {
            var controlMd = pageMdHelper.getControlMd(controlDef.controlId, pageMd);
            deleteControlService.removeControlFromPage(controlMd, pageMd);

            controlMd.parentControlId = controlDef.parentId;
            controlMd.parentGroupId = controlDef.groupId;
            controlMd.parentGroupIndex = controlDef.index;
            controlMd.floorplanProperties = addControlService.getFloorplanProperties(_.parseInt(controlDef.x), _.parseInt(controlDef.y));

            addControlService.addControlToPage(controlMd, pageMd);
        };

        /**
         * @name performMoves
         * @memberof uiComposer:services:npPageMetadata:moveControl
         * @description Iterates over controlMoves and uses performMove to move each control. The npPageMetadata service uses this function to move controls.
         * This function is only public to the npPageMetadata service.
         *
         * @param {ControlDefs[]} controlMoves
         * @param {PageMd} pageMd
         * @returns {Promise} Promise that is resolved once all controls have been moves in page metadata and canvas.
         */
        var performMoves = function (controlMoves, pageMd) {
            var returnObjs = [];

            _.forEach(controlMoves, function (controlDef) {
                performMove(controlDef, pageMd);
                returnObjs.push(pageMdHelper.getControlMd(controlDef.controlId, pageMd));
            });

            pageMdEvents.broadcast(pageMdEvents.events.controlsMoved, pageMd, returnObjs);

            return returnObjs;
        };

        return {
            performMoves: performMoves
        };
    }
];

module.exports = npPageMetadataMoveControl;

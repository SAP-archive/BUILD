'use strict';

var _ = require('norman-client-tp').lodash;

/**
 * @ngdoc factory
 * @name npPageMetadataDeleteControl
 * @namespace uiComposer:services:npPageMetadata:deleteControl
 */

var npPageMetadataDeleteControl = ['$log', 'npPageMetadataHelper', 'npPageMetadataEvents',
    function ($log, pageMdHelper, pageMdEvents) {

        /**
         * @private
         * @description Deletes the child from the group that contains it.
         *
         * @param {ControlMd} parentMd
         * @param {ControlMd} controlMd
         * @return {GroupMd|undefined} containingGroup
         */
        var deleteGroupChild = function (parentMd, controlMd) {
            var groupMd = pageMdHelper.getGroupMd(controlMd.parentGroupId, parentMd);
            if (!groupMd) {
                $log.error('npPageMetadataDeleteControl: control with wrong parentGroupId', controlMd);
                return;
            }
            var index = _.indexOf(groupMd.children, controlMd.controlId);
            if (index < 0) {
                $log.error('npPageMetadataDeleteControl: control not found in parent group', controlMd, groupMd);
                return;
            }
            if (index !== controlMd.parentGroupIndex) {
                $log.warn('npPageMetadataDeleteControl: control with wrong parentGroupIndex', controlMd);
            }
            groupMd.children.splice(index, 1);
            pageMdHelper.adjustChildIndexes(parentMd, controlMd.parentGroupId);
            return groupMd;
        };

        /**
         * @private
         * @description Removes control from its parent.
         */
        var removeControlFromParentGroup = function (controlMd, pageMd) {
            // get it from the page we want to be it removed from
            var parentMd = pageMdHelper.getControlMd(controlMd.parentControlId, pageMd);
            if (parentMd) {
                deleteGroupChild(parentMd, controlMd);
            }
            else {
                $log.warn('npPageMetadataDeleteControl: control parent not found', controlMd);
            }
            // FIXME remove the parent link currently causes issues with undo/redo, disable it for now
            // delete controlMd.parentControlId;
            // delete controlMd.parentGroupId;
            // delete controlMd.parentGroupIndex;
        };

        /**
         * @name removeControlFromPage
         * @description Removes control from page by removing it from page metadata and its parent group.
         *
         * @param {ControlMd} controlMd
         * @param {PageMd} pageMd
         */
        var removeControlFromPage = function (controlMd, pageMd) {
            removeControlFromParentGroup(controlMd, pageMd);
            _.remove(pageMd.controls, {controlId: controlMd.controlId});
        };

        /**
         * @private
         * @description Removes all control metadata objects from page metadata and deletes them from the canvas.
         * All control metadata objects need to have a parent-child relationship and have to be sorted in that order.
         *
         * @param {ControlMd[]} controlMdObjs Array of control metadata objects to delete.
         * @param {PageMd} pageMd The page metadata object to delete from.
         */
        var performDelete = function (controlMdObs, pageMd) {
            _.forEachRight(controlMdObs, function (controlMd) {
                removeControlFromPage(controlMd, pageMd);
            });
        };

        /**
         * @name performDeletions
         * @memberof uiComposer:services:npPageMetadata:deleteControl
         * @description Iterates over controlDeletions and uses performDelete to remove each control from the prototype. The npPageMetadata service uses this function to delete controls. This function is only public to the npPageMetadata service.
         *
         * @param {ControlMd[][]} controlDeletions
         * @param {PageMd} pageMd
         * @returns {Promise} Promise that is resolved once all controls have been deleted from page metadata and canvas.
         */
        var performDeletions = function (controlDeletions, pageMd) {
            var returnObjs = [];

            _.forEach(controlDeletions, function (controlMdObjs) {
                returnObjs.push(controlMdObjs[0]);
                performDelete(controlMdObjs, pageMd);
            });

            pageMdEvents.broadcast(pageMdEvents.events.controlsRemoved, pageMd, returnObjs);

            return returnObjs;
        };

        /**
         * @name deleteGroupChildren
         * @memberof uiComposer:services:npPageMetadata:deleteControl
         * @description Deletes group children and children definitions
         *
         * @param {GroupMd} groupMd
         * @param {PageMd} pageMd
         * @returns {Promise} Promise that is resolved once all controls have been deleted from page metadata and canvas.
         */
        var deleteGroupChildren = function (groupMd, pageMd) {
            var childrenMd = _.map(groupMd.children, function (childId) {
                return pageMdHelper.getControlAndChildMd(childId, pageMd);
            });
            return performDeletions(childrenMd, pageMd);
        };


        return {
            performDelete: performDelete,
            performDeletions: performDeletions,
            deleteGroupChildren: deleteGroupChildren,
            removeControlFromPage: removeControlFromPage
        };
    }
];

module.exports = npPageMetadataDeleteControl;

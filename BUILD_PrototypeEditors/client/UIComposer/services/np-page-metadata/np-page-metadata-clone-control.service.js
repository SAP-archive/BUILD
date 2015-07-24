'use strict';

var _ = require('norman-client-tp').lodash;

/**
 * @ngdoc factory
 * @name npPageMetadataCloneControl
 * @namespace uiComposer:services:npPageMetadata:cloneControl
 */

var npPageMetadataCloneControl = ['npPageMetadataHelper', 'npPageMetadataAddControl', 'npLayoutHelper', 'npConstants',
    function (pageMdHelper, addControlService, npLayoutHelper, npConstants) {

        var getControlAndChildrenMd = function (controlMd) {
            var children = [controlMd];
            _.forEach(controlMd.groups, function (groupMd) {
                var groupChildren = controlMd.getChildrenMd(groupMd.groupId);
                _.forEach(groupChildren, function (childMd) {
                    children = children.concat(getControlAndChildrenMd(childMd));
                });
            });
            return children;
        };
        /**
         * @name cloneControls
         * @memberof npPageMetadataCloneControl
         * @param {CloneControlDefinition[]} controlDefs
         * @param {Object} targetPageMd
         * @returns {ControlMd[][]} array of array of clones
         */
        var cloneControls = function (controlDefs, targetPageMd) {
            var clones = [];
            _.forEach(controlDefs, function (controlDef) {
                var controlAndChildrenMd = getControlAndChildrenMd(controlDef.controlMd),
                    clonesMd = _.cloneDeep(controlAndChildrenMd),
                    newIds = {};

                // setup all clones
                _.forEach(clonesMd, function (cloneMd) {
                    var oldId = cloneMd.controlId,
                        newId = addControlService.getNextId(cloneMd.catalogControlName);
                    newIds[oldId] = newId;

                    cloneMd.controlId = newId;
                    // update parent id, empty groups
                    cloneMd.parentControlId = newIds[cloneMd.parentControlId] || cloneMd.parentControlId;

                    _.forEach(cloneMd.groups, function (groupMd) {
                        groupMd.children = [];
                    });
                    if (npLayoutHelper.isAbsoluteLayout()) {
                        _.forEach(cloneMd.floorplanProperties, function (property) {
                            property.value = _.parseInt(property.value) + npConstants.copyPasteLayoutHelperSettings.offsetInPixels + 'px';
                        });
                    }

                    pageMdHelper.setControlMdPrototype(cloneMd, targetPageMd);
                    clones.push(cloneMd);
                });

                // setup root clone
                var rootCloneMd = clonesMd[0];
                rootCloneMd.parentControlId = controlDef.parentId;
                rootCloneMd.parentGroupId = controlDef.groupId;
                rootCloneMd.parentGroupIndex = controlDef.index;
            });

            return [clones];
        };

        return {
            cloneControls: cloneControls
        };
    }
];

module.exports = npPageMetadataCloneControl;

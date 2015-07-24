'use strict';

var _ = require('norman-client-tp').lodash;

/**
 * @ngdoc factory
 * @name npPageMetadataAddControl
 * @namespace uiComposer:services:npPageMetadata:addControl
 */

var npPageMetadataControlBinding = ['$log', 'npPageMetadataAddControl', 'npPageMetadataDeleteControl', 'npPageMetadataHelper', 'npPageMetadataEvents', 'npBindingHelper',
    function ($log, addControlService, deleteControlService, pageMdHelper, pageMdEvents, npBindingHelper) {

        var isSameTemplate = function (ctrlMd1, ctrlMd2) {
            return !!ctrlMd1 && !!ctrlMd2 && ctrlMd1.controlId === ctrlMd2.controlId;
        };


        var updateGroupChildren = function (groupMd, childrenMd, pageMd) {
            var controlsToRemove = pageMdHelper.getControlsAndChildMd(groupMd.children, pageMd);
            // delete old children, start from children up to topmost parent
            _.forEachRight(controlsToRemove, function (childMd) {
                deleteControlService.removeControlFromPage(childMd, pageMd);
            });
            _.forEach(childrenMd, function (childMd) {
                addControlService.addControlToPage(childMd, pageMd);
            });
        };

        /**
         * @private
         * @description bind automatically the properties of the control
         *
         * @param controlMd
         * @param mainEntity
         */
        var performAutoBindings = function (controlMd, mainEntity) {
            var candidates = [],
                usedPaths = {};

            _.forEach(controlMd.properties, function (propertyMd) {

                candidates = npBindingHelper.getPropertyPathsFromMd(propertyMd, controlMd, mainEntity);
                _.forEach(candidates, function (candidate) {
                    if (!usedPaths[candidate.path]) {
                        usedPaths[candidate.path] = true;
                        propertyMd.binding = candidate.binding;
                        return false;
                    }
                });
            });
        };

        /**
         * @private
         * @description bind the properties the user has dropped on the control of the control
         *
         * @param controlMd
         * @param propertyDefs
         */
        var performUserDefinedPropertiesBinding = function (controlMd, propertyDefs) {
            _.forEach(propertyDefs, function (propertyDef) {
                var propertyMd = _.find(controlMd.properties, function (property) {
                    return property.name === propertyDef.name;
                });
                propertyMd.binding = propertyDef.binding;
            });
        };

        /**
         * @private
         * @description updates the binding of the group with new template and/or path. Must pass either new template or path.
         *
         * @param {GroupBindingDefinition} bindingDef
         * @param {PageMd} pageMd
         */
        var performChangeGroupBinding = function (bindingDef, pageMd) {
            var controlMd = pageMdHelper.getControlMd(bindingDef.controlId, pageMd),
                groupId = bindingDef.groupId,
                newControlsMd = bindingDef.children;
            if (!pageMdHelper.canEditGroup(controlMd, groupId)) {
                throw new Error('group ' + groupId + ' cannot be edited because it is not exposed by the catalog');
            }

            var groupMd = pageMdHelper.getGroupMd(groupId, controlMd),
                wasBound = pageMdHelper.isBound(groupMd),
                isBound = pageMdHelper.isBound(bindingDef);

            groupMd.binding = bindingDef.binding;
            if (!isBound && !wasBound) {
                $log.warn('npPageMetadataControlBinding: wrong service usage. groupMd was not bound and it is not updating the binding', bindingDef);
                throw new Error('binding not updated');
            }

            if (!isBound || !wasBound || !isSameTemplate(newControlsMd[0], pageMdHelper.getControlMd(groupMd.children[0], pageMd))) {
                updateGroupChildren(groupMd, newControlsMd, pageMd);
            }

            if (bindingDef.autoBind && newControlsMd[0]) {
                performAutoBindings(newControlsMd[0], pageMd.mainEntity);
            }

            if (bindingDef.properties && newControlsMd[0]) {
                performUserDefinedPropertiesBinding(newControlsMd[0], bindingDef.properties);
            }

            return controlMd;
        };

        /**
         * @name performChangeBindings
         * @memberof uiComposer:services:npPageMetadata:addControl
         * @description Iterates over bindingDefs and updates each control binding. The npPageMetadata service uses this function to update controls bindings.
         * This function is only public to the npPageMetadata service.
         * @param {GroupBindingDefinition[][]} bindingDefs
         * @param {PageMd} pageMd
         * @returns {Promise} Promise that is resolved once all controls have been bound and updated in the metadata.
         */
        var performChangeBindings = function (bindingDefs, pageMd) {
            _.forEach(bindingDefs, function (bindingDef) {
                performChangeGroupBinding(bindingDef, pageMd);
            });

            pageMdEvents.broadcast(pageMdEvents.events.controlsBindingChanged, pageMd, bindingDefs);
        };

        return {
            performChangeBindings: performChangeBindings
        };
    }
];

module.exports = npPageMetadataControlBinding;

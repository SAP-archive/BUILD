'use strict';

var _ = require('norman-client-tp').lodash;

/**
 * @ngdoc factory
 * @name npPageMetadataChangeProperty
 * @namespace uiComposer:services:npPageMetadata:changeProperty
 */

var npPageMetadataChangeProperty = ['npPageMetadataHelper', 'npPageMetadataEvents',
    function (pageMdHelper, pageMdEvents) {

        var performPropertyChange = function (changedProperties, type, controlMd) {
            var properties = controlMd[type] || [];

            _.forEach(changedProperties, function (changedProperty) {
                if (type === 'properties' && !pageMdHelper.canEditProperty(controlMd, changedProperty.name)) {
                    throw new Error('property ' + changedProperty.name + ' cannot be edited because it is not exposed by the catalog');
                }
                var property = _.find(properties, {name: changedProperty.name});
                property.value = changedProperty.value;
                property.binding = changedProperty.binding;
            });
            controlMd[type] = properties;
        };

        /**
         * @name performPropertyChanges
         * @memberof uiComposer:services:npPageMetadata:changeProperty
         * @description Iterates over propertyChanges and uses performPropertyChange to change properties for  each control. The npPageMetadata service uses this function to change properties. This function is only public to the npPageMetadata service.
         * @param {object[]} propertyChanges
         * @returns {Promise} Promise that is resolved once all properties have been changed.
         */
        var performPropertyChanges = function (propertyChanges, pageMd) {
            var returnObjs = [];

            _.forEach(propertyChanges, function (propertyChange) {
                returnObjs.push(propertyChange.controlMd);
                performPropertyChange(propertyChange.properties, propertyChange.propertyType, propertyChange.controlMd);
            });

            pageMdEvents.broadcast(pageMdEvents.events.controlPropertiesChanged, pageMd, propertyChanges);

            return returnObjs;
        };

        return {
            performPropertyChanges: performPropertyChanges
        };
    }
];

module.exports = npPageMetadataChangeProperty;

'use strict';

/**
 * @ngdoc factory
 * @name npPageMetadataMainEntity
 * @namespace uiComposer:services:npPageMetadata:mainEntity
 */

var npPageMetadataMainEntity = ['npPageMetadataHelper', 'npPageMetadataEvents',
    function (pageMdHelper, pageMdEvents) {

        /**
         * @name performChangeBindings
         * @memberof uiComposer:services:npPageMetadata:mainEntity
         * @description Changes the main entity of the page
         * This function is only public to the npPageMetadata service.
         * @param {string} main entity id
         * @param {PageMd} pageMd
         * @returns {Promise} Promise that is resolved once the main entity of the page has been changed and the page has been rendered.
         */
        var performChangeMainEntity = function (mainEntity, pageMd) {
            pageMd.mainEntity = mainEntity;
            pageMdEvents.broadcast(pageMdEvents.events.mainEntityChanged, pageMd);
        };

        return {
            performChangeMainEntity: performChangeMainEntity
        };
    }
];

module.exports = npPageMetadataMainEntity;

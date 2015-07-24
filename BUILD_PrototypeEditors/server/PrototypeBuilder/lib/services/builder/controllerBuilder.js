'use strict';
var _ = require('norman-server-tp').lodash;
var builderUtils = require('./builderUtils');

/**
 * Generate the controller from the Metadata
 * The assumption is that *any uiLang* can be represented as Javascript
 *
 * @param pageMetadata the view Metadata coming from the UI Composer
 * @param appMetadata the app Metadata coming from the UI Composer
 * @param pageExpandParameters the expand parameters that were retrieved from the view
 * @returns {*} the Javascript string representing the controller
 */
exports.generateControllerFromMetadata = function (pageMetadata, appMetadata, pageExpandParameters) {
    var eventHandlerToCreate = {};
    var navigationTargets = _.filter(appMetadata.navigations, function (navigation) {
        return navigation.targetPageId === pageMetadata._id.toString();
    });
    var langHelper = builderUtils.langHelper;
    var initCode = langHelper.generateRouterCode(navigationTargets, pageExpandParameters);
    eventHandlerToCreate[initCode.methodName] = initCode.content;
    _.each(pageMetadata.controls, function (control) {
        _.each(control.events, function (event) {
            var eventHandlerName = langHelper.getEventHandlerName(event, control.controlId);
            var actionInfo = builderUtils.getActionInfo(event.actionId, control.uiCatalogName, _.indexBy(event.params, 'key'));
            if (builderUtils.isEventValid(event.eventId, control)) {
                eventHandlerToCreate[eventHandlerName] = langHelper.generateEventHandlerCode(eventHandlerName, actionInfo);
            }
        });
    });

    var sourceNavigations = _.filter(appMetadata.navigations, function (navigation) {
        return navigation.sourcePageId === pageMetadata._id.toString();
    });
    return langHelper.generateController(pageMetadata.name, eventHandlerToCreate, sourceNavigations);
};

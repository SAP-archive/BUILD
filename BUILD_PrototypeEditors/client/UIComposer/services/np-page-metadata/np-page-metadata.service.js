'use strict';


var _ = require('norman-client-tp').lodash;

/**
 * @ngdoc factory
 * @name npPageMetadata
 * @namespace uiComposer:services:npPageMetadata
 */

/**
 * @typedef ControlDefinition
 * @type {object}
 * @memberof uiComposer:services:npPageMetadata
 * @property {string} newCtrlCatalogName - catalog name of ctrl to add
 * @property {string} controlId - id of control in case it already exists (e.g. for move).
 * @property {string} parentId - id of parent element
 * @property {string} groupId
 * @property {number} index
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef PropertyDefinition
 * @type {object}
 * @memberof uiComposer:services:npPageMetadata
 * @property {string} controlId - id of control who's properties should be changed
 * @property {object[]} properties - array of property objects to change (structure defined by ui catalog)
 */

/**
 * @typedef GroupBindingDefinition
 * @type {object}
 * @memberof uiComposer:services:npPageMetadata
 * @property {string} controlId - id of control who's group should be changed
 * @property {string} groupId - id of group that should be changed
 * @property {object} binding - binding information coming from binding helper
 * @property {ControlDefinition[]} children - the control to be used as binding template
 */
/**
 * @typedef EventDefinition
 * @type {object}
 * @memberof uiComposer:services:npPageMetadata
 * @property {string} controlId - id of control who's group should be changed
 * @property {string} eventId - id of event that should be changed
 * @property {string} actionId - id of the action to be associated to the event
 * @property {object} params - parameters specific to the action
 */

/**
 * @typedef CloneControlDefinition
 * @type {object}
 * @memberof uiComposer:services:npPageMetadata
 * @property {ControlDefinition} controlMd - controlMd to be cloned
 * @property {string} parentId - new parent of the clone
 * @property {string} groupId - new group of the clone
 * @property {number} index
 */


var npPageMetadata = ['$rootScope', '$resource', '$window', '$location', '$q', '$timeout', '$log', '$state', 'ActiveProjectService', 'npUiCanvasAPI', 'npPrototype',
    'uiCommandManager', 'npPageMetadataAddControl', 'npPageMetadataDeleteControl', 'npPageMetadataMoveControl', 'npPageMetadataChangeProperty',
    'npPageMetadataControlBinding', 'npPageMetadataMainEntity', 'npPageMetadataHelper', 'npPageMetadataEvents', 'uiThumbnailGenerator', 'npLayoutHelper',
    'npPageMetadataChangeEvent', 'npPageMetadataCloneControl', 'npConstants', 'uiError',
    function ($rootScope, $resource, $window, $location, $q, $timeout, $log, $state, ActiveProjectService, npUiCanvasAPI, npPrototype, commandManager,
              addControlService, deleteControlService, moveControlService, changePropertyService, bindControlService, mainEntityService, pageMdHelper, pageMdEvents,
              uiThumbnailGenerator, npLayoutHelper, changeEventService, npPageMetadataCloneControl, npConstants, uiError) {

        var pageAPI,
            _pagesMd = {}, // pageName - pageMetadata mapping
            _availableMainEntityIds = {}, // pageName - available main entities mapping
            _pendingUpdates = {}, // pageName - pageMetadata mapping, used to update backend with latest data
            _pendingPreviews = {}; // thumbnail url - thumbnail blob mapping, used to update thumbnail in backend

        var SMART_APP_AUTO_SAVE_DELAY = 0,
            STANDARD_APP_AUTO_SAVE_DELAY = 3000,
            AUTO_SAVE_DELAY;

        var setAutosaveDelay = function () {
            AUTO_SAVE_DELAY = STANDARD_APP_AUTO_SAVE_DELAY;
            npPrototype.getPrototype().then(function (prototype) {
                if (prototype.isSmartApp) {
                    AUTO_SAVE_DELAY = SMART_APP_AUTO_SAVE_DELAY;
                }
                else {
                    AUTO_SAVE_DELAY = STANDARD_APP_AUTO_SAVE_DELAY;
                }
            });
        };
        var updateParams = function () {
            var pageUrl = '/api/projects/:projectId/prototype/page/';
            pageAPI = $resource(pageUrl, {
                projectId: ActiveProjectService.id
            }, {
                updatePage: {
                    method: 'PUT',
                    // for correct multipart sending
                    headers: {
                        'Content-Type': undefined
                    }
                },
                getAvailableMainEntities: {
                    method: 'GET',
                    url: pageUrl + 'mainEntities',
                    isArray: true
                }
            });
        };

        updateParams();
        setAutosaveDelay();

        $rootScope.$on('UIComposer/onEnter', function () {
            _pagesMd = {};
        });

        $rootScope.$on('npPrototype/recreatingPrototype', function () {
            _pagesMd = {};
            _currentPageName = undefined;
            setAutosaveDelay();
        });

        $rootScope.$on('PageDeleted', function (event, deletedPage) {
            invalidateAllPages();
            _pendingUpdates[deletedPage] = undefined;
            delete _pendingUpdates[deletedPage];
        });

        $rootScope.$on('projectChanged', function () {
            _pagesMd = {};
            updateParams();
            setAutosaveDelay();
        });

        /*********************************/
        /* Save to backend functionality */
        /*********************************/

        /**
         * @name saveStatuses
         * @memberof uiComposer:services:npPageMetadata
         * @description Possible values for save status.
         */
        var saveStatuses = {
            SAVE_IDLE: 'SAVE_IDLE',
            SAVE_SUCCESSFUL: 'SAVE_SUCCESSFUL',
            SAVE_FAILED: 'SAVE_FAILED',
            SAVE_PENDING: 'SAVE_PENDING'
        };

        saveStatuses._currentStatus = saveStatuses.SAVE_SUCCESSFUL;

        /**
         * @name getSaveStatus
         * @memberof uiComposer:services:npPageMetadata
         * @description Get the current save status. Can be successful, failed or pending.
         * @returns {string} Current save status. Possible values can be found in npPageMetadata.saveStatuses.
         */
        var getSaveStatus = function () {
            return saveStatuses._currentStatus;
        };

        /**
         * @private
         * @description Log pending updates to console.
         */
        /*eslint-disable*/
        var logPendingUpdates = function () {
        /*eslint-enable*/
            var result = '\n';
            var treeControls = [];

            var checkBinding = function (element) {
                return !!(element.binding && element.binding.paths && element.binding.paths.length > 0);
            };

            var exploreFn = function (pageMd, controlId, tabs) {
                tabs = tabs || '';
                var controlMd = _.find(pageMd.controls, {
                    controlId: controlId
                });
                var catalogControlName = controlMd ? controlMd.catalogControlName : '';
                result += tabs + controlId + ' ' + catalogControlName;
                var alreadyExploredId = _.find(treeControls, {
                    controlId: controlId
                });
                if (controlMd && !alreadyExploredId) {
                    treeControls.push({
                        controlId: controlId
                    });
                    var subTabs = tabs + '  ';
                    var subSubTabs = tabs + '    ';

                    _.forEach(controlMd.properties, function (property) {
                        var hasBinding = checkBinding(property);
                        result += ', ' + property.name + ': ' + hasBinding;
                    });
                    result += '\n';
                    _.forEach(controlMd.groups, function (group) {
                        var hasBinding = checkBinding(group);
                        result += subTabs + 'group ' + group.groupId + ', bound:' + hasBinding + '\n';
                        _.forEach(group.children, function (subControlId) {
                            exploreFn(pageMd, subControlId, subSubTabs);
                        });
                    });
                }
                else {
                    if (alreadyExploredId) {
                        result += '\n==> Circularity!';
                    }
                    result += '\n';
                }
            };

            _.forEach(_pendingUpdates, function (pageMd) {
                result += 'Page:' + pageMd.name + '\n';
                exploreFn(pageMd, pageMd.rootControlId, '  ');
                result += 'orphans:\n';
                _.forEach(pageMd.controls, function (controlMd) {
                    var control = _.find(treeControls, {
                        controlId: controlMd.controlId
                    });
                    if (!control) {
                        exploreFn(pageMd, controlMd.controlId, '  ');
                    }
                });
            });
            $log.log('Artifacts to save: ', result);
        };

        /**
         * @private
         * @description Serializes all pending updates and previews and sends them to the backend.
         */
        var saveUpdates = function (browserClosed) {
            var payload = new FormData();
            _.forEach(_pendingPreviews, function (content, path) {
                payload.append(path, content);
            });
            var pages = JSON.stringify(_pendingUpdates);
            payload.append('pages', pages);
            payload.append('deleteLock', browserClosed === true);
            _pendingUpdates = {};
            _pendingPreviews = {};

            updateParams();

            var deferred = $q.defer();
            // TODO remove this when we find cleaner solution
            npPrototype.updateCachedPrototypePromise(deferred.promise);

            pageAPI.updatePage(payload).$promise.then(deferred.resolve, deferred.reject);
            return deferred.promise.catch(function (err) {
                _pagesMd = {};
                $log.error('npPageMetadata service: failed to save updates to backend with error: ', err);
                if (err.data && err.data.error && err.data.error.code === npConstants.prototypeLockTimedOut.code) {
                    $timeout(function () {
                        uiError.create({
                            content: err.data.error.message,
                            dismissOnTimeout: false
                        });
                        $state.go(npConstants.prototypeLockTimedOut.state);
                    });
                }
            });
        };

        /**
         * @name flushUpdates
         * @description Send all pending updates to backend. Will resolve immediately if no pending updates exist.
         * @param {Boolean} browserClosed
         * @returns {object} Promise object that resolves when updates are done.
         */
        var flushUpdates = function (browserClosed) {
            $timeout.cancel(flushUpdates.timeoutPromise);
            var response;
            if (!_.isEmpty(_pendingUpdates)) {
                saveStatuses._currentStatus = saveStatuses.SAVE_PENDING;
                response = saveUpdates(browserClosed).then(function updated(res) {
                    saveStatuses._currentStatus = saveStatuses.SAVE_SUCCESSFUL;
                    $log.log('Artifacts saved successfully: ', res);
                    if (res && res.isSmartApp) {
                        npUiCanvasAPI.refreshPageModel();
                    }
                }, function notUpdated() {
                    saveStatuses._currentStatus = saveStatuses.SAVE_FAILED;
                });
            }
            else {
                if (browserClosed) {
                    // FIXME it is not the page metadata service's responsibility to unlock the prototype, this belongs somewhere else
                    npPrototype.unlockPrototype();
                }
                response = $q.when('OK');
            }
            if (browserClosed) {
                // ensure pending requests are flushed
                $rootScope.$apply();
            }
            return response;
        };

        /**
         * @name updatePage
         * @private
         * @description Adds the pageMd to pending updates, resets the save timeout, and triggers the thumbnail generation for the current page.
         * @param {Object} pageMd
         */
        var updatePage = function (pageMd) {
            _pendingUpdates[pageMd.name] = pageMd;
            // saveStatuses._currentStatus = saveStatuses.SAVE_IDLE;
            $timeout.cancel(flushUpdates.timeoutPromise);
            flushUpdates.timeoutPromise = $timeout(flushUpdates, AUTO_SAVE_DELAY);
            updateThumbnail();
        };

        /**
         * @private
         * @description Generates a thumbnail for the currently selected page and adds the thumbnail to preding previews to save it to the backend.
         * Function is debounced by 400ms to optimize performance when there are multiple operations in quick succession.
         * Thumbnail generation is very slow...
         */
        var updateThumbnail = _.debounce(function () {
            $q.all([npPrototype.getPages(true), generatePreview()])
                .then(function (values) {
                    var pages = values[0],
                        currentPage = _.find(pages, {
                            name: getCurrentPageName()
                        }),
                        thumbnail = values[1];
                    if (currentPage) {
                        var thumbnailUrl = currentPage.thumbnailUrl;
                        _pendingPreviews[thumbnailUrl] = thumbnail;
                    }
                });
        }, 400);

        /**
         * @private
         * @description Generates a thumbnail for the currently selected page. Waits a short amout of time before starting the thumbnail
         * generation to give canvas time to finish animations/rendering of certian controls.
         */
        var generatePreview = function () {
            var deferred = $q.defer(),
                quality = 0,
                canvasBody = npUiCanvasAPI.getWindow().document.querySelector('body');
            uiThumbnailGenerator.generateFromHtml(canvasBody, 160, 240, function (thumbnailImageBlob) {
                deferred.resolve(thumbnailImageBlob);
            }, quality);
            return deferred.promise;
        };

        /**
         * @name getPageMetadata
         * @memberof uiComposer:services:npPageMetadata
         * @description Retrieve page metadata for a given page. Will return a cached version if available.
         * @param {string} pageName
         * @returns {Promise} Promise object that will be resolved with the page's metadata.
         */
        var getPageMetadata = function (pageName) {
            if (!_.isUndefined(_pagesMd[pageName])) {
                return _pagesMd[pageName];
            }

            var pageMdPromise = pageAPI.get({
                pageName: pageName
            }).$promise
                .then(function (pageMd) {
                    pageMdHelper.setControlMdPrototype(pageMd.controls, pageMd);
                    cleanPageMd(pageMd);
                    return pageMd;
                })
                .catch(function (err) {
                    $log.error('npPageMetadata service: failed to retrieve page metadata for page: ', pageName, ' with error: ', err);
                    _pagesMd[pageName] = undefined;
                    return $q.reject(err);
                });

            _pagesMd[pageName] = pageMdPromise;
            return pageMdPromise;
        };

        var getAvailableMainEntityIds = function (pageName) {
            if (!_.isUndefined(_availableMainEntityIds[pageName])) {
                return _availableMainEntityIds[pageName];
            }

            var pageMdPromise = pageAPI.getAvailableMainEntities({
                pageName: pageName
            }).$promise
                .catch(function (err) {
                    $log.error('npPageMetadata service: failed to retrieve available main entities for page: ', pageName, ' with error: ', err);
                    _availableMainEntityIds[pageName] = undefined;
                    return $q.reject(err);
                });

            _availableMainEntityIds[pageName] = pageMdPromise;
            return pageMdPromise;
        };

        // ensure the property types are correct
        // TODO this should come from server
        var cleanPageMd = function (pageMd) {
            _.forEach(pageMd.controls, function (controlMd) {
                // clean MongoDB Ids
                delete controlMd._id;
                _.forEach(controlMd.properties, checkPropertyType);
                _.forEach(controlMd.designProperties, checkPropertyType);
                _.forEach(controlMd.floorplanProperties, checkPropertyType);
            });
        };
        var checkPropertyType = function (propertyMd) {
            if (_.contains(['int', 'float', 'boolean'], propertyMd.type)) {
                try {
                    var parsedValue = JSON.parse(propertyMd.value);
                    propertyMd.value = parsedValue;
                }
                catch (err) {
                    $log.info('tried to parse', propertyMd);
                }
            }
        };

        /*******************/
        /* Public API      */
        /*******************/

        /**
         * @name addControl
         * @memberof uiComposer:services:npPageMetadata
         * @description Add new controls to current page.
         *
         * @param {ControlDefinition|ControlDefinition[]} newCtrlDefs Control definition object or array of control definition objects.
         *
         * @param {object} [options] Hash with following options:
         * - targetPage {string} If a page name is provided will add controls to specified page. Defaults to currently selected page.
         * - combineWithPreviousOperation {boolean} If true will combine operation with previous one. Undo would undo both this one and previous one at once. Default false.
         * - selectAddedControls {boolean} If true will select all added controls after adding them to the canvas. Default true.
         *
         * @returns {Promise} Promise that is resolved once all controls have been added.
         */
        var addControl = function (newCtrlDefs, options) {
            newCtrlDefs = _.makeArray(newCtrlDefs);
            options = options || {};

            var currentPage = getCurrentPageName(),
                targetPage = options.targetPage || currentPage;

            return $q.all([getPageMetadata(targetPage), npPrototype.getCatalogId()])
                .then(function (values) {
                    var pageMd = values[0],
                        catalogId = values[1];

                    var controlAdditions = _.map(newCtrlDefs, function (controlDef) {
                        if (_.isEmpty(controlDef.catalogId)) {
                            $log.warn('controlDef without catalogId! ' + controlDef);
                            controlDef.catalogId = catalogId;
                        }
                        return addControlService.getControlMdObjects(controlDef, pageMd);
                    });

                    return commandManager.execute({
                        preaction: setCurrentPageName.bind(this, targetPage),
                        execute: addControlService.performAdditions.bind(this, controlAdditions, pageMd, _.pick(options, ['selectAddedControls'])),
                        unexecute: deleteControlService.performDeletions.bind(this, controlAdditions, pageMd),
                        postaction: updatePage.bind(this, pageMd)
                    }, options.combineWithPreviousOperation);
                })
                .catch(function (err) {
                    $log.error('npPageMetadata service: addControl failed with error: ', err);
                    return $q.reject(err);
                });
        };

        /**
         * @name addControlByCloning
         * @memberof uiComposer:services:npPageMetadata
         * @description Add new controls to current page by cloning.
         *
         * @param {CloneControlDefinition|CloneControlDefinition[]} Array of control definitions.
         * @param {string} sourcePage PageName from which copy if triggered
         * @param {string} targetPage PageName where should be clone into
         * @returns {Promise} Promise that is resolved once all controls have been added.
         */
        var addControlByCloning = function (controlDefs, targetPage) {
            controlDefs = _.makeArray(controlDefs);
            targetPage = targetPage || getCurrentPageName();
            return getPageMetadata(targetPage)
                .then(function (targetPageMd) {
                    var controlAdditions = npPageMetadataCloneControl.cloneControls(controlDefs, targetPageMd);
                    return commandManager.execute({
                        execute: addControlService.performAdditions.bind(this, controlAdditions, targetPageMd, false),
                        unexecute: deleteControlService.performDeletions.bind(this, controlAdditions, targetPageMd, false),
                        postaction: updatePage.bind(this, targetPageMd)
                    });

                })
                .catch(function (err) {
                    $log.error('npPageMetadata service: addControlByCloning failed with error: ', err);
                    return $q.reject(err);
                });
        };

        /**
         * @name deleteControl
         * @memberof uiComposer:services:npPageMetadata
         * @description Remove controls from current page.
         *
         * @param {string|string[]} controlIds Id or array of Ids of controls that should be deleted.
         * @returns {Promise} Promise that is resolved once all controls have been deleted.
         */
        var deleteControl = function (controlIds) {
            controlIds = _.makeArray(controlIds);

            var currentPage = getCurrentPageName();
            return getPageMetadata(currentPage)
                .then(function (pageMd) {
                    var controlDeletions = _.map(controlIds, function (controlId) {
                        return pageMdHelper.getControlAndChildMd(controlId, pageMd);
                    });

                    return commandManager.execute({
                        preaction: setCurrentPageName.bind(this, currentPage),
                        execute: deleteControlService.performDeletions.bind(this, controlDeletions, pageMd),
                        unexecute: addControlService.performAdditions.bind(this, controlDeletions, pageMd),
                        postaction: updatePage.bind(this, pageMd)
                    });
                })
                .catch(function (err) {
                    $log.error('npPageMetadata service: deleteControl failed with error: ', err);
                    return $q.reject(err);
                });
        };

        /**
         * @name moveControl
         * @memberof uiComposer:services:npPageMetadata
         * @description Move controls to new positions/parents.
         *
         * @param {ControlDefinition|ControlDefinition[]} ctrlDefs Control definition object or array of control definition objects.
         * @param {object} [options] Hash with following options:
         * - targetPage {string} If a page name is provided will move controls to specified page. Defaults to currently selected page.
         * - combineWithPreviousOperation {boolean} If true will combine operation with previous one. Undo would undo both this one and previous one at once. Default false.
         * @returns {Promise} Promise that is resolved once all controls have been moved.
         */
        var moveControl = function (ctrlDefs, options) {
            ctrlDefs = _.makeArray(ctrlDefs);
            options = options || {};

            var currentPage = getCurrentPageName(),
                targetPage = options.targetPage || currentPage;

            return getPageMetadata(targetPage)
                .then(function (pageMd) {
                    var moveBackControlDefs = _.map(ctrlDefs, function (ctrlDef) {
                        var controlMd = pageMdHelper.getControlMd(ctrlDef.controlId, pageMd);
                        return {
                            controlId: controlMd.controlId,
                            parentId: controlMd.parentControlId,
                            groupId: controlMd.parentGroupId,
                            index: controlMd.parentGroupIndex,
                            x: _.chain(controlMd.floorplanProperties).find({
                                name: 'left'
                            }).result('value').value(),
                            y: _.chain(controlMd.floorplanProperties).find({
                                name: 'top'
                            }).result('value').value()
                        };
                    });

                    return commandManager.execute({
                        preaction: setCurrentPageName.bind(this, targetPage),
                        execute: moveControlService.performMoves.bind(this, ctrlDefs, pageMd),
                        unexecute: moveControlService.performMoves.bind(this, moveBackControlDefs, pageMd),
                        postaction: updatePage.bind(this, pageMd)
                    }, options.combineWithPreviousOperation);
                });
        };

        /**
         * @param {PropertyDefinition|PropertyDefinition[]} propertyDefs
         */
        var changeProperty = function (propertyDefs, options) {
            propertyDefs = _.makeArray(propertyDefs);
            options = options || {};
            var currentPage = getCurrentPageName();
            return getPageMetadata(currentPage)
                .then(function (pageMd) {
                    var propertyChanges = [],
                        reversedPropertyChanges = [];

                    _.forEach(propertyDefs, function (propertyDef) {
                        var controlMd = pageMdHelper.getControlMd(propertyDef.controlId, pageMd),
                            oldPropertyValues = _.map(propertyDef.properties, function (property) {
                                var controlMdProperty = pageMdHelper.getControlProperty(property.name, controlMd) || {};
                                return _.extend({}, property, {
                                    value: controlMdProperty.value,
                                    binding: controlMdProperty.binding
                                });
                            });
                        propertyChanges.push({
                            properties: propertyDef.properties,
                            propertyType: propertyDef.propertyType || 'properties',
                            controlMd: controlMd
                        });
                        reversedPropertyChanges.push({
                            properties: oldPropertyValues,
                            propertyType: propertyDef.propertyType || 'properties',
                            controlMd: controlMd
                        });
                    });

                    return commandManager.execute({
                        preaction: setCurrentPageName.bind(this, currentPage),
                        execute: changePropertyService.performPropertyChanges.bind(this, propertyChanges, pageMd),
                        unexecute: changePropertyService.performPropertyChanges.bind(this, reversedPropertyChanges, pageMd),
                        postaction: updatePage.bind(this, pageMd)
                    }, options.combineWithPreviousOperation);
                })
                .catch(function (err) {
                    $log.error('npPageMetadata service: changeProperty failed with error: ', err);
                    return $q.reject(err);
                });
        };

        /**
         * @name changeMainEntity
         * @memberof uiComposer:services:npPageMetadata
         * @description change the main entity of a page.
         *
         * @param {string} mainEntityId new main entity id.
         * @param {object} [options] Hash with following options:
         * - combineWithPreviousOperation {boolean} If true will combine operation with previous one. Undo would undo both this one and previous one at once. Default false.
         * @returns {Promise} Promise that is resolved once the main entity has been changed and the page has been rendered.
         */
        var changeMainEntity = function (mainEntityId, options) {
            options = options || {};
            var currentPage = getCurrentPageName();
            return getPageMetadata(currentPage)
                .then(function (pageMd) {
                    var previousMainEntity = pageMd.mainEntity;

                    return commandManager.execute({
                        preaction: setCurrentPageName.bind(this, currentPage),
                        execute: mainEntityService.performChangeMainEntity.bind(this, mainEntityId),
                        unexecute: mainEntityService.performChangeMainEntity.bind(this, previousMainEntity),
                        postaction: updatePage.bind(this, pageMd, true)
                    }, options.combineWithPreviousOperation);
                })
                .catch(function (err) {
                    $log.error('npPageMetadata service: changeMainEntity failed with error: ', err);
                    return $q.reject(err);
                });
        };

        var getMainEntity = function () {
            var currentPage = getCurrentPageName();
            if (!currentPage) {
                return $q.when();
            }
            else {
                return getPageMetadata(currentPage)
                    .then(function (pageMd) {
                        return pageMd.mainEntity;
                    })
                    .catch(function (err) {
                        $log.error('npPageMetadata service: getMainEntity failed with error: ', err);
                    });
            }
        };

        /**
         * @name bindControlGroup
         * @memberof uiComposer:services:npPageMetadata
         * @description Bind the control's group to a data path using a template.
         *
         * @param {GroupBindingDefinition|GroupBindingDefinition[]} binding definitions or array of binding definitions that should be bound.
         * @returns {Promise} Promise that is resolved once all control groups have been bound.
         */
        var changeBinding = function (bindingDefs) {
            bindingDefs = _.makeArray(bindingDefs);
            var currentPage = getCurrentPageName();

            return getPageMetadata(currentPage)
                .then(function (pageMd) {
                    // will set the children for undo
                    var undoDefs = _.map(bindingDefs, function (bindingDef) {
                        // store old values
                        var controlMd = pageMdHelper.getControlMd(bindingDef.controlId, pageMd);
                        var groupMd = _.find(controlMd.groups, {
                                    groupId: bindingDef.groupId
                                }) || {},
                            children = pageMdHelper.getControlsAndChildMd(groupMd.children, pageMd);
                        if (_.isEmpty(bindingDef.template)) {
                            bindingDef.children = children;
                        }
                        else {
                            bindingDef.template.parentId = bindingDef.controlId;
                            bindingDef.template.groupId = bindingDef.groupId;
                            bindingDef.children = addControlService.getControlMdObjects(bindingDef.template, pageMd);
                            delete bindingDef.template;
                        }
                        return {
                            controlId: bindingDef.controlId,
                            groupId: bindingDef.groupId,
                            binding: groupMd.binding,
                            children: children
                        };
                    });

                    // TODO use only performBindings
                    return commandManager.execute({
                        preaction: setCurrentPageName.bind(this, currentPage),
                        execute: bindControlService.performChangeBindings.bind(this, bindingDefs, pageMd),
                        unexecute: bindControlService.performChangeBindings.bind(this, undoDefs, pageMd),
                        postaction: updatePage.bind(this, pageMd)
                    });
                })
                .catch(function (err) {
                    $log.error('npPageMetadata service: addControl failed with error: ', err);
                    return $q.reject(err);
                });
        };
        /**
         * @name changeEvents
         * @memberof uiComposer:services:npPageMetadata
         * @description Add action to a control.
         * @param {EventDefinition} eventDef definition object or array of action definition objects.
         * @returns {Promise} Promise that is resolved once all actions have been added.
         */
        var changeEvents = function (eventDef) {
            var currentPage = getCurrentPageName();
            return getPageMetadata(currentPage)
                .then(function (pageMd) {
                    var controlMd = pageMdHelper.getControlMd(eventDef.controlId, pageMd),
                        newActionMd = changeEventService.getEventMdObject(eventDef),
                        oldActionMd = pageMdHelper.getEventMd(eventDef.eventId, controlMd) || {
                                eventId: eventDef.eventId
                            };
                    return commandManager.execute({
                        preaction: setCurrentPageName.bind(this, currentPage),
                        execute: changeEventService.changeEvents.bind(this, newActionMd, controlMd),
                        unexecute: changeEventService.changeEvents.bind(this, oldActionMd, controlMd),
                        postaction: updatePage.bind(this, pageMd)
                    });
                });
        };

        var _currentPageName; // currently selected page in canvas

        var updateUrl = function (pageName) {
            var pathname = $window.location.pathname;
            if (pathname.indexOf('ui-composer') !== -1) {
                var basePath = pathname.slice(0, pathname.indexOf('ui-composer') + _.size('ui-composer'));
                $location.skipReload().path(basePath + '/' + pageName).replace();
                $state.params.currentScreen = pageName;
            }
        };

        /**
         * @name setCurrentPageName
         * @memberof uiComposer:services:npPageMetadata
         * @description Sets the current prototype page in canvas and updates the URL.
         *
         * @param {string} pageName
         * @returns {Promise} Promise that is resolved once navigation is done.
         */
        var setCurrentPageName = function (pageName) {
            if (pageName === _currentPageName && _pagesMd[pageName]) {
                return $q.when(_pagesMd[pageName]);
            }
            delete _availableMainEntityIds[pageName];

            _currentPageName = pageName;
            updateUrl(pageName);
            pageMdEvents.broadcast(pageMdEvents.events.pageChanged, pageName);
            return getPageMetadata(pageName)
                .then(function (pageMd) {
                    npLayoutHelper.setCurrentLayout(pageMd.floorplan);
                    return pageMd;
                });
        };

        /**
         * @name getCurrentPageName
         * @memberof uiComposer:services:npPageMetadata
         *
         * @returns {string} Current page's name.
         */
        var getCurrentPageName = function () {
            return _currentPageName;
        };

        $rootScope.$on('$stateChangeSuccess', function (event, toState) {
            if (toState.name !== 'ui-composer') {
                _currentPageName = undefined;
            }
        });

        var invalidatePages = function (pageNames) {
            _.forEach(pageNames, function (pageName) {
                _pagesMd[pageName] = undefined;
                delete _pagesMd[pageName];
            });
        };

        var invalidateAllPages = function () {
            _pagesMd = {};
        };

        var handleWindowClose = function () {
            flushUpdates(true);
        };

        return {
            saveStatuses: saveStatuses,
            getSaveStatus: getSaveStatus,
            flushUpdates: flushUpdates,
            addControl: addControl,
            addControlByCloning: addControlByCloning,
            deleteControl: deleteControl,
            moveControl: moveControl,
            changeProperty: changeProperty,
            changeBinding: changeBinding,
            getPageMetadata: getPageMetadata,
            setCurrentPageName: setCurrentPageName,
            getCurrentPageName: getCurrentPageName,
            invalidatePages: invalidatePages,
            invalidateAllPages: invalidateAllPages,
            changeEvents: changeEvents,
            changeMainEntity: changeMainEntity,
            getMainEntity: getMainEntity,
            getAvailableMainEntityIds: getAvailableMainEntityIds,
            handleWindowClose: handleWindowClose
        };
    }
];

module.exports = npPageMetadata;

'use strict';
var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var constants = require('./../../../constants');
var localConfig = require('./../../../localconfig');
var Promise = require('norman-promise');
var serviceLogger = commonServer.logging.createLogger('norman-ui-composer-server:pagemetadata.service');
var pageMetadataModel = require('./model');
var appMetadataModel = require('./../appMetadata/model');
var AppMetadataModel;
var PageMetadataModel;
var NormanError = commonServer.NormanError;
var tp = commonServer.tp,
    _ = tp.lodash;

function pageMetadataService() {

}
module.exports = pageMetadataService;

pageMetadataService.prototype.initialize = function (done) {
    var model = pageMetadataModel.create();
    PageMetadataModel = model.pageMetadata;
    var modelofAppMetadata = appMetadataModel.create();
    AppMetadataModel = modelofAppMetadata.appMetadata;
    if (PageMetadataModel && AppMetadataModel) {
        serviceLogger.info({}, '>> pageMetadataService.initialize()');
    }
    done();
};

pageMetadataService.prototype.checkSchema = function (done) {
    pageMetadataModel.createIndexes(done);
};

pageMetadataService.prototype.onInitialized = function (done) {
    serviceLogger.info('pageMetadataService>>onInitialized>>');
//    var swRegistry = registry.getModule('SwRegistryService');
//    swRegistry.registerModule('pageMetadataService');
    done();
    // pageMetadataModel.destroy(done);
};

/**
 * Shutdown service
 * @param done
 */
pageMetadataService.prototype.shutdown = function (done) {
    pageMetadataModel.destroy(done);
    appMetadataModel.destroy(done);
};


/**
 * creates Page(s) for a prototype and updates AppMetaData with new Pages
 * @param projectId
 * @param numPages
 * @param createdBy
 * @param applicationType
 * @returns promise:response
 */

pageMetadataService.prototype.createPage = function (projectId, req, createdBy) {

    /***************************************************************************
     * 1.getAppMetadata to find out existing pages count for the give projectId
     * 2.create PageMetadata(s) depending on number of pages2
     * 3.update AppMetadata with the new page(s)
     * 4.call sharedworkspace to save!
     ***************************************************************************/

    var deferred = Promise.defer();
    var swProcessing = registry.getModule('SwProcessing');
    swProcessing.processMetadata(projectId, 'createPage', req, createdBy)
        .then(function (result) {
            var metadataArray = result.metadataArray;
            var appMetadata = _.filter(metadataArray, {type: 'appMetadata'})[0].model;
            deferred.resolve(appMetadata);
        }).catch(function (error) {
            serviceLogger.error({params: error}, '>> createPage -> processMetadata failed');
            deferred.reject(error);
        });


    return deferred.promise;
};

/**
 * creates the App and Page(s) for a prototype
 * @param projectId
 * @param numPages
 * @param applicationType
 * @returns promise:response
 */
// TODO move to appMetadata
pageMetadataService.prototype.createApp = function (projectId, numPages, applicationType) {
    var deferred = Promise.defer();
    pageMetadataService.prototype.createPages(projectId, numPages, true, applicationType)
        .then(deferred.resolve)
        .catch(function (error) {
            serviceLogger.error({params: error}, '>> pageMetadataService.createPageWithoutAppMetadataUpdate()');
            deferred.reject(error);
        });
    return deferred.promise;
};


/**
 *
 * @param projectId
 * @param numPages
 * @param trueToCreate
 * @returns array of PageMetadataModelObjects suitable for sharedworkspace
 */

pageMetadataService.prototype.createPages = function (projectId, numPages, trueToCreate, applicationType, pageType) {
    /***************************************************************************
     * 1.getAppMetadata to find out existing pages for the give projectId
     * 2.figure out the name of the name (eg: S0, S1...)
     * 3.create PageMetadata(s) depending on number of pages
     ***************************************************************************/

    var deferred = Promise.defer();
    var defaultEmptyThumbnail = {};
    getAppMetadata(projectId)
        .then(function (appMetadata) {
            // numPages is null if data driven case
            if (!applicationType || applicationType === 'App') {
                // add pages as normal
                return processNewPages(numPages, appMetadata, pageType);
            }
            // data driven
            defaultEmptyThumbnail = decodeBase64Image('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABQAAAAQAAQMAAACEXWYAAAAAA1BMVEX///+nxBvIAAAAtElEQVQYGe3BAQEAAACAkP6v7ggKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGIQeAAHYiJ6XAAAAAElFTkSuQmCC');
            return processDataDriven(appMetadata, projectId);
        })
        .then(function (response) {
            var operations = [];
            var thumbnails = {};

            pushAppMetadataToArray(response.appMetadata, (trueToCreate) ? constants.operationCreate : constants.operationUpdate, operations);


            _.forEach(response.pagesMetadata, function (pageMetadata) {
                var fpName = pageMetadata.floorplan;
                var fp = response.catalog ? response.catalog.floorPlans[fpName] : {};
                var thumbnailUrl = localConfig.thumbnailBaseUrl + pageMetadata.name + '.png';
                var imageBuffer = fp.thumbnail ? decodeBase64Image(fp.thumbnail) : defaultEmptyThumbnail;
                var operation = {};
                operation = {
                    model: pageMetadata,
                    type: constants.pageMetadata,
                    OP: constants.operationCreate,
                    thumbnailData: imageBuffer.data,
                    thumbnailType: imageBuffer.type,
                    thumbnailPath: thumbnailUrl
                };
                // save operation to add the page
                operations.push(operation);

                // get the thumbnail buffer
                thumbnails[thumbnailUrl] = {
                    buffer: imageBuffer.data
                };
            });

            return {
                operations: operations,
                thumbnails: thumbnails,
                appMetadata: response.appMetadata,
                pagesMetadata: response.pagesMetadata
            };
        })
        .then(deferred.resolve)
        .catch(function (err) {
            serviceLogger.error('createPages -> getAppMetadata failed', err);
            deferred.reject(err);
        });
    return deferred.promise;
};

/**
 * Creates Data Driven pages
 * @param appMetadata
 * @param projectId
 * @returns {*}
 */
function processDataDriven(appMetadata, projectId) {
    var deferred = Promise.defer();

    // check if a generated application exists
    var pageFlowService = registry.getModule('PageFlow');
    pageFlowService.getPageFlow(projectId).then(function (pageFlow) {
        // we are using a generated template and numPages is null
        if (pageFlow != null) {
            var pageMetadataArray = [];

            // set applicationType
            appMetadata.appType = pageFlow.applicationTemplate;

            // store the page ids to handle the page navigation,
            // map between new page id from old generated page id
            var idMap = [];

            // create the page metadata from the pages of the generated application
            _.forEach(pageFlow.pages, function (page, i) {
                var pageMetadata = new PageMetadataModel();
                var pageModel = page.model;
                pageMetadata._id = commonServer.utils.shardkey();
                // use the page template as the floorplan, i.e. Master, Detail, ObjectPage
                pageMetadata.floorplan = page.template;
                pageMetadata.name = localConfig.pageName + i;
                // use the page name as the display name
                pageMetadata.rootControlId = pageModel.rootControlId;
                pageMetadata.controls = pageModel.controls;
                _.forEach(pageMetadata.controls, function (control) {
                    control.catalogId = appMetadata.catalogId;
                });
                pageMetadata.mainEntity = pageModel.mainEntity;
                var pageUrl = localConfig.indexPageName + '#' + pageMetadata.name;
                var thumbnailUrl = localConfig.thumbnailBaseUrl + pageMetadata.name + '.png';
                var pageDisplayName = page.displayName;
                idMap[pageFlow.pages[i].id] = pageMetadata._id;
                pageMetadataArray.push(pageMetadata);

                // update appMetadata
                appMetadata.pages.push({
                    name: pageMetadata.name,
                    displayName: pageDisplayName,
                    pageUrl: pageUrl,
                    thumbnailUrl: thumbnailUrl,
                    id: pageMetadata._id
                });
            });

            // create navigation links between pages
            for (var n = 0; n < pageFlow.navigation.length; n++) {
                var pageNavigation = pageFlow.navigation[n];
                appMetadata.navigations.push({
                    routeName: pageNavigation.routeName,
                    sourcePageId: idMap[pageNavigation.pageSource].toString(),
                    targetPageId: idMap[pageNavigation.pageTarget].toString(),
                    target: 'detailPages'
                });
            }

            // return generated pages
            deferred.resolve({
                appMetadata: appMetadata,
                pagesMetadata: pageMetadataArray,
                catalog: null
            });
        }
        else {
            // return same information
            deferred.resolve({
                appMetadata: appMetadata,
                pagesMetadata: appMetadata.pages,
                catalog: null
            });
        }
    });

    return deferred.promise;
}

function getAppMetadata(projectId) {
    var deferred = Promise.defer();
    var prototypeService = registry.getModule('PrototypeService');
    prototypeService.getMetadata(projectId, [constants.appMetadata]).then(function (response) {
        serviceLogger.info('>> resolving getMetadata in getAppMetadata');
        return deferred.resolve(response.appMetadata);
    }, function (error) {
        if (error.code === 'SWE001') {
            // no prototype exists for this project - unable to find any metadata
            serviceLogger.info('no prototype exists for this project, unable to find any metadata');
            deferred.resolve();
        }
        else {
            serviceLogger.error({params: error}, '>> pageMetadataService.getAppMetadata()');
            deferred.reject(error);
        }
    }).catch(function (err) {
        serviceLogger.error('error getting metadata', err);
        deferred.reject(err);
    });
    return deferred.promise;
}


function getUICatalog(catalogInfo) {
    var UICatalogService = registry.getModule('UICatalog');
    var deferred = Promise.defer();
    var resp = {};
    UICatalogService.getCatalogById(catalogInfo.catalogId).then(function (catalog) {
        resp.catalogId = catalogInfo.catalogId;
        resp.catalog = catalog;
        deferred.resolve(resp);
    }, function (error) {
        serviceLogger.error({params: error}, '>> fetch of pageMetadata.getUICatalog() failed. ');
        deferred.reject(error);
    });
    return deferred.promise;
}

/**
 *  gets the default catalogInformation using catalogService
 *
 * */
function getDefaultCatalogInfo(catalogName) {
    var catalogService = registry.getModule('UICatalog');
    var deferred = Promise.defer();
    var filter = constants.defaultCatalogFilter;
    if (catalogName !== null) {
        filter = constants.noCatalogFilter;
    }
    catalogService.getCatalogs(filter).then(function (catalogInfo) {
        if (catalogName !== null) {
            var foundCatalog = _.find(catalogInfo, function (catalogData) {
                return catalogData.catalogName === catalogName;
            });
            deferred.resolve(foundCatalog);
        }
        else {
            deferred.resolve(catalogInfo[0]);
        }
    }, function (error) {
        serviceLogger.error({
            params: error
        }, '>> fetch of pageMetadata.getDefaultCatalogInfo() failed. ');
        deferred.reject(error);
    });
    return deferred.promise;
}

/**
 *  adds the pages to the appMetadata and creates the pageMetadata
 *
 * */
function processNewPages(numPages, appMetadata, pageType) {
    var deferred = Promise.defer();

    var floorplans = [];
    if (_.isEmpty(pageType)) {
        pageType = {
            catalogName: null,
            floorplan: 'ABSOLUTE',
            isSmart: false
        };
    }
    var isSmart = pageType.isSmart;
    var catalogName = pageType.catalogName;
    if (typeof numPages === 'number') {
        for (var i = 0, l = numPages; i < l; i++) {
            floorplans.push(pageType.floorplan);
        }
    }

    if (_.isEmpty(appMetadata)) {
        appMetadata = {pages: [], isSmartApp: false};
    }
    else {
        appMetadata.isSmartApp = isSmart;
    }


    var counter = getPageCount(appMetadata);
    /**
     * [1] fetch the default catalog header info from CatalogService
     * [2] using the catalog header info, get catalog from CatalogService
     * [3] with catalog - fetch page level default information and build the pages
     * [4] construct data structure of PageMetadata and AppMetadata filling up default values
     */

    var response = {};
    response.appMetadata = appMetadata;

    var catalog;
    getDefaultCatalogInfo(catalogName)
        .then(getUICatalog)
        // check validity of floorplans
        .then(function (uiCatalog) {
            var wrongFloorplan = _.find(floorplans, function (fpName) {
                return !(fpName in uiCatalog.catalog.floorPlans);
            });
            if (wrongFloorplan) {
                return new NormanError('Unable to fetch FloorPlan ' + wrongFloorplan + ' from UI Catalog');
            }
            return uiCatalog;
        })
        // get pages metadata
        .then(function (uiCatalog) {
            catalog = uiCatalog.catalog;
            appMetadata.catalogId = uiCatalog.catalogId;
            return _.map(floorplans, function (fpName, fpIndex) {
                var pageCount = fpIndex + counter,
                    pageName = localConfig.pageName + pageCount;

                var pageMetadata = new PageMetadataModel();
                pageMetadata._id = commonServer.utils.shardkey();
                pageMetadata.name = pageName;

                setFloorplanForPage(pageMetadata, uiCatalog.catalog, fpName);

                return pageMetadata;
            });
        })
        .then(function (pagesMetadata) {
            _.forEach(pagesMetadata, function (pageMetadata, mdIndex) {
                var routePattern = localConfig.pageRoutePattern + (mdIndex + counter),
                    pageUrl = localConfig.indexPageName + '#' + routePattern,
                    thumbnailUrl = localConfig.thumbnailBaseUrl + pageMetadata.name + '.png',
                    pageDisplayName = localConfig.displayPageName + ' ' + (mdIndex + counter + 1);
                var appPage = {
                    name: pageMetadata.name,
                    displayName: pageDisplayName,
                    routePattern: routePattern,
                    pageUrl: pageUrl,
                    thumbnailUrl: thumbnailUrl,
                    id: pageMetadata._id
                };
                appMetadata.pages.push(appPage);
            });
            return {
                appMetadata: appMetadata,
                pagesMetadata: pagesMetadata,
                catalog: catalog
            };
        })
        .then(deferred.resolve)
        .catch(function (error) {
            serviceLogger.error({params: error}, '>> pageMetadata.processNewPages()');
            deferred.reject(error);
        });
    return deferred.promise;
}

function setFloorplanForPage(pageMetadata, catalog, floorplanName) {
    var floorplan = catalog.floorPlans[floorplanName];
    var fpControl = catalog.controls[floorplan.rootControl];

    pageMetadata.floorplan = floorplanName;
    if (fpControl) {
        pageMetadata.controls = [];
        var rootControl = createControlFromCatalogMetadata(fpControl, null, catalog, pageMetadata, 0);
        pageMetadata.rootControlId = rootControl.controlId;
    }
    else {
        pageMetadata.isCollection = floorplan.isCollection;
        pageMetadata.controls = floorplan.controls.controls;
        _.each(pageMetadata.controls, function (control) {
            control.catalogId = catalog.catalogId;
        });
        pageMetadata.rootControlId = floorplan.controls.rootControlId;
    }
}

function createControlFromCatalogMetadata(controlMd, parentId, catalog, pageMetadata) {
    var controlId = controlMd.name + '_' + pageMetadata.controls.length;
    var control = {
        controlId: controlId,
        parentControlId: parentId,
        catalogControlName: controlMd.name,
        catalogId: catalog.catalogId
    };
    // push it immediately, so children will be added after
    pageMetadata.controls.push(control);
    control = pageMetadata.controls[pageMetadata.controls.length - 1];

    var additionalMd = controlMd.additionalMetadata;

    // properties
    control.properties = _.map(additionalMd.properties, function (property) {
        // TODO handle binding
        return {
            name: property.name,
            value: property.defaultValue,
            type: property.type
        };
    });
    // children
    control.groups = _.map(additionalMd.aggregations, function (aggregation, aggrName) {
        var childrenIds = _.map(aggregation.defaultValue, function (aggregationChild) {
            var childMd = catalog.controls[aggregationChild.name];
            var propertiesToOverride = aggregationChild.properties;
            if (!_.isEmpty(propertiesToOverride)) {
                // need to clone otherwise we override its keys
                childMd = _.cloneDeep(childMd);
                // override the default values in additionalMetadata for properties
                var properties = childMd.additionalMetadata.properties || {};
                _.forEach(propertiesToOverride, function (overrideValue, name) {
                    var property = properties[name] || {name: name};
                    property.defaultValue = overrideValue;
                    properties[name] = property;
                });
                childMd.additionalMetadata.properties = properties;
            }
            var child = createControlFromCatalogMetadata(childMd, controlId, catalog, pageMetadata);
            return child.controlId;
        });
        // TODO handle binding
        return {
            groupId: aggrName,
            children: childrenIds
        };
    });
    // TODO events/actions?
    return control;
}

/**
 *
 * update a page: with bunch of updates
 *
 * @param projectId
 * @param updates
 * @param createdBy
 * @returns promise:response
 */
pageMetadataService.prototype.updatePage = function (projectId, req, createdBy) {
    var deferred = Promise.defer();
    var swProcessing = registry.getModule('SwProcessing');
    swProcessing.processMetadata(projectId, constants.operationUpdatePage, req, createdBy).
        then(function (result) {
            var appMetadata = _.filter(result.metadataArray, {type: 'appMetadata'})[0].model;
            deferred.resolve(appMetadata);
        })
        .catch(function (error) {
            serviceLogger.error({params: error}, '>> prototypeBuilderService.generatePrototypePage() failed.');
            deferred.reject(error);
        });

    return deferred.promise;

};

pageMetadataService.prototype.processUpdatePage = function (projectId, pages, createdBy, files) {
    var metadataObjs = [],
        pageObjs = {},
        appMetadata, dataModel;

    serviceLogger.info({params: projectId}, '>> pageMetadataService.processUpdatePage()');

    // TODO separate update of pages from update of files
    return getAppMetadata(projectId)
        .then(function (appMeta) {

            appMetadata = appMeta;
            return appMetadata.isSmartApp ? getDataModel(projectId) : null;
        })
        .then(function (model) {

            dataModel = model;
            var pageIds = [];
            _.forEach(appMetadata.pages, function (page) {
                pageIds.push(page.id);
            });
            return getPages(pageIds);
        })
        .then(function (allPagesObjs) {

            var pageNames = Object.keys(pages);
            _.forEach(pageNames, function (name) {
                pageObjs[name] = allPagesObjs[name];
            });

            if (Object.keys(pageObjs).length !== Object.keys(pages).length) {
                serviceLogger.error({}, '>> trying to update page that doesn\'t exist');
                throw new Error('trying to update page that doesn\'t exist');
            }
            // prepare dataStructure for calling sharedWorkspace for PageMetadata
            for (var pageName in pageObjs) {
                var page = pageObjs[pageName];
                // store only the new controls
                page.controls = pages[pageName].controls;
                page.mainEntity = pages[pageName].mainEntity;
                pushPageMetadataToArray(page._id, page, constants.operationUpdate, appMetadata, metadataObjs);
                if (!appMetadata.isSmartApp) {
                    updateNavigationInAppMetatdata(page, appMetadata, page._id);
                }
                else {
                    module.exports.updateNavigationInSmartAppMetadata(page, allPagesObjs, appMetadata, dataModel);
                }
            }
            // prepare dataStructure for calling sharedWorkspace for appMetadata
            pushAppMetadataToArray(appMetadata, constants.operationUpdate, metadataObjs);

            return {
                operations: metadataObjs,
                thumbnails: files,
                appMetadata: appMetadata // TODO: remove unused
            };
        });
};


/**
 *
 * find PageMetadata ByIds
 *
 * @param ids
 * @returns array of pageMetadataObjects as a promise
 */
function getPages(ids) {
    var deferred = Promise.defer();
    PageMetadataModel.find({_id: {$in: ids}}
        , function (err, docs) {
            if (err) {
                deferred.reject(docs);
            }
            else {
                var res = {};
                docs.forEach(function (doc) {
                    res[doc.name] = doc;
                });
                deferred.resolve(res);

            }
        });
    return deferred.promise;
}


function getPageIds(pageNames, appMetadata) {
    var result = _.map(pageNames, function (pageName) {
        var page = findPageByName(pageName, appMetadata);
        return page.id.toString();
    });
    return result;
}


pageMetadataService.prototype.deletePage = function (projectId, req, createdBy) {
    var deferred = Promise.defer();
    var swProcessing = registry.getModule('SwProcessing');

    swProcessing.processMetadata(projectId, constants.operationDeletePage, req, createdBy).then(function (result) {
        var metadataArray = result.metadataArray;
        var appMetadata = _.filter(metadataArray, {type: 'appMetadata'})[0].model;
        deferred.resolve(appMetadata);
    }).catch(function (error) {
        serviceLogger.error({params: error}, '>> pageMetadataService.deletePage() failed.');
        deferred.reject(error);
    });
    return deferred.promise;
};

pageMetadataService.prototype.processDeletePage = function (projectId, pageName) {
    var deferred = Promise.defer();

    var metadataObjs = [];

    getAppMetadata(projectId).then(function (appMetadata) {

        var page = _.find(appMetadata.pages, function (pageMd) {
            return pageMd.name === pageName;
        });

        if (_.isEmpty(page)) {
            deferred.reject(new NormanError('Unable to perform deletePage() as Page does not exists'));
            return;
        }

        pushPageMetadataToArray(page.id, page, constants.operationDelete, appMetadata, metadataObjs);

        updateOtherPages(pageName, appMetadata, metadataObjs)
            .then(function (updatedPages) {
                updateAppMetadata(pageName, appMetadata, updatedPages);
                deferred.resolve({
                    operations: updatedPages,
                    appMetadata: appMetadata // TODO: remove unused
                });
            });
    });

    return deferred.promise;
};


/**
 *
 * @param projectId
 */
pageMetadataService.prototype.deleteAllPages = function (projectId) {
    var deferred = Promise.defer();
    var metadataObjs = [];

    getAppMetadata(projectId).then(function (appMetadata) {

        appMetadata.pages.forEach(function (page) {
            pushPageMetadataToArray(page.id, page, constants.operationDelete, appMetadata, metadataObjs);
        });

        appMetadata.pages = [];
        appMetadata.navigations = [];

        // populate the datastructure for SharedWorkspace API -- pass the OldIDs for update..
        pushAppMetadataToArray(appMetadata, constants.operationUpdate, metadataObjs);
        deferred.resolve(metadataObjs);

    }).catch(function (err) {
        serviceLogger.error('error deleteallpages', err);
        deferred.reject(err);
    });

    return deferred.promise;
};

pageMetadataService.prototype.updateCoordinates = function (projectId, req, createdBy) {
    var deferred = Promise.defer();
    var swProcessing = registry.getModule('SwProcessing');

    swProcessing.processMetadata(projectId, constants.operationUpdateCoordinates, req, createdBy).then(function (result) {
        var metadataArray = result.metadataArray;
        deferred.resolve(metadataArray);
    }).catch(function (error) {
        serviceLogger.error({params: error}, '>> pageMetadataService.updateCoordinates() failed.');
        deferred.reject(error);
    });
    return deferred.promise;
};

pageMetadataService.prototype.processUpdateCoordinates = function (projectId, coordinatesArray) {
    var deferred = Promise.defer();

    var metadataObjs = [];
    getAppMetadata(projectId).then(function (appMetadata) {
        if (!_.isEmpty(appMetadata) && !_.isEmpty(coordinatesArray)) {
            _.each(coordinatesArray, function (coordinates) {
                _.each(appMetadata.pages, function (pages) {
                    if (pages.name === coordinates.name) {
                        pages.coordinates.x = coordinates.x;
                        pages.coordinates.y = coordinates.y;
                    }
                });
            });
        }


        pushAppMetadataToArray(appMetadata, constants.operationUpdate, metadataObjs);
        deferred.resolve({operations: metadataObjs});

    });
    return deferred.promise;
};

/**
 * processUpdateDisplayNames - update the Prototype data of a given Project with new Display Name for the page
 *
 * @param {String}  projectId - projectId of the prototype
 * @param {jsonObject}   displayNames - Array of pages with displayNames to be updated
 * @returns {Object} operations - Operation of metadata Object which has to be updated
 */

pageMetadataService.prototype.updateDisplayNames = function (projectId, displayNames) {
    var deferred = Promise.defer();

    var metadataObjs = [];
    getAppMetadata(projectId).then(function (appMetadata) {
        if (!_.isEmpty(appMetadata) && !_.isEmpty(displayNames)) {
            _.each(displayNames, function (displayName) {
                _.each(appMetadata.pages, function (page) {
                    if (page.name === displayName.pageName) {
                        page.displayName = displayName.displayName;
                    }
                });
            });
        }
        pushAppMetadataToArray(appMetadata, constants.operationUpdate, metadataObjs);
        deferred.resolve({operations: metadataObjs});

    });
    return deferred.promise;
};


pageMetadataService.prototype.getPage = function (projectId, pageName) {
    var deferred = Promise.defer();

    serviceLogger.info({
        params: projectId
    }, '>> pageMetadataService.getPage()');

    getAppMetadata(projectId).then(function (appMetadata) {
        var page = findPageByName(pageName, appMetadata);
        if (_.isEmpty(page)) {
            deferred.reject(new NormanError('Unable to perform getPage() as Page does not exists'));
        }
        else {
            getPages([page.id.toString()]).then(function (pageObjs) {
                var fullPage = pageObjs[pageName];
                deferred.resolve(fullPage);
            }, deferred.reject);
        }
    }, deferred.reject);

    return deferred.promise;

};

function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
}

function findPageByName(name, appMd) {
    return _.find(appMd.pages, function (page) {
        return page.name === name;
    });
}
function findPageById(id, appMd) {
    return _.find(appMd.pages, function (page) {
        return page.id.equals(id);
    });
}

function updateNavigationInAppMetatdata(pageMetadata, appMetadata, oldPageId) {
    // replace old navigation pageid with new pageid
    _.each(appMetadata.navigations, function (navigation) {
        if (navigation.sourcePageId === oldPageId.toString()) {
            navigation.sourcePageId = pageMetadata._id.toString();
        }
        if (navigation.targetPageId === oldPageId.toString()) {
            navigation.targetPageId = pageMetadata._id.toString();
        }
    });

    // Removes all elements from array that predicate returns truthy for and returns an array of the removed elements.
    _.remove(appMetadata.navigations, function (navigation) {
        return navigation.pageFrom === pageMetadata.name;
    });

    pageMetadata.controls.forEach(function (control) {
        control.events.forEach(function (event) {
            if (event.actionId === 'NAVTO') {
                appMetadata.navigations.push({pageFrom: pageMetadata.name, pageTo: event.params[0].value});
            }
        });
    });
}

// Navigation in smart app
// This should be called if main entity of pageMetadata has changed
module.exports.updateNavigationInSmartAppMetadata = function (pageMetadata, allPagesObjs, appMetadata, dataModel) {

    // Removes from appMetadata all navigations where current page is involved
    _.remove(appMetadata.navigations, function (navigation) {
        return navigation.pageFrom === pageMetadata.name || navigation.pageTo === pageMetadata.name;
    });

    // rules to create navigations:
    // - from ListReport to ObjectPage having same main entity
    // - from ListReport to ObjectPage having a binding
    // - from ObjectPage to ObjectPage having a binding
    if (pageMetadata.mainEntity) {
        var entities = _.where(dataModel.entities, {navigationProperties: [{toEntityId: pageMetadata.mainEntity}]});
        var mainEntity = _.find(dataModel.entities, {_id: pageMetadata.mainEntity});
        var map = {};
        var mainEntityPaths = _.transform(mainEntity.navigationProperties, function (result, navPop) {
            map[navPop._id] = navPop;
            result.push({entityId: pageMetadata.mainEntity, propertyId: navPop._id});
        });

        var toEntities = [];
        if (mainEntityPaths.length > 0) {
            toEntities = _.transform(mainEntityPaths, function (result, path) {
                var controls = _.where(pageMetadata.controls, {properties: [{binding: {paths: [path]}}]});
                if (controls.length > 0) {
                    var navigationProperty = map[path.propertyId];
                    result.push(navigationProperty.toEntityId);
                }
            });
        }

        _.forEach(allPagesObjs, function (page) {
            if (page.name !== pageMetadata.name) {
                if ((page.floorplan === 'ListReport') && page.mainEntity === pageMetadata.mainEntity) {
                    appMetadata.navigations.push({pageFrom: page.name, pageTo: pageMetadata.name, target: 'pages'});
                }
                else if ((pageMetadata.floorplan === 'ListReport') && page.mainEntity === pageMetadata.mainEntity) {
                    appMetadata.navigations.push({pageFrom: pageMetadata.name, pageTo: page.name, target: 'pages'});
                }

                else {
                    var entity = _.find(entities, {_id: page.mainEntity});
                    if (entity) {
                        var paths = _.transform(entity.navigationProperties, function (result, navPop) {
                            if (navPop.toEntityId === pageMetadata.mainEntity) {
                                result.push({entityId: page.mainEntity, propertyId: navPop._id});
                            }
                        });
                        var result = _.where(page.controls, {properties: [{binding: {paths: paths}}]});

                        if (result.length > 0) {
                            appMetadata.navigations.push({
                                pageFrom: page.name,
                                pageTo: pageMetadata.name,
                                target: 'pages'
                            });
                        }
                    }

                    if (_.indexOf(toEntities, page.mainEntity) !== -1) {
                        appMetadata.navigations.push({pageFrom: pageMetadata.name, pageTo: page.name, target: 'pages'});
                    }
                }
            }
        });
    }
};

function getDataModel(projectId) {
    var prototypeService = registry.getModule('PrototypeService');
    return prototypeService.getMetadata(projectId, ['dataModelMetadata'])
        .then(function (versions) {
            if (!versions || !versions.dataModelMetadata || versions.dataModelMetadata.length <= 0) {
                throw new NormanError('Impossible to retrieve DataModel Metadata');
            }
            var lastIndex = versions.dataModelMetadata.length - 1;
            return versions.dataModelMetadata[lastIndex].toObject();
        });
}

function updateOtherPages(pageName, appMetadata, metadataObjs) {

    var deferred = Promise.defer();
    var pageNames = [];

    appMetadata.navigations.forEach(function (navigation) {
        if (navigation.pageTo === pageName) {
            pageNames.push(navigation.pageFrom);
        }
    });

    var ids = getPageIds(pageNames, appMetadata);

    getPages(ids).then(function (pageObjs) {

        _.forEach(pageObjs, function (page) {
            // store only the new controls
            page.controls.forEach(function (control) {
                _.remove(control.events, function (event) {
                    return (event.actionId === 'NAVTO' && event.params[0].value === pageName);
                });
            });

            pushPageMetadataToArray(page._id, page, constants.operationUpdate, appMetadata, metadataObjs);
        });
        deferred.resolve(metadataObjs);
    });
    return deferred.promise;
}

function updateAppMetadata(pageName, appMetadata, metadataObjs) {

    _.remove(appMetadata.navigations, function (navigation) {
        return (navigation.pageTo === pageName || navigation.pageFrom === pageName);
    });


    _.remove(appMetadata.pages, function (page) {
        return page.name === pageName;
    });

    pushAppMetadataToArray(appMetadata, constants.operationUpdate, metadataObjs);

}

function pushAppMetadataToArray(appMetadata, operation, metadataObjs) {
    var metadata = {};
    metadata.oldId = appMetadata._id;
    appMetadata._id = commonServer.utils.shardkey();
    metadata.model = new AppMetadataModel(appMetadata);
    metadata.type = constants.appMetadata;
    metadata.OP = operation;
    metadataObjs.push(metadata);
}

function pushPageMetadataToArray(oldid, pageMetadata, operation, appMetadata, metadataObjs) {
    var metadata = {};
    metadata.oldId = oldid;
    pageMetadata._id = commonServer.utils.shardkey();
    metadata.model = new PageMetadataModel(pageMetadata);
    metadata.type = constants.pageMetadata;
    metadata.OP = operation;
    metadataObjs.push(metadata);

    if (operation === constants.operationUpdate) {

        var appMdPage = findPageById(metadata.oldId, appMetadata);
        if (appMdPage) {
            appMdPage.id = pageMetadata._id;
        }
    }
}

function getPageCount(appMetadata) {
    var pageCounterArr = [];

    if (appMetadata.pages.length === 0) {
        return 0;
    }


    appMetadata.pages.forEach(function (page) {
        pageCounterArr.push(_.parseInt(page.name.substr(localConfig.pageName.length)));
    });

    return _.max(pageCounterArr) + 1;
}

// TODO reinitializePrototype
// 1. deleteAllPages - returns metada array
// 2. createPages - return metadat array
// 3. merge the arrays - pagemetadata directly, 2nd appmetadata array: delete pages which 1st pagemetadat array returned
// return the joined array

pageMetadataService.prototype.reinitializePrototype = function (projectId, applicationType) {
    var that = this,
        deferred = Promise.defer(),
        deletePageMetadataArray, createPageMetadataArray;

    that.deleteAllPages(projectId)
        .then(function (deletedPages) {
            deletePageMetadataArray = deletedPages;

            that.createPages(projectId, null, false, applicationType)
                .then(function (model) {
                    createPageMetadataArray = model.operations;

                    // merge metadata arrays
                    var createPageAppMetadata = _.filter(createPageMetadataArray, {type: 'appMetadata'})[0];
                    var createPagePagesMetadata = _.filter(createPageMetadataArray, {type: 'pageMetadata'});

                    // var deletePageAppMetadata = _.filter(deletePageMetadataArray, {'type': 'appMetadata'})[0].model;
                    var deletePagePagesMetadata = _.filter(deletePageMetadataArray, {type: 'pageMetadata'});

                    var finalPageMetadata = createPagePagesMetadata.concat(deletePagePagesMetadata);
                    deletePagePagesMetadata.forEach(function (pageMetadata) {
                        createPageAppMetadata.model.pages.forEach(function (page) {
                            if (page.id.toString() === pageMetadata.oldId.toString()) {
                                var index = createPageAppMetadata.model.pages.indexOf(page);
                                createPageAppMetadata.model.pages.splice(index, 1);
                            }
                        });
                        createPageAppMetadata.model.navigations.forEach(function (nav) {
                            if (nav.sourcePageId === pageMetadata.model._id.toString()) {
                                var index = createPageAppMetadata.model.navigations.indexOf(nav);
                                createPageAppMetadata.model.navigations.splice(index, 1);
                            }
                        });

                    });

                    var finalMetadata = finalPageMetadata.concat(createPageAppMetadata);
                    deferred.resolve({
                        operations: finalMetadata
                    });
                });

        })
        .catch(function (error) {
            serviceLogger.error({
                params: error
            }, '>> pageMetadataService.reinitializePrototype() failed.');
            deferred.reject(error);
        });


    return deferred.promise;
};

function bindingContainsEntity(entityId, bindingMd) {
    return !_.isEmpty(bindingMd) && _.some(bindingMd.paths, {entityId: entityId});
}

function bindingContainsProperty(entityId, propertyId, bindingMd) {
    return !_.isEmpty(bindingMd) && _.some(bindingMd.paths, {entityId: entityId, propertyId: propertyId});
}

function bindingContainsEntitiesOrProperties(entityIds, properties, binding) {
    var contains = false;
    _.forEach(entityIds, function (entityId) {
        if (bindingContainsEntity(entityId, binding)) {
            contains = true;
        }
        return !contains;
    });
    if (!contains) {
        _.forEach(properties, function (property) {
            if (bindingContainsProperty(property.entityId, property.propertyId, binding)) {
                contains = true;
            }
            return !contains;
        });
    }
    return contains;
}

function deleteEntitiesAndPropertiesFromPage(entityIds, properties, pageMd) {
    var didUpdate = false;
    if (_.contains(entityIds, pageMd.mainEntity)) {
        pageMd.mainEntity = undefined;
        didUpdate = true;
    }
    _.forEach(pageMd.controls, function (controlMd) {
        var toBeCleaned = [].concat(controlMd.groups).concat(controlMd.properties);
        _.forEach(toBeCleaned, function (obj) {
            if (bindingContainsEntitiesOrProperties(entityIds, properties, obj.binding)) {
                obj.binding = {};
                obj.binding.paths = [];
                didUpdate = true;
            }
        });
    });
    return didUpdate;
}

/**
 * deleteEntity - entityIds the entityId from the PageMetadata of the prototype
 *
 * @param {String} projectId - projectId of the prototype
 * @param {String[]} entityIds
 * @param {String[]} properties (propertyId and entityId) the properties that are deleted (and their entity)
 * @returns {Object} operations - Operation of metadata Object which has to be updated
 */
pageMetadataService.prototype.deleteEntitiesAndProperties = function (projectId, entityIds, properties) {
    serviceLogger.info('pageMetadataService>>deleteEntitiesAndProperties>>' + projectId);
    var deferred = Promise.defer();
    if (_.isEmpty(projectId)) {
        deferred.reject('must pass projectId!');
    }
    else {
        getAppMetadata(projectId)
            .then(function (appMetadata) {
                var pageNames = _.map(appMetadata.pages, 'name');
                var pageIds = getPageIds(pageNames, appMetadata);
                return getPages(pageIds);
            })
            .then(function (pagesMd) {
                var operations = _.chain(pagesMd)
                    // keep only updated ones
                    .filter(function (pageMd) {
                        return deleteEntitiesAndPropertiesFromPage(entityIds, properties, pageMd);
                    })
                    .map(function (pageMd) {
                        return {
                            model: pageMd,
                            oldId: pageMd.id,
                            type: constants.pageMetadata,
                            OP: constants.operationUpdate
                        };
                    })
                    .value();
                deferred.resolve({
                    files: [],
                    operations: operations
                });
            })
            .catch(deferred.reject);
    }
    return deferred.promise;
};


/**
 * Retrieve the possible main entity for this page.
 * Note: In smart app, ObjectPage cannot have the same main entity as another ObjectPage
 * @param projectId
 * @param pageName
 * @returns {*} mainEntities - An array of possible main entities
 */
pageMetadataService.prototype.getPossibleMainEntities = function (projectId, pageName) {

    serviceLogger.info({params: projectId}, '>> pageMetadataService.getPossibleMainEntities()');
    var entities = [];

    return getDataModel(projectId)
        .then(function (dataModel) {
            if (dataModel && !_.isEmpty(dataModel.entities)) {
                _.forEach(dataModel.entities, function (entity) {
                    entities.push(entity._id);
                });
            }
            return _.isEmpty(entities) ? null : getAppMetadata(projectId);
        })
        .then(function (appMetadata) {
            if (!appMetadata || !appMetadata.isSmartApp) {
                return null;
            }
            else {
                var pageIds = [];
                _.forEach(appMetadata.pages, function (page) {
                    pageIds.push(page.id.toString());
                });
                return getPages(pageIds);
            }
        })
        .then(function (pageObjs) {
            if (pageObjs) {
                var currentPage = pageObjs[pageName];
                //In smart app, ObjectPage cannot have the same main entity as another ObjectPage
                if (currentPage.floorplan === 'ObjectPage') {
                    _.forEach(pageObjs, function (page) {
                        if (page.id !== currentPage.id && page.floorplan === 'ObjectPage' && page.mainEntity) {
                            _.remove(entities, function (e) {
                                return e === page.mainEntity;
                            });
                        }
                    });
                }
            }
            return entities;
        });
};

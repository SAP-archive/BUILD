'use strict';

var _ = require('norman-client-tp').lodash;

/**
 * The npPrototype service handles all prototype related interactions with the backend such as creating and retrieving prototypes,
 * modifying prototypes and creating snapshots.
 * @namespace npPrototype
 */

/**
 * @typedef {object} Snapshot
 * @memberof npPrototype
 * @property {number} projectId
 * @property {number} snapshotVersion
 * @property {string} snapshotDesc
 * @property {string} createdBy
 * @property {date} createdOn
 * @property {string} snapshotUrl
 * @property {DeepLink[]} deepLinks
 */

/**
 * @typedef {object} DeepLink
 * @memberof npPrototype
 * @property {string} pageName
 * @property {string} thumbnail
 * @property {string} pageUrl
 */

var npPrototype = ['$resource', '$q', '$timeout', '$rootScope', '$log', 'ActiveProjectService', '$stateParams', 'uiCommandManager',
    function ($resource, $q, $timeout, $rootScope, $log, ActiveProjectService, $stateParams, uiCommandManager) {
        var self = {},
            baseUrl = '/api/projects/:projectId/prototype/',
            prototypeAPI, snapshotAPI, pageAPI, prototypeLockAPI, pageMapAPI,
            _cachedPrototypePromise,
            _cachedPrototypeValid = false, // wether cached version is valid
            _prototypeViewModeData;

        /**
         * @private
         * @description updates the params of the apis to ensure active prototype id is the correct one
         */
        var updateParams = function () {
            var projectId = ActiveProjectService.id;
            prototypeAPI = $resource(baseUrl, {
                projectId: projectId
            }, {
                updateProto: {
                    method: 'PUT'
                }
            });
            snapshotAPI = $resource(baseUrl + 'snapshot/', {
                projectId: projectId
            });
            pageAPI = $resource(baseUrl + 'page/', {
                projectId: projectId
            });
            prototypeLockAPI = $resource(baseUrl + 'lock', {
                projectId: projectId
            });
            pageMapAPI = $resource(baseUrl + 'page/coordinates', {
                projectId: projectId
            }, {
                save: {
                    method: 'POST',
                    isArray: true
                }
            });
        };

        updateParams();


        $rootScope.$watch(function () {
            return ActiveProjectService.id;
        }, function () {
            updateParams();
            _cachedPrototypeValid = false;
        });

        /**
         * @private
         * @description Thumbnail urls are relative to artifact url. Adding the complete URL to each page makes binding easier.
         */
        var addFullUrls = function (proto) {
            _.forEach(proto.pages, function (page) {
                page.fullPageUrl = '/api/projects/' + ActiveProjectService.id + '/prototype/artifact/' + page.pageUrl;
                page.fullThumbnailUrl = '/api/projects/' + ActiveProjectService.id + '/prototype/artifact/' + page.thumbnailUrl;
                page.incomingNavigations = _.filter(proto.navigations, {pageTo: page.name}).length;
            });
            return $q.when(proto);
        };

        /**
         * @name create
         * @memberof npPrototype
         * @description Create a new prototype.
         * @param {number} projectId Id of project for which prototype should be created. Note that each project only has one prototype associated with it.
         * @returns {object} Promise object that will be extended with the response data when promise is resolved.
         * Response data is the entire prototype in success case. Promise is accessible via the $promise property.
         */
        self.create = function () {
            var payload = {
                numPages: 2
            };
            return prototypeAPI.save(payload).$promise;
        };

        /**
         * @name createApplication
         * @memberof npPrototype
         * @description Create a new prototype.
         * @param {number} projectId Id of project for which prototype should be created. Note that each project only has one prototype associated with it.
         * @param {string} applicationType type of application to be generated.
         * @returns {object} Promise object that will be extended with the response data when promise is resolved.
         * Response data is the entire prototype in success case. Promise is accessible via the $promise property.
         */
        self.createApplication = function (applicationType) {
            $rootScope.$broadcast('npPrototype/recreatingPrototype');
            var payload = {
                applicationType: applicationType
            };

            setPrototypePromise(prototypeAPI.save(payload).$promise);

            return _cachedPrototypePromise;
        };

        /**
         * @name getPrototype
         * @memberof npPrototype
         * @description Retrieve an existing prototype. Will cache the prototype object and resolve the returned promise with the cached version on subsequent calls until cache is invalidated.
         * @returns {object} Promise object that will be extended with the response data when promise is resolved.
         * Response data is the entire prototype in success case. Promise is accessible via the $promise property.
         */
        self.getPrototype = function () {
            if (!_cachedPrototypeValid) {
                setPrototypePromise(prototypeAPI.get().$promise, 'npPrototype: could not get prototype');
            }
            return _cachedPrototypePromise;
        };

        /**
         * @name createPages
         * @memberof npPrototype
         * @description Create pages for a prototype.
         * @param {number} projectId Id of project for which pages should be created.
         * @param {number} [numPages=1] Number of pages that should be created.
         * @returns {object} Promise object that will be extended with the response data when promise is resolved.
         * Response data is an array of prototype's current pages. Promise is accessible via the $promise property.
         */
        self.createPages = function (numPages, pageType) {
            if (typeof numPages !== 'number') {
                numPages = 1;
                $log.warning('createPages: numPages is not a number, defaulting to 1');
            }
            var payload = {floorplans: numPages, pageType: pageType};
            return setPrototypePromise(pageAPI.save(payload).$promise, 'npPrototype: could not create pages');
        };

        /**
         * @name createSnapshot
         * @memberof npPrototype
         * @description Create a snapshot for a prototype.
         * @param {number} projectId Id of project for which snapshot should be created.
         * @returns {object} Promise object that will be extended with the response data when promise is resolved.
         * Response data is a snapshot object. Promise is accessible via the $promise property.
         */
        self.createSnapshot = function (bLatest) {
            var payload = {
                snapshotDesc: ''
            };

            if (bLatest === false) {
                payload.latest = bLatest;
            }
            return snapshotAPI.save(payload).$promise;
        };
        /**
         * @name getSnapshot
         * Response data is a snapshot object. Promise is accessible via the $promise property.
         */
        self.getSnapshot = function () {
            return snapshotAPI.get({version: 'latest'}).$promise;
        };

        /**
         * @name getPages
         * @memberof npPrototype
         * @description Store the currently selected page.
         * @param {boolean} byRef, if to return the prototype reference.
         */
        self.getPages = function (byRef) {
            return self.getPrototype().then(function (proto) {
                return byRef === true ? proto.pages : _.cloneDeep(proto.pages);
            });
        };


        /**
         * @name getPrototypeMainUrl
         * @memberof npPrototype
         * @description returns the index.html url of the current prototype
         */
        self.getPrototypeMainUrl = function () {
            return '/api/projects/' + ActiveProjectService.id + '/prototype/artifact/index.html';
        };

        /**
         * @name getArtifactBaseUrl
         * @memberof npPrototype
         * @description returns the base url of the current prototype
         * @param {string} base url for the artifact
         */
        self.getArtifactBaseUrl = function () {
            return '/api/projects/' + ActiveProjectService.id + '/prototype/artifact/';
        };

        /**
         * @name getAssetUrl
         * @memberof npPrototype
         * @description returns the asset url of the current prototype
         * @param {string} assetId
         */
        self.getAssetUrl = function (assetId) {
            return '/api/projects/' + ActiveProjectService.id + '/document/' + assetId + '/1/render';
        };

        /**
         * @name getCatalogId
         * @memberof npPrototype
         * @description returns the catalog id of the prototype
         * @returns {object} promise returning catalogId
         */
        self.getCatalogId = function () {
            return self.getPrototype().then(function (proto) {
                return proto.catalogId;
            });
        };

        /**
         * @name deletePage
         * @memberof npPrototype
         * @description delete the Page
         * @param {string} pageName
         */
        self.deletePage = function (pageName) {
            $rootScope.$broadcast('PageDeleted', pageName);
            return setPrototypePromise(pageAPI.delete({pageName: pageName}).$promise, 'npPrototype: could not delete page');
        };

        /**
         * @name getNavigationToPage
         * @memberof npPrototype
         * @description gives the number of pages which has navigation to the page passed as param
         * @param {string} pageName
         */
        self.getNavigationToPage = function (pageName) {
            return self.getPrototype().then(function (proto) {
                return _.filter(proto.navigations, function (navigation) {
                    return navigation.pageTo === pageName;
                });
            });
        };

        /**
         * @name getPrototypeLockStatus
         * @memberof npPrototype
         * @description Get the status of the prototype lock
         */
        self.getPrototypeLockStatus = function () {
            return prototypeLockAPI.get().$promise;
        };

        /**
         * @name lockPrototype
         * @memberof npPrototype
         * @description Attempt to lock the prototype
         */
        self.lockPrototype = function () {
            return prototypeLockAPI.save().$promise;
        };

        /**
         * @name unlockPrototype
         * @memberof npPrototype
         * @description Attempt to unlock the prototype
         */
        self.unlockPrototype = function () {
            return prototypeLockAPI.delete().$promise;
        };

        /**
         * @name setPrototypeViewModeData
         * @memberof npPrototype
         * @description Set the prototype view mode data
         * @param {object}
         */
        self.setPrototypeViewModeData = function (prototypeViewModeData) {
            _prototypeViewModeData = prototypeViewModeData;
        };

        /**
         * @name getPrototypeViewModeData
         * @memberof npPrototype
         * @description Get prototype view mode data
         */
        self.getPrototypeViewModeData = function () {
            return _prototypeViewModeData;
        };

        self.setPositionsPageMap = function (positionsPayload) {
            _cachedPrototypeValid = false;
            return pageMapAPI.save(positionsPayload).$promise;
        };

        /**
         * @name setPrototypePromise
         * @private
         * @description Set the prototype cached promise and logs the passed error in case of failure
         * @param {Promise} promise
         * @param {string} [errorMsg]
         * @returns {Promise}
         */
        var setPrototypePromise = function (promise, errorMsg) {
            _cachedPrototypePromise = promise;
            _cachedPrototypeValid = true;
            _cachedPrototypePromise.then(addFullUrls).catch(function (err) {
                _cachedPrototypeValid = false;
                if (errorMsg) {
                    $log.error(errorMsg, err);
                }
            });
            return _cachedPrototypePromise;
        };

        // TODO find cleaner solution
        self.updateCachedPrototypePromise = setPrototypePromise;


        var changePageDisplayName = function (displayName, pageMd) {
            return prototypeAPI.updateProto({
                displayNames: [
                    {
                        pageName: pageMd.name,
                        displayName: displayName
                    }
                ]
            }).$promise.then(function () {
                    pageMd.displayName = displayName;
                    _cachedPrototypeValid = false;
                    $rootScope.$broadcast('displayNameChanged');
                });
        };

        self.setPageDisplayName = function (pageName, newDisplayName) {
            return self.getPages().then(function (pages) {
                var pageMd = _.find(pages, {name: pageName});
                if (_.isEmpty(pageMd)) {
                    return $q.reject(pageName + ' not found');
                }
                var oldPageMdDisplayName = pageMd.displayName;
                if (oldPageMdDisplayName === newDisplayName) {
                    return $q.when();
                }
                updateParams();
                return uiCommandManager.execute({
                    execute: changePageDisplayName.bind(this, newDisplayName, pageMd),
                    unexecute: changePageDisplayName.bind(this, oldPageMdDisplayName, pageMd)
                });
            });
        };
        self.getPageDisplayName = function (pageName) {
            return self.getPages().then(function (pages) {
                var pageMd = _.find(pages, {name: pageName}) || {};
                return pageMd.displayName;
            });
        };

        return self;
    }
];

module.exports = npPrototype;

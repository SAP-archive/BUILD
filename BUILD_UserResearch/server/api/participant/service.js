'use strict';

var _ = require('norman-server-tp').lodash;
var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var assetService = registry.getModule('AssetService');
var serviceLogger = commonServer.logging.createLogger('research-participant-service');
var utils = require('../../utils');

var ETAG = 'etag';
var LAST_MODIFIED = 'last-modified';
var IF_MODIFIED_SINCE = 'if-modified-since';
var IF_NONE_MATCH = 'if-none-match';
var EXPIRES = 'expires';
var CACHE_CONTROL = 'cache-control';
var PROGMA = 'pragma';
var CONTENT_TYPE = 'content-type';
var CONTENT_LENGTH = 'content-length';
var CONTENT_DISPOSITION = 'content-disposition';
var IMAGES_CONTENT_TYPES = ['image/gif', 'image/jpeg', 'image/png', 'image/tiff', 'image/pjpeg', 'image/svg+xml'];
var IMAGES_CACHE_DAYS = 10 * 86400; // a day

/**
 *
 * Function will either return a 304 (file is cached) or else return the file contents with cache headers updated
 *
 * @param req
 * @param res
 * @param params
 * @returns {*}
 */
function cacheImageHandler(req, res, params) {
    serviceLogger.info({
        versionId: params.versionId,
        download: params.download,
        assetId: params.asset._id,
        user: req.user._id
    }, '>> cacheImageHandler() ');

    // Is etag present?
    if (IF_NONE_MATCH in req.headers && req.header(IF_NONE_MATCH) === params.asset.md5) {
        serviceLogger.info('<< cacheImageHandler(), render 304');
        return res.status(304).json();
    }
    // Is if-modified-since present?
    else if (IF_MODIFIED_SINCE in req.headers) {
        var reqModifiedDate = new Date(req.header(IF_MODIFIED_SINCE));

        // if-modified-since header is only good to the second while mongoDB is to the millisecond
        var lastModifiedDate = new Date(params.asset.metadata.updated_at);
        lastModifiedDate.setMilliseconds('000');

        // Return 304 if the user has the latest
        if (lastModifiedDate.getTime() <= reqModifiedDate.getTime()) {
            serviceLogger.info('<< cacheImageHandler(), render 304');
            return res.status(304).json();
        }
    }

    // Fresh request, so generate cache headers
    res.set(CONTENT_TYPE, params.asset.metadata.contentType);
    res.set(CONTENT_LENGTH, params.asset.length);

    // need to set the attachment flag in order to support file download
    if (params.download === 'true') {
        res.set(CONTENT_DISPOSITION, 'attachment; filename=' + params.asset.filename);
    }
    else {
        res.set(CONTENT_DISPOSITION, 'filename=' + params.asset.filename);
    }

    // If versionId is requested then set cache to one day
    if (!_.isEmpty(params.versionId)) {
        res.set(CACHE_CONTROL, 'private, max-age=86400');
        res.set(PROGMA, 'cache');
        res.set(EXPIRES, new Date().toUTCString());
        res.set(LAST_MODIFIED, params.asset.metadata.updated_at.toUTCString());
    }
    else {
        // Otherwise set etag
        res.set(ETAG, params.asset.md5);
    }

    if (_.contains(IMAGES_CONTENT_TYPES, params.asset.metadata.contentType)) {
        res.set(CACHE_CONTROL, 'private, max-age=' + IMAGES_CACHE_DAYS + '\'');
        res.set(PROGMA, 'cache');
    }

    initServices();

    assetService.getGridFs().createReadStream({root: 'assets', _id: params.asset._id})
        .on('error', function (err) {
            if (err) {
                serviceLogger.info('<< cacheImageHandler(), returned error');
                return utils.sendError(res, err);
            }
        }).pipe(res);
}

/**
 * Initialises the required services from the common server registry
 */
function initServices() {
    if (!assetService) {
        assetService = registry.getModule('AssetService');
    }
}

exports.cacheImageHandler = cacheImageHandler;

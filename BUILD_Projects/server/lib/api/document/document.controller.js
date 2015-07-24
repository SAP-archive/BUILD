'use strict';

var commonServer = require('norman-common-server');
var registry = commonServer.registry;
var projectService = registry.getModule('ProjectService');
var assetService = registry.getModule('AssetService');
var commonProjectService = registry.getModule('ProjectCommonService');
var historyService = registry.getModule('HistoryService');

var serviceLogger = commonServer.logging.createLogger('asset-ctrl');

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

// Get list of documents for a project
// http://localhost:9000/api/projects/54aa6eea6fbd8e802cda8484/asset?fileType=image/png
module.exports.index = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> index()');

    var projectId = req.params.projectId;
    var fileTypeFilter = req.query.fileType ? new RegExp('^' + req.query.fileType + '$', 'i') : new RegExp('', 'i');

    assetService.getAssets(projectId, fileTypeFilter, (req.query.thumbOnly === 'true'))
        .then(function (assets) {
            serviceLogger.info('<< index(), returning assets');
            return commonProjectService.sendResponse(res, 200, assets);
        })
        .catch(function (err) {
            serviceLogger.info('<< index(), returning error');
            return commonProjectService.sendError(res, err);
        });
};

// Get a single asset
// http://localhost:9000/api/projects/54aa6eea6fbd8e802cda8484/asset/54aa9a02f368bed02eb01820
module.exports.getAsset = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> getAsset()');

    var assetId = req.params.assetId;

    var versionId = (req.params.versionId === undefined || null) ? '' : '' + req.params.versionId;

    assetService.getAsset(assetId, versionId, (req.query.thumbOnly === 'true'))
        .then(function (asset) {
            if (!asset) {
                serviceLogger.info('<< getAsset(), nothing found');
                return commonProjectService.sendResponse(res, 404, null);
            }
            serviceLogger.info('<< getAsset(), returning asset');
            return commonProjectService.sendResponse(res, 200, asset);
        }).catch(function (err) {
            serviceLogger.info('<< getAsset(), returning error');
            return commonProjectService.sendError(res, err);
        });
};

// Render asset
// http://localhost:9000/api/projects/54aa6eea6fbd8e802cda8484/asset/54aa9a02f368bed02eb01820/render
module.exports.render = function (req, res) {

    serviceLogger.info({
        params: req.params,
        query: req.query
    }, '>> render()');

    var assetId = req.params.assetId;

    var versionId = (req.params.versionId === undefined || null) ? '' : req.params.versionId;
    var thumbOnly = (req.query.thumbOnly === undefined || null) ? 'false' : req.query.thumbOnly;
    var download = (req.query.download === undefined || null) ? 'false' : req.query.download;

    serviceLogger.info('render(), query params[versionId: ' + versionId + ', thumbOnly: ' + thumbOnly + ', download: ' + download + ']');

    assetService.getAsset(assetId, versionId, (req.query.thumbOnly === 'true'))
        .then(function (asset) {

            if (!asset) {
                serviceLogger.info('<< render(), asset not found');
                return res.status(404).json();
            }

            // Is etag present?
            if ((download !== 'true') && IF_NONE_MATCH in req.headers && req.header(IF_NONE_MATCH) === asset.md5) {
                return res.status(304).json();
            }

            // Is if-modified-since present?
            if ((download !== 'true') && IF_MODIFIED_SINCE in req.headers) {
                var reqModifiedDate = new Date(req.header(IF_MODIFIED_SINCE));

                // if-modified-since header is only good to the second while mongoDB is to the millisecond
                var lastModifiedDate = new Date(asset.metadata.updated_at);
                lastModifiedDate.setMilliseconds('000');

                // Return 304 if the user has the latest
                if (lastModifiedDate.getTime() <= reqModifiedDate.getTime()) {
                    return res.status(304).json();
                }
            }

            res.set(CONTENT_TYPE, asset.metadata.contentType);
            res.set(CONTENT_LENGTH, asset.length);

            // need to set the attachment flag in order to support file download
            if (download === 'true') {
                res.set(CONTENT_DISPOSITION, 'attachment; filename=' + asset.filename);
            }
            else {
                res.set(CONTENT_DISPOSITION, 'filename=' + asset.filename);
            }

            // If versionId is requested then set cache to one day
            if (versionId !== '') {
                res.set(CACHE_CONTROL, 'private, max-age=86400');
                res.set(PROGMA, 'cache');
                res.set(EXPIRES, new Date().toUTCString());
                res.set(LAST_MODIFIED, asset.metadata.updated_at.toUTCString());
            }
            else {
                // Otherwise set etag
                res.set(ETAG, asset.md5);
            }

            assetService.getGridFs().createReadStream({root: 'assets', _id: asset._id})
                .on('error', function (err) {
                    if (err) {
                        serviceLogger.info('<< render(), returned error');
                        return commonProjectService.sendError(res, err);
                    }
                }).pipe(res);

        }).catch(function (err) {
            serviceLogger.info('<< render(), returned error');
            return commonProjectService.sendError(res, err);
        });
};

// Delete an asset
module.exports.delete = function (req, res) {

    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> delete()');

    var projectId = req.params.projectId;
    var assetId = req.params.assetId;
    var userId = req.user._id;

    projectService.getProject(projectId, userId, {}, {}, true)
        .then(function (project) {
            if (!project) {
                serviceLogger.info('<< delete(), project not found, returning');
                return commonProjectService.sendResponse(res, 404, {});
            }

            assetService.deleteAsset(projectId, assetId, userId)
                .then(function (asset) {
                    if (!asset) {
                        serviceLogger.info('<< delete(), asset not found, returning');
                        return commonProjectService.sendResponse(res, 404, null);
                    }

                    serviceLogger.info('<< delete(), returning success');
                    return commonProjectService.sendResponse(res, 204, null);
                }).catch(function (err) {
                    serviceLogger.info('<< delete(), returning error');
                    return commonProjectService.sendError(res, err);
                });
        })
        .catch(function (err) {
            serviceLogger.info('<< delete(), returning error');
            return commonProjectService.sendError(res, err);
        })
        .finally(function () {
            serviceLogger.info('<< delete(), deleted asset');
        });
};

module.exports.upload = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> upload()');

    if (Object.keys(req.files).length === 0) {
        serviceLogger.error('<< upload(), no files found, returning error');
        return commonProjectService.sendResponse(res, 400, {error: 'No files attached'});
    }

    var projectId = req.params.projectId;
    var userId = req.user._id;

    projectService.getProject(projectId, userId, {}, {}, true)
        .then(function (project) {
            if (!project) {
                serviceLogger.info('<< upload(), nothing found');
                return commonProjectService.sendResponse(res, 404, {});
            }

            // Delegate request to a handler that will return the details of the documents saved
            assetService.handleFileUpload(projectId, userId, {}, [].concat(req.files.file), (req.query.linkImage === 'true'))
                .then(function (assets) {

                    assets.forEach(function (asset) {
                        historyService.logHistory({
                            project_id: projectId,
                            user: asset.metadata.created_by,
                            description: 'New Document Uploaded',
                            resource_id: asset._id,
                            resource_name: asset.filename,
                            resource_type: asset.metadata.contentType,
                            thumbnail_url: '/api/projects/' + projectId + '/document/' + asset._id + '/render'
                        });
                    });

                    serviceLogger.info('<< upload(), returning new assets');
                    return commonProjectService.sendResponse(res, 201, assets);
                }).catch(function (err) {
                    serviceLogger.info('<< upload(), returning error');
                    return commonProjectService.sendError(res, err);
                });
        })
        .catch(function (err) {
            serviceLogger.info('<< upload(), returning error');
            return commonProjectService.sendError(res, err);
        })
        .finally(function () {
            serviceLogger.info('<< upload(), completed upload for project');
        });
};

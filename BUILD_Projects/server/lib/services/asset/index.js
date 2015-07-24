'use strict';

var Grid = require('gridfs-stream');
var async = require('async');
var tp = require('norman-server-tp');
var _ = tp.lodash;
var streamifier = tp.streamifier;
var commonServer = require('norman-common-server');
var mongoose = commonServer.db.mongoose;
var Promise = require('norman-promise');
var config = commonServer.config;
var queryString = require('querystring');
var mime = tp.mime;

var assetModel = require('./asset.model');
var Assets;
var GridFs;

var intRegex = /^\d+$/;
var hexadecimal = /^[0-9a-fA-F]+$/;
var restrictFields = '_id md5 metadata.updated_at metadata.hasThumb metadata.project metadata.parent_id metadata.version metadata.created_at metadata.updated_by metadata.created_by metadata.isThumb metadata.contentType metadata.extension filename length uploadDate';

var serviceLogger = commonServer.logging.createLogger('asset-service');

/**
 * @private
 */
var _getGridFs = function () {
    if (!GridFs) {
        var database = commonServer.db.connection.getMongooseConnection(config.get('db').database);

        GridFs = new Grid(database.db, mongoose.mongo);
    }
    return GridFs;
};

/**
 * @private
 */
var _toObjectId = function (id) {
    return mongoose.Types.ObjectId(id);
};

/**
 * @private
 */
var _isFieldBoolean = function (str) {
    return (typeof str === 'boolean');
};

/**
 * @private
 */
var _isMongoId = function (str) {
    return (hexadecimal.test(str) && str.length === 24);
};

/**
 * @private
 */
var _containsThumb = function (list) {
    var i = list.length;
    while (i--) {
        if (list[i].originalname.toLowerCase().indexOf('thumb_') !== -1) {
            return true;
        }
    }
    return false;
};

/**
 * @private
 */
var _updateThumb = function (thumbItems) {
    serviceLogger.info({
        thumbItems: thumbItems
    }, '>> _updateThumb()');

    var deferred = Promise.defer();
    var assetList = [];

    async.each([].concat(Object.keys(thumbItems)), function (key, done) {

        var updateQuery = {};
        var thumbItem = thumbItems[key];

        if (thumbItem.isThumb) {
            updateQuery['metadata.parent_id'] = thumbItems.parent._id;
        }
        else {
            updateQuery['metadata.hasThumb'] = true;
        }

        Assets.findByIdAndUpdate(thumbItem._id, updateQuery).exec(function (err, asset) {
            if (err) {
                done(err);
            }

            // Dev-note: Make into an object otherwise ctrl will be handling mongoose object
            // Dev-note: only return the parent here, thumb details are not required
            if (!thumbItem.isThumb) {
                assetList.push(asset.toObject());
            }
            serviceLogger.info('_updateThumb(), asset updated');
            done();
        });

    }, function (err) {
        if (err) {
            return deferred.reject(err);
        }

        serviceLogger.info('<< _updateThumb(), finished');
        return deferred.resolve(assetList);
    });

    return deferred.promise;
};

function AssetService() {
}

module.exports = AssetService;

AssetService.prototype.initialize = function (done) {
    serviceLogger.info('>> initialize()');
    Assets = assetModel.create();
    GridFs = this.getGridFs();
    done();
};

AssetService.prototype.checkSchema = function (done) {
    assetModel.createIndexes(done);
};

AssetService.prototype.shutdown = function (done) {
    serviceLogger.info('>> shutdown()');
    assetModel.destroy(done);
};

AssetService.prototype.onInitialized = function (done) {
    serviceLogger.info('>> onInitialized()');
    done();
};

AssetService.prototype.getModel = function () {
    serviceLogger.info('>> getModel()');

    if (!Assets) {
        Assets = assetModel.create();
    }
    return Assets;
};

/**
 * Dev-note: Folders in mongo, used in assets to differenate between Prototypes and Project folders
 * http://stackoverflow.com/questions/16514912/mongoose-schema-for-hierarchical-data-like-a-folder-subfolder-file
 *
 */
AssetService.prototype.handleFileUpload = function (projectId, userId, metaData, fileList, linkThumb) {
    serviceLogger.info({
        projectId: projectId,
        userId: userId,
        metaData: metaData,
        fileListSize: fileList.length,
        linkThumb: linkThumb
    }, '>> handleFileUpload()');

    // Ensure we are handling the correct object type here i.e. boolean and mongo ID
    if (!_isFieldBoolean(linkThumb) || !_isMongoId(projectId.toString()) || !_isMongoId(userId.toString())) {
        serviceLogger.error('<< handleFileUpload(), One of the parameters are not set correctly');
        return Promise.reject(new Error('One of the parameters are not set correctly'));
    }

    // Conditions need to exist for the request to be processed if user is requesting thumbnail support
    if (linkThumb && !(_containsThumb(fileList) && fileList.length === 2)) {
        serviceLogger.error('<< handleFileUpload(), Missing thumbnail in request');
        return Promise.reject(new Error('Missing thumbnail in request'));
    }

    var deferred = Promise.defer();
    var reject = function (err) {
        serviceLogger.error('<< handleFileUpload(), returning error');
        deferred.reject(err);
    };

    metaData = (metaData || {});

    var fileUploadedList = [];
    var thumbItems = {};

    async.each([].concat(fileList), function (fileItem, done) {

        // Metadata attached to each file
        var tmpData = {};

        // Confirm which image is the thumbnail
        // Dev-note: this field should only be set to true if a thumb is being uploaded as part of the thumbnail
        // generation step. Users should still be able to upload images with thumb_ in their name BUT not be considered
        // a thumbnail
        var isThumb = (!fileItem.originalname.toLowerCase().indexOf('thumb_') && linkThumb) ? true : false;
        tmpData.created_at = new Date();
        // updated_at is required for caching headers
        tmpData.updated_at = new Date();
        tmpData.deleted = false;
        tmpData.project = projectId;
        tmpData.contentType = fileItem.mimetype;
        tmpData.extension = fileItem.extension;
        tmpData.originalname = fileItem.originalname;
        tmpData.length = fileItem.size;
        // TODO this needs to be cleaned up to handle version control
        tmpData.version = 1;
        tmpData.isThumb = isThumb;
        tmpData.hasThumb = false;
        tmpData.created_by = userId;
        tmpData.root = 'app_folder';
        // Projects folder is the default root folder used for a project
        tmpData.path = ',Projects';

        var target = _getGridFs().createWriteStream({
            filename: fileItem.originalname,
            mode: 'w',
            metadata: _.merge(tmpData, metaData),
            root: 'assets'
        });

        streamifier.createReadStream(fileItem.buffer).pipe(target);

        target.on('error', function (err) {
            done(err);
        });

        // Attach new file to asset list
        target.on('close', function (file) {
            fileUploadedList.push(file._id);

            // Step 3. Set the parent and thumb details
            if (linkThumb) {
                var tmpItem = {};
                tmpItem._id = file._id;
                tmpItem.isThumb = file.metadata.isThumb || false;
                (file.metadata.isThumb) ? thumbItems.child = tmpItem : thumbItems.parent = tmpItem;
            }
            done();
        });
    }, function (err) {
        if (err) {
            reject(err);
        }

        // Each thumbnail request will have 2 images attached, they need to be linked now
        if (linkThumb && fileUploadedList.length === 2) {
            serviceLogger.info('<< handleFileUpload(), returning updated assets');
            deferred.resolve(_updateThumb(thumbItems));
        }
        else {
            // Return new file(s) that have been created
            Assets.find({
                _id: {$in: fileUploadedList},
                'metadata.project': projectId
            }, restrictFields).lean(true).exec(function (findErr, assets) {
                if (findErr) {
                    reject(findErr);
                }
                serviceLogger.info('<< handleFileUpload(), returning assets, total ' + assets.length);
                deferred.resolve(assets);
            });
        }
    });
    return deferred.promise;
};

AssetService.prototype.deleteAsset = function (projectId, assetId, userId) {
    serviceLogger.info({
        projectId: projectId,
        assetId: assetId,
        userId: userId
    }, '>> deleteAsset()');

    // Ensure we are handling the correct object type here i.e. boolean and mongo ID
    if (!_isMongoId(projectId.toString()) || !_isMongoId(assetId.toString()) || !_isMongoId(userId.toString())) {
        serviceLogger.error('<< deleteAsset(), One of the parameters are not set correctly');
        return Promise.reject(new Error('One of the parameters are not set correctly'));
    }

    var deferred = Promise.defer();

    // Setup query params to find asset being deleted and ensure user
    // Dev-note: user should not be able to delete thumbnails, they are attached to a parent
    var queryParam = {
        'metadata.project': projectId,
        'metadata.deleted': false,
        'metadata.isThumb': false,
        _id: assetId
    };

    // Set deleted flag to true
    Assets.findOneAndUpdate(queryParam, {
        'metadata.updated_at': new Date(),
        'metadata.updated_by': userId,
        'metadata.deleted': true
    }).exec(function (err, asset) {
        if (err) {
            serviceLogger.error('deleteAsset(), returning error');
            return deferred.reject(err);
        }

        // Asset was found BUT has thumbnails attached!!!
        if (asset) {
            // Find ALL assets where they are attached to the parent asset i.e. different versions / thumbnail
            Assets.update({'metadata.parent_id': _toObjectId(assetId)}, {
                'metadata.updated_at': new Date(),
                'metadata.updated_by': userId,
                'metadata.deleted': true
            }, {multi: true}, function (error, numAffected) {
                if (error) {
                    serviceLogger.info('<< deleteAsset(), returning error ' + error);
                    return deferred.reject(new Error(error));
                }

                serviceLogger.info('deleteAsset(), ' + numAffected + ' thumbnail(s) / versions have been deleted');
                // Return asset here NOT assets, user only cares about the main asset being deleted
                serviceLogger.info('<< deleteAsset(), returning asset');
                return deferred.resolve(asset);
            });
        }
        else {
            serviceLogger.info('<< deleteAsset(), returning asset');
            return deferred.resolve(asset);
        }
    });

    return deferred.promise;
};

AssetService.prototype.getAssets = function (projectId, fileTypeFilter, thumbOnly) {

    serviceLogger.info({
        projectId: projectId,
        fileTypeFilter: fileTypeFilter ? fileTypeFilter.toString() : '',
        thumbOnly: thumbOnly
    }, '>> getAssets()');

    if (!_isFieldBoolean(thumbOnly) || !_isMongoId(projectId.toString())) {
        serviceLogger.error('<< getAssets(), One of the parameters are not set correctly');
        return Promise.reject(new Error('One of the parameters are not set correctly'));
    }

    var deferred = Promise.defer();

    // Restrict access by ProjectID, deleted: false and the default folder is Project i.e. contains all project related material
    var queryParam = {
        'metadata.project': projectId,
        'metadata.deleted': false,
        'metadata.path': /,Project/
    };

    queryParam['metadata.isThumb'] = thumbOnly;

    if (fileTypeFilter) {
        queryParam['metadata.contentType'] = fileTypeFilter;
    }

    Assets.find(queryParam, restrictFields).lean(true).exec(function (err, assets) {
        if (err) {
            serviceLogger.error('<< getAssets(), returning error');
            return deferred.reject(err);
        }
        serviceLogger.info('<< getAssets(), returning assets');
        return deferred.resolve(assets);
    });

    return deferred.promise;
};

/**
 * Get Asset will return the details of the main image. The thumbnail details can also be obtained if isThumb is enabled
 *
 * Example Matrix:
 *  Param     | Required (option 1)  | Required (option 2)
 *  AssetId   | Yes                  | Yes
 *  versionId | No                   | Yes
 *  isThumb   | Yes                  | Yes
 *
 * @param assetId
 * @param versionId
 * @param thumbOnly
 * @returns {deferred.promise|*}
 */
AssetService.prototype.getAsset = function (assetId, versionId, thumbOnly) {

    serviceLogger.info({
        assetId: assetId,
        versionId: versionId,
        thumbOnly: thumbOnly
    }, '>> getAsset()');

    var deferred = Promise.defer();

    // Ensure asset ID has been populated
    if (!_isMongoId(assetId)) {
        serviceLogger.error('<< getAsset(), returning error, Asset ID is a required field');
        // dev-note: since promise wont have been returned, need to return one with an error
        return Promise.reject(new Error('Asset ID is a required field'));
    }

    // Ensure asset ID has been populated
    if (!_isFieldBoolean(thumbOnly)) {
        serviceLogger.error('<< getAsset(), returning error, Thumbnail field is not set correctly');
        // dev-note: since promise wont have been returned, need to return one with an error
        return Promise.reject(new Error('Thumbnail field is not set correctly'));
    }

    // Step 1. Configure default params
    var isVersion = intRegex.test(versionId) ? true : false;

    // Step2. Input params for query, restrict to app_folder i.e. will be shown to the user on the front end
    var queryParams = {'metadata.root': 'app_folder'};

    // If thumb is true, then get thumb version of asset, otherwise get main image. Required for thumbnail support.
    if (thumbOnly) {
        queryParams['metadata.parent_id'] = _toObjectId(assetId);
        queryParams['metadata.isThumb'] = true;
    }
    else {
        queryParams._id = assetId;
    }

    if (isVersion) {
        queryParams['metadata.version'] = parseInt(versionId, 10);
    }
    else {
        // Latest version and deleted status is considered here if version is not available
        queryParams['metadata.version'] = 1;
        queryParams['metadata.deleted'] = false;
    }

    // Step 3. Generate query using params, will return JSON object rather than mongoose object
    Assets.findOne(queryParams, restrictFields).lean(true).exec(function (err, asset) {
        if (err) {
            serviceLogger.error('<< getAsset(), returning error, ' + err);
            return deferred.reject(err);
        }
        serviceLogger.info('<< getAsset(), returning asset');
        return deferred.resolve(asset);
    });

    return deferred.promise;
};

/**
 * Get a file buffer representation of an asset.
 *
 * @param assetId
 * @param versionId
 * @param isThumb
 * @returns {deferred.promise|*}
 */
AssetService.prototype.getAssetWithContent = function (assetId, versionId, isThumb) {

    serviceLogger.info({
        assetId: assetId,
        versionId: versionId,
        isThumb: isThumb
    }, '>> getAssetWithContent()');

    var deferred = Promise.defer();

    this.getAsset(assetId, versionId, isThumb).then(function (asset) {
        if (!asset) {
            serviceLogger.info('<< getAssetWithContent(), asset not found');
            deferred.resolve(null);
        }
        else {
            var readStream, chunksArray = [], fileBuffer;
            readStream = _getGridFs().createReadStream({root: 'assets', _id: asset._id});

            readStream.on('error', function (err) {
                if (err) {
                    serviceLogger.info('<< getAssetWithContent(), error during read, returned error');
                    deferred.reject(err);
                }
            });

            readStream.on('data', function (chunk) {
                chunksArray.push(chunk);
            });

            readStream.on('end', function () {
                serviceLogger.info('<< getAssetWithContent(), returning file details');
                fileBuffer = Buffer.concat(chunksArray);
                deferred.resolve({
                    filename: asset.filename,
                    contentType: asset.metadata.contentType,
                    fileContent: fileBuffer
                });
            });
        }
    }, function (err) {
        serviceLogger.error('<< getAssetWithContent(), returning error');
        return deferred.reject(err);
    });
    return deferred.promise;
};

AssetService.prototype.updateAsset = function (projectId, docId, updateFields) {

    serviceLogger.info({
        projectId: projectId,
        docId: docId,
        updateFields: updateFields
    }, '>> updateAsset');

    var deferred = Promise.defer();

    updateFields = (updateFields === undefined || null) ? {} : updateFields;

    Assets.findOneAndUpdate(
        {
            _id: docId,
            'metadata.project': projectId,
            'metadata.deleted': false
        }, updateFields)
        .lean(true)
        .exec(function (err, asset) {
            if (err) {
                serviceLogger.error('<< updateAsset(), returning error');
                return deferred.reject(err);
            }
            serviceLogger.info('<< updateAsset(), returning asset');
            return deferred.resolve(asset);
        });
    return deferred.promise;
};

AssetService.prototype.getGridFs = function () {
    return _getGridFs();
};

/**
 * Return a prototype asset based on the entryPath i.e. /JL/index.html.png and study prototype ID. This ID is generated by
 * the StudyPrototype service when a new Prototype zip is uploaded.
 *
 * @param studyPrototypeId
 * @param pathStr
 * @returns {*}
 */
AssetService.prototype.getPrototypeAsset = function (studyPrototypeId, pathStr) {
    serviceLogger.info({
        studyPrototypeId: studyPrototypeId,
        pathStr: pathStr
    }, '>> getPrototypeAsset()');

    // Ensure asset ID has been populated
    if (!_isMongoId(studyPrototypeId) || _.isEmpty(pathStr)) {
        serviceLogger.error('<< getPrototypeAsset(), returning error, issue with one of the parameters');
        return Promise.reject(new Error('A required field is missing'));
    }

    var deferred = Promise.defer();
    var queryParams = {'metadata.entryPath': pathStr, 'metadata.studyPrototypeId': studyPrototypeId};

    Assets.findOne(queryParams, restrictFields)
        .lean(true)
        .exec(function (err, asset) {
            if (err) {
                serviceLogger.error('<< getPrototypeAsset(), returning error, ' + err);
                deferred.reject(err);
            }
            else {
                serviceLogger.info('<< getPrototypeAsset(), returning asset');
                return deferred.resolve(asset);
            }
        });

    return deferred.promise;
};

/**
 * Specific handler to dump the contents of a prototype zip into the assets collection - the contents are stored in a
 * different folder so that the user does not see any of the contents via the Files tabs on the UI.
 *
 * Dev-note: The following exception was thrown when the metadata from the prototype was passed in:
 * 'RangeError: Maximum call stack size exceeded'. To fix it, dont pass it or else only pass in the required fields that need
 * to be added to the metadata collection.
 *
 * @param projectId
 * @param studyPrototypeId
 * @param userId
 * @param metaData
 * @param zipFileList
 * @param folderName, defaults to Prototypes if nothing is passed in, used to group the contents between Project and Prototypes
 * @returns {*}
 */
AssetService.prototype.handlePrototypeUpload = function (projectId, studyPrototypeId, userId, zipFileList, folderName) {
    serviceLogger.info({
        projectId: projectId,
        studyPrototypeId: studyPrototypeId,
        userId: userId,
        zipFileList: zipFileList.length,
        folderName: folderName
    }, '>> handlePrototypeUpload()');

    // Ensure we are handling the correct object type here i.e. boolean and mongo ID
    if (!_isMongoId(projectId.toString()) || !_isMongoId(studyPrototypeId.toString()) || !_isMongoId(userId.toString())) {
        serviceLogger.error('<< handlePrototypeUpload(), One of the parameters are not set correctly');
        return Promise.reject(new Error('One of the parameters are not set correctly'));
    }

    var deferred = Promise.defer();
    var reject = function (err) {
        serviceLogger.error('<< handlePrototypeUpload(), returning error, ' + err);
        deferred.reject(err);
    };

    // Default folder for storing prototypes
    if (!folderName) {
        folderName = 'Prototypes';
    }
    var fileList = [];

    // Need to update each file with params so that it fit into the asset image flow i.e. rendering, filtering
    _.forOwn(zipFileList, function (entry, path) {
        var file = {};
        var filepathSplit = entry.path.split('/');
        var filename = filepathSplit[filepathSplit.length - 1];

        file.path = queryString.unescape(path);
        file.filename = filename;
        file.content = entry.buffer;
        file.contentType = mime.lookup(filename);
        fileList.push(file);
    });

    var fileUploadedList = [];
    async.each([].concat(fileList), function (fileItem, done) {
        // Metadata attached to each file
        var tmpData = {};
        tmpData.created_at = new Date();
        tmpData.created_by = userId;
        // updated_at is required for caching headers
        tmpData.updated_at = new Date();
        tmpData.deleted = false;
        tmpData.contentType = fileItem.contentType;
        tmpData.extension = fileItem.filename.split('.').pop();
        tmpData.length = fileItem.content.size;
        tmpData.version = 1;
        tmpData.isThumb = false;
        tmpData.hasThumb = false;
        tmpData.entryPath = fileItem.path;
        tmpData.root = 'app_folder';
        tmpData.path = ',' + folderName;
        tmpData.project = projectId;
        tmpData.studyPrototypeId = studyPrototypeId;

        var target = _getGridFs().createWriteStream({
            filename: fileItem.filename,
            mode: 'w',
            metadata: tmpData,
            root: 'assets',
            content_type: tmpData.contentType
        });

        streamifier.createReadStream(fileItem.content).pipe(target);

        target.on('error', function (err) {
            done(err);
        });

        // Attach new file to asset list
        target.on('close', function (file) {
            fileUploadedList.push(file._id);
            done();
        });
    }, function (err) {
        if (err) {
            reject(err);
        }
        serviceLogger.info('<< handlePrototypeUpload(), returning success');
        deferred.resolve({files: fileUploadedList.length, success: true});
    });
    return deferred.promise;
};

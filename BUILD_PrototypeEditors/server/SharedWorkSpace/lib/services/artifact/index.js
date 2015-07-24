'use strict';
var commonServer = require('norman-common-server'),
    Promise = require('norman-promise'),
    commonMessage = require('./../common/common.message.js'),
    NormanError = commonServer.NormanError,
    tp = commonServer.tp,
    model = require('./model'),
    Grid = require('gridfs-stream'),
    _ = tp.lodash,
    mime = tp.mime,
    mongo = commonServer.db.mongoose.mongo,
    queryString = require('querystring');


/**
 * Logging for Artifact Service
 */
var serviceLogger = commonServer.logging.createLogger('sharedworkspace-artifact-service');

/**
 * Artifact service Constructor
 * @constructor
 */
function ArtifactService() {

}

/**
 * Artifact Service Exporting
 * @type {ArtifactService}
 */
module.exports = ArtifactService;

/**
 * Artifact Service Initialization
 * @param code
 * @param err
 * @returns NormanError
 */

var logError = function (code, err) {
    var error = new NormanError(commonMessage.error[code] + err, code);
    serviceLogger.error(error);
    return error;
};

ArtifactService.prototype.initialize = function (done) {
    serviceLogger.info('>> initialize()');
    this.gridModel = model.create();
    var db = commonServer.db.connection.getDb('norman-shared-workspace-server');
    this.grid = new Grid(db, mongo);
    this.grid.collection('artifacts');
    this.stream = tp.streamifier;
    done();
};

ArtifactService.prototype.checkSchema = function (done) {
    model.createIndexes(done);
};

/**
 * Shutdown once the service is shutdown centrally
 * @param done
 */
ArtifactService.prototype.shutdown = function (done) {
    serviceLogger.info('>> shutdown()');
    model.destroy(done);
};

/**
 * onInitialized is called after the module is initialized
 * @param done
 */
ArtifactService.prototype.onInitialized = function (done) {
    serviceLogger.info('>> onInitialized()');
    done();
};


/**
 * check an Artifact by path and Remove if exists.
 */
var checkandRemoveArtifact = function (projectId, path, metadata, removeOld, _this) {
    var deferred = Promise.defer();
    var search = {
        'metadata.projectId': projectId,
        'metadata.path': queryString.unescape(path)
    };
    var that = _this;
    if (!_.isEmpty(metadata)) {
        _.forOwn(metadata, function (value, key) {
            search['metadata.' + key] = value;
        });
    }
    if (!_.isEmpty(removeOld)) {
        removeOld = false;
    }
    if (removeOld) {
        _this.getArtifactByMetadata(search).then(function (files) {
            serviceLogger.debug(commonMessage.success.SWS016);
            if (!_.isEmpty(files)) {
                var results = [];
                _(files).forEach(function (file, n) {
                    if (_.keys(file.metadata).length === _.keys(search).length) {
                        that.removeArtifactById(file._id.toString())
                            .then(function (result) {
                                if (result === 'OK') {
                                    results.push(result);
                                }
                            }, function (err) {
                                deferred.reject(logError('SWE015', err));
                            });
                    }
                    if (n === files.length - 1) {
                        deferred.resolve();
                    }
                }).value();
            }
            else {
                deferred.resolve();
            }
        }).catch(function (err) {
            deferred.reject(logError('SWE013', err));
        });
    }
    else {
        deferred.resolve();
    }
    return deferred.promise;
};

/**
 * Single Artifact Upload
 * @param projectId
 * @param file - {
 * path:'view/view.app.xml',
 * filecontent:'Hello'
 * }
 * @param removeOld remove old artifact
 * @returns created File Object
 */

ArtifactService.prototype.uploadArtifact = function (projectId, file, removeOld) {

    serviceLogger.info({
        projectId: projectId
    }, '>> Uploading Artifacts for Project');


    var deferred = Promise.defer(),
        filename,
        path,
        contentType,
        metadata,
        that = this;

    checkandRemoveArtifact(projectId, file.path, file.metadata, removeOld, that)
        .then(function () {

            var filepathSplit = file.path.split('/');
            filename = filepathSplit[filepathSplit.length - 1];
            path = file.path;
            contentType = mime.lookup(filename);

            metadata = {
                projectId: projectId,
                path: queryString.unescape(path)
            };

            if (file.hasOwnProperty('metadata')) {
                _.forOwn(file.metadata, function (value, key) {
                    metadata[key] = value;
                });
            }

            var writestream = that.grid.createWriteStream({
                filename: filename,
                mode: 'w',
                content_type: contentType,
                metadata: metadata,
                root: 'artifacts'
            });

            that.stream.createReadStream(file.filecontent).pipe(writestream);

            writestream.on('close', function (retFile) {
                serviceLogger.debug(commonMessage.success.SWS009);
                deferred.resolve(retFile);
            });
            writestream.on('error', function (err) {
                deferred.reject(logError('SWE011', err));
            });

        }).catch(function (err) {
            deferred.reject(logError('SWE011', err));
        });
    return deferred.promise;
};


/**
 * Multiple File Upload
 * @param projectId
 * @param files - Array of Files Referring above file Object -> please refer to uploadArtifact function.
 * @param removeOld remove old artifact
 * @returns Array of created file Object
 */

ArtifactService.prototype.uploadArtifacts = function (projectId, files, removeOld) {
    var deferred = Promise.defer(),
        promises = [],
        that = this;
    _(files).forEach(function (file) {
        promises.push(that.uploadArtifact(projectId, file, removeOld));
    }).value();
    Promise.all(promises).then(function (filesArr) {
        serviceLogger.debug(commonMessage.success.SWS010);
        deferred.resolve(filesArr);
    }).catch(function (err) {
        deferred.reject(logError('SWE012', err));
    });
    return deferred.promise;
};

/**
 * Get Artifact by ID
 * @param id
 * @returns file Object of Matching Artifact
 */

ArtifactService.prototype.getArtifact = function (id) {
    var deferred = Promise.defer();
    this.gridModel.findById(id).lean().exec(function (err, file) {
        if (err) {
            deferred.reject(logError('SWE013', err));
        }
        else {
            serviceLogger.debug(commonMessage.success.SWS011);
            deferred.resolve(file);
        }
    });
    return deferred.promise;
};

/**
 * Get the ReadStream of the Artifact
 * @param id
 * @returns readStream which can be piped in the response.
 */

ArtifactService.prototype.getArtifactReadStream = function (id) {
    var deferred = Promise.defer();
    var readStream = this.grid.createReadStream({
        _id: id,
        root: 'artifacts'
    }).on('error', function (err) {
        deferred.reject(logError('SWE014', err));
    });
    deferred.resolve(readStream);
    return deferred.promise;
};

/**
 * Get Artifact ContentType and ReadStream.
 * @param id
 * @returns filename,contentType and readStream which can be piped in the response.
 */
ArtifactService.prototype.getArtifactAndReadStream = function (id) {
    var deferred = Promise.defer(),
        that = this;
    this.getArtifact(id).then(function (file) {
        that.getArtifactReadStream(id).then(function (readStream) {
            deferred.resolve({
                filename: file.filename,
                contentType: file.contentType,
                readStream: readStream
            });
        });
    }).catch(function (err) {
        deferred.reject(logError('SWE013', err));
    });
    return deferred.promise;
};

ArtifactService.prototype.updateMetadata = function (ids, metadata) {
    var deferred = Promise.defer();
    this.gridModel.update({_id: {$in: ids}}, metadata, {multi: true}, function (err, update) {
        if (err) {
            deferred.reject(logError('SWE013', err));
        }
        else {
            serviceLogger.debug(commonMessage.success.SWS011);
            deferred.resolve(update);
        }
    });
    return deferred.promise;

};

/**
 * Get the Artifact by matching Metadata
 * either one parameter is madatory...not all.
 * @param metadata - {
 *  'filename':'view.app.xml',
 *  'metadata.projectId':'54b7f3d19906b4092b038402',
 *  'metadata.path':'view/view.app.xml'
 * }
 * @returns Array of matching Artifacts
 */

ArtifactService.prototype.getArtifactByMetadata = function (metadata) {
    var deferred = Promise.defer();
    this.gridModel.find(metadata).sort('-uploadDate').lean().exec(function (err, files) {
        if (err) {
            deferred.reject(logError('SWE013', err));
        }
        else {
            serviceLogger.debug(commonMessage.success.SWS012);
            deferred.resolve(files);
        }
    });
    return deferred.promise;
};

/**
 * Get Artifact by path and ReadStream
 * @param projectId
 * @param path
 * @returns filename,contentType and readStream which can be piped in the response.
 */

ArtifactService.prototype.getArtifactByPath = function (projectId, path) {
    var deferred = Promise.defer(),
        that = this;
    var metadata = {
        'metadata.projectId': projectId,
        'metadata.path': queryString.unescape(path),
        'metadata.snapshotVersion': {$exists : false}
    };
    this.getArtifactByMetadata(metadata).then(function (files) {
        serviceLogger.debug(commonMessage.success.SWS016);
        if (!_.isEmpty(files)) {
            that.getArtifactReadStream(files[0]._id.toString())
                .then(function (readStream) {
                    deferred.resolve({
                        filename: files[0].filename,
                        contentType: files[0].contentType,
                        readStream: readStream
                    });
                });
        }
        else {
            deferred.resolve(null);
        }
    }).catch(function (err) {
        deferred.reject(logError('SWE018', err));
    });
    return deferred.promise;
};

/**
 * Get the Artifact by ProjectId
 * @param projectId
 * @returns Array of matching Artifacts
 */

ArtifactService.prototype.getArtifactByProjectId = function (projectId) {
    var deferred = Promise.defer();
    var metadata = {
        'metadata.projectId': projectId
    };
    this.getArtifactByMetadata(metadata)
        .then(function (files) {
            serviceLogger.debug(commonMessage.success.SWS016);
            deferred.resolve(files);
        }).catch(function (err) {
            deferred.reject(logError('SWE018', err));
        });
    return deferred.promise;
};

/**
 * Remove the Artifact by Matching ID
 * @param id
 * @returns done
 */

ArtifactService.prototype.removeArtifactById = function (id) {
    var deferred = Promise.defer();
    this.grid.remove({
        _id: id,
        root: 'artifacts'
    }, function (err) {
        if (err) {
            deferred.reject(logError('SWE015', err));
        } else {
            serviceLogger.info({
                Id: id
            }, commonMessage.success.SWS013);
            deferred.resolve('OK');
        }
    });
    return deferred.promise;
};


/**
 * Remove Artifacts by Matching Metadata
 * either one parameter is madatory...not all.
 * @param metadata - {
 *  'filename':'view.app.xml',
 *  'metadata.projectId':'54b7f3d19906b4092b038402',
 *  'metadata.path':'view/view.app.xml'
 * }
 * @returns done
 */

ArtifactService.prototype.removeArtifactByMetadata = function (metadata) {
    var deferred = Promise.defer(),
        promises = [],
        that = this;
    this.getArtifactByMetadata(metadata)
        .then(function (files) {
            _(files).forEach(function (file) {
                promises.push(that.removeArtifactById(file._id.toString()));
            }).value();
            Promise.all(promises)
                .then(function () {
                    serviceLogger.info({
                        metadata: metadata
                    }, commonMessage.success.SWS014);
                    deferred.resolve('OK');
                })
                .catch(function (err) {
                    deferred.reject(err);
                });
        }).catch(function (err) {
            deferred.reject(logError('SWE013', err));
        });
    return deferred.promise;
};

/**
 * Remove Artifacts by Matching ProjectID
 * @param projectId
 * @returns done
 */

ArtifactService.prototype.removeArtifactByProjectID = function (projectId) {
    var deferred = Promise.defer();
    var metadata = {
        'metadata.projectId': projectId
    };
    this.removeArtifactByMetadata(metadata)
        .then(function () {
            serviceLogger.info({
                metadata: metadata
            }, commonMessage.success.SWS015);
            deferred.resolve('OK');
        }).catch(function (err) {
            deferred.reject(logError('SWE017', err));
        });
    return deferred.promise;
};


ArtifactService.prototype.copyArtifacts = function (artifact) {
    var deferred = Promise.defer();
    var readStream = this.grid.createReadStream({
        _id: artifact._id,
        root: 'artifacts'
    }).on('error', function (err) {
        deferred.reject(logError('SWE014', err));
    });

    var writestream = this.grid.createWriteStream({
        filename: artifact.filename,
        mode: 'w',
        content_type: artifact.contentType,
        metadata: artifact.metadata,
        root: 'artifacts'
    });

    readStream.pipe(writestream);

    writestream.on('close', function (retFile) {
        serviceLogger.debug(commonMessage.success.SWS009);
        deferred.resolve(retFile);
    });
    writestream.on('error', function (err) {
        deferred.reject(logError('SWE011', err));
    });
    return deferred.promise;
};

'use strict';
var commonServer = require('norman-common-server'),
    mongoose = commonServer.db.mongoose,
    commonMessage = require('./../common/common.message.js'),
    Promise = require('norman-promise'),
    NormanError = commonServer.NormanError,
    // prototypeConfig = require('./../../../config/prototypeConfig.js'),
    registry = commonServer.registry,
    tp = commonServer.tp,
    _ = tp.lodash,
    prototypeModel = require('./model'),
    Prototype,
    Version,
    PrototypeLock;
var serviceLogger = commonServer.logging.createLogger('prototype-service');

var shardkey = commonServer.utils.shardkey;

/**
 * Prototype Service Constructor
 * @constructor
 */
function PrototypeService() {

}

/**
 * Exporting Prototype Service
 * @type {PrototypeService}
 */
module.exports = PrototypeService;

/**
 * Initialization Model in Prototype Service
 * @param done
 */
PrototypeService.prototype.initialize = function (done) {
    var protoModel = prototypeModel.create();
    Prototype = protoModel.Prototype;
    Version = protoModel.Version;
    PrototypeLock = protoModel.PrototypeLock;
    done();
};

PrototypeService.prototype.checkSchema = function (done) {
    prototypeModel.createIndexes(done);
};

var model;
PrototypeService.prototype.onInitialized = function (done) {
    if (!model) {
        model = {};
        try {
            model.appMetadata = mongoose.model('appMetadata');
            model.pageMetadata = mongoose.model('pageMetadata');
            model.dataModelMetadata = mongoose.model('dataModelMetadata');
            model.sampleMetadata = mongoose.model('sampleMetadata');
        }
        catch (err) {
            serviceLogger.error(err);
        }
    }
    done();
};

/**
 * Shutdown service
 * @param done
 */
PrototypeService.prototype.shutdown = function (done) {
    prototypeModel.destroy(done);
};

var logError = function (code, err) {
    var error = new NormanError(commonMessage.prototype.error[code] + err, code);
    serviceLogger.error(error);
    return error;
};

/**
 * Metadata Save using mongoose object save Method.
 * @param obj - Mongoose Object instance
 * @param instance [ 'appMetadata','pageMetadata','dataModelMetadata','sampleMetadata']
 * @param operation ['UPDATE,CREATE or DELETE]
 * @param oldId id of old object which has to be updated or deleted
 * @returns promise
 * data: createdObj,
 * instance : as above,
 * OP : as above,
 * id : old id for update and DELETE identification
 * }
 */
var saveObj = function (obj, instance, operation, oldId) {
    var deferred = Promise.defer(), id;

    if (operation === 'UPDATE' || operation === 'DELETE') {
        id = oldId;
    }
    if (operation !== 'DELETE') {
        obj.save(function (err, objData) {
            if (err) {
                deferred.reject(logError('SWPE002', err));
            }
            else {
                serviceLogger.info({
                    instance: instance
                }, commonMessage.prototype.success.SWPS001);
                deferred.resolve({
                    data: objData,
                    instance: instance,
                    OP: operation,
                    id: id
                });
            }
        });
    }
    else {
        serviceLogger.info({
            instance: instance
        }, commonMessage.prototype.success.SWPS001);
        deferred.resolve({
            data: obj,
            instance: instance,
            OP: operation,
            id: id
        });

    }
    return deferred.promise;
};

/**
 * Build Promise Array for all Metadata Save
 * @param metadataArray
 * @returns Array of Promises
 */
var saveMetadata = function (metadataArray) {
    var promises = [];
    _(metadataArray).forEach(function (obj) {
        if (!_.isEmpty(obj)) {
            promises.push(saveObj(obj.model, obj.type, obj.OP, obj.oldId));
        }
    }).value();
    return promises;
};

/**
 * savethumbnail to Artifacts and update the the details in prototype version
 * @param projectId
 * @param thumbnails
 * @param created_by
 * @param version
 * @returns created artifact object
 */
var saveThumbnails = function (projectId, thumbnails, created_by, version) {
    var deferred = Promise.defer(),
        artifactService = registry.getModule('ArtifactService'),
        files = [];

    if (!_.isEmpty(thumbnails)) {
        _.forOwn(thumbnails, function (thumbnail, path) {
            var file = {},
                metadata = {};
            file.path = path;
            file.filecontent = thumbnail.buffer;
            metadata.created_by = created_by;
            metadata.prototypeVer = version + 1;
            file.metadata = metadata;
            files.push(file);
        });
        artifactService.uploadArtifacts(projectId, files).then(function (artifacts) {
            var response = [];
            _(artifacts).forEach(function (artifact) {
                response.push({
                    filename: artifact.filename,
                    path: artifact.metadata.path,
                    id: artifact._id
                });
            }).value();
            deferred.resolve(response);
        }).catch(function (err) {
            deferred.reject(logError('SWPE009', err));
        });

    }
    else {
        deferred.resolve(null);
    }
    return deferred.promise;
};

function checkOrCreateModel(metadataModelArray, projectId) {
    if (model) {
        Object.keys(model).forEach(function (metadataModelKey) {
            if (metadataModelKey !== 'pageMetadata' && !_.find(metadataModelArray, {type: metadataModelKey})) {
                var MetadataModel = model[metadataModelKey];
                metadataModelArray.push({
                    model: new MetadataModel({projectId: projectId}),
                    type: metadataModelKey,
                    OP: 'CREATE'
                });
            }
        });
    }
}

/**
 * Create a new Prototype
 * @param projectId
 * @param metadataModelArray - Array of initial Metadata Object
 * [{
 * model : mongoose model,
 * type :  [appMetadata,pageMetadata,dataModelMetadata,sampleMetadata],
 * OP : [CREATE,UPDATE,DELETE]
 * }]
 * @param created_by
 * @param thumbnails
 * @returns 'OK'
 */

PrototypeService.prototype.createPrototype = function (projectId, metadataModelArray, created_by, thumbnails) {

    serviceLogger.info({
        projectId: projectId
    }, '>> createPrototype');

    var deferred = Promise.defer(),
        version = new Version();
    version.version = 1;
    saveThumbnails(projectId, thumbnails, created_by, 0).then(function (savedThumbnails) {
        checkOrCreateModel(metadataModelArray, projectId);
        var promises = saveMetadata(metadataModelArray);
        Promise.all(promises).then(function (savedMetadata) {
            var prototype = new Prototype();
            prototype._id = commonServer.utils.shardkey();
            prototype.projectId = projectId;
            _(savedMetadata).forEach(function (metadata) {
                if (metadata.instance === 'appMetadata') {
                    version.appMetadata = metadata.data._id;
                }
                if (metadata.instance === 'userResearchHeader') {
                    version.userResearchHeader = metadata.data._id;
                }
                if (metadata.instance === 'pageMetadata') {
                    version.pageMetadata.push(metadata.data._id);
                }
                if (metadata.instance === 'dataModelMetadata') {
                    version.dataModelMetadata.push(metadata.data._id);
                }
                if (metadata.instance === 'sampleMetadata') {
                    version.sampleMetadata.push(metadata.data._id);
                }
            }).value();
            version.stats.created_by = created_by;
            if (!_.isEmpty(savedThumbnails)) {
                _(savedThumbnails).forEach(function (thumbnail) {
                    version.artifacts.push({
                        filename: thumbnail.filename,
                        path: thumbnail.path,
                        id: thumbnail.id
                    });
                }).value();
            }
            prototype.versions.push(version);
            prototype.save(function (err) {
                if (err) {
                    deferred.reject(logError('SWPE003', err));
                }
                else {
                    serviceLogger.info({projectId: projectId}, commonMessage.prototype.success.SWPS002);
                    deferred.resolve({
                        status: 'OK',
                        prototype: prototype
                    });
                }
            });

        }).catch(function (err) {
            deferred.reject(logError('SWPE004', err));
        });
    });
    return deferred.promise;
};


/**
 * Builds Options Array for Populating Relevant Reference
 * @param filters
 * @returns Array Options
 */
var buildOptions = function (filters) {
    var options = [];
    _(filters).forEach(function (filter) {
        options.push({
            path: filter,
            model: filter
        });
    }).value();
    return options;
};

/**
 * Fetch Prototype based on Project Id.
 * @param projectId
 * @returns prototype Object
 */
var fetchPrototypebyProjectId = function (projectId) {
    var deferred = Promise.defer();
    Prototype.findOne({projectId: projectId}, function (err, prototype) {
        if (err) {
            deferred.reject(logError('SWPE006', err));
        }
        else {
            serviceLogger.info({projectId: projectId}, commonMessage.prototype.success.SWPS003);
            deferred.resolve(prototype);
        }
    });
    return deferred.promise;
};

/**
 * Fetch Prototype based on Project Id.
 * @param projectId
 * @returns prototype Object
 */
PrototypeService.prototype.fetchPrototypebyProjectId = fetchPrototypebyProjectId;

/**
 * Fetch Prototype Versions by matching projectID and Property
 * @param projectId
 * @param property - any property match on first level of versions in project
 * @param value - matching value
 * @returns matching version Record
 */

PrototypeService.prototype.getVersionsbyMatchingProperty = function (projectId, property, value) {
    var deferred = Promise.defer();
    fetchPrototypebyProjectId(projectId).then(function (prototype) {
        if (prototype) {
            var versions = prototype.versions;
            var returnVersion = _(versions)
                .filter(function (version) {
                    return ((version[property] === value) && (version.isInvalid !== true));
                })
                .value();
            deferred.resolve(returnVersion);
        }
        else {
            deferred.reject(logError('SWPE001', null));
        }
    });
    return deferred.promise;
};

/**
 * Fetch Specified Version of Prototype / fetch Latest Prototype / fetch whole prototype with all versions.
 * @param projectId
 * @param version
 * @param wholePrototype - default set to false
 * @returns gets Prototype Object or Versions record.
 */

PrototypeService.prototype.getPrototype = function (projectId, version, wholePrototype) {
    serviceLogger.info({
        projectId: projectId,
        version: version
    }, '>> getPrototype');

    var deferred = Promise.defer();
    fetchPrototypebyProjectId(projectId).then(function (prototype) {
        if (prototype) {
            if (wholePrototype) {
                serviceLogger.info({projectId: projectId}, commonMessage.success.SWPS006);
                deferred.resolve(prototype);
            }
            else if (version) {
                serviceLogger.info({
                    projectId: projectId,
                    version: version
                }, commonMessage.success.SWPS004);
                if (prototype.versions[version].isInvalid !== true) {
                    deferred.resolve(prototype.versions[version]);
                }
                else {
                    deferred.reject(logError('SWPE011', {projectId: projectId, version: version}));
                }
            }
            else {
                serviceLogger.info({projectId: projectId},
                    commonMessage.success.SWPS005);
                deferred.resolve(prototype.versions[prototype.versions.length - 1]);
            }
        }
        else {
            deferred.reject(logError('SWPE001', null));
        }
    }).catch(function (err) {
        deferred.reject(logError('SWPE006', err));
    });
    return deferred.promise;
};

/**
 * checkMetadata checks for id existence in latest version of prototype for update and delete (this doesn't need promises)
 * @param projectId
 * @param filter
 * @param version
 * @returns boolean
 */
var checkMetadata = function (projectId, filter, version) {
    var index;
    var found = false;
    if (!_.isEmpty(filter)) {
        if (filter.hasOwnProperty('appMetadata')) {
            var appMeta = filter.appMetadata[0];

            found = (version.appMetadata.toString() === appMeta.oldId.toString());
            delete filter.appMetadata;
        }
        _.forOwn(filter, function (metadata, key) {
            var array = [];
            array = version[key];
            _(metadata).forEach(function (data) {
                index = array.indexOf(data.oldId);
                found = (index !== -1);
            }).value();
        });
    }
    else {
        found = true;
    }
    return found;
};

/**
 * doUpdateMetadata adds,deletes or update Metadatas and update versions of prototype.
 * @param prototype
 * @param projectId
 * @param latestVersion
 * @param metadataArray - Refer createPrototype
 * @param created_by
 * @param savedThumbnails
 * @returns 'OK'
 */
var doUpdateMetadata = function (prototype, projectId, latestVersion, created_by, metadataArray, savedThumbnails) {
    var deferred = Promise.defer(),
        promises,
        index;

    var PrototypeService = registry.getModule('PrototypeService');

    var version = new Version(latestVersion);
    version.isNew = true;
    version._id = shardkey();
    version.version = latestVersion.version + 1;
    version.snapshot = undefined;
    version.isSnapshot = false;
    version.stats.created_by = created_by;
    promises = saveMetadata(metadataArray);
    Promise.all(promises).then(function (savedMetadata) {
        var groupedMetadata = _.groupBy(savedMetadata, 'instance');
        if (groupedMetadata.hasOwnProperty('appMetadata')) {
            var appMeta = groupedMetadata.appMetadata;
            if (appMeta[0].OP === 'UPDATE' || appMeta[0].OP === 'CREATE') {
                version.appMetadata = appMeta[0].data._id;
            }
            delete groupedMetadata.appMetadata;
        }
        if (groupedMetadata.hasOwnProperty('userResearchHeader')) {
            var urMeta = groupedMetadata.userResearchHeader;
            if (urMeta[0].OP === 'UPDATE' || urMeta[0].OP === 'CREATE') {
                version.userResearchHeader = urMeta[0].data._id;
            }
            delete groupedMetadata.userResearchHeader;
        }
        _.forOwn(groupedMetadata, function (metadata, key) {
            var array = [];
            array = version[key];
            _(metadata).forEach(function (data) {
                if (data.OP === 'CREATE') {
                    array.push(data.data._id);
                }
                else if (data.OP === 'UPDATE') {
                    index = array.indexOf(data.id);
                    if (index > -1) {
                        array.splice(index, 1, data.data._id);
                    }
                }
                else if (data.OP === 'DELETE') {
                    index = array.indexOf(data.id);
                    if (index > -1) {
                        array.splice(index, 1);
                    }
                }
            }).value();
            version[key] = array;
        });
        if (!_.isEmpty(savedThumbnails)) {
            _(savedThumbnails).forEach(function (thumbnail) {
                index = _.findIndex(version.artifacts, function (artifact) {
                    return artifact.path === thumbnail.path;
                });
                if (index > -1) {
                    version.artifacts.splice(index, 1, {
                        filename: thumbnail.filename,
                        path: thumbnail.path,
                        id: thumbnail.id
                    });
                }
                else {
                    version.artifacts.push({
                        filename: thumbnail.filename,
                        path: thumbnail.path,
                        id: thumbnail.id
                    });
                }
            }).value();
        }
        Prototype.findByIdAndUpdate(
            prototype._id.toString(),
            {$push: {versions: version}},
            {safe: true, upsert: true},
            function (err, saved) {
                if (err) {
                    deferred.reject(logError('SWPE007', err));
                }
                else {
                    PrototypeService.updateTimeInLock(projectId).then(function () {
                        serviceLogger.info({projectId: projectId}, commonMessage.prototype.success.SWPS002);
                        deferred.resolve({
                            status: 'OK',
                            prototype: saved
                        });
                    });
                }
            });
    }).catch(function (error) {
        deferred.reject(error);
    });
    return deferred.promise;
};

/**
 * deleteOutdatedVersions removes all of the outdated prototype versions.
 * (number of outdated versions is determined based on /server/config/prototypeConfig.js)
 * @param prototype
 */
    /*
var deleteOutdatedVersions = function (projectId) {

    fetchPrototypebyProjectId(projectId).then(function (prototype) {
        PrototypeService.prototype.getVersionsbyMatchingProperty(prototype.projectId, 'isSnapshot', false)
            .then(function (prototypeVersions) {
                if (!_.isEmpty(prototypeVersions)) {
                    var numOfUnnecessaryVersions = prototypeVersions.length - prototypeConfig.maximumNumberOfVersions;
                    if (numOfUnnecessaryVersions > 0) {

                        // loop through non-snapshot versions and 'mark' the ones which should be removed
                        var toBeRemoved = [];
                        prototypeVersions.forEach(function (currentVersion) {
                            if (numOfUnnecessaryVersions > 0) {
                                // TODO check and delete metadata as well
                                toBeRemoved.push(currentVersion);
                                numOfUnnecessaryVersions--;
                            }
                        });

                        // remove 'marked' versions from the actual prototype versions
                        _.remove(prototype.versions, function (version) {
                            var toBeDeleted = false;
                            if (!version.isSnapshot) {
                                toBeRemoved.forEach(function (elementMarkedForRemove) {
                                    if (elementMarkedForRemove.version === version.version) {
                                        toBeDeleted = true;
                                    }
                                });
                            }
                            return toBeDeleted;
                        });

                        prototype.markModified('versions');
                        prototype.save(function (err) {
                            if (err) {
                                serviceLogger.error({projectId: prototype.projectId}, commonMessage.prototype.error.SWPE010);
                            }
                            else {
                                serviceLogger.info({projectId: prototype.projectId}, commonMessage.prototype.success.SWPS007);
                            }
                        });

                    }
                }

            });
    });


};
*/
/**
 * doMetadata adds,deletes or update Metadatas and update versions of prototype.
 * @param prototype
 * @param projectId
 * @param metadataArray - Refer createPrototype
 * @param created_by
 * @param thumbnails
 * @returns 'OK'
 */

PrototypeService.prototype.doMetadata = function (prototype, projectId, metadataArray, created_by, thumbnails) {
    serviceLogger.info({
        projectId: projectId
    }, '>> doMetadata');

    var deferred = Promise.defer();
    var latestVersion = prototype.versions[prototype.versions.length - 1];
    var filter = _.groupBy(_.filter(metadataArray, function (arr) {
        if (!_.isEmpty(arr)) {
            return arr.OP === 'UPDATE' || arr.OP === 'DELETE';
        }
    }), 'type');
    if (checkMetadata(projectId, filter, latestVersion)) {
        saveThumbnails(projectId, thumbnails, created_by, latestVersion.version).then(function (savedThumbnails) {

            doUpdateMetadata(prototype, projectId, latestVersion, created_by, metadataArray, savedThumbnails).then(function (response) {
                // delete unnecessary versions after everything is complete
                // deleteOutdatedVersions(projectId);
                deferred.resolve(response);
            });

        });
    }
    else {
        deferred.reject(new Error('Invalid metadata'));
    }
    return deferred.promise;
};

/**
 * Get all Metadata Id's and populate all relavent metadata based on fitlers
 * @param projectId
 * @param filters - ['appMetadata','pageMetadata','dataModelMetadata','sampleMetadata']
 * @returns Object - {
 * appMetadata: Object,
 * pageMetadata: Array of Objects,
 * dataModelMetadata:Array of Objects,
 * sampleMetadata:Array of Objects
 * }
 */

PrototypeService.prototype.getMetadata = function (projectId, filters) {
    serviceLogger.info({
        projectId: projectId
    }, '>> getMetadata');
    var deferred = Promise.defer();
    fetchPrototypebyProjectId(projectId).then(function (prototype) {
        if (prototype) {
            var metadataResponse = {};
            var versions = prototype.versions[_.findLastIndex(prototype.versions, {isInvalid: false})];
            if (versions === undefined) {
                return deferred.reject(logError('SWPE012', projectId));
            }
            var options = buildOptions(filters);
            if (filters) {
                Version.populate(versions, options, function (err, data) {
                    if (err) {
                        return deferred.reject(logError('SWPE008', err));
                    }
                    _(filters).forEach(function (filter) {
                        if (filter) {
                            metadataResponse[filter] = data[filter];
                        }
                    }).value();
                    serviceLogger.info({
                        projectId: projectId
                    }, 'getMetadata with filers');
                    metadataResponse.artifacts = versions.artifacts;

                    serviceLogger.info('getMetadata -> fetchPrototypebyProjectId() successful, returning metadataResponse');

                    return deferred.resolve(metadataResponse);
                });
            }
            else {
                serviceLogger.info({
                    projectId: projectId
                }, 'getMetadata with no filers');
                metadataResponse.appMetadata = versions.appMetadata;
                metadataResponse.pageMetadata = versions.pageMetadata;
                metadataResponse.dataModelMetadata = versions.dataModelMetadata;
                metadataResponse.sampleMetadata = versions.sampleMetadata;
                metadataResponse.artifacts = versions.artifacts;

                serviceLogger.info('getMetadata -> fetchPrototypebyProjectId() successful, returning metadataResponse');

                return deferred.resolve(metadataResponse);
            }
        }
        else {
            serviceLogger.warn('getMetadata -> fetchPrototypebyProjectId() failed -> no prototype found');
            return deferred.resolve({});
        }
    }).catch(function (err) {
        serviceLogger.error('getMetadata -> fetchPrototypebyProjectId() failed', err);
        return deferred.reject(logError('SWPE008', err));
    });
    return deferred.promise;
};

/**
 * process the metadata Array and update or create prototype.
 * @param projectId
 * @param metadataArray - Array of initial Metadata Object
 * [{
 * model : mongoose model,
 * type :  [appMetadata,pageMetadata,dataModelMetadata,sampleMetadata],
 * OP : [CREATE,UPDATE,DELETE]
 * }]
 * @param created_by
 * @param thumbnails all the files associated with version of prototype
 * @returns 'OK'
 */

PrototypeService.prototype.processPrototype = function (projectId, metadataArray, created_by, thumbnails) {
    serviceLogger.info({
        projectId: projectId
    }, '>> processPrototype');
    var deferred = Promise.defer();
    fetchPrototypebyProjectId(projectId).then(function (prototype) {
        if (prototype) {
            // if existing prototype then update.
            PrototypeService.prototype.doMetadata(prototype, projectId, metadataArray, created_by, thumbnails)
                .then(deferred.resolve)
                .catch(deferred.reject);
        }
        else {
            // no prototype found then create a prototype.
            PrototypeService.prototype.createPrototype(projectId, metadataArray, created_by, thumbnails)
                .then(deferred.resolve)
                .catch(deferred.reject);
        }
    }).catch(function (err) {
        serviceLogger.error('processPrototype -> fetchPrototypebyProjectId() failed', err);
        return deferred.reject(logError('SWPE006', err));
    });
    return deferred.promise;
};


/**
 * marks a version of prototype as invalid
 *
 * @param projectId
 * @param versionToBeInvalidated
 */
PrototypeService.prototype.invalidatePrototypeVersion = function (projectId, versionToBeInvalidated) {
    serviceLogger.info({
        projectId: projectId
    }, '>> invalidatePrototypeVersion');
    var deferred = Promise.defer();
    fetchPrototypebyProjectId(projectId)
        .then(function (prototype) {
            // find the version
            var version;
            if (versionToBeInvalidated) {
                version = prototype.versions[versionToBeInvalidated];
            }
            else {
                version = prototype.versions[prototype.versions.length - 1];
            }

            // mark it as invalid
            if (!_.isEmpty(version)) {
                version.isInvalid = true;
            }
            else {
                serviceLogger.error('invalidatePrototypeVersion -> there is no version of Prototype found, this could be during createPrototype happen !');
                return deferred.reject(logError('SWPE030'));
            }

            // save it!
            Prototype.findByIdAndUpdate(
                prototype._id.toString(),
                {$set: {versions: version}},
                {safe: true, upsert: true},
                function (err) {
                    if (err) {
                        serviceLogger.error('invalidatePrototypeVersion -> Prototype.findByIdAndUpdate() failed', err);
                        deferred.reject(logError('SWPE007', err));
                    }
                    else {
                        serviceLogger.info({projectId: projectId}, commonMessage.prototype.success.SWPS002);
                        deferred.resolve({status: 'OK'});
                    }
                });
        })
        .catch(function (err) {
            serviceLogger.error('invalidatePrototypeVersion -> fetchPrototypebyProjectId() failed', err);
            return deferred.reject(logError('SWPE006', err));
        });

    return deferred.promise;
};

PrototypeService.prototype.checkLock = function (projectId, sessionId) {
    var deferred = Promise.defer();
    PrototypeLock.find({projectId: projectId}, function (err, docs) {
        if (err) {
            deferred.reject(logError('SWPE034', err));
        }
        else {
            if (_.isEmpty(docs)) {
                deferred.resolve({exists: false});
            }
            else {
                deferred.resolve({exists: true, sameSession: (docs[0].sessionId === sessionId),
                    userId: docs[0].userId.toString()});
            }
        }

    });

    return deferred.promise;
};

/*
 Returns false if lock for session doesn’t exists and
 Returns true if lock for session exists.
*/

PrototypeService.prototype.checkLockForSession = function (projectId, sessionId) {
    var deferred = Promise.defer();
    PrototypeLock.find({projectId: projectId, sessionId: sessionId}, function (err, docs) {
            if (err) {
                deferred.reject(logError('SWPE034', err));
            }
            else {
                if (_.isEmpty(docs)) {
                    deferred.resolve(false);
                }
                else {
                    deferred.resolve(true);
                }
            }

        });

    return deferred.promise;
};

/*
 Creates lock if no lock exists
 Returns {'success': true} if lock gets created or if your session already has the lock and
 Returns {'success': false, 'userId': <user who has the lock>} if some other session has the lock.
 */

PrototypeService.prototype.createLock = function (projectId, sessionId, userId) {
    var deferred = Promise.defer();

    var prototypeLock = new PrototypeLock();

    prototypeLock.projectId = projectId;
    prototypeLock.sessionId = sessionId;
    prototypeLock.userId = userId;
    prototypeLock._id = commonServer.utils.shardkey();
    prototypeLock.lastModifedAt = Date.now();

    prototypeLock.save(function (saveErr) {
        if (saveErr) {
            PrototypeLock.find({projectId: projectId}
                , function (err, docs) {
                    if (err) {
                        deferred.reject(logError('SWPE031', err));
                    }
                    else {
                        if (_.isEmpty(docs)) {
                            deferred.reject(logError('SWPE031', saveErr));
                        }
                        else {
                            if (docs[0].sessionId === sessionId) {
                                deferred.resolve({success: true});
                            }
                            else {
                                deferred.resolve({success: false, userId: docs[0].userId.toString()});
                            }
                        }
                    }
                });
        }
        else {
            deferred.resolve({success: true});
        }
    });

    return deferred.promise;
};

/*
Deletes lock if your session has lock
Returns {'success': true} if you have the lock and it got deleted or if no lock exists
Returns {'success’: false, 'userId': <user who has the lock>} if some other session has the lock.

 */

PrototypeService.prototype.deleteLock = function (projectId, sessionId) {
    var deferred = Promise.defer();

    PrototypeLock.find({projectId: projectId}, function (err, docs) {
        if (err) {
            deferred.reject(logError('SWPE032', err));
        }
        else {
            if (_.isEmpty(docs)) {
                deferred.resolve({success: true});
            }
            else {
                if (docs[0].sessionId === sessionId) {

                    PrototypeLock.find({projectId: projectId}).remove(function (errRemove) {
                        if (errRemove) {
                            deferred.reject(logError('SWPE032', errRemove));
                        }
                        else {
                            deferred.resolve({success: true});
                        }
                    });
                }
                else {
                    deferred.resolve({success: false, userId: docs[0].userId.toString()});
                }
            }
        }
    });

    return deferred.promise;

};

/*
Updates time in lock to current time if lock exists
*/

PrototypeService.prototype.updateTimeInLock = function (projectId) {
    var deferred = Promise.defer();

    // TODO - Add session ID once doMetadata is passed session info

    PrototypeLock.update({projectId: projectId}, {lastModifedAt: Date.now()}, function (err) {
        if (err) {
            deferred.reject(logError('SWPE033', err));
        }
        else {
            deferred.resolve({success: true});
        }

    });

    return deferred.promise;
};

/**
 * Makes required checks before processing an object
 *
 * @param projectId
 * @param sessionId
 * @param userId
 * @returns - 'true' if there are required locks for the user
 *          - 'false' if other user has locked the project
 */
PrototypeService.prototype.canProcessProject = function (projectId, sessionId) {
    var deferred = Promise.defer();

    PrototypeService.prototype.fetchPrototypebyProjectId(projectId).then(function (prototype) {
        if (!prototype) {
            return deferred.resolve(true);
        }
        else {
            PrototypeService.prototype.checkLockForSession(projectId, sessionId).then(function (lockExists) {
                if (lockExists) {
                    return deferred.resolve(true);
                }
                else {
                    return deferred.resolve(false);
                }
            });
        }
    });

    return deferred.promise;
};

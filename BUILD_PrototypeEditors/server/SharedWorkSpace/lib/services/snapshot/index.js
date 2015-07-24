'use strict';

var commonServer = require('norman-common-server'),
    commonMessage = require('./../common/common.message.js'),
    constants = require('./../../../constants'),
    NormanError = commonServer.NormanError,
    registry = commonServer.registry,
    tp = commonServer.tp,
    _ = tp.lodash,
    Promise = require('norman-promise'),
    queryString = require('querystring'),
    urlSeparator = '/';

var serviceLogger = commonServer.logging.createLogger('snapshot-service');

function SnapshotService() {

}

module.exports = SnapshotService;

SnapshotService.prototype.initialize = function (done) {
    done();
};

/**
 * Shutdown service
 * @param done
 */
SnapshotService.prototype.shutdown = function (done) {
    done();
};

SnapshotService.prototype.onInitialized = function (done) {
    done();
};

var logError = function (code, err) {
    var error = new NormanError(commonMessage.error[code] + err, code);
    serviceLogger.error(error);
    return error;
};


function getLastSnapshot(versions) {
    var latest = 0;
    versions.forEach(function (version) {
        if (parseInt(version.snapshot.version, 10) > latest) {
            latest = version.snapshot.version;
        }
    });
    return latest;
}

function getLatestVersionAndSnapshotVersion(projectId, prototype) {
    var deferred = Promise.defer();

    var versions = prototype.versions;
    // Get latest version
    var latestVersionIndex = versions.length - 1;
    var latestVersion = versions[latestVersionIndex];
    var snapshotVersion;

    // Get latest snapshot version
    var PrototypeService = registry.getModule('PrototypeService');
    PrototypeService.getVersionsbyMatchingProperty(projectId, 'isSnapshot', true)
        .then(function (prototypeSnapshotVersions) {
            var lastSnapshotVersion = 0;
            if (!_.isEmpty(prototypeSnapshotVersions)) {
                lastSnapshotVersion = getLastSnapshot(prototypeSnapshotVersions);
            }
            snapshotVersion = ++lastSnapshotVersion; // Increment the snapshot version
            var response = {latestVersion: latestVersion, snapshotVersion: snapshotVersion};
            serviceLogger.info({
                projectId: projectId,
                version: latestVersion.version,
                snapshotVersion: snapshotVersion
            }, commonMessage.success.SWS020);
            deferred.resolve(response);
        })
        .catch(function (err) {
            deferred.reject(logError('SWE020', err));
        });
    return deferred.promise;
}

function updateVersion(projectId, prototype, snapshotDesc, createdBy) {
    var deferred = Promise.defer();
    var PrototypeService = registry.getModule('PrototypeService');
    getLatestVersionAndSnapshotVersion(projectId, prototype)
        .then(function (result) {
            var latestVersion = result.latestVersion;
            var snapshotVersion = result.snapshotVersion;

            // Build response
            var response = {};
            response.prototypeVersion = latestVersion.version;

            // Check if latest version is already a snapshot
            if (!latestVersion.isSnapshot) {
                latestVersion.snapshot.version = snapshotVersion;
                latestVersion.snapshot.snapshotDesc = snapshotDesc;
                latestVersion.snapshot.stats.created_at = new Date();
                latestVersion.snapshot.stats.created_by = createdBy;
                latestVersion.isSnapshot = true;

                prototype.markModified('versions');
                prototype.save(function (err) {
                    if (err) {
                        deferred.reject(logError('SWE009', err));
                    }
                    else {
                        PrototypeService.updateTimeInLock(projectId).then(function () {
                            response.snapshotVersion = snapshotVersion;
                            response.description = snapshotDesc;
                            response.created_at = latestVersion.snapshot.stats.created_at;
                            response.created_by = latestVersion.snapshot.stats.created_by;
                            serviceLogger.info({
                                projectId: projectId,
                                version: latestVersion.version,
                                snapshotVersion: snapshotVersion
                            }, commonMessage.success.SWS018);
                            deferred.resolve(response);
                        });
                    }
                });
            }
            else {
                response.snapshotVersion = latestVersion.snapshot.version;
                response.description = latestVersion.snapshot.snapshotDesc;
                response.created_at = latestVersion.snapshot.stats.created_at;
                response.created_by = latestVersion.snapshot.stats.created_by;
                serviceLogger.info({
                    projectId: projectId,
                    version: latestVersion.version,
                    snapshotVersion: snapshotVersion
                }, commonMessage.success.SWS019);
                deferred.resolve(response);
            }
        });
    return deferred.promise;

}

function updateSnapshotVersion(projectId, snapshotDesc, createdBy) {
    var deferred = Promise.defer();
    var PrototypeService = registry.getModule('PrototypeService');
    PrototypeService.getPrototype(projectId, null, true).then(function (prototype) {
        updateVersion(projectId, prototype, snapshotDesc, createdBy)
            .then(function (response) {
                serviceLogger.info({
                    projectId: projectId,
                    snapshotVersion: response.snapshotVersion
                }, commonMessage.success.SWS007);
                deferred.resolve(response);
            }).catch(function (err) {
                deferred.reject(logError('SWE009', err));
            });
    });
    return deferred.promise;
}

function getAppMetadata(projectId) {
    var deferred = Promise.defer();
    var prototypeService = registry.getModule('PrototypeService');
    prototypeService.getMetadata(projectId, [constants.appMetadata]).then(function (response) {
        deferred.resolve(response.appMetadata);
    }).catch(function (err) {
        if (err.code === 'SWE001') {
            // no prototype exists for this project - unable to find any metadata
            deferred.resolve();
        }
        else {
            deferred.reject(logError('SWE022', err));
        }
    });
    return deferred.promise;
}

function addArtifact(artifact) {
    var deferred = Promise.defer();
    var currentArtifact = {};
    var ArtifactService = registry.getModule('ArtifactService');
    ArtifactService.getArtifactReadStream(artifact._id)
        .then(function (readstream) {
            currentArtifact.filename = artifact.filename;
            currentArtifact.fullpath = artifact.metadata.path;
            currentArtifact.content = readstream;
            // switch to paused mode to preserve stream for later use
            currentArtifact.content.pause();
            deferred.resolve(currentArtifact);
        });
    return deferred.promise;
}

function processArtifacts(artifacts) {
    var deferred = Promise.defer();
    var promises = [];
    artifacts.forEach(function (artifact) {
        promises.push(addArtifact(artifact));
    });
    Promise.all(promises).then(function (artifactsArray) {
        deferred.resolve(artifactsArray);
    }, function (err) {
        var error = new NormanError(commonMessage.error.SWE036 + err, 'SWE036');
        serviceLogger.error(error);
        deferred.reject(error);
    });
    return deferred.promise;
}

SnapshotService.prototype.getAllArtifactsForDeployment = function (projectId, latestVersion) {
    var deferred = Promise.defer();
    var ArtifactService = registry.getModule('ArtifactService');
    var metadata = {
        'metadata.projectId': projectId,
        'metadata.snapshotVersion': parseInt(latestVersion, 10)
    };
    ArtifactService.getArtifactByMetadata(metadata)
        .then(function (artifacts) {
            return processArtifacts(artifacts);
        }).then(function (artifactsArray) {
            serviceLogger.info({projectId: projectId, version: latestVersion}, commonMessage.success.SWE025);
            deferred.resolve(artifactsArray);
        });
    return deferred.promise;
};

function fetchActualVersion(projectId, latestVersion) {
    var deferred = Promise.defer();

    if (latestVersion === 'latest') {
        //query the actual version snapshot version number
        var PrototypeService = registry.getModule('PrototypeService');
        PrototypeService.getVersionsbyMatchingProperty(projectId, 'isSnapshot', true)
            .then(function (prototypeSnapshotVersions) {
                var latest = prototypeSnapshotVersions[prototypeSnapshotVersions.length - 1];
                deferred.resolve(latest.snapshot.version);
            })
            .catch(function (err) {
                deferred.reject(logError('SWE021', err));
            });
    } else {
        deferred.resolve(latestVersion);
    }

    return deferred.promise;
}

SnapshotService.prototype.getArtifactForSnapshot = function (projectId, latestVersion, path) {
    var deferred = Promise.defer();

    fetchActualVersion(projectId, latestVersion)
        .then(function (version) {
            var latestSnapshotVersion = version;

            var ArtifactService = registry.getModule('ArtifactService');
            var metadata = {
                'metadata.projectId': projectId,
                'metadata.path': queryString.unescape(path),
                'metadata.snapshotVersion': parseInt(latestSnapshotVersion, 10)
            };
            ArtifactService.getArtifactByMetadata(metadata)
                .then(function (artifacts) {
                    if (!_.isEmpty(artifacts)) {
                        ArtifactService.getArtifactReadStream(artifacts[0]._id.toString())
                            .then(function (readStream) {
                                deferred.resolve({
                                    filename: artifacts[0].filename,
                                    contentType: artifacts[0].contentType,
                                    fullpath: artifacts[0].metadata.path,
                                    readStream: readStream
                                });
                            });
                    } else {
                        deferred.resolve(null);
                    }
                });
        })
        .catch(function (err) {
            deferred.reject(logError('SWE020', err));
        });

    return deferred.promise;
};

SnapshotService.prototype.createSnapshot = function (projectId, snapshotDesc, createdBy) {
    var deferred = Promise.defer();
    var resultJson = {projectId: projectId};
    // [1] update snapshot number in Prototype
    updateSnapshotVersion(projectId, snapshotDesc, createdBy)
        .then(function (snaprecord) {
            resultJson.snapshotVersion = snaprecord.snapshotVersion;
            resultJson.snapshotDesc = snaprecord.description;
            resultJson.prototypeVersion = snaprecord.prototypeVersion;
            resultJson.created_by = snaprecord.created_by;
            resultJson.created_at = snaprecord.created_at;
            // [2] get Metadata info
            var ArtifactService = registry.getModule('ArtifactService');
            ArtifactService.getArtifactByMetadata({'metadata.projectId': projectId}).then(function (artifactToSnapshot) {
                var promises = [];

                artifactToSnapshot = _.uniq(artifactToSnapshot, function (artifact) {
                    return artifact.metadata.path;
                });

                _.each(artifactToSnapshot, function (artifact) {
                    var oldMetadata = artifact.metadata;

                    if (oldMetadata.snapshotVersion == null) {
                        promises.push(ArtifactService.copyArtifacts(artifact));
                    }

                    artifact.metadata = {
                        projectId: projectId,
                        path: artifact.metadata.path,
                        snapshotVersion: parseInt(snaprecord.snapshotVersion, 10)
                    };
                });
                Promise.all(promises).then(function () {
                    var PrototypeService = registry.getModule('PrototypeService');
                    PrototypeService.getMetadata(projectId, ['appMetadata', 'pageMetadata'])
                        .then(function (response) {
                            resultJson.snapshotMetadata = response;
                            var artifactsIds = [];
                            var snapshotVersion = parseInt(resultJson.snapshotVersion, 10);
                            response.artifacts.forEach(function (artifact) {
                                artifactsIds.push(artifact.id.toString());
                            });
                            ArtifactService.updateMetadata(artifactsIds, {'metadata.snapshotVersion': snapshotVersion})
                                .then(function () {
                                    serviceLogger.info({
                                        projectId: projectId,
                                        snapshotVersion: resultJson.snapshotVersion
                                    }, commonMessage.success.SWS017);
                                    deferred.resolve(resultJson);
                                });
                        })
                        .catch(function (err) {
                            deferred.reject(logError('SWE019', err));
                        });
                }).catch(function (err) {
                    deferred.reject(logError('SWE019', err));
                });
            }).catch(function (err) {
                deferred.reject(logError('SWE019', err));
            });
        })
        .catch(function (err) {
            deferred.reject(logError('SWE010', err));
        });
    return deferred.promise;
};

SnapshotService.prototype.saveSnapshotUrl = function (projectId, snapshotVersion, snapshotUrl, isLatestSnapshot, snapshotConfiguration) {
    var deferred = Promise.defer();
    var result = {};
    var PrototypeService = registry.getModule('PrototypeService');
    PrototypeService.getPrototype(projectId, null, true).then(function (prototype) {
        var versions = prototype.versions;
        // Get latest version
        var latestVersionIndex = versions.length - 1;
        var latestVersion = versions[latestVersionIndex];
        // Update snapshot Url
        var latestSnapshotVersion;
        PrototypeService.getVersionsbyMatchingProperty(projectId, 'isSnapshot', true)
            .then(function (prototypeSnapshotVersions) {
                var latest = prototypeSnapshotVersions[prototypeSnapshotVersions.length - 1];
                latestSnapshotVersion = latest.snapshot.version;
                var urlToSave = snapshotUrl.replace('latest', latestSnapshotVersion);

                // Building response for return with deep links
                var deepLinks = [];

                getAppMetadata(projectId)
                    .then(function (appMetadata) {
                        var firstPage = true;
                        appMetadata.pages.forEach(function (page) {
                            var pageName = page.name;
                            var snapshotUrlParts = urlToSave.split(urlSeparator + 'index');
                            var thumbnail = snapshotUrlParts[0] + urlSeparator + page.thumbnailUrl;
                            var pageUrl;
                            if (!appMetadata.isSmartApp) {
                                if (page.pageUrl.charAt(0) === urlSeparator) {     // We don't want to add unnecessary slashes
                                    pageUrl = snapshotUrlParts[0] + page.pageUrl;
                                }
                                else {
                                    pageUrl = snapshotUrlParts[0] + urlSeparator + page.pageUrl;
                                }
                            }
                            else {
                                pageUrl = snapshotUrlParts[0] + '/index.html';
                                if (firstPage) {
                                    firstPage = false;
                                }
                                else {
                                    var snapshotPage = _.find(snapshotConfiguration.pages[0].pages, function (configurationPage) {
                                        return configurationPage.pageName === page.name;
                                    });
                                    if (snapshotPage) {
                                        pageUrl += '#/' + snapshotPage.entitySet + '(' + snapshotPage.defaultContext + ')';
                                    }
                                }
                            }
                            deepLinks.push({pageName: pageName, thumbnail: thumbnail, pageUrl: pageUrl});
                        });
                        // snapshot url should be the url of the first page by default
                        latestVersion.snapshot.snapshotUrl = deepLinks[0].pageUrl;
                        latestVersion.snapshot.snapshotUILang = appMetadata.uiLang;
                        latestVersion.snapshot.isSmartApp = appMetadata.isSmartApp;

                        latestVersion.snapshot.deepLinks = deepLinks;
                        prototype.markModified('versions');
                        prototype.save(function (err) {
                            if (err) {
                                deferred.reject(logError('SWE021', err));
                            }
                            else {
                                PrototypeService.updateTimeInLock(projectId).then(function () {
                                    serviceLogger.info({
                                        projectId: projectId,
                                        snapshotVersion: snapshotVersion,
                                        snapshotUrl: latestVersion.snapshot.snapshotUrl
                                    }, commonMessage.success.SWS021);
                                    result.deepLinks = deepLinks;
                                    result.snapshotUILang = appMetadata.uiLang;
                                    if (isLatestSnapshot) {
                                        result.finalSnapshotUrl = latestVersion.snapshot.snapshotUrl
                                            .replace(urlSeparator + latestSnapshotVersion + urlSeparator, urlSeparator + 'latest' + urlSeparator);
                                    }
                                    else {
                                        result.finalSnapshotUrl = latestVersion.snapshot.snapshotUrl;
                                    }
                                    serviceLogger.info({
                                        projectId: projectId,
                                        snapshotVersion: snapshotVersion,
                                        snapshotUrl: result.finalSnapshotUrl,
                                        isLatest: isLatestSnapshot
                                    }, commonMessage.success.SWS024);
                                    deferred.resolve(result);
                                });
                            }
                        });
                    })
                    .catch(function (err) {
                        deferred.reject(logError('SWE023', err));
                    });

            })
            .catch(function (err) {
                deferred.reject(logError('SWE021', err));
            });

    });
    return deferred.promise;
};

SnapshotService.prototype.getSnapshots = function (projectId, snapshotVersion) {
    var deferred = Promise.defer();

    // Get all snapshot version
    var PrototypeService = registry.getModule('PrototypeService');
    PrototypeService.getVersionsbyMatchingProperty(projectId, 'isSnapshot', true)
        .then(function (prototypeSnapshotVersions) {
            var snapshots = [];
            // var response = { projectId : projectId, snapshots : snapshots};
            if (snapshotVersion === undefined) {   // retrieve all snapshots
                prototypeSnapshotVersions.forEach(function (version) {
                    snapshots.push(version.snapshot);
                });
                serviceLogger.info({projectId: projectId}, commonMessage.success.SWS022);
                deferred.resolve(snapshots);
            }
            else {    // retrieve only requested snapshot
                if (snapshotVersion === 'latest') {
                    if (prototypeSnapshotVersions.length === 0) {
                        deferred.resolve({existing: false});
                    }
                    else {
                        var latestSnapshotVersion = prototypeSnapshotVersions[prototypeSnapshotVersions.length - 1];
                        // replacing actual version number with 'latest' for getting latest snapshot version
                        latestSnapshotVersion.snapshot.snapshotUrl = latestSnapshotVersion.snapshot.snapshotUrl
                            .replace(urlSeparator + latestSnapshotVersion.snapshot.version + urlSeparator, urlSeparator + 'latest' + urlSeparator);
                        var latestSnapshotObject = latestSnapshotVersion.snapshot.toObject();
                        latestSnapshotObject.existing = true;
                        serviceLogger.info({projectId: projectId}, commonMessage.success.SWS022);
                        deferred.resolve(latestSnapshotObject);
                    }
                }
                else {
                    prototypeSnapshotVersions.forEach(function (version) {
                        if (version.snapshot.version === snapshotVersion) {
                            snapshots.push(version.snapshot);
                            serviceLogger.info({projectId: projectId}, commonMessage.success.SWS022);
                            deferred.resolve(snapshots);
                        }

                    });
                }
            }
        })
        .catch(function (err) {
            deferred.reject(logError('SWE026', err));
        });
    return deferred.promise;
};

SnapshotService.prototype.getSnapshot = function (projectId, snapshotVersion) {
    var deferred = Promise.defer();
    var snapshotDetail;
    if (snapshotVersion === undefined) {
        deferred.reject('Missing snapshotVersion');
    }
    // Get all snapshot version
    var PrototypeService = registry.getModule('PrototypeService');
    PrototypeService.getVersionsbyMatchingProperty(projectId, 'isSnapshot', true)
        .then(function (prototypeSnapshotVersions) {
            if (snapshotVersion === 'latest' && prototypeSnapshotVersions.length !== 0) {
                var latestSnapshotVersion = prototypeSnapshotVersions[prototypeSnapshotVersions.length - 1];
                // replacing actual version number with 'latest' for getting latest snapshot version
                latestSnapshotVersion.snapshot.snapshotUrl = latestSnapshotVersion.snapshot.snapshotUrl
                    .replace(urlSeparator + latestSnapshotVersion.snapshot.version + urlSeparator, urlSeparator + 'latest' + urlSeparator);
                snapshotDetail = latestSnapshotVersion;
            }
            else {
                snapshotDetail = _.find(prototypeSnapshotVersions, function (version) {
                    return (version.snapshot.version === snapshotVersion);
                });
            }
            if (!snapshotDetail) {
                deferred.reject('Snapshot doesn\'t exist');
            }
            else {
                deferred.resolve(snapshotDetail.snapshot);
            }
        })
        .catch(function (err) {
            deferred.reject(logError('SWE026', err));
        });
    return deferred.promise;
};
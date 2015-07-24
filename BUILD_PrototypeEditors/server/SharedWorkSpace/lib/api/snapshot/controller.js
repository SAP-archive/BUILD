'use strict';

var commonServer = require('norman-common-server');
var commonMessage = require('./../common/common.message.js');
var serviceLogger = commonServer.logging.createLogger('snapshot controller');
var NormanError = commonServer.NormanError;
var registry = commonServer.registry;
var snapshotConfig = require('./../../../config/snapshot.config.js');
var queryString = require('querystring');
var fs = require('fs');
var url = require('url');

var Promise = require('norman-promise');

var controller = {};
module.exports = controller;

var tp = commonServer.tp,
    _ = tp.lodash;

// Creates a new prototype in the DB.
controller.create = function (req, res) {
    var projectId = req.originalUrl.split('/')[3];
    var snapshotDesc = req.body.snapshotDesc;
    //latest link will be retrieved by default
    var isLatestSnapshot = true;
    if (!_.isUndefined(req.body.latest)) {
        isLatestSnapshot = req.body.latest;
    }
    var createdBy = req.user._id.toString();

    var resultJson = {};
    var snapshotConfiguration;
    var SnapshotService = registry.getModule('SnapshotService');
    var PrototypeService = registry.getModule('PrototypeService');
    // Check for session lock before creating snapshot
    PrototypeService.canProcessProject(projectId, req.context.session.id, req.user._id.toString()).then(function (allowProcessing) {
        if (allowProcessing) {
            // [1] SharedWorkspace.createSnapshot(projectId): update the current version as a snapshot, returns complete snapshot version ( appMetadata, pageMetadata, etc...)
            SnapshotService.createSnapshot(projectId, snapshotDesc, createdBy)
                .then(function (result) {
                    resultJson = result;
                    // [2] calls PrototypeBuilder to generate Code [ passing resultJson.snapshotMetadata ]
                    return generateSnapshotFiles(projectId, resultJson);
                }).catch(function (err) {
                    res.status(404).json(new NormanError(commonMessage.error.SWE007 + err, 'SWE007'));
                }).then(function (snapshotConfigurationResult) {
                    snapshotConfiguration = snapshotConfigurationResult;
                    resultJson.snapshotMetadata = undefined;

                    // var snapshotUrl = '/deploy/public/' + projectId + '/latest/index.html';
                    var snapshotUrl = '/api/projects/' + projectId + '/prototype/snapshot/latest/index.html';

                    // [4] Update the snapshot URL info back in SharedWorkspace [passing ProjectID, snapshotVersion]
                    SnapshotService.saveSnapshotUrl(projectId, resultJson.snapshotVersion, snapshotUrl, isLatestSnapshot, snapshotConfiguration)
                        .then(function (result) {
                            resultJson.deepLinks = result.deepLinks;
                            resultJson.snapshotUrl = result.finalSnapshotUrl;
                            resultJson.snapshotUILang = result.snapshotUILang;
                            res.status(200).json(resultJson);
                        })
                        .catch(function (err) {
                            res.status(500).json(new NormanError(commonMessage.error.SWE005 + err, 'SWE005'));
                        });
                }).catch(function (err) {
                    res.status(500).json(new NormanError(commonMessage.error.SWE006 + err, 'SWE006'));
                });
        }
        else {
            return res.status(500).json(new NormanError(commonMessage.error.SWE009, 'SWE009'));
        }
    }).catch(function (err) {
        res.status(404).json(new NormanError(commonMessage.error.SWE007 + err, 'SWE007'));
    });
};

// Get list of snapshots
controller.show = function (req, res) {
    var projectId = req.originalUrl.split('/')[3];
    //var snapshotVersion = (req.originalUrl.split('?')[1]).split('=')[1];
    var snapshotVersion = req.query.version;
    var SnapshotService = registry.getModule('SnapshotService');
    SnapshotService.getSnapshots(projectId, snapshotVersion)
        .then(function (result) {
            res.status(200).json(result);
        })
        .catch(function (err) {
            res.status(404).json(new NormanError(commonMessage.error.SWE008 + err, 'SWE008'));
        });
};

// Get the content of a file
controller.getSnapshotArtifact = function (req, res) {
    var projectId = req.originalUrl.split('/')[3];
    var snapshotVersion = req.originalUrl.split('/')[6];

    var SnapshotService = registry.getModule('SnapshotService');
    SnapshotService.getArtifactForSnapshot(projectId, snapshotVersion, extractPath(req.originalUrl, snapshotVersion))
        .then(function (data) {
            if (data && data.readStream) {
                res.header('Content-type', data.contentType);
                res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
                res.header('Pragma', 'no-cache');
                res.header('Expires', 0);
                data.readStream.pipe(res);
            }
            else {
                res.status(404).json();
            }
        })
        .catch(function (err) {
            res.status(404).json(new NormanError(commonMessage.error.SWE010 + err, 'SWE010'));
        });
};

function generateSnapshotFiles(projectId, resultJson) {

    var deferred = Promise.defer();

    var snapshotMetadata = resultJson.snapshotMetadata;
    var pages = [];
    for (var i = 0; i < snapshotMetadata.pageMetadata.length; i++) {
        pages.push(snapshotMetadata.pageMetadata[i].toJSON());
    }

    //check if anything to generate - HTML prototype will not have any metadata

    if (!_.isEmpty(pages)) {
        var prototypeBuilderService = registry.getModule('PrototypeBuilder');
        prototypeBuilderService.generateSnapshot(projectId, resultJson.snapshotVersion, pages, snapshotMetadata.appMetadata.toJSON()).then(function (result) {
            deferred.resolve(result);
        })
            .catch(function (err) {
                var error = new NormanError('Failed to generate Prototype Metadata ' + err);
                deferred.reject(error);
            });
    }
    else {
        deferred.resolve(null);
    }
    return deferred.promise;

}

/**
 * Retrieves zipped snapshot content.
 * @param {http.IncomingMessage}  req - http request
 * @param res
 * @returns {zip} snapshotZip
 */
controller.retrieveZippedSnapshot = function (req, res) {
    var projectId = req.originalUrl.split('/')[3];
    var snapshotVersion = req.query.version;
    var isStream = req.query.stream ? JSON.parse(req.query.stream) === true : false;

    var PrototypeService = registry.getModule('PrototypeService');
    var DeployService = registry.getModule('DeployService');
    var SnapshotService = registry.getModule('SnapshotService');
    var version;

    // validate input!!
    if (_.isEmpty(projectId)) {
        return res.status(500).json(new NormanError(commonMessage.error.SWE013, 'SWE013'));
    }
    //****************************
    //1. Get the latest version of snapshot
    //2. Get all the files path in the snapshot as an array
    //3. Write the files into a temp folder
    //4. Pack the folder contents as zip(DeployService.retrieveZippedSnapshotContent) - returns zip contents + temp snapshot folder path
    //5. Remove temp snapshot folder and return the zip
    //***************************
    PrototypeService.getPrototype(projectId, null, false).then(function (prototype) {
        var getAllFilesForSnapshot = function (latestVersion) {
            version = latestVersion;
            return SnapshotService.getAllArtifactsForDeployment(projectId, version);
        };
        var writeFilesIntoTemp = function (artifactsArray) {
            return DeployService.deploySnapshot(projectId, version, artifactsArray);
        };
        var createZipOfFiles = function () {
            return DeployService.retrieveZippedSnapshotContent(projectId, version, isStream);
        };
        var deleteFilesAfterZip = function (result) {
            //result[0] - zip file contents
            //result[1] - temp directory to be deleted
            //check if result is empty or has two items
            if (result !== null) {
                if (result.length === 2) {
                    deleteFolderRecursive(result[1])
                        .then(function () {
                            res.writeHead(200, {
                                'Content-Type': snapshotConfig.snapshotZipContentType,
                                'Content-Length': result[0].length,
                                'Content-Disposition': snapshotConfig.snapshotZipContentDisposition + '; filename=' + snapshotConfig.snapshotZipBaseFilename + projectId + snapshotConfig.snapshotZipExtension
                            });
                            res.write(result[0]);
                            res.end();
                        }, function (error) {
                            res.status(500).json(new NormanError(commonMessage.error.SWE012, 'SWE012', error));
                        }); }}
            else {
                res.status(404).json(new NormanError(commonMessage.error.SWE012, 'SWE012'));
            }
        };

        if (prototype !== undefined) {
            provideSnapshotVersionForZipContent(projectId, snapshotVersion)
                    .then(getAllFilesForSnapshot)
                    .then(writeFilesIntoTemp)
                    .then(createZipOfFiles)
                    .then(deleteFilesAfterZip)
                    .catch(function (error) {
                        res.status(500).json(error);
                    });
            }
            else {
                res.status(404).json(new NormanError(commonMessage.error.SWE004, 'SWE004'));
            }
        });
};

function provideSnapshotVersionForZipContent(projectId, snapshotVersion) {
    var deferred = Promise.defer();
    if (snapshotVersion !== undefined) {
        if (isNaN(parseInt(snapshotVersion, 10))) {
            var error = new NormanError(commonMessage.error.SWE002, 'SWE002');
            serviceLogger.error({
                projectId: projectId,
                version: snapshotVersion
            }, error);
            deferred.reject(error);
        }
        else {
            serviceLogger.info({projectId: projectId, version: snapshotVersion}, commonMessage.success.SWS001);
            deferred.resolve(snapshotVersion);
        }
    }
    else {
        var latestSnapshotVersion;
        var PrototypeService = registry.getModule('PrototypeService');
        PrototypeService.getVersionsbyMatchingProperty(projectId, 'isSnapshot', true)
            .then(function (prototypeSnapshotVersions) {
                var latest = prototypeSnapshotVersions[prototypeSnapshotVersions.length - 1];
                latestSnapshotVersion = latest.snapshot.version;
                serviceLogger.info({
                    projectId: projectId,
                    version: latestSnapshotVersion
                }, commonMessage.success.SWS002);
                deferred.resolve(latestSnapshotVersion);
            })
            .catch(function (err) {
                var e = new NormanError(commonMessage.error.SWE003 + err, 'SWE003');
                serviceLogger.error({
                    projectId: projectId
                }, e);
                deferred.reject(e);
            });
    }
    return deferred.promise;
}

/**
 * Util to extract the path of artifact from requestURL
 * @param originalUrl
 * @param snapshotVersion
 * @returns {string} artifactPath
 */
function extractPath(originalUrl, snapshotVersion) {
    var trimmedUrl = originalUrl.trim(),
        pattern = '/' + snapshotVersion + '/',
        search = trimmedUrl.search(pattern),
        artifactPath = trimmedUrl.substring(search + pattern.length, trimmedUrl.length);

    artifactPath = url.parse(artifactPath).pathname;
    artifactPath = queryString.unescape(artifactPath);
    return artifactPath;
}

/**
 * Delete folder recursively
 * @param path - folder to be deleted
 * @returns {null} if successful
 */
var deleteFolderRecursive = function (path) {
    var deferred = Promise.defer();
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file) {
            var curPath = path + '/' + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            }
            else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path, function (error) {
            deferred.reject(new NormanError(commonMessage.error.SWE011 + err, 'SWE011', error));
        });

        deferred.resolve(null);
    } else {
        deferred.reject(new NormanError(commonMessage.error.SWE011 + err, 'SWE011'));
    }

    return deferred.promise;
};

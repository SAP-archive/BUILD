'use strict';

var commonServer = require('norman-common-server'),
    serviceLogger = commonServer.logging.createLogger('deploy service'),
    commonMessage = require('./../common/common.message.js'),
    deploymentConfig = require('./../../../config/deployment.js'),
    NormanError = commonServer.NormanError,
    Promise = require('norman-promise'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    JSZip = require('jszip'),
    rimraf = require('rimraf'),
    separator = path.sep,
    urlSeparator = '/';


function DeployService() {
}

module.exports = DeployService;

DeployService.prototype.initialize = function (done) {
    done();
};

DeployService.prototype.shutdown = function (done) {
    done();
};

DeployService.prototype.checkSchema = function (done) {
    done();
};

DeployService.prototype.onInitialized = function (done) {
    done();
};

/**
 * Creates a path (folder and subfolders).
 * @param folderPath
 * @returns true
 */
function createFolderStructure(folderPath) {
    var deferred = Promise.defer();
    fs.exists(folderPath, function (exists) {
        if (!exists) {
            mkdirp(folderPath, function (err) {
                if (err) {
                    var error = new NormanError(commonMessage.error.SWE003 + err, 'SWE003');
                    serviceLogger.error({path: folderPath}, error);
                    deferred.reject(error);
                }
                else {
                    serviceLogger.info({path: folderPath}, commonMessage.success.SWS003);
                    deferred.resolve(true);
                }
            });
        } else {
            deferred.resolve(true);
        }
    });
    return deferred.promise;
}

/**
 * Creates final path for artifact.
 * @param artifactPath
 * @param pathLoc
 * @returns path
 */
function createActualPath(artifactPath, pathLoc) {
    var folders = artifactPath.split(urlSeparator);
    folders = folders.slice(0, folders.length - 1);
    var folderPath = folders.join(separator);
    return path.join(pathLoc, separator, folderPath);
}

/**
 * Create a single artifact.
 * @param artifact
 * @param latestSnapshotFolder
 * @param pathLoc
 * @param projectId
 * @returns void
 */
function createArtifact(artifact, projectId, pathLoc, latestSnapshotFolder) {
    var deferred = Promise.defer();
    var folder = createActualPath(artifact.fullpath, pathLoc);
    var latestFolder = createActualPath(artifact.fullpath, latestSnapshotFolder);

    createFolderStructure(folder)
        .then(function (success) {
            if (success) {
                createFolderStructure(latestFolder)
                    .then(function (successful) {
                        if (successful) {

                            if (artifact.filename.indexOf('index.html') === -1) {
                                if (artifact.filename.indexOf('index-prod.html') !== -1) {
                                    artifact.filename = artifact.filename.replace('index-prod.html', 'index.html');

                                }
                            }
                            var filename = path.join(folder, separator, artifact.filename);
                            var writableStream = fs.createWriteStream(filename);
                            var latestFilename = path.join(latestFolder, separator, artifact.filename);
                            var writableStreamForLatest = fs.createWriteStream(latestFilename);
                            var readstream = artifact.content;
                            // switch to flowing mode to pipe stream into file
                            readstream.resume();
                            readstream.pipe(writableStream);
                            readstream.pipe(writableStreamForLatest);
                            serviceLogger.info({
                                filename: filename,
                                latestFilename: latestFilename
                            }, commonMessage.success.SWS004);

                            deferred.resolve();
                        } else {
                            var folderCreationError = new NormanError(commonMessage.error.SWE002, 'SWE002');
                            serviceLogger.error({filename: artifact.filename}, folderCreationError);
                            deferred.reject(folderCreationError);
                        }
                    })
                    .catch(function (err) {
                        var error = new NormanError(commonMessage.error.SWE002 + err, 'SWE002');
                        serviceLogger.error({filename: artifact.filename}, error);
                        deferred.reject(error);
                    });
            } else {
                var error = new NormanError(commonMessage.error.SWE002, 'SWE002');
                serviceLogger.error({filename: artifact.filename}, error);
                deferred.reject(error);
            }
        })
        .catch(function (err) {
            var error = new NormanError(commonMessage.error.SWE002 + err, 'SWE002');
            serviceLogger.error({filename: artifact.filename}, error);
            deferred.reject(error);
        });
    return deferred.promise;
}


/**
 * Create all the artifacts for the snapshot.
 * @param array of artifacts
 * @param projectId
 * @param pathLoc
 * @returns void
 */
function createArtifacts(artifacts, projectId, pathLoc, latestSnapshotFolder) {
    var deferred = Promise.defer();
    var promises = [];
    artifacts.forEach(function (artifact) {
        promises.push(createArtifact(artifact, projectId, pathLoc, latestSnapshotFolder));
    });
    Promise.all(promises).then(function () {
        serviceLogger.info({projectId: projectId}, commonMessage.success.SWS002);
        deferred.resolve();
    }, function (err) {
        var error = new NormanError(commonMessage.error.SWE004 + err, 'SWE004');
        serviceLogger.error({projectId: projectId}, error);
        deferred.reject(error);
    });
    return deferred.promise;
}


/**
 * Deploy latest version of prototype as a snapshot.
 * @param projectId
 * @returns json containing snapshot url
 */
DeployService.prototype.deploySnapshot = function (projectId, latestVersion, artifactsArray) {
    var deferred = Promise.defer();

    var basicLoc, pathLoc, latestSnapshotFolder;
    if (process.env.SHARED_FOLDER) {
        basicLoc = path.join(deploymentConfig.deploymentPath, separator, projectId);
        pathLoc = path.join(basicLoc, separator, latestVersion);
    } else {
        // project root folder
        var appDir = path.dirname(require.main.filename);
        basicLoc = path.join(appDir, deploymentConfig.deploymentPath, projectId);
        pathLoc = path.join(basicLoc, separator, latestVersion);
    }

    latestSnapshotFolder = path.join(basicLoc, separator, 'latest');
    rimraf(latestSnapshotFolder, function () {    // clean up latest folder
        serviceLogger.info({latestSnapshotFolder: latestSnapshotFolder}, commonMessage.success.SWS007);

        createFolderStructure(pathLoc)  // create snapshot folder for the current version
            .then(function (success) {
                if (success) {
                    createFolderStructure(latestSnapshotFolder) // create latest snapshot folder
                        .then(function (successful) {
                            if (successful) {
                                createArtifacts(artifactsArray, projectId, pathLoc, latestSnapshotFolder)
                                    .then(function () {
                                        serviceLogger.info({
                                            projectId: projectId,
                                            version: latestVersion
                                        }, commonMessage.success.SWS001);
                                        deferred.resolve({url: '/deploy/public/' + projectId + '/latest/index.html'});
                                    });
                            } else {
                                var folderCreationError = new NormanError(commonMessage.error.SWE001, 'SWE001');
                                serviceLogger.error({
                                    projectId: projectId,
                                    version: latestVersion
                                }, folderCreationError);
                                deferred.reject(folderCreationError);
                            }
                        })
                        .catch(function (err) {
                            var folderCreationError2 = new NormanError(commonMessage.error.SWE001 + err, 'SWE001');
                            serviceLogger.error({
                                projectId: projectId,
                                version: latestVersion
                            }, folderCreationError2);
                            deferred.reject(folderCreationError2);
                        });
                } else {
                    var error = new NormanError(commonMessage.error.SWE001, 'SWE001');
                    serviceLogger.error({
                        projectId: projectId,
                        version: latestVersion
                    }, error);
                    deferred.reject(error);
                }
            })
            .catch(function (err) {
                var error = new NormanError(commonMessage.error.SWE001 + err, 'SWE001');
                serviceLogger.error({
                    projectId: projectId,
                    version: latestVersion
                }, error);
                deferred.reject(error);
            });
    });
    return deferred.promise;
};

/**
 * Retrieve all files from a dir recursively.
 * @param dir
 * @param files_ (if there's a file array already existing, default will be empty array)
 * @returns Array (array of files)
 */
function getFiles(dir, files_) {
    files_ = files_ || [];
    var files = fs.readdirSync(dir);
    for (var i in files) {
        var name = dir + separator + files[i];
        if (fs.statSync(name).isDirectory()) {
            getFiles(name, files_);
        } else {
            files_.push(name);
        }
    }
    return files_;
}

/**
 * Add single file to an existing zip archive.
 * @param file (full path)
 * @param zip
 * @param splitter (full path will be split based on this to create archive path)
 * @param snapshotVersion - latest snapshot version
 * @returns void
 */
function addFileToZipArchive(file, zip, splitter, snapshotVersion) {
    var deferred = Promise.defer();
    fs.readFile(file, function (err, data) {
        if (err) {
            var error = new NormanError(commonMessage.error.SWE007, 'SWE007');
            serviceLogger.error({
                filename: file
            }, error);
            deferred.reject(error);
        }
        //if (file.indexOf('index.html') === -1 && file.indexOf('Component.js') === -1) {
        if (file.indexOf('index-webide.html') === -1 && file.indexOf('Component-webide.js') === -1) {
            if (file.indexOf('index-webide.html') !== -1) {
                file = file.replace('index-webide.html', 'index.html');

            }

            if (file.indexOf('Component-webide.js') !== -1) {
                file = file.replace('Component-webide.js', 'Component.js');

            }
            var fileNameParts = file.split(splitter + separator + snapshotVersion);
            //var fileNameInArchive = path.join(splitter, separator, fileNameParts[1]);
            var fileNameInArchive = path.join('.', separator, fileNameParts[1]);
            serviceLogger.info({filename: fileNameInArchive}, commonMessage.success.SWS006);
            zip.file(fileNameInArchive, data);
            deferred.resolve();
        } else {
            deferred.resolve();
        }

    });
    return deferred.promise;
}

/**
 * Retrieves snapshot content as a buffer archive.
 * @param projectId
 * @param snapshotVersion
 * @param isStream  (Returns buffer as a binary stream if this is set to 'true'. Else, a human readable zip file is returned)
 * @returns Buffer
 */
DeployService.prototype.retrieveZippedSnapshotContent = function (projectId, snapshotVersion, isStream) {
    var deferred = Promise.defer();

    var snapshotPath;
    var basePath;
    if (process.env.SHARED_FOLDER) {
        basePath = path.join(deploymentConfig.deploymentPath, separator, projectId);
        snapshotPath = path.join(basePath, separator, snapshotVersion);

    } else {
        // project root folder
        var appDir = path.dirname(require.main.filename);
        basePath = path.join(appDir, deploymentConfig.deploymentPath, projectId);
        snapshotPath = path.join(basePath, separator, snapshotVersion);

    }

    fs.exists(snapshotPath, function (exists) {
        if (exists) {
            var zip = new JSZip();

            // get all files from snapshot folder
            var files = getFiles(snapshotPath);
            var promises = [];

            // looping through files and adding them to the archive
            files.forEach(function (file) {
                promises.push(addFileToZipArchive(file, zip, projectId, snapshotVersion));
            });


            // retrieve the archive as a buffer after everything is added
            Promise.all(promises)
                .then(function () {

                    // base64 - gives zip as a binary stream, which is not human readable
                    // nodebuffer - gives zip file which can be extracted and human readable
                    var zipType = isStream ? 'base64' : 'nodebuffer';
                    var buffer = zip.generate({type: zipType});
                    serviceLogger.info({projectId: projectId, version: snapshotVersion}, commonMessage.success.SWS005);

                    deferred.resolve([buffer, basePath]);
                })
                .catch(function (err) {
                    var e = new NormanError(commonMessage.error.SWE008 + err, 'SWE008');
                    serviceLogger.error({
                        projectId: projectId,
                        version: snapshotVersion
                    }, e);
                    deferred.reject(e);
                });

        } else {
            var error = new NormanError(commonMessage.error.SWE005, 'SWE005');
            serviceLogger.error({
                projectId: projectId,
                version: snapshotVersion
            }, error);
            deferred.reject(error);
        }
    });

    return deferred.promise;
};

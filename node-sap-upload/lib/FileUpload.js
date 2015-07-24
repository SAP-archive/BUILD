'use strict';

var path = require('path');
var fs = require('fs');
var http = require('http');
var common = require('node-sap-common');
var uuid = common.uuid;
var exec = common.exec;
var CommonError = common.CommonError;
var Promise = require('node-sap-promise');
var multipart = require('multer');

var DEFAULT_MIMETYPE = require('./white-list.js');

var DEFAULT_OPTIONS = {
    limits: {
        fields: 50,
        fileSize: 2.5e7, // 25Mo
        files: 10,
        parts: 10
    },
    mimetype: DEFAULT_MIMETYPE
};

var SOURCE_DIR = '${source_dir}';
var TARGET_DIR = '${target_dir}';
var FILES = '${files}';

var options,
    serviceLogger = {
        info: function () {
        },
        error: function () {
        },
        debug: function () {
        }
    };


function addValue(source, add) {
    if (add) {
        Object.keys(add).forEach(function (key) {
            if (typeof add[key] === 'object') {
                if (Array.isArray(add[key])) {
                    if (source[key] === undefined) {
                        source[key] = add[key].slice(0);
                    }
                }
                else {
                    if (!source.hasOwnProperty(key)) {
                        source[key] = {};
                    }

                    addValue(source[key], add[key]);
                }
            }
            else {
                if (!source.hasOwnProperty(key)) {
                    source[key] = add[key];
                }
            }
        });
    }
}

function getSourceFilePath(currOptions, file) {
    return path.join(currOptions.scan.baseSourceDir, currOptions.uuid, file.originalname);
}

function getTargetFilePath(currOptions, file) {
    return path.join(currOptions.scan.baseTargetDir, currOptions.uuid, file.originalname);
}

function create(p, done) {
    fs.stat(p, function (err) {
        if (err) {
            fs.mkdir(p, done);
        }
        else {
            done();
        }
    });
}

function createDirectory(directoryPath) {
    return new Promise(
        function (done) {
            var paths = directoryPath.split(path.sep), p = '', k = 0, n = paths.length;

            function next(err) {
                if (err) {
                    done(err);
                }
                if (k >= n) {
                    done();
                    return;
                }

                p = path.join(p, paths[k++]);
                create(p, next);
            }

            next();
        });
}

function saveFile(currOptions, file) {
    var promises = [], filePath;
    if (Array.isArray(file)) {
        file.forEach(function (element) {
            promises.push(saveFile(currOptions, element));
        });
    }
    else {
        if (!file.path || !file.originalname) {
            Object.keys(file).forEach(function (element) {
                promises.push(saveFile(currOptions, file[element]));
            });
        }
        else {
            filePath = getSourceFilePath(currOptions, file);
            serviceLogger.debug('>> save : ' + filePath);
            promises.push(new Promise(
                function (resolve, reject) {
                    var wstream = fs.createWriteStream(path.resolve(filePath), {encoding: file.encoding});
                    wstream.on('finish', resolve);
                    wstream.on('error', reject);

                    if (currOptions.inMemory) {
                        wstream.end(file.buffer);
                    }
                    else {
                        var rstream = fs.createReadStream(path.resolve(file.path));
                        rstream.on('error', reject);
                        rstream.pipe(wstream);
                    }
                })
                .catch(function (err) {
                    serviceLogger.error(err, file);
                    throw err;
                }));
        }
    }

    return Promise.all(promises);
}

function getFiles(currOptions, file) {
    var files = '';

    if (Array.isArray(file)) {
        file.forEach(function (element) {
            files += getFiles(currOptions, element) + ' ';
        });
    }
    else {
        if (!file.path || !file.originalname) {
            Object.keys(file).forEach(function (element) {
                files += getFiles(currOptions, file[element]) + ' ';
            });
        }
        else {
            files += '"' + getSourceFilePath(currOptions, file) + '"';
        }
    }

    return files;
}

function getCommand(currOptions, req) {
    var execCommand = currOptions.scan.action, files = getFiles(currOptions, req.files);

    execCommand = execCommand.replace(SOURCE_DIR, path.join(currOptions.scan.baseSourceDir, currOptions.uuid));
    execCommand = execCommand.replace(TARGET_DIR, path.join(currOptions.scan.baseTargetDir, currOptions.uuid));
    execCommand = execCommand.replace(FILES, files);

    return execCommand;
}

function existFile(currOptions, deletedFiles, file) {
    var promises = [];
    if (Array.isArray(file)) {
        file.forEach(function (element) {
            promises.push(existFile(currOptions, deletedFiles, element));
        });
    }
    else {
        if (!file.path || !file.originalname) {
            Object.keys(file).forEach(function (element) {
                promises.push(existFile(currOptions, deletedFiles, file[element]));
            });
        }
        else {
            promises.push(new Promise(
                function (done, reject) {
                    fs.exists(getTargetFilePath(currOptions, file), function (exists) {
                        if (!exists) {
                            deletedFiles.push(file.originalname);
                            if (currOptions.inMemory) {
                                if (file.buffer) {
                                    delete file.buffer;
                                }
                                done();
                            }
                            else {
                                fs.unlink(path.resolve(file.path), function (err) {
                                    if (err) {
                                        reject(err);
                                    }
                                    else {
                                        done();
                                    }
                                });
                            }
                        }
                        else {
                            done();
                        }
                    });
                }));
        }
    }

    return Promise.all(promises);
}

function scan(currOptions, req, next) {
    createDirectory(path.join(currOptions.scan.baseSourceDir, currOptions.uuid))
        .then(function () {
            return createDirectory(path.join(currOptions.scan.baseTargetDir, currOptions.uuid));
        })
        .then(function () {
            saveFile(currOptions, req.files)
                .then(function () {
                    var execCommand = getCommand(currOptions, req);

                    exec(execCommand, {stdio: 'false', logger: serviceLogger})
                        .then(function (result) {
                            if (result.error === undefined) {
                                var deletedFiles = [];
                                existFile(currOptions, deletedFiles, req.files)
                                    .then(function () {
                                        if (deletedFiles.length === 0) {
                                            next();
                                        }
                                        else {
                                            var error = new Error('The  ' + JSON.stringify(deletedFiles, null, '  ') + ' file appears to be infected by a virus.');
                                            serviceLogger.error(error);
                                            next(error.message);
                                        }
                                    })
                                    .catch(next);
                            }
                            else {
                                next(new Error('There was an error while scanning your uploaded file(s).'));
                            }
                        })
                        .catch(next);
                })
                .catch(next);
        });
}

/**
 * Generate Middleware for file upload.
 * @param instanceOptions define options
 * @returns {Function} returns middleware
 */
module.exports = function (instanceOptions) {
    var uploadOptions = {};
    if (!options) {
        throw new Error('File upload configuration not initialized');
    }
    addValue(uploadOptions, options);
    addValue(uploadOptions, instanceOptions);

    uploadOptions.contentType = {};
    uploadOptions.mimetype.forEach(function (mimetype) {
        if (instanceOptions && instanceOptions.mimetype) {
            if (instanceOptions.mimetype.indexOf(mimetype) !== -1) {
                uploadOptions.contentType[mimetype] = 1;
            }
        }
        else {
            uploadOptions.contentType[mimetype] = 1;
        }
    });

    return function (req, res, next) {
        var localOptions = {uuid: uuid()}, error, started;
        addValue(localOptions, uploadOptions);

        localOptions.onFileUploadStart = function (file) {
            var proceed = false;
            if (localOptions.contentType[file.mimetype] === 1) {
                started = new Date();
                serviceLogger.debug('>> file upload start', file);
                proceed = true;
            }
            else {
                serviceLogger.debug('minetype not supported', file);
                error = new Error('Content-type ' + file.mimetype + ' not authorized in file ' + file.originalname);
            }

            return proceed;
        };

        localOptions.onFileSizeLimit = function (file) {
            serviceLogger.debug('too big', file);
            error = new CommonError('too big: ' + file.originalname, 413);
        };

        localOptions.onFilesLimit = function () {
            serviceLogger.debug('Files limit');
            error = new CommonError('Files limit', 413);
        };

        localOptions.onFieldsLimit = function () {
            serviceLogger.debug('Fields limit');
            error = new CommonError('Fields limit', 413);
        };

        localOptions.onPartsLimit = function () {
            serviceLogger.debug('Parts limit');
            error = new CommonError('Parts limit', 413);
        };

        localOptions.onFileUploadComplete = function (file) {
            serviceLogger.debug('<< file upload complete - ' + ((new Date()) - started), file);
        };

        localOptions.onParseEnd = function (reqEnd, nextEnd) {
            serviceLogger.debug('<< parse End');
            if (error) {
                var json = error.toJSON(), code = json.error.code;
                if (!http.STATUS_CODES.hasOwnProperty(code.toString())) {
                    code = 500;
                }
                res.status(code).send(json.error);
            }
            else {
                if (localOptions.scan) {
                    scan(localOptions, reqEnd, nextEnd);
                }
                else {
                    next();
                }
            }
        };

        var multipartMiddleware = multipart(localOptions);
        multipartMiddleware(req, res, next);
    };
};

module.exports.setOptions = function (globalOptions) {
    options = {};
    addValue(options, globalOptions);
    addValue(options, DEFAULT_OPTIONS);

    if (options.dest) {
        options.dest = path.resolve(globalOptions.cwd, options.dest);
    }

    if (options.scan && (!options.scan.action || !options.scan.baseSourceDir || !options.scan.baseTargetDir)) {
        throw new Error('The action, baseSourceDir and baseTargetDir are mandatory to scan.');
    }
};

module.exports.getOptions = function () {
    return options;
};

module.exports.setLogger = function (logger) {
    serviceLogger = logger;
};

module.exports.getLogger = function () {
    return serviceLogger;
};

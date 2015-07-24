/*eslint no-use-before-define: 0, new-cap: 0 */
'use strict';

var commonServer = require('norman-common-server');
var registry = commonServer.registry;

var tp = require('norman-server-tp');
var _ = tp.lodash;
var path = require('path');
var streamifier = tp.streamifier;
var unzip = require('unzip2');
var serviceLogger = commonServer.logging.createLogger('user-research-proto');
var studyPrototypeService = require('../studyPrototype/service');
var assetService;
var appModel;

/**
 *
 * @param   {Array} files   The array of files contained in the zip
 * @returns {Array} returns The array of files but with the specific axure files removed
 */
function checkIsAxure(files) {
    var axureFileIndex = _.findKey(files, function (file) {
        return file.path.indexOf('axure-chrome-extension.crx') > -1;
    });

    if (axureFileIndex) {
        return _.omit(files, function (file) {
            return file.path.indexOf('__MACOSX') > -1 || file.path.indexOf('start.html') > -1 || file.path.indexOf('start_c_1.html') > -1 || file.path.indexOf('start.html.orig') > -1 || file.path.indexOf('index.html') > -1 || file.path.indexOf('resources/expand.html') > -1 || file.path.indexOf('resources/Other.html') > -1 || file.path.indexOf('resources/reload.html') > -1 || file.path.indexOf('resources/chrome/chrome.html') > -1 || file.path.indexOf('resources/images/images.html') > -1 || file.path.indexOf('resources/css/images/images.html') > -1 || file.path.indexOf('plugins/sitemap/styles/images/images.html') > -1;
        });
    }
    return files;
}

/**
 * Initialises the required services from the common server registry
 */
function initServices() {
    if (!assetService) {
        assetService = registry.getModule('AssetService');
    }
}

/**
 * Takes a zip file which is passed through the request, unzips it and saves all of the contents as assets.
 * Creates appMetadata where each of the html files in the zip are created as pages and then creates a studyprototype.
 *
 * @param  {object}  req The request object being used for the call
 * @param  {object}  res The response object used to send feedback and data back to the client
 */
module.exports.uploadZip = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> uploadZip()');

    var projectId = req.urlParams.projectId,
        files = {};

    var createProtoResponse;

    initServices();
    appModel = {};
    appModel._id = commonServer.utils.shardkey();
    appModel.uiLang = 'html';
    appModel.pages = [];

    var metadata = {
        model: appModel,
        OP: 'UPDATE'
    };

    streamifier.createReadStream(req.files.file.buffer)
        .pipe(unzip.Parse())
        .on('entry', function (entry) {
            var fileName = entry.path,
                ext = path.extname(fileName),
                fileData = [];
            if (ext === '') {
                return; // if the entry is a folder, don't process it
            }

            entry.on('data', function (data) {
                fileData.push(data);
            });

            entry.on('end', function () {
                var fullBuffer = Buffer.concat(fileData);

                if (ext === '.html' || ext === '.htm') {
                    // script injection for XSS prevention
                    var htmlContent = fullBuffer.toString();
                    var openingHeadIndex = htmlContent.indexOf('<head>');
                    var injectedContent = htmlContent.substr(0, openingHeadIndex + 6) +
                        ' <script src="/iframeMessaging.js"></script>\n  ' +
                        htmlContent.substr(openingHeadIndex + 6);

                    fullBuffer = new Buffer(injectedContent);
                }

                // push the file to the artifacts (this needs to be done for every file)
                files[fileName] = {
                    path: fileName,
                    buffer: fullBuffer
                };
            });

        })
        .on('error', function () {
            serviceLogger.error('<< uploadZip(), error reading the zip file');
            res.status(500).json();
        })
        .on('close', function () {
            // filter the files based on if it's an axure prototype
            var entries = checkIsAxure(files),
                file, ext;

            // once filtered, create pages for the html files
            for (file in entries) {
                if (!entries.hasOwnProperty(file)) {
                    continue;
                }

                ext = path.extname(entries[file].path);

                if (ext === '.html' || ext === '.htm') {
                    createPage(metadata, entries[file].path);
                }
            }

            if (!metadata.model.pages || !metadata.model.pages.length) {
                serviceLogger.error('<< uploadZip(), upload failed, returning error');
                return res.status(500).json();
            }

            updatePageIds(metadata, metadata.model._id);
            studyPrototypeService.createStudyPrototype(projectId, metadata, req.user._id)
                .then(function (studyPrototype) {
                    serviceLogger.info('uploadZip(), metadata returned');
                    createProtoResponse = studyPrototype;
                    return assetService.handlePrototypeUpload(projectId, studyPrototype._id.toString(), req.user._id, entries, 'Prototypes');
                })
                .then(function (filesLoaded) {
                    serviceLogger.info('uploadZip(), files saved, loaded ' + filesLoaded.files);
                    return assetService.handleFileUpload(projectId, req.user._id, {}, [].concat(req.files.file), false);
                })
                .then(function () {
                    serviceLogger.info('uploadZip(), zip saved, success');
                    return res.status(200).json(createProtoResponse);
                })
                .catch(function (err) {
                    serviceLogger.error('<< uploadZip(), upload failed, returning error');
                    res.status(500).json(err);
                });
        });
};

/**
 * Takes the thumbnails created for the html pages on the UI and saves them as assets.
 *
 * @param  {object}  req The request object being used for the call
 * @param  {object}  res The response object used to send feedback and data back to the client
 */
module.exports.addThumbnail = function (req, res) {
    serviceLogger.info({
        params: req.params,
        query: req.query,
        user: req.user._id
    }, '>> addThumbnail()');

    var files = {};
    var projectId = req.urlParams.projectId;

    initServices();
    appModel = {};
    appModel._id = commonServer.utils.shardkey();
    appModel.uiLang = 'html';
    var metadata = {
        model: appModel,
        OP: 'UPDATE'
    };

    try {
        var meta = JSON.parse(req.body.metadata);
        metadata.model.pages = meta.appMetadata.model.pages;
        var studyProtoId = meta._id;

        for (var name in req.files) {
            files[name] = {
                buffer: req.files[name].buffer,
                path: name
            };
        }

        // just add the thumbnails
        assetService.handlePrototypeUpload(projectId, studyProtoId, req.user._id, files, 'Projects')
            .then(function () {
                // return the necessary snapshot data to be used by the UI
                serviceLogger.info('uploadZip(), files saved');
                var updateFields = {
                    thumbnailsCreated: true
                };
                return studyPrototypeService.updateStudyPrototype(studyProtoId, updateFields);
            }).then(function (studyPrototype) {
                serviceLogger.info('<< addThumbnail(), upload succeeded');
                return res.status(200).json(studyPrototype);
            }).catch(function (err) {
                serviceLogger.error('<< addThumbnail(), upload failed, returning error');
                return res.status(500).json(err);
            });
    }
    catch (err) {
        serviceLogger.error('<< addThumbnail(), upload failed: ', err);
        return res.status(500).json(err);
    }

};

/**
 * Updates the id fields on each of the pages to point to the metadata id as expected
 *
 * @param {object} metadata  The metadata object containing the pages that need to be updated
 * @param {string} metadataId The id of the metadata that the pages should relate to
 */
function updatePageIds(metadata, metadataId) {
    metadata.model.pages.forEach(function (page) {
        page.id = metadataId;
    });
}

/**
 *
 * @param   {string} fileName the string representing the file within it's folder structure
 * @returns {string} returns the file name itself excluding the folder structure
 */
function getFileNameFromPath(fileName) {
    return fileName.split('/').pop();
}

/**
 * Creates a page object based on the html files found in the zip file
 *
 * @param {object} metadata The object which the new page is to be added to
 * @param {string} filename A string with the name of the file which the page data is based upon
 */
function createPage(metadata, filename) {
    var appModelPage = {};

    appModelPage.name = getFileNameFromPath(filename);
    appModelPage.displayName = getFileNameFromPath(filename);
    appModelPage.pageUrl = '/' + filename;
    appModelPage.thumbnailUrl = '/' + filename + '.png';

    metadata.model.pages.push(appModelPage);
}

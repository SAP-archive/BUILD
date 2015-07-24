/*eslint dot-notation: 0, no-unused-vars: 0 */
'use strict';
var commonServer = require('norman-common-server');
// var configuration = commonServer.config;
var registry = commonServer.registry;
var logger = commonServer.logging.createLogger('uicatalogmanager-controller-server');
var service = registry.getModule('UICatalog');
var fs = require('fs');
var path = require('path');
var promise = require('norman-promise');
var commonService = require('../../services/common/common.service');
var replaceStream = require('replacestream');

/*============================COMMON FUNCTIONS============================*/

/**
 * handleError handler for error
 * @res  {Object}
 * @err  {Object}
 * @return {Object}
 */
function handleError(res, err) {
    return res.status(500).send(err);
}

/**
 * handleNotFoundError handler for Not Found
 * @res  {Object}
 * @err  {Object}
 * @return {Object}
 */
function handleNotFoundError(res, err) {
    return res.status(404).send(err);
}

/**
 * handleSuccess handler for success
 * @res  {Object}
 * @jsonBody  {Object}
 * @return {Object}
 */
function handleSuccess(res, jsonBody) {
    if (jsonBody) {
        return res.status(200).json(jsonBody);
    }
    else {
        return res.status(204);
    }
}


/*============================CATALOG============================*/

/**
 * upload handler for catalog upload
 * @req  {Object}
 * @res  {Object}
 * @return {Object}
 */
exports.upload = function (req, res) {
    if (req &&
        req.params &&
        req.files &&
        req.files.catalogFile
        ) {
        fs.readFile(req.files.catalogFile.path, 'utf8', function (err, data) {
            if (err === null) {
                if (req && req.body) {
                    service.createCatalog(JSON.parse(data)).then(
                        function (result) {
                            return handleSuccess(res, result);
                        },
                        function (error) {
                            return commonService.sendError(res, error);
                        }
                    );
                }
                else {
                    handleError(res, 'invalid argument');
                }
            }
        });
    }
};
/**
 * [updateCustomCatalog handler for catalog update]
 * @req  {Object}
 * @res  {Object}
 * @return {Object}
 */
exports.updateCustomCatalog = function (req, res) {
    var data = JSON.parse(req.body.data);
    service.updateCustomCatalog(data).then(
        function (result) {
            return handleSuccess(res, result);
        },
        function (error) {
            handleNotFoundError(res, error);
        }
    );

};
/**
 * [getSampleTemplates handler for listing catalogs]
 * @req  {Object}
 * @res  {Object}
 * @return {Object}
 */
exports.getSampleTemplates = function (req, res) {
    service.getSampleTemplates().then(
        function (result) {
            return handleSuccess(res, result);
        },
        function (err) {
            handleError(res, err);
        }
    );
};
/**
 * [list handler for listing catalogs]
 * @req  {Object}
 * @res  {Object}
 * @return {Object}
 */
exports.getCatalogs = function (req, res) {
    var filter = 'none';
    if (req.params.filter !== null || req.params.filter !== undefined) {
        filter = req.params.filter;
    }
    service.getCatalogs(filter).then(
        function (result) {
            return handleSuccess(res, result);
        },
        function (err) {
            handleError(res, err);
        }
    );
};

/**
 * [updateCatalog handler for catalog update]
 * @req  {Object}
 * @res  {Object}
 * @return {Object}
 */
exports.updateCatalog = function (req, res) {
    if (req &&
        req.params &&
        req.files &&
        req.files.catalogFile
        ) {
        fs.readFile(req.files.catalogFile.path, 'utf8', function (err, data) {
            if (err === null) {
                data = JSON.parse(data);
                delete data['__v'];
                service.updateCatalog(data).then(
                    function (result) {
                        return handleSuccess(res, result);
                    },
                    function (error) {
                        return commonService.sendError(res, error);
                    }
                );
            }
            else {
                handleError(res, 'invalid argument');
            }
        });
    }
};

/**
 * [getCatalog handler for fetching catalog]
 * @req  {Object}
 * @res  {Object}
 * @return {Object}
 */
exports.getCatalog = function (req, res) {
    if (req &&
        req.params &&
        commonService.isAlphaNumeric(req.params.name) &&
        commonService.isAlphaNumeric(req.params.catalogVersion)
        ) {
        service.getCatalog(req.params.name, req.params.catalogVersion).then(
            function (result) {
                return handleSuccess(res, result);
            },
            function (err) {
                handleError(res, err);
            }
        );
    }
};

/**
 * [deleteCatalog handler for deleting catalog]
 * @req  {Object}
 * @res  {Object}
 * @return {Object}
 */
exports.deleteCatalog = function (req, res) {
    if (req &&
        req.params &&
        commonService.isAlphaNumeric(req.params.name) &&
        commonService.isVersion(req.params.catalogVersion)
        ) {
        service.deleteCatalog(req.params.name, req.params.catalogVersion).then(
            function (result) {
                return handleSuccess(res, result);
            },
            function (err) {
                handleError(res, err);
            }
        );
    }
};


/**
 * [download handler for downloading sample template]
 * @req  {Object}
 * @res  {Object}
 * @return {Object}
 */
exports.download = function (req, res) {
    if (req &&
        req.params &&
        commonService.isAlphaNumeric(req.params.libType)
        ) {
        var filePath, libType = req.params.libType;
        switch (libType) {
            case 'ui5':
                filePath = 'sampleTemplate/r1c1ui5.json';
                break;
            case 'polymer':
                filePath = 'sampleTemplate/sampleTemplatePolymer.json';
                break;
            case 'angular':
                filePath = 'sampleTemplate/sampleAngularTemplate.json';
                break;
            case 'html':
                filePath = 'sampleTemplate/sampleHtmlTemplate.json';
                break;
            default:
                filePath = 'sampleTemplate/r1c1ui5.json';
        }

        filePath = path.join(__dirname, filePath);
        var size = fs.statSync(filePath).size;

        res.writeHead(200, {
            'Content-type': 'application/json',
            'Content-Length': size
        });

        var readStream = fs.createReadStream(filePath);
        readStream.on('data', function (data) {
            res.write(data);
        });

        readStream.on('end', function () {
            res.end();
        });
    }
};

/*============================UI LIBRARY============================*/


exports.uploadUILibrary = function (req, res) {
    if (req &&
        req.params &&
        req.files &&
        req.files.file &&
        req.params.libType &&
        req.params.libVersion &&
        req.params.isPrivate
        ) {
        var isPrivateSet = (req.params.isPrivate === 'true');
        service.uploadUILibrary([].concat(req.files.file), req.params.libType, req.params.libVersion, isPrivateSet).then(function (file) {
            return handleSuccess(res, {
                status: 'UI Library uploaded',
                file: file,
                libType: req.params.libType,
                libVersion: req.params.libVersion,
                isPrivate: req.params.isPrivate
            });
        }, function (err) {
            return commonService.sendError(res, err);
        });
    }
};


exports.getAvailableVersions = function (req, res) {
    service.getAvailableVersions(req.params.libType).then(
        function (result) {
            return handleSuccess(res, result);
        },
        function (err) {
            handleError(res, err);
        }
    );
};
/*============================ACTIONS============================*/

/**
 * [getActions handler for fetching actions]
 * @req  {Object}
 * @res  {Object}
 * @return {Object}
 */
exports.getActions = function (req, res) {
    if (req &&
        req.params &&
        commonService.isAlphaNumeric(req.params.name)
        ) {
        service.getActions(req.params.name).then(
            function (result) {
                return handleSuccess(res, result);
            },
            function (err) {
                handleError(res, err);
            }
        );
    }
};


exports.getPrivateLibraryFile = function (req, res) {
    var duration = 2419200;
    var isPrivate = true;
    // if (null !== configuration) {
    //     duration = configuration.get('web')['cache-duration']['max-age'];
    // }
    service.getLibraryFile(req.params.type, req.params.version, req.params.pathFileName, isPrivate).then(
        function (data) {
            if (data && data.readStream) {
                res.header({
                    'Content-type': data.contentType
                });
                //res.header('Cache-Control', 'max-age=' + duration);
                res.header('Cache-Control', 'max-age=2419200');
                data.readStream.pipe(res);
            }
            else {
                res.status(404).json();
            }
        }, function (error) {
            handleError(res, error);
        });
};

exports.getMetadataGeneratorFiles = function (req, res) {
    service.getMetadataGeneratorFiles('openui5', req.params.version, req.params.pathFileName).then(
        function (data) {
            var url = '';
            var isPrivateSet = (req.params.isPrivate === 'true');
            if (data && data.readStream) {
                res.header({
                    'Content-type': data.contentType
                });
                //res.header('Cache-Control', 'max-age=' + duration);
                res.header('Cache-Control', 'max-age=2419200');
                if (isPrivateSet) {
                    url = '/api/uicatalogs/private/uilib/' + req.params.type + '/' + req.params.libraryVersion + '/sap-ui-core.js';
                }
                else {
                    url = '/api/uicatalogs/public/uilib/' + req.params.type + '/' + req.params.libraryVersion + '/sap-ui-core.js';
                }
                data.readStream.pipe(replaceStream('<%SRC_URL%>', url))
                    .pipe(res);
            }
            else {
                res.status(404).json();
            }
        }, function (error) {
            handleError(res, error);
        });

};

exports.getLibraryFile = function (req, res) {
    if (req &&
        req.params &&
        req.params.type &&
        req.params.version &&
        req.params.pathFileName
        ) {
        var duration = 2419200;
        var isPrivate = false;
        // if (null !== configuration) {
        //     duration = configuration.get('web')['cache-duration']['max-age'];
        // }
        service.getLibraryFile(req.params.type, req.params.version, req.params.pathFileName, isPrivate).then(
            function (data) {
                if (data && data.readStream) {
                    res.header({
                        'Content-type': data.contentType
                    });
                    // res.header('Cache-Control', 'public,max-age=' + duration);
                    res.header('Cache-Control', 'public,max-age=2419200');
                    data.readStream.pipe(res);
                }
                else {
                    res.status(404).json();
                }
            }, function (error) {
                handleError(res, error);
            });
    }
};

/**
 * getFloorPlanByLibType handler for fetching floorplans by library type
 * @req  {Object}
 * @res  {Object}
 * @return {Object}
 */
exports.getFloorPlanByLibType = function (req, res) {
    if (req &&
        req.params &&
        commonService.isAlphaNumeric(req.params.libraryType)
        ) {
        service.getFloorPlanByLibType(req.params.libraryType).then(
            function (result) {
                return handleSuccess(res, result);
            },
            function (err) {
                handleError(res, err);
            }
        );
    }
};


exports.getCompatibleCatalogs = function (req, res) {
    if (req &&
        req.params &&
        commonService.isAlphaNumeric(req.params.catalogId)
        ) {
        service.getCompatibleCatalogs(req.params.catalogId).then(
            function (result) {
                return handleSuccess(res, result);
            },
            function (err) {
                handleError(res, err);
            }
        );
    }
};


exports.getCatalogById = function (req, res) {
    if (req &&
        req.params &&
        commonService.isAlphaNumeric(req.params.catalogId)
        ) {
        service.getCatalogById(req.params.catalogId).then(
            function (result) {
                return handleSuccess(res, result);
            },
            function (err) {
                handleError(res, err);
            }
        );
    }
};

exports.deleteControls = function (req, res) {
    var data = JSON.parse(req.body.data);
    service.deleteControls(data.catalogName, data.catalogVersion, data.controls).then(
        function (result) {
            return handleSuccess(res, result);
        },
        function (error) {
            handleNotFoundError(res, error);
        }
    );
};


/*============================PREDEFINED TEMPLATE============================*/

/**
 * getPredefinedTemplate handler for fetching predefined template data
 * @req  {Object}
 * @res  {Object}
 * @return {Object}
 */
exports.getPredefinedTemplate = function (req, res) {
    if (req &&
        req.params &&
        commonService.isAlphaNumeric(req.params.libType)
        ) {
        var filePath, libType = req.params.libType;
        switch (libType) {
            case 'ui5':
                filePath = 'sampleTemplate/sampleTemplate.json';
                break;
            case 'polymer':
                filePath = 'sampleTemplate/samplePolymerTemplate.json';
                break;
            case 'angular':
                filePath = 'sampleTemplate/sampleAngularTemplate.json';
                break;
            case 'html':
                filePath = 'sampleTemplate/sampleHtmlTemplate.json';
                break;
            default:
                filePath = 'sampleTemplate/sampleTemplate.json';
        }

        filePath = path.join(__dirname, filePath);

        fs.readFile(filePath, 'utf8', function (err, data) {
            if (err === null) {
                data = JSON.parse(data);
                service.createCatalog(data).then(function (result) {
                    return handleSuccess(res, result);
                }, function (error) {
                    handleNotFoundError(res, error);
                });
            }
            else {
                handleError(res, 'invalid argument');
            }

        });
    }
};


/* eslint  no-unused-vars: 0 */
'use strict';
var commonServer = require('norman-common-server');
var JSZip = require('jszip');
var logger = commonServer.logging.createLogger('uicatalogmanager-service');
var ObjectId = commonServer.db.mongoose.Types.ObjectId;
var promise = require('norman-promise'),
    model = require('./grid.model'),
    tp = require('norman-server-tp'),
    NormanError = commonServer.NormanError,
    stream = tp.streamifier,
    commonService = require('./../common/common.service.js'),
    restrictFields = '_id length metadata.updated_at metadata.created_at metadata.contentType metadata.extension filename metadata.length',
    GridModel,
    path = require('path'),
    fs = require('fs'),
    mime = tp.mime,
    zip = new JSZip(),
    _ = tp.lodash;

var serviceLogger = commonServer.logging.createLogger('uicatalog-service');
/*============================COMMON FUNCTIONS============================*/

/**
 * UICatalogService UI Catalog service
 * @model {Object}
 */
function UICatalogService(model) {
    if (!(this instanceof UICatalogService)) {
        return new UICatalogService(model);
    }

    this.model = model || require('./model.js');
}

module.exports = UICatalogService;

UICatalogService.prototype.initialize = function(done) {
    GridModel = model.create();
    done();
};

UICatalogService.prototype.checkSchema = function(done) {
    model.createIndexes(done);
};

UICatalogService.prototype.initializeSchema = function(done) {
    var promises = [];
    var self = this;
    promises.push(Promise.resolve(self.initializeDb()));
    promises.push(Promise.resolve(self.initializeLibrary()));
    promises.push(Promise.resolve(self.extractLibrary()));

    Promise.waitAll(promises)
        .catch(function (err) {
            var error =  new NormanError('Failed to initialize Schema', err);
            serviceLogger.error(error);
            throw error;
        })
        .callback(done);
};

/**
 * Shutdown once the service is shutdown centrally
 * @param done
 */
UICatalogService.prototype.shutdown = function(done) {
    serviceLogger.info('>> shutdown()');
    model.destroy(done);
};

/**
 * getGridModel handler for fetching grid model
 * @return {Object}
 */
function getGridModel() {
    if (!GridModel) {
        GridModel = model.create();
    }
    return GridModel;
}

/*============================CATALOG============================*/

/**
 * upload handler for catalog upload
 * @catalog  {Object}
 * @return {Object}
 */
UICatalogService.prototype.upload = function(catalog) {
    var deferred = promise.defer();
    UICatalogService.prototype.createCatalog(catalog);
    return deferred.promise;
};
/**
 * getSampleTemplates handler for listing catalogs
 * @return {Object}
 */
UICatalogService.prototype.getSampleTemplates = function() {
    var deferred = promise.defer();
    this.model.find({}, {
        _id: 0,
        __v: 0
    }, function(err, catalogs) {
        if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve(catalogs);
        }
    });

    return deferred.promise;
};
/**
 * updateCustomCatalog handler for catalog update
 * @catalog  {Object}
 * @return {Object}
 */
UICatalogService.prototype.updateCustomCatalog = function(catalog) {
    var deferred = promise.defer();
    this.model.findOneAndUpdate({
        $and: [
            {
                catalogName: catalog.catalogName
            },
            {
                catalogVersion: catalog.catalogVersion
            },
            {
                rootCatalogId: catalog.rootCatalogId
            }
        ]
        // }, catalog, {
    }, catalog, {
        upsert: true
    }, function(err, ctlog) {
        if (err) {
            //console.log('Error in finding catalog:' + err);
            deferred.reject(err);
        }
        else {
            if (ctlog) {
                deferred.resolve(ctlog);
            }
            else {
                deferred.reject('Catalog not found');
            }
        }
    });
    return deferred.promise;
};
/**
 * getCatalogs handler for listing catalogs
 * @return {Object}
 */

UICatalogService.prototype.getCatalogs = function(filter) {
    var deferred = promise.defer();

    var conditions, fields;
    var self = this;
    conditions = {};
    fields = {
        _id: 1,
        catalogId: 1,
        catalogName: 1,
        catalogVersion: 1,
        displayName: 1,
        catalogLang: 1,
        isRootCatalog: 1
    };
    switch (filter) {
        case 'none':
            conditions = {};
            break;
        case 'root':
            conditions = {
                'isRootCatalog': true
            };
            break;
        case 'custom':
            conditions = {
                'isRootCatalog': false
            };
            break;
        case 'default':
            conditions = {
                '$and': [
                    {
                        'isDefault': true
                    },
                    {
                        'floorPlans': {
                            '$exists': true
                        }
                    }
                ]
            };
            break;
        case 'floorplan':
            conditions = {
                '$and': [
                    {
                        'isRootCatalog': false
                    },
                    {
                        'floorPlans': {
                            '$exists': true
                        }
                    }
                ]
            };
            break;
    }

    this.model.find(conditions, fields).lean().exec(
        function(err, catalogs) {
            if (err) {
                serviceLogger.error(new NormanError(err));
                return deferred.reject(err);
            }
            else {
                deferred.resolve(self.addCatalogId(catalogs));
            }
        });

    return deferred.promise;
};

UICatalogService.prototype.addCatalogId = function(catalogs) {
    if (catalogs instanceof Array) {
        var newArray = [];
        for (var itr = 0; itr < catalogs.length; itr++) {
            var catalog = catalogs[itr];
            catalog.catalogId = catalog._id;
            delete catalog._id;
            newArray.push(catalog);
        }
        return newArray;
    }
    else {
        catalogs.catalogId = catalogs._id;
        delete catalogs._id;
        return catalogs;
    }
};

/**
 * deleteCatalog handler for deleting catalog
 * @name  {String}
 * @catalogVersion  {String}
 * @return {Object}
 */
UICatalogService.prototype.deleteCatalog = function(name, catalogVersion) {
    var deferred = promise.defer();
    var conditions;
    conditions = {
        name: name,
        catalogVersion: catalogVersion
    };
    this.model.find().remove(conditions,
        function(err, catalogs) {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(catalogs);
            }
        });

    return deferred.promise;
};

/**
 * createCatalog handler for catalog create
 * @catalog  {Object}
 * @return {Object}
 */
UICatalogService.prototype.createCatalog = function(catalog) {

    var model = this.model,
        deferred = promise.defer(),
        catalogName = catalog.catalogName,
        catalogVersion = catalog.catalogVersion;
    this.model.find({
        name: catalogName,
        catalogVersion: catalogVersion
    }, {}, function(err, catalogs) {
        if (err) {
            deferred.reject(err);
        }
        else {
            if (catalogs.length === 0) {
                // create the catalog,only if the catalog with the specified name and version doesnot exist
                model.create(catalog, function(error, ctlog) {
                    if (error) {
                        deferred.reject(error);
                    }
                    else {
                        deferred.resolve(ctlog);
                    }
                });
            }
            else {
                deferred.resolve(catalog);
            }
        }
    });
    return deferred.promise;
};

/**
 * updateCatalog handler for catalog update
 * @catalog  {Object}
 * @return {Object}
 */
UICatalogService.prototype.updateCatalog = function(catalog) {
    var deferred = promise.defer();
    this.model.findOneAndUpdate({
        $and: [
            {
                catalogName: catalog.catalogName
            },
            {
                catalogVersion: catalog.catalogVersion
            }
        ]
        // }, catalog, {
    }, catalog, {
        upsert: true
    }, function(err, ctlog) {
        if (err) {
            //console.log('Error in finding catalog:' + err);
            deferred.reject(err);
        }
        else {
            if (ctlog) {
                deferred.resolve(ctlog);
            }
            else {
                deferred.reject('Catalog not found');
            }
        }
    });
    return deferred.promise;
};

UICatalogService.prototype.getCatalog = function(name, catalogVersion) {
    var deferred = promise.defer();
    var condition = {
        catalogName: name,
        catalogVersion: catalogVersion
    };
    var fields = {};
    var self = this;
    this.model.findOne(condition, fields).lean().exec(function(err, catalogs) {
        if (err) {
            deferred.reject(err);
        }
        else {
            if (catalogs) {
                deferred.resolve(self.addCatalogId(catalogs));
            }
            else {
                serviceLogger.error(new NormanError('Catalog not found'));
                return deferred.reject('Catalog not found');
            }
        }
    });
    return deferred.promise;
};


/*============================ACTIONS============================*/

/**
 * getActions handler for fetching actions
 * @name  {String}
 * @return {Object}
 */
UICatalogService.prototype.getActions = function(name) {
    var deferred = promise.defer(),
        conditions, fields, options;
    conditions = {
        name: name
    };
    fields = {
        Actions: 1
    };
    options = {};
    this.model.find(conditions, fields, options,
        function(err, catalogs) {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(catalogs);
            }
        });

    return deferred.promise;
};


/*============================SMART TEMPLATES============================*/

/* Commented: As smart template helpers are removed for open source
UICatalogService.prototype.addActionsToCatalog = function(catalog) {
    catalog.actions = {
        Navigation: {
            Library: 'SAPUI5',
            displayToUser: true,
            actionFn: '',
            actionId: 'NAVTO',
            actionParam: [
                {
                    paramName: 'routeName',
                    paramDisplayName: 'Page',
                    paramType: 'PAGE'
                }
            ],
            name: 'Navigation',
            displayName: 'Navigation'
        }
    };
};

UICatalogService.prototype.processSmartTemplates = function(files, libType, libVersion, isPrivate) {
    var deferred = promise.defer();
    var self = this;

    var smartTemplateLibFiles = _.filter(files, function(subFile) {
        return subFile.name && !subFile.dir && subFile.name.indexOf('sap/suite/ui/generic/template') > -1;
    });

    if (smartTemplateLibFiles.length > 0) {
        var catalog = smartTemplateHelper.extractCatalog(smartTemplateLibFiles, libVersion);
        catalog.catalogName = 'st' + libVersion;
        catalog.description = 'Smart Template Root ' + libVersion;
        catalog.displayName = 'Smart Template';
        catalog.catalogLang = libType;
        catalog.libraryVersion = libVersion;
        catalog.isRootCatalog = true;
        catalog.libraryURL = '/api/uicatalogs/' + (isPrivate ? 'private' : 'public') + '/uilib/' + libType + '/' + libVersion + '/sap-ui-core.js';
        catalog.libraryPublicURL = catalog.libraryURL;  // same for the moment
        catalog.rootCatalogId = null;
        this.addActionsToCatalog(catalog); // add actions to root catalog

        if (_.keys(catalog.controls).length > 0) {
            self.createCatalog(catalog).then(function(stRootCatalog) {
                var stCustomCatalog = stRootCatalog.toJSON();
                // override specific params
                stCustomCatalog.catalogName = 'stc' + libVersion;
                stCustomCatalog.description = 'Smart Template Custom ' + libVersion;
                stCustomCatalog.catalogLang = libType; // used by the floorplan search query
                stCustomCatalog.isRootCatalog = false;
                stCustomCatalog.isDefault = false;
                stCustomCatalog.rootCatalogId = stRootCatalog._id;
                stCustomCatalog._id = null;
                delete stCustomCatalog.actions; // remove actions from custom catalog
                self.createCatalog(stCustomCatalog).then(function() {
                    deferred.resolve({});
                })
            })
        }
    }

    // no catalog created or required
    deferred.resolve({});

    return deferred.promise;
};*/

/*============================FLOORPLANS============================*/


/**
 * getFloorPlanByLibType handler for fetching floorplans by library type
 * @libraryType  {String}
 * @return {Object}
 */
UICatalogService.prototype.getFloorPlanByLibType = function(libraryType) {
    var deferred = promise.defer(),
        conditions, fields;

    if (libraryType === 'ui5') {
        // look for all types of ui5
        conditions = {
            $and: [
                {'$or': [
                    {'catalogLang': 'openui5'},
                    {'catalogLang': 'sapui5'}
                ]},
                {
                    'isRootCatalog': false
                }
            ]};
    }
    else {
        // look for specific library type
        conditions = {
            catalogLang: libraryType,
            isRootCatalog: false
        };
    }
    fields = {
        _id: 1,
        floorPlans: 1,
        catalogName: 1,
        isDefault: 1
    };
    this.model.find(conditions, fields, {},
        function(err, catalogs) {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(catalogs);
            }
        });

    return deferred.promise;
};


/*============================UI LIBRARY============================*/


UICatalogService.prototype.uploadUILibrary = function(file, libType, libVersion, isPrivate) {
    var deferred = promise.defer();
    var self = this;

    var openui5zip = new JSZip(file[0].buffer);
    if (_.isEmpty(openui5zip.files)) {
        return deferred.reject('no files to load');
    }
	/* Commented: As smart template helpers are removed for open source
    this.processSmartTemplates(openui5zip.files, libType, libVersion, isPrivate).then(function() {*/

        var zipFilePromises = _.map(openui5zip.files, function(zipEntry) {
            var deferred = promise.defer();
            self.storeNewFile(zipEntry, libType, libVersion, isPrivate).then(
                function(result) {
                    deferred.resolve(result);
                },
                function(err) {
                    deferred.reject(err);
                }
            );
            return deferred.promise;
        });

        promise.all(zipFilePromises)
            .then(function(files) {
                if (files && files.length === Object.keys(openui5zip.files).length) {
                    return deferred.resolve(files);
                }
                else {
                    return deferred.reject('not all files could be loaded');
                }
            });
   /* });*/

    return deferred.promise;
};


UICatalogService.prototype.getCompatibleCatalogs = function(catalogId) {
    var that = this;
    var deferred = promise.defer(),
        conditions, fields, options;
    conditions = {
        _id: new ObjectId(catalogId)
    };
    fields = {
        _id: 1,
        rootCatalogId: 1,
        catalogId: 1
    };
    options = {};
    that.model.find(conditions, fields, options,
        function(err, catalogs) {
            if (err) {
                deferred.reject(err);
            }
            else {
                if (undefined !== catalogs[0]) {
                    if (catalogs[0].rootCatalogId === null) {
                        that.populateRoots(catalogs[0]._id).then(
                            function(customcatalogs) {
                                deferred.resolve(that.addCatalogId(customcatalogs));
                            },
                            function(err) {
                                deferred.reject(err);
                            }
                        );
                    }
                    else {
                        that.populateRoots(catalogs[0].rootCatalogId).then(
                            function(customcatalogs) {
                                deferred.resolve(that.addCatalogId(customcatalogs));
                            },
                            function(err) {
                                deferred.reject(err);
                            }
                        );
                    }
                }
                else {
                    deferred.reject(err);
                }
            }
        });

    return deferred.promise;
};


UICatalogService.prototype.updateRootCatalogId = function(rId, cId) {
    var deferred = promise.defer();
    var condition = {
        _id: cId
    };
    var update = {
        'rootCatalogId': rId
    };
    this.model.findOneAndUpdate(condition, update, function(err, catalog) {
        if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve(catalog);
        }
    });
    return deferred.promise;
};
/**
 * checkForData handler for creating predefined template data
 * total  {length}
 * cb {function}
 */
UICatalogService.prototype.updateMashupIds = function(ui5Id, angularId, htmlId) {
    var deferred = promise.defer();
    var condition = {
        _id: ui5Id
    };
    var mashupControls = {};
    mashupControls[angularId] = 'sap.norman.controls.Angular';
    mashupControls[htmlId] = 'sap.ui.core.HTML';
    this.model.findOne(condition, function(err, catalog) {
        if (err) {
            deferred.reject(err);
        }
        else {
            catalog.mashupControls = mashupControls;
            catalog.save();
            deferred.resolve(catalog);
        }
    });
    return deferred.promise;
};

UICatalogService.prototype.getCatalogById = function(catalogId) {
    var deferred = promise.defer();
    var condition = {
        _id: new ObjectId(catalogId)
    };
    var self = this;
    this.model.findOne(condition).lean().exec(function(err, catalog) {
        if (err) {
            serviceLogger.error(new NormanError(err));
            return deferred.reject(err);
        }
        else {
            deferred.resolve(self.addCatalogId(catalog));
        }
    });
    return deferred.promise;
};

UICatalogService.prototype.populateRoots = function(id) {
    var that = this;
    var rootIds = [];
    var deferred = promise.defer(),
        conditions, fields, options;
    conditions = {
        _id: new ObjectId(id)
    };
    fields = {
        _id: 1,
        rootCatalogId: 1,
        catalogId: 1,
        mashupControls: 1
    };
    options = {};
    that.model.find(conditions, fields, options,
        function(err, catalogs) {
            if (err) {
                deferred.reject(err);
            }
            else {
                if (catalogs[0].rootCatalogId === null) {
                    if (_.keys(catalogs[0].mashupControls)) {
                        rootIds = _.keys(catalogs[0].mashupControls);
                        rootIds.push(catalogs[0]._id.toHexString());
                        conditions = {};
                        var idArray = {};
                        var rootIdArray = {};
                        conditions = _.transform(rootIds, function(result, n) {
                            idArray._id = new ObjectId(n);
                            rootIdArray.rootCatalogId = new ObjectId(n);
                            result.push(idArray);
                            result.push(rootIdArray);
                            idArray = {};
                            rootIdArray = {};
                        });

                        fields = {};
                        conditions = {
                            '$or': conditions
                        };

                        that.model.find(conditions, fields).lean().exec(
                            function(err, catalogs) {
                                if (err) {
                                    serviceLogger.error(new NormanError(err));
                                    return deferred.reject(err);
                                }
                                else {
                                    deferred.resolve(catalogs);
                                }
                            });
                    }
                }
            }
        });
    return deferred.promise;
};

UICatalogService.prototype.deleteControls = function(catalogName, catalogVersion, controls) {
    var deferred = promise.defer(),
        self = this,
        conditions, fields, options;
    conditions = {
        catalogName: catalogName,
        catalogVersion: catalogVersion
    };
    options = {};
    this.model.findOne(conditions, fields, options,
        function(err, catalogs) {
            if (err) {
                deferred.reject(err);
            }
            else {
                for (var itr = 0; itr < controls.length; itr++) {
                    delete catalogs.controls[controls[itr]];
                }
                self.updateCustomCatalog(catalogs.toJSON()).then(
                    function(catalog) {
                        deferred.resolve(catalog);
                    },
                    function(err) {
                        deferred.reject(err);
                    }
                );
            }
        });

    return deferred.promise;
};


UICatalogService.prototype.getAvailableVersions = function(libraryType) {
    var deferred = promise.defer(),
        groupConditions, matchConditions;
    matchConditions = {
        '$match': {
            '$and': [
                {
                    'metadata.libraryType': {
                        '$eq': libraryType
                    }
                },
                {
                    'metadata.forCanvas': {
                        '$ne': true
                    }
                }
            ]
        }
    };
    groupConditions = {
        '$group': {
            _id: '$metadata.libraryVersion'
        }
    };
    getGridModel().aggregate(
        matchConditions,
        groupConditions
    ).exec(function(err, res) {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(res);
            }
        });
    return deferred.promise;
};

UICatalogService.prototype.getLibraryFile = function(type, version, pathFileName, isPrivate) {
    var deferred = promise.defer(),
        conditions = {
            $and: [
                {
                    'metadata.libraryType': type
                },
                {
                    'metadata.path': new RegExp(pathFileName + '$', 'i')
                },
                {
                    'metadata.libraryVersion': version
                },
                {
                    'metadata.isPrivate': isPrivate
                }
            ]
        };
    getGridModel().findOne(conditions).lean().exec(function(err, file) {
        if (err) {
            deferred.reject(err);
        }
        else {
            if (file === null) {
                //serviceLogger.error(new NormanError(err));
                deferred.reject('file not found');
                return deferred.promise;
            }
            else {
                var readStream = commonService.getGridFs().createReadStream({
                    _id: file._id,
                    root: 'library'
                }).on('error', function(err) {
                    deferred.reject(err);
                });
                deferred.resolve({
                    filename: file.filename,
                    contentType: file.metadata.contentType,
                    readStream: readStream
                });
            }
        }
    }, function(err) {
        deferred.reject(err);
    });
    return deferred.promise;
};

UICatalogService.prototype.getMetadataGeneratorFiles = function(type, version, pathFileName) {
    var deferred = promise.defer(),
        conditions = {
            $and: [
                {
                    'metadata.libraryType': type
                },
                {
                    'metadata.path': new RegExp(pathFileName + '$', 'i')
                },
                {
                    'metadata.libraryVersion': version
                },
                {
                    'metadata.forCanvas': true
                }
            ]
        };
    getGridModel().findOne(conditions).lean().exec(function(err, file) {
        if (err) {
            deferred.reject(err);
        }
        else {
            if (file === null) {
                serviceLogger.error(new NormanError(err));
                deferred.reject('file not found');
                return deferred.promise;
            }
            else {
                var readStream = commonService.getGridFs().createReadStream({
                    _id: file._id,
                    root: 'library'
                }).on('error', function(err) {
                    deferred.reject(err);
                });
                deferred.resolve({
                    filename: file.filename,
                    contentType: file.metadata.contentType,
                    readStream: readStream
                });
            }
        }
    }, function(err) {
        deferred.reject(err);
    });
    return deferred.promise;
};


UICatalogService.prototype.checkForData = function(rootCatalog, customCatalogs) {
    var that = this;
    var rootCatalogId = rootCatalog._id;
    //will return the custom catalog
    var updateCustomCatalogs = _.map(customCatalogs, function(customCatalog) {
        var customCatalogId = customCatalog._id;
        return that.updateRootCatalogId(rootCatalogId, customCatalogId);
    });
    return promise.all(updateCustomCatalogs);
};

UICatalogService.prototype.getFiles = function(fileNames) {
    if (_.isEmpty(fileNames)) {
        return promise.reject('no files to load');
    }
    var filePath = '../../api/catalog/sampleTemplate/';
    var filePromises = _.map(fileNames, function(fileName) {
        var fullPath = path.join(__dirname, filePath + fileName);
        var deferred = promise.defer();
        fs.readFile(fullPath, 'utf8', function(err, data) {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(data);
            }
        });
        return deferred.promise;
    });
    return promise.all(filePromises)
        .then(function(files) {
            if (files && files.length === fileNames.length) {
                return promise.resolve(files);
            }
            else {
                return promise.reject('not all files could be loaded');
            }
        });
};

/**
 * initializeDb preload uicatalog db with predefined data
 * callback  {function}
 */
UICatalogService.prototype.initializeDb = function(callback) {
    logger.info('intializing db');

    // array of predefined catalogs to be loaded
    var catalogToReturnName = 'r1ui5.json';
    //put here root: [custom, custom]
    var catalogsFileNames = {
        'r1ui5.json': ['r1c1ui5.json', 'r1c2ui5.json'],
        'r2angular.json': ['r2c1angular.json'],
        'r3html.json': ['r3c1html.json'],
        'r4ui5.json': ['r4c1ui5.json']
    };

    var that = this;
    var catalogToReturn;

    //TODO move this in a separate place
    var ui5Id, angularId, htmlId;
    //read row by row the object
    var promises = _.map(catalogsFileNames, function(customCatalogsFileNames, rootCatalogFileName) {
        // flatten the file names
        var fileNames = _.clone(customCatalogsFileNames);
        //last one is the root!
        fileNames.push(rootCatalogFileName);
        var indexOfCatalogToReturn = _.indexOf(fileNames, function(name) {
            return name === catalogToReturnName;
        });
        //read files
        return that.getFiles(fileNames)
            //map files to json objects
            .then(function(files) {
                return _.map(files, JSON.parse);
            })
            //update all catalogs
            .then(function(jsons) {
                var updatePromises = _.map(jsons, function(json) {
                    return that.updateCatalog(json);
                });
                return promise.all(updatePromises);
            })
            //associate rootControlID to custom catalogs
            .then(function(catalogs) {
                if (indexOfCatalogToReturn >= 0) {
                    catalogToReturn = catalogs[indexOfCatalogToReturn];
                }
                //because last one is the roots
                var rootCatalog = catalogs.pop();
                var customCatalogs = catalogs;

                //TODO move this in a separate place
                var rootCatalogId = rootCatalog._id;
                if (rootCatalogFileName === 'r1ui5.json') {
                    ui5Id = rootCatalogId;
                }
                else if (rootCatalogFileName === 'r2angular.json') {
                    angularId = rootCatalogId;
                }
                else if (rootCatalogFileName === 'r3html.json') {
                    htmlId = rootCatalogId;
                }
                return that.checkForData(rootCatalog, customCatalogs);
            });
    });
    promise.all(promises)
        // assumes all ids have been set
        //TODO move this in a separate place
        .then(function() {
            return that.updateMashupIds(ui5Id, angularId, htmlId);
        })
        //return only the main catalog
        .then(function() {
            callback(null, catalogToReturn);
        })
        .catch(function(err) {
            callback(err, err);
        });
};

UICatalogService.prototype.initializeLibrary = function(callback) {
    logger.info('intializing library');
    // we can populate the data from config.json
    var self = this;
    var openui5zip;
    var filePromises;
    var conditions = {
        $and: [
            {
                'metadata.libraryType': 'openui5'
            },
            {
                'metadata.libraryVersion': '1.26.6'
            },
            {
                'metadata.isPrivate': false
            }
        ]
    };

    getGridModel().remove(conditions).lean().exec(function(err, file) {
        if (err) {
            callback(err, err);
        }
    });

    fs.readFile(self.readAndGenerateZip(), function(err, data) {
            if (err) {
                callback(err, err);
            }
            openui5zip = new JSZip(data);
            if (_.isEmpty(openui5zip.files)) {
                return promise.reject('no files to load');
            }
            filePromises = _.map(openui5zip.files, function(fileName) {
                var deferred = promise.defer();
                self.storeNewFile(fileName, 'openui5', '1.26.6', false).then(
                    function(result) {
                        deferred.resolve(result);
                    },
                    function(err) {
                        deferred.reject(err);
                    }
                );
                return deferred.promise;
            });

            promise.all(filePromises)
                .then(function(files) {
                    if (files && files.length === openui5zip.files) {
                        callback(null, files);
                    }
                    else {
                        callback(null, 'not all files could be loaded');
                    }
                });
        });
};

function readDirectory(dir, filelist) {
    if (dir[dir.length - 1] !== '/') {
        dir = dir.concat('/');
    }
    var files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
        if (fs.statSync(dir + file).isDirectory()) {
            // 27 is the count of the string 'node_modules/norman-openui5'
            zip.folder(dir.substring(27, dir.length) + file);
            filelist = readDirectory(dir + file + '/', filelist);
        }
        else {
            filelist.push(dir + file);
            var input = fs.readFileSync(dir + file);
            zip.file(dir.substring(27, dir.length) + file, input);
        }
    });
    return filelist;
}

UICatalogService.prototype.readAndGenerateZip = function() {
    var filePath = '../../api/catalog/sampleTemplate/';
    var fileName = "openui5-runtime-1.26.6.zip";
    var zipfile = path.join(__dirname, filePath + fileName);
    return zipfile;
};

UICatalogService.prototype.extractLibrary = function(callback) {
    logger.info('intializing metadata generator');
    var filePath = '../../api/catalog/metadata/';
    var fullPath = path.join(__dirname, filePath);
    var files = fs.readdirSync(fullPath);

    var conditions = {
        'metaData.forCanvas': true
    };

    getGridModel().remove(conditions).lean().exec(function(err, file) {
        if (err) {
            callback(err, err);
        }
    });
    var filePromises = _.map(files, function(file) {
        var deferred = promise.defer();
        var metaData = {};
        metaData.contentType = mime.lookup(path.basename(file));
        metaData.forCanvas = true;
        metaData.updated_at = Date.now();
        metaData.created_at = Date.now();
        metaData.libraryType = 'openui5';
        metaData.libraryVersion = '1.0';
        metaData.isPrivate = false;
        metaData.path = fullPath + file;
        var writeStream = commonService.getGridFs().createWriteStream({
            filename: file,
            mode: 'w',
            metadata: metaData,
            root: 'library'
        });

        var output;
        try {
            output = fs.readFileSync(fullPath + file);
        } catch (err) {
            logger.error('error' + err);
        }
        var readStream = stream.createReadStream(output).pipe(writeStream);
        readStream.on('close', function(zipEntryToken) {
            deferred.resolve(zipEntryToken);
        });
        readStream.on('error', function(err) {
            deferred.reject(err);
        });
        metaData = {};
        return deferred.promise;
    });
    promise.all(filePromises)
        .then(function(fileNames) {
            if (fileNames && fileNames.length === files.length) {
                callback(null, fileNames);
            }
            else {
                callback(null, 'not all files could be loaded');
            }
        });
};

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

UICatalogService.prototype.storeNewFile = function(zipEntry, libType, libVersion, isPrivate) {
    var deferred = promise.defer();
    var metaData = {};
    metaData.updated_at = Date.now();
    metaData.created_at = Date.now();
    metaData.libraryType = libType;
    metaData.libraryVersion = libVersion;
    metaData.isPrivate = isPrivate;
    var fileName = zipEntry.name;
    if (!zipEntry.dir && !endsWith(zipEntry.name, '/')) {
        var regex = new RegExp('[^/]+$');
        var match = regex.exec(zipEntry.name);
        fileName = match[0];
        metaData.extension = match[0].split('.')[1];
        try {
            metaData.contentType = mime.lookup(metaData.extension);
        } catch (err) {
            logger.info('couldn\'t get content type for ' + metaData.name);
        }
    }
    metaData.path = zipEntry.name;
    // metaData.length = zipEntry.header.size;
    var writeStream = commonService.getGridFs().createWriteStream({
        filename: fileName,
        mode: 'w',
        metadata: metaData,
        root: 'library'
    });

    var readStream = stream.createReadStream(zipEntry.asNodeBuffer()).pipe(writeStream);
    readStream.on('close', function(zipEntryToken) {
        writeStream.end();
        deferred.resolve(zipEntry.name);
    });
    readStream.on('error', function(err) {
        logger.error(' in the error of readstream ');
        deferred.reject(err);
    });
    return deferred.promise;
};
// UICatalogService.prototype.initializeDb = function(callback) {
//     logger.info('intializing db');
//     // array of predefined catalogs to be loaded
//     var filePath = "../../api/catalog/sampleTemplate/";
//     var files = ['r1ui5.json', 'r1c1ui5.json', 'r2angular.json', 'r2c1angular.json', 'r3html.json', 'r3c1html.json'];
//     var filePathArray = [];
//     var that = this;
//     for (var count = 0; count < files.length; count++) {
//         files[count] = path.join(__dirname, filePath + files[count]);
//         fs.readFile(files[count], 'utf8', that.checkForData(files.length, callback));
//     }
// }

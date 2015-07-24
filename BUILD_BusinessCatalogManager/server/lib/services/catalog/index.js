'use strict';

require('norman-promise');
var ImportMetadata = require('./ImportMetadata.js');
var ImportAnnotations = require('./ImportAnnotations.js');
var Converter = require('../metadataConverter');
var extend = require('util')._extend;
var request = require('request');
var path = require('path');
var fs = require('fs');
var catalogModel = require('./model.js');
var _ = require('norman-server-tp').lodash;

var commonServer = require('norman-common-server');
var logger = commonServer.logging.createLogger('businessCatalog-service');

commonServer.logging.manager.on('configure', function () {
    logger = commonServer.logging.createLogger('businessCatalog-service');
});


var METADATA_FOLDER = 'metadata';

function CatalogService(model) {
    if (!(this instanceof CatalogService)) {
        return new CatalogService(model);
    }

    this.model = model;
}

module.exports = CatalogService;

CatalogService.prototype.initialize = function (done) {
    var model = catalogModel.create();
    this.model = model.Catalog;
    done();
};

CatalogService.prototype.onInitialized = function () {
};

function importFile(fileName) {
    return new Promise(function (resolve, reject) {
        var filePath = path.resolve(__dirname, METADATA_FOLDER, fileName);

        logger.debug('import file: ' + fileName);
        fs.readFile(filePath, function (err, metadata) {
            if (err) {
                reject(err);
            }
            else {
                var catalog = Converter.getCatalog(metadata);
                catalog.name = path.basename(filePath, path.extname(filePath));
                catalog.description = path.basename(filePath, path.extname(filePath));

                resolve(catalog);
            }
        });
    });
}

function remove(model) {
    return new Promise(function (resolve, reject) {
        model.remove(function (error) {
            if (error) {
                reject(error);
            }
            else {
                resolve();
            }
        });
    });
}

function create(model, catalog) {
    return new Promise(function (resolve, reject) {
        model.create(catalog, function (error) {
            if (error) {
                reject(error);
            }
            else {
                resolve();
            }
        });
    });
}

CatalogService.prototype.initializeSchema = function (done) {
    logger.info('initializeSchema >>');
    var self = this;
    return new Promise(
        function (resolve, reject) {
            var modelPath = path.resolve(__dirname, METADATA_FOLDER), catalog;

            Promise.invoke(fs.readdir, modelPath)
                .then(function (result) {
                    var promises = [];
                    result.forEach(function (fileName) {
                        if (path.extname(fileName) === '.xml') {
                            promises.push(importFile(fileName));
                        }
                    });

                    return Promise.all(promises);
                })
                .then(function (result) {
                    catalog = result;

                    // delete old catalog
                    return remove(self.model);
                })
                .then(function () {
                    // create new catalog
                    return create(self.model, catalog);
                })
                .then(function () {
                    logger.info('<< initializeSchema');
                    resolve(true);
                })
                .catch(function (err) {
                    logger.error(err);
                    reject(err);
                });
        })
        .callback(done);
};

CatalogService.prototype.checkSchema = function (done) {
    catalogModel.createIndexes(done);
};

CatalogService.prototype.shutdown = function (done) {
    done();
};


CatalogService.prototype.getCatalogs = function () {
    var deferred = Promise.defer();

    this.model.find(function (err, catalogs) {
        if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve(catalogs);
        }
    });

    return deferred.promise;
};

CatalogService.prototype.getCatalog = function (catalogId) {
    var deferred = Promise.defer();

    if (typeof catalogId === 'string') {
        catalogId = {_id: catalogId};
    }

    this.model.findOne(catalogId, function (err, catalog) {
        if (err) {
            deferred.reject(err);
        }
        else {
            if (catalog) {
                deferred.resolve(catalog);
            }
            else {
                deferred.reject('Catalog not found: ' + catalogId);
            }
        }
    });

    return deferred.promise;
};

CatalogService.prototype.createCatalog = function (catalog) {
    var deferred = Promise.defer();

    this.model.create(catalog, function (err, createdCatalog) {
        if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve(createdCatalog);
        }
    });

    return deferred.promise;
};

CatalogService.prototype.updateCatalog = function (catalogId, catalog) {
    var deferred = Promise.defer();

    if (catalog._id) {
        delete catalog._id;
    }

    this.model.findByIdAndUpdate(catalogId, catalog, function (err, foundCatalog) {
        if (err) {
            deferred.reject(err);
        }
        else {
            if (foundCatalog) {
                deferred.resolve(foundCatalog);
            }
            else {
                deferred.reject('Catalog not found: ' + catalogId);
            }
        }
    });


    return deferred.promise;
};

CatalogService.prototype.removeCatalog = function (catalogId) {
    var deferred = Promise.defer();

    this.model.findById(catalogId, function (err, catalog) {
        if (err) {
            deferred.reject(err);
        }
        else {
            if (catalog) {
                catalog.remove(function (removalErr) {
                    if (removalErr) {
                        deferred.reject(removalErr);
                    }
                    else {
                        deferred.resolve();
                    }
                });
            }
            else {
                deferred.reject('Catalog not found: ' + catalogId);
            }
        }
    });

    return deferred.promise;
};

CatalogService.prototype.searchEntities = function (context) {
    var self = this;
    return new Promise(function (resolve, reject) {
        if (context && context.search) {
            if (/^[a-zA-Z_]\w{0,127}$/.test(context.search)) {
                var re = new RegExp('^' + context.search + '.*', 'i');
                var condition = {'entities.name': re};

                self.model.find(condition,
                    function (err, Catalogs) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            var entities = [];
                            Catalogs.forEach(function (catalog) {
                                var newCatalog = {
                                    id: catalog._id.toString(),
                                    name: catalog.name,
                                    description: catalog.description,
                                    entityCount: catalog.entities.length
                                };

                                catalog.entities.forEach(function (entity) {
                                    if (re.test(entity.name)) {
                                        entities.push(extend({catalog: newCatalog}, entity.toObject()));
                                    }
                                });
                            });

                            entities.sort(function (a, b) {
                                if (a.name > b.name) {
                                    return -1;
                                }
                                if (a.name < b.name) {
                                    return 1;
                                }
                                return 0;
                            });

                            resolve(entities);
                        }
                    });
            }
            else {
                reject('Not supported');
            }
        }
        else {
            reject('Not supported');
        }
    });
};

CatalogService.prototype.import = function (context) {
    var deferred = Promise.defer();
    var that = this;
    if (context == null || !context.login || !context.pwd) {
        deferred.reject({message: 'Missing username or password'});
    }
    else {
        var importID = importID++;
        this.getServiceCatalog(importID, context).fin(function () {
            ImportAnnotations.initTracking(importID);
            ImportAnnotations.import(that.model, importID, context).then(function () {
                deferred.resolve({importID: importID});
            }, function (err) {
                deferred.reject(err);
            });
        });
    }

    return deferred.promise;
};


CatalogService.prototype.getServiceCatalog = function (importID, context) {
    var deferred = Promise.defer();
    var that = this;
    ImportMetadata.initTracking(importID);
    var options = {
        auth: {
            user: context.login,
            pass: context.pwd
        },
        rejectUnauthorized: false
    };

    this.model.find().remove(function (err) {
        if (err) {
            deferred.reject(err);
        }
        else {
            request(context.url, options, function (error, response, body) {
                if (!error && response.statusCode === 200) {
                    var data = JSON.parse(body);
                    if (data) {
                        ImportMetadata.importServiceCatalog(that.model, importID, data, options);
                        deferred.resolve({importID: importID});
                    }
                }
                else {
                    if (response) {
                        deferred.reject('Http status ' + response.statusCode);
                    }
                    else {
                        deferred.reject('Http request failed');
                    }
                }
            });

        }
    });
    return deferred.promise;
};

CatalogService.prototype.importMetadata = function (metadata) {
    var deferred = Promise.defer();

    ImportMetadata.importFromMetadata(deferred, this.model, metadata);

    return deferred.promise;
};

CatalogService.prototype.getEntity = function (entityId) {
    var self = this;
    return new Promise(function (resolve, reject) {
        self.model.find({'entities._id': entityId}, function (err, Catalogs) {
            if (err) {
                reject(err);
            }
            else {
                var result = {};
                _.forEach(Catalogs, function (catalog) {
                    _.forEach(catalog.entities, function (entity) {
                        if (entity._id.toString() === entityId) {
                            result = entity.toObject();
                            return false;
                        }
                    });

                    return !result;
                });

                if (result) {
                    resolve(result);
                }
                else {
                    reject('not found');
                }
            }
        });
    });
};

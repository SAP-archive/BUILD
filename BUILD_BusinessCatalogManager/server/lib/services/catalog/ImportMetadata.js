'use strict';
var commonServer = require('norman-common-server');
var request = require('request');
var Converter = require('../metadataConverter');
require('norman-promise');
var logger = commonServer.logging.createLogger('catalog-service');

var mCurrentImports = {};

exports.initTracking = function (importID) {
    mCurrentImports[importID] = {
        state: 'starting',
        success: 0,
        failed: 0,
        total: 0,
        services: []
    };
};

exports.getImportStatus = function (importID) {
    return mCurrentImports[importID];
};

exports.importServiceCatalog = function (catalogModel, importID, serviceCatalog, options) {
    var that = this;
    var importedService = {};
    mCurrentImports[importID].state = 'runnning';
    mCurrentImports[importID].total = serviceCatalog.d.results.length;

    var importPromises = [];
    var currentCallPromise = null;
    serviceCatalog.d.results.forEach(function (service) {
        if (service.TechnicalServiceName.indexOf('UI2') === -1 && service.MetadataUrl.indexOf('ui2') === -1) { // TODO: define better filter
            importedService[service.Title] = service;

            var fnImport = function () {
                var callPromise = that.import(catalogModel, service, options);
                importPromises.push(callPromise);

                callPromise.then(function (/*createdCatalog*/) {
                    mCurrentImports[importID].success++;

                }, function (/*reason*/) {
                    mCurrentImports[importID].failed++;
                });
                return callPromise;
            };

            if (currentCallPromise == null) {
                currentCallPromise = fnImport();
            }
            else {
                currentCallPromise = currentCallPromise.delay(1500).then(fnImport, fnImport);
            }
        }
    });
    Pronise.all(importPromises).then(function () {
        mCurrentImports[importID].state = 'finished';
    });

};

exports.import = function (catalogModel, service, options) {
    var that = this;
    var deferred = Promise.defer();

    logger.debug({metadataUrl: service.MetadataUrl}, 'Importing metadata');
    request(service.MetadataUrl, options, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            that.importFromMetadata(deferred, catalogModel, body, service);
        }
        else {
            deferred.reject(error);
        }
    });

    return deferred.promise;
};

exports.importFromMetadata = function (deferred, catalogModel, metadata, service) {
    var catalog = Converter.getCatalog(metadata);
    if (!catalog) {
        deferred.reject(new Error('Cannot parse Metadata'));
        return;
    }

    if (service) {
        catalog.name = service.Title;
        catalog.description = service.Description;
        catalog.creationDatetime = new Date(parseInt(service.UpdatedDate.substr(6), 10));
        catalog.author = service.Author;
    }

    exports.calculateRootEntity(catalog.entities);

    catalogModel.create(catalog, function (err, createdCatalog) {
        if (err) {
            deferred.reject(new Error(err));
        }
        else {
            deferred.resolve(createdCatalog);
        }
    });
};

exports.calculateRootEntity = function (entities) {
    // Find the root based on the number of sub entities (recursive) found
    // using the navigation properties with multiple = true (and if needed the number of direct navigation properties).
    // Else take the first entity
    var i, infoEntities = {}, currentEntity, exploredEntities, currentNavPropCount, update,
        rootEntity = {subEntityCount: 0, navPropCount: 0};
    for (i = 0; i < entities.length; i++) {
        currentEntity = entities[i];
        infoEntities[currentEntity.name] = {entity: currentEntity, count: 0};
    }
    for (i = 0; i < entities.length; i++) {
        currentEntity = entities[i];
        exploredEntities = {count: 0, entities: {}};
        exploredEntities.entities[currentEntity.name] = currentEntity.name;
        recursSubEntities(currentEntity, exploredEntities, infoEntities);
        if (exploredEntities.count >= rootEntity.subEntityCount) {
            update = true;
            currentNavPropCount = currentEntity.navigationProperties ? currentEntity.navigationProperties.length : 0;
            if (exploredEntities.count === rootEntity.subEntityCount) {
                if (currentNavPropCount <= exploredEntities.navPropCount) {
                    update = false;
                }
            }
            if (update) {
                rootEntity.entity = currentEntity;
                rootEntity.subEntityCount = exploredEntities.count;
                rootEntity.navPropCount = currentNavPropCount;
            }
        }
        infoEntities[currentEntity.name].count = exploredEntities.count;
    }

    if (rootEntity.entity) {
        rootEntity.entity.isRoot = true;
    }
    else if (entities.length > 0) {
        entities[0].isRoot = true;
    }
};

function recursSubEntities(currentEntity, exploredEntities, infoEntities) {
    var j, currentNavProp, navPropEntityName;
    if (currentEntity.navigationProperties) {
        for (j = 0; j < currentEntity.navigationProperties.length; j++) {
            currentNavProp = currentEntity.navigationProperties[j];
            navPropEntityName = currentNavProp.toEntity;
            if (!exploredEntities.entities[navPropEntityName] && currentNavProp.multiplicity === true) {
                // not explored yet and only explore multiple nav properties
                exploredEntities.entities[navPropEntityName] = navPropEntityName;
                exploredEntities.count += 1;
                recursSubEntities(infoEntities[navPropEntityName].entity, exploredEntities, infoEntities);
            }
        }
    }
}

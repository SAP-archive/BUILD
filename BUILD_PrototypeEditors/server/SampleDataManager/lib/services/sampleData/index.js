'use strict';

var commonServer = require('norman-common-server');
var NormanError = commonServer.NormanError;
var dataManager = require('./dataManager.js');
var dataAdapter = require('./dataAdapter.js');
var registry = require('norman-common-server').registry;
var _ = require('norman-server-tp').lodash;
var DataModelHelper = require('./dataModelHelper');
var SDModel = require('./model').getModel().SampleData;

commonServer.logging.manager.on('configure', function () {
    commonServer.logging.createLogger('sample-service');
});

function SampleDataService() {
    if (!(this instanceof SampleDataService)) {
        return new SampleDataService();
    }
}

module.exports = SampleDataService;

function _getDataModel(projectId) {
    var dataModeler = registry.getModule('Model');
    return dataModeler.getModel(projectId);
}

SampleDataService.prototype.onInitialized = function () {
    dataManager.onInitialized();
    dataAdapter.onInitialized();
};

SampleDataService.prototype.initialize = function (done) {
    this.mongooseModel = dataManager.initialize();
    done();
};

SampleDataService.prototype.checkSchema = function (done) {
    dataManager.checkSchema(done);
};

SampleDataService.prototype.shutdown = function (done) {
    done();
};

SampleDataService.prototype.getSampleDataMetadata = function (projectId) {
    var newModel = {
        projectId: projectId
    };
    var metadata = [{
        model: new this.mongooseModel(newModel),
        type: 'sampleMetadata',
        OP: 'CREATE'
    }];
    return metadata;
};

/**
 * [getEntityNavDataForProj get single entity data and the corresponding nav tables data from db]
 * @param  {String} sampleDataId [id of an existing sample data]
 * @param  {String} entityName   [single entity name]
 * @return {Promise}              [returns a promise]
 */
SampleDataService.prototype.getEntityNavDataForProj = function (projectId, entityName) {
    return _getDataModel(projectId).then(function (dataModelJson) {
        if (!dataModelJson) {
            throw 'Data Model: ' + projectId + ' not found';
        }
        var dm = new DataModelHelper(dataModelJson);
        var navs = dm.getNavEntityInfo(entityName);
        var entityNames = _.map(navs, function (nav) {
            return nav.entityName.toLowerCase();
        });
        entityNames.push(entityName.toLowerCase());
        return dataManager.getSDfromProjId(projectId, null, true)
            .then(function (sampleData) {
                var filteredEntities = _.filter(sampleData.entities, function (entity) {
                    var found = (entityNames.indexOf(entity.entityName.toLowerCase()) !== -1);
                    return found;
                });
                sampleData.entities = filteredEntities;
                return {
                    dataModelJson: dataModelJson,
                    sampleData: sampleData,
                    navigationEntities: navs,
                    idMap: dm.idMap
                };
            });
    });
};

/**
 * [updateSDfromProjId update sample data for a related project]
 * @param  {Object} dataModelJson [model in json]
 * @param  {Object} sampleData    [data in json]
 * @param {string} User
 * @param {string} buildSessionId
 * @return {Promise}              [The fulfilled promise contains update data]
 */
SampleDataService.prototype.updateSDfromProjId = function (dataModelJson, sampleData, waitTiltAllEventsProcessed, user, buildSessionId) {
    if (!dataModelJson) {
        throw new NormanError('Data Model is required for validation.');
    }
    var projectId = dataModelJson.projectId;
    sampleData.projectId = projectId;
    var SDDoc = new SDModel(sampleData);
    return dataManager.updateSD(dataModelJson, SDDoc, true, waitTiltAllEventsProcessed, user, buildSessionId)
        .then(function () {
            return dataManager.getSDfromProjId(projectId);
        })
        .then(function (result) {
            if (!result) {
                return null;
            }
            return result.toJSON();
        })
        .catch(function (err) {
            throw err;
        });
};

/**
 * [getSDfromProjId retrieve sample data for a given project]
 * @param  {String}  projectId     [related project id in string]
 * @param  {[Array]} entityNames   [array of desired entities to be fetched]
 * @return {Promise}               [The fulfilled promise contains the sample data]
 */
SampleDataService.prototype.getSDfromProjId = function (projectId, entityNames, waitTiltAllEventsProcessed) {
    return dataManager.getSDfromProjId(projectId, entityNames, waitTiltAllEventsProcessed).then(function (sampleDataModel) {
        if (sampleDataModel) {
            return sampleDataModel.toJSON();
        }
        return null;
    });
};


/**
 * [getEntityDataFromProjId fetch entity data only]
 * @param  {String} projectId  [related project id]
 * @param  {String} entityName [name of required entity]
 * @return {Promise}            [The fulfilled promise contains the entity data]
 */
SampleDataService.prototype.getEntityDataFromProjId = function (projectId, entityName, waitTiltAllEventsProcessed) {
    return this.getSDfromProjId(projectId, [entityName], waitTiltAllEventsProcessed)
        .then(function (result) {
            var resultOut = {};
            if (result && result.entities[0]) {
                resultOut = result.entities[0].properties;
            }
            return resultOut;
        });
};

var entityNameLcase = null;
function findEntityIndex(item) {
    return item.entityName.toLowerCase() === entityNameLcase;
}


/**
 * [updateEntitiesfromProjId save sample data for a given entities]
 * @param  {Object}  dataModelJson
 * @param  {Object} sampleDataUpdated
 * @param  {[boolean]} waitTiltAllEventsProcessed
 * @param  {[object]} user
 * @param {string} buildSessionId
 * @return {Promise}
 */
SampleDataService.prototype.updateEntitiesfromProjId = function (dataModelJson, sampleDataUpdated, waitTiltAllEventsProcessed, user, buildSessionId) {
    var projectId = sampleDataUpdated.projectId;
    return dataManager.getSDfromProjId(projectId, null, waitTiltAllEventsProcessed)
        .then(function (sampleDataModel) {
            if (sampleDataModel) {
                var sampleData = sampleDataModel.toJSON();
                for (var i = 0; i < sampleDataUpdated.entities.length; i++) {
                    entityNameLcase = sampleDataUpdated.entities[i].entityName.toLowerCase();
                    var foundEntity = _.findIndex(sampleData.entities, findEntityIndex);
                    if (foundEntity || foundEntity === 0) {
                        sampleData.entities[foundEntity] = sampleDataUpdated.entities[i];
                    }
                }
                if (!dataModelJson) {
                    throw new NormanError('Data Model is required for validation.');
                }
                var SDDoc = new SDModel(sampleData);
                return dataManager.updateSD(dataModelJson, SDDoc, true, waitTiltAllEventsProcessed, user, buildSessionId);
            }
        })
        .then(function () {
            return dataManager.getSDfromProjId(projectId);
        })
        .then(function (result) {
            if (!result) {
                return null;
            }
            return result.toJSON();
        })
        .catch(function (err) {
            throw err;
        });
};

'use strict';

var commonServer = require('norman-common-server');
var DataModel = require('./dataModelHelper');
var Promise = require('norman-promise');
var _ = require('norman-server-tp').lodash;
var serviceLogger = commonServer.logging.createLogger('sampleDataService');
var prototypeHelper = require('./prototypeHelper');

var removeEntity = null;

function throwErrors(errorList, pDefer) {
    var validationError = {
        text: 'Validation Failed',
        errorList: errorList
    };
    pDefer.reject(validationError);
    // throw validationError;
}

function lodashRemoveEntity(item) {
    if (!item) {
        return true;
    }
    return item.entityName === removeEntity;
}

function removeNull(item) {
    return !Object.keys(item).length;
}

function SampleDataManager(sampleData, dataModel, bValidate, pDefer) {
    var p = Promise.defer();
    var errorList = [];
    if (!(this instanceof SampleDataManager)) {
        return new SampleDataManager(sampleData, dataModel, bValidate);
    }
    this.sampleData = sampleData;
    if (bValidate) {
        if (!dataModel) {
            var dmError = {
                text: 'Data Model is required for validation.'
            };
            errorList.push(dmError);
            throwErrors(errorList, pDefer);
        }
        this.dataModel = new DataModel(dataModel);
    }
    // validates primary key uniqueness
    // works for complex keys as well
    this.validatePrimaryKeys = function (primaryKeys) {
        if (!primaryKeys) {
            return;
        }
        var pkNames = null;

        function concatKeys(elem) {
            return JSON.stringify(elem, pkNames);
        }

        function checkItem(item) {
            var checkIfExists = _.findWhere(uniq, item);
            if (!checkIfExists) {
                uniq.push(item);
            }
            return !_.findWhere(uniq, item);
        }
        for (var entityId in primaryKeys) {
            var entityPKs = primaryKeys[entityId];
            pkNames = _.keys(entityPKs[0]);
            _.remove(primaryKeys[entityId], removeNull);
            var trimmedData = _.uniq(primaryKeys[entityId], concatKeys);
            var differdrows = _.difference(primaryKeys[entityId], trimmedData);

            var uniq = [];

            _.find(differdrows, checkItem);
            differdrows = uniq;
            if (differdrows.length > 0) {
                for (var i = 0; i < differdrows.length; i++) {
                    var DifferKeys = _.keys(differdrows[i]);
                    DifferKeys = DifferKeys[0];
                    var dupPK = {
                        text: 'Duplicate Key',
                        column: differdrows[i][DifferKeys],
                        entityName: this.dataModel.idMap.entityMap[entityId].name,
                        colname: this.dataModel.idMap.entityMap[entityId].properties[DifferKeys].name,
                        isKey: true
                    };
                    if (dupPK.column) {
                        errorList.push(dupPK);
                    }
                }
            }
        }
    };

    this.validateForeignKeys = function (primKeyArrays) {
        for (var i = 0; i < this.sampleData.entities.length; i++) {
            var entity = this.sampleData.entities[i];
            var dEntityProp = this.dataModel.getModelEntityNameMap(entity.entityName);
            var dPropNames = dEntityProp.properties;
            for (var j = 0; j < entity.properties.length; j++) {
                var prop = entity.properties[j];
                for (var propName in prop) {
                    var propMeta = dPropNames[propName.toLowerCase()];
                    if (!propMeta.isForeignKey) {
                        continue;
                    }
                    var dPrimKeyData = this.dataModel.getPrimaryKeyMetaData(entity.entityId, propMeta._id);
                    if (!dPrimKeyData) {
                        prop[propName] = null;
                        continue;
                    }
                    if (!primKeyArrays[dPrimKeyData.entityId]) {
                        continue;
                    }
                    var primKeyVals = primKeyArrays[dPrimKeyData.entityId][dPrimKeyData.primaryKeyId];
                    if (!primKeyVals) {
                        prop[propName] = null;
                        continue;
                    }
                    if (primKeyVals.indexOf(prop[propName]) === -1) {
                        prop[propName] = null;
                    }
                }
            }
        }
    };

    // format corrects the entity and property names (case) as per Data Model
    // format does the check for existence of entity names and property names
    this.formatAndValidate = function () {

        var primaryKeys = {};
        var primKeyArrays = {};
        var uniqueEntities = _.uniq(this.sampleData.entities, function (item) {
            return item.entityName.toLowerCase();
        });
        if (uniqueEntities.length !== this.sampleData.entities.length) {
            var dupEntity = {
                text: 'Duplicate Entities found.'
            };
            errorList.push(dupEntity);
            // also removes the duplicated entity to avoid clash in further validation
        }
        var removableEntities = [];
        this.sampleData.entities = _.map(this.sampleData.entities, function (sdEntity) {
            var outEntity = {};
            var lEntityProp = this.dataModel.getModelEntityNameMap(sdEntity.entityName);
            if (!lEntityProp) {
                var entityNotFound = {
                    text: 'Entity "' + sdEntity.entityName + '" not found'
                };
                errorList.push(entityNotFound);
                // remove if invalid entity to skip property validation
                removableEntities.push(sdEntity.entityName);
                return null;
            }
            outEntity.entityName = lEntityProp.name;
            outEntity.entityId = lEntityProp._id;
            var dPropNames = lEntityProp.properties;
            primaryKeys[lEntityProp._id] = [];
            primKeyArrays[lEntityProp._id] = {};
            var primaryKeyValue;
            outEntity.properties = _.map(sdEntity.properties, function (sdPropObj) {
                var pmKeyEntry = {};
                var outProp = {};
                for (var sdPropName in sdPropObj) {
                    var propMeta = dPropNames[sdPropName.toLowerCase()];
                    var propValue = sdPropObj[sdPropName];
                    if (!propMeta) {
                        errorList.push({
                            text: 'Invalid property: ' + sdPropName
                        });
                        continue;
                    }
                    var calculated = propMeta.calculated;
                    if (calculated && calculated.inputProperties && calculated.inputProperties.length !== 0) {
                        // its a calculated property so eliminate the property
                        continue;
                    }
                    if (propMeta.isKey && !propValue) {
                        var keyMissing = {
                            text: 'Key value missing',
                            column: propValue,
                            entityName: sdEntity.entityName,
                            colname: propMeta.name,
                            isKey: true
                        };
                        if (!_.findWhere(errorList, keyMissing)) {
                            errorList.push(keyMissing);
                        }
                    }
                    var expectedType = propMeta.propertyType;
                    var convertedValue = module.exports.checkAndConvertType(propValue, expectedType);
                    if ((propValue !== convertedValue) && (convertedValue === null)) {
                        // conversion error happened
                        var conversionError = {
                            text: 'Type mismatch',
                            column: propValue,
                            entityName: sdEntity.entityName,
                            colname: propMeta.name
                        };
                        errorList.push(conversionError);
                    }
                    outProp[propMeta.name] = convertedValue;
                    if (propMeta.isKey) {
                        primaryKeyValue = propValue;
                        pmKeyEntry[propMeta._id] = convertedValue;
                        if (!primKeyArrays[lEntityProp._id][propMeta._id]) {
                            primKeyArrays[lEntityProp._id][propMeta._id] = [];
                        }
                        primKeyArrays[lEntityProp._id][propMeta._id].push(convertedValue);
                    }
                }
                errorList.forEach(function (error) {
                    if (!error.primaryKey) {
                        error.primaryKey = primaryKeyValue;
                    }
                });
                primaryKeys[lEntityProp._id].push(pmKeyEntry);
                return outProp;
            }, this);
            return outEntity;
        }, this);
        if (removableEntities.length > 0) {
            for (var i = 0; i < removableEntities.length; i++) {
                removeEntity = removableEntities[i];
                _.remove(this.sampleData.entities, lodashRemoveEntity);
            }
        }
        this.validatePrimaryKeys(primaryKeys);
        this.validateForeignKeys(primKeyArrays);
    };
    if (bValidate) {
        this.formatAndValidate();
        if (errorList.length > 0) {
            throwErrors(errorList, pDefer);
        }
    }
    return p.Promise;
}

module.exports = {
    initialize: function () {
        return prototypeHelper.initialize();
    },
    checkSchema: function (done) {
        prototypeHelper.checkSchema(done);
    },
    onInitialized: function () {
        prototypeHelper.onInitialize();
    },


    // API call

    updateSD: function (dataModelJson, sampleData, bValidate, bWait, user, buildSessionId) {

        if (!dataModelJson.projectId) {
            return Promise.reject('Project Id is mandatory.');
        }
        if (sampleData.projectId) {
            if (sampleData.projectId !== dataModelJson.projectId) {
                return Promise.reject('Invalid Project Id.');
            }
        }
        else {
            sampleData.projectId = dataModelJson.projectId;
        }

        var generateSDMInstance = function () {
            var p = Promise.defer();
            try {
                p.resolve(new SampleDataManager(sampleData, dataModelJson, bValidate, p));
            }
            catch (err) {
                p.reject(err);
            }
            return p.promise;
        };

        return generateSDMInstance()
            .then(function (sdMInstance) {
                return prototypeHelper.update(sdMInstance.sampleData, user, true, buildSessionId);
            })
            .catch(function (err) {
                serviceLogger.error(err);
                throw err;
            });

    },


    // model change

    updateSDNoValidation: function (sampleData, user) {
        var sdMInstance = new SampleDataManager(sampleData, null, false);

        return prototypeHelper.update(sdMInstance.sampleData, user, false)
            .catch(function (err) {
                serviceLogger.error(err);
                throw err;
            });
    },

    getSDfromProjId: function (projectId, entityNamesArray) {

        return prototypeHelper.get(projectId)
            .then(function (result) {
                if (!result) {
                    return null;
                }
                var sdResult = result;
                if (entityNamesArray && entityNamesArray.length > 0) {
                    var lEntityNamesArray = _.map(entityNamesArray, function (name) {
                        return name.toLowerCase();
                    });
                    var filteredEntities = _.filter(sdResult.entities, function (entity) {
                        return (lEntityNamesArray.indexOf(entity.entityName.toLowerCase()) !== -1);
                    });
                    sdResult.entities = filteredEntities;
                }
                return sdResult;
            })
            .catch(function (err) {
                serviceLogger.error(err);
                throw err;
            });
    },

    getSDfromProjIdNoWait: function (projectId, entityNamesArray) {
        return prototypeHelper.get(projectId)
            .then(function (result) {
                if (!result) {
                    return null;
                }
                var sdResult = result;
                if (entityNamesArray && entityNamesArray.length > 0) {
                    var lEntityNamesArray = _.map(entityNamesArray, function (name) {
                        return name.toLowerCase();
                    });
                    var filteredEntities = _.filter(sdResult.entities, function (entity) {
                        return (lEntityNamesArray.indexOf(entity.entityName.toLowerCase()) !== -1);
                    });
                    sdResult.entities = filteredEntities;
                }
                return sdResult;
            }, function (err) {
                serviceLogger.error(err);
                throw err;
            });
    },

    checkAndConvertType: function (data, toType) {
        if (data === null || data === undefined || !toType) {
            return null;
        }
        switch (toType.toLowerCase()) {
            case 'decimal':
            case 'float':
            case 'number':
            case 'single':
            case 'double':
                if (typeof (data) === 'number') {
                    return data;
                }
                var parsedNum = parseFloat(data);
                if (!isNaN(parsedNum)) {
                    return parsedNum;
                }
                return null;
            case 'int':
            case 'int16':
            case 'int32':
            case 'int64':
            case 'integer':
                var parsedNumInt = parseInt(data, 10);
                if (!isNaN(parsedNumInt)) {
                    return parsedNumInt;
                }
                return null;
            case 'boolean':
                if (typeof (data) === 'boolean') {
                    return data;
                }
                else if (typeof (data) === 'string') {
                    data = data.toLowerCase();
                    if (data === 'true') {
                        return true;
                    }
                    else if (data === 'false') {
                        return false;
                    }
                    else {
                        return null;
                    }
                }
                return null;
            case 'time':
                if (typeof (data) === 'string') {
                    data = data.trim();
                    var split = data.split(':');
                    data = new Date(Date.UTC(1970, 0, 1, split[0], split[1], split[1]));
                    return data;
                }
                return null;
            case 'date':
            case 'datetime':
            case 'datetimeoffset':
                if (typeof (data) === 'string') {
                    data = new Date(data);
                }
                if (data instanceof Date && isFinite(data)) {
                    return data;
                }
                // TODO: REPLACE WITH UNDEFINED
                return null;
            case 'string':
                return String(data);
            default:
                //TODO: REPLACE WITH UNDEFINED
                return data;
        }
    }
};
